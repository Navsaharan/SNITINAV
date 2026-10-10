import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [pageCount, contentCount, mediaCount, viewCount] = await Promise.all([
      prisma.page.count(), prisma.content.count(), prisma.media.count(), prisma.pageView.count(),
    ])
    return NextResponse.json({ pageCount, contentCount, mediaCount, viewCount })
  } catch (error) {
    console.error('Could not fetch dashboard stats:', error)
    return NextResponse.json({ error: 'Could not fetch dashboard stats' }, { status: 500 })
  }
}
