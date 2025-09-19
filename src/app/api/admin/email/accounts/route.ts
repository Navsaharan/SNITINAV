import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schemas
const createEmailAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  type: z.enum(['STUDENT', 'FACULTY', 'STAFF', 'INSTITUTE', 'ADMIN']),
  isActive: z.boolean().default(true),
  quota: z.number().min(0).default(1000000000), // 1GB default
})

const updateEmailAccountSchema = z.object({
  password: z.string().min(8).optional(),
  type: z.enum(['STUDENT', 'FACULTY', 'STAFF', 'INSTITUTE', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  quota: z.number().min(0).optional(),
})

// GET /api/admin/email/accounts - List email accounts
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
    const type = url.searchParams.get('type') || ''
    const status = url.searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Get accounts with usage statistics
    const [accounts, total] = await Promise.all([
      prisma.emailAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              sentEmails: true,
              receivedEmails: true,
              payments: true
            }
          },
          sessions: {
            orderBy: { lastActivity: 'desc' },
            take: 1
          }
        }
      }),
      prisma.emailAccount.count({ where })
    ])

    // Calculate usage statistics
    const accountsWithStats = await Promise.all(
      accounts.map(async (account) => {
        // Get storage usage
        const storageUsage = await prisma.emailAttachment.aggregate({
          where: {
            email: {
              OR: [
                { fromEmail: account.email },
                { recipients: { some: { email: account.email } } }
              ]
            }
          },
          _sum: { size: true }
        })

        return {
          ...account,
          quota: Number(account.quota),
          usedQuota: Number(account.usedQuota),
          stats: {
            sentEmails: account._count.sentEmails,
            receivedEmails: account._count.receivedEmails,
            totalPayments: account._count.payments,
            storageUsed: Number(storageUsage._sum.size) || 0,
            lastLogin: account.sessions[0]?.lastActivity || null
          }
        }
      })
    )

    return NextResponse.json({
      accounts: accountsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching email accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email accounts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/email/accounts - Create email account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEmailAccountSchema.parse(body)

    // Check if email already exists
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { email: validatedData.email }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Email account already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create email account
    const account = await prisma.emailAccount.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        type: validatedData.type,
        isActive: validatedData.isActive,
        quota: validatedData.quota,
        displayName: validatedData.email.split('@')[0],
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create default folders
    const defaultFolders = [
      { name: 'Inbox', type: 'INBOX' },
      { name: 'Sent', type: 'SENT' },
      { name: 'Drafts', type: 'DRAFTS' },
      { name: 'Trash', type: 'TRASH' },
      { name: 'Spam', type: 'SPAM' }
    ]

    await prisma.emailFolder.createMany({
      data: defaultFolders.map(folder => ({
        accountId: account.id,
        name: folder.name,
        type: folder.type as any
      }))
    })

    // Log the action
    console.log(`Admin ${session.user.email} created email account: ${account.email}`)

    return NextResponse.json({
      message: 'Email account created successfully',
      account: {
        ...account,
        quota: Number(account.quota),
        usedQuota: Number(account.usedQuota),
        password: undefined // Don't return password
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating email account:', error)
    return NextResponse.json(
      { error: 'Failed to create email account' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/email/accounts - Bulk operations
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, accountIds, data } = body

    if (!action || !accountIds || !Array.isArray(accountIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.emailAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.emailAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { isActive: false }
        })
        break

      case 'delete':
        // Soft delete by marking as inactive and adding deleted flag
        result = await prisma.emailAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { 
            isActive: false,
            email: { 
              // Append timestamp to email to allow recreation
              // This would need to be handled differently in production
            }
          }
        })
        break

      case 'updateQuota':
        if (!data?.quota || typeof data.quota !== 'number') {
          return NextResponse.json(
            { error: 'Quota value required' },
            { status: 400 }
          )
        }
        result = await prisma.emailAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { quota: data.quota }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log the action
    console.log(`Admin ${session.user.email} performed bulk action: ${action} on ${accountIds.length} accounts`)

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.count
    })

  } catch (error) {
    console.error('Error performing bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
