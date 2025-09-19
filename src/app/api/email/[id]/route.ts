import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { getEmailById, updateEmail, deleteEmail } from '@/lib/email-service'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/[id] - Get specific email
export const GET = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const email = await getEmailById(params.id, session.user.email)
    return NextResponse.json(email)
  } catch (error) {
    console.error('Get email error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    )
  }
})

// PUT /api/email/[id] - Update specific email
export const PUT = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate allowed updates
    const allowedUpdates = ['isRead', 'isStarred', 'isDeleted']
    const updateData: any = {}
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = value
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const updatedEmail = await updateEmail(params.id, session.user.email, updateData)
    
    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      email: updatedEmail
    })

  } catch (error) {
    console.error('Update email error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
})

// DELETE /api/email/[id] - Delete specific email
export const DELETE = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    await deleteEmail(params.id, session.user.email, permanent)
    
    return NextResponse.json({
      success: true,
      message: permanent ? 'Email permanently deleted' : 'Email moved to trash'
    })

  } catch (error) {
    console.error('Delete email error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    )
  }
})
