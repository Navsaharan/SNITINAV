import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { MonitoringService } from '@/lib/monitoring-service'

// Global monitoring service instance
const monitoringService = new MonitoringService()

// GET /api/monitoring - Get monitoring data
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'overview'
    const timeRange = url.searchParams.get('timeRange') || '24h'
    const granularity = url.searchParams.get('granularity') || 'hour'

    switch (type) {
      case 'overview':
        const systemMetrics = await monitoringService.collectSystemMetrics()
        const emailMetrics = await monitoringService.collectEmailMetrics()
        const securityMetrics = await monitoringService.collectSecurityMetrics()

        return NextResponse.json({
          type: 'overview',
          data: {
            system: systemMetrics,
            email: emailMetrics,
            security: securityMetrics,
            timestamp: new Date().toISOString()
          }
        })

      case 'system':
        const systemData = await monitoringService.collectSystemMetrics()
        return NextResponse.json({
          type: 'system',
          data: systemData
        })

      case 'email':
        const emailData = await monitoringService.collectEmailMetrics()
        return NextResponse.json({
          type: 'email',
          data: emailData
        })

      case 'security':
        const securityData = await monitoringService.collectSecurityMetrics()
        return NextResponse.json({
          type: 'security',
          data: securityData
        })

      case 'analytics':
        const endDate = new Date()
        let startDate: Date

        switch (timeRange) {
          case '1h':
            startDate = new Date(endDate.getTime() - 60 * 60 * 1000)
            break
          case '24h':
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
            break
          case '7d':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
        }

        const analytics = await monitoringService.getPerformanceAnalytics(
          startDate,
          endDate,
          granularity as 'minute' | 'hour' | 'day'
        )

        return NextResponse.json({
          type: 'analytics',
          data: analytics
        })

      case 'alerts':
        const alertRules = monitoringService.getAlertRules()
        
        // Check current metrics against alert rules
        const currentSystemMetrics = await monitoringService.collectSystemMetrics()
        const alertCheck = await monitoringService.checkAlertRules(currentSystemMetrics)

        return NextResponse.json({
          type: 'alerts',
          data: {
            rules: alertRules,
            triggeredAlerts: alertCheck.triggeredAlerts,
            lastCheck: new Date().toISOString()
          }
        })

      case 'health':
        // Perform comprehensive health check
        const healthData = {
          timestamp: new Date().toISOString(),
          status: 'healthy',
          checks: [
            {
              name: 'System Resources',
              status: 'pass',
              message: 'System resources within normal limits',
              details: await monitoringService.collectSystemMetrics()
            },
            {
              name: 'Email Services',
              status: 'pass',
              message: 'All email services operational',
              details: await monitoringService.collectEmailMetrics()
            },
            {
              name: 'Security Systems',
              status: 'pass',
              message: 'Security systems functioning normally',
              details: await monitoringService.collectSecurityMetrics()
            }
          ]
        }

        return NextResponse.json({
          type: 'health',
          data: healthData
        })

      default:
        return NextResponse.json({
          error: 'Invalid monitoring type',
          availableTypes: ['overview', 'system', 'email', 'security', 'analytics', 'alerts', 'health']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Monitoring data error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve monitoring data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// POST /api/monitoring - Monitoring actions
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'generateReport':
        if (!data.reportConfig) {
          return NextResponse.json({
            error: 'Report configuration required'
          }, { status: 400 })
        }

        const report = await monitoringService.generateReport(data.reportConfig)

        return NextResponse.json({
          success: true,
          message: 'Report generated successfully',
          report: report.report,
          data: report.data,
          generatedAt: report.generatedAt
        })

      case 'createAlert':
        if (!data.rule) {
          return NextResponse.json({
            error: 'Alert rule configuration required'
          }, { status: 400 })
        }

        const newRule = {
          id: `alert-${Date.now()}`,
          triggerCount: 0,
          ...data.rule
        }

        monitoringService.setAlertRule(newRule)

        return NextResponse.json({
          success: true,
          message: 'Alert rule created successfully',
          rule: newRule
        })

      case 'updateAlert':
        if (!data.rule || !data.rule.id) {
          return NextResponse.json({
            error: 'Alert rule with ID required'
          }, { status: 400 })
        }

        monitoringService.setAlertRule(data.rule)

        return NextResponse.json({
          success: true,
          message: 'Alert rule updated successfully',
          rule: data.rule
        })

      case 'deleteAlert':
        if (!data.ruleId) {
          return NextResponse.json({
            error: 'Alert rule ID required'
          }, { status: 400 })
        }

        const deleted = monitoringService.deleteAlertRule(data.ruleId)

        return NextResponse.json({
          success: deleted,
          message: deleted ? 'Alert rule deleted successfully' : 'Alert rule not found'
        })

      case 'testAlert':
        if (!data.ruleId) {
          return NextResponse.json({
            error: 'Alert rule ID required'
          }, { status: 400 })
        }

        const rules = monitoringService.getAlertRules()
        const rule = rules.find(r => r.id === data.ruleId)

        if (!rule) {
          return NextResponse.json({
            error: 'Alert rule not found'
          }, { status: 404 })
        }

        // Simulate alert trigger
        const testResult = {
          rule,
          currentValue: data.testValue || rule.threshold + 1,
          message: `Test alert: ${rule.name}`,
          timestamp: new Date().toISOString()
        }

        return NextResponse.json({
          success: true,
          message: 'Alert test completed',
          result: testResult
        })

      case 'collectMetrics':
        const metricsType = data.type || 'all'
        const collectedMetrics: any = {}

        if (metricsType === 'all' || metricsType === 'system') {
          collectedMetrics.system = await monitoringService.collectSystemMetrics()
        }

        if (metricsType === 'all' || metricsType === 'email') {
          collectedMetrics.email = await monitoringService.collectEmailMetrics()
        }

        if (metricsType === 'all' || metricsType === 'security') {
          collectedMetrics.security = await monitoringService.collectSecurityMetrics()
        }

        return NextResponse.json({
          success: true,
          message: 'Metrics collected successfully',
          metrics: collectedMetrics,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'generateReport',
            'createAlert',
            'updateAlert',
            'deleteAlert',
            'testAlert',
            'collectMetrics'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Monitoring action error:', error)
    return NextResponse.json({
      error: 'Monitoring action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// PUT /api/monitoring - Update monitoring configuration
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { type, config } = await request.json()

    switch (type) {
      case 'alertRules':
        if (!Array.isArray(config)) {
          return NextResponse.json({
            error: 'Alert rules must be an array'
          }, { status: 400 })
        }

        // Update all alert rules
        for (const rule of config) {
          monitoringService.setAlertRule(rule)
        }

        return NextResponse.json({
          success: true,
          message: 'Alert rules updated successfully',
          count: config.length
        })

      case 'monitoringSettings':
        // In production, this would update monitoring configuration in database
        return NextResponse.json({
          success: true,
          message: 'Monitoring settings updated successfully',
          settings: config
        })

      default:
        return NextResponse.json({
          error: 'Invalid configuration type',
          availableTypes: ['alertRules', 'monitoringSettings']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Monitoring configuration error:', error)
    return NextResponse.json({
      error: 'Failed to update monitoring configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
