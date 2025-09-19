import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  createPOP3Session,
  getPOP3Session,
  parsePOP3Command,
  handleUSER,
  handlePASS,
  handleSTAT,
  handleLIST,
  handleRETR,
  handleDELE,
  handleNOOP,
  handleRSET,
  handleQUIT,
  handleUIDL,
  handleTOP,
  POP3_RESPONSES,
  type POP3Response
} from '@/lib/pop3-service'

// POST /api/pop3 - POP3 Protocol Simulation
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { sessionId, command } = await request.json()

    // Create new session if not provided
    if (!sessionId) {
      const session = createPOP3Session()
      return NextResponse.json({
        sessionId: session.id,
        response: {
          status: POP3_RESPONSES.OK,
          message: 'POP3 server ready'
        },
        state: session.state
      })
    }

    // Get existing session
    const session = getPOP3Session(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found',
        response: {
          status: POP3_RESPONSES.ERR,
          message: 'Session expired or invalid'
        }
      }, { status: 400 })
    }

    if (!command) {
      return NextResponse.json({
        error: 'Command required',
        response: {
          status: POP3_RESPONSES.ERR,
          message: 'Command required'
        }
      }, { status: 400 })
    }

    // Parse and handle POP3 command
    let response: POP3Response
    
    try {
      const parsedCommand = parsePOP3Command(command)
      response = await handlePOP3Command(session, parsedCommand)
    } catch (error) {
      response = {
        status: POP3_RESPONSES.ERR,
        message: 'Invalid command format'
      }
    }

    const updatedSession = getPOP3Session(sessionId)

    return NextResponse.json({
      sessionId,
      response,
      state: updatedSession?.state || 'UNKNOWN',
      authenticated: updatedSession?.authenticated || false
    })

  } catch (error) {
    console.error('POP3 API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      response: {
        status: POP3_RESPONSES.ERR,
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
})

// Handle individual POP3 commands
async function handlePOP3Command(session: any, command: any): Promise<POP3Response> {
  const { command: cmd, parameters } = command

  switch (cmd) {
    case 'USER':
      if (parameters.length >= 1) {
        return handleUSER(session, parameters[0])
      }
      return {
        status: POP3_RESPONSES.ERR,
        message: 'USER requires username'
      }
    
    case 'PASS':
      if (parameters.length >= 1) {
        return await handlePASS(session, parameters[0])
      }
      return {
        status: POP3_RESPONSES.ERR,
        message: 'PASS requires password'
      }
    
    case 'STAT':
      return handleSTAT(session)
    
    case 'LIST':
      return handleLIST(session, parameters[0])
    
    case 'RETR':
      if (parameters.length >= 1) {
        return handleRETR(session, parameters[0])
      }
      return {
        status: POP3_RESPONSES.ERR,
        message: 'RETR requires message number'
      }
    
    case 'DELE':
      if (parameters.length >= 1) {
        return handleDELE(session, parameters[0])
      }
      return {
        status: POP3_RESPONSES.ERR,
        message: 'DELE requires message number'
      }
    
    case 'NOOP':
      return handleNOOP(session)
    
    case 'RSET':
      return handleRSET(session)
    
    case 'QUIT':
      return await handleQUIT(session)
    
    case 'UIDL':
      return handleUIDL(session, parameters[0])
    
    case 'TOP':
      if (parameters.length >= 2) {
        return handleTOP(session, parameters[0], parameters[1])
      }
      return {
        status: POP3_RESPONSES.ERR,
        message: 'TOP requires message number and line count'
      }
    
    case 'CAPA':
      // Return capabilities
      return {
        status: POP3_RESPONSES.OK,
        message: 'Capability list follows',
        data: [
          'TOP',
          'UIDL',
          'RESP-CODES',
          'AUTH-RESP-CODE',
          'PIPELINING',
          'USER',
          '.'
        ]
      }
    
    default:
      return {
        status: POP3_RESPONSES.ERR,
        message: 'Command not recognized'
      }
  }
}

// GET /api/pop3 - Get POP3 service information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('sessionId')

  if (sessionId) {
    const session = getPOP3Session(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      sessionId: session.id,
      state: session.state,
      authenticated: session.authenticated,
      messageCount: session.messages.length,
      deletedCount: session.deletedMessages.size,
      lastActivity: session.lastActivity
    })
  }

  // Return service information
  return NextResponse.json({
    service: 'POP3 Simulation API',
    version: '1.0',
    protocol: 'POP3 (RFC 1939)',
    capabilities: [
      'USER/PASS authentication',
      'STAT - mailbox statistics',
      'LIST - message listing',
      'RETR - message retrieval',
      'DELE - message deletion',
      'NOOP - no operation',
      'RSET - reset session',
      'QUIT - end session',
      'UIDL - unique ID listing',
      'TOP - message headers and partial body',
      'CAPA - capability listing'
    ],
    commands: [
      'USER',
      'PASS',
      'STAT',
      'LIST',
      'RETR',
      'DELE',
      'NOOP',
      'RSET',
      'QUIT',
      'UIDL',
      'TOP',
      'CAPA'
    ],
    states: {
      AUTHORIZATION: 'Initial state, requires USER/PASS',
      TRANSACTION: 'Authenticated state, can access messages',
      UPDATE: 'Final state, committing changes'
    },
    limits: {
      sessionTimeout: 1800, // 30 minutes
      maxMessageSize: 26214400, // 25MB
      maxConnections: 50
    },
    endpoints: {
      pop3: '/api/pop3',
      config: '/api/pop3/config',
      test: '/api/pop3/test'
    },
    notes: [
      'POP3 is a download-and-delete protocol',
      'Messages are downloaded to client and removed from server',
      'Use IMAP for server-side message management',
      'Session state is maintained for transaction safety'
    ]
  })
})
