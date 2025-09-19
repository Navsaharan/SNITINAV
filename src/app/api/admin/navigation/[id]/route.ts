import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validators } from '@/lib/secure-api'
import { buildSafeApiRoute, safePrismaOperation } from '@/lib/build-safe-api'

// GET /api/admin/navigation/[id] - Get specific navigation item
export const GET = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id

  const navigationItem = await safePrismaOperation(() =>
    prisma.navigationItem.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: [
            { order: 'asc' },
            { title: 'asc' }
          ],
          include: {
            children: {
              orderBy: [
                { order: 'asc' },
                { title: 'asc' }
              ]
            }
          }
        },
        parent: true
      }
    })
  )

  if (!navigationItem) {
    return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 })
  }

  return NextResponse.json(navigationItem)
})

// PUT /api/admin/navigation/[id] - Update navigation item
export const PUT = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const id = params.id
    const body = await request.json()
    const { title, href, parentId, order, isVisible, linkType, target, description, icon, cssClass } = body

    // Check if navigation item exists
    const existingItem = await safePrismaOperation(() =>
      prisma.navigationItem.findUnique({
        where: { id }
      })
    )

    if (!existingItem) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 })
    }

    // Prepare update data with proper validation
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (href !== undefined) updateData.href = href || null
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (order !== undefined) updateData.order = Number(order)
    if (isVisible !== undefined) updateData.isVisible = Boolean(isVisible)
    if (linkType !== undefined) updateData.linkType = linkType
    if (target !== undefined) updateData.target = target
    if (description !== undefined) updateData.description = description || null
    if (icon !== undefined) updateData.icon = icon || null
    if (cssClass !== undefined) updateData.cssClass = cssClass || null

    // Validate parent exists if parentId is provided and different from current
    if (updateData.parentId && updateData.parentId !== existingItem.parentId) {
      // Prevent circular references
      if (updateData.parentId === id) {
        return NextResponse.json({ error: 'Cannot set item as its own parent' }, { status: 400 })
      }

      const parent = await safePrismaOperation(() =>
        prisma.navigationItem.findUnique({
          where: { id: updateData.parentId }
        })
      )
      if (!parent) {
        return NextResponse.json({ error: 'Parent navigation item not found' }, { status: 404 })
      }

      // Check if the new parent is a descendant of this item (prevent circular reference)
      const descendants = await getDescendants(id)
      if (descendants.includes(updateData.parentId)) {
        return NextResponse.json({ error: 'Cannot move item under its own descendant' }, { status: 400 })
      }
    }

    const navigationItem = await safePrismaOperation(() =>
      prisma.navigationItem.update({
        where: { id },
        data: updateData,
        include: {
          children: {
            orderBy: [
              { order: 'asc' },
              { title: 'asc' }
            ]
          },
          parent: true
        }
      })
    )

    return NextResponse.json(navigationItem)
})

// DELETE /api/admin/navigation/[id] - Delete navigation item
export const DELETE = buildSafeApiRoute(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const id = params.id

    // Check if navigation item exists
    const existingItem = await safePrismaOperation(() =>
      prisma.navigationItem.findUnique({
        where: { id },
        include: {
          children: true
        }
      })
    )

    if (!existingItem) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 })
    }

    // Check if item has children
    if (existingItem.children.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete navigation item with children. Please delete or move children first.'
      }, { status: 400 })
    }

    await safePrismaOperation(() =>
      prisma.navigationItem.delete({
        where: { id }
      })
    )

    return NextResponse.json({ message: 'Navigation item deleted successfully' })
})

// Helper function to get all descendants of a navigation item
async function getDescendants(itemId: string): Promise<string[]> {
  const descendants: string[] = []

  const children = await safePrismaOperation(() =>
    prisma.navigationItem.findMany({
      where: { parentId: itemId },
      select: { id: true }
    })
  )

  if (!children) return descendants

  for (const child of children) {
    descendants.push(child.id)
    const childDescendants = await getDescendants(child.id)
    descendants.push(...childDescendants)
  }

  return descendants
}
