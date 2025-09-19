import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateEmailAccountSchema = z.object({
  password: z.string().min(8).optional(),
  type: z.enum(['STUDENT', 'FACULTY', 'STAFF', 'INSTITUTE', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  quota: z.number().min(0).optional(),
  displayName: z.string().optional(),
})

// GET /api/admin/email/accounts/[id] - Get specific email account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const account = await prisma.emailAccount.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        folders: {
          orderBy: { name: 'asc' }
        },
        sessions: {
          orderBy: { lastActivity: 'desc' },
          take: 10
        },
        _count: {
          select: {
            sentEmails: true,
            receivedEmails: true,
            payments: true
          }
        }
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Get detailed statistics
    const [storageUsage, recentEmails, paymentStats] = await Promise.all([
      // Storage usage
      prisma.emailAttachment.aggregate({
        where: {
          email: {
            OR: [
              { fromEmail: account.email },
              { recipients: { some: { email: account.email } } }
            ]
          }
        },
        _sum: { size: true }
      }),
      
      // Recent emails
      prisma.email.findMany({
        where: {
          OR: [
            { fromEmail: account.email },
            { recipients: { some: { email: account.email } } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          subject: true,
          fromEmail: true,
          status: true,
          createdAt: true,
          isRead: true
        }
      }),

      // Payment statistics
      prisma.payment.aggregate({
        where: { studentId: account.id },
        _sum: { totalAmount: true },
        _count: true
      })
    ])

    const accountWithStats = {
      ...account,
      password: undefined, // Never return password
      stats: {
        sentEmails: account._count.sentEmails,
        receivedEmails: account._count.receivedEmails,
        totalPayments: account._count.payments,
        storageUsed: storageUsage._sum.size || 0,
        storagePercentage: ((storageUsage._sum.size || 0) / account.quota) * 100,
        lastLogin: account.sessions[0]?.lastActivity || null,
        totalPaid: paymentStats._sum.totalAmount || 0,
        paymentCount: paymentStats._count || 0
      },
      recentEmails,
      recentSessions: account.sessions
    }

    return NextResponse.json({ account: accountWithStats })

  } catch (error) {
    console.error('Error fetching email account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email account' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/email/accounts/[id] - Update email account
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateEmailAccountSchema.parse(body)

    // Check if account exists
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { id: params.id }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12)
    }

    if (validatedData.type !== undefined) {
      updateData.type = validatedData.type
    }

    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
    }

    if (validatedData.quota !== undefined) {
      updateData.quota = validatedData.quota
    }

    if (validatedData.displayName !== undefined) {
      updateData.displayName = validatedData.displayName
    }

    updateData.updatedAt = new Date()

    // Update account
    const updatedAccount = await prisma.emailAccount.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log the action
    console.log(`Admin ${session.user.email} updated email account: ${updatedAccount.email}`)

    return NextResponse.json({
      message: 'Email account updated successfully',
      account: {
        ...updatedAccount,
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

    console.error('Error updating email account:', error)
    return NextResponse.json(
      { error: 'Failed to update email account' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/email/accounts/[id] - Delete email account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const permanent = url.searchParams.get('permanent') === 'true'

    // Check if account exists
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            sentEmails: true,
            receivedEmails: true,
            payments: true
          }
        }
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (permanent) {
      // Permanent deletion - use with extreme caution
      // This would cascade delete all related data
      await prisma.emailAccount.delete({
        where: { id: params.id }
      })

      console.log(`Admin ${session.user.email} permanently deleted email account: ${existingAccount.email}`)

      return NextResponse.json({
        message: 'Email account permanently deleted',
        warning: 'All associated emails and data have been permanently removed'
      })
    } else {
      // Soft delete - deactivate account and mark for deletion
      const deletedAccount = await prisma.emailAccount.update({
        where: { id: params.id },
        data: {
          isActive: false,
          email: `${existingAccount.email}.deleted.${Date.now()}`, // Prevent email conflicts
          deletedAt: new Date()
        }
      })

      console.log(`Admin ${session.user.email} soft deleted email account: ${existingAccount.email}`)

      return NextResponse.json({
        message: 'Email account deactivated and marked for deletion',
        account: {
          ...deletedAccount,
          password: undefined
        }
      })
    }

  } catch (error) {
    console.error('Error deleting email account:', error)
    return NextResponse.json(
      { error: 'Failed to delete email account' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/email/accounts/[id] - Reset password
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, newPassword } = body

    if (action !== 'resetPassword' || !newPassword) {
      return NextResponse.json(
        { error: 'Invalid action or missing password' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if account exists
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { id: params.id }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.emailAccount.update({
      where: { id: params.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    // Log the action
    console.log(`Admin ${session.user.email} reset password for email account: ${existingAccount.email}`)

    return NextResponse.json({
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
