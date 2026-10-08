import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSecureApi, validators } from '@/lib/secure-api'

// GET /api/admin/navigation - Get all navigation items
export const GET = createSecureApi(
  async (context) => {
    try {
      const navigationItems = await prisma.navigationItem.findMany({
        orderBy: [
          { order: 'asc' },
          { title: 'asc' }
        ],
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
          }
        },
        where: {
          parentId: null // Only get top-level items, children are included
        }
      })

      return NextResponse.json({ navigation: navigationItems })
    } catch (error) {
      console.error('Navigation API Error:', error)
      return NextResponse.json({ error: 'Navigation data is temporarily unavailable' }, {
        status: 503,
        headers: { 'Cache-Control': 'no-store' }
      })
    }
  },
  { requireAuth: true, requireRole: 'EDITOR' }
)

// POST /api/admin/navigation - Create new navigation item
export const POST = createSecureApi(
  async (context) => {
    const { title, href, parentId, order, isVisible, linkType, target, description, icon, cssClass } = context.body

    // Validate required fields
    validators.string(title, 'title')
    
    // Validate optional fields
    const validatedData = {
      title: validators.string(title, 'title'),
      href: href ? validators.string(href, 'href') : null,
      parentId: parentId ? validators.string(parentId, 'parentId') : null,
      order: order !== undefined ? validators.number(order, 'order') : 0,
      isVisible: isVisible !== undefined ? validators.boolean(isVisible, 'isVisible') : true,
      linkType: linkType ? validators.enum(linkType, 'linkType', ['internal', 'external', 'dropdown']) : 'internal',
      target: target ? validators.enum(target, 'target', ['_self', '_blank']) : '_self',
      description: description ? validators.string(description, 'description') : null,
      icon: icon ? validators.string(icon, 'icon') : null,
      cssClass: cssClass ? validators.string(cssClass, 'cssClass') : null,
    }

    // Validate parent exists if parentId is provided
    if (validatedData.parentId) {
      const parent = await prisma.navigationItem.findUnique({
        where: { id: validatedData.parentId }
      })
      if (!parent) {
        return NextResponse.json({ error: 'Parent navigation item not found' }, { status: 404 })
      }
    }

    const navigationItem = await prisma.navigationItem.create({
      data: validatedData,
      include: {
        children: true,
        parent: true
      }
    })

    return NextResponse.json(navigationItem, { status: 201 })
  },
  { requireAuth: true, requireRole: 'EDITOR' }
)

// PUT /api/admin/navigation - Bulk update navigation order
export const PUT = createSecureApi(
  async (context) => {
    const { items } = context.body

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 })
    }

    // Update all items in a transaction
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.navigationItem.update({
          where: { id: item.id },
          data: {
            order: item.order,
            parentId: item.parentId || null
          }
        })
      )
    )

    // Return updated navigation structure
    const navigationItems = await prisma.navigationItem.findMany({
      orderBy: [
        { order: 'asc' },
        { title: 'asc' }
      ],
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
        }
      },
      where: {
        parentId: null
      }
    })

    return NextResponse.json({ navigation: navigationItems })
  },
  { requireAuth: true, requireRole: 'EDITOR' }
)
