'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import MediaUpload from '@/components/admin/media-upload'
import { Plus, Search, Trash2, Download, Eye, Grid, List } from 'lucide-react'
import Image from 'next/image'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string
  caption?: string
  createdAt: string
  createdBy: {
    name?: string
    email: string
  }
}

export default function MediaManagement() {
  const { data: session, status } = useSession()
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'other'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'GENERAL', label: 'General' },
    { value: 'FACULTY', label: 'Faculty' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'EVENTS', label: 'Events' },
    { value: 'GALLERY', label: 'Gallery' },
    { value: 'DOCUMENTS', label: 'Documents' },
    { value: 'CERTIFICATES', label: 'Certificates' },
    { value: 'ACHIEVEMENTS', label: 'Achievements' },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/admin/login')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchMedia()
    }
  }, [session])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media')
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMedia(data.media || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: File[], metadata: { category: string; tags: string; alt: string; caption: string }) => {
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
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Refresh media list
    await fetchMedia()
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete file')
      }

      setMedia(prev => prev.filter(m => m.id !== mediaId))
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(mediaId)
        return newSet
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredMedia = media
    .filter(file => {
      // Search filter
      const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.caption?.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      let matchesType = true
      if (filterType === 'images') {
        matchesType = file.mimeType.startsWith('image/')
      } else if (filterType === 'documents') {
        matchesType = file.mimeType.includes('pdf') || file.mimeType.includes('document') || file.mimeType.includes('text')
      } else if (filterType === 'other') {
        matchesType = !file.mimeType.startsWith('image/') &&
          !file.mimeType.includes('pdf') &&
          !file.mimeType.includes('document') &&
          !file.mimeType.includes('text')
      }

      // Category filter
      const matchesCategory = filterCategory === 'all' || (file as any).category === filterCategory

      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === 'name') {
        comparison = a.originalName.localeCompare(b.originalName)
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'size') {
        comparison = a.size - b.size
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-600">Manage your images, documents, and other files</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Files
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="other">Other</option>
              </select>

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

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setSortBy(sort as any)
                  setSortOrder(order as any)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
              </select>

              {selectedFiles.size > 0 && (
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                  {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
            <span>
              Showing {filteredMedia.length} of {media.length} files
            </span>
            <span>
              Total size: {formatFileSize(media.reduce((total, file) => total + file.size, 0))}
            </span>
          </div>
        </div>

        {/* Media Grid/List */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first file.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Files
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                className={`relative group bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                  selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {file.mimeType.startsWith('image/') ? (
                    <Image
                      src={file.url}
                      alt={file.alt || file.originalName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-xs font-medium mb-1">
                        {file.mimeType.split('/')[1]?.toUpperCase()}
                      </div>
                      <div className="text-xs">{formatFileSize(file.size)}</div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-white rounded shadow hover:bg-gray-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-3 w-3 text-gray-600" />
                    </a>
                    <a
                      href={file.url}
                      download={file.originalName}
                      className="p-1 bg-white rounded shadow hover:bg-gray-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-3 w-3 text-gray-600" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(file.id)
                      }}
                      className="p-1 bg-white rounded shadow hover:bg-gray-50"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedia.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          {file.mimeType.startsWith('image/') && (
                            <Image
                              src={file.url}
                              alt={file.alt || file.originalName}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.originalName}
                            </div>
                            {file.alt && (
                              <div className="text-sm text-gray-500">{file.alt}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.mimeType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={file.url}
                          download={file.originalName}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <MediaUpload
            onUpload={handleUpload}
            onClose={() => setShowUpload(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
