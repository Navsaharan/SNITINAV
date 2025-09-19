import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CACHE_KEYS } from '@/lib/cache'

// GET /api/navigation - Get public navigation items (no auth required)
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = cache.get(CACHE_KEYS.NAVIGATION_ITEMS)
    if (cached) {
      return NextResponse.json({ navigation: cached })
    }

    const navigationItems = await prisma.navigationItem.findMany({
      where: {
        isVisible: true
      },
      orderBy: [
        { order: 'asc' },
        { title: 'asc' }
      ]
    })

    // Build hierarchy
    const itemMap = new Map()
    const rootItems: any[] = []

    // First pass: create map of all items
    navigationItems.forEach((item: any) => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // Second pass: build hierarchy
    navigationItems.forEach((item: any) => {
      const navItem = itemMap.get(item.id)!

      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(navItem)
      } else {
        rootItems.push(navItem)
      }
    })

    // Convert to menu format
    function convertToMenuItems(items: any[]): any[] {
      return items.map(item => ({
        title: item.title,
        href: item.href || undefined,
        children: item.children && item.children.length > 0 
          ? convertToMenuItems(item.children)
          : undefined
      }))
    }

    const menuItems = convertToMenuItems(rootItems)

    // Cache for 5 minutes
    cache.set(CACHE_KEYS.NAVIGATION_ITEMS, menuItems, 300)

    return NextResponse.json({ navigation: menuItems })
  } catch (error) {
    console.error('Public Navigation API Error:', error)

    // Return default navigation structure as fallback
    const defaultNavigation = [
      {
        id: 'nav-home',
        title: 'Home',
        href: '/',
        parentId: null,
        order: 0,
        isVisible: true,
        linkType: 'internal',
        target: '_self',
        children: []
      },
      {
        id: 'nav-about',
        title: 'About Us',
        href: null,
        parentId: null,
        order: 1,
        isVisible: true,
        linkType: 'dropdown',
        target: '_self',
        children: [
          {
            id: 'nav-about-institute',
            title: 'About Institute',
            href: '/about-institute',
            parentId: 'nav-about',
            order: 0,
            isVisible: true,
            linkType: 'internal',
            target: '_self',
            children: []
          }
        ]
      }
    ]

    return NextResponse.json({ navigation: defaultNavigation })
  }
}
