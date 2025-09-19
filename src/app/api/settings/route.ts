import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


const updateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
    type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'COLOR']).optional()
  }))
})

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })

    // Convert to key-value object for easier use
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type
      }
      return acc
    }, {} as Record<string, { value: string; type: string }>)

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings - Update multiple settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Update settings in transaction
    await prisma.$transaction(async (tx) => {
      for (const setting of validatedData.settings) {
        await tx.setting.upsert({
          where: { key: setting.key },
          update: { 
            value: setting.value,
            type: setting.type || 'STRING'
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type || 'STRING'
          }
        })
      }
    })

    // Return updated settings
    const updatedSettings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })

    const settingsObject = updatedSettings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type
      }
      return acc
    }, {} as Record<string, { value: string; type: string }>)

    return NextResponse.json(settingsObject)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
