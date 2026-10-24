import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/security'

type RouteContext = {
  params: Promise<{ id: string }>
}

// PATCH /api/contact/[id] - Mark message as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const roleError = await requireRole(request, ['ADMIN', 'EDITOR'])
    if (roleError) return roleError
    const session = await getServerSession(authOptions)

    const { isRead } = await request.json()
    const { id } = await params

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error updating message:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/contact/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const roleError = await requireRole(request, ['ADMIN', 'EDITOR'])
    if (roleError) return roleError
    const session = await getServerSession(authOptions)

    const { id } = await params

    await prisma.contactMessage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
