import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sanityStatus } from '@/lib/sanity'
import { storyblokConfig } from '@/lib/storyblok-config'

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = String((session as any)?.user?.role || '').toUpperCase()
  if (!session || !['ADMIN', 'EDITOR'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const storyblok = await storyblokConfig()
  return NextResponse.json({
    puck: { available: true, storage: 'Prisma Page.content' },
    tina: { available: true, storage: 'Prisma Page.content' },
    storyblok: {
      available: storyblok.available,
      missing: storyblok.missing,
      component: storyblok.component,
      htmlField: storyblok.htmlField,
      region: storyblok.region,
    },
    sanity: await sanityStatus(),
    ckeditor: { available: true, licenseConfigured: Boolean(process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY) },
  })
}
