import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


const createContentSchema = z.object({
  type: z.enum(['TEXT', 'HTML', 'IMAGE', 'GALLERY', 'SLIDESHOW', 'TABLE', 'LIST', 'CONTACT_INFO', 'DOWNLOAD']),
  title: z.string().optional(),
  content: z.string().optional(),
  data: z.string().optional(), // JSON data for complex content
  order: z.number().default(0),
  pageId: z.string().min(1, 'Page ID is required'),
})

// GET /api/content - List content blocks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    const where: { pageId?: string } = {}
    if (pageId) {
      where.pageId = pageId
    }

    const contents = await prisma.content.findMany({
      where,
      include: {
        page: {
          select: { id: true, title: true, slug: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/content - Create new content block
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createContentSchema.parse(body)

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: validatedData.pageId }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const content = await prisma.content.create({
      data: {
        ...validatedData,
        createdById: (session as any).user.id,
      },
      include: {
        page: {
          select: { id: true, title: true, slug: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
