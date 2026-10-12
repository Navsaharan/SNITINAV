import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getSanityPage, sanityStatus, saveSanityPage } from '@/lib/sanity'
import { prisma } from '@/lib/prisma'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { recordSessionAudit } from '@/lib/admin-audit'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session && (session.user as { role?: string }).role === 'ADMIN' ? session : null
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ status: await sanityStatus() })
  try { return NextResponse.json({ story: await getSanityPage(slug) }) }
  catch (error) { console.error('Sanity read failed:', error); return NextResponse.json({ error: 'Could not load Sanity content' }, { status: 502 }) }
}

const saveSchema = z.object({ pageId: z.string().optional(), slug: z.string().min(1).max(180), title: z.string().min(1).max(200), content: z.string().max(1_000_000), publish: z.boolean().default(false) })
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = saveSchema.parse(await request.json())
    const saved = await saveSanityPage(body)
    if (body.pageId) {
      await prisma.page.update({ where: { id: body.pageId }, data: { content: `<!--snitinav-sanity-page:v1-->${encodeURIComponent(body.slug)}` } })
      revalidatePublicContent(body.slug)
    }
    await recordSessionAudit(request, session, 'UPDATE', '/api/cms/sanity', { pageId: body.pageId || null, slug: body.slug, publish: body.publish })
    return NextResponse.json({ ok: true, ...saved, reference: `<!--snitinav-sanity-page:v1-->${encodeURIComponent(body.slug)}` })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    console.error('Sanity save failed:', error)
    return NextResponse.json({ error: 'Sanity save failed. Check the configured project, dataset, token, and schema.' }, { status: 502 })
  }
}
