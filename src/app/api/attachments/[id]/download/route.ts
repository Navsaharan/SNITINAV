import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { getAttachment } from '@/lib/attachment-service'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/attachments/[id]/download - Download attachment
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
    const attachment = await getAttachment(params.id, session.user.email)

    if (!attachment.downloadUrl) {
      return NextResponse.json(
        { error: 'Download URL not available' },
        { status: 500 }
      )
    }

    // Return the download URL for client-side redirect
    // This allows the browser to handle the download properly
    return NextResponse.json({
      downloadUrl: attachment.downloadUrl,
      filename: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size
    })

  } catch (error) {
    console.error('Attachment download error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to download attachment' },
      { status: 500 }
    )
  }
})
