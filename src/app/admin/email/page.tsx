import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  UserCheck, 
  Shield, 
  BarChart3,
  ArrowRight,
  Users,
  Activity,
  AlertTriangle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Email Management - Admin Panel',
  description: 'Comprehensive email system management',
}

export default async function EmailManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Comprehensive email system management and monitoring
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Accounts</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">1,156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Emails Today</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Spam Blocked</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Email Account Management
              </CardTitle>
              <CardDescription>
                Create, manage, and monitor student and staff email accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create new email accounts</li>
                    <li>• Monitor usage and storage</li>
                    <li>• Bulk account operations</li>
                    <li>• Password management</li>
                  </ul>
                </div>
                <Link href="/admin/email/accounts">
                  <Button className="w-full">
                    Manage Accounts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Email Monitoring
              </CardTitle>
              <CardDescription>
                Monitor email traffic, content, and security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time email monitoring</li>
                    <li>• Content search and filtering</li>
                    <li>• Spam and threat detection</li>
                    <li>• Attachment scanning</li>
                  </ul>
                </div>
                <Link href="/admin/email/monitoring">
                  <Button className="w-full">
                    View Monitoring
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Email Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and reporting for email system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Usage statistics</li>
                    <li>• Performance metrics</li>
                    <li>• Security reports</li>
                    <li>• Trend analysis</li>
                  </ul>
                </div>
                <Link href="/admin/email/analytics">
                  <Button className="w-full">
                    View Analytics
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Activity</CardTitle>
            <CardDescription>
              Latest email system events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">New email account created</p>
                    <p className="text-xs text-muted-foreground">student123@institute.edu</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 minutes ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Spam email blocked</p>
                    <p className="text-xs text-muted-foreground">High-risk content detected</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Bulk email sent successfully</p>
                    <p className="text-xs text-muted-foreground">247 recipients</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">15 minutes ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Daily report generated</p>
                    <p className="text-xs text-muted-foreground">Email usage statistics</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
