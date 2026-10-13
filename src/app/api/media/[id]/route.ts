import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { recordSessionAudit } from '@/lib/admin-audit'

function storageAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null
}
async function requireAdmin() { const session = await getServerSession(authOptions); return session && String((session.user as { role?: string }).role || '').toUpperCase() === 'ADMIN' ? session : null }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { const { id } = await params; const media = await prisma.media.findUnique({ where: { id }, include: { createdBy: { select: { id: true, name: true, email: true } } } }); if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 }); return NextResponse.json(media) } catch (error) { console.error('Error fetching media:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { const { id } = await params; const body = await request.json(); const existing = await prisma.media.findUnique({ where: { id } }); if (!existing) return NextResponse.json({ error: 'Media not found' }, { status: 404 }); const media = await prisma.media.update({ where: { id }, data: { alt: typeof body.alt === 'string' ? body.alt : '', caption: typeof body.caption === 'string' ? body.caption : '', ...(body.isPublic !== undefined && existing.mimeType.startsWith('image/') ? { isPublic: Boolean(body.isPublic) } : {}) }, include: { createdBy: { select: { id: true, name: true, email: true } } } }); await recordSessionAudit(request, session, 'UPDATE', `/api/media/${id}`, { mediaId: id }); return NextResponse.json(media) } catch (error) { console.error('Error updating media:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params; const existing = await prisma.media.findUnique({ where: { id } }); if (!existing) return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    if (existing.url.startsWith('storage://')) { const reference = existing.url.slice('storage://'.length); const separator = reference.indexOf('/'); const client = storageAdmin(); if (client && separator > 0) await client.storage.from(reference.slice(0, separator)).remove([reference.slice(separator + 1)]) }
    else { const filepath = join(process.cwd(), 'public', 'uploads', existing.filename); if (existsSync(filepath)) await unlink(filepath).catch(() => undefined) }
    await prisma.media.delete({ where: { id } }); revalidatePublicContent(); await recordSessionAudit(request, session, 'DELETE', `/api/media/${id}`, { mediaId: id, filename: existing.filename }); return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) { console.error('Error deleting media:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
