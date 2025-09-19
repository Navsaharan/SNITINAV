import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { buildEmailSearchQuery } from '@/lib/email-utils'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/search - Advanced email search
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  
  // Parse search parameters
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  
  // Parse advanced filters
  const filters: any = {}
  if (searchParams.get('from')) filters.from = searchParams.get('from')
  if (searchParams.get('to')) filters.to = searchParams.get('to')
  if (searchParams.get('subject')) filters.subject = searchParams.get('subject')
  if (searchParams.get('folder')) filters.folder = searchParams.get('folder')
  if (searchParams.get('hasAttachment')) filters.hasAttachment = searchParams.get('hasAttachment') === 'true'
  if (searchParams.get('isRead')) filters.isRead = searchParams.get('isRead') === 'true'
  if (searchParams.get('isStarred')) filters.isStarred = searchParams.get('isStarred') === 'true'
  
  // Parse date filters
  if (searchParams.get('dateFrom')) {
    try {
      filters.dateFrom = new Date(searchParams.get('dateFrom')!)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid dateFrom format' },
        { status: 400 }
      )
    }
  }
  
  if (searchParams.get('dateTo')) {
    try {
      filters.dateTo = new Date(searchParams.get('dateTo')!)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid dateTo format' },
        { status: 400 }
      )
    }
  }

  try {
    const skip = (page - 1) * limit

    // Build search query
    const where = buildEmailSearchQuery(query, filters)
    
    // Add user access filter
    where.OR = [
      { fromEmail: session.user.email },
      { recipients: { some: { email: session.user.email } } }
    ]

    // Execute search
    const [emails, total] = await Promise.all([
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

    // Add search result highlighting (basic implementation)
    const emailsWithHighlights = emails.map(email => {
      const highlights: string[] = []
      
      if (query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
        
        searchTerms.forEach(term => {
          if (email.subject.toLowerCase().includes(term)) {
            highlights.push('subject')
          }
          if (email.body.toLowerCase().includes(term)) {
            highlights.push('body')
          }
          if (email.fromName?.toLowerCase().includes(term)) {
            highlights.push('from')
          }
        })
      }

      return {
        ...email,
        highlights: [...new Set(highlights)] // Remove duplicates
      }
    })

    return NextResponse.json({
      query,
      filters,
      emails: emailsWithHighlights,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Email search error:', error)
    return NextResponse.json(
      { error: 'Failed to search emails' },
      { status: 500 }
    )
  }
})

// POST /api/email/search - Save search query (for future implementation)
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, query, filters } = await request.json()

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      )
    }

    // Get user's email account
    const account = await prisma.emailAccount.findUnique({
      where: { email: session.user.email }
    })

    if (!account) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 })
    }

    // For now, we'll store saved searches as a simple JSON in the account
    // In a full implementation, you might want a separate SavedSearch model
    
    return NextResponse.json({
      success: true,
      message: 'Search saved successfully (feature coming soon)',
      savedSearch: {
        name,
        query,
        filters
      }
    })

  } catch (error) {
    console.error('Save search error:', error)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
})
