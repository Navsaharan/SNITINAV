'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  Archive, 
  AlertTriangle,
  Plus,
  Folder,
  Settings,
  Search,
  Mail,
  Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailFolder {
  id: string
  name: string
  type: 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM' | 'ARCHIVE' | 'CUSTOM'
  color?: string
  emailCount: number
  unreadCount: number
  order: number
}

interface EmailSidebarProps {
  folders: EmailFolder[]
  currentFolder: string
  onFolderSelect: (folderId: string) => void
  onCompose: () => void
  onCreateFolder?: (name: string, color: string) => void
  className?: string
}

export default function EmailSidebar({
  folders,
  currentFolder,
  onFolderSelect,
  onCompose,
  onCreateFolder,
  className
}: EmailSidebarProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#6B7280')

  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'INBOX': return <Inbox className="w-4 h-4" />
      case 'SENT': return <Send className="w-4 h-4" />
      case 'DRAFTS': return <FileText className="w-4 h-4" />
      case 'TRASH': return <Trash2 className="w-4 h-4" />
      case 'SPAM': return <AlertTriangle className="w-4 h-4" />
      case 'ARCHIVE': return <Archive className="w-4 h-4" />
      default: return <Folder className="w-4 h-4" />
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim(), newFolderColor)
      setNewFolderName('')
      setNewFolderColor('#6B7280')
      setShowCreateFolder(false)
    }
  }

  const sortedFolders = [...folders].sort((a, b) => {
    // System folders first, then custom folders
    const systemOrder = ['INBOX', 'SENT', 'DRAFTS', 'TRASH', 'SPAM', 'ARCHIVE']
    const aIndex = systemOrder.indexOf(a.type)
    const bIndex = systemOrder.indexOf(b.type)
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    } else if (aIndex !== -1) {
      return -1
    } else if (bIndex !== -1) {
      return 1
    } else {
      return a.order - b.order
    }
  })

  const totalUnread = folders.reduce((sum, folder) => sum + folder.unreadCount, 0)

  return (
    <div className={cn("w-64 bg-white border-r border-gray-200 flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <Button 
          onClick={onCompose}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Edit3 className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-auto">
        <div className="p-2 space-y-1">
          {sortedFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.name)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                currentFolder === folder.name
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn(
                  "flex-shrink-0",
                  folder.color && folder.type === 'CUSTOM' && `text-[${folder.color}]`
                )}>
                  {getFolderIcon(folder.type)}
                </div>
                <span className="truncate font-medium">{folder.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {folder.unreadCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {folder.unreadCount > 99 ? '99+' : folder.unreadCount}
                  </Badge>
                )}
                {folder.emailCount > 0 && folder.unreadCount === 0 && (
                  <span className="text-xs text-gray-500">
                    {folder.emailCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Create Folder Section */}
        <div className="p-2 border-t">
          {showCreateFolder ? (
            <div className="space-y-2">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  } else if (e.key === 'Escape') {
                    setShowCreateFolder(false)
                    setNewFolderName('')
                  }
                }}
                className="text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Button
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateFolder(false)
                    setNewFolderName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            onCreateFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
                className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </Button>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Total emails:</span>
            <span className="font-medium">
              {folders.reduce((sum, folder) => sum + folder.emailCount, 0)}
            </span>
          </div>
          {totalUnread > 0 && (
            <div className="flex items-center justify-between">
              <span>Unread:</span>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
