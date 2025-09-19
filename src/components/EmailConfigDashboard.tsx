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
import { CheckCircle, XCircle, Download, Copy, TestTube, Settings } from 'lucide-react'

interface EmailConfigDashboardProps {
  userEmail?: string
}

export default function EmailConfigDashboard({ userEmail }: EmailConfigDashboardProps) {
  const [selectedClient, setSelectedClient] = useState('outlook')
  const [selectedProtocol, setSelectedProtocol] = useState<'IMAP' | 'POP3'>('IMAP')
  const [config, setConfig] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: userEmail || '', password: '' })

  const clients = [
    { value: 'outlook', label: 'Microsoft Outlook', icon: '📧' },
    { value: 'thunderbird', label: 'Mozilla Thunderbird', icon: '🦅' },
    { value: 'apple', label: 'Apple Mail', icon: '🍎' },
    { value: 'android', label: 'Android Email', icon: '🤖' },
    { value: 'ios', label: 'iOS Mail', icon: '📱' },
    { value: 'legacy', label: 'Legacy Clients', icon: '🖥️' }
  ]

  // Load configuration when client or protocol changes
  useEffect(() => {
    loadConfiguration()
  }, [selectedClient, selectedProtocol])

  const loadConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/email-config?client=${selectedClient}&protocol=${selectedProtocol}`)
      const data = await response.json()
      setConfig(data.clientConfig)
      setValidation(data.validation)
    } catch (error) {
      console.error('Failed to load configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/email-config/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          protocol: selectedProtocol
        })
      })
      const data = await response.json()
      setValidation(data.validation)
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConfiguration = async () => {
    if (!credentials.username || !credentials.password) {
      alert('Please enter your email credentials to test the configuration')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          protocol: selectedProtocol,
          credentials,
          testType: 'comprehensive'
        })
      })
      const data = await response.json()
      setTestResults(data.results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadConfig = async (format: string) => {
    try {
      const response = await fetch(`/api/email-config?client=${selectedClient}&protocol=${selectedProtocol}&format=${format}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-config.${format === 'apple' ? 'mobileconfig' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Client Configuration
          </CardTitle>
          <CardDescription>
            Configure your email client to connect to the SNPITC email system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="client">Email Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.value} value={client.value}>
                      <span className="flex items-center gap-2">
                        <span>{client.icon}</span>
                        {client.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={selectedProtocol} onValueChange={(value) => setSelectedProtocol(value as 'IMAP' | 'POP3')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAP">IMAP (Recommended)</SelectItem>
                  <SelectItem value="POP3">POP3 (Legacy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={validateConfiguration} disabled={loading} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button onClick={testConfiguration} disabled={loading} variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button onClick={() => downloadConfig('xml')} disabled={loading} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download XML
            </Button>
          </div>

          {validation && (
            <Alert className={validation.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <div className="flex items-center gap-2 mb-2">
                  {validation.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    Configuration {validation.valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {validation.errors?.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {validation.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                {validation.warnings?.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-yellow-600">
                    {validation.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {config && (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            <TabsTrigger value="automatic">Auto Config</TabsTrigger>
            <TabsTrigger value="test">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Configuration for {config.displayName}</CardTitle>
                <CardDescription>
                  Follow these steps to configure your email client manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Setup Instructions</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {config.instructions?.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Incoming Server ({config.settings.incomingServer.protocol})</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Server:</span>
                          <span className="font-mono">{config.settings.incomingServer.server}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(config.settings.incomingServer.server)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between">
                          <span>Port:</span>
                          <span>{config.settings.incomingServer.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security:</span>
                          <span>{config.settings.incomingServer.security}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Outgoing Server (SMTP)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Server:</span>
                          <span className="font-mono">{config.settings.outgoingServer.server}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(config.settings.outgoingServer.server)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between">
                          <span>Port:</span>
                          <span>{config.settings.outgoingServer.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security:</span>
                          <span>{config.settings.outgoingServer.security}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {config.warnings && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription>
                        <ul className="list-disc list-inside text-sm">
                          {config.warnings.map((warning: string, index: number) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automatic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Configuration</CardTitle>
                <CardDescription>
                  Download configuration files for automatic setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => downloadConfig('autodiscover')} className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Autodiscover XML
                    <span className="text-xs opacity-70">For Outlook</span>
                  </Button>
                  <Button onClick={() => downloadConfig('thunderbird')} className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Autoconfig XML
                    <span className="text-xs opacity-70">For Thunderbird</span>
                  </Button>
                  <Button onClick={() => downloadConfig('apple')} className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Mobile Config
                    <span className="text-xs opacity-70">For iOS/macOS</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Test your email configuration with your credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="username">Email Address</Label>
                    <Input
                      id="username"
                      type="email"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      placeholder="your-email@institute.edu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      placeholder="Your password"
                    />
                  </div>
                </div>

                {testResults && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Test Results</h4>
                    {testResults.tests.configuration && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          {testResults.tests.configuration.results.smtp ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>SMTP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {testResults.tests.configuration.results.incoming ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>{selectedProtocol}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {testResults.tests.configuration.results.authentication ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Auth</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
