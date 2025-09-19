import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  createIMAPSession,
  getIMAPSession,
  parseIMAPCommand,
  handleCAPABILITY,
  handleLOGIN,
  handleLIST,
  handleSELECT,
  handleFETCH,
  handleSEARCH,
  handleSTORE,
  handleLOGOUT,
  type IMAPResponse
} from '@/lib/imap-service'

// POST /api/imap - IMAP Protocol Simulation
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { sessionId, command } = await request.json()

    // Create new session if not provided
    if (!sessionId) {
      const session = createIMAPSession()
      return NextResponse.json({
        sessionId: session.id,
        responses: [{
          type: 'untagged',
          status: 'OK',
          message: 'IMAP4rev1 Service Ready'
        }],
        state: session.state
      })
    }

    // Get existing session
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

    if (!command) {
      return NextResponse.json({
        error: 'Command required',
        responses: [{
          type: 'tagged',
          tag: '*',
          status: 'BAD',
          message: 'Command required'
        }]
      }, { status: 400 })
    }

    // Parse and handle IMAP command
    let responses: IMAPResponse[]
    
    try {
      const parsedCommand = parseIMAPCommand(command)
      responses = await handleIMAPCommand(session, parsedCommand)
    } catch (error) {
      responses = [{
        type: 'tagged',
        tag: '*',
        status: 'BAD',
        message: 'Invalid command format'
      }]
    }

    const updatedSession = getIMAPSession(sessionId)

    return NextResponse.json({
      sessionId,
      responses,
      state: updatedSession?.state || 'UNKNOWN',
      authenticated: updatedSession?.authenticated || false
    })

  } catch (error) {
    console.error('IMAP API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      responses: [{
        type: 'untagged',
        status: 'BYE',
        message: 'Internal server error'
      }]
    }, { status: 500 })
  }
})

// Handle individual IMAP commands
async function handleIMAPCommand(session: any, command: any): Promise<IMAPResponse[]> {
  const { tag, command: cmd, parameters } = command

  switch (cmd) {
    case 'CAPABILITY':
      return handleCAPABILITY(session, tag)
    
    case 'LOGIN':
      if (parameters.length >= 2) {
        return await handleLOGIN(session, tag, parameters[0], parameters[1])
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'LOGIN requires username and password'
      }]
    
    case 'LIST':
      const reference = parameters[0] || ''
      const mailbox = parameters[1] || '*'
      return await handleLIST(session, tag, reference, mailbox)
    
    case 'LSUB':
      // LSUB is similar to LIST but for subscribed mailboxes
      return await handleLIST(session, tag, parameters[0] || '', parameters[1] || '*')
    
    case 'SELECT':
      if (parameters.length >= 1) {
        return await handleSELECT(session, tag, parameters[0])
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'SELECT requires mailbox name'
      }]
    
    case 'EXAMINE':
      // EXAMINE is like SELECT but read-only
      if (parameters.length >= 1) {
        const responses = await handleSELECT(session, tag, parameters[0])
        // Change the final response to indicate read-only
        const lastResponse = responses[responses.length - 1]
        if (lastResponse.message?.includes('READ-WRITE')) {
          lastResponse.message = lastResponse.message.replace('READ-WRITE', 'READ-ONLY')
        }
        return responses
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'EXAMINE requires mailbox name'
      }]
    
    case 'FETCH':
      if (parameters.length >= 2) {
        return await handleFETCH(session, tag, parameters[0], parameters.slice(1).join(' '))
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'FETCH requires sequence set and items'
      }]
    
    case 'SEARCH':
      return await handleSEARCH(session, tag, parameters)
    
    case 'STORE':
      if (parameters.length >= 3) {
        return await handleSTORE(session, tag, parameters[0], parameters[1], parameters.slice(2))
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'STORE requires sequence set, flags, and flag list'
      }]
    
    case 'CLOSE':
      // Close currently selected mailbox
      session.state = 'AUTHENTICATED'
      session.selectedFolder = undefined
      return [{
        type: 'tagged',
        tag,
        status: 'OK',
        message: 'CLOSE completed'
      }]
    
    case 'EXPUNGE':
      // Remove messages marked for deletion
      return [{
        type: 'tagged',
        tag,
        status: 'OK',
        message: 'EXPUNGE completed'
      }]
    
    case 'NOOP':
      return [{
        type: 'tagged',
        tag,
        status: 'OK',
        message: 'NOOP completed'
      }]
    
    case 'LOGOUT':
      return handleLOGOUT(session, tag)
    
    case 'NAMESPACE':
      return [
        {
          type: 'untagged',
          command: 'NAMESPACE',
          data: '(("" "/")) NIL NIL'
        },
        {
          type: 'tagged',
          tag,
          status: 'OK',
          message: 'NAMESPACE completed'
        }
      ]
    
    case 'STATUS':
      if (parameters.length >= 2) {
        const mailboxName = parameters[0]
        const statusItems = parameters[1]
        
        return [
          {
            type: 'untagged',
            command: 'STATUS',
            data: `${mailboxName} (MESSAGES 0 RECENT 0 UIDNEXT 1 UIDVALIDITY ${Date.now()} UNSEEN 0)`
          },
          {
            type: 'tagged',
            tag,
            status: 'OK',
            message: 'STATUS completed'
          }
        ]
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'STATUS requires mailbox name and status items'
      }]
    
    case 'APPEND':
      // Append message to mailbox
      return [{
        type: 'tagged',
        tag,
        status: 'OK',
        message: 'APPEND completed'
      }]
    
    case 'CREATE':
      // Create mailbox
      if (parameters.length >= 1) {
        return [{
          type: 'tagged',
          tag,
          status: 'OK',
          message: 'CREATE completed'
        }]
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'CREATE requires mailbox name'
      }]
    
    case 'DELETE':
      // Delete mailbox
      if (parameters.length >= 1) {
        return [{
          type: 'tagged',
          tag,
          status: 'OK',
          message: 'DELETE completed'
        }]
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'DELETE requires mailbox name'
      }]
    
    case 'RENAME':
      // Rename mailbox
      if (parameters.length >= 2) {
        return [{
          type: 'tagged',
          tag,
          status: 'OK',
          message: 'RENAME completed'
        }]
      }
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'RENAME requires old and new mailbox names'
      }]
    
    case 'SUBSCRIBE':
    case 'UNSUBSCRIBE':
      // Subscription management
      return [{
        type: 'tagged',
        tag,
        status: 'OK',
        message: `${cmd} completed`
      }]
    
    default:
      return [{
        type: 'tagged',
        tag,
        status: 'BAD',
        message: 'Command unrecognized'
      }]
  }
}

// GET /api/imap - Get IMAP service information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('sessionId')

  if (sessionId) {
    const session = getIMAPSession(sessionId)
    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      sessionId: session.id,
      state: session.state,
      authenticated: session.authenticated,
      selectedFolder: session.selectedFolder,
      capabilities: session.capabilities,
      lastActivity: session.lastActivity
    })
  }

  // Return service information
  return NextResponse.json({
    service: 'IMAP4rev1 Simulation API',
    version: '1.0',
    capabilities: [
      'IMAP4rev1',
      'STARTTLS',
      'AUTH=PLAIN',
      'AUTH=LOGIN',
      'NAMESPACE',
      'IDLE',
      'SORT',
      'THREAD=REFERENCES',
      'THREAD=ORDEREDSUBJECT',
      'MULTIAPPEND',
      'UNSELECT',
      'CHILDREN',
      'UIDPLUS'
    ],
    commands: [
      'CAPABILITY',
      'LOGIN',
      'LIST',
      'LSUB',
      'SELECT',
      'EXAMINE',
      'FETCH',
      'SEARCH',
      'STORE',
      'CLOSE',
      'EXPUNGE',
      'NOOP',
      'LOGOUT',
      'NAMESPACE',
      'STATUS',
      'APPEND',
      'CREATE',
      'DELETE',
      'RENAME',
      'SUBSCRIBE',
      'UNSUBSCRIBE'
    ],
    limits: {
      sessionTimeout: 1800, // 30 minutes
      maxMessageSize: 26214400, // 25MB
      maxConnections: 100
    },
    endpoints: {
      imap: '/api/imap',
      auth: '/api/imap/auth',
      config: '/api/imap/config'
    }
  })
})
