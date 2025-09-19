import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { getEmailList } from '@/lib/email-service'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email - List emails with pagination and filtering
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  
  // Parse query parameters
  const folder = searchParams.get('folder') || 'Inbox'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 per page
  const search = searchParams.get('search') || undefined
  
  // Parse filters
  const filters: any = {}
  if (searchParams.get('from')) filters.from = searchParams.get('from')
  if (searchParams.get('to')) filters.to = searchParams.get('to')
  if (searchParams.get('subject')) filters.subject = searchParams.get('subject')
  if (searchParams.get('hasAttachment')) filters.hasAttachment = searchParams.get('hasAttachment') === 'true'
  if (searchParams.get('isRead')) filters.isRead = searchParams.get('isRead') === 'true'
  if (searchParams.get('isStarred')) filters.isStarred = searchParams.get('isStarred') === 'true'
  
  // Parse date filters
  if (searchParams.get('dateFrom')) {
    filters.dateFrom = new Date(searchParams.get('dateFrom')!)
  }
  if (searchParams.get('dateTo')) {
    filters.dateTo = new Date(searchParams.get('dateTo')!)
  }

  try {
    const result = await getEmailList({
      accountId: session.user.email,
      folder,
      page,
      limit,
      search,
      filters
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Email list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
})

// POST /api/email - Create new email (draft or send)
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    
    // Extract email data
    const emailData = {
      from: session.user.email,
      to: formData.get('to') as string,
      cc: formData.get('cc') as string || undefined,
      bcc: formData.get('bcc') as string || undefined,
      subject: formData.get('subject') as string,
      body: formData.get('body') as string,
      replyTo: formData.get('replyTo') as string || undefined,
      inReplyTo: formData.get('inReplyTo') as string || undefined,
      references: formData.get('references') as string || undefined,
      priority: (formData.get('priority') as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') || 'NORMAL',
      isDraft: formData.get('isDraft') === 'true'
    }

    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      return NextResponse.json(
        { error: 'To and subject fields are required' },
        { status: 400 }
      )
    }

    // Extract attachments
    const attachments: File[] = []
    const attachmentEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('attachment_'))
    
    for (const [, file] of attachmentEntries) {
      if (file instanceof File && file.size > 0) {
        // Check file size (max 25MB per attachment)
        if (file.size > 26214400) {
          return NextResponse.json(
            { error: `Attachment ${file.name} is too large. Maximum size is 25MB.` },
            { status: 400 }
          )
        }
        attachments.push(file)
      }
    }

    // Import createEmail dynamically to avoid build-time issues
    const { createEmail } = await import('@/lib/email-service')
    
    const emailId = await createEmail({
      ...emailData,
      attachments
    })

    return NextResponse.json({ 
      success: true, 
      emailId,
      message: emailData.isDraft ? 'Draft saved successfully' : 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email creation error:', error)

    if (error instanceof Error) {
      // Check for specific database constraint errors
      if (error.message.includes('Foreign key constraint')) {
        console.error('Foreign key constraint violation details:', {
          message: error.message,
          stack: error.stack
        })
        return NextResponse.json(
          { error: 'Database constraint error: Unable to create email recipients. Please try again.' },
          { status: 400 }
        )
      }

      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email with this message ID already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create email' },
      { status: 500 }
    )
  }
})

// PUT /api/email - Bulk update emails (mark as read, delete, etc.)
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { emailIds, action, value } = await request.json()

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'Email IDs are required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Import updateEmail dynamically
    const { updateEmail } = await import('@/lib/email-service')
    
    const results = []
    
    for (const emailId of emailIds) {
      try {
        let updateData: any = {}
        
        switch (action) {
          case 'markRead':
            updateData.isRead = value !== false
            break
          case 'markStarred':
            updateData.isStarred = value !== false
            break
          case 'delete':
            updateData.isDeleted = true
            break
          case 'restore':
            updateData.isDeleted = false
            break
          default:
            throw new Error(`Unknown action: ${action}`)
        }

        await updateEmail(emailId, session.user.email, updateData)
        results.push({ emailId, success: true })
      } catch (error) {
        results.push({ 
          emailId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      message: `${successCount} emails updated successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results
    })

  } catch (error) {
    console.error('Bulk email update error:', error)
    return NextResponse.json(
      { error: 'Failed to update emails' },
      { status: 500 }
    )
  }
})
