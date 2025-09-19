'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Paperclip,
  MessageSquare,
  BarChart3
} from 'lucide-react'

interface Email {
  id: string
  subject: string
  fromEmail: string
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING'
  isSpam: boolean
  spamScore: number
  createdAt: string
  sentAt: string | null
  recipients: Array<{ email: string; type: string }>
  attachments: Array<{ filename: string; size: number; virusScanResult: string }>
  threadInfo?: {
    threadId: string
    emailCount: number
  }
}

export default function EmailMonitoring() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    fromEmail: '',
    toEmail: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    hasAttachments: 'all',
    isSpam: 'all',
    page: 1,
    limit: 20
  })

  // Load emails
  useEffect(() => {
    loadEmails()
  }, [filters])

  const loadEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.fromEmail && { fromEmail: filters.fromEmail }),
        ...(filters.toEmail && { toEmail: filters.toEmail }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.hasAttachments && { hasAttachments: filters.hasAttachments }),
        ...(filters.isSpam && { isSpam: filters.isSpam })
      })

      const response = await fetch(`/api/admin/email/monitoring?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setEmails(data.emails)
      } else {
        console.error('Failed to load emails:', data.error)
      }
    } catch (error) {
      console.error('Error loading emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email)
    setShowEmailDialog(true)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      SENT: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSpamScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const EmailDetailsDialog = () => {
    if (!selectedEmail) return null

    return (
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              Detailed view of email content and metadata
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Email Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">From</Label>
                <p className="text-sm">{selectedEmail.fromEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={getStatusColor(selectedEmail.status)}>
                  {selectedEmail.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm">{selectedEmail.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Spam Score</Label>
                <p className={`text-sm font-medium ${getSpamScoreColor(selectedEmail.spamScore)}`}>
                  {selectedEmail.spamScore}%
                </p>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <Label className="text-sm font-medium">Recipients</Label>
              <div className="mt-1 space-y-1">
                {selectedEmail.recipients.map((recipient, index) => (
                  <div key={index} className="text-sm">
                    <Badge variant="outline" className="mr-2">{recipient.type}</Badge>
                    {recipient.email}
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {selectedEmail.attachments.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="mt-1 space-y-2">
                  {selectedEmail.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{attachment.filename}</span>
                        <span className="text-xs text-gray-500">({formatBytes(attachment.size)})</span>
                      </div>
                      <Badge 
                        variant={attachment.virusScanResult === 'CLEAN' ? 'default' : 'destructive'}
                      >
                        {attachment.virusScanResult}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thread Information */}
            {selectedEmail.threadInfo && (
              <div>
                <Label className="text-sm font-medium">Thread Information</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    Part of thread with {selectedEmail.threadInfo.emailCount} emails
                  </p>
                  <p className="text-xs text-gray-500">
                    Thread ID: {selectedEmail.threadInfo.threadId}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm">{new Date(selectedEmail.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Sent</Label>
                <p className="text-sm">
                  {selectedEmail.sentAt 
                    ? new Date(selectedEmail.sentAt).toLocaleString()
                    : 'Not sent'
                  }
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Monitoring & Content Management
          </CardTitle>
          <CardDescription>
            Monitor all email traffic, search content, and track security threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monitoring" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monitoring">Email Monitoring</TabsTrigger>
              <TabsTrigger value="search">Advanced Search</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search content..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-10"
                  />
                </div>
                <Input
                  placeholder="From email..."
                  value={filters.fromEmail}
                  onChange={(e) => setFilters({ ...filters, fromEmail: e.target.value, page: 1 })}
                />
                <Input
                  placeholder="To email..."
                  value={filters.toEmail}
                  onChange={(e) => setFilters({ ...filters, toEmail: e.target.value, page: 1 })}
                />
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.isSpam} onValueChange={(value) => setFilters({ ...filters, isSpam: value === 'all' ? '' : value, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Spam Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Emails</SelectItem>
                    <SelectItem value="true">Spam Only</SelectItem>
                    <SelectItem value="false">Non-Spam Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.hasAttachments} onValueChange={(value) => setFilters({ ...filters, hasAttachments: value === 'all' ? '' : value, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Attachments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Emails</SelectItem>
                    <SelectItem value="true">With Attachments</SelectItem>
                    <SelectItem value="false">No Attachments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setFilters({
                    search: '', fromEmail: '', toEmail: '', status: '', 
                    dateFrom: '', dateTo: '', hasAttachments: '', isSpam: '', page: 1, limit: 20
                  })}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Emails Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Security</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading emails...
                        </TableCell>
                      </TableRow>
                    ) : emails.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No emails found
                        </TableCell>
                      </TableRow>
                    ) : (
                      emails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">{email.subject}</div>
                              {email.threadInfo && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MessageSquare className="h-3 w-3" />
                                  Thread ({email.threadInfo.emailCount})
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{email.fromEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {email.recipients.length} recipient(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(email.status)}>
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {email.isSpam && (
                                <Badge variant="destructive" className="text-xs">
                                  SPAM
                                </Badge>
                              )}
                              {email.attachments.length > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  {email.attachments.length}
                                </div>
                              )}
                              <div className={`text-xs ${getSpamScoreColor(email.spamScore)}`}>
                                Score: {email.spamScore}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(email.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewEmail(email)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Email
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Advanced search functionality will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Email analytics and reporting will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EmailDetailsDialog />
    </div>
  )
}
