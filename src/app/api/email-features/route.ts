import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  EmailRulesEngine,
  EmailFilterService,
  AutoResponderService,
  EmailForwardingService,
  type EmailRule,
  type EmailFilter,
  type AutoResponder,
  type EmailForwarding
} from '@/lib/email-features'

// POST /api/email-features - Process email through advanced features
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      email,
      features = ['rules', 'filters', 'autoresponder', 'forwarding'],
      userRules = [],
      userFilters = [],
      userAutoResponders = [],
      userForwardingRules = []
    } = await request.json()

    if (!email) {
      return NextResponse.json({
        error: 'Email content required',
        required: ['email']
      }, { status: 400 })
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      email: {
        id: email.id,
        from: email.from,
        subject: email.subject,
        size: email.size || 0
      },
      processing: {},
      actions: []
    }

    // Process Email Rules
    if (features.includes('rules') && userRules.length > 0) {
      const rulesEngine = new EmailRulesEngine(userRules)
      const rulesResult = await rulesEngine.processEmail(email)
      
      results.processing.rules = rulesResult
      if (rulesResult.processed) {
        results.actions.push(...rulesResult.actions)
      }
    }

    // Process Email Filters
    if (features.includes('filters') && userFilters.length > 0) {
      const filterService = new EmailFilterService(userFilters)
      const filterResult = await filterService.filterEmail(email)
      
      results.processing.filters = filterResult
      if (!filterResult.allowed) {
        results.actions.push({
          type: 'filter',
          action: filterResult.action,
          reason: filterResult.reason,
          matchedFilters: filterResult.matchedFilters
        })
      }
    }

    // Process Auto-Responders
    if (features.includes('autoresponder') && userAutoResponders.length > 0) {
      const autoResponderService = new AutoResponderService(userAutoResponders)
      const autoResponderResult = await autoResponderService.processEmail({
        ...email,
        receivedAt: new Date()
      })
      
      results.processing.autoresponder = autoResponderResult
      if (autoResponderResult.shouldRespond) {
        results.actions.push(...autoResponderResult.responses.map(response => ({
          type: 'autoresponder',
          responderId: response.responderId,
          response: response.response
        })))
      }
    }

    // Process Email Forwarding
    if (features.includes('forwarding') && userForwardingRules.length > 0) {
      const forwardingService = new EmailForwardingService(userForwardingRules)
      const forwardingResult = await forwardingService.processEmail(email)
      
      results.processing.forwarding = forwardingResult
      if (forwardingResult.shouldForward) {
        results.actions.push(...forwardingResult.forwardingActions.map(action => ({
          type: 'forwarding',
          ruleId: action.ruleId,
          forwardTo: action.forwardTo,
          settings: action.settings
        })))
      }
    }

    // Overall processing summary
    results.summary = {
      featuresProcessed: features,
      totalActions: results.actions.length,
      rulesApplied: results.processing.rules?.appliedRules?.length || 0,
      filtersMatched: results.processing.filters?.matchedFilters?.length || 0,
      autoResponsesSent: results.processing.autoresponder?.responses?.length || 0,
      emailsForwarded: results.processing.forwarding?.forwardingActions?.length || 0
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Email features processing error:', error)
    return NextResponse.json({
      error: 'Email features processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// GET /api/email-features - Get email features information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    service: 'Advanced Email Features',
    description: 'Comprehensive email processing with rules, filters, auto-responders, and forwarding',
    features: {
      emailRules: {
        description: 'Automated email processing based on customizable rules',
        capabilities: [
          'Condition-based email processing',
          'Multiple action types (move, copy, delete, forward, reply)',
          'Priority-based rule execution',
          'Complex condition matching'
        ],
        conditions: [
          'from - Sender email address',
          'to - Recipient email addresses',
          'subject - Email subject line',
          'body - Email content',
          'attachment - Attachment filenames',
          'size - Email size in bytes'
        ],
        operators: [
          'contains - Text contains value',
          'equals - Exact match',
          'startsWith - Text starts with value',
          'endsWith - Text ends with value',
          'regex - Regular expression match',
          'greaterThan - Numeric greater than',
          'lessThan - Numeric less than'
        ],
        actions: [
          'move - Move to folder',
          'copy - Copy to folder',
          'delete - Delete email',
          'forward - Forward to address',
          'reply - Send auto-reply',
          'flag - Add flag/label',
          'label - Add custom label',
          'block - Block sender'
        ]
      },
      emailFilters: {
        description: 'Email filtering for spam prevention and content control',
        capabilities: [
          'Sender-based filtering',
          'Domain-based filtering',
          'Keyword-based filtering',
          'Pattern-based filtering'
        ],
        filterTypes: [
          'spam - Spam detection and blocking',
          'whitelist - Allowed senders/domains',
          'blacklist - Blocked senders/domains',
          'custom - Custom filter criteria'
        ],
        actions: [
          'allow - Allow email through',
          'block - Block email completely',
          'quarantine - Move to quarantine',
          'flag - Flag for review'
        ]
      },
      autoResponders: {
        description: 'Automated email responses for out-of-office and standard replies',
        capabilities: [
          'Date range-based responses',
          'Sender-specific responses',
          'Subject-based triggers',
          'Response rate limiting'
        ],
        settings: [
          'maxResponsesPerDay - Daily response limit',
          'cooldownHours - Hours between responses',
          'excludeInternalEmails - Skip internal emails',
          'onlyFirstTime - Respond only once per sender'
        ]
      },
      emailForwarding: {
        description: 'Automatic email forwarding based on conditions',
        capabilities: [
          'Condition-based forwarding',
          'Multiple recipient forwarding',
          'Attachment preservation',
          'Forwarding headers'
        ],
        settings: [
          'keepOriginal - Keep original in inbox',
          'addForwardingHeader - Add forwarding information',
          'preserveAttachments - Include attachments'
        ]
      }
    },
    usage: {
      endpoint: '/api/email-features',
      method: 'POST',
      authentication: 'Required',
      parameters: {
        required: ['email'],
        optional: ['features', 'userRules', 'userFilters', 'userAutoResponders', 'userForwardingRules']
      }
    },
    examples: {
      emailRule: {
        id: 'rule-1',
        name: 'Important Emails',
        enabled: true,
        priority: 1,
        conditions: [
          {
            field: 'from',
            operator: 'contains',
            value: 'boss@company.com'
          }
        ],
        actions: [
          {
            type: 'flag',
            parameters: { flag: 'important' }
          },
          {
            type: 'move',
            target: 'Important'
          }
        ]
      },
      emailFilter: {
        id: 'filter-1',
        name: 'Spam Filter',
        type: 'spam',
        enabled: true,
        criteria: {
          keywords: ['urgent', 'act now', 'limited time'],
          domains: ['suspicious-domain.com']
        },
        action: 'quarantine'
      },
      autoResponder: {
        id: 'responder-1',
        name: 'Out of Office',
        enabled: true,
        conditions: {
          dateRange: {
            start: '2024-01-15T00:00:00Z',
            end: '2024-01-20T23:59:59Z'
          }
        },
        response: {
          subject: 'Out of Office Auto-Reply',
          body: 'I am currently out of office and will respond when I return.'
        },
        settings: {
          maxResponsesPerDay: 1,
          excludeInternalEmails: true
        }
      },
      emailForwarding: {
        id: 'forward-1',
        enabled: true,
        conditions: {
          subjects: ['urgent', 'important']
        },
        forwardTo: ['manager@institute.edu'],
        settings: {
          keepOriginal: true,
          addForwardingHeader: true,
          preserveAttachments: true
        }
      }
    },
    processing: {
      order: [
        '1. Email Rules - Process custom rules first',
        '2. Email Filters - Apply spam and content filters',
        '3. Auto-Responders - Send automatic responses',
        '4. Email Forwarding - Forward emails based on conditions'
      ],
      priority: 'Rules are processed by priority (lower numbers first)',
      conditions: 'All conditions in a rule must match (AND logic)',
      actions: 'All actions in a matching rule are executed'
    }
  })
})

// PUT /api/email-features - Manage user email features
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, type, data } = await request.json()

    switch (action) {
      case 'create':
        return await createEmailFeature(type, data, session.user.id)
      
      case 'update':
        return await updateEmailFeature(type, data, session.user.id)
      
      case 'delete':
        return await deleteEmailFeature(type, data.id, session.user.id)
      
      case 'toggle':
        return await toggleEmailFeature(type, data.id, session.user.id)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['create', 'update', 'delete', 'toggle']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Email features management error:', error)
    return NextResponse.json({
      error: 'Email features management failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// Helper functions for email features management
async function createEmailFeature(type: string, data: any, userId: string) {
  // In production, this would save to database
  const feature = {
    id: `${type}-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId
  }

  return NextResponse.json({
    success: true,
    message: `${type} created successfully`,
    feature
  })
}

async function updateEmailFeature(type: string, data: any, userId: string) {
  const feature = {
    ...data,
    updatedAt: new Date(),
    userId
  }

  return NextResponse.json({
    success: true,
    message: `${type} updated successfully`,
    feature
  })
}

async function deleteEmailFeature(type: string, featureId: string, userId: string) {
  return NextResponse.json({
    success: true,
    message: `${type} deleted successfully`,
    deletedId: featureId
  })
}

async function toggleEmailFeature(type: string, featureId: string, userId: string) {
  return NextResponse.json({
    success: true,
    message: `${type} toggled successfully`,
    featureId,
    enabled: true // This would be the new state
  })
}
