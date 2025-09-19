import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processEmailQueue, getQueueStats, retryFailedEmails, cleanupEmailQueue } from '@/lib/email-queue'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/queue - Get queue statistics (admin only)
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check admin authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await getQueueStats()
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get queue stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue statistics' },
      { status: 500 }
    )
  }
})

// POST /api/email/queue - Process queue or perform queue operations (admin only)
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check admin authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, batchSize, emailIds, olderThanDays } = await request.json()

    switch (action) {
      case 'process':
        const processResult = await processEmailQueue(batchSize || 10)
        return NextResponse.json({
          success: true,
          message: 'Queue processing completed',
          result: processResult
        })

      case 'retry':
        const retryCount = await retryFailedEmails(emailIds)
        return NextResponse.json({
          success: true,
          message: `${retryCount} failed emails queued for retry`,
          count: retryCount
        })

      case 'cleanup':
        const cleanupCount = await cleanupEmailQueue(olderThanDays || 7)
        return NextResponse.json({
          success: true,
          message: `${cleanupCount} old queue items cleaned up`,
          count: cleanupCount
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: process, retry, cleanup' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Queue operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform queue operation' },
      { status: 500 }
    )
  }
})
