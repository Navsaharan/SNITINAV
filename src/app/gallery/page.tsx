import { Metadata } from 'next'
import MainLayout from '@/components/layout/main-layout'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { prisma } from '@/lib/prisma'
import EnhancedGallery from '@/components/gallery/enhanced-gallery'

// Force dynamic rendering to avoid build-time database issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Photo Gallery - S.N. Pvt. Industrial Training Institute',
  description: 'Explore our campus, facilities, workshops, and student activities through our photo gallery.',
  openGraph: {
    title: 'Photo Gallery - S.N. Pvt. Industrial Training Institute',
    description: 'Explore our campus, facilities, workshops, and student activities through our photo gallery.',
    type: 'website',
  },
}

export default async function GalleryPage() {
  // Fetch gallery images from media with categories
  let galleryImages = []

  try {
    galleryImages = await prisma.media.findMany({
      where: {
        mimeType: {
          startsWith: 'image/',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Increased limit for better gallery experience
    })
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    // Return empty array if database is not available during build
    galleryImages = []
  }

  const breadcrumbs = [
    {
      label: 'Gallery',
      href: '/gallery',
    },
  ]

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Photo Gallery</h1>
            <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Explore our campus, state-of-the-art facilities, workshops, and vibrant student life through our comprehensive photo gallery.
            </p>
          </div>

          {/* Enhanced Gallery with Categories */}
          {galleryImages.length > 0 ? (
            <EnhancedGallery images={galleryImages.map(img => ({
              ...img,
              alt: img.alt || undefined,
              caption: img.caption || undefined,
              category: img.category || 'GENERAL'
            }))} />
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No Images Available</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Gallery images will be displayed here once they are uploaded through the admin panel.
              </p>
            </div>
          )}

          {/* Gallery Stats */}
          <div className="mt-12 rounded-lg p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{galleryImages.length}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Photos</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>15+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Workshop Areas</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>500+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>10+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Trade Courses</div>
              </div>
            </div>
          </div>

          {/* About Our Facilities */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>About Our Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Modern Workshops</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  State-of-the-art workshops equipped with latest tools and machinery for hands-on training.
                </p>
              </div>
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Computer Lab</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Well-equipped computer laboratory with modern systems for digital learning.
                </p>
              </div>
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Library</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Comprehensive library with technical books, journals, and reference materials.
                </p>
              </div>
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Sports Facilities</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Sports ground and facilities for physical fitness and recreational activities.
                </p>
              </div>
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Hostel Accommodation</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Comfortable hostel facilities for outstation students with all basic amenities.
                </p>
              </div>
              <div
                className="p-6 rounded-lg shadow-sm border"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Placement Cell</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Dedicated placement cell to help students secure employment opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
