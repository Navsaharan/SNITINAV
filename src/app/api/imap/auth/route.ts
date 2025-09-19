import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { getIMAPSession, updateIMAPSession } from '@/lib/imap-service'
import { prisma } from '@/lib/prisma'

// POST /api/imap/auth - IMAP Authentication
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { sessionId, method, credentials } = await request.json()

    if (!sessionId) {
      return NextResponse.json({
        error: 'Session ID required',
        responses: [{
          type: 'tagged',
          tag: '*',
          status: 'BAD',
          message: 'Session ID required'
        }]
      }, { status: 400 })
    }

    const session = getIMAPSession(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found',
        responses: [{
          type: 'untagged',
          status: 'BYE',
          message: 'Session expired or invalid'
        }]
      }, { status: 400 })
    }

    let responses
    
    switch (method?.toUpperCase()) {
      case 'PLAIN':
        responses = await handlePlainAuth(sessionId, credentials)
        break
      
      case 'LOGIN':
        responses = await handleLoginAuth(sessionId, credentials)
        break
      
      default:
        responses = [{
          type: 'tagged',
          tag: '*',
          status: 'NO',
          message: 'Authentication method not supported'
        }]
    }

    const updatedSession = getIMAPSession(sessionId)

    return NextResponse.json({
      sessionId,
      responses,
      authenticated: updatedSession?.authenticated || false,
      state: updatedSession?.state || 'NOT_AUTHENTICATED'
    })

  } catch (error) {
    console.error('IMAP auth error:', error)
    return NextResponse.json({
      error: 'Authentication failed',
      responses: [{
        type: 'tagged',
        tag: '*',
        status: 'NO',
        message: 'Authentication failed'
      }]
    }, { status: 500 })
  }
})

// Handle PLAIN authentication
async function handlePlainAuth(sessionId: string, credentials: any) {
  try {
    let username: string, password: string

    if (credentials.encoded) {
      // Decode base64 credentials
      const decoded = Buffer.from(credentials.encoded, 'base64').toString('utf-8')
      const parts = decoded.split('\0')
      
      if (parts.length !== 3) {
        return [{
          type: 'tagged',
          tag: '*',
          status: 'BAD',
          message: 'Invalid PLAIN authentication format'
        }]
      }
      
      username = parts[1] // parts[0] is usually empty (authorization identity)
      password = parts[2]
    } else if (credentials.username && credentials.password) {
      username = credentials.username
      password = credentials.password
    } else {
      return [{
        type: 'tagged',
        tag: '*',
        status: 'BAD',
        message: 'Invalid credentials format'
      }]
    }

    return await authenticateIMAPUser(sessionId, username, password)

  } catch (error) {
    console.error('PLAIN auth error:', error)
    return [{
      type: 'tagged',
      tag: '*',
      status: 'NO',
      message: 'Authentication failed'
    }]
  }
}

// Handle LOGIN authentication
async function handleLoginAuth(sessionId: string, credentials: any) {
  try {
    let username: string, password: string

    if (credentials.username && credentials.password) {
      username = credentials.username
      password = credentials.password
    } else if (credentials.usernameEncoded && credentials.passwordEncoded) {
      username = Buffer.from(credentials.usernameEncoded, 'base64').toString('utf-8')
      password = Buffer.from(credentials.passwordEncoded, 'base64').toString('utf-8')
    } else {
      return [{
        type: 'tagged',
        tag: '*',
        status: 'BAD',
        message: 'Invalid LOGIN authentication format'
      }]
    }

    return await authenticateIMAPUser(sessionId, username, password)

  } catch (error) {
    console.error('LOGIN auth error:', error)
    return [{
      type: 'tagged',
      tag: '*',
      status: 'NO',
      message: 'Authentication failed'
    }]
  }
}

// Authenticate IMAP user
async function authenticateIMAPUser(sessionId: string, username: string, password: string) {
  try {
    // Verify credentials against email account
    const account = await prisma.emailAccount.findUnique({
      where: { 
        email: username,
        isActive: true
      }
    })
    
    if (!account) {
      return [{
        type: 'tagged',
        tag: '*',
        status: 'NO',
        message: 'Authentication failed'
      }]
    }
    
    // TODO: Verify password (implement password hashing/verification)
    // For now, we'll assume authentication is successful for valid accounts
    
    updateIMAPSession(sessionId, {
      state: 'AUTHENTICATED',
      authenticated: true,
      accountEmail: username
    })
    
    return [{
      type: 'tagged',
      tag: '*',
      status: 'OK',
      message: 'Authentication successful'
    }]
    
  } catch (error) {
    console.error('IMAP authentication error:', error)
    return [{
      type: 'tagged',
      tag: '*',
      status: 'NO',
      message: 'Authentication failed'
    }]
  }
}

// GET /api/imap/auth - Get authentication methods
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    service: 'IMAP Authentication',
    supportedMethods: ['PLAIN', 'LOGIN'],
    description: {
      PLAIN: 'RFC 4616 - PLAIN SASL Mechanism',
      LOGIN: 'LOGIN authentication method'
    },
    usage: {
      PLAIN: {
        format: 'Base64 encoded: \\0username\\0password',
        example: 'POST /api/imap/auth with { "method": "PLAIN", "credentials": { "encoded": "..." } }'
      },
      LOGIN: {
        format: 'Username and password (optionally base64 encoded)',
        example: 'POST /api/imap/auth with { "method": "LOGIN", "credentials": { "username": "...", "password": "..." } }'
      }
    },
    security: {
      encryption: 'Use HTTPS for secure credential transmission',
      sessionTimeout: '30 minutes',
      rateLimiting: 'Applied to prevent brute force attacks'
    },
    imapCommands: {
      authenticate: 'AUTHENTICATE PLAIN/LOGIN',
      login: 'LOGIN username password',
      logout: 'LOGOUT'
    }
  })
})
