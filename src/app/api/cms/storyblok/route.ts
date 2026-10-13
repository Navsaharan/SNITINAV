import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import StoryblokClient from 'storyblok-js-client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { makeStoryblokPageReference } from '@/lib/page-editor-content'
import { recordSessionAudit } from '@/lib/admin-audit'
import { storyblokConfig } from '@/lib/storyblok-config'

export const runtime = 'nodejs'

async function requireEditor() {
  const session = await getServerSession(authOptions)
  const role = String((session as any)?.user?.role || '').toUpperCase()
  return session && (role === 'ADMIN' || role === 'EDITOR') ? session : null
}

const saveSchema = z.object({
  pageId: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
  content: z.string().max(1_000_000),
  publish: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  if (!(await requireEditor())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const config = await storyblokConfig()
  if (!config.spaceId || !config.managementToken) {
    return NextResponse.json({ configured: false, missing: config.missing, error: 'Storyblok server settings are not configured.' }, { status: 503 })
  }
  const client = new StoryblokClient({ oauthToken: config.managementToken, region: config.region })
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug || slug.length > 180) return NextResponse.json({ error: 'A valid story slug is required.' }, { status: 400 })
  try {
    const result = await client.get(`spaces/${config.spaceId}/stories`, { by_slugs: slug }) as any
    const listedStory = result?.data?.stories?.[0]
    if (!listedStory?.id) return NextResponse.json({ story: null })
    const detail = await client.get(`spaces/${config.spaceId}/stories/${listedStory.id}`) as any
    return NextResponse.json({
      storyId: listedStory.id,
      story: {
        title: detail?.data?.story?.name || listedStory.name,
        content: detail?.data?.story?.content?.[config.htmlField] || '',
      },
    })
  } catch (error) {
    console.error('Storyblok content load failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Unable to load this Storyblok story. Check its slug and server configuration.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireEditor()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const config = await storyblokConfig()
  if (!config.spaceId || !config.managementToken) return NextResponse.json({ error: `Configure ${config.missing.join(', ')} before using Storyblok.` }, { status: 503 })
  if (!config.publicAccessToken) return NextResponse.json({ error: 'Configure STORYBLOK_PUBLIC_ACCESS_TOKEN so the published website can render the Storyblok page.' }, { status: 503 })
  const client = new StoryblokClient({ oauthToken: config.managementToken, region: config.region })

  try {
    const body = saveSchema.parse(await request.json())
    if (body.pageId) {
      const page = await prisma.page.findUnique({ where: { id: body.pageId }, select: { id: true } })
      if (!page) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    const listing = await client.get(`spaces/${config.spaceId}/stories`, { by_slugs: body.slug }) as any
    const existing = listing?.data?.stories?.[0]
    const story = {
      ...(existing?.id ? { id: existing.id } : {}),
      name: body.title,
      slug: body.slug,
      content: { component: config.component, [config.htmlField]: body.content },
    }
    const saved = existing?.id
      ? await client.put(`spaces/${config.spaceId}/stories/${existing.id}`, { story, publish: body.publish }) as any
      : await client.post(`spaces/${config.spaceId}/stories`, { story, publish: body.publish }) as any
    const storyId = saved?.data?.story?.id || existing?.id
    if (!storyId) throw new Error('Storyblok did not return a story id')

    const reference = makeStoryblokPageReference(body.slug)
    if (body.pageId) {
      await prisma.page.update({ where: { id: body.pageId }, data: { content: reference } })
      revalidatePublicContent(body.slug)
    }
    await recordSessionAudit(request, session, existing?.id ? 'UPDATE' : 'CREATE', '/api/cms/storyblok', {
      pageId: body.pageId || null,
      slug: body.slug,
      storyId,
      publish: body.publish,
    })
    return NextResponse.json({ ok: true, storyId, reference, published: body.publish })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    console.error('Storyblok save failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Storyblok save failed. Verify the space token and that the configured Storyblok page component has the configured HTML field.' }, { status: 502 })
  }
}
