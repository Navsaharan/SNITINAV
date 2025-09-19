import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { AdminService } from '@/lib/admin-service'

// GET /api/admin - Get admin dashboard data
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const section = url.searchParams.get('section') || 'overview'

    const adminService = new AdminService()

    switch (section) {
      case 'overview':
        const stats = await adminService.getSystemStats()
        const alerts = await adminService.getSystemAlerts({ acknowledged: false })
        const healthCheck = await adminService.performHealthCheck()

        return NextResponse.json({
          section: 'overview',
          data: {
            stats,
            alerts: alerts.slice(0, 5), // Latest 5 alerts
            health: healthCheck
          },
          timestamp: new Date().toISOString()
        })

      case 'users':
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const role = url.searchParams.get('role') || undefined
        const status = url.searchParams.get('status') || undefined
        const search = url.searchParams.get('search') || undefined

        const users = await adminService.getUsers(page, limit, { role, status, search })

        return NextResponse.json({
          section: 'users',
          data: users,
          timestamp: new Date().toISOString()
        })

      case 'config':
        const config = await adminService.getSystemConfiguration()

        return NextResponse.json({
          section: 'config',
          data: config,
          timestamp: new Date().toISOString()
        })

      case 'audit':
        const auditPage = parseInt(url.searchParams.get('page') || '1')
        const auditLimit = parseInt(url.searchParams.get('limit') || '50')
        const userId = url.searchParams.get('userId') || undefined
        const action = url.searchParams.get('action') || undefined

        const auditLogs = await adminService.getAuditLogs(auditPage, auditLimit, {
          userId,
          action
        })

        return NextResponse.json({
          section: 'audit',
          data: auditLogs,
          timestamp: new Date().toISOString()
        })

      case 'alerts':
        const alertType = url.searchParams.get('type') || undefined
        const category = url.searchParams.get('category') || undefined
        const acknowledged = url.searchParams.get('acknowledged') === 'true' ? true : 
                           url.searchParams.get('acknowledged') === 'false' ? false : undefined

        const allAlerts = await adminService.getSystemAlerts({ 
          type: alertType, 
          category, 
          acknowledged 
        })

        return NextResponse.json({
          section: 'alerts',
          data: allAlerts,
          timestamp: new Date().toISOString()
        })

      case 'health':
        const health = await adminService.performHealthCheck()

        return NextResponse.json({
          section: 'health',
          data: health,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          error: 'Invalid section',
          availableSections: ['overview', 'users', 'config', 'audit', 'alerts', 'health']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({
      error: 'Failed to load admin dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// POST /api/admin - Admin actions
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { action, data } = await request.json()

    const adminService = new AdminService()

    switch (action) {
      case 'createUser':
        if (!data.email || !data.name) {
          return NextResponse.json({
            error: 'Email and name are required'
          }, { status: 400 })
        }

        const newUser = await adminService.createUser(data)
        
        // Log the action
        await adminService.createAuditLog({
          userId: session.user.id,
          userEmail: session.user.email!,
          action: 'USER_CREATED',
          resource: 'users',
          details: { newUserId: newUser.id, email: newUser.email },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true
        })

        return NextResponse.json({
          success: true,
          message: 'User created successfully',
          user: newUser
        })

      case 'updateUser':
        if (!data.userId) {
          return NextResponse.json({
            error: 'User ID is required'
          }, { status: 400 })
        }

        const updatedUser = await adminService.updateUser(data.userId, data.updates)
        
        await adminService.createAuditLog({
          userId: session.user.id,
          userEmail: session.user.email!,
          action: 'USER_UPDATED',
          resource: 'users',
          details: { updatedUserId: data.userId, changes: Object.keys(data.updates) },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true
        })

        return NextResponse.json({
          success: true,
          message: 'User updated successfully',
          user: updatedUser
        })

      case 'deleteUser':
        if (!data.userId) {
          return NextResponse.json({
            error: 'User ID is required'
          }, { status: 400 })
        }

        const deleted = await adminService.deleteUser(data.userId)
        
        await adminService.createAuditLog({
          userId: session.user.id,
          userEmail: session.user.email!,
          action: 'USER_DELETED',
          resource: 'users',
          details: { deletedUserId: data.userId },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: deleted
        })

        return NextResponse.json({
          success: deleted,
          message: deleted ? 'User deleted successfully' : 'Failed to delete user'
        })

      case 'acknowledgeAlert':
        if (!data.alertId) {
          return NextResponse.json({
            error: 'Alert ID is required'
          }, { status: 400 })
        }

        const acknowledgedAlert = await adminService.acknowledgeAlert(data.alertId, session.user.id)

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged',
          alert: acknowledgedAlert
        })

      case 'createAlert':
        if (!data.title || !data.message || !data.type || !data.category) {
          return NextResponse.json({
            error: 'Title, message, type, and category are required'
          }, { status: 400 })
        }

        const newAlert = await adminService.createAlert(data)

        return NextResponse.json({
          success: true,
          message: 'Alert created successfully',
          alert: newAlert
        })

      case 'maintenance':
        if (!data.operation) {
          return NextResponse.json({
            error: 'Maintenance operation is required'
          }, { status: 400 })
        }

        const maintenanceResult = await adminService.performMaintenance(data.operation)
        
        await adminService.createAuditLog({
          userId: session.user.id,
          userEmail: session.user.email!,
          action: 'MAINTENANCE_PERFORMED',
          resource: 'system',
          details: { operation: data.operation, result: maintenanceResult },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: maintenanceResult.success
        })

        return NextResponse.json({
          success: maintenanceResult.success,
          message: maintenanceResult.message,
          details: maintenanceResult.details
        })

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'createUser',
            'updateUser', 
            'deleteUser',
            'acknowledgeAlert',
            'createAlert',
            'maintenance'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json({
      error: 'Admin action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// PUT /api/admin - Update system configuration
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { section, config } = await request.json()

    if (!section || !config) {
      return NextResponse.json({
        error: 'Section and config data are required'
      }, { status: 400 })
    }

    const adminService = new AdminService()
    const updatedConfig = await adminService.updateSystemConfiguration({ [section]: config })

    // Log the configuration change
    await adminService.createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email!,
      action: 'CONFIG_UPDATED',
      resource: 'system_config',
      details: { section, changes: Object.keys(config) },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: updatedConfig
    })

  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json({
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
