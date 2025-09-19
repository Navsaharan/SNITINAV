'use client'

import { useEffect, ReactNode, useState } from 'react'
import { loadAndApplyColors } from '@/lib/color-system'

interface ColorProviderProps {
  children: ReactNode
}

export default function ColorProvider({ children }: ColorProviderProps) {
  const [colorsLoaded, setColorsLoaded] = useState(false)

  useEffect(() => {
    // Load and apply colors when the app starts
    const loadColors = async () => {
      try {
        await loadAndApplyColors()
        setColorsLoaded(true)
        console.log('Colors loaded and applied successfully')
      } catch (error) {
        console.error('Error loading colors:', error)
        setColorsLoaded(true) // Still render even if colors fail to load
      }
    }

    loadColors()

    // Listen for color update events
    const handleColorUpdate = () => {
      console.log('Color update event received, reloading colors...')
      loadColors()
    }

    window.addEventListener('colorUpdate', handleColorUpdate)

    return () => {
      window.removeEventListener('colorUpdate', handleColorUpdate)
    }
  }, [])

  // Add a small delay to ensure colors are applied before rendering
  if (!colorsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
