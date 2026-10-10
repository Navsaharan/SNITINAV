
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const IMAGE_BUCKET = 'faculty-photos'
const PDF_BUCKET = 'Pics'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

function getStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase Storage server configuration is missing')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// GET /api/media - List media files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    )
    const skip = (page - 1) * limit

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count(),
    ])

    const storageAdmin = getStorageAdmin()

    // Generate temporary links for privately stored PDFs.
    const mediaWithUrls = await Promise.all(
     media.map(async (item: (typeof media)[number]) => {
        if (!item.url.startsWith('storage://')) {
          return item
        }

        const storageReference = item.url.slice('storage://'.length)
        const separator = storageReference.indexOf('/')

        if (separator < 1) {
          return item
        }

        const bucket = storageReference.slice(0, separator)
        const path = storageReference.slice(separator + 1)

        const { data, error } = await storageAdmin.storage
          .from(bucket)
          .createSignedUrl(path, 3600)

        if (error || !data?.signedUrl) {
          console.error('Could not create private media link:', error?.message)
          return { ...item, url: '' }
        }

        return { ...item, url: data.signedUrl }
      })
    )

    return NextResponse.json({
      media: mediaWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Could not fetch media files' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload media files
export async function POST(request: NextRequest) {
  let uploadedPath: string | null = null
  let uploadedBucket: string | null = null
  let storageAdmin: ReturnType<typeof getStorageAdmin> | null = null

  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const formFile = formData.get('file')
    const file = formFile instanceof File ? formFile : null

    const alt = String(formData.get('alt') || '')
    const caption = String(formData.get('caption') || '')
    const category = String(formData.get('category') || 'GENERAL')
    const tags = String(formData.get('tags') || '')
    const isPublic = file?.type.startsWith('image/') && formData.get('isPublic') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const extension = ALLOWED_TYPES[file.type]

    if (!extension) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, GIF, WebP images and PDFs are supported.' },
        { status: 400 }
      )
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File must be larger than 0 bytes and no larger than 10 MB.' },
        { status: 400 }
      )
    }

    storageAdmin = getStorageAdmin()

    const filename = `${Date.now()}-${randomUUID()}.${extension}`
    uploadedPath = `uploads/${filename}`

    const isPdf = file.type === 'application/pdf'
    uploadedBucket = isPdf ? PDF_BUCKET : IMAGE_BUCKET

    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await storageAdmin.storage
      .from(uploadedBucket)
      .upload(uploadedPath, bytes, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError.message)
      uploadedPath = null

      return NextResponse.json(
        {
          error: isPdf
            ? 'PDF upload failed. Check the private Pics bucket.'
            : 'Image upload failed. Check the faculty-photos bucket and its file-size and image-type restrictions.',
        },
        { status: 502 }
      )
    }

    let mediaUrl: string

    if (isPdf) {
      // Store only the private storage reference in the database.
      mediaUrl = `storage://${uploadedBucket}/${uploadedPath}`
    } else {
      const { data } = storageAdmin.storage
        .from(uploadedBucket)
        .getPublicUrl(uploadedPath)

      mediaUrl = data.publicUrl
    }

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: mediaUrl,
        alt,
        caption,
        category: category as any,
        isPublic,
        tags,
        createdById: (session as any).user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    revalidatePublicContent()

    // Return a temporary URL for PDFs, while keeping their stored reference private.
    if (isPdf) {
      const { data, error } = await storageAdmin.storage
        .from(PDF_BUCKET)
        .createSignedUrl(uploadedPath, 3600)

      if (error || !data?.signedUrl) {
        console.error('PDF signed URL creation failed:', error?.message)
        return NextResponse.json(
          { ...media, url: '' },
          { status: 201 }
        )
      }

      return NextResponse.json(
        { ...media, url: data.signedUrl },
        { status: 201 }
      )
    }

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    if (uploadedPath && uploadedBucket && storageAdmin) {
      try {
        await storageAdmin.storage
          .from(uploadedBucket)
          .remove([uploadedPath])
      } catch (cleanupError) {
        console.error('Media cleanup failed:', cleanupError)
      }
    }

    console.error('Error uploading media:', error)

    return NextResponse.json(
      { error: 'Upload failed. Check the server logs if the problem continues.' },
      { status: 500 }
    )
  }
}
