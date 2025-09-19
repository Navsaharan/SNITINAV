'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Star, 
  Paperclip, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  Mail,
  MailOpen,
  Reply,
  Forward,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Email {
  id: string
  messageId: string
  subject: string
  fromEmail: string
  fromName?: string
  isRead: boolean
  isStarred: boolean
  isSpam: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  createdAt: string
  recipients: Array<{
    email: string
    name?: string
    type: 'TO' | 'CC' | 'BCC'
  }>
  attachments: Array<{
    id: string
    filename: string
    size: number
  }>
  _count: {
    attachments: number
  }
}

interface EmailListProps {
  emails: Email[]
  selectedEmails: string[]
  onEmailSelect: (emailId: string) => void
  onEmailSelectAll: (selected: boolean) => void
  onEmailClick: (email: Email) => void
  onEmailAction: (action: string, emailIds: string[]) => void
  onRefresh: () => void
  isLoading?: boolean
  currentFolder?: string
}

export default function EmailList({
  emails,
  selectedEmails,
  onEmailSelect,
  onEmailSelectAll,
  onEmailClick,
  onEmailAction,
  onRefresh,
  isLoading = false,
  currentFolder = 'Inbox'
}: EmailListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(emails)

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmails(emails)
    } else {
      const filtered = emails.filter(email => 
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.fromName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmails(filtered)
    }
  }, [emails, searchTerm])

  const allSelected = filteredEmails.length > 0 && filteredEmails.every(email => selectedEmails.includes(email.id))
  const someSelected = selectedEmails.length > 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-l-red-500'
      case 'HIGH': return 'border-l-orange-500'
      case 'LOW': return 'border-l-blue-500'
      default: return 'border-l-transparent'
    }
  }

  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getDisplayName = (email: Email) => {
    if (currentFolder === 'Sent') {
      const toRecipient = email.recipients.find(r => r.type === 'TO')
      return toRecipient?.name || toRecipient?.email || 'Unknown'
    }
    return email.fromName || email.fromEmail
  }

  const truncateSubject = (subject: string, maxLength: number = 60) => {
    return subject.length > maxLength ? subject.substring(0, maxLength) + '...' : subject
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onEmailSelectAll}
            className="data-[state=checked]:bg-blue-600"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {someSelected && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEmailAction('markRead', selectedEmails)}
              className="flex items-center gap-2"
            >
              <MailOpen className="w-4 h-4" />
              Mark Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEmailAction('markStarred', selectedEmails)}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Star
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEmailAction('delete', selectedEmails)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading emails...
              </div>
            ) : searchTerm ? (
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails in {currentFolder}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors",
                  getPriorityColor(email.priority),
                  !email.isRead && "bg-blue-50 font-medium",
                  selectedEmails.includes(email.id) && "bg-blue-100"
                )}
                onClick={() => onEmailClick(email)}
              >
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => onEmailSelect(email.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-blue-600"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEmailAction('markStarred', [email.id])
                  }}
                  className={cn(
                    "p-1 h-auto",
                    email.isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                  )}
                >
                  <Star className={cn("w-4 h-4", email.isStarred && "fill-current")} />
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "truncate",
                        !email.isRead && "font-semibold"
                      )}>
                        {getDisplayName(email)}
                      </span>
                      {email.priority !== 'NORMAL' && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-1 py-0",
                            email.priority === 'URGENT' && "border-red-500 text-red-700",
                            email.priority === 'HIGH' && "border-orange-500 text-orange-700",
                            email.priority === 'LOW' && "border-blue-500 text-blue-700"
                          )}
                        >
                          {email.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {email._count.attachments > 0 && (
                        <Paperclip className="w-4 h-4" />
                      )}
                      <span>{formatEmailDate(email.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm text-gray-600 truncate",
                      !email.isRead && "font-medium text-gray-900"
                    )}>
                      {truncateSubject(email.subject)}
                    </p>
                    
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredEmails.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 text-sm text-gray-600">
          <span>
            {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          {someSelected && (
            <span>
              {selectedEmails.length} selected
            </span>
          )}
        </div>
      )}
    </div>
  )
}
