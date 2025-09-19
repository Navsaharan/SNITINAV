'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '@/components/admin/admin-layout'
import NavigationManager from '@/components/admin/navigation-manager'
import NavigationItemModal from '@/components/admin/navigation-item-modal'
import { Plus, Settings, Eye, EyeOff } from 'lucide-react'

interface NavigationItem {
  id: string
  title: string
  href?: string
  parentId?: string
  order: number
  isVisible: boolean
  linkType: string
  target: string
  description?: string
  icon?: string
  cssClass?: string
  children?: NavigationItem[]
  parent?: NavigationItem
}

export default function NavigationManagement() {
  const { data: session } = useSession()
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (session) {
      fetchNavigation()
    }
  }, [session])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/admin/navigation')
      if (response.ok) {
        const data = await response.json()
        setNavigation(data.navigation)
      } else {
        console.error('Failed to fetch navigation')
      }
    } catch (error) {
      console.error('Error fetching navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigationUpdate = () => {
    fetchNavigation()
  }

  const handleCreateItem = () => {
    setSelectedItem(null)
    setShowCreateModal(true)
  }

  const handleEditItem = (item: NavigationItem) => {
    setSelectedItem(item)
    setShowCreateModal(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/navigation/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchNavigation()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete navigation item')
      }
    } catch (error) {
      console.error('Error deleting navigation item:', error)
      alert('Failed to delete navigation item')
    }
  }

  const toggleVisibility = async (item: NavigationItem) => {
    try {
      const response = await fetch(`/api/admin/navigation/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...item,
          isVisible: !item.isVisible
        })
      })

      if (response.ok) {
        fetchNavigation()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update navigation item')
      }
    } catch (error) {
      console.error('Error updating navigation item:', error)
      alert('Failed to update navigation item')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading navigation...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation Management</h1>
            <p className="text-sm text-gray-600">
              Manage your website navigation structure with drag & drop reordering
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleCreateItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Navigation Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{navigation.length}</div>
            <div className="text-sm text-gray-600">Top Level Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {navigation.reduce((acc, item) => acc + (item.children?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Sub Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {navigation.filter(item => item.isVisible).length}
            </div>
            <div className="text-sm text-gray-600">Visible Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {navigation.filter(item => item.linkType === 'dropdown').length}
            </div>
            <div className="text-sm text-gray-600">Dropdown Menus</div>
          </div>
        </div>

        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Navigation Manager */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Navigation Structure</h2>
              <p className="text-sm text-gray-600">
                Drag and drop to reorder items. Click to edit or use the action buttons.
              </p>
            </div>
            <div className="p-6">
              <NavigationManager
                navigation={navigation}
                onUpdate={handleNavigationUpdate}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onToggleVisibility={toggleVisibility}
              />
            </div>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
                <p className="text-sm text-gray-600">
                  See how your navigation will appear on the website
                </p>
              </div>
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <nav className="flex space-x-6">
                      {navigation
                        .filter(item => item.isVisible)
                        .map((item) => (
                          <div key={item.id} className="relative">
                            {item.children && item.children.length > 0 ? (
                              <div className="group">
                                <button className="text-gray-700 hover:text-blue-600 font-medium">
                                  {item.title} ▼
                                </button>
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                  <div className="py-2">
                                    {item.children
                                      .filter(child => child.isVisible)
                                      .map((child) => (
                                        <div key={child.id} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                          {child.title}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                                {item.title}
                              </a>
                            )}
                          </div>
                        ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <NavigationItemModal
            item={selectedItem}
            navigation={navigation}
            onSave={handleNavigationUpdate}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
