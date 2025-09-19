import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  createSMTPSession,
  getSMTPSession,
  parseSMTPCommand,
  handleHELO,
  handleEHLO,
  handleMAILFROM,
  handleRCPTTO,
  handleDATA,
  handleEmailData,
  handleQUIT,
  SMTP_CODES,
  type SMTPResponse
} from '@/lib/smtp-service'

// POST /api/smtp - SMTP Protocol Simulation
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { sessionId, command, data } = await request.json()

    // Create new session if not provided
    let session
    if (!sessionId) {
      session = createSMTPSession()
      return NextResponse.json({
        sessionId: session.id,
        response: {
          code: SMTP_CODES.SERVICE_READY,
          message: 'SMTP Service Ready'
        }
      })
    }

    // Get existing session
    session = getSMTPSession(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found',
        response: {
          code: SMTP_CODES.SERVICE_NOT_AVAILABLE,
          message: 'Session expired or invalid'
        }
      }, { status: 400 })
    }

    let response: SMTPResponse

    // Handle email data submission (after DATA command)
    if (session.state === 'DATA' && data) {
      response = await handleEmailData(session, data)
    } else if (command) {
      // Parse and handle SMTP command
      const parsedCommand = parseSMTPCommand(command)
      response = await handleSMTPCommand(session, parsedCommand)
    } else {
      response = {
        code: SMTP_CODES.SYNTAX_ERROR,
        message: 'Invalid request format'
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      response,
      sessionState: session.state
    })

  } catch (error) {
    console.error('SMTP API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      response: {
        code: SMTP_CODES.LOCAL_ERROR,
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
})

// Handle individual SMTP commands
async function handleSMTPCommand(session: any, command: any): Promise<SMTPResponse> {
  switch (command.command) {
    case 'HELO':
      return handleHELO(session, command.parameters)
    
    case 'EHLO':
      return handleEHLO(session, command.parameters)
    
    case 'MAIL':
      if (command.parameters?.toUpperCase().startsWith('FROM:')) {
        return handleMAILFROM(session, command.parameters)
      }
      return {
        code: SMTP_CODES.SYNTAX_ERROR,
        message: 'Syntax error in parameters'
      }
    
    case 'RCPT':
      if (command.parameters?.toUpperCase().startsWith('TO:')) {
        return handleRCPTTO(session, command.parameters)
      }
      return {
        code: SMTP_CODES.SYNTAX_ERROR,
        message: 'Syntax error in parameters'
      }
    
    case 'DATA':
      return handleDATA(session)
    
    case 'QUIT':
      return handleQUIT(session)
    
    case 'RSET':
      // Reset session to HELO state
      session.state = 'HELO'
      session.mailFrom = undefined
      session.rcptTo = []
      session.data = undefined
      return {
        code: SMTP_CODES.OK,
        message: 'Reset OK'
      }
    
    case 'NOOP':
      return {
        code: SMTP_CODES.OK,
        message: 'OK'
      }
    
    case 'HELP':
      return {
        code: SMTP_CODES.OK,
        message: 'Commands: HELO EHLO MAIL RCPT DATA RSET NOOP QUIT HELP'
      }
    
    default:
      return {
        code: SMTP_CODES.COMMAND_UNRECOGNIZED,
        message: 'Command unrecognized'
      }
  }
}

// GET /api/smtp - Get SMTP service information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('sessionId')

  if (sessionId) {
    const session = getSMTPSession(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      sessionId: session.id,
      state: session.state,
      authenticated: session.authenticated,
      clientHost: session.clientHost,
      mailFrom: session.mailFrom,
      rcptTo: session.rcptTo,
      lastActivity: session.lastActivity
    })
  }

  // Return service information
  return NextResponse.json({
    service: 'SMTP Simulation API',
    version: '1.0',
    capabilities: [
      'HELO/EHLO',
      'MAIL FROM',
      'RCPT TO', 
      'DATA',
      'AUTH PLAIN',
      'RSET',
      'NOOP',
      'QUIT',
      'HELP'
    ],
    limits: {
      maxMessageSize: 26214400, // 25MB
      maxRecipients: 100,
      sessionTimeout: 1800 // 30 minutes
    },
    endpoints: {
      smtp: '/api/smtp',
      auth: '/api/smtp/auth',
      config: '/api/smtp/config'
    }
  })
})
