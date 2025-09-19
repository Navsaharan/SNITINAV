import { prisma } from './prisma'
import { createEmail } from './email-service'
import { validateEmailAddress, generateMessageId } from './email-utils'

// SMTP Response Codes (RFC 5321)
export const SMTP_CODES = {
  // Success codes
  SERVICE_READY: 220,
  OK: 250,
  USER_NOT_LOCAL: 251,
  CANNOT_VERIFY: 252,
  START_MAIL_INPUT: 354,
  
  // Error codes
  SERVICE_NOT_AVAILABLE: 421,
  MAILBOX_BUSY: 450,
  LOCAL_ERROR: 451,
  INSUFFICIENT_STORAGE: 452,
  COMMAND_UNRECOGNIZED: 500,
  SYNTAX_ERROR: 501,
  COMMAND_NOT_IMPLEMENTED: 502,
  BAD_SEQUENCE: 503,
  PARAMETER_NOT_IMPLEMENTED: 504,
  MAILBOX_UNAVAILABLE: 550,
  USER_NOT_LOCAL_ERROR: 551,
  EXCEEDED_STORAGE: 552,
  MAILBOX_NAME_NOT_ALLOWED: 553,
  TRANSACTION_FAILED: 554
} as const

export interface SMTPSession {
  id: string
  state: 'INIT' | 'HELO' | 'MAIL' | 'RCPT' | 'DATA' | 'QUIT'
  clientHost?: string
  mailFrom?: string
  rcptTo: string[]
  data?: string
  authenticated: boolean
  accountEmail?: string
  createdAt: Date
  lastActivity: Date
}

export interface SMTPResponse {
  code: number
  message: string
  enhanced?: string // Enhanced status code (RFC 3463)
}

export interface SMTPCommand {
  command: string
  parameters?: string
  raw: string
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, SMTPSession>()

// Create new SMTP session
export const createSMTPSession = (): SMTPSession => {
  const sessionId = generateMessageId()
  const session: SMTPSession = {
    id: sessionId,
    state: 'INIT',
    rcptTo: [],
    authenticated: false,
    createdAt: new Date(),
    lastActivity: new Date()
  }
  
  sessions.set(sessionId, session)
  
  // Clean up old sessions (older than 30 minutes)
  cleanupOldSessions()
  
  return session
}

// Get SMTP session
export const getSMTPSession = (sessionId: string): SMTPSession | null => {
  const session = sessions.get(sessionId)
  if (session) {
    session.lastActivity = new Date()
  }
  return session || null
}

// Update SMTP session
export const updateSMTPSession = (sessionId: string, updates: Partial<SMTPSession>): SMTPSession | null => {
  const session = sessions.get(sessionId)
  if (!session) return null
  
  Object.assign(session, updates, { lastActivity: new Date() })
  sessions.set(sessionId, session)
  return session
}

// Delete SMTP session
export const deleteSMTPSession = (sessionId: string): void => {
  sessions.delete(sessionId)
}

// Clean up old sessions
const cleanupOldSessions = (): void => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.lastActivity < thirtyMinutesAgo) {
      sessions.delete(sessionId)
    }
  }
}

// Parse SMTP command
export const parseSMTPCommand = (line: string): SMTPCommand => {
  const trimmed = line.trim()
  const spaceIndex = trimmed.indexOf(' ')
  
  if (spaceIndex === -1) {
    return {
      command: trimmed.toUpperCase(),
      raw: trimmed
    }
  }
  
  return {
    command: trimmed.substring(0, spaceIndex).toUpperCase(),
    parameters: trimmed.substring(spaceIndex + 1),
    raw: trimmed
  }
}

// Handle HELO/EHLO command
export const handleHELO = (session: SMTPSession, parameters?: string): SMTPResponse => {
  if (!parameters) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Syntax error in parameters or arguments'
    }
  }
  
  updateSMTPSession(session.id, {
    state: 'HELO',
    clientHost: parameters
  })
  
  return {
    code: SMTP_CODES.OK,
    message: `Hello ${parameters}, pleased to meet you`
  }
}

// Handle EHLO command (Extended SMTP)
export const handleEHLO = (session: SMTPSession, parameters?: string): SMTPResponse => {
  if (!parameters) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Syntax error in parameters or arguments'
    }
  }
  
  updateSMTPSession(session.id, {
    state: 'HELO',
    clientHost: parameters
  })
  
  // Return ESMTP capabilities
  return {
    code: SMTP_CODES.OK,
    message: `Hello ${parameters}\nAUTH PLAIN LOGIN\nSTARTTLS\nSIZE 26214400\n8BITMIME\nSMTPUTF8`
  }
}

// Handle MAIL FROM command
export const handleMAILFROM = (session: SMTPSession, parameters?: string): SMTPResponse => {
  if (session.state !== 'HELO') {
    return {
      code: SMTP_CODES.BAD_SEQUENCE,
      message: 'Bad sequence of commands'
    }
  }
  
  if (!parameters) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Syntax error in parameters or arguments'
    }
  }
  
  // Parse email address from parameters (e.g., "FROM:<user@domain.com>")
  const match = parameters.match(/<([^>]+)>/)
  const emailAddress = match ? match[1] : parameters.replace(/^FROM:\s*/i, '')
  
  if (!validateEmailAddress(emailAddress)) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Invalid sender address'
    }
  }
  
  // Check if sender is authenticated or internal
  if (!session.authenticated && !isInternalEmail(emailAddress)) {
    return {
      code: SMTP_CODES.MAILBOX_UNAVAILABLE,
      message: 'Authentication required'
    }
  }
  
  updateSMTPSession(session.id, {
    state: 'MAIL',
    mailFrom: emailAddress,
    rcptTo: [] // Reset recipients for new message
  })
  
  return {
    code: SMTP_CODES.OK,
    message: 'Sender OK'
  }
}

// Handle RCPT TO command
export const handleRCPTTO = (session: SMTPSession, parameters?: string): SMTPResponse => {
  if (session.state !== 'MAIL' && session.state !== 'RCPT') {
    return {
      code: SMTP_CODES.BAD_SEQUENCE,
      message: 'Bad sequence of commands'
    }
  }
  
  if (!parameters) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Syntax error in parameters or arguments'
    }
  }
  
  // Parse email address from parameters (e.g., "TO:<user@domain.com>")
  const match = parameters.match(/<([^>]+)>/)
  const emailAddress = match ? match[1] : parameters.replace(/^TO:\s*/i, '')
  
  if (!validateEmailAddress(emailAddress)) {
    return {
      code: SMTP_CODES.SYNTAX_ERROR,
      message: 'Invalid recipient address'
    }
  }
  
  // Check if recipient exists (for internal emails)
  if (isInternalEmail(emailAddress)) {
    // TODO: Verify recipient exists in database
  }
  
  const updatedSession = updateSMTPSession(session.id, {
    state: 'RCPT',
    rcptTo: [...session.rcptTo, emailAddress]
  })
  
  return {
    code: SMTP_CODES.OK,
    message: 'Recipient OK'
  }
}

// Handle DATA command
export const handleDATA = (session: SMTPSession): SMTPResponse => {
  if (session.state !== 'RCPT') {
    return {
      code: SMTP_CODES.BAD_SEQUENCE,
      message: 'Bad sequence of commands'
    }
  }
  
  if (session.rcptTo.length === 0) {
    return {
      code: SMTP_CODES.BAD_SEQUENCE,
      message: 'No recipients specified'
    }
  }
  
  updateSMTPSession(session.id, {
    state: 'DATA'
  })
  
  return {
    code: SMTP_CODES.START_MAIL_INPUT,
    message: 'Start mail input; end with <CRLF>.<CRLF>'
  }
}

// Handle email data submission
export const handleEmailData = async (session: SMTPSession, emailData: string): Promise<SMTPResponse> => {
  if (session.state !== 'DATA') {
    return {
      code: SMTP_CODES.BAD_SEQUENCE,
      message: 'Bad sequence of commands'
    }
  }
  
  if (!session.mailFrom || session.rcptTo.length === 0) {
    return {
      code: SMTP_CODES.TRANSACTION_FAILED,
      message: 'Transaction failed'
    }
  }
  
  try {
    // Parse email headers and body
    const { headers, body } = parseEmailData(emailData)
    
    // Create email using existing email service
    const emailResult = await createEmail({
      from: session.mailFrom,
      to: session.rcptTo.join(', '),
      subject: headers.subject || '(No Subject)',
      body: body,
      priority: 'NORMAL',
      isDraft: false
    }, session.accountEmail || session.mailFrom)
    
    // Reset session for next message
    updateSMTPSession(session.id, {
      state: 'HELO',
      mailFrom: undefined,
      rcptTo: [],
      data: undefined
    })
    
    return {
      code: SMTP_CODES.OK,
      message: `Message accepted for delivery (ID: ${emailResult.messageId})`
    }
    
  } catch (error) {
    console.error('SMTP email creation failed:', error)
    return {
      code: SMTP_CODES.TRANSACTION_FAILED,
      message: 'Transaction failed'
    }
  }
}

// Handle QUIT command
export const handleQUIT = (session: SMTPSession): SMTPResponse => {
  deleteSMTPSession(session.id)
  
  return {
    code: SMTP_CODES.SERVICE_READY, // 221 is the correct code for QUIT
    message: 'Service closing transmission channel'
  }
}

// Parse email data (headers and body)
const parseEmailData = (data: string): { headers: Record<string, string>, body: string } => {
  const lines = data.split('\r\n')
  const headers: Record<string, string> = {}
  let bodyStartIndex = 0
  
  // Parse headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line === '') {
      bodyStartIndex = i + 1
      break
    }
    
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const headerName = line.substring(0, colonIndex).toLowerCase()
      const headerValue = line.substring(colonIndex + 1).trim()
      headers[headerName] = headerValue
    }
  }
  
  // Extract body
  const body = lines.slice(bodyStartIndex).join('\r\n')
  
  return { headers, body }
}

// Check if email is internal
const isInternalEmail = (email: string): boolean => {
  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'institute.edu'
  return email.endsWith(`@${domain}`)
}

// Authenticate SMTP session
export const authenticateSMTPSession = async (
  sessionId: string, 
  username: string, 
  password: string
): Promise<SMTPResponse> => {
  const session = getSMTPSession(sessionId)
  if (!session) {
    return {
      code: SMTP_CODES.TRANSACTION_FAILED,
      message: 'Session not found'
    }
  }
  
  try {
    // Verify credentials against email account
    const account = await prisma.emailAccount.findUnique({
      where: { 
        email: username,
        isActive: true
      }
    })
    
    if (!account) {
      return {
        code: SMTP_CODES.MAILBOX_UNAVAILABLE,
        message: 'Authentication failed'
      }
    }
    
    // TODO: Verify password (implement password hashing/verification)
    // For now, we'll assume authentication is successful for valid accounts
    
    updateSMTPSession(sessionId, {
      authenticated: true,
      accountEmail: username
    })
    
    return {
      code: SMTP_CODES.OK,
      message: 'Authentication successful'
    }
    
  } catch (error) {
    console.error('SMTP authentication error:', error)
    return {
      code: SMTP_CODES.LOCAL_ERROR,
      message: 'Authentication failed'
    }
  }
}
