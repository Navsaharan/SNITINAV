import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { apiRouteDefinitions, apiRouteSummary } from '@/lib/api-registry'

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = String((session?.user as { role?: string } | undefined)?.role || '').toUpperCase()
  if (!session || !['ADMIN', 'EDITOR'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    { routes: apiRouteDefinitions, summary: apiRouteSummary, generatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
