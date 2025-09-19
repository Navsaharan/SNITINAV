import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const createPaymentItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  feeType: z.enum(['ADMISSION', 'SEMESTER', 'EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'MISCELLANEOUS']),
  amount: z.number().min(0),
  currency: z.string().default('INR'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  isActive: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY']).optional(),
  dueDate: z.string().optional(),
  lateFee: z.number().min(0).default(0),
  discountPercentage: z.number().min(0).max(100).default(0),
  applicableFor: z.array(z.enum(['STUDENT', 'FACULTY', 'STAFF'])).default(['STUDENT']),
})

const updatePaymentItemSchema = createPaymentItemSchema.partial()

// GET /api/admin/payments/catalog - List payment catalog items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const feeType = url.searchParams.get('feeType') || ''
    const status = url.searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (feeType && feeType !== 'all') {
      where.feeType = feeType
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }
    // Skip filtering if status === 'all'

    // Get payment items with usage statistics
    const [items, total] = await Promise.all([
      prisma.paymentCatalogItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              payments: true
            }
          }
        }
      }),
      prisma.paymentCatalogItem.count({ where })
    ])

    // Calculate revenue statistics for each item
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const revenueStats = await prisma.payment.aggregate({
          where: {
            catalogItemId: item.id,
            status: 'SUCCESS'
          },
          _sum: { totalAmount: true },
          _count: true
        })

        return {
          ...item,
          stats: {
            totalPayments: item._count.payments,
            completedPayments: revenueStats._count || 0,
            totalRevenue: revenueStats._sum.totalAmount || 0
          }
        }
      })
    )

    return NextResponse.json({
      items: itemsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payment catalog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment catalog' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments/catalog - Create payment catalog item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPaymentItemSchema.parse(body)

    // Create payment catalog item
    const item = await prisma.paymentCatalogItem.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log the action
    console.log(`Admin ${session.user.email} created payment catalog item: ${item.name}`)

    return NextResponse.json({
      message: 'Payment catalog item created successfully',
      item
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment catalog item:', error)
    return NextResponse.json(
      { error: 'Failed to create payment catalog item' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/payments/catalog - Bulk operations
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, itemIds, data } = body

    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.paymentCatalogItem.updateMany({
          where: { id: { in: itemIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.paymentCatalogItem.updateMany({
          where: { id: { in: itemIds } },
          data: { isActive: false }
        })
        break

      case 'updatePricing':
        if (!data?.amount || typeof data.amount !== 'number') {
          return NextResponse.json(
            { error: 'Amount value required' },
            { status: 400 }
          )
        }
        result = await prisma.paymentCatalogItem.updateMany({
          where: { id: { in: itemIds } },
          data: { 
            amount: data.amount,
            discountPercentage: data.discountPercentage || 0
          }
        })
        break

      case 'updateCategory':
        if (!data?.category) {
          return NextResponse.json(
            { error: 'Category value required' },
            { status: 400 }
          )
        }
        result = await prisma.paymentCatalogItem.updateMany({
          where: { id: { in: itemIds } },
          data: { 
            category: data.category,
            subcategory: data.subcategory
          }
        })
        break

      case 'delete':
        // Soft delete by marking as inactive
        result = await prisma.paymentCatalogItem.updateMany({
          where: { id: { in: itemIds } },
          data: { 
            isActive: false,
            deletedAt: new Date()
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log the action
    console.log(`Admin ${session.user.email} performed bulk action: ${action} on ${itemIds.length} payment items`)

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.count
    })

  } catch (error) {
    console.error('Error performing bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/payments/catalog - Delete multiple items
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { itemIds, permanent } = body

    if (!itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: 'Item IDs required' },
        { status: 400 }
      )
    }

    if (permanent) {
      // Check if any items have associated payments
      const itemsWithPayments = await prisma.paymentCatalogItem.findMany({
        where: {
          id: { in: itemIds },
          payments: { some: {} }
        },
        select: { id: true, name: true }
      })

      if (itemsWithPayments.length > 0) {
        return NextResponse.json({
          error: 'Cannot permanently delete items with associated payments',
          itemsWithPayments
        }, { status: 400 })
      }

      // Permanent deletion
      const result = await prisma.paymentCatalogItem.deleteMany({
        where: { id: { in: itemIds } }
      })

      console.log(`Admin ${session.user.email} permanently deleted ${result.count} payment catalog items`)

      return NextResponse.json({
        message: `${result.count} payment catalog items permanently deleted`
      })
    } else {
      // Soft delete
      const result = await prisma.paymentCatalogItem.updateMany({
        where: { id: { in: itemIds } },
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      })

      console.log(`Admin ${session.user.email} soft deleted ${result.count} payment catalog items`)

      return NextResponse.json({
        message: `${result.count} payment catalog items marked for deletion`
      })
    }

  } catch (error) {
    console.error('Error deleting payment catalog items:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment catalog items' },
      { status: 500 }
    )
  }
}
