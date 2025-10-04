import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const settings = await prisma.setting.findMany({
      take: 1
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      settingsCount: settings.length
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
