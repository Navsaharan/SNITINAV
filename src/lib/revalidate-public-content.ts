import { revalidatePath } from 'next/cache'

/** Refresh public content immediately after a CMS mutation. */
export function revalidatePublicContent(slug?: string) {
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/faculty')
  revalidatePath('/sitemap.xml')

  if (slug) {
    revalidatePath(`/${slug}`)
  }
}
