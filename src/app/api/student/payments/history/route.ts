import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/student/payments/history - Get payment history for student
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  
  // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const feeType = searchParams.get('feeType') || ''
  
  const skip = (page - 1) * limit

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

    // Build where clause
    const where: any = {
      studentId: studentAccount.id
    }

    // Apply filters
    if (status && status !== 'ALL') {
      where.status = status
    }

    if (feeType && feeType !== 'ALL') {
      where.feeType = feeType
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { transactionId: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          catalogItem: {
            select: {
              id: true,
              name: true,
              description: true,
              feeType: true,
              isRecurring: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        totalAmount: payment.totalAmount,
        currency: payment.currency,
        feeType: payment.feeType,
        description: payment.description,
        gateway: payment.gateway,
        status: payment.status,
        receiptNumber: payment.receiptNumber,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt.toISOString(),
        completedAt: payment.completedAt?.toISOString() || null,
        catalogItem: payment.catalogItem
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch payment history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
})
