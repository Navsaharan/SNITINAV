import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/placeholders - Get all placeholder configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const placeholders = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'placeholder_'
        }
      }
    })

    return NextResponse.json({ placeholders })
  } catch (error) {
    console.error('Error fetching placeholders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/placeholders - Update a placeholder image
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, imageUrl, imageId } = await request.json()

    if (!key || !imageUrl) {
      return NextResponse.json({ error: 'Key and imageUrl are required' }, { status: 400 })
    }

    // Update or create the placeholder setting
    const placeholder = await prisma.setting.upsert({
      where: {
        key: `placeholder_${key}`
      },
      update: {
        value: JSON.stringify({
          imageUrl,
          imageId,
          updatedAt: new Date().toISOString()
        })
      },
      create: {
        key: `placeholder_${key}`,
        value: JSON.stringify({
          imageUrl,
          imageId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
        type: 'JSON'
      }
    })

    return NextResponse.json({ placeholder })
  } catch (error) {
    console.error('Error updating placeholder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/placeholders - Reset a placeholder to default
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Delete the placeholder setting to reset to default
    await prisma.setting.deleteMany({
      where: {
        key: `placeholder_${key}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting placeholder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
