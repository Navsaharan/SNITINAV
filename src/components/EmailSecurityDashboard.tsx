'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Scan, FileText, Users } from 'lucide-react'

interface EmailSecurityDashboardProps {
  userRole?: string
}

export default function EmailSecurityDashboard({ userRole }: EmailSecurityDashboardProps) {
  const [email, setEmail] = useState({
    subject: '',
    body: '',
    fromEmail: '',
    fromName: '',
    recipients: [{ email: '', type: 'TO' }],
    attachments: [],
    links: []
  })
  
  const [scanTypes, setScanTypes] = useState(['spam', 'phishing', 'compliance'])
  const [compliancePolicies, setCompliancePolicies] = useState(['GDPR', 'FERPA'])
  const [encryptionOptions, setEncryptionOptions] = useState({
    enabled: false,
    method: 'TLS',
    keyId: ''
  })
  
  const [scanResults, setScanResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const availableScanTypes = [
    { id: 'spam', name: 'Spam Detection', description: 'Detect unwanted and spam emails', icon: <Shield className="h-4 w-4" /> },
    { id: 'virus', name: 'Virus Scanning', description: 'Scan attachments for malware', icon: <Scan className="h-4 w-4" /> },
    { id: 'phishing', name: 'Phishing Detection', description: 'Identify phishing attempts', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'compliance', name: 'Compliance Check', description: 'Verify regulatory compliance', icon: <FileText className="h-4 w-4" /> }
  ]

  const availablePolicies = [
    { id: 'GDPR', name: 'GDPR', description: 'General Data Protection Regulation' },
    { id: 'HIPAA', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
    { id: 'SOX', name: 'SOX', description: 'Sarbanes-Oxley Act' },
    { id: 'FERPA', name: 'FERPA', description: 'Family Educational Rights and Privacy Act' }
  ]

  const runSecurityScan = async () => {
    if (!email.subject && !email.body) {
      alert('Please enter email content to scan')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/email-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          scanTypes,
          compliancePolicies,
          encryptionOptions: encryptionOptions.enabled ? encryptionOptions : undefined
        })
      })

      const data = await response.json()
      setScanResults(data.results)

    } catch (error) {
      console.error('Security scan failed:', error)
      alert('Security scan failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleScanTypeToggle = (scanType: string) => {
    setScanTypes(prev => 
      prev.includes(scanType) 
        ? prev.filter(t => t !== scanType)
        : [...prev, scanType]
    )
  }

  const handlePolicyToggle = (policy: string) => {
    setCompliancePolicies(prev => 
      prev.includes(policy) 
        ? prev.filter(p => p !== policy)
        : [...prev, policy]
    )
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'spam': return <Shield className="h-4 w-4" />
      case 'virus': case 'malware': return <Scan className="h-4 w-4" />
      case 'phishing': return <AlertTriangle className="h-4 w-4" />
      case 'suspicious': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Security & Compliance Scanner
          </CardTitle>
          <CardDescription>
            Comprehensive security scanning for spam, viruses, phishing, and compliance violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email">Email Content</TabsTrigger>
              <TabsTrigger value="scan">Scan Options</TabsTrigger>
              <TabsTrigger value="encryption">Encryption</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={email.fromEmail}
                    onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                    placeholder="sender@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={email.fromName}
                    onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                    placeholder="Sender Name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  placeholder="Email subject line"
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={email.body}
                  onChange={(e) => setEmail({ ...email, body: e.target.value })}
                  placeholder="Email content to scan for security threats..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Input
                  id="recipients"
                  value={email.recipients[0]?.email || ''}
                  onChange={(e) => setEmail({ 
                    ...email, 
                    recipients: [{ email: e.target.value, type: 'TO' }] 
                  })}
                  placeholder="recipient@institute.edu"
                />
              </div>
            </TabsContent>

            <TabsContent value="scan" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Security Scan Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {availableScanTypes.map((scanType) => (
                    <div key={scanType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={scanType.id}
                        checked={scanTypes.includes(scanType.id)}
                        onCheckedChange={() => handleScanTypeToggle(scanType.id)}
                      />
                      <Label htmlFor={scanType.id} className="flex items-center gap-2 cursor-pointer">
                        {scanType.icon}
                        <div>
                          <div className="font-medium">{scanType.name}</div>
                          <div className="text-xs text-muted-foreground">{scanType.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Compliance Policies</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {availablePolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={policy.id}
                        checked={compliancePolicies.includes(policy.id)}
                        onCheckedChange={() => handlePolicyToggle(policy.id)}
                      />
                      <Label htmlFor={policy.id} className="cursor-pointer">
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-xs text-muted-foreground">{policy.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="encryption" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableEncryption"
                  checked={encryptionOptions.enabled}
                  onCheckedChange={(checked) => 
                    setEncryptionOptions({ ...encryptionOptions, enabled: !!checked })
                  }
                />
                <Label htmlFor="enableEncryption" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Enable Email Encryption
                </Label>
              </div>

              {encryptionOptions.enabled && (
                <div className="space-y-4 ml-6">
                  <div>
                    <Label htmlFor="encryptionMethod">Encryption Method</Label>
                    <Select
                      value={encryptionOptions.method}
                      onValueChange={(value) => 
                        setEncryptionOptions({ ...encryptionOptions, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS">TLS (Transport Layer Security)</SelectItem>
                        <SelectItem value="PGP">PGP (Pretty Good Privacy)</SelectItem>
                        <SelectItem value="S/MIME">S/MIME (Secure/Multipurpose Internet Mail Extensions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(encryptionOptions.method === 'PGP' || encryptionOptions.method === 'S/MIME') && (
                    <div>
                      <Label htmlFor="keyId">Key ID / Certificate</Label>
                      <Input
                        id="keyId"
                        value={encryptionOptions.keyId}
                        onChange={(e) => 
                          setEncryptionOptions({ ...encryptionOptions, keyId: e.target.value })
                        }
                        placeholder="Enter key ID or certificate identifier"
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {scanResults ? (
                <div className="space-y-4">
                  {/* Overall Security Assessment */}
                  <Alert className={getRiskLevelColor(scanResults.overall?.riskLevel || 'low')}>
                    <AlertDescription>
                      <div className="flex items-center gap-2 mb-2">
                        {scanResults.overall?.safe ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          Overall Risk Level: {scanResults.overall?.riskLevel?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>Security Score: {((scanResults.overall?.score || 0) * 100).toFixed(1)}%</p>
                        <p>Recommendations: {scanResults.recommendationCount || 0}</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Individual Scan Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(scanResults.security).map(([scanType, result]: [string, any]) => (
                      <Card key={scanType}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-lg">
                            <span className="flex items-center gap-2">
                              {getThreatIcon(scanType)}
                              {scanType.charAt(0).toUpperCase() + scanType.slice(1)}
                            </span>
                            <Badge variant={result.safe ? 'default' : 'destructive'}>
                              {result.safe ? 'SAFE' : 'THREAT'}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {result.score !== undefined && (
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Risk Score</span>
                                  <span>{(result.score * 100).toFixed(1)}%</span>
                                </div>
                                <Progress value={result.score * 100} className="h-2" />
                              </div>
                            )}
                            
                            {result.threats && result.threats.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Threats Detected:</p>
                                {result.threats.slice(0, 3).map((threat: any, index: number) => (
                                  <div key={index} className="text-xs text-muted-foreground">
                                    • {threat.description} ({threat.severity})
                                  </div>
                                ))}
                                {result.threats.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{result.threats.length - 3} more threats
                                  </p>
                                )}
                              </div>
                            )}

                            {result.violations && result.violations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Compliance Violations:</p>
                                {result.violations.slice(0, 2).map((violation: any, index: number) => (
                                  <div key={index} className="text-xs text-muted-foreground">
                                    • {violation.description}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {scanResults.recommendations && scanResults.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {scanResults.recommendations.map((recommendation: string, index: number) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No scan results yet. Run a security scan to see results here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button 
              onClick={runSecurityScan} 
              disabled={loading || scanTypes.length === 0}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Scanning...' : 'Run Security Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
