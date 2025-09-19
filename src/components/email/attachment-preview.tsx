'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Download, 
  Eye, 
  X, 
  FileText, 
  Image, 
  File, 
  Archive,
  Video,
  Music,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttachmentPreviewProps {
  attachment: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url?: string
    downloadUrl?: string
  }
  onDownload?: (attachmentId: string) => void
  onRemove?: (attachmentId: string) => void
  showRemove?: boolean
  className?: string
}

export default function AttachmentPreview({
  attachment,
  onDownload,
  onRemove,
  showRemove = false,
  className
}: AttachmentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5" />
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800'
    if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-800'
    if (mimeType.startsWith('audio/')) return 'bg-blue-100 text-blue-800'
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800'
    if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-100 text-blue-800'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bg-green-100 text-green-800'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'bg-orange-100 text-orange-800'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' ||
           mimeType.startsWith('text/')
  }

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(attachment.id)
    } else if (attachment.downloadUrl) {
      // Direct download
      const link = document.createElement('a')
      link.href = attachment.downloadUrl
      link.download = attachment.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = () => {
    if (canPreview(attachment.mimeType)) {
      setIsPreviewOpen(true)
      setPreviewError(false)
    }
  }

  const renderPreview = () => {
    if (!isPreviewOpen || !attachment.url) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold truncate">{attachment.originalName}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4">
            {previewError ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Failed to load preview</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="mt-2"
                  >
                    Download instead
                  </Button>
                </div>
              </div>
            ) : attachment.mimeType.startsWith('image/') ? (
              <img
                src={attachment.url}
                alt={attachment.originalName}
                className="max-w-full max-h-96 object-contain mx-auto"
                onError={() => setPreviewError(true)}
              />
            ) : attachment.mimeType === 'application/pdf' ? (
              <iframe
                src={attachment.url}
                className="w-full h-96"
                title={attachment.originalName}
                onError={() => setPreviewError(true)}
              />
            ) : attachment.mimeType.startsWith('text/') ? (
              <iframe
                src={attachment.url}
                className="w-full h-96 border"
                title={attachment.originalName}
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <File className="w-12 h-12 mx-auto mb-4" />
                  <p>Preview not available for this file type</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="mt-2"
                  >
                    Download to view
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              getFileTypeColor(attachment.mimeType)
            )}>
              {getFileIcon(attachment.mimeType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate" title={attachment.originalName}>
                {attachment.originalName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(attachment.size)}
                </Badge>
                <span className="text-xs text-gray-500">
                  {attachment.mimeType.split('/')[1]?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {canPreview(attachment.mimeType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  className="h-8 w-8 p-0"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>

              {showRemove && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(attachment.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {renderPreview()}
    </>
  )
}
