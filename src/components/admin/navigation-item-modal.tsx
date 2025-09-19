'use client'

import { useState, useEffect } from 'react'
import { X, Save, Link, Menu, ExternalLink } from 'lucide-react'

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

interface NavigationItemModalProps {
  item?: NavigationItem | null
  navigation: NavigationItem[]
  onSave: () => void
  onClose: () => void
}

export default function NavigationItemModal({
  item,
  navigation,
  onSave,
  onClose
}: NavigationItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    href: '',
    parentId: '',
    order: 0,
    isVisible: true,
    linkType: 'internal',
    target: '_self',
    description: '',
    icon: '',
    cssClass: ''
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        href: item.href || '',
        parentId: item.parentId || '',
        order: item.order || 0,
        isVisible: item.isVisible ?? true,
        linkType: item.linkType || 'internal',
        target: item.target || '_self',
        description: item.description || '',
        icon: item.icon || '',
        cssClass: item.cssClass || ''
      })
    } else {
      // Set default order for new items
      const maxOrder = Math.max(...navigation.map(nav => nav.order), -1)
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }))
    }
  }, [item, navigation])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.linkType === 'internal' && !formData.href.trim()) {
      newErrors.href = 'URL is required for internal links'
    }

    if (formData.linkType === 'external' && !formData.href.trim()) {
      newErrors.href = 'URL is required for external links'
    }

    if (formData.linkType === 'external' && formData.href && !formData.href.startsWith('http')) {
      newErrors.href = 'External URLs must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const url = item ? `/api/admin/navigation/${item.id}` : '/api/admin/navigation'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
          href: formData.linkType === 'dropdown' ? null : formData.href || null
        })
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save navigation item')
      }
    } catch (error) {
      console.error('Error saving navigation item:', error)
      alert('Failed to save navigation item')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getAvailableParents = () => {
    const flattenItems = (items: NavigationItem[]): NavigationItem[] => {
      const result: NavigationItem[] = []
      items.forEach(navItem => {
        if (!item || navItem.id !== item.id) { // Exclude self
          result.push(navItem)
          if (navItem.children) {
            result.push(...flattenItems(navItem.children))
          }
        }
      })
      return result
    }

    return flattenItems(navigation)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Navigation Item' : 'Create Navigation Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Navigation item title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Type
              </label>
              <select
                value={formData.linkType}
                onChange={(e) => handleChange('linkType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal Link</option>
                <option value="external">External Link</option>
                <option value="dropdown">Dropdown Menu</option>
              </select>
            </div>
          </div>

          {/* URL Field (hidden for dropdown) */}
          {formData.linkType !== 'dropdown' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.linkType === 'external' ? (
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Link className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => handleChange('href', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.href ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={
                    formData.linkType === 'external' 
                      ? 'https://example.com' 
                      : '/page-url'
                  }
                />
              </div>
              {errors.href && (
                <p className="mt-1 text-sm text-red-600">{errors.href}</p>
              )}
            </div>
          )}

          {/* Parent and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Item
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => handleChange('parentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Top Level)</option>
                {getAvailableParents().map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          {/* Target and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.linkType === 'external' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => handleChange('isVisible', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Visible in navigation</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description for admin reference"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
