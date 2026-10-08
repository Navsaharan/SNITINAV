import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/settings/public - Get public settings without authentication
export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })

    // Convert to key-value object for easier use
    const settingsObject = settings.reduce((acc: Record<string, { value: string; type: string }>, setting: { key: string; value: string; type: string }) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type
      }
      return acc
    }, {})

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
