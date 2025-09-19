import { prisma } from './prisma'
import { isInternalEmail } from './email-utils'

export interface QueueProcessingResult {
  processed: number
  successful: number
  failed: number
  errors: string[]
}

// Process email delivery queue
export const processEmailQueue = async (batchSize: number = 10): Promise<QueueProcessingResult> => {
  const result: QueueProcessingResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  }

  try {
    // Get pending queue items
    const queueItems = await prisma.emailQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
        attempts: { lt: 3 } // Max 3 attempts
      },
      include: {
        email: {
          include: {
            sender: true,
            attachments: true
          }
        }
      },
      take: batchSize,
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    for (const queueItem of queueItems) {
      result.processed++

      try {
        // Update queue item status to processing
        await prisma.emailQueue.update({
          where: { id: queueItem.id },
          data: {
            status: 'PROCESSING',
            attempts: { increment: 1 }
          }
        })

        // Process the email delivery
        const deliveryResult = await deliverEmail(queueItem)

        if (deliveryResult.success) {
          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: queueItem.id },
            data: { status: 'SENT' }
          })

          // Update email status
          await prisma.email.update({
            where: { id: queueItem.emailId },
            data: {
              status: 'DELIVERED',
              deliveredAt: new Date()
            }
          })

          // Update recipient status
          await prisma.emailRecipient.updateMany({
            where: {
              emailId: queueItem.emailId,
              email: queueItem.recipientEmail
            },
            data: {
              status: 'DELIVERED',
              deliveredAt: new Date()
            }
          })

          result.successful++
        } else {
          throw new Error(deliveryResult.error || 'Delivery failed')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`${queueItem.recipientEmail}: ${errorMessage}`)

        // Check if we should retry
        if (queueItem.attempts >= 2) {
          // Max attempts reached, mark as failed
          await prisma.emailQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'FAILED',
              lastError: errorMessage
            }
          })

          await prisma.emailRecipient.updateMany({
            where: {
              emailId: queueItem.emailId,
              email: queueItem.recipientEmail
            },
            data: {
              status: 'FAILED'
            }
          })

          result.failed++
        } else {
          // Schedule retry
          const nextRetry = new Date()
          nextRetry.setMinutes(nextRetry.getMinutes() + (queueItem.attempts * 15)) // Exponential backoff

          await prisma.emailQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'PENDING',
              nextRetry,
              lastError: errorMessage
            }
          })
        }
      }
    }

  } catch (error) {
    console.error('Queue processing error:', error)
    result.errors.push(`Queue processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

// Deliver individual email
const deliverEmail = async (queueItem: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const { email, recipientEmail } = queueItem

    if (isInternalEmail(recipientEmail)) {
      // Internal delivery - store in recipient's inbox
      return await deliverInternalEmail(email, recipientEmail)
    } else {
      // External delivery - use SMTP or email service
      return await deliverExternalEmail(email, recipientEmail)
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delivery failed'
    }
  }
}

// Deliver email to internal recipient
const deliverInternalEmail = async (email: any, recipientEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if recipient account exists and is active
    const recipientAccount = await prisma.emailAccount.findUnique({
      where: { email: recipientEmail, isActive: true }
    })

    if (!recipientAccount) {
      return {
        success: false,
        error: 'Recipient account not found or inactive'
      }
    }

    // Email is already stored in the database with recipient records
    // For internal delivery, we just need to ensure the recipient can access it
    // The email list API will show emails based on recipient records

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal delivery failed'
    }
  }
}

// Deliver email to external recipient
const deliverExternalEmail = async (email: any, recipientEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use the new email service manager for external delivery
    const { getEmailServiceManager } = await import('./email-service-manager')
    const emailService = getEmailServiceManager()

    const emailData = {
      to: recipientEmail,
      subject: email.subject,
      html: email.body,
      text: email.bodyText || undefined,
      // Add other email properties as needed
    }

    const result = await emailService.sendEmail(emailData)

    if (result.success) {
      console.log(`External email delivered to ${recipientEmail} via ${result.provider}`)
      return { success: true }
    } else {
      return {
        success: false,
        error: result.error || 'External delivery failed'
      }
    }

  } catch (error) {
    console.error(`External delivery failed for ${recipientEmail}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'External delivery failed'
    }
  }
}

// Clean up old queue items
export const cleanupEmailQueue = async (olderThanDays: number = 7): Promise<number> => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const result = await prisma.emailQueue.deleteMany({
    where: {
      status: { in: ['SENT', 'FAILED', 'CANCELLED'] },
      createdAt: { lt: cutoffDate }
    }
  })

  return result.count
}

// Get queue statistics
export const getQueueStats = async () => {
  const stats = await prisma.emailQueue.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  })

  const result: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 0,
    SENT: 0,
    FAILED: 0,
    CANCELLED: 0
  }

  stats.forEach(stat => {
    result[stat.status] = stat._count.id
  })

  return result
}

// Retry failed queue items
export const retryFailedEmails = async (emailIds?: string[]): Promise<number> => {
  const where: any = {
    status: 'FAILED',
    attempts: { lt: 3 }
  }

  if (emailIds && emailIds.length > 0) {
    where.emailId = { in: emailIds }
  }

  const result = await prisma.emailQueue.updateMany({
    where,
    data: {
      status: 'PENDING',
      nextRetry: new Date(),
      lastError: null
    }
  })

  return result.count
}

// Cancel pending emails
export const cancelPendingEmails = async (emailIds: string[]): Promise<number> => {
  const result = await prisma.emailQueue.updateMany({
    where: {
      emailId: { in: emailIds },
      status: { in: ['PENDING', 'PROCESSING'] }
    },
    data: {
      status: 'CANCELLED'
    }
  })

  return result.count
}
