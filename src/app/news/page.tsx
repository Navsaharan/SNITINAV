import { Metadata } from 'next'
import MainLayout from '@/components/layout/main-layout'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'News & Announcements - S.N. Pvt. Industrial Training Institute',
  description: 'Stay updated with the latest news, announcements, and events from S.N. Pvt. Industrial Training Institute.',
  openGraph: {
    title: 'News & Announcements - S.N. Pvt. Industrial Training Institute',
    description: 'Stay updated with the latest news, announcements, and events from S.N. Pvt. Industrial Training Institute.',
    type: 'website',
  },
}

export default async function NewsPage() {
  // For now, we'll use static content. In the future, this can be connected to a news/announcements system
  const breadcrumbs = [
    {
      label: 'News & Announcements',
      href: '/news',
    },
  ]

  const newsItems = [
    {
      id: 1,
      title: 'Admission Open for Session 2024-25',
      date: '2024-06-15',
      category: 'Admission',
      excerpt: 'Applications are now open for various trade courses for the academic session 2024-25. Limited seats available.',
      content: 'We are pleased to announce that admissions are now open for the academic session 2024-25. We offer various trade courses including Electrician, Fitter, Welder, Computer Operator, and more. Interested candidates can apply online or visit our campus for more information.',
      urgent: true
    },
    {
      id: 2,
      title: 'New Workshop Equipment Installation',
      date: '2024-06-10',
      category: 'Infrastructure',
      excerpt: 'Latest machinery and equipment installed in our workshops to enhance practical training.',
      content: 'We have recently installed state-of-the-art machinery and equipment in our workshops to provide students with hands-on experience using modern tools and technology.',
      urgent: false
    },
    {
      id: 3,
      title: 'Placement Drive Scheduled',
      date: '2024-06-05',
      category: 'Placement',
      excerpt: 'Major companies will be visiting our campus for recruitment of final year students.',
      content: 'We are organizing a placement drive where several reputed companies will visit our campus to recruit talented students. This is a great opportunity for our final year students.',
      urgent: false
    },
    {
      id: 4,
      title: 'Annual Sports Meet 2024',
      date: '2024-05-28',
      category: 'Events',
      excerpt: 'Annual sports meet will be held on campus with various indoor and outdoor games.',
      content: 'Our annual sports meet will feature various sports activities including cricket, football, badminton, and athletics. All students are encouraged to participate.',
      urgent: false
    }
  ]

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              News & Announcements
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Stay updated with the latest news, announcements, and events from our institute.
            </p>
          </div>

          {/* Important Announcements */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Important Announcements
            </h2>
            <div className="space-y-4">
              {newsItems.filter(item => item.urgent).map((item) => (
                <div 
                  key={item.id}
                  className="p-6 rounded-lg border-l-4 shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderLeftColor: 'var(--color-accent)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded"
                          style={{ 
                            backgroundColor: 'var(--color-accent)',
                            color: 'white'
                          }}
                        >
                          {item.category}
                        </span>
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded"
                          style={{ 
                            backgroundColor: 'var(--color-error)',
                            color: 'white'
                          }}
                        >
                          URGENT
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </h3>
                      <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.content}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Published: {new Date(item.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent News */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Recent News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.filter(item => !item.urgent).map((item) => (
                <article 
                  key={item.id}
                  className="rounded-lg shadow-sm border overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{ 
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(item.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.excerpt}
                    </p>
                    <button 
                      className="text-sm font-medium hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Read More →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/admissions"
                className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Admissions
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Apply for courses
                </p>
              </Link>

              <Link 
                href="/fee-structure"
                className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Fee Structure
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Course fees
                </p>
              </Link>

              <Link 
                href="/contact"
                className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-2xl mb-2">📞</div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Contact Us
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Get in touch
                </p>
              </Link>

              <Link 
                href="/facilities"
                className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Facilities
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Our infrastructure
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
