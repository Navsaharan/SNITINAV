import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { encryptCredential, listCredentialMetadata, maskCredential } from '@/lib/api-credentials'
import { prisma } from '@/lib/prisma'
import { recordSessionAudit } from '@/lib/admin-audit'
import { requireRole } from '@/lib/security'

const schema = z.object({
  provider: z.enum(['sanity', 'storyblok']),
  credentials: z.record(z.string().min(1).max(500)).refine((value) => Object.keys(value).length > 0),
})

export async function GET(request: NextRequest) {
  const roleError = await requireRole(request, ['ADMIN'])
  if (roleError) return roleError
  const session = await getServerSession(authOptions)
  return NextResponse.json({ credentials: await listCredentialMetadata() }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: NextRequest) {
  const roleError = await requireRole(request, ['ADMIN'])
  if (roleError) return roleError
  const session = await getServerSession(authOptions)
  try {
    const body = schema.parse(await request.json())
    await prisma.$transaction(Object.entries(body.credentials).map(([key, value]) => {
      const normalizedKey = key.toLowerCase()
      return prisma.apiCredential.upsert({
      where: { key: `${body.provider}.${normalizedKey}` },
      update: { encryptedValue: encryptCredential(value), maskedValue: maskCredential(value), provider: body.provider },
      create: { key: `${body.provider}.${normalizedKey}`, provider: body.provider, encryptedValue: encryptCredential(value), maskedValue: maskCredential(value) },
      })
    }))
    await recordSessionAudit(request, session, 'UPDATE', '/api/settings/api-credentials', { provider: body.provider, keys: Object.keys(body.credentials) })
    return NextResponse.json({ saved: true, credentials: await listCredentialMetadata() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid credential configuration', details: error.errors }, { status: 400 })
    console.error('Could not save API credentials:', error)
    return NextResponse.json({ error: 'Could not save API credentials' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const roleError = await requireRole(request, ['ADMIN'])
  if (roleError) return roleError
  const session = await getServerSession(authOptions)
  const key = request.nextUrl.searchParams.get('key')
  if (!key || !/^(sanity|storyblok)\.[a-zA-Z0-9_]+$/.test(key)) return NextResponse.json({ error: 'Invalid credential key' }, { status: 400 })
  await prisma.apiCredential.deleteMany({ where: { key } })
  await recordSessionAudit(request, session, 'DELETE', '/api/settings/api-credentials', { key })
  return NextResponse.json({ deleted: true })
}
