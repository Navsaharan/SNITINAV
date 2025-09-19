import { prisma } from './prisma'
import { supabaseAdmin, uploadEmailAttachment } from './supabase'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Email message ID generation (RFC 5322 compliant)
export const generateMessageId = (domain: string = 'institute.edu'): string => {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  return `<${timestamp}.${random}@${domain}>`
}

// Email threading utilities
export const generateThreadId = (): string => {
  return uuidv4()
}

export const extractEmailAddresses = (emailString: string): string[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  return emailString.match(emailRegex) || []
}

export const parseEmailRecipients = (recipients: string): Array<{email: string, name?: string}> => {
  const parsed: Array<{email: string, name?: string}> = []
  
  // Split by comma and parse each recipient
  const recipientList = recipients.split(',').map(r => r.trim())
  
  for (const recipient of recipientList) {
    // Handle formats: "Name <email@domain.com>" or "email@domain.com"
    const nameEmailMatch = recipient.match(/^(.+?)\s*<(.+?)>$/)
    if (nameEmailMatch) {
      parsed.push({
        name: nameEmailMatch[1].trim().replace(/['"]/g, ''),
        email: nameEmailMatch[2].trim()
      })
    } else {
      const emailMatch = recipient.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        parsed.push({ email: emailMatch[0] })
      }
    }
  }
  
  return parsed
}

// Email validation
export const validateEmailAddress = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export const isInternalEmail = (email: string): boolean => {
  const domain = process.env.EMAIL_DOMAIN || 'institute.edu'
  return email.endsWith(`@${domain}`)
}

// Email content processing
export const sanitizeEmailContent = (content: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export const convertHtmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

// Email folder management
export const getDefaultFolders = () => [
  { name: 'Inbox', type: 'INBOX' as const, color: '#3B82F6' },
  { name: 'Sent', type: 'SENT' as const, color: '#10B981' },
  { name: 'Drafts', type: 'DRAFTS' as const, color: '#F59E0B' },
  { name: 'Trash', type: 'TRASH' as const, color: '#EF4444' },
  { name: 'Spam', type: 'SPAM' as const, color: '#8B5CF6' },
  { name: 'Archive', type: 'ARCHIVE' as const, color: '#6B7280' }
]

export const createDefaultFolders = async (accountId: string) => {
  const defaultFolders = getDefaultFolders()
  
  for (const folder of defaultFolders) {
    await prisma.emailFolder.upsert({
      where: {
        accountId_name: {
          accountId,
          name: folder.name
        }
      },
      update: {},
      create: {
        accountId,
        name: folder.name,
        type: folder.type,
        color: folder.color,
        order: defaultFolders.indexOf(folder)
      }
    })
  }
}

// Email search utilities
export const buildEmailSearchQuery = (searchTerm: string, filters: {
  folder?: string
  from?: string
  to?: string
  subject?: string
  hasAttachment?: boolean
  dateFrom?: Date
  dateTo?: Date
  isRead?: boolean
  isStarred?: boolean
}) => {
  const where: any = {
    isDeleted: false
  }

  if (searchTerm) {
    where.OR = [
      { subject: { contains: searchTerm, mode: 'insensitive' } },
      { body: { contains: searchTerm, mode: 'insensitive' } },
      { bodyText: { contains: searchTerm, mode: 'insensitive' } },
      { fromName: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }

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

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
    if (filters.dateTo) where.createdAt.lte = filters.dateTo
  }

  if (filters.isRead !== undefined) {
    where.isRead = filters.isRead
  }

  if (filters.isStarred !== undefined) {
    where.isStarred = filters.isStarred
  }

  return where
}

// Email quota management
export const calculateEmailSize = (email: {
  subject: string
  body: string
  bodyText?: string | null
  attachments?: Array<{ size: number }>
}): number => {
  const textSize = Buffer.byteLength(email.subject + (email.body || '') + (email.bodyText || ''), 'utf8')
  const attachmentSize = email.attachments?.reduce((total, att) => total + att.size, 0) || 0
  return textSize + attachmentSize
}

export const checkQuotaAvailable = async (accountId: string, emailSize: number): Promise<boolean> => {
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
    select: { quota: true, usedQuota: true }
  })

  if (!account) return false

  const availableQuota = Number(account.quota) - Number(account.usedQuota)
  return emailSize <= availableQuota
}

export const updateAccountQuota = async (accountId: string, sizeChange: number) => {
  await prisma.emailAccount.update({
    where: { id: accountId },
    data: {
      usedQuota: {
        increment: sizeChange
      }
    }
  })
}

// Email delivery utilities
export const addToDeliveryQueue = async (emailId: string, recipients: string[]) => {
  const queueItems = recipients.map(recipient => ({
    emailId,
    recipientEmail: recipient,
    status: 'PENDING' as const,
    scheduledAt: new Date()
  }))

  await prisma.emailQueue.createMany({
    data: queueItems
  })
}

// Spam detection (basic implementation)
export const calculateSpamScore = (email: {
  subject: string
  body: string
  fromEmail: string
}): number => {
  let score = 0

  // Check for spam keywords
  const spamKeywords = [
    'urgent', 'winner', 'congratulations', 'free money', 'click here',
    'limited time', 'act now', 'guaranteed', 'no obligation'
  ]

  const content = (email.subject + ' ' + email.body).toLowerCase()
  spamKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 1
  })

  // Check for excessive capitalization
  const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length
  if (capsRatio > 0.5) score += 2

  // Check for suspicious patterns
  if (email.body.includes('$$$') || email.body.includes('!!!')) score += 1
  if (email.subject.includes('RE:') && !email.subject.startsWith('RE:')) score += 1

  return score
}

export const isSpam = (spamScore: number): boolean => {
  const threshold = parseFloat(process.env.SPAM_THRESHOLD || '5.0')
  return spamScore >= threshold
}
