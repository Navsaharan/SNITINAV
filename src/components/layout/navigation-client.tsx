'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from './header'

interface MenuItem {
  title: string
  href?: string
  children?: MenuItem[]
}

// Fallback navigation items when database is not available
const fallbackNavigation: MenuItem[] = [
  { title: 'Home', href: '/' },
  { title: 'About Us', href: '/about-us' },
  { title: 'Contact', href: '/contact' },
  { title: 'Gallery', href: '/gallery' }
]

export default function NavigationClient() {
  const { data: session } = useSession()
  const [navigation, setNavigation] = useState<MenuItem[]>(fallbackNavigation)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const response = await fetch('/api/navigation', {
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })
        
        if (response.ok) {
          const data = await response.json()
          setNavigation(data.navigation || fallbackNavigation)
        } else {
          console.warn('Failed to fetch navigation, using fallback')
          setNavigation(fallbackNavigation)
        }
      } catch (error) {
        console.error('Error fetching navigation:', error)
        setNavigation(fallbackNavigation)
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [session])

  if (loading) {
    return <div className="h-16 bg-white border-b animate-pulse" />
  }

  return <Header navigation={navigation} />
}
