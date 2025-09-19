/**
 * Unit Tests for Email Account Management API
 * Tests the /api/admin/email/accounts endpoints
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST, PUT } from '@/app/api/admin/email/accounts/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma')
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/admin/email/accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/email/accounts', () => {
    it('should return email accounts for admin user', async () => {
      // Mock admin session
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      // Mock database response
      const mockAccounts = [
        {
          id: 'account-1',
          email: 'student1@test.com',
          displayName: 'Student One',
          type: 'STUDENT',
          isActive: true,
          quota: 1000000000,
          createdAt: new Date(),
          _count: { sentEmails: 5, receivedEmails: 10, payments: 2 },
          sessions: [{ lastActivity: new Date() }]
        }
      ]

      ;(prisma.emailAccount.findMany as jest.Mock).mockResolvedValue(mockAccounts)
      ;(prisma.emailAccount.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.emailAttachment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { size: 50000000 }
      })

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/email/accounts?page=1&limit=20',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.accounts).toHaveLength(1)
      expect(data.accounts[0].email).toBe('student1@test.com')
      expect(data.accounts[0].stats).toBeDefined()
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1
      })
    })

    it('should deny access for non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-id', email: 'user@test.com', role: 'USER' }
      } as any)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/email/accounts',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })

    it('should handle search and filtering', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.emailAccount.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.emailAccount.count as jest.Mock).mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/email/accounts?search=student&type=STUDENT&status=active',
      })

      await GET(req as any)

      expect(prisma.emailAccount.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'student', mode: 'insensitive' } },
            { displayName: { contains: 'student', mode: 'insensitive' } }
          ],
          type: 'STUDENT',
          isActive: true
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object)
      })
    })
  })

  describe('POST /api/admin/email/accounts', () => {
    it('should create new email account', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const newAccount = {
        email: 'newstudent@test.com',
        password: 'password123',
        type: 'STUDENT',
        isActive: true,
        quota: 1000000000
      }

      ;(prisma.emailAccount.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.emailAccount.create as jest.Mock).mockResolvedValue({
        id: 'new-account-id',
        ...newAccount,
        password: 'hashed-password',
        createdById: 'admin-id',
        createdBy: { id: 'admin-id', name: 'Admin', email: 'admin@test.com' }
      })
      ;(prisma.emailFolder.createMany as jest.Mock).mockResolvedValue({})

      const { req } = createMocks({
        method: 'POST',
        body: newAccount,
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Email account created successfully')
      expect(data.account.email).toBe('newstudent@test.com')
      expect(data.account.password).toBeUndefined() // Password should not be returned
    })

    it('should reject duplicate email accounts', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.emailAccount.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: 'existing@test.com'
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'existing@test.com',
          password: 'password123',
          type: 'STUDENT'
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email account already exists')
    })

    it('should validate input data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: '123', // Too short
          type: 'INVALID_TYPE'
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })
  })

  describe('PUT /api/admin/email/accounts (Bulk Operations)', () => {
    it('should activate multiple accounts', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.emailAccount.updateMany as jest.Mock).mockResolvedValue({
        count: 2
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'activate',
          accountIds: ['account-1', 'account-2']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Bulk activate completed successfully')
      expect(data.affected).toBe(2)
      expect(prisma.emailAccount.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['account-1', 'account-2'] } },
        data: { isActive: true }
      })
    })

    it('should deactivate multiple accounts', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.emailAccount.updateMany as jest.Mock).mockResolvedValue({
        count: 3
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'deactivate',
          accountIds: ['account-1', 'account-2', 'account-3']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Bulk deactivate completed successfully')
      expect(data.affected).toBe(3)
    })

    it('should update quota for multiple accounts', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      ;(prisma.emailAccount.updateMany as jest.Mock).mockResolvedValue({
        count: 2
      })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'updateQuota',
          accountIds: ['account-1', 'account-2'],
          data: { quota: 2000000000 }
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.affected).toBe(2)
      expect(prisma.emailAccount.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['account-1', 'account-2'] } },
        data: { quota: 2000000000 }
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
          accountIds: ['account-1']
        },
      })

      const response = await PUT(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
    })

    it('should require account IDs for bulk operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
      } as any)

      const { req } = createMocks({
        method: 'PUT',
        body: {
          action: 'activate'
          // Missing accountIds
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

      ;(prisma.emailAccount.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/email/accounts',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch email accounts')
    })

    it('should handle missing session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/email/accounts',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })
  })
})
