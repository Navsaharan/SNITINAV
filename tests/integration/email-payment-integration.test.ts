/**
 * Integration Tests for Email and Payment System Integration
 * Tests the complete workflow from email account creation to payment processing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use a test database for integration tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})

// Skip integration tests if no test database is configured
const skipIntegrationTests = !process.env.TEST_DATABASE_URL && process.env.NODE_ENV !== 'test'

describe('Email and Payment System Integration', () => {
  // Skip tests if no test database is configured
  if (skipIntegrationTests) {
    it.skip('Integration tests require TEST_DATABASE_URL environment variable', () => {})
    return
  }
  let adminUser: any
  let testEmailAccount: any
  let testPaymentItem: any

  beforeAll(async () => {
    // Clean up test data
    await cleanupTestData()

    // Create admin user for testing
    adminUser = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'test-admin@test.com',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.payment.deleteMany({
      where: { student: { email: { contains: 'test-' } } }
    })
    await prisma.email.deleteMany({
      where: { fromEmail: { contains: 'test-' } }
    })
    await prisma.emailAccount.deleteMany({
      where: { email: { contains: 'test-' } }
    })
    await prisma.paymentCatalogItem.deleteMany({
      where: { name: { contains: 'Test ' } }
    })
  })

  async function cleanupTestData() {
    try {
      await prisma.payment.deleteMany({
        where: { student: { email: { contains: 'test-' } } }
      })
      await prisma.email.deleteMany({
        where: { fromEmail: { contains: 'test-' } }
      })
      await prisma.emailAccount.deleteMany({
        where: { email: { contains: 'test-' } }
      })
      await prisma.paymentCatalogItem.deleteMany({
        where: { name: { contains: 'Test ' } }
      })
      await prisma.adminAuditLog.deleteMany({
        where: { userEmail: { contains: 'test-' } }
      })
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-' } }
      })
    } catch (error) {
      console.log('Cleanup error (expected in fresh database):', error)
    }
  }

  describe('Complete Email Account Lifecycle', () => {
    it('should create email account with proper relations', async () => {
      // Create email account
      testEmailAccount = await prisma.emailAccount.create({
        data: {
          email: 'test-student@test.com',
          password: await bcrypt.hash('password123', 12),
          type: 'STUDENT',
          displayName: 'Test Student',
          isActive: true,
          quota: 1024 * 1024 * 1024, // 1GB
          createdById: adminUser.id
        }
      })

      expect(testEmailAccount).toBeDefined()
      expect(testEmailAccount.email).toBe('test-student@test.com')
      expect(testEmailAccount.type).toBe('STUDENT')
      expect(testEmailAccount.isActive).toBe(true)

      // Verify admin relation
      const accountWithCreator = await prisma.emailAccount.findUnique({
        where: { id: testEmailAccount.id },
        include: { createdBy: true }
      })

      expect(accountWithCreator?.createdBy.id).toBe(adminUser.id)
    })

    it('should create default email folders for new account', async () => {
      // Create email account
      testEmailAccount = await prisma.emailAccount.create({
        data: {
          email: 'test-student2@test.com',
          password: await bcrypt.hash('password123', 12),
          type: 'STUDENT',
          displayName: 'Test Student 2',
          isActive: true,
          quota: 1024 * 1024 * 1024,
          createdById: adminUser.id
        }
      })

      // Create default folders
      await prisma.emailFolder.createMany({
        data: [
          {
            accountId: testEmailAccount.id,
            name: 'Inbox',
            type: 'INBOX'
          },
          {
            accountId: testEmailAccount.id,
            name: 'Sent',
            type: 'SENT'
          },
          {
            accountId: testEmailAccount.id,
            name: 'Drafts',
            type: 'DRAFTS'
          },
          {
            accountId: testEmailAccount.id,
            name: 'Trash',
            type: 'TRASH'
          }
        ]
      })

      // Verify folders were created
      const folders = await prisma.emailFolder.findMany({
        where: { accountId: testEmailAccount.id }
      })

      expect(folders).toHaveLength(4)
      expect(folders.map(f => f.type)).toContain('INBOX')
      expect(folders.map(f => f.type)).toContain('SENT')
      expect(folders.map(f => f.type)).toContain('DRAFTS')
      expect(folders.map(f => f.type)).toContain('TRASH')
    })
  })

  describe('Complete Payment Catalog Lifecycle', () => {
    it('should create payment catalog item with proper relations', async () => {
      // Create payment catalog item
      testPaymentItem = await prisma.paymentCatalogItem.create({
        data: {
          name: 'Test Semester Fee',
          description: 'Test semester fee for integration testing',
          feeType: 'SEMESTER',
          amount: 25000,
          currency: 'INR',
          category: 'Academic',
          subcategory: 'Tuition',
          isActive: true,
          isRecurring: true,
          recurringInterval: 'SEMESTER',
          applicableFor: ['STUDENT'],
          createdById: adminUser.id
        }
      })

      expect(testPaymentItem).toBeDefined()
      expect(testPaymentItem.name).toBe('Test Semester Fee')
      expect(testPaymentItem.amount).toBe(25000)
      expect(testPaymentItem.isActive).toBe(true)

      // Verify admin relation
      const itemWithCreator = await prisma.paymentCatalogItem.findUnique({
        where: { id: testPaymentItem.id },
        include: { createdBy: true }
      })

      expect(itemWithCreator?.createdBy.id).toBe(adminUser.id)
    })

    it('should handle payment catalog item statistics', async () => {
      // Create payment catalog item
      testPaymentItem = await prisma.paymentCatalogItem.create({
        data: {
          name: 'Test Library Fee',
          description: 'Test library fee',
          feeType: 'LIBRARY',
          amount: 1000,
          currency: 'INR',
          category: 'Services',
          isActive: true,
          createdById: adminUser.id
        }
      })

      // Create email account for payment
      testEmailAccount = await prisma.emailAccount.create({
        data: {
          email: 'test-student3@test.com',
          password: await bcrypt.hash('password123', 12),
          type: 'STUDENT',
          displayName: 'Test Student 3',
          isActive: true,
          quota: 1024 * 1024 * 1024,
          createdById: adminUser.id
        }
      })

      // Create test payments
      await prisma.payment.createMany({
        data: [
          {
            transactionId: 'TEST_TXN_001',
            studentId: testEmailAccount.id,
            catalogItemId: testPaymentItem.id,
            description: 'Test payment 1',
            feeType: 'LIBRARY',
            totalAmount: 1000,
            currency: 'INR',
            status: 'COMPLETED',
            gateway: 'RAZORPAY',
            paymentMethod: 'card',
            completedAt: new Date()
          },
          {
            transactionId: 'TEST_TXN_002',
            studentId: testEmailAccount.id,
            catalogItemId: testPaymentItem.id,
            description: 'Test payment 2',
            feeType: 'LIBRARY',
            totalAmount: 1000,
            currency: 'INR',
            status: 'PENDING',
            gateway: 'RAZORPAY',
            paymentMethod: 'upi'
          }
        ]
      })

      // Verify payment statistics
      const itemWithStats = await prisma.paymentCatalogItem.findUnique({
        where: { id: testPaymentItem.id },
        include: {
          _count: { select: { payments: true } },
          payments: {
            select: {
              status: true,
              totalAmount: true
            }
          }
        }
      })

      expect(itemWithStats?._count.payments).toBe(2)
      expect(itemWithStats?.payments).toHaveLength(2)

      const completedPayments = itemWithStats?.payments.filter(p => p.status === 'COMPLETED')
      expect(completedPayments).toHaveLength(1)
    })
  })

  describe('Email and Payment Integration', () => {
    it('should link email accounts with payments correctly', async () => {
      // Create email account
      testEmailAccount = await prisma.emailAccount.create({
        data: {
          email: 'test-student4@test.com',
          password: await bcrypt.hash('password123', 12),
          type: 'STUDENT',
          displayName: 'Test Student 4',
          isActive: true,
          quota: 1024 * 1024 * 1024,
          createdById: adminUser.id
        }
      })

      // Create payment catalog item
      testPaymentItem = await prisma.paymentCatalogItem.create({
        data: {
          name: 'Test Exam Fee',
          description: 'Test exam fee',
          feeType: 'EXAM',
          amount: 1500,
          currency: 'INR',
          category: 'Academic',
          isActive: true,
          createdById: adminUser.id
        }
      })

      // Create payment
      const payment = await prisma.payment.create({
        data: {
          transactionId: 'TEST_TXN_003',
          studentId: testEmailAccount.id,
          catalogItemId: testPaymentItem.id,
          description: 'Test exam fee payment',
          feeType: 'EXAM',
          totalAmount: 1500,
          currency: 'INR',
          status: 'COMPLETED',
          gateway: 'STRIPE',
          paymentMethod: 'card',
          completedAt: new Date()
        }
      })

      // Verify complete integration
      const paymentWithRelations = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          student: {
            select: {
              email: true,
              displayName: true,
              type: true
            }
          },
          catalogItem: {
            select: {
              name: true,
              category: true,
              feeType: true
            }
          }
        }
      })

      expect(paymentWithRelations?.student.email).toBe('test-student4@test.com')
      expect(paymentWithRelations?.student.type).toBe('STUDENT')
      expect(paymentWithRelations?.catalogItem?.name).toBe('Test Exam Fee')
      expect(paymentWithRelations?.catalogItem?.feeType).toBe('EXAM')
    })

    it('should handle email account with multiple payments', async () => {
      // Create email account
      testEmailAccount = await prisma.emailAccount.create({
        data: {
          email: 'test-student5@test.com',
          password: await bcrypt.hash('password123', 12),
          type: 'STUDENT',
          displayName: 'Test Student 5',
          isActive: true,
          quota: 1024 * 1024 * 1024,
          createdById: adminUser.id
        }
      })

      // Create multiple payment catalog items
      const semesterFee = await prisma.paymentCatalogItem.create({
        data: {
          name: 'Test Semester Fee 2',
          feeType: 'SEMESTER',
          amount: 50000,
          currency: 'INR',
          category: 'Academic',
          isActive: true,
          createdById: adminUser.id
        }
      })

      const libraryFee = await prisma.paymentCatalogItem.create({
        data: {
          name: 'Test Library Fee 2',
          feeType: 'LIBRARY',
          amount: 2000,
          currency: 'INR',
          category: 'Services',
          isActive: true,
          createdById: adminUser.id
        }
      })

      // Create multiple payments
      await prisma.payment.createMany({
        data: [
          {
            transactionId: 'TEST_TXN_004',
            studentId: testEmailAccount.id,
            catalogItemId: semesterFee.id,
            description: 'Semester fee payment',
            feeType: 'SEMESTER',
            totalAmount: 50000,
            currency: 'INR',
            status: 'COMPLETED',
            gateway: 'RAZORPAY',
            paymentMethod: 'netbanking',
            completedAt: new Date()
          },
          {
            transactionId: 'TEST_TXN_005',
            studentId: testEmailAccount.id,
            catalogItemId: libraryFee.id,
            description: 'Library fee payment',
            feeType: 'LIBRARY',
            totalAmount: 2000,
            currency: 'INR',
            status: 'COMPLETED',
            gateway: 'PAYU',
            paymentMethod: 'upi',
            completedAt: new Date()
          }
        ]
      })

      // Verify email account has multiple payments
      const accountWithPayments = await prisma.emailAccount.findUnique({
        where: { id: testEmailAccount.id },
        include: {
          payments: {
            include: {
              catalogItem: {
                select: {
                  name: true,
                  feeType: true
                }
              }
            }
          }
        }
      })

      expect(accountWithPayments?.payments).toHaveLength(2)
      expect(accountWithPayments?.payments.map(p => p.feeType)).toContain('SEMESTER')
      expect(accountWithPayments?.payments.map(p => p.feeType)).toContain('LIBRARY')

      // Calculate total payments
      const totalPaid = accountWithPayments?.payments.reduce((sum, p) => sum + p.totalAmount, 0)
      expect(totalPaid).toBe(52000) // 50000 + 2000
    })
  })

  describe('Audit Logging Integration', () => {
    it('should create audit logs for admin actions', async () => {
      // Create audit log for email account creation
      await prisma.adminAuditLog.create({
        data: {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'EMAIL_ACCOUNT_CREATED',
          resource: 'email_accounts',
          resourceId: 'test-account-id',
          details: {
            email: 'test-student6@test.com',
            type: 'STUDENT'
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        }
      })

      // Create audit log for payment item creation
      await prisma.adminAuditLog.create({
        data: {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'PAYMENT_ITEM_CREATED',
          resource: 'payment_catalog_items',
          resourceId: 'test-item-id',
          details: {
            name: 'Test Fee',
            amount: 1000
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        }
      })

      // Verify audit logs
      const auditLogs = await prisma.adminAuditLog.findMany({
        where: { userId: adminUser.id },
        orderBy: { createdAt: 'desc' }
      })

      expect(auditLogs).toHaveLength(2)
      expect(auditLogs.map(log => log.action)).toContain('EMAIL_ACCOUNT_CREATED')
      expect(auditLogs.map(log => log.action)).toContain('PAYMENT_ITEM_CREATED')
    })
  })

  describe('System Alerts Integration', () => {
    it('should create and manage system alerts', async () => {
      // Create system alert
      const alert = await prisma.systemAlert.create({
        data: {
          title: 'Test System Alert',
          message: 'This is a test alert for integration testing',
          type: 'INFO',
          category: 'system',
          severity: 'LOW'
        }
      })

      expect(alert).toBeDefined()
      expect(alert.title).toBe('Test System Alert')
      expect(alert.isAcknowledged).toBe(false)

      // Acknowledge alert
      const acknowledgedAlert = await prisma.systemAlert.update({
        where: { id: alert.id },
        data: {
          isAcknowledged: true,
          acknowledgedBy: adminUser.id,
          acknowledgedAt: new Date()
        }
      })

      expect(acknowledgedAlert.isAcknowledged).toBe(true)
      expect(acknowledgedAlert.acknowledgedBy).toBe(adminUser.id)

      // Verify alert with user relation
      const alertWithUser = await prisma.systemAlert.findUnique({
        where: { id: alert.id },
        include: { acknowledgedByUser: true }
      })

      expect(alertWithUser?.acknowledgedByUser?.id).toBe(adminUser.id)
    })
  })
})
