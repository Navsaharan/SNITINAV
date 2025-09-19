import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { createDefaultFolders } from '@/lib/email-utils'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/folders - Get user's email folders
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's email account
    const account = await prisma.emailAccount.findUnique({
      where: { email: session.user.email }
    })

    if (!account) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 })
    }

    // Get folders with email counts
    const folders = await prisma.emailFolder.findMany({
      where: { accountId: account.id },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // If no folders exist, create default ones
    if (folders.length === 0) {
      await createDefaultFolders(account.id)
      
      // Fetch the newly created folders
      const newFolders = await prisma.emailFolder.findMany({
        where: { accountId: account.id },
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ]
      })

      return NextResponse.json(newFolders)
    }

    // Get email counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        let emailCount = 0
        let unreadCount = 0

        try {
          switch (folder.type) {
            case 'INBOX':
              const inboxCounts = await prisma.email.aggregate({
                where: {
                  recipients: { some: { email: session.user.email, type: 'TO' } },
                  fromEmail: { not: session.user.email },
                  isDeleted: false,
                  isSpam: false
                },
                _count: { id: true }
              })
              emailCount = inboxCounts._count.id || 0

              const inboxUnreadCounts = await prisma.email.aggregate({
                where: {
                  recipients: { some: { email: session.user.email, type: 'TO' } },
                  fromEmail: { not: session.user.email },
                  isDeleted: false,
                  isSpam: false,
                  isRead: false
                },
                _count: { id: true }
              })
              unreadCount = inboxUnreadCounts._count.id || 0
              break

            case 'SENT':
              const sentCounts = await prisma.email.aggregate({
                where: {
                  fromEmail: session.user.email,
                  status: { in: ['SENT', 'DELIVERED'] },
                  isDeleted: false
                },
                _count: { id: true }
              })
              emailCount = sentCounts._count.id || 0
              break

            case 'DRAFTS':
              const draftCounts = await prisma.email.aggregate({
                where: {
                  fromEmail: session.user.email,
                  status: 'DRAFT',
                  isDeleted: false
                },
                _count: { id: true }
              })
              emailCount = draftCounts._count.id || 0
              break

            case 'TRASH':
              const trashCounts = await prisma.email.aggregate({
                where: {
                  OR: [
                    { fromEmail: session.user.email },
                    { recipients: { some: { email: session.user.email } } }
                  ],
                  isDeleted: true
                },
                _count: { id: true }
              })
              emailCount = trashCounts._count.id || 0
              break

            case 'SPAM':
              const spamCounts = await prisma.email.aggregate({
                where: {
                  recipients: { some: { email: session.user.email } },
                  isSpam: true,
                  isDeleted: false
                },
                _count: { id: true }
              })
              emailCount = spamCounts._count.id || 0

              const spamUnreadCounts = await prisma.email.aggregate({
                where: {
                  recipients: { some: { email: session.user.email } },
                  isSpam: true,
                  isDeleted: false,
                  isRead: false
                },
                _count: { id: true }
              })
              unreadCount = spamUnreadCounts._count.id || 0
              break

            case 'ARCHIVE':
              // For now, archive is handled via labels
              // This would need to be implemented based on specific requirements
              break
          }
        } catch (error) {
          console.error(`Error counting emails for folder ${folder.name}:`, error)
        }

        return {
          ...folder,
          emailCount,
          unreadCount
        }
      })
    )

    return NextResponse.json(foldersWithCounts)

  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
})

// POST /api/email/folders - Create new custom folder
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, color } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
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

    // Check if folder already exists
    const existingFolder = await prisma.emailFolder.findFirst({
      where: {
        accountId: account.id,
        name: name.trim()
      }
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Folder with this name already exists' },
        { status: 400 }
      )
    }

    // Get the highest order number for custom folders
    const lastFolder = await prisma.emailFolder.findFirst({
      where: { accountId: account.id },
      orderBy: { order: 'desc' }
    })

    const folder = await prisma.emailFolder.create({
      data: {
        accountId: account.id,
        name: name.trim(),
        type: 'CUSTOM',
        color: color || '#6B7280',
        order: (lastFolder?.order || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        ...folder,
        emailCount: 0,
        unreadCount: 0
      }
    })

  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
})
