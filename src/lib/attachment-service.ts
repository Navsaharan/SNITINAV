import { prisma } from './prisma'
import { 
  uploadEmailAttachment, 
  deleteEmailAttachment, 
  getEmailAttachmentUrl 
} from './supabase'

export interface AttachmentUploadResult {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  downloadUrl?: string
}

export interface AttachmentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// File type validation
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text files
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  // Audio/Video (limited)
  'audio/mpeg', 'audio/wav', 'video/mp4', 'video/avi'
]

const MAX_FILE_SIZE = 26214400 // 25MB
const MAX_TOTAL_ATTACHMENTS_SIZE = 104857600 // 100MB per email

// Validate file before upload
export const validateAttachment = (file: File, existingAttachments: Array<{ size: number }> = []): AttachmentValidationResult => {
  const result: AttachmentValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    result.isValid = false
    result.errors.push(`File "${file.name}" is too large. Maximum size is 25MB.`)
  }

  // Check total size
  const totalSize = existingAttachments.reduce((sum, att) => sum + att.size, 0) + file.size
  if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
    result.isValid = false
    result.errors.push(`Total attachments size would exceed 100MB limit.`)
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    result.isValid = false
    result.errors.push(`File type "${file.type}" is not allowed.`)
  }

  // Check for potentially dangerous files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (dangerousExtensions.includes(fileExtension)) {
    result.isValid = false
    result.errors.push(`File extension "${fileExtension}" is not allowed for security reasons.`)
  }

  // Warnings for large files
  if (file.size > 10485760) { // 10MB
    result.warnings.push(`File "${file.name}" is large (${Math.round(file.size / 1048576)}MB) and may take time to upload.`)
  }

  return result
}

// Upload attachment to email
export const uploadAttachment = async (
  emailId: string, 
  file: File, 
  accountId: string
): Promise<AttachmentUploadResult> => {
  // Verify email exists and user has access
  const email = await prisma.email.findFirst({
    where: {
      id: emailId,
      OR: [
        { fromEmail: accountId },
        { recipients: { some: { email: accountId } } }
      ]
    },
    include: {
      attachments: {
        select: { size: true }
      }
    }
  })

  if (!email) {
    throw new Error('Email not found or access denied')
  }

  // Only allow uploads to drafts
  if (email.status !== 'DRAFT') {
    throw new Error('Can only add attachments to draft emails')
  }

  // Validate file
  const validation = validateAttachment(file, email.attachments)
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '))
  }

  try {
    // Upload to Supabase Storage
    const uploadResult = await uploadEmailAttachment(emailId, file)

    // Create database record
    const attachment = await prisma.emailAttachment.create({
      data: {
        emailId,
        filename: uploadResult.path?.split('/').pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadResult.url
      }
    })

    // Update email quota
    await prisma.emailAccount.update({
      where: { email: accountId },
      data: {
        usedQuota: { increment: file.size }
      }
    })

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url
    }

  } catch (error) {
    console.error('Attachment upload error:', error)
    throw new Error(`Failed to upload attachment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get attachment with download URL
export const getAttachment = async (
  attachmentId: string, 
  accountId: string
): Promise<AttachmentUploadResult> => {
  const attachment = await prisma.emailAttachment.findFirst({
    where: {
      id: attachmentId,
      email: {
        OR: [
          { fromEmail: accountId },
          { recipients: { some: { email: accountId } } }
        ]
      }
    }
  })

  if (!attachment) {
    throw new Error('Attachment not found or access denied')
  }

  // Extract path from URL for signed URL generation
  const urlParts = attachment.url.split('/')
  const path = urlParts.slice(-3).join('/') // emails/emailId/filename

  try {
    const downloadUrl = await getEmailAttachmentUrl(path, 7200) // 2 hours

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url,
      downloadUrl
    }
  } catch (error) {
    console.error('Failed to generate download URL:', error)
    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url
    }
  }
}

// Delete attachment
export const deleteAttachment = async (
  attachmentId: string, 
  accountId: string
): Promise<void> => {
  const attachment = await prisma.emailAttachment.findFirst({
    where: {
      id: attachmentId,
      email: {
        fromEmail: accountId,
        status: 'DRAFT' // Only allow deletion from drafts
      }
    }
  })

  if (!attachment) {
    throw new Error('Attachment not found, access denied, or email is not a draft')
  }

  try {
    // Extract path from URL
    const urlParts = attachment.url.split('/')
    const path = urlParts.slice(-3).join('/')

    // Delete from storage
    await deleteEmailAttachment(path)

    // Delete from database
    await prisma.emailAttachment.delete({
      where: { id: attachmentId }
    })

    // Update quota
    await prisma.emailAccount.update({
      where: { email: accountId },
      data: {
        usedQuota: { decrement: attachment.size }
      }
    })

  } catch (error) {
    console.error('Attachment deletion error:', error)
    throw new Error(`Failed to delete attachment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get all attachments for an email
export const getEmailAttachments = async (
  emailId: string, 
  accountId: string
): Promise<AttachmentUploadResult[]> => {
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

  const attachmentsWithUrls = await Promise.all(
    email.attachments.map(async (attachment) => {
      try {
        const urlParts = attachment.url.split('/')
        const path = urlParts.slice(-3).join('/')
        const downloadUrl = await getEmailAttachmentUrl(path, 3600) // 1 hour

        return {
          id: attachment.id,
          filename: attachment.filename,
          originalName: attachment.originalName,
          mimeType: attachment.mimeType,
          size: attachment.size,
          url: attachment.url,
          downloadUrl
        }
      } catch (error) {
        console.error('Failed to generate download URL for attachment:', error)
        return {
          id: attachment.id,
          filename: attachment.filename,
          originalName: attachment.originalName,
          mimeType: attachment.mimeType,
          size: attachment.size,
          url: attachment.url
        }
      }
    })
  )

  return attachmentsWithUrls
}

// Cleanup orphaned attachments (for maintenance)
export const cleanupOrphanedAttachments = async (): Promise<number> => {
  const orphanedAttachments = await prisma.emailAttachment.findMany({
    where: {
      email: null
    }
  })

  let deletedCount = 0

  for (const attachment of orphanedAttachments) {
    try {
      const urlParts = attachment.url.split('/')
      const path = urlParts.slice(-3).join('/')
      
      await deleteEmailAttachment(path)
      await prisma.emailAttachment.delete({
        where: { id: attachment.id }
      })
      
      deletedCount++
    } catch (error) {
      console.error(`Failed to cleanup attachment ${attachment.id}:`, error)
    }
  }

  return deletedCount
}
