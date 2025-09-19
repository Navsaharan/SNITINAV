import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/email/monitoring - Email monitoring and content search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const fromEmail = url.searchParams.get('fromEmail') || ''
    const toEmail = url.searchParams.get('toEmail') || ''
    const status = url.searchParams.get('status') || ''
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const hasAttachments = url.searchParams.get('hasAttachments')
    const isSpam = url.searchParams.get('isSpam')
    const threadId = url.searchParams.get('threadId')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { bodyText: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (fromEmail) {
      where.fromEmail = { contains: fromEmail, mode: 'insensitive' }
    }

    if (toEmail) {
      where.recipients = {
        some: {
          email: { contains: toEmail, mode: 'insensitive' }
        }
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    if (hasAttachments === 'true') {
      where.attachments = { some: {} }
    } else if (hasAttachments === 'false') {
      where.attachments = { none: {} }
    }
    // Skip filtering if hasAttachments === 'all'

    if (isSpam === 'true') {
      where.isSpam = true
    } else if (isSpam === 'false') {
      where.isSpam = false
    }
    // Skip filtering if isSpam === 'all'

    if (threadId) {
      where.threadId = threadId
    }

    // Get emails with full details
    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipients: true,
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true
            }
          },
          labels: true,
          sender: {
            select: {
              id: true,
              email: true,
              displayName: true,
              type: true
            }
          }
        }
      }),
      prisma.email.count({ where })
    ])

    // Get thread information for emails that are part of threads
    const emailsWithThreads = await Promise.all(
      emails.map(async (email) => {
        let threadInfo = null
        
        if (email.threadId) {
          const threadEmails = await prisma.email.findMany({
            where: { threadId: email.threadId },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              subject: true,
              fromEmail: true,
              createdAt: true,
              status: true
            }
          })
          
          threadInfo = {
            threadId: email.threadId,
            emailCount: threadEmails.length,
            emails: threadEmails
          }
        }

        return {
          ...email,
          threadInfo
        }
      })
    )

    return NextResponse.json({
      emails: emailsWithThreads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching emails for monitoring:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

// POST /api/admin/email/monitoring - Advanced email search and analytics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, filters, analytics } = body

    switch (action) {
      case 'search':
        return await performAdvancedSearch(filters)
      
      case 'analytics':
        return await getEmailAnalytics(analytics)
      
      case 'export':
        return await exportEmailData(filters)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in email monitoring action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

async function performAdvancedSearch(filters: any) {
  const {
    keywords,
    senders,
    recipients,
    dateRange,
    attachmentTypes,
    spamScore,
    priority,
    status
  } = filters

  const where: any = {}

  // Keyword search across multiple fields
  if (keywords && keywords.length > 0) {
    where.OR = keywords.map((keyword: string) => ({
      OR: [
        { subject: { contains: keyword, mode: 'insensitive' } },
        { body: { contains: keyword, mode: 'insensitive' } },
        { bodyText: { contains: keyword, mode: 'insensitive' } }
      ]
    }))
  }

  // Sender filters
  if (senders && senders.length > 0) {
    where.fromEmail = { in: senders }
  }

  // Recipient filters
  if (recipients && recipients.length > 0) {
    where.recipients = {
      some: {
        email: { in: recipients }
      }
    }
  }

  // Date range
  if (dateRange) {
    where.createdAt = {}
    if (dateRange.start) {
      where.createdAt.gte = new Date(dateRange.start)
    }
    if (dateRange.end) {
      where.createdAt.lte = new Date(dateRange.end)
    }
  }

  // Attachment type filters
  if (attachmentTypes && attachmentTypes.length > 0) {
    where.attachments = {
      some: {
        mimeType: { in: attachmentTypes }
      }
    }
  }

  // Spam score filter
  if (spamScore) {
    where.spamScore = {
      gte: spamScore.min || 0,
      lte: spamScore.max || 100
    }
  }

  // Priority filter
  if (priority && priority.length > 0) {
    where.priority = { in: priority }
  }

  // Status filter
  if (status && status.length > 0) {
    where.status = { in: status }
  }

  const results = await prisma.email.findMany({
    where,
    include: {
      recipients: true,
      attachments: true,
      sender: {
        select: {
          email: true,
          displayName: true,
          type: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 1000 // Limit for performance
  })

  return NextResponse.json({
    results,
    count: results.length,
    filters: filters
  })
}

async function getEmailAnalytics(analytics: any) {
  const { timeRange, groupBy, metrics } = analytics

  const dateFilter: any = {}
  if (timeRange) {
    if (timeRange.start) {
      dateFilter.gte = new Date(timeRange.start)
    }
    if (timeRange.end) {
      dateFilter.lte = new Date(timeRange.end)
    }
  }

  const results: any = {}

  // Email volume analytics
  if (metrics.includes('volume')) {
    results.volume = await prisma.email.groupBy({
      by: ['status'],
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      _count: true
    })
  }

  // Spam analytics
  if (metrics.includes('spam')) {
    results.spam = await prisma.email.aggregate({
      where: {
        ...(dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}),
        isSpam: true
      },
      _count: true,
      _avg: { spamScore: true }
    })
  }

  // Top senders
  if (metrics.includes('topSenders')) {
    results.topSenders = await prisma.email.groupBy({
      by: ['fromEmail'],
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      _count: true,
      orderBy: { _count: { fromEmail: 'desc' } },
      take: 10
    })
  }

  // Attachment analytics
  if (metrics.includes('attachments')) {
    results.attachments = await prisma.emailAttachment.groupBy({
      by: ['mimeType'],
      where: {
        email: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}
      },
      _count: true,
      _sum: { size: true }
    })
  }

  return NextResponse.json(results)
}

async function exportEmailData(filters: any) {
  // This would generate a CSV or Excel export
  // For now, return a simple JSON export
  const emails = await prisma.email.findMany({
    where: filters,
    include: {
      recipients: true,
      attachments: {
        select: {
          filename: true,
          mimeType: true,
          size: true
        }
      }
    },
    take: 10000 // Limit for performance
  })

  const exportData = emails.map(email => ({
    id: email.id,
    subject: email.subject,
    from: email.fromEmail,
    to: email.recipients.map(r => r.email).join(', '),
    status: email.status,
    isSpam: email.isSpam,
    spamScore: email.spamScore,
    attachmentCount: email.attachments.length,
    createdAt: email.createdAt,
    sentAt: email.sentAt
  }))

  return NextResponse.json({
    data: exportData,
    count: exportData.length,
    exportedAt: new Date().toISOString()
  })
}
