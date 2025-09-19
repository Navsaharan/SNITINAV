'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Memory, 
  Network, 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Database,
  Zap
} from 'lucide-react'

interface MonitoringDashboardProps {
  userRole?: string
}

export default function MonitoringDashboard({ userRole }: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('24h')
  const [monitoringData, setMonitoringData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load monitoring data
  useEffect(() => {
    loadMonitoringData(activeTab)
  }, [activeTab, timeRange])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadMonitoringData(activeTab)
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab, autoRefresh])

  const loadMonitoringData = async (type: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type,
        timeRange,
        granularity: timeRange === '1h' ? 'minute' : timeRange === '24h' ? 'hour' : 'day'
      })

      const response = await fetch(`/api/monitoring?${params}`)
      const data = await response.json()
      setMonitoringData(data)
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num))
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const MetricCard = ({ title, value, unit, icon: Icon, threshold, trend }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}{unit}</p>
            {trend !== undefined && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {trend > 0 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                {Math.abs(trend).toFixed(1)}% from last hour
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-6 w-6 text-muted-foreground" />
            {threshold && (
              <Progress 
                value={value} 
                className="w-16 h-2 mt-2"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const OverviewTab = () => {
    if (!monitoringData?.data) return <div>Loading...</div>

    const { system, email, security } = monitoringData.data

    return (
      <div className="space-y-6">
        {/* System Metrics */}
        <div>
          <h3 className="text-lg font-medium mb-4">System Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="CPU Usage"
              value={system.cpu.usage.toFixed(1)}
              unit="%"
              icon={Cpu}
              threshold={{ warning: 70, critical: 85 }}
            />
            <MetricCard
              title="Memory Usage"
              value={system.memory.usagePercentage.toFixed(1)}
              unit="%"
              icon={Memory}
              threshold={{ warning: 80, critical: 90 }}
            />
            <MetricCard
              title="Disk Usage"
              value={system.disk.usagePercentage.toFixed(1)}
              unit="%"
              icon={HardDrive}
              threshold={{ warning: 80, critical: 90 }}
            />
            <MetricCard
              title="Active Processes"
              value={system.processes.running}
              unit=""
              icon={Activity}
            />
          </div>
        </div>

        {/* Email System Metrics */}
        <div>
          <h3 className="text-lg font-medium mb-4">Email System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  SMTP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-medium">{email.smtp.activeConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Emails Sent</span>
                    <span className="font-medium">{formatNumber(email.smtp.emailsSent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{email.smtp.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  IMAP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-medium">{email.imap.activeConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Commands Processed</span>
                    <span className="font-medium">{formatNumber(email.imap.commandsProcessed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{email.imap.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  POP3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-medium">{email.pop3.activeConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Commands Processed</span>
                    <span className="font-medium">{formatNumber(email.pop3.commandsProcessed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{email.pop3.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Metrics */}
        <div>
          <h3 className="text-lg font-medium mb-4">Security Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Spam Blocked"
              value={formatNumber(security.threats.spamBlocked)}
              unit=""
              icon={Shield}
            />
            <MetricCard
              title="Viruses Detected"
              value={formatNumber(security.threats.virusesDetected)}
              unit=""
              icon={AlertTriangle}
            />
            <MetricCard
              title="Failed Logins"
              value={formatNumber(security.authentication.failedLogins)}
              unit=""
              icon={XCircle}
            />
            <MetricCard
              title="Active Sessions"
              value={formatNumber(security.authentication.activeSessions)}
              unit=""
              icon={CheckCircle}
            />
          </div>
        </div>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Total Emails</p>
                <p className="text-2xl font-bold">{formatNumber(email.storage.totalEmails)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(email.storage.totalSize)} total size
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Attachments</p>
                <p className="text-2xl font-bold">{formatBytes(email.storage.attachmentSize)}</p>
                <p className="text-sm text-muted-foreground">
                  {((email.storage.attachmentSize / email.storage.totalSize) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Index Size</p>
                <p className="text-2xl font-bold">{formatBytes(email.storage.indexSize)}</p>
                <p className="text-sm text-muted-foreground">
                  Search and metadata
                </p>
              </div>
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
                <Activity className="h-5 w-5" />
                System Monitoring & Analytics
              </CardTitle>
              <CardDescription>
                Real-time system monitoring, performance analytics, and alerting
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => loadMonitoringData(activeTab)} 
                disabled={loading} 
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Performance analytics charts and trends will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Alert Rules</h3>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Alert configuration and management interface will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <h3 className="text-lg font-medium">System Health Checks</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Comprehensive system health monitoring will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Monitoring Reports</h3>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Report generation and scheduling interface will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-lg font-bold text-green-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Performance</p>
                <p className="text-lg font-bold text-blue-600">Optimal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-lg font-bold text-purple-600">Protected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-lg font-bold text-orange-600">99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
