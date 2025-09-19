import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { 
  handleApiError, 
  validateAndSanitize, 
  HttpError,
  validateRequired,
  validateEmail,
  validateLength
} from './error-handler'
import { 
  requireAuth, 
  requireAdmin, 
  getClientIP, 
  logAuditEvent,
  validateCSRFToken,
  generateCSRFToken
} from './security'

export interface SecureApiOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  validateCSRF?: boolean
  logAudit?: boolean
  sanitizeInput?: boolean
}

export interface ApiContext {
  request: NextRequest
  user?: any
  clientIP: string
}

export type SecureApiHandler = (
  context: ApiContext,
  body?: any
) => Promise<NextResponse>

export function createSecureApi(
  handler: SecureApiHandler,
  options: SecureApiOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const clientIP = getClientIP(request)
      let user = null

      // Authentication check
      if (options.requireAuth || options.requireAdmin) {
        const authError = await requireAuth(request)
        if (authError) return authError

        const token = await getToken({ req: request })
        user = token
      }

      // Admin authorization check
      if (options.requireAdmin) {
        const adminError = await requireAdmin(request)
        if (adminError) return adminError
      }

      // Parse and sanitize request body
      let body = null
      if (request.method !== 'GET' && request.method !== 'DELETE') {
        try {
          const rawBody = await request.json()
          
          if (options.sanitizeInput) {
            body = sanitizeRequestBody(rawBody)
          } else {
            body = rawBody
          }
        } catch (error) {
          throw new HttpError(400, 'Invalid JSON in request body')
        }
      }

      // CSRF validation for state-changing operations
      if (options.validateCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token') || body?.csrfToken
        const sessionToken = user?.sub || ''
        
        if (!validateCSRFToken(csrfToken, sessionToken)) {
          throw new HttpError(403, 'Invalid CSRF token')
        }
      }

      // Create API context
      const context: ApiContext = {
        request,
        user,
        clientIP,
      }

      // Execute the handler
      const response = await handler(context, body)

      // Audit logging
      if (options.logAudit && user) {
        await logAuditEvent({
          userId: user.sub,
          action: request.method,
          resource: request.nextUrl.pathname,
          details: body ? { bodyKeys: Object.keys(body) } : undefined,
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || 'unknown',
        })
      }

      return response
    } catch (error) {
      return handleApiError(error)
    }
  }
}

function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return validateAndSanitize(body, 'input', false)
  }
  
  if (Array.isArray(body)) {
    return body.map(sanitizeRequestBody)
  }
  
  if (body && typeof body === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      sanitized[key] = sanitizeRequestBody(value)
    }
    return sanitized
  }
  
  return body
}

// Validation helpers for common use cases
export const validators = {
  required: (value: any, fieldName: string) => {
    validateRequired(value, fieldName)
    return value
  },
  
  email: (value: string, fieldName: string = 'email') => {
    validateRequired(value, fieldName)
    validateEmail(value)
    return value.toLowerCase().trim()
  },
  
  string: (value: string, fieldName: string, minLength = 1, maxLength?: number) => {
    validateRequired(value, fieldName)
    validateLength(value, fieldName, minLength, maxLength)
    return validateAndSanitize(value, fieldName)
  },
  
  optionalString: (value: string | undefined, fieldName: string, maxLength?: number) => {
    if (!value) return ''
    if (maxLength) validateLength(value, fieldName, 0, maxLength)
    return validateAndSanitize(value, fieldName, false)
  },
  
  number: (value: any, fieldName: string, min?: number, max?: number) => {
    validateRequired(value, fieldName)
    const num = Number(value)
    if (isNaN(num)) {
      throw new HttpError(400, `${fieldName} must be a valid number`)
    }
    if (min !== undefined && num < min) {
      throw new HttpError(400, `${fieldName} must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new HttpError(400, `${fieldName} must not exceed ${max}`)
    }
    return num
  },
  
  boolean: (value: any, fieldName: string) => {
    if (typeof value === 'boolean') return value
    if (value === 'true' || value === '1') return true
    if (value === 'false' || value === '0') return false
    throw new HttpError(400, `${fieldName} must be a boolean value`)
  },
  
  enum: (value: any, fieldName: string, allowedValues: string[]) => {
    validateRequired(value, fieldName)
    if (!allowedValues.includes(value)) {
      throw new HttpError(400, `${fieldName} must be one of: ${allowedValues.join(', ')}`)
    }
    return value
  },
}

// CSRF token endpoint
export const csrfHandler = createSecureApi(
  async (context) => {
    const token = generateCSRFToken()
    return NextResponse.json({ csrfToken: token })
  },
  { requireAuth: true }
)

// Helper for paginated responses
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}

// Helper for success responses
export function createSuccessResponse(data?: any, message?: string) {
  return NextResponse.json({
    success: true,
    message,
    data,
  })
}

// Helper for error responses
export function createErrorResponse(message: string, statusCode = 400) {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: statusCode })
}
