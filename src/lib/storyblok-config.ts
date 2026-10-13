import { getCredential } from '@/lib/api-credentials'

const REGIONS = ['eu', 'us', 'ap', 'ca', 'cn'] as const
export type StoryblokRegion = (typeof REGIONS)[number]

async function value(key: string) {
  const envValue = process.env[key]?.trim()
  if (envValue) return envValue
  return (await getCredential(`storyblok.${key.toLowerCase()}`))?.trim() || ''
}

export async function storyblokConfig() {
  const spaceId = await value('STORYBLOK_SPACE_ID')
  const managementToken = await value('STORYBLOK_MANAGEMENT_TOKEN')
  const publicAccessToken = await value('STORYBLOK_PUBLIC_ACCESS_TOKEN')
  const configuredRegion = await value('STORYBLOK_REGION')
  const component = (await value('STORYBLOK_PAGE_COMPONENT')) || 'page'
  const htmlField = (await value('STORYBLOK_PAGE_HTML_FIELD')) || 'html_content'
  const region = (REGIONS as readonly string[]).includes(configuredRegion)
    ? configuredRegion as StoryblokRegion
    : 'eu'

  return {
    spaceId,
    managementToken,
    publicAccessToken,
    region,
    component,
    htmlField,
    available: Boolean(spaceId && managementToken && publicAccessToken),
    missing: [
      !spaceId ? 'STORYBLOK_SPACE_ID' : null,
      !managementToken ? 'STORYBLOK_MANAGEMENT_TOKEN' : null,
      !publicAccessToken ? 'STORYBLOK_PUBLIC_ACCESS_TOKEN' : null,
    ].filter((key): key is string => Boolean(key)),
  }
}
