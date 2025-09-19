'use client'

import Link from 'next/link'

interface ChildPage {
  id: string
  title: string
  slug: string
  description?: string | null
}

interface PageSidebarProps {
  childPages: ChildPage[]
}

export default function PageSidebar({ childPages }: PageSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Child Pages Navigation */}
      {childPages.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Related Pages
          </h3>
          <nav className="space-y-2">
            {childPages.map((child) => (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="block p-3 rounded-md transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{child.title}</div>
                {child.description && (
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {child.description}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Quick Links */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Quick Links
        </h3>
        <nav className="space-y-2">
          <Link
            href="/contact"
            className="block font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Contact Us
          </Link>
          <Link
            href="/admission-criteria"
            className="block font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Admission Information
          </Link>
          <Link
            href="/fee-structure"
            className="block font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Fee Structure
          </Link>
          <Link
            href="/gallery"
            className="block font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Photo Gallery
          </Link>
        </nav>
      </div>

      {/* Contact Info */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Contact Information
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Address:</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              D-117, Kaka Colony, Gandhi Vidhya Mandir,<br />
              Teh.-Sardar Shahar, Dist. Churu
            </div>
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Phone:</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>01564-275628</div>
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Mobile:</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>9414947801</div>
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Email:</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>snitcsrdr@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}
