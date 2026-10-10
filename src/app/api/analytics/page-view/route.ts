import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public view event: only normalized route paths are stored; no IP address or identity.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const pageSlug = typeof body.pageSlug === 'string' ? body.pageSlug.slice(0, 200) : ''
    if (!pageSlug.startsWith('/') || pageSlug.startsWith('/admin') || pageSlug.startsWith('/api')) {
      return NextResponse.json({ error: 'Invalid page path' }, { status: 400 })
    }
    await prisma.pageView.create({ data: {
      pageSlug,
      userAgent: request.headers.get('user-agent')?.slice(0, 500) || null,
      referer: request.headers.get('referer')?.slice(0, 500) || null,
    } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Could not record page view:', error)
    return NextResponse.json({ error: 'Could not record page view' }, { status: 500 })
  }
}
