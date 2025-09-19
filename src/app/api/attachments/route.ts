import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'
import { validateAttachment } from '@/lib/attachment-service'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// POST /api/attachments/validate - Validate attachment before upload
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication
  const session = await getServerSession(studentAuthOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const existingAttachmentsData = formData.get('existingAttachments') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    let existingAttachments: Array<{ size: number }> = []
    if (existingAttachmentsData) {
      try {
        existingAttachments = JSON.parse(existingAttachmentsData)
      } catch (error) {
        console.error('Failed to parse existing attachments:', error)
      }
    }

    const validation = validateAttachment(file, existingAttachments)

    return NextResponse.json({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Attachment validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate attachment' },
      { status: 500 }
    )
  }
})
