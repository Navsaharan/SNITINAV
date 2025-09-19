import { prisma } from './prisma'
import { 
  generateMessageId, 
  generateThreadId, 
  parseEmailRecipients,
  sanitizeEmailContent,
  convertHtmlToText,
  calculateEmailSize,
  checkQuotaAvailable,
  updateAccountQuota,
  addToDeliveryQueue,
  calculateSpamScore,
  isSpam
} from './email-utils'
import { uploadEmailAttachment } from './supabase'

export interface EmailData {
  from: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  replyTo?: string
  inReplyTo?: string
  references?: string
  attachments?: File[]
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isDraft?: boolean
}

export interface EmailListOptions {
  accountId: string
  folder?: string
  page?: number
  limit?: number
  search?: string
  filters?: {
    from?: string
    to?: string
    subject?: string
    hasAttachment?: boolean
    dateFrom?: Date
    dateTo?: Date
    isRead?: boolean
    isStarred?: boolean
  }
}

// Create and send email
export const createEmail = async (emailData: EmailData): Promise<string> => {
  const {
    from,
    to,
    cc,
    bcc,
    subject,
    body,
    replyTo,
    inReplyTo,
    references,
    attachments = [],
    priority = 'NORMAL',
    isDraft = false
  } = emailData

  // Validate sender account
  const senderAccount = await prisma.emailAccount.findUnique({
    where: { email: from, isActive: true }
  })

  if (!senderAccount) {
    throw new Error('Sender account not found or inactive')
  }

  // Parse recipients
  const toRecipients = parseEmailRecipients(to)
  const ccRecipients = cc ? parseEmailRecipients(cc) : []
  const bccRecipients = bcc ? parseEmailRecipients(bcc) : []
  const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients]

  // Generate email identifiers
  const messageId = generateMessageId()
  let threadId = generateThreadId()

  // Handle threading
  if (inReplyTo) {
    const parentEmail = await prisma.email.findFirst({
      where: { messageId: inReplyTo },
      select: { threadId: true }
    })
    if (parentEmail?.threadId) {
      threadId = parentEmail.threadId
    }
  }

  // Sanitize content
  const sanitizedBody = sanitizeEmailContent(body)
  const bodyText = convertHtmlToText(sanitizedBody)

  // Calculate spam score
  const spamScore = calculateSpamScore({
    subject,
    body: sanitizedBody,
    fromEmail: from
  })

  // Calculate email size for quota check
  const emailSize = calculateEmailSize({
    subject,
    body: sanitizedBody,
    bodyText,
    attachments: attachments.map(file => ({ size: file.size }))
  })

  // Check quota
  if (!await checkQuotaAvailable(senderAccount.id, emailSize)) {
    throw new Error('Insufficient quota to send email')
  }

  // Create email record and recipients in a transaction to prevent foreign key constraint errors
  const email = await prisma.$transaction(async (tx) => {
    // Create the email record first
    const newEmail = await tx.email.create({
      data: {
        messageId,
        subject,
        body: sanitizedBody,
        bodyText,
        fromEmail: from,
        fromName: senderAccount.displayName || `${senderAccount.firstName} ${senderAccount.lastName}`,
        replyTo,
        status: isDraft ? 'DRAFT' : 'QUEUED',
        priority,
        threadId,
        inReplyTo,
        references,
        spamScore,
        isSpam: isSpam(spamScore),
        sentAt: isDraft ? null : new Date()
      }
    })

    // Create recipient records with the confirmed email ID
    const recipientData = [
      ...toRecipients.map(r => ({ ...r, type: 'TO' as const })),
      ...ccRecipients.map(r => ({ ...r, type: 'CC' as const })),
      ...bccRecipients.map(r => ({ ...r, type: 'BCC' as const }))
    ]

    if (recipientData.length > 0) {
      await tx.emailRecipient.createMany({
        data: recipientData.map(recipient => ({
          emailId: newEmail.id,
          email: recipient.email,
          name: recipient.name,
          type: recipient.type
        }))
      })
    }

    return newEmail
  })

  // Handle attachments
  if (attachments.length > 0) {
    for (const file of attachments) {
      try {
        const uploadResult = await uploadEmailAttachment(email.id, file)

        // Create attachment record in a separate transaction for better error handling
        await prisma.$transaction(async (tx) => {
          await tx.emailAttachment.create({
            data: {
              emailId: email.id,
              filename: uploadResult.path?.split('/').pop() || file.name,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: uploadResult.url
            }
          })
        })
      } catch (error) {
        console.error('Failed to upload attachment:', error)
        // Continue with other attachments - don't fail the entire email
      }
    }
  }

  // Update sender quota
  await updateAccountQuota(senderAccount.id, emailSize)

  // Add to delivery queue if not draft
  if (!isDraft) {
    const recipientEmails = allRecipients.map(r => r.email)
    await addToDeliveryQueue(email.id, recipientEmails)
  }

  return email.id
}

// Get email list with pagination and filtering
export const getEmailList = async (options: EmailListOptions) => {
  const {
    accountId,
    folder = 'Inbox',
    page = 1,
    limit = 50,
    search,
    filters = {}
  } = options

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {
    isDeleted: false,
    OR: [
      { fromEmail: { equals: accountId } },
      { recipients: { some: { email: accountId } } }
    ]
  }

  // Apply folder filter
  if (folder && folder !== 'All') {
    switch (folder.toLowerCase()) {
      case 'inbox':
        where.AND = [
          { recipients: { some: { email: accountId, type: 'TO' } } },
          { fromEmail: { not: accountId } }
        ]
        break
      case 'sent':
        where.fromEmail = accountId
        break
      case 'drafts':
        where.status = 'DRAFT'
        where.fromEmail = accountId
        break
      case 'trash':
        where.isDeleted = true
        break
      case 'spam':
        where.isSpam = true
        break
    }
  }

  // Apply search
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
      { fromName: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Apply additional filters
  if (filters.from) {
    where.fromEmail = { contains: filters.from, mode: 'insensitive' }
  }
  if (filters.subject) {
    where.subject = { contains: filters.subject, mode: 'insensitive' }
  }
  if (filters.hasAttachment !== undefined) {
    if (filters.hasAttachment) {
      where.attachments = { some: {} }
    } else {
      where.attachments = { none: {} }
    }
  }
  if (filters.isRead !== undefined) {
    where.isRead = filters.isRead
  }
  if (filters.isStarred !== undefined) {
    where.isStarred = filters.isStarred
  }

  // Get emails with related data
  const [emails, total] = await Promise.all([
    prisma.email.findMany({
      where,
      include: {
        recipients: true,
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true
          }
        },
        _count: {
          select: {
            attachments: true
          }
        }
      },
      orderBy: [
        { isStarred: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.email.count({ where })
  ])

  return {
    emails,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

// Get single email with full details
export const getEmailById = async (emailId: string, accountId: string) => {
  const email = await prisma.email.findFirst({
    where: {
      id: emailId,
      OR: [
        { fromEmail: accountId },
        { recipients: { some: { email: accountId } } }
      ]
    },
    include: {
      recipients: true,
      attachments: true,
      labels: {
        include: {
          folder: true
        }
      }
    }
  })

  if (!email) {
    throw new Error('Email not found or access denied')
  }

  // Mark as read if recipient
  if (email.fromEmail !== accountId && !email.isRead) {
    await prisma.email.update({
      where: { id: emailId },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    })
  }

  return email
}

// Update email (mark as read, starred, etc.)
export const updateEmail = async (
  emailId: string, 
  accountId: string, 
  updates: {
    isRead?: boolean
    isStarred?: boolean
    isDeleted?: boolean
  }
) => {
  // Verify access
  const email = await prisma.email.findFirst({
    where: {
      id: emailId,
      OR: [
        { fromEmail: accountId },
        { recipients: { some: { email: accountId } } }
      ]
    }
  })

  if (!email) {
    throw new Error('Email not found or access denied')
  }

  const updateData: any = { ...updates }
  
  if (updates.isRead === true && !email.readAt) {
    updateData.readAt = new Date()
  }

  return await prisma.email.update({
    where: { id: emailId },
    data: updateData
  })
}

// Delete email (move to trash or permanent delete)
export const deleteEmail = async (emailId: string, accountId: string, permanent = false) => {
  const email = await prisma.email.findFirst({
    where: {
      id: emailId,
      OR: [
        { fromEmail: accountId },
        { recipients: { some: { email: accountId } } }
      ]
    },
    include: {
      attachments: true
    }
  })

  if (!email) {
    throw new Error('Email not found or access denied')
  }

  if (permanent) {
    // Calculate size to update quota
    const emailSize = calculateEmailSize(email)
    
    // Delete attachments from storage
    // TODO: Implement attachment deletion from Supabase Storage
    
    // Delete email record
    await prisma.email.delete({
      where: { id: emailId }
    })

    // Update quota if sender
    if (email.fromEmail === accountId) {
      await updateAccountQuota(accountId, -emailSize)
    }
  } else {
    // Move to trash
    await prisma.email.update({
      where: { id: emailId },
      data: { isDeleted: true }
    })
  }

  return true
}

// Get email thread/conversation
export const getEmailThread = async (threadId: string, accountId: string) => {
  const emails = await prisma.email.findMany({
    where: {
      threadId,
      OR: [
        { fromEmail: accountId },
        { recipients: { some: { email: accountId } } }
      ]
    },
    include: {
      recipients: true,
      attachments: {
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return emails
}
