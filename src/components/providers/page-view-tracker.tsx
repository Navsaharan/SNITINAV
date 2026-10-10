'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageViewTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return
    const pageSlug = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    void fetch('/api/analytics/page-view', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSlug }), keepalive: true,
    }).catch((error) => console.warn('Page view tracking failed:', error))
  }, [pathname])
  return null
}
