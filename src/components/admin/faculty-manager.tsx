'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Edit, Trash2, GripVertical, User, Upload, X } from 'lucide-react'
import Image from 'next/image'
import ImageManager from './image-manager'

interface Faculty {
  id: string
  name: string
  designation: string
  department?: string
  email?: string
  phone?: string
  photoUrl?: string
  bio?: string
  order: number
  isActive: boolean
}

export default function FacultyManager() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showImageManager, setShowImageManager] = useState(false)
  const [selectedFacultyForPhoto, setSelectedFacultyForPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/faculty')
      if (response.ok) {
        const data = await response.json()
        setFaculty(data.faculty || [])
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(faculty)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFaculty(items)

    // Update order in database
    try {
      const facultyIds = items.map(f => f.id)
      await fetch('/api/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyIds })
      })
    } catch (error) {
      console.error('Error updating faculty order:', error)
      fetchFaculty() // Revert on error
    }
  }

  const handleSave = async (facultyData: Partial<Faculty>) => {
    try {
      const url = editingFaculty ? `/api/faculty/${editingFaculty.id}` : '/api/faculty'
      const method = editingFaculty ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData)
      })

      if (response.ok) {
        await fetchFaculty()
        setShowForm(false)
        setEditingFaculty(null)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving faculty:', error)
      alert('Failed to save faculty member')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return

    try {
      const response = await fetch(`/api/faculty/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchFaculty()
      }
    } catch (error) {
      console.error('Error deleting faculty:', error)
    }
  }

  const handlePhotoSelect = async (image: any) => {
    if (!selectedFacultyForPhoto) return

    try {
      const response = await fetch(`/api/faculty/${selectedFacultyForPhoto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: image.url })
      })

      if (response.ok) {
        await fetchFaculty()
        setShowImageManager(false)
        setSelectedFacultyForPhoto(null)
      }
    } catch (error) {
      console.error('Error updating faculty photo:', error)
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
            <h2 className="text-xl font-bold text-gray-900">Faculty Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage faculty members and their information
            </p>
          </div>
          <button
            onClick={() => {
              setEditingFaculty(null)
              setShowForm(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </button>
        </div>
      </div>

      <div className="p-6">
        {faculty.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No faculty members added yet</p>
            <button
              onClick={() => {
                setEditingFaculty(null)
                setShowForm(true)
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Faculty Member
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="faculty">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {faculty.map((member, index) => (
                    <Draggable key={member.id} draggableId={member.id} index={index}>
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
                          
                          {/* Photo */}
                          <div className="relative mr-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {member.photoUrl ? (
                                <Image
                                  src={member.photoUrl}
                                  alt={member.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedFacultyForPhoto(member.id)
                                setShowImageManager(true)
                              }}
                              className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
                              title="Upload Photo"
                            >
                              <Upload className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {member.designation}
                            </p>
                            {member.department && (
                              <p className="text-xs text-gray-500 truncate">
                                {member.department}
                              </p>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingFaculty(member)
                                setShowForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* Faculty Form Modal */}
      {showForm && (
        <FacultyForm
          faculty={editingFaculty}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingFaculty(null)
          }}
        />
      )}

      {/* Image Manager Modal */}
      {showImageManager && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Faculty Photo</h2>
                <button
                  onClick={() => {
                    setShowImageManager(false)
                    setSelectedFacultyForPhoto(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ImageManager
                onSelect={handlePhotoSelect}
                category="faculty"
                multiple={false}
                showUpload={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Faculty Form Component
interface FacultyFormProps {
  faculty: Faculty | null
  onSave: (data: Partial<Faculty>) => void
  onCancel: () => void
}

function FacultyForm({ faculty, onSave, onCancel }: FacultyFormProps) {
  const [formData, setFormData] = useState({
    name: faculty?.name || '',
    designation: faculty?.designation || '',
    department: faculty?.department || '',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    bio: faculty?.bio || '',
    isActive: faculty?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {faculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {faculty ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
