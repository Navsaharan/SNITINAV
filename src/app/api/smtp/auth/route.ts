import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { authenticateSMTPSession, getSMTPSession, SMTP_CODES } from '@/lib/smtp-service'

// POST /api/smtp/auth - SMTP Authentication
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { sessionId, method, credentials } = await request.json()

    if (!sessionId) {
      return NextResponse.json({
        error: 'Session ID required',
        response: {
          code: SMTP_CODES.SYNTAX_ERROR,
          message: 'Session ID required'
        }
      }, { status: 400 })
    }

    const session = getSMTPSession(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found',
        response: {
          code: SMTP_CODES.SERVICE_NOT_AVAILABLE,
          message: 'Session expired or invalid'
        }
      }, { status: 400 })
    }

    let response
    
    switch (method?.toUpperCase()) {
      case 'PLAIN':
        response = await handlePlainAuth(sessionId, credentials)
        break
      
      case 'LOGIN':
        response = await handleLoginAuth(sessionId, credentials)
        break
      
      default:
        response = {
          code: SMTP_CODES.PARAMETER_NOT_IMPLEMENTED,
          message: 'Authentication method not supported'
        }
    }

    return NextResponse.json({
      sessionId,
      response,
      authenticated: session.authenticated
    })

  } catch (error) {
    console.error('SMTP auth error:', error)
    return NextResponse.json({
      error: 'Authentication failed',
      response: {
        code: SMTP_CODES.LOCAL_ERROR,
        message: 'Authentication failed'
      }
    }, { status: 500 })
  }
})

// Handle PLAIN authentication
async function handlePlainAuth(sessionId: string, credentials: any) {
  try {
    // PLAIN format: \0username\0password (base64 encoded)
    let username: string, password: string

    if (credentials.encoded) {
      // Decode base64 credentials
      const decoded = Buffer.from(credentials.encoded, 'base64').toString('utf-8')
      const parts = decoded.split('\0')
      
      if (parts.length !== 3) {
        return {
          code: SMTP_CODES.SYNTAX_ERROR,
          message: 'Invalid PLAIN authentication format'
        }
      }
      
      username = parts[1] // parts[0] is usually empty (authorization identity)
      password = parts[2]
    } else if (credentials.username && credentials.password) {
      username = credentials.username
      password = credentials.password
    } else {
      return {
        code: SMTP_CODES.SYNTAX_ERROR,
        message: 'Invalid credentials format'
      }
    }

    return await authenticateSMTPSession(sessionId, username, password)

  } catch (error) {
    console.error('PLAIN auth error:', error)
    return {
      code: SMTP_CODES.LOCAL_ERROR,
      message: 'Authentication failed'
    }
  }
}

// Handle LOGIN authentication
async function handleLoginAuth(sessionId: string, credentials: any) {
  try {
    let username: string, password: string

    if (credentials.username && credentials.password) {
      // Direct username/password
      username = credentials.username
      password = credentials.password
    } else if (credentials.usernameEncoded && credentials.passwordEncoded) {
      // Base64 encoded username and password
      username = Buffer.from(credentials.usernameEncoded, 'base64').toString('utf-8')
      password = Buffer.from(credentials.passwordEncoded, 'base64').toString('utf-8')
    } else {
      return {
        code: SMTP_CODES.SYNTAX_ERROR,
        message: 'Invalid LOGIN authentication format'
      }
    }

    return await authenticateSMTPSession(sessionId, username, password)

  } catch (error) {
    console.error('LOGIN auth error:', error)
    return {
      code: SMTP_CODES.LOCAL_ERROR,
      message: 'Authentication failed'
    }
  }
}

// GET /api/smtp/auth - Get authentication methods
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    supportedMethods: ['PLAIN', 'LOGIN'],
    description: {
      PLAIN: 'RFC 4616 - PLAIN SASL Mechanism',
      LOGIN: 'LOGIN authentication method'
    },
    usage: {
      PLAIN: {
        format: 'Base64 encoded: \\0username\\0password',
        example: 'POST /api/smtp/auth with { "method": "PLAIN", "credentials": { "encoded": "..." } }'
      },
      LOGIN: {
        format: 'Username and password (optionally base64 encoded)',
        example: 'POST /api/smtp/auth with { "method": "LOGIN", "credentials": { "username": "...", "password": "..." } }'
      }
    },
    security: {
      encryption: 'Use HTTPS for secure credential transmission',
      sessionTimeout: '30 minutes',
      rateLimiting: 'Applied to prevent brute force attacks'
    }
  })
})
