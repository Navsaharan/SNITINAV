'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  CreditCard, 
  User, 
  BarChart3,
  Calendar,
  FileText,
  Settings,
  Bell,
  Download,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  email: {
    unreadCount: number
    totalEmails: number
    todayCount: number
  }
  payments: {
    pendingCount: number
    totalPaid: number
    lastPayment?: {
      amount: number
      date: string
      type: string
    }
  }
}

interface RecentEmail {
  id: string
  subject: string
  fromName: string
  fromEmail: string
  createdAt: string
  isRead: boolean
}

interface RecentPayment {
  id: string
  amount: number
  feeType: string
  status: string
  createdAt: string
  receiptUrl?: string
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([])
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/student/login')
  }

  useEffect(() => {
    if (session?.user?.email) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load email stats
      const emailResponse = await fetch('/api/email?folder=Inbox&limit=5')
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setRecentEmails(emailData.emails.slice(0, 5))
      }

      // Load folders for stats
      const foldersResponse = await fetch('/api/email/folders')
      if (foldersResponse.ok) {
        const folders = await foldersResponse.json()
        const inboxFolder = folders.find((f: any) => f.type === 'INBOX')
        
        setStats(prev => ({
          ...prev,
          email: {
            unreadCount: inboxFolder?.unreadCount || 0,
            totalEmails: folders.reduce((sum: number, f: any) => sum + f.emailCount, 0),
            todayCount: 0 // TODO: Calculate today's emails
          }
        }))
      }

      // TODO: Load payment data when payment system is implemented
      setStats(prev => ({
        ...prev,
        payments: {
          pendingCount: 0,
          totalPaid: 0,
          lastPayment: undefined
        }
      }))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getFeeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ADMISSION: 'Admission Fee',
      SEMESTER: 'Semester Fee',
      EXAM: 'Exam Fee',
      LIBRARY: 'Library Fee',
      HOSTEL: 'Hostel Fee',
      TRANSPORT: 'Transport Fee',
      MISCELLANEOUS: 'Miscellaneous'
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name || session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Email Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.email.unreadCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.email.totalEmails || 0} total emails
              </p>
            </CardContent>
          </Card>

          {/* Payment Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.payments.pendingCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats?.payments.totalPaid || 0)} paid this year
              </p>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Profile completed</p>
            </CardContent>
          </Card>

          {/* Academic Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2024-25</div>
              <p className="text-xs text-muted-foreground">Current semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/student/email">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Mail className="w-6 h-6" />
                  <span className="text-sm">Email</span>
                </Button>
              </Link>
              <Link href="/student/payments">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Pay Fees</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Documents</span>
              </Button>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Emails */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Emails</CardTitle>
              <Link href="/student/email">
                <Button variant="ghost" size="sm">
                  View All
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentEmails.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent emails</p>
              ) : (
                <div className="space-y-4">
                  {recentEmails.map((email) => (
                    <div key={email.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                            {email.subject}
                          </p>
                          {!email.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          From: {email.fromName || email.fromEmail}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Link href="/student/payments">
                <Button variant="ghost" size="sm">
                  View All
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent payments</p>
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">{getFeeTypeLabel(payment.feeType)}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={payment.status === 'SUCCESS' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge>
                          {payment.receiptUrl && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
