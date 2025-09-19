import { Suspense } from 'react'
import NavigationClient from './navigation-client'

// Force dynamic rendering to avoid build-time database issues
export const dynamic = 'force-dynamic'

export default function NavigationProvider() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b animate-pulse" />}>
      <NavigationClient />
    </Suspense>
  )
}

