'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EmailSidebar from '@/components/email/email-sidebar'
import EmailList from '@/components/email/email-list'
import EmailViewer from '@/components/email/email-viewer'
import EmailComposer from '@/components/email/email-composer'
import { toast } from '@/components/ui/use-toast'
import { 
  Mail, 
  Settings, 
  BarChart3, 
  RefreshCw,
  Plus
} from 'lucide-react'

interface Email {
  id: string
  messageId: string
  subject: string
  fromEmail: string
  fromName?: string
  body: string
  isRead: boolean
  isStarred: boolean
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
    originalName: string
    mimeType: string
    size: number
  }>
  _count: {
    attachments: number
  }
}

interface EmailFolder {
  id: string
  name: string
  type: 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM' | 'ARCHIVE' | 'CUSTOM'
  color?: string
  emailCount: number
  unreadCount: number
  order: number
}

export default function StudentEmailPage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<Email[]>([])
  const [folders, setFolders] = useState<EmailFolder[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState('Inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Define functions before useEffect with useCallback to prevent infinite re-renders
  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/email/folders')
      if (response.ok) {
        const foldersData = await response.json()
        setFolders(foldersData)
      }
    } catch (error) {
      console.error('Failed to load folders:', error)
    }
  }, [])

  const loadEmails = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        folder: currentFolder,
        page: currentPage.toString(),
        limit: '50'
      })

      const response = await fetch(`/api/email?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
        setTotalPages(data.pagination.pages)
      } else {
        throw new Error('Failed to load emails')
      }
    } catch (error) {
      console.error('Failed to load emails:', error)
      toast({
        title: "Error",
        description: "Failed to load emails",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentFolder, currentPage])

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const handleEmailSelectAll = (selected: boolean) => {
    setSelectedEmails(selected ? emails.map(email => email.id) : [])
  }

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email)
    
    // Mark as read if not already read
    if (!email.isRead) {
      try {
        await fetch(`/api/email/${email.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        })
        
        // Update local state
        setEmails(prev => prev.map(e => 
          e.id === email.id ? { ...e, isRead: true } : e
        ))
      } catch (error) {
        console.error('Failed to mark email as read:', error)
      }
    }
  }

  const handleEmailAction = async (action: string, emailIds: string[]) => {
    try {
      const response = await fetch('/api/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds, action, value: true })
      })

      if (response.ok) {
        await loadEmails()
        await loadFolders()
        setSelectedEmails([])
        
        toast({
          title: "Success",
          description: `${emailIds.length} email(s) updated`
        })
      } else {
        throw new Error('Failed to update emails')
      }
    } catch (error) {
      console.error('Email action failed:', error)
      toast({
        title: "Error",
        description: "Failed to update emails",
        variant: "destructive"
      })
    }
  }

  const handleSendEmail = async (emailData: any) => {
    try {
      const formData = new FormData()
      formData.append('to', emailData.to)
      formData.append('subject', emailData.subject)
      formData.append('body', emailData.body)
      formData.append('priority', emailData.priority)
      formData.append('isDraft', 'false')

      if (emailData.cc) formData.append('cc', emailData.cc)
      if (emailData.bcc) formData.append('bcc', emailData.bcc)
      if (emailData.replyTo) formData.append('replyTo', emailData.replyTo)
      if (emailData.inReplyTo) formData.append('inReplyTo', emailData.inReplyTo)

      // Add attachments
      emailData.attachments.forEach((file: File, index: number) => {
        formData.append(`attachment_${index}`, file)
      })

      const response = await fetch('/api/email', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadEmails()
        await loadFolders()
        toast({
          title: "Success",
          description: "Email sent successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Send email failed:', error)
      throw error
    }
  }

  const handleSaveDraft = async (emailData: any) => {
    try {
      const formData = new FormData()
      formData.append('to', emailData.to)
      formData.append('subject', emailData.subject)
      formData.append('body', emailData.body)
      formData.append('priority', emailData.priority)
      formData.append('isDraft', 'true')

      if (emailData.cc) formData.append('cc', emailData.cc)
      if (emailData.bcc) formData.append('bcc', emailData.bcc)

      const response = await fetch('/api/email', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadEmails()
        await loadFolders()
      } else {
        throw new Error('Failed to save draft')
      }
    } catch (error) {
      console.error('Save draft failed:', error)
      throw error
    }
  }

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/email/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      })

      if (response.ok) {
        await loadFolders()
        toast({
          title: "Success",
          description: "Folder created successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Create folder failed:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive"
      })
    }
  }

  // Load initial data - useEffect after all function definitions
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      loadFolders()
      loadEmails()
    }
  }, [status, session, loadFolders, loadEmails])

  // Handle authentication redirects after all hooks
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/student/login')
  }

  if (showComposer) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <EmailComposer
          onSend={handleSendEmail}
          onSaveDraft={handleSaveDraft}
          onClose={() => setShowComposer(false)}
        />
      </div>
    )
  }

  if (selectedEmail) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <EmailViewer
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onReply={() => {
            // TODO: Implement reply functionality
            setShowComposer(true)
          }}
          onReplyAll={() => {
            // TODO: Implement reply all functionality
            setShowComposer(true)
          }}
          onForward={() => {
            // TODO: Implement forward functionality
            setShowComposer(true)
          }}
          onStar={async () => {
            await handleEmailAction('markStarred', [selectedEmail.id])
            setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred })
          }}
          onDelete={async () => {
            await handleEmailAction('delete', [selectedEmail.id])
            setSelectedEmail(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <EmailSidebar
          folders={folders}
          currentFolder={currentFolder}
          onFolderSelect={setCurrentFolder}
          onCompose={() => setShowComposer(true)}
          onCreateFolder={handleCreateFolder}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentFolder}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadEmails}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowComposer(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Compose
                </Button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1">
            <EmailList
              emails={emails}
              selectedEmails={selectedEmails}
              onEmailSelect={handleEmailSelect}
              onEmailSelectAll={handleEmailSelectAll}
              onEmailClick={handleEmailClick}
              onEmailAction={handleEmailAction}
              onRefresh={loadEmails}
              isLoading={isLoading}
              currentFolder={currentFolder}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white border-t px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
