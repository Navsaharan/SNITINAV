import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { prisma } from '@/lib/prisma'
import { getSignedUrl, deleteFile } from '@/lib/supabase'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/email/[id]/attachments/[attachmentId] - Download specific attachment
export const GET = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify user has access to this email and attachment
    const attachment = await prisma.emailAttachment.findFirst({
      where: {
        id: params.attachmentId,
        emailId: params.id,
        email: {
          OR: [
            { fromEmail: session.user.email },
            { recipients: { some: { email: session.user.email } } }
          ]
        }
      },
      include: {
        email: {
          select: {
            id: true,
            fromEmail: true
          }
        }
      }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Extract path from URL for signed URL generation
    const urlParts = attachment.url.split('/')
    const path = urlParts.slice(-3).join('/') // emails/emailId/filename
    
    // Generate signed URL with longer expiry for downloads
    const signedUrl = await getSignedUrl('email-attachments', path, 7200) // 2 hours

    // Return redirect to signed URL
    return NextResponse.redirect(signedUrl)

  } catch (error) {
    console.error('Download attachment error:', error)
    return NextResponse.json(
      { error: 'Failed to download attachment' },
      { status: 500 }
    )
  }
})

// DELETE /api/email/[id]/attachments/[attachmentId] - Delete attachment (draft only)
export const DELETE = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify user owns this email, it's a draft, and attachment exists
    const attachment = await prisma.emailAttachment.findFirst({
      where: {
        id: params.attachmentId,
        emailId: params.id,
        email: {
          fromEmail: session.user.email,
          status: 'DRAFT'
        }
      }
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found or email is not a draft' },
        { status: 404 }
      )
    }

    // Extract path from URL for file deletion
    const urlParts = attachment.url.split('/')
    const path = urlParts.slice(-3).join('/') // emails/emailId/filename

    try {
      // Delete file from storage
      await deleteFile('email-attachments', path)
    } catch (storageError) {
      console.error('Failed to delete file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete attachment record
    await prisma.emailAttachment.delete({
      where: { id: params.attachmentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully'
    })

  } catch (error) {
    console.error('Delete attachment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
})
