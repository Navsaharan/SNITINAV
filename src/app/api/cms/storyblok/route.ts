import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import StoryblokClient from 'storyblok-js-client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePublicContent } from '@/lib/revalidate-public-content'
import { makeStoryblokPageReference } from '@/lib/page-editor-content'

export const runtime = 'nodejs'

function storyblokClient() {
  const oauthToken = process.env.STORYBLOK_MANAGEMENT_TOKEN
  if (!oauthToken || !process.env.STORYBLOK_SPACE_ID) return null
  return new StoryblokClient({
    oauthToken,
    region: (process.env.STORYBLOK_REGION || 'eu') as 'eu' | 'us' | 'ap' | 'ca' | 'cn',
  })
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session && (session as any).user?.role === 'ADMIN'
}

const saveSchema = z.object({
  pageId: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
  content: z.string().max(1_000_000),
  publish: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = storyblokClient()
  if (!client) {
    return NextResponse.json({ configured: false, error: 'Storyblok server settings are not configured.' }, { status: 503 })
  }
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug || slug.length > 180) return NextResponse.json({ error: 'A valid story slug is required.' }, { status: 400 })
  try {
    const spaceId = process.env.STORYBLOK_SPACE_ID!
    const result = await client.get(`spaces/${spaceId}/stories`, { by_slugs: slug }) as any
    const listedStory = result?.data?.stories?.[0]
    if (!listedStory?.id) return NextResponse.json({ story: null })
    const detail = await client.get(`spaces/${spaceId}/stories/${listedStory.id}`) as any
    const field = process.env.STORYBLOK_PAGE_HTML_FIELD || 'html_content'
    return NextResponse.json({
      storyId: listedStory.id,
      story: {
        title: detail?.data?.story?.name || listedStory.name,
        content: detail?.data?.story?.content?.[field] || '',
      },
    })
  } catch (error) {
    console.error('Storyblok content load failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Unable to load this Storyblok story. Check its slug and server configuration.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = storyblokClient()
  if (!client) return NextResponse.json({ error: 'Configure STORYBLOK_SPACE_ID, STORYBLOK_MANAGEMENT_TOKEN and STORYBLOK_PUBLIC_ACCESS_TOKEN on the server before using Storyblok.' }, { status: 503 })
  if (!process.env.STORYBLOK_PUBLIC_ACCESS_TOKEN) return NextResponse.json({ error: 'Configure STORYBLOK_PUBLIC_ACCESS_TOKEN so the published website can render the Storyblok page.' }, { status: 503 })

  try {
    const body = saveSchema.parse(await request.json())
    if (body.pageId) {
      const page = await prisma.page.findUnique({ where: { id: body.pageId }, select: { id: true } })
      if (!page) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    const spaceId = process.env.STORYBLOK_SPACE_ID!
    const component = process.env.STORYBLOK_PAGE_COMPONENT || 'page'
    const htmlField = process.env.STORYBLOK_PAGE_HTML_FIELD || 'html_content'
    const listing = await client.get(`spaces/${spaceId}/stories`, { by_slugs: body.slug }) as any
    const existing = listing?.data?.stories?.[0]
    const story = {
      ...(existing?.id ? { id: existing.id } : {}),
      name: body.title,
      slug: body.slug,
      content: { component, [htmlField]: body.content },
    }
    const saved = existing?.id
      ? await client.put(`spaces/${spaceId}/stories/${existing.id}`, { story, publish: body.publish }) as any
      : await client.post(`spaces/${spaceId}/stories`, { story, publish: body.publish }) as any
    const storyId = saved?.data?.story?.id || existing?.id
    if (!storyId) throw new Error('Storyblok did not return a story id')

    const reference = makeStoryblokPageReference(body.slug)
    if (body.pageId) {
      await prisma.page.update({ where: { id: body.pageId }, data: { content: reference } })
      revalidatePublicContent(body.slug)
    }
    return NextResponse.json({ ok: true, storyId, reference, published: body.publish })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    console.error('Storyblok save failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Storyblok save failed. Verify the space token and that the configured Storyblok page component has the configured HTML field.' }, { status: 502 })
  }
}
