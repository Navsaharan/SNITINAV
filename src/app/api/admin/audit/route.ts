import { createSecureApi, createPaginatedResponse } from '@/lib/secure-api'
import { prisma } from '@/lib/prisma'

export const GET = createSecureApi(
  async (context) => {
    const { searchParams } = new URL(context.request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(Math.max(1, Number.parseInt(searchParams.get('limit') || '50', 10) || 50), 100)
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') || undefined
    const resource = searchParams.get('resource') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const where: any = {}
    if (userId) where.userId = userId
    if (action) where.action = { contains: action, mode: 'insensitive' }
    if (resource) where.resource = { contains: resource, mode: 'insensitive' }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await prisma.$transaction([
      prisma.adminAuditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.adminAuditLog.count({ where }),
    ])

    return createPaginatedResponse(logs, page, limit, total)
  },
  { requireAdmin: true }
)
