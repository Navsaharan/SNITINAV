import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { uploadEmailAttachment, getSignedUrl } from '@/lib/supabase'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/[id]/attachments - Get email attachments
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
    // Verify user has access to this email
    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        OR: [
          { fromEmail: session.user.email },
          { recipients: { some: { email: session.user.email } } }
        ]
      },
      include: {
        attachments: true
      }
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // Generate signed URLs for attachments
    const attachmentsWithUrls = await Promise.all(
      email.attachments.map(async (attachment) => {
        try {
          // Extract path from URL for signed URL generation
          const urlParts = attachment.url.split('/')
          const path = urlParts.slice(-3).join('/') // emails/emailId/filename
          const signedUrl = await getSignedUrl('email-attachments', path, 3600) // 1 hour expiry
          
          return {
            ...attachment,
            downloadUrl: signedUrl
          }
        } catch (error) {
          console.error('Failed to generate signed URL for attachment:', error)
          return {
            ...attachment,
            downloadUrl: attachment.url // Fallback to original URL
          }
        }
      })
    )

    return NextResponse.json({
      emailId: params.id,
      attachments: attachmentsWithUrls
    })

  } catch (error) {
    console.error('Get attachments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
})

// POST /api/email/[id]/attachments - Add attachment to existing email (draft only)
export const POST = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify user owns this email and it's a draft
    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        fromEmail: session.user.email,
        status: 'DRAFT'
      }
    })

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found or not a draft' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size (max 25MB)
    if (file.size > 26214400) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Upload file
    const uploadResult = await uploadEmailAttachment(params.id, file)

    // Create attachment record
    const attachment = await prisma.emailAttachment.create({
      data: {
        emailId: params.id,
        filename: uploadResult.path?.split('/').pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadResult.url
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment
    })

  } catch (error) {
    console.error('Upload attachment error:', error)
    return NextResponse.json(
      { error: 'Failed to upload attachment' },
      { status: 500 }
    )
  }
})
