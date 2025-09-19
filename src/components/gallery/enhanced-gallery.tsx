'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Lightbox from './lightbox'
import { motion, AnimatePresence } from 'framer-motion'

interface GalleryImage {
  id: string
  filename: string
  originalName: string
  url: string
  alt?: string
  caption?: string
  category: string
}

interface EnhancedGalleryProps {
  images: GalleryImage[]
}

const categoryMap = {
  'ALL': 'All Photos',
  'INFRASTRUCTURE': 'Campus',
  'FACULTY': 'Workshops',
  'EVENTS': 'Events',
  'GALLERY': 'Students',
  'GENERAL': 'Facilities',
  'ACHIEVEMENTS': 'Achievements',
  'CERTIFICATES': 'Certificates'
}

export default function EnhancedGallery({ images }: EnhancedGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get unique categories from images
  const availableCategories = useMemo(() => {
    const categories = ['ALL', ...new Set(images.map(img => img.category))]
    return categories.filter(cat => categoryMap[cat as keyof typeof categoryMap])
  }, [images])

  // Filter images by category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return images
    }
    return images.filter(img => img.category === selectedCategory)
  }, [images, selectedCategory])

  const handleCategoryChange = async (category: string) => {
    if (category === selectedCategory) return

    setIsLoading(true)
    setSelectedCategory(category)

    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
  }

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : filteredImages.length - 1)
    }
  }

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage < filteredImages.length - 1 ? selectedImage + 1 : 0)
    }
  }

  return (
    <>
      {/* Category Filter Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-6 py-3 rounded-md transition-all duration-300 font-medium ${
                selectedCategory === category
                  ? 'text-white shadow-lg transform scale-105'
                  : 'hover:opacity-90 hover:transform hover:scale-105'
              }`}
              style={{
                backgroundColor: selectedCategory === category
                  ? 'var(--color-primary)'
                  : 'var(--color-bg-secondary)',
                color: selectedCategory === category
                  ? 'white'
                  : 'var(--color-text-primary)'
              }}
            >
              {categoryMap[category as keyof typeof categoryMap]}
              <span className="ml-2 text-xs opacity-75">
                ({category === 'ALL' ? images.length : images.filter(img => img.category === category).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
        </div>
      )}

      {/* Gallery Grid with Animation */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.alt || image.originalName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                  {/* Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {categoryMap[image.category as keyof typeof categoryMap] || 'General'}
                    </span>
                  </div>
                </div>

                {/* Image Info */}
                {(image.alt || image.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium truncate">
                      {image.alt || image.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Images Message */}
      {!isLoading && filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto h-24 w-24 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Images in {categoryMap[selectedCategory as keyof typeof categoryMap]}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Try selecting a different category or upload images through the admin panel.
          </p>
        </motion.div>
      )}

      {/* Enhanced Lightbox */}
      <Lightbox
        images={filteredImages}
        currentIndex={selectedImage || 0}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrevious={goToPrevious}
      />
    </>
  )
}