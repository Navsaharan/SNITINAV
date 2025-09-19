'use client'

import { useState, useRef } from 'react'
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  Menu
} from 'lucide-react'

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

interface NavigationManagerProps {
  navigation: NavigationItem[]
  onUpdate: () => void
  onEdit: (item: NavigationItem) => void
  onDelete: (itemId: string) => void
  onToggleVisibility: (item: NavigationItem) => void
}

export default function NavigationManager({
  navigation,
  onUpdate,
  onEdit,
  onDelete,
  onToggleVisibility
}: NavigationManagerProps) {
  const [draggedItem, setDraggedItem] = useState<NavigationItem | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, item: NavigationItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1'
    setDraggedItem(null)
    setDragOverItem(null)
    dragCounter.current = 0
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, item: NavigationItem) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverItem(item.id)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverItem(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetItem: NavigationItem) => {
    e.preventDefault()
    setDragOverItem(null)
    dragCounter.current = 0

    if (!draggedItem || draggedItem.id === targetItem.id) {
      return
    }

    // Prepare the reordered items
    const allItems = getAllItems(navigation)
    const updatedItems = allItems.map((item, index) => ({
      id: item.id,
      order: index,
      parentId: item.parentId
    }))

    // Find the dragged item and target item in the flat list
    const draggedIndex = updatedItems.findIndex(item => item.id === draggedItem.id)
    const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Remove dragged item and insert at target position
    const [removed] = updatedItems.splice(draggedIndex, 1)
    updatedItems.splice(targetIndex, 0, removed)

    // Update order values
    updatedItems.forEach((item, index) => {
      item.order = index
    })

    try {
      const response = await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: updatedItems })
      })

      if (response.ok) {
        onUpdate()
      } else {
        console.error('Failed to update navigation order')
      }
    } catch (error) {
      console.error('Error updating navigation order:', error)
    }
  }

  const getAllItems = (items: NavigationItem[]): NavigationItem[] => {
    const result: NavigationItem[] = []
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        result.push(...getAllItems(item.children))
      }
    })
    return result
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isDragOver = dragOverItem === item.id

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center p-3 border rounded-lg mb-2 transition-all ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
          } ${!item.isVisible ? 'opacity-60' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
        >
          {/* Drag Handle */}
          <div className="cursor-move mr-3 text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 truncate">{item.title}</span>
              {item.linkType === 'external' && (
                <ExternalLink className="h-3 w-3 text-gray-400" />
              )}
              {item.linkType === 'dropdown' && (
                <Menu className="h-3 w-3 text-gray-400" />
              )}
            </div>
            {item.href && (
              <div className="text-xs text-gray-500 truncate">{item.href}</div>
            )}
            {item.description && (
              <div className="text-xs text-gray-400 truncate">{item.description}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => onToggleVisibility(item)}
              className={`p-1 rounded hover:bg-gray-100 ${
                item.isVisible ? 'text-green-600' : 'text-gray-400'
              }`}
              title={item.isVisible ? 'Hide item' : 'Show item'}
            >
              {item.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded hover:bg-gray-100 text-blue-600"
              title="Edit item"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 rounded hover:bg-gray-100 text-red-600"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (navigation.length === 0) {
    return (
      <div className="text-center py-12">
        <Menu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No navigation items</h3>
        <p className="text-gray-600 mb-4">Get started by creating your first navigation item.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {navigation.map(item => renderNavigationItem(item))}
    </div>
  )
}
