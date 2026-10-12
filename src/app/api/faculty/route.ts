import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { recordSessionAudit } from '@/lib/admin-audit'

const publicImageUrlSchema = z.string().max(2048).refine((value) => !value || /^https?:\/\/[^\s]+$/i.test(value) || (value.startsWith('/') && !value.startsWith('//')), 'Photo URL must be HTTP(S) or a same-site path')

const facultySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: publicImageUrlSchema.optional(),
  bio: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/faculty - Get all faculty members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const session = await getServerSession(authOptions)
    const where = activeOnly || (session as any)?.user?.role !== 'ADMIN' ? { isActive: true } : {}

    const faculty = await prisma.faculty.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ faculty })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/faculty - Create new faculty member (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = facultySchema.parse(body)

    const faculty = await prisma.faculty.create({
      data: {
        name: validatedData.name,
        designation: validatedData.designation,
        department: validatedData.department || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        photoUrl: validatedData.photoUrl || null,
        bio: validatedData.bio || null,
        order: validatedData.order || 0,
        isActive: validatedData.isActive ?? true,
      }
    })

    revalidatePublicContent()
    await recordSessionAudit(request, session, 'CREATE', '/api/faculty', { facultyId: faculty.id, name: faculty.name })
    return NextResponse.json({ faculty }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating faculty:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/faculty - Update faculty order (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { facultyIds } = await request.json()

    if (!Array.isArray(facultyIds)) {
      return NextResponse.json({ error: 'facultyIds must be an array' }, { status: 400 })
    }

    // Update order for each faculty member
    await prisma.$transaction(facultyIds.map((id: string, index: number) =>
      prisma.faculty.update({ where: { id }, data: { order: index } })
    ))

    revalidatePublicContent()
    await recordSessionAudit(request, session, 'UPDATE', '/api/faculty', { facultyIds, change: 'order' })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating faculty order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
