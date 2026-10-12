import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { encryptCredential, listCredentialMetadata, maskCredential } from '@/lib/api-credentials'
import { prisma } from '@/lib/prisma'
import { recordSessionAudit } from '@/lib/admin-audit'

const schema = z.object({
  provider: z.enum(['sanity']),
  credentials: z.record(z.string().min(1).max(500)).refine((value) => Object.keys(value).length > 0),
})

async function admin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function GET(request: NextRequest) {
  const session = await admin(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ credentials: await listCredentialMetadata() }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: NextRequest) {
  const session = await admin(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = schema.parse(await request.json())
    await prisma.$transaction(Object.entries(body.credentials).map(([key, value]) => prisma.apiCredential.upsert({
      where: { key: `${body.provider}.${key}` },
      update: { encryptedValue: encryptCredential(value), maskedValue: maskCredential(value), provider: body.provider },
      create: { key: `${body.provider}.${key}`, provider: body.provider, encryptedValue: encryptCredential(value), maskedValue: maskCredential(value) },
    })))
    await recordSessionAudit(request, session, 'UPDATE', '/api/settings/api-credentials', { provider: body.provider, keys: Object.keys(body.credentials) })
    return NextResponse.json({ saved: true, credentials: await listCredentialMetadata() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid credential configuration', details: error.errors }, { status: 400 })
    console.error('Could not save API credentials:', error)
    return NextResponse.json({ error: 'Could not save API credentials' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await admin(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const key = request.nextUrl.searchParams.get('key')
  if (!key || !/^sanity\.[a-zA-Z0-9_]+$/.test(key)) return NextResponse.json({ error: 'Invalid credential key' }, { status: 400 })
  await prisma.apiCredential.deleteMany({ where: { key } })
  await recordSessionAudit(request, session, 'DELETE', '/api/settings/api-credentials', { key })
  return NextResponse.json({ deleted: true })
}
