import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/layout/main-layout'
import ContentRenderer from '@/components/content/content-renderer'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import PageSidebar from '@/components/page/page-sidebar'

// Force dynamic rendering for this page to avoid build-time database issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all published pages
export async function generateStaticParams() {
  // During build time, return empty array to avoid database connection issues
  // Pages will be generated on-demand using dynamic rendering
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return []
  }

  try {
    const pages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
      },
    })

    return pages.map((page) => ({
      slug: page.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const page = await prisma.page.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        description: true,
        metaTitle: true,
        metaDesc: true,
      },
    })

    if (!page) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      }
    }

    return {
      title: page.metaTitle || page.title,
      description: page.metaDesc || page.description || '',
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDesc || page.description || '',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: page.metaTitle || page.title,
        description: page.metaDesc || page.description || '',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Page Error',
      description: 'An error occurred while loading the page.',
    }
  }
}

export default async function DynamicPage({ params }: PageProps) {
  try {
    const { slug } = await params
    // Fetch the page with all its content and relationships
    const page = await prisma.page.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
    include: {
      contents: {
        orderBy: { order: 'asc' },
      },
      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      children: {
        where: {
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!page) {
    notFound()
  }

  // Build breadcrumb trail
  const breadcrumbs = []
  if (page.parent) {
    breadcrumbs.push({
      label: page.parent.title,
      href: `/${page.parent.slug}`,
    })
  }
  breadcrumbs.push({
    label: page.title,
    href: `/${page.slug}`,
  })

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{page.title}</h1>
            {page.description && (
              <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>{page.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Page Content */}
              {page.content && (
                <div className="prose prose-lg max-w-none mb-8" style={{ color: 'var(--color-text-primary)' }}>
                  <ContentRenderer content={page.content} />
                </div>
              )}

              {/* Content Blocks */}
              {page.contents.length > 0 && (
                <div className="space-y-8">
                  {page.contents.map((content) => (
                    <div key={content.id} className="content-block">
                      {content.title && (
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                          {content.title}
                        </h2>
                      )}
                      <ContentRenderer 
                        content={content.content || ''} 
                        type={content.type}
                        data={content.data}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PageSidebar childPages={page.children} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
  } catch (error) {
    console.error('Error loading page:', error)
    notFound()
  }
}
