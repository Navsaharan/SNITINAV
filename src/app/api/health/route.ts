import { NextRequest } from 'next/server'
import { createHealthCheck, safeDatabaseOperation } from '@/lib/serverless-optimization'
import { prisma } from '@/lib/prisma'

// Health check endpoint for monitoring and deployment verification
export const GET = createHealthCheck({
  // Database connectivity check
  database: async () => {
    return await safeDatabaseOperation(
      async () => {
        await prisma.$queryRaw`SELECT 1 as health_check`
        return true
      },
      false,
      5000
    )
  },

  // Environment variables check
  environment: async () => {
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    return requiredVars.every(varName => {
      const value = process.env[varName]
      return value && value.trim() !== ''
    })
  },

  // Memory usage check
  memory: async () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      const heapUsedMB = usage.heapUsed / 1024 / 1024
      // Alert if using more than 80% of typical Vercel limit (1GB)
      return heapUsedMB < 800
    }
    return true
  },

  // API responsiveness check
  api: async () => {
    // Simple check that the API layer is responding
    return true
  }
})

// Additional health check with detailed information (admin only)
export async function POST(request: NextRequest) {
  try {
    // This endpoint provides detailed health information
    // In a real implementation, you might want to add authentication
    
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      memory: process.memoryUsage ? {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      } : null,
      database: await safeDatabaseOperation(
        async () => {
          const result = await prisma.$queryRaw`SELECT version() as version`
          return { connected: true, info: result }
        },
        { connected: false, error: 'Connection failed' }
      ),
      features: {
        authentication: !!process.env.NEXTAUTH_SECRET,
        database: !!process.env.DATABASE_URL,
        supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        email: !!process.env.EMAIL_DOMAIN,
        payments: !!(process.env.RAZORPAY_KEY_ID || process.env.STRIPE_PUBLISHABLE_KEY)
      }
    }

    return new Response(JSON.stringify(checks, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )
  }
}
