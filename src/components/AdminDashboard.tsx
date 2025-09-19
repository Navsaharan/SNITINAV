'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Mail, 
  HardDrive, 
  Activity, 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Database,
  Server,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react'

interface AdminDashboardProps {
  userRole?: string
}

export default function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData(activeTab)
  }, [activeTab])

  const loadDashboardData = async (section: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin?section=${section}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData(activeTab)
    setRefreshing(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': case 'healthy': case 'pass': return 'text-green-600 bg-green-50'
      case 'warning': case 'warn': return 'text-yellow-600 bg-yellow-50'
      case 'error': case 'critical': case 'fail': return 'text-red-600 bg-red-50'
      case 'inactive': case 'suspended': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {trend && (trend > 0 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />)}
                {subtitle}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )

  const OverviewTab = () => {
    if (!dashboardData?.data) return <div>Loading...</div>

    const { stats, alerts, health } = dashboardData.data

    return (
      <div className="space-y-6">
        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={formatNumber(stats.users.total)}
            subtitle={`${stats.users.newThisMonth} new this month`}
            icon={Users}
            trend={stats.users.newThisMonth}
          />
          <StatCard
            title="Emails Today"
            value={formatNumber(stats.emails.todaysSent + stats.emails.todaysReceived)}
            subtitle={`${formatNumber(stats.emails.todaysSent)} sent, ${formatNumber(stats.emails.todaysReceived)} received`}
            icon={Mail}
          />
          <StatCard
            title="Storage Used"
            value={formatBytes(stats.storage.totalUsed)}
            subtitle={`${stats.storage.usagePercentage}% of ${formatBytes(stats.storage.totalAvailable)}`}
            icon={HardDrive}
          />
          <StatCard
            title="System Health"
            value={health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            subtitle={`${health.checks.filter((c: any) => c.status === 'pass').length}/${health.checks.length} checks passing`}
            icon={Activity}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-xl font-bold">{stats.performance.averageResponseTime}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-xl font-bold">{stats.performance.uptime}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Throughput</p>
                  <p className="text-xl font-bold">{formatNumber(stats.performance.throughput)}/hr</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Threats Blocked</p>
                  <p className="text-xl font-bold">{formatNumber(stats.security.threatsStopped)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Alerts</span>
              <Badge variant="outline">{alerts.length} unacknowledged</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {alert.type === 'ERROR' || alert.type === 'CRITICAL' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : alert.type === 'WARNING' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(alert.type)}>
                        {alert.type}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent alerts</p>
            )}
          </CardContent>
        </Card>

        {/* System Health Checks */}
        <Card>
          <CardHeader>
            <CardTitle>System Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.checks.map((check: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {check.status === 'pass' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                    {check.responseTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Administration
              </CardTitle>
              <CardDescription>
                Comprehensive system management and monitoring dashboard
              </CardDescription>
            </div>
            <Button onClick={refreshData} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Management</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">User management interface will be implemented here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <h3 className="text-lg font-medium">System Configuration</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">System configuration interface will be implemented here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <h3 className="text-lg font-medium">Audit Logs</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Audit log interface will be implemented here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <h3 className="text-lg font-medium">System Alerts</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Alert management interface will be implemented here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <h3 className="text-lg font-medium">System Maintenance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Backup System
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cleanup Logs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
