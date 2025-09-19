'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Search, Filter, Grid, List, Download, Edit, Trash2, Eye } from 'lucide-react'
import MediaUpload from './media-upload'
import Lightbox from '../gallery/lightbox'

interface ImageManagerProps {
  onSelect?: (image: any) => void
  category?: string
  multiple?: boolean
  showUpload?: boolean
}

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  alt?: string
  caption?: string
  category: string
  tags?: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

export default function ImageManager({ 
  onSelect, 
  category = 'all', 
  multiple = false, 
  showUpload = true 
}: ImageManagerProps) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState(category)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'FACULTY', label: 'Faculty' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'EVENTS', label: 'Events' },
    { value: 'GALLERY', label: 'Gallery' },
    { value: 'DOCUMENTS', label: 'Documents' },
    { value: 'CERTIFICATES', label: 'Certificates' },
    { value: 'ACHIEVEMENTS', label: 'Achievements' },
  ]

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: File[], metadata: any) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', metadata.alt)
      formData.append('caption', metadata.caption)
      formData.append('category', metadata.category)
      formData.append('tags', metadata.tags)

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    await fetchMedia()
    setShowUploadModal(false)
  }

  const handleSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      )
    } else {
      if (onSelect) {
        onSelect(file)
      }
    }
  }

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await fetch(`/api/media/${fileId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchMedia()
        }
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  const filteredMedia = media.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.alt && file.alt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (file.tags && file.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory
    const isImage = file.mimeType.startsWith('image/')
    
    return matchesSearch && matchesCategory && isImage
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Image Manager</h2>
          <div className="flex items-center gap-2">
            {showUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </button>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No images found</p>
            {showUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Image
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' : 'space-y-2'}>
            {filteredMedia.map((file, index) => (
              <div
                key={file.id}
                className={`group relative ${
                  viewMode === 'grid' 
                    ? 'aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer' 
                    : 'flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100'
                } ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelect(file)}
              >
                {viewMode === 'grid' ? (
                  <>
                    <img
                      src={file.url}
                      alt={file.alt || file.originalName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openLightbox(index)
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(file.id)
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={file.url}
                      alt={file.alt || file.originalName}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openLightbox(index)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(file.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <MediaUpload
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
          acceptedTypes={['image/*']}
        />
      )}

      {/* Lightbox */}
      {showLightbox && (
        <Lightbox
          images={filteredMedia}
          currentIndex={lightboxIndex}
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          onNext={() => setLightboxIndex(prev => (prev + 1) % filteredMedia.length)}
          onPrevious={() => setLightboxIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length)}
        />
      )}
    </div>
  )
}
