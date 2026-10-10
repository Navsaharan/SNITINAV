'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, User, Building, Award, Calendar, RotateCcw } from 'lucide-react'
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

const DEFAULT_PLACEHOLDERS: PlaceholderImage[] = [
  { id: '1', key: 'faculty_principal', title: 'Principal Photo', description: 'Photo of the institute principal', category: 'FACULTY', defaultImage: '/api/placeholder-image?width=300&height=400&text=Principal&bg=%23dbeafe&color=%231e40af', dimensions: '300x400' },
  { id: '2', key: 'faculty_instructor_1', title: 'Senior Instructor', description: 'Photo of senior instructor', category: 'FACULTY', defaultImage: '/api/placeholder-image?width=300&height=400&text=Instructor&bg=%23dcfce7&color=%23166534', dimensions: '300x400' },
  { id: '3', key: 'infrastructure_main_building', title: 'Main Building', description: 'Main institute building exterior', category: 'INFRASTRUCTURE', defaultImage: '/api/placeholder-image?width=800&height=600&text=Main%20Building&bg=%23fef3c7&color=%2392400e', dimensions: '800x600' },
  { id: '4', key: 'infrastructure_workshop', title: 'Workshop Area', description: 'Electrician workshop and training area', category: 'INFRASTRUCTURE', defaultImage: '/api/placeholder-image?width=800&height=600&text=Workshop&bg=%23fce7f3&color=%239d174d', dimensions: '800x600' },
  { id: '5', key: 'infrastructure_computer_lab', title: 'Computer Lab', description: 'Computer lab with modern equipment', category: 'INFRASTRUCTURE', defaultImage: '/api/placeholder-image?width=800&height=600&text=Computer%20Lab&bg=%23e0e7ff&color=%233730a3', dimensions: '800x600' },
  { id: '6', key: 'infrastructure_library', title: 'Library', description: 'Institute library with books and study area', category: 'INFRASTRUCTURE', defaultImage: '/api/placeholder-image?width=800&height=600&text=Library&bg=%23f0fdf4&color=%2315803d', dimensions: '800x600' },
  { id: '7', key: 'events_annual_function', title: 'Annual Function', description: 'Annual function and cultural events', category: 'EVENTS', defaultImage: '/api/placeholder-image?width=800&height=600&text=Annual%20Function&bg=%23fef7cd&color=%2378350f', dimensions: '800x600' },
  { id: '8', key: 'achievements_certificates', title: 'Achievement Certificates', description: 'Student achievement certificates and awards', category: 'ACHIEVEMENTS', defaultImage: '/api/placeholder-image?width=600&height=400&text=Certificates&bg=%23fdf2f8&color=%239f1239', dimensions: '600x400' },
]

export default function ImagePlaceholderManager() {
  const [placeholders, setPlaceholders] = useState<PlaceholderImage[]>([])
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<PlaceholderImage | null>(null)
  const [showImageManager, setShowImageManager] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { void loadPlaceholders() }, [])

  const loadPlaceholders = async () => {
    try {
      const response = await fetch('/api/placeholders')
      if (!response.ok) throw new Error('Could not load saved image assignments')
      const data = await response.json()
      const saved = new Map((data.placeholders || []).map((item: { key: string; value: string }) => {
        try { return [item.key.replace(/^placeholder_/, ''), JSON.parse(item.value).imageUrl] } catch { return ['', ''] }
      }))
      setPlaceholders(DEFAULT_PLACEHOLDERS.map(item => ({ ...item, currentImage: (saved.get(item.key) as string | undefined) || undefined })))
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load image assignments') }
  }

  const handleImageSelect = async (image: { id: string; url: string }) => {
    if (!selectedPlaceholder) return
    try {
      const response = await fetch('/api/placeholders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: selectedPlaceholder.key, imageUrl: image.url, imageId: image.id }) })
      if (!response.ok) throw new Error('Could not save the image assignment')
      setPlaceholders(prev => prev.map(p => p.id === selectedPlaceholder.id ? { ...p, currentImage: image.url } : p))
      setShowImageManager(false); setSelectedPlaceholder(null); setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the image assignment') }
  }

  const resetPlaceholder = async (placeholder: PlaceholderImage) => {
    try {
      const response = await fetch(`/api/placeholders?key=${encodeURIComponent(placeholder.key)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not reset the image')
      setPlaceholders(prev => prev.map(p => p.id === placeholder.id ? { ...p, currentImage: undefined } : p))
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not reset the image') }
  }
  const categoryIcon = (category: string) => category === 'FACULTY' ? <User className="h-5 w-5" /> : category === 'INFRASTRUCTURE' ? <Building className="h-5 w-5" /> : category === 'EVENTS' ? <Calendar className="h-5 w-5" /> : category === 'ACHIEVEMENTS' ? <Award className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />
  const grouped = placeholders.reduce((acc, item) => { (acc[item.category] ||= []).push(item); return acc }, {} as Record<string, PlaceholderImage[]>)

  if (showImageManager) return <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"><div className="p-6 border-b flex justify-between"><div><h2 className="text-xl font-bold">Select Image</h2><p>Choose an image for: {selectedPlaceholder?.title}</p></div><button onClick={() => { setShowImageManager(false); setSelectedPlaceholder(null) }} aria-label="Close image manager">×</button></div><div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"><ImageManager onSelect={handleImageSelect} category={selectedPlaceholder?.category.toLowerCase()} multiple={false} showUpload /></div></div></div>

  return <div className="bg-white rounded-lg shadow-sm"><div className="p-6 border-b"><h2 className="text-xl font-bold">Image Placeholder Manager</h2><p className="text-sm text-gray-600 mt-1">Manage and replace placeholder images throughout the website.</p>{error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}</div><div className="p-6">{Object.entries(grouped).map(([category, items]) => <section key={category} className="mb-8"><div className="flex items-center gap-2 mb-4">{categoryIcon(category)}<h3 className="text-lg font-semibold">{category.toLowerCase().replace('_', ' ')}</h3></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{items.map(item => <div key={item.id} className="border rounded-lg overflow-hidden"><div className="aspect-video bg-gray-100"><img src={item.currentImage || item.defaultImage} alt={item.title} className="w-full h-full object-cover" /></div><div className="p-4"><h4 className="font-semibold">{item.title}</h4><p className="text-sm text-gray-600 mb-2">{item.description}</p><p className="text-xs text-gray-500 mb-3">Dimensions: {item.dimensions}</p><div className="flex gap-2"><button onClick={() => { setSelectedPlaceholder(item); setShowImageManager(true) }} className="flex-1 inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm"><Upload className="h-4 w-4 mr-2" />{item.currentImage ? 'Replace' : 'Select Image'}</button>{item.currentImage && <button onClick={() => void resetPlaceholder(item)} aria-label={`Reset ${item.title}`} title="Reset to default" className="px-3 py-2 border rounded-md"><RotateCcw className="h-4 w-4" /></button>}</div></div></div>)}</div></section>)}</div></div>
}
