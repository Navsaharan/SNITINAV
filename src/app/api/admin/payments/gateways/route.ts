import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/payments/gateways - Get payment gateway configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all payment gateway configurations
    const gatewayConfigs = await prisma.paymentGatewayConfig.findMany({
      orderBy: { gateway: 'asc' }
    })

    // Transform to include additional metadata
    const gateways = gatewayConfigs.map(config => {
      let parsedConfig = {}
      try {
        parsedConfig = JSON.parse(config.config)
      } catch (e) {
        console.error('Error parsing gateway config:', e)
      }

      return {
        id: config.id,
        gateway: config.gateway,
        isEnabled: config.isEnabled,
        isTestMode: config.isTestMode,
        apiKey: parsedConfig.apiKey,
        secretKey: parsedConfig.secretKey,
        webhookUrl: parsedConfig.webhookUrl,
        supportedMethods: getSupportedMethods(config.gateway),
        fees: {
          percentage: config.feeAmount,
          fixed: config.feeType === 'FIXED' ? config.feeAmount : 0
        },
        status: config.isEnabled ? 'ACTIVE' : 'INACTIVE',
        lastTested: config.updatedAt?.toISOString()
      }
    })

    return NextResponse.json({ gateways })

  } catch (error) {
    console.error('Error fetching payment gateways:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/payments/gateways - Update payment gateway configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, isEnabled, isTestMode, apiKey, secretKey, webhookUrl } = body

    // Create config JSON
    const config = JSON.stringify({
      apiKey,
      secretKey,
      webhookUrl
    })

    // Update gateway configuration
    const updatedGateway = await prisma.paymentGatewayConfig.update({
      where: { id },
      data: {
        isEnabled,
        isTestMode,
        config,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ gateway: updatedGateway })

  } catch (error) {
    console.error('Error updating payment gateway:', error)
    return NextResponse.json(
      { error: 'Failed to update payment gateway' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/gateways - Create new payment gateway configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { gateway, isEnabled, isTestMode, apiKey, secretKey, webhookUrl } = body

    // Create config JSON
    const config = JSON.stringify({
      apiKey,
      secretKey,
      webhookUrl
    })

    // Create new gateway configuration
    const newGateway = await prisma.paymentGatewayConfig.create({
      data: {
        gateway,
        isEnabled: isEnabled || false,
        isTestMode: isTestMode || true,
        config
      }
    })

    return NextResponse.json({ gateway: newGateway })

  } catch (error) {
    console.error('Error creating payment gateway:', error)
    return NextResponse.json(
      { error: 'Failed to create payment gateway' },
      { status: 500 }
    )
  }
}

function getSupportedMethods(gateway: string): string[] {
  const methods: Record<string, string[]> = {
    RAZORPAY: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
    STRIPE: ['Credit Card', 'Debit Card', 'Bank Transfer'],
    PAYU: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
    CASHFREE: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
    PHONEPE: ['UPI', 'Wallet']
  }
  
  return methods[gateway] || ['Credit Card', 'Debit Card']
}

function getGatewayFees(gateway: string): { percentage: number; fixed: number } {
  const fees: Record<string, { percentage: number; fixed: number }> = {
    RAZORPAY: { percentage: 2.0, fixed: 0 },
    STRIPE: { percentage: 2.9, fixed: 30 },
    PAYU: { percentage: 2.0, fixed: 0 },
    CASHFREE: { percentage: 1.8, fixed: 0 },
    PHONEPE: { percentage: 1.5, fixed: 0 }
  }
  
  return fees[gateway] || { percentage: 2.0, fixed: 0 }
}
