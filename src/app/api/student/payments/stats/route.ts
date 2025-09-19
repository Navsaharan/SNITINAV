import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/student/payments/stats - Get payment statistics for student
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get student account
    const studentAccount = await prisma.emailAccount.findUnique({
      where: { 
        email: session.user.email,
        type: 'STUDENT',
        isActive: true
      }
    })

    if (!studentAccount) {
      return NextResponse.json({ error: 'Student account not found' }, { status: 404 })
    }

    // Get payment statistics
    const [
      successfulPayments,
      pendingPayments,
      failedPayments,
      catalogItems
    ] = await Promise.all([
      // Successful payments
      prisma.payment.aggregate({
        where: {
          studentId: studentAccount.id,
          status: 'SUCCESS'
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      
      // Pending payments
      prisma.payment.aggregate({
        where: {
          studentId: studentAccount.id,
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      
      // Failed payments
      prisma.payment.aggregate({
        where: {
          studentId: studentAccount.id,
          status: { in: ['FAILED', 'CANCELLED'] }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      
      // Active catalog items for pending calculation
      prisma.paymentCatalogItem.findMany({
        where: {
          isActive: true,
          applicableFor: { contains: 'STUDENT' },
          deletedAt: null
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          lateFee: true,
          isRecurring: true
        }
      })
    ])

    // Get existing successful payments to calculate pending amounts
    const existingPayments = await prisma.payment.findMany({
      where: {
        studentId: studentAccount.id,
        status: 'SUCCESS'
      },
      select: {
        catalogItemId: true
      }
    })

    const paidCatalogItemIds = new Set(
      existingPayments
        .map(p => p.catalogItemId)
        .filter(Boolean)
    )

    // Calculate pending and overdue amounts
    let pendingAmount = 0
    let overdueAmount = 0
    let totalPendingCount = 0
    let totalOverdueCount = 0

    const now = new Date()

    catalogItems.forEach(item => {
      // Skip if already paid (unless recurring)
      if (!item.isRecurring && paidCatalogItemIds.has(item.id)) {
        return
      }

      const dueDate = item.dueDate ? new Date(item.dueDate) : null
      const isOverdue = dueDate && now > dueDate

      if (isOverdue) {
        overdueAmount += item.amount + item.lateFee
        totalOverdueCount++
      } else {
        pendingAmount += item.amount
        totalPendingCount++
      }
    })

    // Add pending payments from database
    pendingAmount += pendingPayments._sum.totalAmount || 0
    totalPendingCount += pendingPayments._count.id || 0

    const stats = {
      totalPending: totalPendingCount,
      totalPaid: successfulPayments._count.id || 0,
      totalOverdue: totalOverdueCount,
      totalFailed: failedPayments._count.id || 0,
      pendingAmount: pendingAmount,
      paidAmount: successfulPayments._sum.totalAmount || 0,
      overdueAmount: overdueAmount,
      failedAmount: failedPayments._sum.totalAmount || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Failed to fetch payment statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    )
  }
})
