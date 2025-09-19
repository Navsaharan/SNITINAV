'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Paperclip, 
  Save, 
  X, 
  Star,
  AlertCircle,
  FileText,
  Image,
  File
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface EmailComposerProps {
  onSend?: (emailData: EmailData) => Promise<void>
  onSaveDraft?: (emailData: EmailData) => Promise<void>
  onClose?: () => void
  replyTo?: {
    messageId: string
    subject: string
    from: string
    to: string
    body: string
  }
  initialData?: Partial<EmailData>
}

interface EmailData {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  attachments: File[]
  replyTo?: string
  inReplyTo?: string
  references?: string
}

interface AttachmentPreview {
  file: File
  id: string
  preview?: string
}

export default function EmailComposer({
  onSend,
  onSaveDraft,
  onClose,
  replyTo,
  initialData
}: EmailComposerProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: initialData?.to || (replyTo ? replyTo.from : ''),
    cc: initialData?.cc || '',
    bcc: initialData?.bcc || '',
    subject: initialData?.subject || (replyTo ? `RE: ${replyTo.subject}` : ''),
    body: initialData?.body || (replyTo ? `\n\n--- Original Message ---\nFrom: ${replyTo.from}\nTo: ${replyTo.to}\nSubject: ${replyTo.subject}\n\n${replyTo.body}` : ''),
    priority: initialData?.priority || 'NORMAL',
    attachments: initialData?.attachments || [],
    inReplyTo: replyTo?.messageId,
    references: replyTo?.messageId
  })

  const [attachmentPreviews, setAttachmentPreviews] = useState<AttachmentPreview[]>([])
  const [showCc, setShowCc] = useState(!!initialData?.cc)
  const [showBcc, setShowBcc] = useState(!!initialData?.bcc)
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      // Check file size (25MB limit)
      if (file.size > 26214400) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 25MB limit`,
          variant: "destructive"
        })
        return
      }

      const id = Math.random().toString(36).substring(7)
      const preview: AttachmentPreview = { file, id }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          preview.preview = e.target?.result as string
          setAttachmentPreviews(prev => [...prev, preview])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachmentPreviews(prev => [...prev, preview])
      }

      setEmailData(prev => ({
        ...prev,
        attachments: [...prev.attachments, file]
      }))
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    const preview = attachmentPreviews.find(p => p.id === id)
    if (preview) {
      setAttachmentPreviews(prev => prev.filter(p => p.id !== id))
      setEmailData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(f => f !== preview.file)
      }))
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateEmail = () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Recipient required",
        description: "Please enter at least one recipient",
        variant: "destructive"
      })
      return false
    }

    if (!emailData.subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSend = async () => {
    if (!validateEmail()) return

    setIsSending(true)
    try {
      await onSend?.(emailData)
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully"
      })
      onClose?.()
    } catch (error) {
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await onSaveDraft?.(emailData)
      toast({
        title: "Draft saved",
        description: "Your draft has been saved"
      })
    } catch (error) {
      toast({
        title: "Failed to save draft",
        description: error instanceof Error ? error.message : "Failed to save draft",
        variant: "destructive"
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {replyTo ? 'Reply' : 'Compose Email'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={emailData.priority}
            onValueChange={(value: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => 
              handleInputChange('priority', value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium w-12">To:</label>
            <Input
              value={emailData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1"
            />
            <div className="flex gap-1">
              {!showCc && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(true)}
                  className="text-xs"
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(true)}
                  className="text-xs"
                >
                  Bcc
                </Button>
              )}
            </div>
          </div>

          {showCc && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">Cc:</label>
              <Input
                value={emailData.cc}
                onChange={(e) => handleInputChange('cc', e.target.value)}
                placeholder="cc@example.com"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCc(false)
                  handleInputChange('cc', '')
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">Bcc:</label>
              <Input
                value={emailData.bcc}
                onChange={(e) => handleInputChange('bcc', e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBcc(false)
                  handleInputChange('bcc', '')
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-12">Subject:</label>
          <Input
            value={emailData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject"
            className="flex-1"
          />
          {emailData.priority !== 'NORMAL' && (
            <Badge className={getPriorityColor(emailData.priority)}>
              {emailData.priority}
            </Badge>
          )}
        </div>

        {/* Attachments */}
        {attachmentPreviews.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Attachments:</label>
            <div className="flex flex-wrap gap-2">
              {attachmentPreviews.map((preview) => (
                <div
                  key={preview.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm"
                >
                  {getFileIcon(preview.file.type)}
                  <span className="truncate max-w-32">{preview.file.name}</span>
                  <span className="text-gray-500">({formatFileSize(preview.file.size)})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(preview.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="space-y-2">
          <Textarea
            value={emailData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Write your email..."
            className="min-h-64 resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send'}
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Paperclip className="w-4 h-4" />
              Attach
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            {emailData.attachments.length > 0 && (
              <span>
                {emailData.attachments.length} attachment{emailData.attachments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
