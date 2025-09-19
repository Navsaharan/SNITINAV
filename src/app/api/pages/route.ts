import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createSecureApi, validators, createSuccessResponse } from '@/lib/secure-api'


const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  parentId: z.string().optional(),
  order: z.number().default(0),
})

// GET /api/pages - List all pages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const status = searchParams.get('status')

    const where: { parentId?: string | null; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } = {}
    if (parentId) {
      where.parentId = parentId
    }
    if (status && (status === 'DRAFT' || status === 'PUBLISHED' || status === 'ARCHIVED')) {
      where.status = status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' }
        },
        contents: {
          orderBy: { order: 'asc' }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pages - Create a new page with enhanced security
export const POST = createSecureApi(
  async (context, body) => {
    // Enhanced validation with sanitization
    const title = validators.string(body.title, 'title', 1, 200)
    const slug = validators.string(body.slug, 'slug', 1, 100)
    const description = validators.optionalString(body.description, 'description', 1000)
    const content = validators.optionalString(body.content, 'content', 50000)
    const metaTitle = validators.optionalString(body.metaTitle, 'metaTitle', 200)
    const metaDesc = validators.optionalString(body.metaDesc, 'metaDesc', 500)
    const status = validators.enum(body.status || 'DRAFT', 'status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    const parentId = body.parentId || null
    const order = validators.number(body.order || 0, 'order', 0, 9999)
    const navigationCategory = validators.optionalString(body.navigationCategory, 'navigationCategory', 100)
    const navigationOrder = validators.number(body.navigationOrder || 0, 'navigationOrder', 0, 9999)

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })

    if (existingPage) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        description,
        content,
        metaTitle,
        metaDesc,
        status,
        parentId,
        order,
        navigationCategory,
        navigationOrder,
        createdById: context.user.sub,
      },
      include: {
        parent: true,
        children: true,
        contents: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(page, { status: 201 })
  },
  {
    requireAdmin: true,
    sanitizeInput: true,
    logAudit: true,
  }
)
