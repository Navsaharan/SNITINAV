'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Star, 
  Archive, 
  Trash2, 
  Download,
  Paperclip,
  Calendar,
  User,
  Mail,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface EmailViewerProps {
  email: {
    id: string
    messageId: string
    subject: string
    fromEmail: string
    fromName?: string
    body: string
    bodyText?: string
    isRead: boolean
    isStarred: boolean
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    createdAt: string
    sentAt?: string
    recipients: Array<{
      email: string
      name?: string
      type: 'TO' | 'CC' | 'BCC'
    }>
    attachments: Array<{
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      url?: string
    }>
  }
  onReply?: () => void
  onReplyAll?: () => void
  onForward?: () => void
  onStar?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onBack?: () => void
  className?: string
}

export default function EmailViewer({
  email,
  onReply,
  onReplyAll,
  onForward,
  onStar,
  onArchive,
  onDelete,
  onBack,
  className
}: EmailViewerProps) {
  const [showAllRecipients, setShowAllRecipients] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗜️'
    return '📎'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toRecipients = email.recipients.filter(r => r.type === 'TO')
  const ccRecipients = email.recipients.filter(r => r.type === 'CC')
  const bccRecipients = email.recipients.filter(r => r.type === 'BCC')

  const displayRecipients = showAllRecipients ? toRecipients : toRecipients.slice(0, 3)
  const hasMoreRecipients = toRecipients.length > 3

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-xl font-semibold truncate">{email.subject}</h1>
            {email.priority !== 'NORMAL' && (
              <Badge className={getPriorityColor(email.priority)}>
                {email.priority}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onStar}
              className={cn(
                email.isStarred ? "text-yellow-500" : "text-gray-400"
              )}
            >
              <Star className={cn("w-4 h-4", email.isStarred && "fill-current")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onReply}>
              <Reply className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onReplyAll}>
              <ReplyAll className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onForward}>
              <Forward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onArchive}>
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Email Metadata */}
        <div className="space-y-3 text-sm">
          {/* From */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">From:</span>
            <span>{email.fromName || email.fromEmail}</span>
            {email.fromName && (
              <span className="text-gray-500">&lt;{email.fromEmail}&gt;</span>
            )}
          </div>

          {/* To */}
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="font-medium">To:</span>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1">
                {displayRecipients.map((recipient, index) => (
                  <span key={index} className="text-gray-700">
                    {recipient.name || recipient.email}
                    {index < displayRecipients.length - 1 && ','}
                  </span>
                ))}
                {hasMoreRecipients && !showAllRecipients && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAllRecipients(true)}
                    className="h-auto p-0 text-blue-600"
                  >
                    +{toRecipients.length - 3} more
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* CC */}
          {ccRecipients.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-medium">Cc:</span>
              <div className="flex flex-wrap gap-1">
                {ccRecipients.map((recipient, index) => (
                  <span key={index} className="text-gray-700">
                    {recipient.name || recipient.email}
                    {index < ccRecipients.length - 1 && ','}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Date:</span>
            <span>{formatEmailDate(email.sentAt || email.createdAt)}</span>
            <span className="text-gray-500">
              ({formatDistanceToNow(new Date(email.sentAt || email.createdAt), { addSuffix: true })})
            </span>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm">
                {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm border"
                >
                  <span className="text-lg">{getFileIcon(attachment.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{attachment.originalName}</p>
                    <p className="text-gray-500 text-xs">{formatFileSize(attachment.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (attachment.url) {
                        window.open(attachment.url, '_blank')
                      }
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Email Body */}
        <div className="prose max-w-none">
          <div 
            className="text-gray-900 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 p-6 border-t bg-gray-50">
        <Button onClick={onReply} className="flex items-center gap-2">
          <Reply className="w-4 h-4" />
          Reply
        </Button>
        <Button variant="outline" onClick={onReplyAll} className="flex items-center gap-2">
          <ReplyAll className="w-4 h-4" />
          Reply All
        </Button>
        <Button variant="outline" onClick={onForward} className="flex items-center gap-2">
          <Forward className="w-4 h-4" />
          Forward
        </Button>
      </div>
    </Card>
  )
}
