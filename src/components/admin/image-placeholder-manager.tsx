'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, User, Building, Award, Calendar } from 'lucide-react'
import ImageManager from './image-manager'

interface PlaceholderImage {
  id: string
  key: string
  title: string
  description: string
  category: string
  currentImage?: string
  defaultImage: string
  dimensions: string
}

export default function ImagePlaceholderManager() {
  const [placeholders, setPlaceholders] = useState<PlaceholderImage[]>([])
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<PlaceholderImage | null>(null)
  const [showImageManager, setShowImageManager] = useState(false)

  useEffect(() => {
    loadPlaceholders()
  }, [])

  const loadPlaceholders = async () => {
    try {
      const response = await fetch('/api/placeholders')
      const data = await response.json()
      const savedPlaceholders = data.placeholders || []

      // Initialize placeholder images
      const defaultPlaceholders: PlaceholderImage[] = [
      {
        id: '1',
        key: 'faculty_principal',
        title: 'Principal Photo',
        description: 'Photo of the institute principal',
        category: 'FACULTY',
        defaultImage: '/api/placeholder-image?width=300&height=400&text=Principal&bg=%23dbeafe&color=%231e40af',
        dimensions: '300x400'
      },
      {
        id: '2',
        key: 'faculty_instructor_1',
        title: 'Senior Instructor',
        description: 'Photo of senior instructor',
        category: 'FACULTY',
        defaultImage: '/api/placeholder-image?width=300&height=400&text=Instructor&bg=%23dcfce7&color=%23166534',
        dimensions: '300x400'
      },
      {
        id: '3',
        key: 'infrastructure_main_building',
        title: 'Main Building',
        description: 'Main institute building exterior',
        category: 'INFRASTRUCTURE',
        defaultImage: '/api/placeholder-image?width=800&height=600&text=Main%20Building&bg=%23fef3c7&color=%2392400e',
        dimensions: '800x600'
      },
      {
        id: '4',
        key: 'infrastructure_workshop',
        title: 'Workshop Area',
        description: 'Electrician workshop and training area',
        category: 'INFRASTRUCTURE',
        defaultImage: '/api/placeholder-image?width=800&height=600&text=Workshop&bg=%23fce7f3&color=%239d174d',
        dimensions: '800x600'
      },
      {
        id: '5',
        key: 'infrastructure_computer_lab',
        title: 'Computer Lab',
        description: 'Computer lab with modern equipment',
        category: 'INFRASTRUCTURE',
        defaultImage: '/api/placeholder-image?width=800&height=600&text=Computer%20Lab&bg=%23e0e7ff&color=%233730a3',
        dimensions: '800x600'
      },
      {
        id: '6',
        key: 'infrastructure_library',
        title: 'Library',
        description: 'Institute library with books and study area',
        category: 'INFRASTRUCTURE',
        defaultImage: '/api/placeholder-image?width=800&height=600&text=Library&bg=%23f0fdf4&color=%2315803d',
        dimensions: '800x600'
      },
      {
        id: '7',
        key: 'events_annual_function',
        title: 'Annual Function',
        description: 'Annual function and cultural events',
        category: 'EVENTS',
        defaultImage: '/api/placeholder-image?width=800&height=600&text=Annual%20Function&bg=%23fef7cd&color=%2378350f',
        dimensions: '800x600'
      },
      {
        id: '8',
        key: 'achievements_certificates',
        title: 'Achievement Certificates',
        description: 'Student achievement certificates and awards',
        category: 'ACHIEVEMENTS',
        defaultImage: '/api/placeholder-image?width=600&height=400&text=Certificates&bg=%23fdf2f8&color=%239f1239',
        dimensions: '600x400'
      }
    ]

    // Merge with saved placeholders
    const mergedPlaceholders = defaultPlaceholders.map(placeholder => {
      const saved = savedPlaceholders.find((s: any) => s.key === `placeholder_${placeholder.key}`)
      if (saved) {
        try {
          const savedData = JSON.parse(saved.value)
          return { ...placeholder, currentImage: savedData.imageUrl }
        } catch (error) {
          console.error('Error parsing saved placeholder:', error)
        }
      }
      return placeholder
    })

    setPlaceholders(mergedPlaceholders)
    } catch (error) {
      console.error('Error loading placeholders:', error)
      // Fallback to default placeholders if loading fails
      setPlaceholders(defaultPlaceholders)
    }
  }

  const handleImageSelect = async (image: any) => {
    if (!selectedPlaceholder) return

    try {
      // Update the placeholder with the selected image
      const response = await fetch('/api/placeholders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: selectedPlaceholder.key,
          imageUrl: image.url,
          imageId: image.id
        })
      })

      if (response.ok) {
        // Update local state
        setPlaceholders(prev => prev.map(p => 
          p.id === selectedPlaceholder.id 
            ? { ...p, currentImage: image.url }
            : p
        ))
        
        setShowImageManager(false)
        setSelectedPlaceholder(null)
      }
    } catch (error) {
      console.error('Error updating placeholder:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FACULTY':
        return <User className="h-5 w-5" />
      case 'INFRASTRUCTURE':
        return <Building className="h-5 w-5" />
      case 'EVENTS':
        return <Calendar className="h-5 w-5" />
      case 'ACHIEVEMENTS':
        return <Award className="h-5 w-5" />
      default:
        return <ImageIcon className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800'
      case 'INFRASTRUCTURE':
        return 'bg-green-100 text-green-800'
      case 'EVENTS':
        return 'bg-purple-100 text-purple-800'
      case 'ACHIEVEMENTS':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedPlaceholders = placeholders.reduce((acc, placeholder) => {
    if (!acc[placeholder.category]) {
      acc[placeholder.category] = []
    }
    acc[placeholder.category].push(placeholder)
    return acc
  }, {} as Record<string, PlaceholderImage[]>)

  if (showImageManager) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Image</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose an image for: {selectedPlaceholder?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImageManager(false)
                  setSelectedPlaceholder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <ImageManager
              onSelect={handleImageSelect}
              category={selectedPlaceholder?.category.toLowerCase()}
              multiple={false}
              showUpload={true}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Image Placeholder Manager</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage and replace placeholder images throughout the website
        </p>
      </div>

      <div className="p-6">
        {Object.entries(groupedPlaceholders).map(([category, items]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
                {category}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">{category.toLowerCase().replace('_', ' ')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((placeholder) => (
                <div key={placeholder.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={placeholder.currentImage || placeholder.defaultImage}
                      alt={placeholder.title}
                      className="w-full h-full object-cover"
                    />
                    {!placeholder.currentImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Placeholder</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{placeholder.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{placeholder.description}</p>
                    <p className="text-xs text-gray-500 mb-3">Dimensions: {placeholder.dimensions}</p>
                    
                    <button
                      onClick={() => {
                        setSelectedPlaceholder(placeholder)
                        setShowImageManager(true)
                      }}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {placeholder.currentImage ? 'Replace Image' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
