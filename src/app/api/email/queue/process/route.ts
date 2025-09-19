import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processEmailQueue, getQueueStats } from '@/lib/email-queue'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// POST /api/email/queue/process - Process email queue manually
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication - only admins can manually process queue
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const batchSize = Math.min(body.batchSize || 10, 50) // Max 50 emails per batch

    console.log(`Processing email queue with batch size: ${batchSize}`)
    
    const result = await processEmailQueue(batchSize)
    
    return NextResponse.json({
      success: true,
      result: {
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors
      },
      message: `Processed ${result.processed} emails: ${result.successful} successful, ${result.failed} failed`
    })

  } catch (error) {
    console.error('Queue processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process email queue' },
      { status: 500 }
    )
  }
})

// GET /api/email/queue/process - Get queue processing status
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const stats = await getQueueStats()
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'Queue statistics retrieved successfully'
    })

  } catch (error) {
    console.error('Failed to get queue stats:', error)
    return NextResponse.json(
      { error: 'Failed to get queue statistics' },
      { status: 500 }
    )
  }
})
