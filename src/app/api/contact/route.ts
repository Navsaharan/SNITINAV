import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
})

// GET /api/contact - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unread') === 'true'

    const skip = (page - 1) * limit

    const where = unreadOnly ? { isRead: false } : {}

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Import secure API wrapper
import { createSecureApi, validators, createSuccessResponse } from '@/lib/secure-api'

// POST /api/contact - Submit contact form with enhanced security
export const POST = createSecureApi(
  async (context, body) => {
    // Enhanced validation with sanitization
    const firstName = validators.string(body.firstName, 'firstName', 1, 50)
    const lastName = validators.string(body.lastName, 'lastName', 1, 50)
    const email = validators.email(body.email)
    const phone = validators.optionalString(body.phone, 'phone', 20)
    const subject = validators.string(body.subject, 'subject', 1, 200)
    const message = validators.string(body.message, 'message', 10, 2000)

    const fullName = `${firstName} ${lastName}`

    // Log the submission for debugging (with security info)
    console.log('Processing secure contact form submission:', {
      name: fullName,
      email,
      subject,
      ip: context.clientIP,
      timestamp: new Date().toISOString(),
    })

    // Save to database with security metadata
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: fullName,
        email,
        contact: phone || null,
        subject: subject || null,
        message,
        // Add security tracking fields if they exist in your schema
        // ipAddress: context.clientIP,
        // userAgent: context.request.headers.get('user-agent') || 'unknown',
      }
    })

    console.log('Secure contact form submission saved:', {
      id: contactMessage.id,
      name: fullName,
      email,
      timestamp: new Date().toISOString(),
    })

    return createSuccessResponse(
      { id: contactMessage.id },
      'Thank you for your message. We will get back to you soon!'
    )
  },
  {
    sanitizeInput: true,
    logAudit: true,
    // Rate limiting is handled by middleware
  }
)
