import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session as any).user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const storyblokRequirements = [
    ['STORYBLOK_SPACE_ID', process.env.STORYBLOK_SPACE_ID],
    ['STORYBLOK_MANAGEMENT_TOKEN', process.env.STORYBLOK_MANAGEMENT_TOKEN],
    ['STORYBLOK_PUBLIC_ACCESS_TOKEN', process.env.STORYBLOK_PUBLIC_ACCESS_TOKEN],
  ] as const
  return NextResponse.json({
    puck: { available: true, storage: 'Prisma Page.content' },
    tina: { available: true, storage: 'Prisma Page.content' },
    storyblok: {
      available: storyblokRequirements.every(([, value]) => Boolean(value)),
      missing: storyblokRequirements.filter(([, value]) => !value).map(([key]) => key),
      component: process.env.STORYBLOK_PAGE_COMPONENT || 'page',
      htmlField: process.env.STORYBLOK_PAGE_HTML_FIELD || 'html_content',
      region: process.env.STORYBLOK_REGION || 'eu',
    },
    ckeditor: { available: true, licenseConfigured: Boolean(process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY) },
  })
}
