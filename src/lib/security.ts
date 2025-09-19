import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, getRateLimitError } from './error-handler'

// Security headers configuration
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
}

// Rate limiting configurations
export const rateLimits = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  contact: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 submissions per hour
  admin: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 requests per minute for admin
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

// Apply security headers
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limitConfig: { maxRequests: number; windowMs: number }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(request)
    const identifier = `${clientIP}:${request.nextUrl.pathname}`
    
    if (!checkRateLimit(identifier, limitConfig.maxRequests, limitConfig.windowMs)) {
      return getRateLimitError()
    }
    
    return handler(request)
  }
}

// Authentication middleware
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return null
}

// Admin authentication middleware
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (token.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  return null
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In a real implementation, you'd store CSRF tokens in session/database
  // For now, we'll use a simple validation
  return token && token.length === 64 && /^[a-f0-9]+$/.test(token)
}

// Input sanitization
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// SQL injection prevention (for raw queries)
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '\\;')
}

// Validate file uploads
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
  }
  
  return { valid: true }
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}

// Audit logging
export interface AuditLog {
  userId?: string
  action: string
  resource: string
  details?: any
  ip: string
  userAgent: string
  timestamp: Date
}

export async function logAuditEvent(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    timestamp: new Date(),
  }
  
  // In a real implementation, you'd save this to a database
  console.log('AUDIT LOG:', JSON.stringify(auditEntry, null, 2))
  
  // You could also send to external logging service
  // await sendToLoggingService(auditEntry)
}
