import { NextResponse } from 'next/server'

export interface ApiError {
  statusCode: number
  message: string
  details?: string
}

export class HttpError extends Error {
  statusCode: number
  details?: string

  constructor(statusCode: number, message: string, details?: string) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.name = 'HttpError'
  }
}

export function createApiError(statusCode: number, message: string, details?: string): NextResponse {
  return NextResponse.json(
    {
      error: message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof HttpError) {
    return createApiError(error.statusCode, error.message, error.details)
  }

  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error'
    
    return createApiError(500, message)
  }

  return createApiError(500, 'An unexpected error occurred')
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new HttpError(400, `${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new HttpError(400, 'Invalid email format')
  }
}

export function validateLength(value: string, fieldName: string, min: number, max?: number): void {
  if (value.length < min) {
    throw new HttpError(400, `${fieldName} must be at least ${min} characters long`)
  }
  if (max && value.length > max) {
    throw new HttpError(400, `${fieldName} must not exceed ${max} characters`)
  }
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function validateAndSanitize(input: string, fieldName: string, required = true): string {
  if (required) {
    validateRequired(input, fieldName)
  }
  
  if (!input) return ''
  
  const sanitized = sanitizeInput(input)
  
  if (required && !sanitized) {
    throw new HttpError(400, `${fieldName} cannot be empty after sanitization`)
  }
  
  return sanitized
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export function getRateLimitError(): NextResponse {
  return createApiError(429, 'Too many requests. Please try again later.')
}
