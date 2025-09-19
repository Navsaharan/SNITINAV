import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/payments/transactions - List payment transactions
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
    const status = url.searchParams.get('status') || ''
    const gateway = url.searchParams.get('gateway') || ''
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const minAmount = url.searchParams.get('minAmount')
    const maxAmount = url.searchParams.get('maxAmount')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { student: { email: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (gateway && gateway !== 'all') {
      where.gateway = gateway
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

    if (minAmount || maxAmount) {
      where.totalAmount = {}
      if (minAmount) {
        where.totalAmount.gte = parseFloat(minAmount)
      }
      if (maxAmount) {
        where.totalAmount.lte = parseFloat(maxAmount)
      }
    }

    // Get transactions with student details
    const [transactions, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              displayName: true,
              type: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payment transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment transactions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/transactions - Payment analytics and reports
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, filters, analytics } = body

    switch (action) {
      case 'analytics':
        return await getPaymentAnalytics(analytics)
      
      case 'export':
        return await exportPaymentData(filters)
      
      case 'reconciliation':
        return await performReconciliation(filters)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in payment transaction action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

async function getPaymentAnalytics(analytics: any) {
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

  // Revenue analytics
  if (metrics.includes('revenue')) {
    results.revenue = await prisma.payment.aggregate({
      where: {
        ...(dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}),
        status: 'SUCCESS'
      },
      _sum: { totalAmount: true },
      _count: true,
      _avg: { totalAmount: true }
    })
  }

  // Status breakdown
  if (metrics.includes('status')) {
    results.statusBreakdown = await prisma.payment.groupBy({
      by: ['status'],
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      _count: true,
      _sum: { totalAmount: true }
    })
  }

  // Gateway performance
  if (metrics.includes('gateways')) {
    results.gatewayPerformance = await prisma.payment.groupBy({
      by: ['gateway'],
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      _count: true,
      _sum: { totalAmount: true },
      _avg: { totalAmount: true }
    })
  }

  // Fee type breakdown
  if (metrics.includes('feeTypes')) {
    results.feeTypeBreakdown = await prisma.payment.groupBy({
      by: ['feeType'],
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      _count: true,
      _sum: { totalAmount: true }
    })
  }

  // Daily/Monthly trends
  if (metrics.includes('trends')) {
    const groupByField = groupBy === 'daily' ? 'day' : 'month'
    
    // This would need raw SQL for proper date grouping
    // For now, return mock trend data
    results.trends = [
      { period: '2024-01', amount: 1500000, count: 150 },
      { period: '2024-02', amount: 1750000, count: 175 },
      { period: '2024-03', amount: 1600000, count: 160 }
    ]
  }

  // Outstanding payments
  if (metrics.includes('outstanding')) {
    results.outstanding = await prisma.payment.aggregate({
      where: {
        status: 'PENDING',
        dueDate: { lt: new Date() }
      },
      _sum: { totalAmount: true },
      _count: true
    })
  }

  return NextResponse.json(results)
}

async function exportPaymentData(filters: any) {
  const payments = await prisma.payment.findMany({
    where: filters,
    include: {
      student: {
        select: {
          email: true,
          displayName: true,
          type: true
        }
      }
    },
    take: 10000 // Limit for performance
  })

  const exportData = payments.map(payment => ({
    transactionId: payment.transactionId,
    studentEmail: payment.student.email,
    studentName: payment.student.displayName,
    feeType: payment.feeType,
    amount: payment.totalAmount,
    currency: payment.currency,
    status: payment.status,
    gateway: payment.gateway,
    paymentMethod: payment.paymentMethod,
    createdAt: payment.createdAt,
    completedAt: payment.completedAt,
    dueDate: payment.dueDate
  }))

  return NextResponse.json({
    data: exportData,
    count: exportData.length,
    exportedAt: new Date().toISOString()
  })
}

async function performReconciliation(filters: any) {
  // Get payments within the specified period
  const payments = await prisma.payment.findMany({
    where: {
      ...filters,
      status: { in: ['COMPLETED', 'FAILED', 'REFUNDED'] }
    },
    include: {
      student: {
        select: { email: true, displayName: true }
      }
    }
  })

  // Group by gateway for reconciliation
  const reconciliation = payments.reduce((acc: any, payment) => {
    const gateway = payment.gateway
    if (!acc[gateway]) {
      acc[gateway] = {
        gateway,
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        refundedTransactions: 0,
        totalAmount: 0,
        completedAmount: 0,
        refundedAmount: 0,
        transactions: []
      }
    }

    acc[gateway].totalTransactions++
    acc[gateway].totalAmount += payment.totalAmount

    if (payment.status === 'COMPLETED') {
      acc[gateway].completedTransactions++
      acc[gateway].completedAmount += payment.totalAmount
    } else if (payment.status === 'FAILED') {
      acc[gateway].failedTransactions++
    } else if (payment.status === 'REFUNDED') {
      acc[gateway].refundedTransactions++
      acc[gateway].refundedAmount += payment.totalAmount
    }

    acc[gateway].transactions.push({
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.totalAmount,
      status: payment.status,
      createdAt: payment.createdAt,
      student: payment.student
    })

    return acc
  }, {})

  return NextResponse.json({
    reconciliation: Object.values(reconciliation),
    summary: {
      totalGateways: Object.keys(reconciliation).length,
      totalTransactions: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.totalAmount, 0),
      reconciledAt: new Date().toISOString()
    }
  })
}
