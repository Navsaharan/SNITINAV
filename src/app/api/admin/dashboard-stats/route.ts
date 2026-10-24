import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/security'

export async function GET(request: NextRequest) {
  const roleError = await requireRole(request, ['ADMIN', 'EDITOR'])
  if (roleError) return roleError
  const session = await getServerSession(authOptions)
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
