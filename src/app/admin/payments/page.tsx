import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Database, 
  BarChart3,
  Settings,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Management - Admin Panel',
  description: 'Comprehensive payment system management',
}

export default async function PaymentManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Comprehensive payment system management and monitoring
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">₹12,47,500</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">This Month</p>
                  <p className="text-2xl font-bold">₹3,45,200</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-2xl font-bold">1,847</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">98.5%</p>
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
                <Database className="h-5 w-5 text-blue-600" />
                Payment Catalog
              </CardTitle>
              <CardDescription>
                Manage fees, courses, and payment items with pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Add/edit payment items</li>
                    <li>• Set pricing and schedules</li>
                    <li>• Manage categories</li>
                    <li>• Configure discounts</li>
                  </ul>
                </div>
                <Link href="/admin/payments/catalog">
                  <Button className="w-full">
                    Manage Catalog
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Transaction Monitoring
              </CardTitle>
              <CardDescription>
                Monitor all payment transactions and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time transaction monitoring</li>
                    <li>• Payment analytics</li>
                    <li>• Gateway performance</li>
                    <li>• Revenue reporting</li>
                  </ul>
                </div>
                <Link href="/admin/payments/transactions">
                  <Button className="w-full">
                    View Transactions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Gateway Configuration
              </CardTitle>
              <CardDescription>
                Configure and manage payment gateways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Gateway settings</li>
                    <li>• API configuration</li>
                    <li>• Fee management</li>
                    <li>• Security settings</li>
                  </ul>
                </div>
                <Link href="/admin/payments/gateways">
                  <Button className="w-full">
                    Configure Gateways
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payment Activity</CardTitle>
            <CardDescription>
              Latest payment transactions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Payment completed</p>
                    <p className="text-xs text-muted-foreground">₹50,000 - Semester Fee</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 minutes ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">New payment item added</p>
                    <p className="text-xs text-muted-foreground">Library Fee - ₹2,000</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">15 minutes ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Monthly report generated</p>
                    <p className="text-xs text-muted-foreground">Revenue: ₹3,45,200</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Gateway configuration updated</p>
                    <p className="text-xs text-muted-foreground">Razorpay settings modified</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
