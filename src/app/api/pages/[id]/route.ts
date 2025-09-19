import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
  navigationCategory: z.string().nullable().optional(),
  navigationOrder: z.number().optional(),
})

// GET /api/pages/[id] - Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const page = await prisma.page.findUnique({
      where: { id: id },
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
      }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/pages/[id] - Update a specific page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePageSchema.parse(body)

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: id }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Check if slug already exists (if slug is being updated)
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Prepare data for Prisma update - only include fields that exist in the schema
    const updateData: any = {}
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDesc !== undefined) updateData.metaDesc = validatedData.metaDesc
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.parentId !== undefined) updateData.parentId = validatedData.parentId
    if (validatedData.order !== undefined) updateData.order = validatedData.order
    if (validatedData.navigationCategory !== undefined) updateData.navigationCategory = validatedData.navigationCategory
    if (validatedData.navigationOrder !== undefined) updateData.navigationOrder = validatedData.navigationOrder



    const page = await prisma.page.update({
      where: { id: id },
      data: updateData,
      include: {
        parent: true,
        children: true,
        contents: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
        message: 'The submitted data does not match the required format'
      }, { status: 400 })
    }
    console.error('Error updating page:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// DELETE /api/pages/[id] - Delete a specific page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: id },
      include: { children: true }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Check if page has children
    if (existingPage.children.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete page with child pages' 
      }, { status: 400 })
    }

    await prisma.page.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
