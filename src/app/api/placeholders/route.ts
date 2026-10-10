import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'

// Placeholder assignments are public content used by the site; only image URLs are returned.
export async function GET() {
  try {
    const placeholders = await prisma.setting.findMany({
      where: { key: { startsWith: 'placeholder_' } },
      select: { key: true, value: true },
    })
    return NextResponse.json({ placeholders })
  } catch (error) {
    console.error('Error fetching placeholders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { key, imageUrl, imageId } = await request.json()
    if (typeof key !== 'string' || !/^[a-z0-9_]+$/.test(key) || typeof imageUrl !== 'string' || !imageUrl) {
      return NextResponse.json({ error: 'A valid key and imageUrl are required' }, { status: 400 })
    }
    const timestamp = new Date().toISOString()
    const placeholder = await prisma.setting.upsert({
      where: { key: `placeholder_${key}` },
      update: { value: JSON.stringify({ imageUrl, imageId, updatedAt: timestamp }) },
      create: { key: `placeholder_${key}`, value: JSON.stringify({ imageUrl, imageId, createdAt: timestamp, updatedAt: timestamp }), type: 'JSON' },
    })
    revalidatePublicContent()
    return NextResponse.json({ placeholder })
  } catch (error) {
    console.error('Error updating placeholder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const key = new URL(request.url).searchParams.get('key')
    if (!key || !/^[a-z0-9_]+$/.test(key)) return NextResponse.json({ error: 'A valid key is required' }, { status: 400 })
    await prisma.setting.deleteMany({ where: { key: `placeholder_${key}` } })
    revalidatePublicContent()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting placeholder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
