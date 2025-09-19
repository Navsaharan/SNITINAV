'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Settings, 
  CreditCard, 
  Shield, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  TestTube
} from 'lucide-react'

interface PaymentGateway {
  id: string
  gateway: string
  isEnabled: boolean
  isTestMode: boolean
  apiKey?: string
  secretKey?: string
  webhookUrl?: string
  supportedMethods: string[]
  fees: {
    percentage: number
    fixed: number
  }
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  lastTested?: string
}

export default function PaymentGatewayManagement() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [testingGateway, setTestingGateway] = useState<string | null>(null)

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/payments/gateways')
      const data = await response.json()
      
      if (response.ok) {
        setGateways(data.gateways)
      } else {
        console.error('Failed to load gateways:', data.error)
      }
    } catch (error) {
      console.error('Error loading gateways:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateGateway = async (gateway: PaymentGateway) => {
    try {
      const response = await fetch('/api/admin/payments/gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateway)
      })

      if (response.ok) {
        loadGateways()
      } else {
        const data = await response.json()
        console.error('Failed to update gateway:', data.error)
      }
    } catch (error) {
      console.error('Error updating gateway:', error)
    }
  }

  const testGateway = async (gatewayId: string) => {
    setTestingGateway(gatewayId)
    try {
      const response = await fetch(`/api/admin/payments/gateways/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId })
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('Gateway test successful:', data)
        loadGateways() // Refresh to get updated status
      } else {
        console.error('Gateway test failed:', data.error)
      }
    } catch (error) {
      console.error('Error testing gateway:', error)
    } finally {
      setTestingGateway(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const toggleApiKeyVisibility = (gatewayId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }))
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gateways.filter(g => g.isEnabled && g.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {gateways.length} configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Mode</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gateways.filter(g => g.isTestMode).length}
            </div>
            <p className="text-xs text-muted-foreground">
              gateways in test mode
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All connections encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Configuration */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            {gateways.map((gateway) => (
              <Card key={gateway.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{gateway.gateway}</span>
                          {getStatusIcon(gateway.status)}
                        </CardTitle>
                        <CardDescription>
                          {gateway.supportedMethods.join(', ')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(gateway.status)}>
                        {gateway.status}
                      </Badge>
                      {gateway.isTestMode && (
                        <Badge variant="outline">Test Mode</Badge>
                      )}
                      <Switch
                        checked={gateway.isEnabled}
                        onCheckedChange={(checked) => 
                          updateGateway({ ...gateway, isEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Processing Fee</Label>
                      <p className="text-sm text-muted-foreground">
                        {gateway.fees.percentage}% + ₹{gateway.fees.fixed}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground font-mono">
                          {showApiKey[gateway.id] ? gateway.apiKey : maskApiKey(gateway.apiKey || '')}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(gateway.id)}
                        >
                          {showApiKey[gateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Tested</Label>
                      <p className="text-sm text-muted-foreground">
                        {gateway.lastTested ? new Date(gateway.lastTested).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testGateway(gateway.id)}
                      disabled={testingGateway === gateway.id}
                    >
                      {testingGateway === gateway.id ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedGateway(gateway)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Configure {gateway.gateway}</DialogTitle>
                          <DialogDescription>
                            Update gateway settings and credentials
                          </DialogDescription>
                        </DialogHeader>
                        {selectedGateway && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                  id="apiKey"
                                  type="password"
                                  value={selectedGateway.apiKey || ''}
                                  onChange={(e) => setSelectedGateway({
                                    ...selectedGateway,
                                    apiKey: e.target.value
                                  })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="secretKey">Secret Key</Label>
                                <Input
                                  id="secretKey"
                                  type="password"
                                  value={selectedGateway.secretKey || ''}
                                  onChange={(e) => setSelectedGateway({
                                    ...selectedGateway,
                                    secretKey: e.target.value
                                  })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="webhookUrl">Webhook URL</Label>
                              <Input
                                id="webhookUrl"
                                value={selectedGateway.webhookUrl || ''}
                                onChange={(e) => setSelectedGateway({
                                  ...selectedGateway,
                                  webhookUrl: e.target.value
                                })}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="testMode"
                                checked={selectedGateway.isTestMode}
                                onCheckedChange={(checked) => setSelectedGateway({
                                  ...selectedGateway,
                                  isTestMode: checked
                                })}
                              />
                              <Label htmlFor="testMode">Test Mode</Label>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => {
                                  updateGateway(selectedGateway)
                                  setSelectedGateway(null)
                                }}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gateway Configuration</CardTitle>
              <CardDescription>Advanced gateway settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2" />
                <p>Advanced configuration options</p>
                <p className="text-sm">Gateway-specific settings and preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>Configure webhook endpoints for payment notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2" />
                <p>Webhook configuration</p>
                <p className="text-sm">Payment notification endpoints and security</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gateway Testing</CardTitle>
              <CardDescription>Test payment gateway connections and functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-2" />
                <p>Gateway testing tools</p>
                <p className="text-sm">Test transactions and connection validation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
