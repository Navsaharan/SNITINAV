import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/_log - NextAuth internal logging endpoint
export async function POST(request: NextRequest) {
  try {
    const logData = await request.json().catch(() => ({}))
    console.log('NextAuth log:', logData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth log error:', error)
    return NextResponse.json({ success: true })
  }
}

export async function GET() {
  return NextResponse.json({ success: true })
}
