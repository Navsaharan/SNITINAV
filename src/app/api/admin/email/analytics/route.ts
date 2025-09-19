import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/email/analytics - Email analytics and reporting
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get email statistics
    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      spamEmails,
      totalUsers,
      activeUsers,
      storageStats
    ] = await Promise.all([
      // Total emails in time range
      prisma.email.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      
      // Sent emails
      prisma.email.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          },
          status: 'SENT'
        }
      }),
      
      // Delivered emails
      prisma.email.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          },
          status: 'DELIVERED'
        }
      }),
      
      // Failed emails
      prisma.email.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          },
          status: 'FAILED'
        }
      }),
      
      // Spam emails
      prisma.email.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          },
          isSpam: true
        }
      }),
      
      // Total users
      prisma.emailAccount.count(),
      
      // Active users (logged in within time range)
      prisma.emailAccount.count({
        where: {
          lastLogin: {
            gte: startDate
          }
        }
      }),
      
      // Storage statistics
      prisma.emailAccount.aggregate({
        _sum: {
          usedQuota: true,
          quota: true
        }
      })
    ])

    // Get time series data for charts
    const timeSeries = await getTimeSeriesData(startDate, now)

    const stats = {
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      spamEmails,
      totalUsers,
      activeUsers,
      storageUsed: Number(storageStats._sum.usedQuota) || 0,
      storageQuota: Number(storageStats._sum.quota) || 0
    }

    return NextResponse.json({
      stats,
      timeSeries
    })

  } catch (error) {
    console.error('Error fetching email analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email analytics' },
      { status: 500 }
    )
  }
}

async function getTimeSeriesData(startDate: Date, endDate: Date) {
  try {
    // Group emails by date and status
    const emailsByDate = await prisma.email.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        status: true
      }
    })

    // For now, return a simplified time series
    // In a real implementation, you'd group by date as well
    const timeSeries = []
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 100), // Mock data
        delivered: Math.floor(Math.random() * 90),
        failed: Math.floor(Math.random() * 10)
      })
    }

    return timeSeries
  } catch (error) {
    console.error('Error generating time series data:', error)
    return []
  }
}
