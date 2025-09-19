import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const facultyUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  designation: z.string().min(1, 'Designation is required').optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  bio: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/faculty/[id] - Get single faculty member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const faculty = await prisma.faculty.findUnique({
      where: { id }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    return NextResponse.json({ faculty })
  } catch (error) {
    console.error('Error fetching faculty member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/faculty/[id] - Update faculty member (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = facultyUpdateSchema.parse(body)

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.designation && { designation: validatedData.designation }),
        ...(validatedData.department !== undefined && { department: validatedData.department || null }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone || null }),
        ...(validatedData.photoUrl !== undefined && { photoUrl: validatedData.photoUrl || null }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio || null }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      }
    })

    return NextResponse.json({ faculty })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating faculty member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/faculty/[id] - Delete faculty member (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await prisma.faculty.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting faculty member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
