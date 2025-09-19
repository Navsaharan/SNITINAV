import { prisma } from './prisma'

export interface AdvancedSearchOptions {
  query?: string
  from?: string
  to?: string
  subject?: string
  body?: string
  hasAttachment?: boolean
  attachmentType?: string
  dateFrom?: Date
  dateTo?: Date
  sizeMin?: number
  sizeMax?: number
  isRead?: boolean
  isStarred?: boolean
  isImportant?: boolean
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  folder?: string
  label?: string
  threadId?: string
}

export interface SearchResult {
  emails: any[]
  totalCount: number
  searchTime: number
  suggestions: string[]
  facets: {
    senders: Array<{ email: string; count: number }>
    dates: Array<{ date: string; count: number }>
    attachmentTypes: Array<{ type: string; count: number }>
    folders: Array<{ folder: string; count: number }>
  }
}

export interface SearchSuggestion {
  type: 'sender' | 'subject' | 'keyword'
  value: string
  count: number
}

// Advanced email search with faceted results
export const advancedEmailSearch = async (
  accountEmail: string,
  options: AdvancedSearchOptions,
  page: number = 1,
  limit: number = 50
): Promise<SearchResult> => {
  const startTime = Date.now()
  const skip = (page - 1) * limit

  // Build base where clause
  const where: any = {
    OR: [
      { fromEmail: accountEmail },
      { recipients: { some: { email: accountEmail } } }
    ],
    isDeleted: false
  }

  // Add search conditions
  if (options.query) {
    const searchTerms = options.query.toLowerCase().split(' ').filter(term => term.length > 0)
    where.OR = [
      ...searchTerms.map(term => ({
        subject: { contains: term, mode: 'insensitive' }
      })),
      ...searchTerms.map(term => ({
        body: { contains: term, mode: 'insensitive' }
      })),
      ...searchTerms.map(term => ({
        fromName: { contains: term, mode: 'insensitive' }
      }))
    ]
  }

  if (options.from) {
    where.fromEmail = { contains: options.from, mode: 'insensitive' }
  }

  if (options.to) {
    where.recipients = {
      some: {
        email: { contains: options.to, mode: 'insensitive' }
      }
    }
  }

  if (options.subject) {
    where.subject = { contains: options.subject, mode: 'insensitive' }
  }

  if (options.body) {
    where.body = { contains: options.body, mode: 'insensitive' }
  }

  if (options.hasAttachment !== undefined) {
    if (options.hasAttachment) {
      where.attachments = { some: {} }
    } else {
      where.attachments = { none: {} }
    }
  }

  if (options.attachmentType) {
    where.attachments = {
      some: {
        mimeType: { startsWith: options.attachmentType }
      }
    }
  }

  if (options.dateFrom || options.dateTo) {
    where.createdAt = {}
    if (options.dateFrom) where.createdAt.gte = options.dateFrom
    if (options.dateTo) where.createdAt.lte = options.dateTo
  }

  if (options.isRead !== undefined) {
    where.isRead = options.isRead
  }

  if (options.isStarred !== undefined) {
    where.isStarred = options.isStarred
  }

  if (options.priority) {
    where.priority = options.priority
  }

  if (options.threadId) {
    where.threadId = options.threadId
  }

  // Execute search
  const [emails, totalCount] = await Promise.all([
    prisma.email.findMany({
      where,
      include: {
        recipients: {
          select: {
            email: true,
            name: true,
            type: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true
          }
        },
        labels: {
          include: {
            folder: {
              select: {
                name: true,
                type: true
              }
            }
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

  // Generate facets
  const facets = await generateSearchFacets(accountEmail, where)

  // Generate suggestions
  const suggestions = await generateSearchSuggestions(accountEmail, options.query || '')

  const searchTime = Date.now() - startTime

  return {
    emails,
    totalCount,
    searchTime,
    suggestions,
    facets
  }
}

// Generate search facets for filtering
const generateSearchFacets = async (accountEmail: string, baseWhere: any) => {
  // Get top senders
  const senders = await prisma.email.groupBy({
    by: ['fromEmail', 'fromName'],
    where: {
      ...baseWhere,
      fromEmail: { not: accountEmail } // Exclude self
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  // Get emails by date (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const dateGroups = await prisma.email.groupBy({
    by: ['createdAt'],
    where: {
      ...baseWhere,
      createdAt: { gte: thirtyDaysAgo }
    },
    _count: { id: true }
  })

  // Group dates by day
  const dateMap = new Map<string, number>()
  dateGroups.forEach(group => {
    const date = group.createdAt.toISOString().split('T')[0]
    dateMap.set(date, (dateMap.get(date) || 0) + group._count.id)
  })

  // Get attachment types
  const attachmentTypes = await prisma.emailAttachment.groupBy({
    by: ['mimeType'],
    where: {
      email: baseWhere
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  return {
    senders: senders.map(sender => ({
      email: sender.fromEmail,
      name: sender.fromName,
      count: sender._count.id
    })),
    dates: Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    })),
    attachmentTypes: attachmentTypes.map(type => ({
      type: type.mimeType.split('/')[0], // Get main type (image, document, etc.)
      count: type._count.id
    })),
    folders: [] // TODO: Implement folder facets
  }
}

// Generate search suggestions based on user's email history
const generateSearchSuggestions = async (accountEmail: string, query: string): Promise<string[]> => {
  if (!query || query.length < 2) {
    return []
  }

  const suggestions: string[] = []

  // Get frequent senders
  const frequentSenders = await prisma.email.groupBy({
    by: ['fromEmail', 'fromName'],
    where: {
      recipients: { some: { email: accountEmail } },
      fromEmail: { not: accountEmail },
      OR: [
        { fromEmail: { contains: query, mode: 'insensitive' } },
        { fromName: { contains: query, mode: 'insensitive' } }
      ]
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  frequentSenders.forEach(sender => {
    if (sender.fromName && sender.fromName.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(sender.fromName)
    }
    if (sender.fromEmail.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(sender.fromEmail)
    }
  })

  // Get common subject patterns
  const commonSubjects = await prisma.email.findMany({
    where: {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ],
      subject: { contains: query, mode: 'insensitive' }
    },
    select: { subject: true },
    take: 10,
    distinct: ['subject']
  })

  commonSubjects.forEach(email => {
    if (email.subject.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(email.subject)
    }
  })

  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 8)
}

// Save search query for analytics
export const saveSearchQuery = async (accountEmail: string, query: string, resultCount: number) => {
  // This could be used for search analytics and improving suggestions
  // For now, we'll just log it
  console.log(`Search: ${accountEmail} searched for "${query}" (${resultCount} results)`)
}

// Get search history for user
export const getSearchHistory = async (accountEmail: string, limit: number = 10): Promise<string[]> => {
  // This would return recent search queries
  // For now, return empty array
  return []
}

// Full-text search using PostgreSQL features
export const fullTextSearch = async (
  accountEmail: string,
  query: string,
  page: number = 1,
  limit: number = 50
) => {
  const skip = (page - 1) * limit

  // Use PostgreSQL full-text search
  const emails = await prisma.$queryRaw`
    SELECT e.*, 
           ts_rank(to_tsvector('english', e.subject || ' ' || e.body), plainto_tsquery('english', ${query})) as rank
    FROM emails e
    LEFT JOIN email_recipients er ON e.id = er."emailId"
    WHERE (e."fromEmail" = ${accountEmail} OR er.email = ${accountEmail})
      AND e."isDeleted" = false
      AND (
        to_tsvector('english', e.subject) @@ plainto_tsquery('english', ${query})
        OR to_tsvector('english', e.body) @@ plainto_tsquery('english', ${query})
      )
    ORDER BY rank DESC, e."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `

  return emails
}
