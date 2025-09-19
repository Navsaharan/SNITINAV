import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { z } from 'zod'

// Validation schema
const initiatePaymentSchema = z.object({
  catalogItemId: z.string().min(1),
  amount: z.number().min(0),
  feeType: z.enum(['ADMISSION', 'SEMESTER', 'EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'MISCELLANEOUS']),
  gateway: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'PHONEPE', 'CASHFREE']).optional()
})

// POST /api/student/payments/initiate - Initiate payment process
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = initiatePaymentSchema.parse(body)

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

    // Get catalog item
    const catalogItem = await prisma.paymentCatalogItem.findUnique({
      where: { 
        id: validatedData.catalogItemId,
        isActive: true,
        deletedAt: null
      }
    })

    if (!catalogItem) {
      return NextResponse.json({ error: 'Payment item not found' }, { status: 404 })
    }

    // Check if student is eligible for this payment
    if (!catalogItem.applicableFor.includes('STUDENT')) {
      return NextResponse.json({ error: 'Payment not applicable for students' }, { status: 403 })
    }

    // Check if already paid (unless recurring)
    if (!catalogItem.isRecurring) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          studentId: studentAccount.id,
          catalogItemId: catalogItem.id,
          status: 'SUCCESS'
        }
      })

      if (existingPayment) {
        return NextResponse.json({ error: 'Payment already completed' }, { status: 409 })
      }
    }

    // Calculate total amount including late fees
    const now = new Date()
    const dueDate = catalogItem.dueDate ? new Date(catalogItem.dueDate) : null
    const isOverdue = dueDate && now > dueDate
    const lateFee = isOverdue ? catalogItem.lateFee : 0
    const totalAmount = validatedData.amount + lateFee

    // Get available payment gateways
    const availableGateways = await prisma.paymentGatewayConfig.findMany({
      where: {
        isEnabled: true
      },
      orderBy: {
        gateway: 'asc'
      }
    })

    if (availableGateways.length === 0) {
      return NextResponse.json({ error: 'No payment gateways available' }, { status: 503 })
    }

    // Select gateway (use provided or first available)
    const selectedGateway = validatedData.gateway 
      ? availableGateways.find(g => g.gateway === validatedData.gateway)
      : availableGateways[0]

    if (!selectedGateway) {
      return NextResponse.json({ error: 'Selected payment gateway not available' }, { status: 400 })
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        studentId: studentAccount.id,
        catalogItemId: catalogItem.id,
        amount: validatedData.amount,
        currency: catalogItem.currency,
        feeType: validatedData.feeType,
        description: catalogItem.name,
        gateway: selectedGateway.gateway,
        additionalFee: lateFee,
        totalAmount,
        status: 'PENDING'
      }
    })

    // For demo purposes, return a mock payment URL
    // In production, integrate with actual payment gateway APIs
    const paymentUrl = generateMockPaymentUrl(payment, selectedGateway)

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      paymentUrl,
      gateway: selectedGateway.gateway,
      amount: totalAmount,
      currency: catalogItem.currency,
      message: 'Payment initiated successfully'
    })

  } catch (error) {
    console.error('Failed to initiate payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
})

// Mock payment URL generator for demo purposes
function generateMockPaymentUrl(payment: any, gateway: any) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  // In production, this would integrate with actual payment gateway APIs
  switch (gateway.gateway) {
    case 'RAZORPAY':
      return `${baseUrl}/payments/razorpay?txn=${payment.transactionId}&amount=${payment.totalAmount}`
    case 'STRIPE':
      return `${baseUrl}/payments/stripe?txn=${payment.transactionId}&amount=${payment.totalAmount}`
    case 'PAYU':
      return `${baseUrl}/payments/payu?txn=${payment.transactionId}&amount=${payment.totalAmount}`
    case 'PHONEPE':
      return `${baseUrl}/payments/phonepe?txn=${payment.transactionId}&amount=${payment.totalAmount}`
    case 'CASHFREE':
      return `${baseUrl}/payments/cashfree?txn=${payment.transactionId}&amount=${payment.totalAmount}`
    default:
      return `${baseUrl}/payments/demo?txn=${payment.transactionId}&amount=${payment.totalAmount}`
  }
}
