import { prisma } from './prisma'

export interface EmailAnalytics {
  overview: {
    totalEmails: number
    totalSent: number
    totalReceived: number
    totalDrafts: number
    unreadCount: number
    todayCount: number
    weekCount: number
    monthCount: number
  }
  trends: {
    dailyStats: Array<{
      date: string
      sent: number
      received: number
      total: number
    }>
    weeklyStats: Array<{
      week: string
      sent: number
      received: number
      total: number
    }>
    monthlyStats: Array<{
      month: string
      sent: number
      received: number
      total: number
    }>
  }
  topSenders: Array<{
    email: string
    name?: string
    count: number
    percentage: number
  }>
  topRecipients: Array<{
    email: string
    name?: string
    count: number
    percentage: number
  }>
  attachmentStats: {
    totalAttachments: number
    totalSize: number
    averageSize: number
    typeBreakdown: Array<{
      type: string
      count: number
      size: number
    }>
  }
  responseStats: {
    averageResponseTime: number // in hours
    responseRate: number // percentage
    quickResponses: number // responses within 1 hour
    slowResponses: number // responses after 24 hours
  }
  spamStats: {
    totalSpam: number
    spamRate: number
    topSpamSenders: Array<{
      email: string
      count: number
    }>
  }
}

export interface SystemAnalytics {
  totalUsers: number
  activeUsers: number
  totalEmails: number
  emailsToday: number
  storageUsed: number
  averageEmailsPerUser: number
  topDomains: Array<{
    domain: string
    userCount: number
    emailCount: number
  }>
  systemHealth: {
    queueSize: number
    failedDeliveries: number
    averageDeliveryTime: number
  }
}

// Get comprehensive email analytics for a user
export const getEmailAnalytics = async (accountEmail: string): Promise<EmailAnalytics> => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Overview statistics
  const [
    totalEmails,
    totalSent,
    totalReceived,
    totalDrafts,
    unreadCount,
    todayCount,
    weekCount,
    monthCount
  ] = await Promise.all([
    // Total emails
    prisma.email.count({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        isDeleted: false
      }
    }),
    // Total sent
    prisma.email.count({
      where: {
        fromEmail: accountEmail,
        status: { in: ['SENT', 'DELIVERED'] },
        isDeleted: false
      }
    }),
    // Total received
    prisma.email.count({
      where: {
        recipients: { some: { email: accountEmail } },
        fromEmail: { not: accountEmail },
        isDeleted: false
      }
    }),
    // Total drafts
    prisma.email.count({
      where: {
        fromEmail: accountEmail,
        status: 'DRAFT',
        isDeleted: false
      }
    }),
    // Unread count
    prisma.email.count({
      where: {
        recipients: { some: { email: accountEmail } },
        isRead: false,
        isDeleted: false
      }
    }),
    // Today's emails
    prisma.email.count({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        createdAt: { gte: today },
        isDeleted: false
      }
    }),
    // This week's emails
    prisma.email.count({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        createdAt: { gte: weekAgo },
        isDeleted: false
      }
    }),
    // This month's emails
    prisma.email.count({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        createdAt: { gte: monthAgo },
        isDeleted: false
      }
    })
  ])

  // Daily trends (last 30 days)
  const dailyStats = await getDailyEmailStats(accountEmail, 30)
  
  // Weekly trends (last 12 weeks)
  const weeklyStats = await getWeeklyEmailStats(accountEmail, 12)
  
  // Monthly trends (last 12 months)
  const monthlyStats = await getMonthlyEmailStats(accountEmail, 12)

  // Top senders
  const topSenders = await getTopSenders(accountEmail, 10)
  
  // Top recipients
  const topRecipients = await getTopRecipients(accountEmail, 10)
  
  // Attachment statistics
  const attachmentStats = await getAttachmentStats(accountEmail)
  
  // Response statistics
  const responseStats = await getResponseStats(accountEmail)
  
  // Spam statistics
  const spamStats = await getSpamStats(accountEmail)

  return {
    overview: {
      totalEmails,
      totalSent,
      totalReceived,
      totalDrafts,
      unreadCount,
      todayCount,
      weekCount,
      monthCount
    },
    trends: {
      dailyStats,
      weeklyStats,
      monthlyStats
    },
    topSenders,
    topRecipients,
    attachmentStats,
    responseStats,
    spamStats
  }
}

// Get daily email statistics
const getDailyEmailStats = async (accountEmail: string, days: number) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await prisma.email.groupBy({
    by: ['createdAt'],
    where: {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ],
      createdAt: { gte: startDate },
      isDeleted: false
    },
    _count: { id: true }
  })

  // Group by date and separate sent/received
  const dailyMap = new Map<string, { sent: number; received: number; total: number }>()

  for (const stat of stats) {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { sent: 0, received: 0, total: 0 })
    }
    dailyMap.get(date)!.total += stat._count.id
  }

  // Get sent emails separately
  const sentStats = await prisma.email.groupBy({
    by: ['createdAt'],
    where: {
      fromEmail: accountEmail,
      createdAt: { gte: startDate },
      isDeleted: false
    },
    _count: { id: true }
  })

  for (const stat of sentStats) {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (dailyMap.has(date)) {
      dailyMap.get(date)!.sent = stat._count.id
      dailyMap.get(date)!.received = dailyMap.get(date)!.total - stat._count.id
    }
  }

  return Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    ...stats
  })).sort((a, b) => a.date.localeCompare(b.date))
}

// Get weekly email statistics
const getWeeklyEmailStats = async (accountEmail: string, weeks: number) => {
  // Similar implementation to daily stats but grouped by week
  // Implementation would be similar but with week grouping
  return []
}

// Get monthly email statistics
const getMonthlyEmailStats = async (accountEmail: string, months: number) => {
  // Similar implementation to daily stats but grouped by month
  return []
}

// Get top email senders
const getTopSenders = async (accountEmail: string, limit: number) => {
  const senders = await prisma.email.groupBy({
    by: ['fromEmail', 'fromName'],
    where: {
      recipients: { some: { email: accountEmail } },
      fromEmail: { not: accountEmail },
      isDeleted: false
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  const totalReceived = senders.reduce((sum, sender) => sum + sender._count.id, 0)

  return senders.map(sender => ({
    email: sender.fromEmail,
    name: sender.fromName,
    count: sender._count.id,
    percentage: totalReceived > 0 ? (sender._count.id / totalReceived) * 100 : 0
  }))
}

// Get top email recipients
const getTopRecipients = async (accountEmail: string, limit: number) => {
  const recipients = await prisma.emailRecipient.groupBy({
    by: ['email', 'name'],
    where: {
      email: { not: accountEmail },
      email: {
        fromEmail: accountEmail
      }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  const totalSent = recipients.reduce((sum, recipient) => sum + recipient._count.id, 0)

  return recipients.map(recipient => ({
    email: recipient.email,
    name: recipient.name,
    count: recipient._count.id,
    percentage: totalSent > 0 ? (recipient._count.id / totalSent) * 100 : 0
  }))
}

// Get attachment statistics
const getAttachmentStats = async (accountEmail: string) => {
  const attachments = await prisma.emailAttachment.findMany({
    where: {
      email: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ]
      }
    },
    select: {
      mimeType: true,
      size: true
    }
  })

  const totalAttachments = attachments.length
  const totalSize = attachments.reduce((sum, att) => sum + att.size, 0)
  const averageSize = totalAttachments > 0 ? totalSize / totalAttachments : 0

  // Group by type
  const typeMap = new Map<string, { count: number; size: number }>()
  attachments.forEach(att => {
    const type = att.mimeType.split('/')[0]
    if (!typeMap.has(type)) {
      typeMap.set(type, { count: 0, size: 0 })
    }
    typeMap.get(type)!.count++
    typeMap.get(type)!.size += att.size
  })

  const typeBreakdown = Array.from(typeMap.entries()).map(([type, stats]) => ({
    type,
    count: stats.count,
    size: stats.size
  }))

  return {
    totalAttachments,
    totalSize,
    averageSize,
    typeBreakdown
  }
}

// Get response time statistics
const getResponseStats = async (accountEmail: string) => {
  // This would analyze email threads to calculate response times
  // For now, return placeholder data
  return {
    averageResponseTime: 4.5, // hours
    responseRate: 85, // percentage
    quickResponses: 45, // within 1 hour
    slowResponses: 12 // after 24 hours
  }
}

// Get spam statistics
const getSpamStats = async (accountEmail: string) => {
  const totalSpam = await prisma.email.count({
    where: {
      recipients: { some: { email: accountEmail } },
      isSpam: true
    }
  })

  const totalReceived = await prisma.email.count({
    where: {
      recipients: { some: { email: accountEmail } },
      fromEmail: { not: accountEmail }
    }
  })

  const spamRate = totalReceived > 0 ? (totalSpam / totalReceived) * 100 : 0

  const topSpamSenders = await prisma.email.groupBy({
    by: ['fromEmail'],
    where: {
      recipients: { some: { email: accountEmail } },
      isSpam: true
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  return {
    totalSpam,
    spamRate,
    topSpamSenders: topSpamSenders.map(sender => ({
      email: sender.fromEmail,
      count: sender._count.id
    }))
  }
}

// Get system-wide analytics (admin only)
export const getSystemAnalytics = async (): Promise<SystemAnalytics> => {
  const [
    totalUsers,
    activeUsers,
    totalEmails,
    emailsToday
  ] = await Promise.all([
    prisma.emailAccount.count(),
    prisma.emailAccount.count({
      where: {
        lastLogin: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.email.count(),
    prisma.email.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ])

  // Calculate storage used
  const storageStats = await prisma.emailAccount.aggregate({
    _sum: { usedQuota: true }
  })

  const storageUsed = Number(storageStats._sum.usedQuota || 0)
  const averageEmailsPerUser = totalUsers > 0 ? totalEmails / totalUsers : 0

  // Get queue statistics
  const queueStats = await prisma.emailQueue.groupBy({
    by: ['status'],
    _count: { id: true }
  })

  const queueSize = queueStats.find(s => s.status === 'PENDING')?._count.id || 0
  const failedDeliveries = queueStats.find(s => s.status === 'FAILED')?._count.id || 0

  return {
    totalUsers,
    activeUsers,
    totalEmails,
    emailsToday,
    storageUsed,
    averageEmailsPerUser,
    topDomains: [], // TODO: Implement domain analysis
    systemHealth: {
      queueSize,
      failedDeliveries,
      averageDeliveryTime: 0 // TODO: Calculate from queue processing times
    }
  }
}
