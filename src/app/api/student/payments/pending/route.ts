import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/student/payments/pending - Get pending payments for student
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

    // Get active payment catalog items applicable to students
    const catalogItems = await prisma.paymentCatalogItem.findMany({
      where: {
        isActive: true,
        applicableFor: {
          contains: 'STUDENT'
        },
        deletedAt: null
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get existing payments for this student
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

    // Filter out already paid items (unless recurring)
    const pendingItems = catalogItems.filter(item => {
      if (item.isRecurring) {
        // For recurring items, check if payment is due based on interval
        return true // Simplified - in real implementation, check last payment date
      }
      return !paidCatalogItemIds.has(item.id)
    })

    // Transform to include status and calculate late fees
    const paymentsWithStatus = pendingItems.map(item => {
      const now = new Date()
      const dueDate = item.dueDate ? new Date(item.dueDate) : null
      const isOverdue = dueDate && now > dueDate

      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        feeType: item.feeType,
        amount: item.amount,
        currency: item.currency,
        dueDate: item.dueDate?.toISOString() || null,
        lateFee: isOverdue ? item.lateFee : 0,
        discountPercentage: item.discountPercentage,
        isRecurring: item.isRecurring,
        status: isOverdue ? 'OVERDUE' : 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      payments: paymentsWithStatus,
      count: paymentsWithStatus.length
    })

  } catch (error) {
    console.error('Failed to fetch pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
})
