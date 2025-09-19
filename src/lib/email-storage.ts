import { prisma } from './prisma'

export interface EmailStorageStats {
  totalEmails: number
  totalSize: number
  averageSize: number
  emailsByStatus: Record<string, number>
  emailsByFolder: Record<string, number>
  attachmentStats: {
    totalAttachments: number
    totalAttachmentSize: number
    averageAttachmentSize: number
  }
}

export interface EmailArchiveOptions {
  olderThanDays: number
  excludeStarred?: boolean
  excludeUnread?: boolean
  dryRun?: boolean
}

export interface EmailCleanupResult {
  emailsProcessed: number
  emailsArchived: number
  emailsDeleted: number
  spaceFreed: number
  errors: string[]
}

// Get email storage statistics for an account
export const getEmailStorageStats = async (accountEmail: string): Promise<EmailStorageStats> => {
  const account = await prisma.emailAccount.findUnique({
    where: { email: accountEmail }
  })

  if (!account) {
    throw new Error('Account not found')
  }

  // Get total emails and basic stats
  const emailStats = await prisma.email.aggregate({
    where: {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ]
    },
    _count: { id: true },
    _avg: { spamScore: true }
  })

  // Get emails by status
  const emailsByStatus = await prisma.email.groupBy({
    by: ['status'],
    where: {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ]
    },
    _count: { id: true }
  })

  // Get attachment stats
  const attachmentStats = await prisma.emailAttachment.aggregate({
    where: {
      email: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ]
      }
    },
    _count: { id: true },
    _sum: { size: true },
    _avg: { size: true }
  })

  // Calculate total size (approximate)
  const emails = await prisma.email.findMany({
    where: {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ]
    },
    select: {
      subject: true,
      body: true,
      bodyText: true
    }
  })

  const totalTextSize = emails.reduce((sum, email) => {
    const textSize = Buffer.byteLength(
      email.subject + (email.body || '') + (email.bodyText || ''), 
      'utf8'
    )
    return sum + textSize
  }, 0)

  const totalSize = totalTextSize + (attachmentStats._sum.size || 0)

  return {
    totalEmails: emailStats._count.id || 0,
    totalSize,
    averageSize: emailStats._count.id ? totalSize / emailStats._count.id : 0,
    emailsByStatus: emailsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>),
    emailsByFolder: {}, // TODO: Implement folder-based counting
    attachmentStats: {
      totalAttachments: attachmentStats._count.id || 0,
      totalAttachmentSize: attachmentStats._sum.size || 0,
      averageAttachmentSize: attachmentStats._avg.size || 0
    }
  }
}

// Archive old emails to free up space
export const archiveOldEmails = async (
  accountEmail: string, 
  options: EmailArchiveOptions
): Promise<EmailCleanupResult> => {
  const result: EmailCleanupResult = {
    emailsProcessed: 0,
    emailsArchived: 0,
    emailsDeleted: 0,
    spaceFreed: 0,
    errors: []
  }

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - options.olderThanDays)

    // Build where clause
    const where: any = {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ],
      createdAt: { lt: cutoffDate },
      isDeleted: false
    }

    if (options.excludeStarred) {
      where.isStarred = false
    }

    if (options.excludeUnread) {
      where.isRead = true
    }

    // Get emails to archive
    const emailsToArchive = await prisma.email.findMany({
      where,
      include: {
        attachments: {
          select: { size: true }
        }
      }
    })

    result.emailsProcessed = emailsToArchive.length

    if (options.dryRun) {
      // Calculate what would be archived without actually doing it
      result.emailsArchived = emailsToArchive.length
      result.spaceFreed = emailsToArchive.reduce((sum, email) => {
        const textSize = Buffer.byteLength(
          email.subject + (email.body || '') + (email.bodyText || ''), 
          'utf8'
        )
        const attachmentSize = email.attachments.reduce((attSum, att) => attSum + att.size, 0)
        return sum + textSize + attachmentSize
      }, 0)
    } else {
      // Actually archive emails
      for (const email of emailsToArchive) {
        try {
          // Add archive label or move to archive folder
          await prisma.emailLabel.create({
            data: {
              emailId: email.id,
              name: 'Archived',
              color: '#6B7280'
            }
          })

          // Calculate space freed
          const textSize = Buffer.byteLength(
            email.subject + (email.body || '') + (email.bodyText || ''), 
            'utf8'
          )
          const attachmentSize = email.attachments.reduce((sum, att) => sum + att.size, 0)
          result.spaceFreed += textSize + attachmentSize
          result.emailsArchived++

        } catch (error) {
          result.errors.push(`Failed to archive email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

  } catch (error) {
    result.errors.push(`Archive operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

// Delete old emails permanently
export const deleteOldEmails = async (
  accountEmail: string,
  options: EmailArchiveOptions
): Promise<EmailCleanupResult> => {
  const result: EmailCleanupResult = {
    emailsProcessed: 0,
    emailsArchived: 0,
    emailsDeleted: 0,
    spaceFreed: 0,
    errors: []
  }

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - options.olderThanDays)

    // Only delete emails that are already marked as deleted (in trash)
    const where: any = {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ],
      createdAt: { lt: cutoffDate },
      isDeleted: true
    }

    if (options.excludeStarred) {
      where.isStarred = false
    }

    // Get emails to delete
    const emailsToDelete = await prisma.email.findMany({
      where,
      include: {
        attachments: {
          select: { size: true, url: true }
        }
      }
    })

    result.emailsProcessed = emailsToDelete.length

    if (options.dryRun) {
      result.emailsDeleted = emailsToDelete.length
      result.spaceFreed = emailsToDelete.reduce((sum, email) => {
        const textSize = Buffer.byteLength(
          email.subject + (email.body || '') + (email.bodyText || ''), 
          'utf8'
        )
        const attachmentSize = email.attachments.reduce((attSum, att) => attSum + att.size, 0)
        return sum + textSize + attachmentSize
      }, 0)
    } else {
      // Actually delete emails
      for (const email of emailsToDelete) {
        try {
          // Calculate space freed before deletion
          const textSize = Buffer.byteLength(
            email.subject + (email.body || '') + (email.bodyText || ''), 
            'utf8'
          )
          const attachmentSize = email.attachments.reduce((sum, att) => sum + att.size, 0)

          // Delete email (cascade will handle attachments, recipients, etc.)
          await prisma.email.delete({
            where: { id: email.id }
          })

          // TODO: Delete attachment files from storage
          // This would require implementing storage cleanup

          result.spaceFreed += textSize + attachmentSize
          result.emailsDeleted++

        } catch (error) {
          result.errors.push(`Failed to delete email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Update account quota
      if (result.spaceFreed > 0) {
        await prisma.emailAccount.update({
          where: { email: accountEmail },
          data: {
            usedQuota: {
              decrement: result.spaceFreed
            }
          }
        })
      }
    }

  } catch (error) {
    result.errors.push(`Delete operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

// Optimize email search performance
export const optimizeEmailSearch = async (searchTerm: string, accountEmail: string) => {
  // This function would implement search optimizations like:
  // - Full-text search indexing
  // - Search result caching
  // - Query optimization
  
  // For now, return the basic search query structure
  const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 2)
  
  return {
    optimizedQuery: {
      OR: [
        ...searchWords.map(word => ({
          subject: { contains: word, mode: 'insensitive' as const }
        })),
        ...searchWords.map(word => ({
          body: { contains: word, mode: 'insensitive' as const }
        })),
        ...searchWords.map(word => ({
          fromName: { contains: word, mode: 'insensitive' as const }
        }))
      ]
    },
    searchMetadata: {
      searchTerms: searchWords,
      termCount: searchWords.length,
      estimatedResults: 0 // Would be calculated based on index statistics
    }
  }
}

// Get email storage recommendations
export const getStorageRecommendations = async (accountEmail: string) => {
  const stats = await getEmailStorageStats(accountEmail)
  const account = await prisma.emailAccount.findUnique({
    where: { email: accountEmail },
    select: { quota: true, usedQuota: true }
  })

  if (!account) {
    throw new Error('Account not found')
  }

  const usagePercentage = (Number(account.usedQuota) / Number(account.quota)) * 100
  const recommendations: string[] = []

  if (usagePercentage > 90) {
    recommendations.push('Your mailbox is nearly full. Consider deleting old emails or increasing your quota.')
  }

  if (usagePercentage > 75) {
    recommendations.push('Consider archiving emails older than 1 year to free up space.')
  }

  if (stats.attachmentStats.totalAttachmentSize > Number(account.quota) * 0.5) {
    recommendations.push('Attachments are using more than 50% of your quota. Consider removing large attachments from old emails.')
  }

  if (stats.emailsByStatus.DRAFT > 50) {
    recommendations.push('You have many draft emails. Consider cleaning up old drafts.')
  }

  return {
    usagePercentage,
    recommendations,
    stats
  }
}
