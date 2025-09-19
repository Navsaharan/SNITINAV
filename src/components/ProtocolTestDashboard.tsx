'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Play, Download, RefreshCw, TestTube, Activity, Shield, Zap } from 'lucide-react'

interface ProtocolTestDashboardProps {
  userEmail?: string
}

export default function ProtocolTestDashboard({ userEmail }: ProtocolTestDashboardProps) {
  const [credentials, setCredentials] = useState({ username: userEmail || '', password: '' })
  const [testEmail, setTestEmail] = useState({ to: '', subject: 'Test Email', body: 'This is a test email' })
  const [selectedProtocols, setSelectedProtocols] = useState(['SMTP', 'IMAP', 'POP3'])
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  const protocols = [
    { id: 'SMTP', name: 'SMTP', description: 'Email sending protocol', icon: '📤' },
    { id: 'IMAP', name: 'IMAP', description: 'Email access protocol', icon: '📥' },
    { id: 'POP3', name: 'POP3', description: 'Email download protocol', icon: '📬' }
  ]

  const testScenarios = [
    { id: 'connectivity', name: 'Connectivity', description: 'Test basic protocol connections', icon: <Activity className="h-4 w-4" /> },
    { id: 'authentication', name: 'Authentication', description: 'Test user authentication', icon: <Shield className="h-4 w-4" /> },
    { id: 'performance', name: 'Performance', description: 'Test response times and throughput', icon: <Zap className="h-4 w-4" /> },
    { id: 'compatibility', name: 'Compatibility', description: 'Test email client compatibility', icon: <TestTube className="h-4 w-4" /> }
  ]

  const runComprehensiveTest = async () => {
    if (!credentials.username || !credentials.password) {
      alert('Please enter your credentials')
      return
    }

    setLoading(true)
    setTestProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/protocol-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials,
          testEmail: testEmail.to ? testEmail : undefined,
          protocols: selectedProtocols
        })
      })

      clearInterval(progressInterval)
      setTestProgress(100)

      const data = await response.json()
      setTestResults(data)

    } catch (error) {
      console.error('Test failed:', error)
      alert('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
      setTimeout(() => setTestProgress(0), 1000)
    }
  }

  const runScenarioTest = async (scenario: string) => {
    if (!credentials.username || !credentials.password) {
      alert('Please enter your credentials')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/protocol-test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          credentials
        })
      })

      const data = await response.json()
      setTestResults(data)

    } catch (error) {
      console.error('Scenario test failed:', error)
      alert('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!testResults?.report) return

    const blob = new Blob([testResults.report], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protocol-test-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleProtocolToggle = (protocolId: string) => {
    setSelectedProtocols(prev => 
      prev.includes(protocolId) 
        ? prev.filter(p => p !== protocolId)
        : [...prev, protocolId]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Protocol Testing & Validation
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for SMTP, IMAP, and POP3 protocol implementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          <div className="mb-6">
            <Label className="text-base font-medium">Protocols to Test</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {protocols.map((protocol) => (
                <div key={protocol.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={protocol.id}
                    checked={selectedProtocols.includes(protocol.id)}
                    onCheckedChange={() => handleProtocolToggle(protocol.id)}
                  />
                  <Label htmlFor={protocol.id} className="flex items-center gap-2 cursor-pointer">
                    <span>{protocol.icon}</span>
                    <div>
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-xs text-muted-foreground">{protocol.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="mb-6">
              <Label className="text-sm font-medium">Test Progress</Label>
              <Progress value={testProgress} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Running protocol tests... {testProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={runComprehensiveTest} 
              disabled={loading || selectedProtocols.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Comprehensive Test
            </Button>
            {testResults?.report && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="config">Test Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {scenario.icon}
                    {scenario.name}
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => runScenarioTest(scenario.id)}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Run {scenario.name} Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults ? (
            <div className="space-y-4">
              <Alert className={testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-2">
                    {testResults.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      Overall Test Result: {testResults.success ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  {testResults.summary && (
                    <div className="text-sm">
                      <p>Total Tests: {testResults.summary.totalTests}</p>
                      <p>Passed: {testResults.summary.passedTests}</p>
                      <p>Failed: {testResults.summary.failedTests}</p>
                      <p>Duration: {testResults.summary.duration}ms</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {testResults.results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(testResults.results).filter(([key]) => key !== 'overall').map(([protocol, result]: [string, any]) => (
                    <Card key={protocol}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span>{protocol.toUpperCase()}</span>
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'PASSED' : 'FAILED'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <p>Tests: {result.summary?.passed || 0}/{result.summary?.total || 0}</p>
                            <p>Duration: {result.totalDuration || 0}ms</p>
                          </div>
                          {result.tests && (
                            <div className="space-y-1">
                              {result.tests.slice(0, 3).map((test: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {test.success ? (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-red-600" />
                                  )}
                                  <span>{test.name}</span>
                                </div>
                              ))}
                              {result.tests.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{result.tests.length - 3} more tests
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No test results yet. Run a test to see results here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Email Configuration</CardTitle>
              <CardDescription>
                Configure a test email to send during SMTP testing (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testTo">To Email</Label>
                  <Input
                    id="testTo"
                    type="email"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                    placeholder="recipient@institute.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="testSubject">Subject</Label>
                  <Input
                    id="testSubject"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                    placeholder="Test Email Subject"
                  />
                </div>
                <div>
                  <Label htmlFor="testBody">Message Body</Label>
                  <Textarea
                    id="testBody"
                    value={testEmail.body}
                    onChange={(e) => setTestEmail({ ...testEmail, body: e.target.value })}
                    placeholder="Test email message content"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
