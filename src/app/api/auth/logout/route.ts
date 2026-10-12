import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { endAdminSession, getDeviceMetadata } from '@/lib/admin-audit'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionId = (session as any)?.user?.sessionId
  if (sessionId) {
    await endAdminSession(sessionId, getDeviceMetadata(request), 'logout')
  }
  return NextResponse.json({ success: true })
}
