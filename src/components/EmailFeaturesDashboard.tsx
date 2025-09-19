'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Filter, 
  Reply, 
  Forward, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  CheckCircle,
  XCircle,
  ArrowRight,
  Mail
} from 'lucide-react'

interface EmailFeaturesDashboardProps {
  userId?: string
}

export default function EmailFeaturesDashboard({ userId }: EmailFeaturesDashboardProps) {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules, setRules] = useState<any[]>([])
  const [filters, setFilters] = useState<any[]>([])
  const [autoResponders, setAutoResponders] = useState<any[]>([])
  const [forwardingRules, setForwardingRules] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Sample data - in production, this would come from API
  useEffect(() => {
    setRules([
      {
        id: 'rule-1',
        name: 'Important Emails',
        enabled: true,
        priority: 1,
        conditions: [{ field: 'from', operator: 'contains', value: 'boss@company.com' }],
        actions: [{ type: 'flag', parameters: { flag: 'important' } }]
      }
    ])

    setFilters([
      {
        id: 'filter-1',
        name: 'Spam Filter',
        type: 'spam',
        enabled: true,
        criteria: { keywords: ['urgent', 'act now'] },
        action: 'quarantine'
      }
    ])

    setAutoResponders([
      {
        id: 'responder-1',
        name: 'Out of Office',
        enabled: false,
        response: { subject: 'Out of Office', body: 'I am currently out of office.' },
        stats: { totalSent: 0 }
      }
    ])

    setForwardingRules([
      {
        id: 'forward-1',
        enabled: true,
        conditions: { subjects: ['urgent'] },
        forwardTo: ['manager@institute.edu'],
        stats: { totalForwarded: 5 }
      }
    ])
  }, [])

  const toggleFeature = async (type: string, id: string) => {
    // In production, this would call the API
    console.log(`Toggling ${type} ${id}`)
  }

  const deleteFeature = async (type: string, id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // In production, this would call the API
      console.log(`Deleting ${type} ${id}`)
    }
  }

  const FeatureCard = ({ 
    title, 
    description, 
    enabled, 
    onToggle, 
    onEdit, 
    onDelete, 
    children 
  }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={onToggle} />
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )

  const RuleCard = ({ rule }: { rule: any }) => (
    <FeatureCard
      title={rule.name}
      description={`Priority: ${rule.priority} • ${rule.conditions.length} condition(s) • ${rule.actions.length} action(s)`}
      enabled={rule.enabled}
      onToggle={() => toggleFeature('rule', rule.id)}
      onEdit={() => setEditingItem({ type: 'rule', data: rule })}
      onDelete={() => deleteFeature('rule', rule.id)}
    >
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">Conditions:</p>
          {rule.conditions.map((condition: any, index: number) => (
            <Badge key={index} variant="outline" className="mr-1">
              {condition.field} {condition.operator} "{condition.value}"
            </Badge>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium">Actions:</p>
          {rule.actions.map((action: any, index: number) => (
            <Badge key={index} variant="secondary" className="mr-1">
              {action.type} {action.target && `→ ${action.target}`}
            </Badge>
          ))}
        </div>
      </div>
    </FeatureCard>
  )

  const FilterCard = ({ filter }: { filter: any }) => (
    <FeatureCard
      title={filter.name}
      description={`Type: ${filter.type} • Action: ${filter.action}`}
      enabled={filter.enabled}
      onToggle={() => toggleFeature('filter', filter.id)}
      onEdit={() => setEditingItem({ type: 'filter', data: filter })}
      onDelete={() => deleteFeature('filter', filter.id)}
    >
      <div className="space-y-2">
        {filter.criteria.keywords && (
          <div>
            <p className="text-sm font-medium">Keywords:</p>
            <div className="flex flex-wrap gap-1">
              {filter.criteria.keywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="outline">{keyword}</Badge>
              ))}
            </div>
          </div>
        )}
        {filter.criteria.domains && (
          <div>
            <p className="text-sm font-medium">Domains:</p>
            <div className="flex flex-wrap gap-1">
              {filter.criteria.domains.map((domain: string, index: number) => (
                <Badge key={index} variant="outline">{domain}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeatureCard>
  )

  const AutoResponderCard = ({ responder }: { responder: any }) => (
    <FeatureCard
      title={responder.name}
      description={`Sent: ${responder.stats.totalSent} responses`}
      enabled={responder.enabled}
      onToggle={() => toggleFeature('autoresponder', responder.id)}
      onEdit={() => setEditingItem({ type: 'autoresponder', data: responder })}
      onDelete={() => deleteFeature('autoresponder', responder.id)}
    >
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">Subject:</p>
          <p className="text-sm text-muted-foreground">{responder.response.subject}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Message:</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{responder.response.body}</p>
        </div>
      </div>
    </FeatureCard>
  )

  const ForwardingCard = ({ forwarding }: { forwarding: any }) => (
    <FeatureCard
      title="Email Forwarding Rule"
      description={`Forwarded: ${forwarding.stats.totalForwarded} emails`}
      enabled={forwarding.enabled}
      onToggle={() => toggleFeature('forwarding', forwarding.id)}
      onEdit={() => setEditingItem({ type: 'forwarding', data: forwarding })}
      onDelete={() => deleteFeature('forwarding', forwarding.id)}
    >
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">Forward To:</p>
          <div className="flex flex-wrap gap-1">
            {forwarding.forwardTo.map((email: string, index: number) => (
              <Badge key={index} variant="outline">{email}</Badge>
            ))}
          </div>
        </div>
        {forwarding.conditions.subjects && (
          <div>
            <p className="text-sm font-medium">Subject Contains:</p>
            <div className="flex flex-wrap gap-1">
              {forwarding.conditions.subjects.map((subject: string, index: number) => (
                <Badge key={index} variant="outline">{subject}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeatureCard>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Email Features
          </CardTitle>
          <CardDescription>
            Manage email rules, filters, auto-responders, and forwarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="autoresponder" className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Auto-Reply
              </TabsTrigger>
              <TabsTrigger value="forwarding" className="flex items-center gap-2">
                <Forward className="h-4 w-4" />
                Forwarding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Rules</h3>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
              
              <div className="space-y-4">
                {rules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
                {rules.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No email rules configured</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Filters</h3>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Filter
                </Button>
              </div>
              
              <div className="space-y-4">
                {filters.map((filter) => (
                  <FilterCard key={filter.id} filter={filter} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="autoresponder" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Auto-Responders</h3>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Auto-Responder
                </Button>
              </div>
              
              <div className="space-y-4">
                {autoResponders.map((responder) => (
                  <AutoResponderCard key={responder.id} responder={responder} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="forwarding" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Forwarding</h3>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forwarding Rule
                </Button>
              </div>
              
              <div className="space-y-4">
                {forwardingRules.map((forwarding) => (
                  <ForwardingCard key={forwarding.id} forwarding={forwarding} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feature Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Filters</p>
                <p className="text-2xl font-bold">{filters.filter(f => f.enabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Auto-Responses</p>
                <p className="text-2xl font-bold">
                  {autoResponders.reduce((sum, r) => sum + r.stats.totalSent, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Forward className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Emails Forwarded</p>
                <p className="text-2xl font-bold">
                  {forwardingRules.reduce((sum, f) => sum + f.stats.totalForwarded, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common email feature configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Out of Office</p>
                  <p className="text-sm text-muted-foreground">Set up automatic out-of-office replies</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Spam Protection</p>
                  <p className="text-sm text-muted-foreground">Configure spam filtering rules</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <Forward className="h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Email Forwarding</p>
                  <p className="text-sm text-muted-foreground">Forward emails to another address</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Organization Rules</p>
                  <p className="text-sm text-muted-foreground">Automatically organize incoming emails</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
