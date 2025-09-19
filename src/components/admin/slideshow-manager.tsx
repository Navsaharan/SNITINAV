'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, X, GripVertical, Eye } from 'lucide-react'
import ImageManager from './image-manager'
import ImageSlideshow from '../ui/image-slideshow'

interface SlideshowImage {
  id: string
  url: string
  alt: string
  caption?: string
}

export default function SlideshowManager() {
  const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([])
  const [showImageManager, setShowImageManager] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlideshowImages()
  }, [])

  const fetchSlideshowImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/slideshow')
      if (response.ok) {
        const data = await response.json()
        setSlideshowImages(data.images || [])
      }
    } catch (error) {
      console.error('Error fetching slideshow images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = async (image: any) => {
    const newImage: SlideshowImage = {
      id: image.id,
      url: image.url,
      alt: image.alt || image.originalName,
      caption: image.caption
    }

    const updatedImages = [...slideshowImages, newImage]
    setSlideshowImages(updatedImages)
    await updateSlideshow(updatedImages)
    setShowImageManager(false)
  }

  const removeImage = async (imageId: string) => {
    const updatedImages = slideshowImages.filter(img => img.id !== imageId)
    setSlideshowImages(updatedImages)
    await updateSlideshow(updatedImages)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(slideshowImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSlideshowImages(items)
    await updateSlideshow(items)
  }

  const updateSlideshow = async (images: SlideshowImage[]) => {
    try {
      const imageIds = images.map(img => img.id)
      const response = await fetch('/api/slideshow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds })
      })

      if (!response.ok) {
        throw new Error('Failed to update slideshow')
      }
    } catch (error) {
      console.error('Error updating slideshow:', error)
      alert('Failed to update slideshow')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Homepage Slideshow</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage images displayed in the homepage slideshow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={() => setShowImageManager(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {slideshowImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No slideshow images configured</p>
            <button
              onClick={() => setShowImageManager(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Image
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slideshow">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {slideshowImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center p-4 bg-gray-50 rounded-lg border ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="mr-4 text-gray-400 hover:text-gray-600 cursor-grab"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.alt}
                            </p>
                            {image.caption && (
                              <p className="text-xs text-gray-500 truncate">
                                {image.caption}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeImage(image.id)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Image Manager Modal */}
      {showImageManager && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Slideshow Image</h2>
                <button
                  onClick={() => setShowImageManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ImageManager
                onSelect={handleImageSelect}
                category="gallery"
                multiple={false}
                showUpload={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Slideshow Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ImageSlideshow
                images={slideshowImages}
                autoPlay={true}
                interval={3000}
                showControls={true}
                showIndicators={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
