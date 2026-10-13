import 'server-only'
import StoryblokClient from 'storyblok-js-client'
import { sanitizePageHtml } from '@/lib/sanitize-page-html'
import { storyblokConfig } from '@/lib/storyblok-config'

export async function getPublishedStoryblokPage(slug: string): Promise<string | null> {
  const config = await storyblokConfig()
  if (!config.publicAccessToken || !config.spaceId) return null
  const client = new StoryblokClient({ accessToken: config.publicAccessToken, region: config.region })
  const response = await client.get(`cdn/stories/${slug}`, { version: 'published' }) as any
  const value = response?.data?.story?.content?.[config.htmlField]
  return typeof value === 'string' ? sanitizePageHtml(value) : null
}
