/**
 * Unit Tests for Payment Catalog Management API
 * Tests the /api/admin/payments/catalog endpoints
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST, PUT } from '@/app/api/admin/payments/catalog/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/admin/payments/catalog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/payments/catalog', () => {
    it('should return payment catalog items for admin user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const mockItems = [
        {
          id: 'item-1',
          name: 'Semester Fee',
          description: 'Regular semester fee',
          feeType: 'SEMESTER',
          amount: 50000,
          currency: 'INR',
          category: 'Academic',
          isActive: true,
          isRecurring: true,
          recurringInterval: 'SEMESTER',
          createdAt: new Date(),
          createdBy: { name: 'Admin', email: 'admin@test.com' },
          _count: { payments: 25 }
        }
      ]

      ;(prisma.paymentCatalogItem.findMany as jest.Mock).mockResolvedValue(mockItems)
      ;(prisma.paymentCatalogItem.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: 1250000 },
        _count: 25
      })

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/payments/catalog?page=1&limit=20',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.items[0].name).toBe('Semester Fee')
      expect(data.items[0].stats).toBeDefined()
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1
      })
    })

    it('should handle search and filtering', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.paymentCatalogItem.count as jest.Mock).mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/payments/catalog?search=semester&feeType=SEMESTER&status=active',
      })

      await GET(req as any)

      expect(prisma.paymentCatalogItem.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'semester', mode: 'insensitive' } },
            { description: { contains: 'semester', mode: 'insensitive' } }
          ],
          feeType: 'SEMESTER',
          isActive: true,
          deletedAt: null
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object)
      })
    })

    it('should deny access for non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-id', email: 'user@test.com', role: 'USER' }
      } as any)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/payments/catalog',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })
  })

  describe('POST /api/admin/payments/catalog', () => {
    it('should create new payment catalog item', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const newItem = {
        name: 'Library Fee',
        description: 'Annual library access fee',
        feeType: 'LIBRARY',
        amount: 2000,
        currency: 'INR',
        category: 'Services',
        isActive: true,
        isRecurring: true,
        recurringInterval: 'YEARLY',
        applicableFor: ['STUDENT', 'FACULTY']
      }

      ;(prisma.paymentCatalogItem.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.paymentCatalogItem.create as jest.Mock).mockResolvedValue({
        id: 'new-item-id',
        ...newItem,
        createdById: 'admin-id',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const { req } = createMocks({
        method: 'POST',
        body: newItem,
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Payment catalog item created successfully')
      expect(data.item.name).toBe('Library Fee')
    })

    it('should reject duplicate payment items', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        name: 'Existing Fee'
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Existing Fee',
          feeType: 'SEMESTER',
          amount: 1000
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Payment item with this name already exists')
    })

    it('should validate input data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '', // Empty name
          feeType: 'INVALID_TYPE',
          amount: -100 // Negative amount
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })

    it('should handle recurring payment validation', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Fee',
          feeType: 'SEMESTER',
          amount: 1000,
          isRecurring: true
          // Missing recurringInterval
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })
  })

  describe('PUT /api/admin/payments/catalog (Bulk Operations)', () => {
    it('should activate multiple items', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.updateMany as jest.Mock).mockResolvedValue({
        count: 2
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'activate',
          itemIds: ['item-1', 'item-2']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Bulk activate completed successfully')
      expect(data.affected).toBe(2)
      expect(prisma.paymentCatalogItem.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['item-1', 'item-2'] } },
        data: { isActive: true }
      })
    })

    it('should deactivate multiple items', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.updateMany as jest.Mock).mockResolvedValue({
        count: 3
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'deactivate',
          itemIds: ['item-1', 'item-2', 'item-3']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Bulk deactivate completed successfully')
      expect(data.affected).toBe(3)
    })

    it('should soft delete multiple items', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.updateMany as jest.Mock).mockResolvedValue({
        count: 1
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'delete',
          itemIds: ['item-1']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Bulk delete completed successfully')
      expect(data.affected).toBe(1)
      expect(prisma.paymentCatalogItem.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['item-1'] } },
        data: { deletedAt: expect.any(Date) }
      })
    })

    it('should update pricing for multiple items', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.updateMany as jest.Mock).mockResolvedValue({
        count: 2
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'updatePricing',
          itemIds: ['item-1', 'item-2'],
          data: { 
            discountPercentage: 10,
            lateFee: 500
          }
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.affected).toBe(2)
      expect(prisma.paymentCatalogItem.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['item-1', 'item-2'] } },
        data: { 
          discountPercentage: 10,
          lateFee: 500
        }
      })
    })

    it('should reject invalid bulk actions', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'invalid-action',
          itemIds: ['item-1']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
    })

    it('should require item IDs for bulk operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'activate'
          // Missing itemIds
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.paymentCatalogItem.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/payments/catalog',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch payment catalog items')
    })

    it('should handle missing session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/payments/catalog',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })
  })
})
