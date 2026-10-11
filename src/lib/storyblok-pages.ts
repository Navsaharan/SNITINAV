import 'server-only'
import StoryblokClient from 'storyblok-js-client'
import { sanitizePageHtml } from '@/lib/sanitize-page-html'

const REGIONS = ['eu', 'us', 'ap', 'ca', 'cn'] as const

export async function getPublishedStoryblokPage(slug: string): Promise<string | null> {
  const accessToken = process.env.STORYBLOK_PUBLIC_ACCESS_TOKEN
  if (!accessToken || !process.env.STORYBLOK_SPACE_ID) return null
  const configuredRegion = process.env.STORYBLOK_REGION || 'eu'
  const region = (REGIONS as readonly string[]).includes(configuredRegion) ? configuredRegion as typeof REGIONS[number] : 'eu'
  const client = new StoryblokClient({ accessToken, region })
  const response = await client.get(`cdn/stories/${slug}`, { version: 'published' }) as any
  const field = process.env.STORYBLOK_PAGE_HTML_FIELD || 'html_content'
  const value = response?.data?.story?.content?.[field]
  return typeof value === 'string' ? sanitizePageHtml(value) : null
}
