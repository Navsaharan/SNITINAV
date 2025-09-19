import { NextRequest, NextResponse } from 'next/server'
import { getEmailServiceManager } from '@/lib/email-service-manager'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// POST /api/webhooks/mailgun - Handle Mailgun webhooks
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const signature = request.headers.get('x-mailgun-signature-256')
    const timestamp = request.headers.get('x-mailgun-timestamp')
    const token = request.headers.get('x-mailgun-token')
    
    const payload = await request.json()
    
    console.log('Received Mailgun webhook:', {
      signature: signature ? 'present' : 'missing',
      timestamp,
      token: token ? 'present' : 'missing',
      event: payload['event-data']?.event
    })

    const emailService = getEmailServiceManager()
    const events = await emailService.handleWebhook('mailgun', payload, signature || undefined)
    
    console.log(`Processed ${events.length} Mailgun webhook events`)
    
    return NextResponse.json({
      success: true,
      eventsProcessed: events.length,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Mailgun webhook processing failed:', error)
    
    // Return 200 to prevent webhook retries for invalid payloads
    if (error instanceof Error && error.message.includes('Invalid webhook signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
})

// GET /api/webhooks/mailgun - Webhook verification endpoint
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Some webhook services require a GET endpoint for verification
  return NextResponse.json({
    service: 'mailgun',
    status: 'active',
    timestamp: new Date().toISOString()
  })
})
