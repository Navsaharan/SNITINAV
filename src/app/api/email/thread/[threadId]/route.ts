import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { getEmailThread } from '@/lib/email-service'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/thread/[threadId] - Get email thread/conversation
export const GET = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { threadId: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const emails = await getEmailThread(params.threadId, session.user.email)
    
    if (emails.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    return NextResponse.json({
      threadId: params.threadId,
      emails,
      count: emails.length
    })

  } catch (error) {
    console.error('Get email thread error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email thread' },
      { status: 500 }
    )
  }
})
