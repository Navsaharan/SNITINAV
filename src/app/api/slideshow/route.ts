import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type SlideshowMediaRow = {
  id: string
  url: string
  alt: string | null
  originalName: string | null
  caption: string | null
}

// GET /api/slideshow - Get slideshow images
export async function GET(request: NextRequest) {
  try {
    const slideshowSetting = await prisma.setting.findUnique({
      where: { key: 'homepage_slideshow' }
    })
    let imageIds: string[] = []
    if (slideshowSetting?.value) {
      try {
        const parsed: unknown = JSON.parse(slideshowSetting.value)
        if (Array.isArray(parsed)) {
          imageIds = parsed.filter((id): id is string => typeof id === 'string')
        }
      } catch (error) {
        console.error('Error parsing slideshow setting:', error)
      }
    }

    let slideshowImages: Array<{ id: string; url: string; alt: string; caption: string | null }> = []
    if (imageIds.length > 0) {
      const mediaFiles = await prisma.media.findMany({
        where: { id: { in: imageIds } },
        select: { id: true, url: true, alt: true, originalName: true, caption: true }
      })
      const mediaById = new Map<string, SlideshowMediaRow>(
        mediaFiles.map((media: SlideshowMediaRow) => [media.id, media] as [string, SlideshowMediaRow])
      )
      slideshowImages = imageIds.flatMap(id => {
        const media = mediaById.get(id)
        return media ? [{
          id: media.id,
          url: media.url,
          alt: media.alt || media.originalName || 'Slideshow image',
          caption: media.caption
        }] : []
      })
    }

    // A migrated database may have media but no slideshow setting. Prefer its
    // real image records over the legacy hard-coded sample images in that case.
    if (slideshowImages.length === 0) {
      const mediaFiles = await prisma.media.findMany({
        where: { mimeType: { startsWith: 'image/' } },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: 10,
        select: { id: true, url: true, alt: true, originalName: true, caption: true }
      })
      slideshowImages = mediaFiles.map((media: SlideshowMediaRow) => ({
        id: media.id,
        url: media.url,
        alt: media.alt || media.originalName || 'Slideshow image',
        caption: media.caption
      }))
    }

    // If no slideshow images configured, return default images
    if (slideshowImages.length === 0) {
      // Check if we're in development or production
      const isDev = process.env.NODE_ENV === 'development'
      const baseUrl = isDev ? 'http://localhost:3000' : 'https://snitinew.vercel.app'
      
      slideshowImages = [
        {
          id: 'default-1',
          url: `${baseUrl}/images/slideshow1.jpg`,
          alt: 'Institute Building',
          caption: 'S.N. Private Industrial Training Institute'
        },
        {
          id: 'default-2',
          url: `${baseUrl}/images/slideshow2.jpg`,
          alt: 'Workshop Area',
          caption: 'Modern Workshop Facilities'
        },
        {
          id: 'default-3',
          url: `${baseUrl}/images/slideshow3.jpg`,
          alt: 'Students in Training',
          caption: 'Hands-on Technical Training'
        }
      ]
    }

    const dataSource = slideshowImages.some(image => !image.id.startsWith('default-'))
      ? 'prisma'
      : 'fallback'
    return NextResponse.json({ images: slideshowImages }, {
      headers: { 'X-Data-Source': dataSource }
    })
  } catch (error) {
    console.error('Error fetching slideshow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/slideshow - Update slideshow images (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to update slideshow
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { imageIds } = await request.json()

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: 'imageIds must be an array' }, { status: 400 })
    }

    // If no image IDs provided, clear the slideshow
    if (imageIds.length === 0) {
      await prisma.setting.upsert({
        where: { key: 'homepage_slideshow' },
        update: { value: '[]' },
        create: { key: 'homepage_slideshow', value: '[]' }
      })
      return NextResponse.json({ success: true })
    }

    // Verify all image IDs exist
    const existingMedia = await prisma.media.findMany({
      where: {
        id: {
          in: imageIds
        }
      }
    })

    if (existingMedia.length !== imageIds.length) {
      return NextResponse.json({ error: 'Some image IDs do not exist' }, { status: 400 })
    }

    // Update or create slideshow setting
    await prisma.setting.upsert({
      where: {
        key: 'homepage_slideshow'
      },
      update: {
        value: JSON.stringify(imageIds)
      },
      create: {
        key: 'homepage_slideshow',
        value: JSON.stringify(imageIds),
        type: 'JSON'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating slideshow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
