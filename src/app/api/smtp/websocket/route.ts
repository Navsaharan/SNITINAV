import { NextRequest } from 'next/server'
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
  type SMTPSession,
  type SMTPResponse
} from '@/lib/smtp-service'

// WebSocket-like SMTP server simulation
// Note: This is a REST API that simulates WebSocket behavior for SMTP protocol

// POST /api/smtp/websocket - Handle SMTP protocol over HTTP
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { action, sessionId, command, data } = await request.json()

    switch (action) {
      case 'connect':
        return handleConnect()
      
      case 'command':
        return handleCommand(sessionId, command)
      
      case 'data':
        return handleData(sessionId, data)
      
      case 'disconnect':
        return handleDisconnect(sessionId)
      
      default:
        return Response.json({
          error: 'Invalid action',
          validActions: ['connect', 'command', 'data', 'disconnect']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('SMTP WebSocket error:', error)
    return Response.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
})

// Handle new SMTP connection
async function handleConnect() {
  const session = createSMTPSession()
  
  return Response.json({
    sessionId: session.id,
    response: {
      code: SMTP_CODES.SERVICE_READY,
      message: `220 ${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'institute.edu'} ESMTP Service Ready`
    },
    state: session.state
  })
}

// Handle SMTP command
async function handleCommand(sessionId: string, commandLine: string) {
  if (!sessionId) {
    return Response.json({
      error: 'Session ID required'
    }, { status: 400 })
  }

  const session = getSMTPSession(sessionId)
  if (!session) {
    return Response.json({
      error: 'Session not found',
      response: {
        code: SMTP_CODES.SERVICE_NOT_AVAILABLE,
        message: '421 Service not available'
      }
    }, { status: 400 })
  }

  const command = parseSMTPCommand(commandLine)
  let response: SMTPResponse

  try {
    switch (command.command) {
      case 'HELO':
        response = handleHELO(session, command.parameters)
        break
      
      case 'EHLO':
        response = handleEHLO(session, command.parameters)
        break
      
      case 'MAIL':
        if (command.parameters?.toUpperCase().startsWith('FROM:')) {
          response = handleMAILFROM(session, command.parameters)
        } else {
          response = {
            code: SMTP_CODES.SYNTAX_ERROR,
            message: '501 Syntax error in parameters'
          }
        }
        break
      
      case 'RCPT':
        if (command.parameters?.toUpperCase().startsWith('TO:')) {
          response = handleRCPTTO(session, command.parameters)
        } else {
          response = {
            code: SMTP_CODES.SYNTAX_ERROR,
            message: '501 Syntax error in parameters'
          }
        }
        break
      
      case 'DATA':
        response = handleDATA(session)
        break
      
      case 'RSET':
        // Reset session
        const updatedSession = getSMTPSession(sessionId)
        if (updatedSession) {
          updatedSession.state = 'HELO'
          updatedSession.mailFrom = undefined
          updatedSession.rcptTo = []
        }
        response = {
          code: SMTP_CODES.OK,
          message: '250 Reset OK'
        }
        break
      
      case 'NOOP':
        response = {
          code: SMTP_CODES.OK,
          message: '250 OK'
        }
        break
      
      case 'QUIT':
        response = handleQUIT(session)
        break
      
      case 'HELP':
        response = {
          code: SMTP_CODES.OK,
          message: '250 Commands: HELO EHLO MAIL RCPT DATA RSET NOOP QUIT HELP'
        }
        break
      
      case 'AUTH':
        response = {
          code: SMTP_CODES.OK,
          message: '250 AUTH methods: PLAIN LOGIN'
        }
        break
      
      default:
        response = {
          code: SMTP_CODES.COMMAND_UNRECOGNIZED,
          message: '500 Command unrecognized'
        }
    }

    const updatedSession = getSMTPSession(sessionId)
    
    return Response.json({
      sessionId,
      response,
      state: updatedSession?.state || 'UNKNOWN',
      authenticated: updatedSession?.authenticated || false
    })

  } catch (error) {
    console.error('SMTP command error:', error)
    return Response.json({
      sessionId,
      response: {
        code: SMTP_CODES.LOCAL_ERROR,
        message: '451 Local error in processing'
      },
      state: session.state
    })
  }
}

// Handle email data submission
async function handleData(sessionId: string, emailData: string) {
  if (!sessionId) {
    return Response.json({
      error: 'Session ID required'
    }, { status: 400 })
  }

  const session = getSMTPSession(sessionId)
  if (!session) {
    return Response.json({
      error: 'Session not found'
    }, { status: 400 })
  }

  if (session.state !== 'DATA') {
    return Response.json({
      response: {
        code: SMTP_CODES.BAD_SEQUENCE,
        message: '503 Bad sequence of commands'
      },
      state: session.state
    })
  }

  try {
    const response = await handleEmailData(session, emailData)
    const updatedSession = getSMTPSession(sessionId)
    
    return Response.json({
      sessionId,
      response,
      state: updatedSession?.state || 'UNKNOWN'
    })

  } catch (error) {
    console.error('SMTP data error:', error)
    return Response.json({
      sessionId,
      response: {
        code: SMTP_CODES.TRANSACTION_FAILED,
        message: '554 Transaction failed'
      },
      state: session.state
    })
  }
}

// Handle SMTP disconnection
async function handleDisconnect(sessionId: string) {
  if (!sessionId) {
    return Response.json({
      message: 'No session to disconnect'
    })
  }

  const session = getSMTPSession(sessionId)
  if (session) {
    handleQUIT(session)
  }

  return Response.json({
    message: 'Session disconnected',
    response: {
      code: 221,
      message: '221 Service closing transmission channel'
    }
  })
}

// GET /api/smtp/websocket - Get WebSocket connection info
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return Response.json({
    service: 'SMTP WebSocket Simulation',
    description: 'HTTP-based SMTP protocol simulation for email clients',
    usage: {
      connect: 'POST with { "action": "connect" }',
      command: 'POST with { "action": "command", "sessionId": "...", "command": "HELO example.com" }',
      data: 'POST with { "action": "data", "sessionId": "...", "data": "email content..." }',
      disconnect: 'POST with { "action": "disconnect", "sessionId": "..." }'
    },
    examples: {
      basicFlow: [
        '1. Connect: { "action": "connect" }',
        '2. HELO: { "action": "command", "sessionId": "...", "command": "HELO client.example.com" }',
        '3. MAIL FROM: { "action": "command", "sessionId": "...", "command": "MAIL FROM:<sender@example.com>" }',
        '4. RCPT TO: { "action": "command", "sessionId": "...", "command": "RCPT TO:<recipient@example.com>" }',
        '5. DATA: { "action": "command", "sessionId": "...", "command": "DATA" }',
        '6. Send email: { "action": "data", "sessionId": "...", "data": "Subject: Test\\r\\n\\r\\nHello World" }',
        '7. QUIT: { "action": "command", "sessionId": "...", "command": "QUIT" }'
      ]
    },
    notes: [
      'This is an HTTP simulation of SMTP protocol',
      'Real SMTP clients should use the standard SMTP API endpoints',
      'Session timeout is 30 minutes',
      'Authentication is required for external senders'
    ]
  })
})
