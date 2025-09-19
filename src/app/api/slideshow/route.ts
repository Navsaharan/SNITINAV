import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/slideshow - Get slideshow images
export async function GET(request: NextRequest) {
  try {
    let slideshowImages = []
    
    try {
      // Try to get slideshow configuration from settings
      const slideshowSetting = await prisma.setting.findUnique({
        where: {
          key: 'homepage_slideshow'
        }
      })

      if (slideshowSetting?.value) {
        try {
          const imageIds = JSON.parse(slideshowSetting.value)
          
          if (Array.isArray(imageIds) && imageIds.length > 0) {
            // Get the actual media files
            const mediaFiles = await prisma.media.findMany({
              where: {
                id: {
                  in: imageIds
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            })

            // Define the Media type
            interface Media {
              id: string
              url: string
              alt?: string
              originalName?: string
              caption?: string
            }

            slideshowImages = mediaFiles.map((media: Media) => ({
              id: media.id,
              url: media.url,
              alt: media.alt || media.originalName || 'Slideshow image',
              caption: media.caption
            }))
          }
        } catch (error) {
          console.error('Error parsing slideshow setting:', error)
        }
      }
    } catch (error) {
      console.error('Error accessing settings table:', error)
      // Continue to return default images
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

    return NextResponse.json({ images: slideshowImages })
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
