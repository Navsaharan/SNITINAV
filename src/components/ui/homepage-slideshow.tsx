'use client'

import { useState, useEffect } from 'react'
import ImageSlideshow from './image-slideshow'

interface SlideshowImage {
  id: string
  url: string
  alt: string
  caption?: string
}

// Default slideshow images
const DEFAULT_IMAGES: SlideshowImage[] = [
  {
    id: 'default-1',
    url: '/images/slideshow1.jpg',
    alt: 'Institute Building',
    caption: 'S.N. Private Industrial Training Institute'
  },
  {
    id: 'default-2',
    url: '/images/slideshow2.jpg',
    alt: 'Workshop Area',
    caption: 'Modern Workshop Facilities'
  },
  {
    id: 'default-3',
    url: '/images/slideshow3.jpg',
    alt: 'Students in Training',
    caption: 'Hands-on Technical Training'
  }
]

export default function HomepageSlideshow() {
  const [images, setImages] = useState<SlideshowImage[]>(DEFAULT_IMAGES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSlideshowImages()
  }, [])

  const fetchSlideshowImages = async () => {
    try {
      const response = await fetch('/api/slideshow')
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      // Only update if we have valid images
      if (Array.isArray(data.images) && data.images.length > 0) {
        setImages(data.images)
      } else {
        console.warn('No slideshow images found, using defaults')
        setImages(DEFAULT_IMAGES)
      }
    } catch (error) {
      console.error('Error fetching slideshow images:', error)
      setError('Failed to load slideshow. Using default images.')
      setImages(DEFAULT_IMAGES)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 md:h-80 lg:h-96 flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-gray-500">Loading slideshow...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
        <ImageSlideshow
          images={images}
          autoPlay={true}
          interval={5000}
          showControls={true}
          showIndicators={true}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
