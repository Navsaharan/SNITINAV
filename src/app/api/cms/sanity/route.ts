import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { deleteSanityPage, getSanityPage, sanityStatus, saveSanityPage, unpublishSanityPage } from '@/lib/sanity'
import { prisma } from '@/lib/prisma'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { recordSessionAudit } from '@/lib/admin-audit'

export const runtime = 'nodejs'
const noStore = { 'Cache-Control': 'no-store' }

async function requireEditor() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role?.toUpperCase()
  return session && (role === 'ADMIN' || role === 'EDITOR') ? session : null
}

export async function GET(request: NextRequest) {
  const session = await requireEditor()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ status: await sanityStatus() }, { headers: noStore })
  try {
    return NextResponse.json({ story: await getSanityPage(slug, { includeDraft: true }) }, { headers: noStore })
  } catch (error) {
    console.error('Sanity read failed:', error)
    return NextResponse.json({ error: 'Could not load Sanity content' }, { status: 502, headers: noStore })
  }
}

const saveSchema = z.object({
  action: z.enum(['save', 'publish', 'unpublish', 'delete']).default('save'),
  pageId: z.string().optional(),
  slug: z.string().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(1_000_000).optional(),
})

export async function POST(request: NextRequest) {
  const session = await requireEditor()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  try {
    const body = saveSchema.parse(await request.json())
    if (body.action !== 'delete' && (!body.title || body.content === undefined)) {
      return NextResponse.json({ error: 'Title and content are required for save/publish operations.' }, { status: 400, headers: noStore })
    }
    if (body.pageId) {
      const page = await prisma.page.findUnique({ where: { id: body.pageId }, select: { id: true } })
      if (!page) return NextResponse.json({ error: 'Page not found.' }, { status: 404, headers: noStore })
    }

    let result: Record<string, unknown>
    if (body.action === 'delete') {
      result = await deleteSanityPage(body)
    } else if (body.action === 'unpublish') {
      result = await unpublishSanityPage(body)
    } else {
      result = await saveSanityPage({ pageId: body.pageId, slug: body.slug, title: body.title!, content: body.content!, publish: body.action === 'publish' })
    }

    if (body.pageId && body.action !== 'delete') {
      const reference = `<!--snitinav-sanity-page:v1-->${encodeURIComponent(body.slug)}`
      await prisma.page.update({ where: { id: body.pageId }, data: { content: reference } })
      revalidatePublicContent(body.slug)
    }
    await recordSessionAudit(request, session, body.action === 'delete' ? 'DELETE' : 'UPDATE', '/api/cms/sanity', {
      pageId: body.pageId || null, slug: body.slug, action: body.action,
    })
    return NextResponse.json({ ok: true, ...result, reference: body.action === 'delete' ? null : `<!--snitinav-sanity-page:v1-->${encodeURIComponent(body.slug)}` }, { headers: noStore })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400, headers: noStore })
    console.error('Sanity operation failed:', error)
    return NextResponse.json({ error: 'Sanity operation failed. Check the configured project, dataset, token, and schema.' }, { status: 502, headers: noStore })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireEditor()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  const slug = request.nextUrl.searchParams.get('slug')
  const pageId = request.nextUrl.searchParams.get('pageId') || undefined
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400, headers: noStore })
  try {
    const result = await deleteSanityPage({ pageId, slug })
    if (pageId) {
      await prisma.page.update({ where: { id: pageId }, data: { content: '' } })
      revalidatePublicContent(slug)
    }
    await recordSessionAudit(request, session, 'DELETE', '/api/cms/sanity', { pageId: pageId || null, slug, action: 'delete' })
    return NextResponse.json({ ok: true, ...result }, { headers: noStore })
  } catch (error) {
    console.error('Sanity delete failed:', error)
    return NextResponse.json({ error: 'Sanity delete failed.' }, { status: 502, headers: noStore })
  }
}
