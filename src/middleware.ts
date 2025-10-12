import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { applySecurityHeaders, getClientIP, rateLimits } from "./lib/security"
import { checkRateLimit } from "./lib/error-handler"

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next()

    // Apply security headers to all responses
    applySecurityHeaders(response)

    // Rate limiting for different endpoints
    const clientIP = getClientIP(req)
    const pathname = req.nextUrl.pathname

    // Apply rate limiting based on route
    if (pathname.startsWith('/api/auth/signin') || pathname.startsWith('/api/auth/callback')) {
      const identifier = `login:${clientIP}`
      if (!checkRateLimit(identifier, rateLimits.login.maxRequests, rateLimits.login.windowMs)) {
        return new NextResponse('Too many login attempts. Please try again later.', { status: 429 })
      }
    } else if (pathname.startsWith('/api/contact')) {
      const identifier = `contact:${clientIP}`
      if (!checkRateLimit(identifier, rateLimits.contact.maxRequests, rateLimits.contact.windowMs)) {
        return new NextResponse('Too many contact submissions. Please try again later.', { status: 429 })
      }
    } else if (pathname.startsWith('/api/admin')) {
      const identifier = `admin:${clientIP}`
      if (!checkRateLimit(identifier, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
        return new NextResponse('Too many admin requests. Please try again later.', { status: 429 })
      }
    } else if (pathname.startsWith('/api/')) {
      const identifier = `api:${clientIP}`
      if (!checkRateLimit(identifier, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
        return new NextResponse('Too many API requests. Please try again later.', { status: 429 })
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Check if user is trying to access admin routes
        if (pathname.startsWith('/admin')) {
          // Allow access to login page without authentication
          if (pathname === '/admin/login') {
            return true
          }
          // For other admin routes, require authentication and admin role
          return !!token && token.role === 'ADMIN'
        }

        // Check if user is trying to access student routes
        if (pathname.startsWith('/student')) {
          // Allow access to login and public pages without authentication
          if (pathname === '/student/login' || pathname === '/student/forgot-password') {
            return true
          }
          // For other student routes, require authentication and student role
          return !!token && ['STUDENT', 'FACULTY', 'STAFF'].includes(token.role)
        }

        // Allow access to all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/api/admin/:path*',
    '/api/student/:path*',
    '/api/contact/:path*',
  ]
}
