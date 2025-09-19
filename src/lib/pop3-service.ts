import { prisma } from './prisma'
import { generateMessageId } from './email-utils'

// POP3 Response Types (RFC 1939)
export const POP3_RESPONSES = {
  OK: '+OK',
  ERR: '-ERR'
} as const

// POP3 States
export type POP3State = 'AUTHORIZATION' | 'TRANSACTION' | 'UPDATE'

// POP3 Session
export interface POP3Session {
  id: string
  state: POP3State
  accountEmail?: string
  authenticated: boolean
  messages: POP3Message[]
  deletedMessages: Set<number>
  createdAt: Date
  lastActivity: Date
}

// POP3 Command
export interface POP3Command {
  command: string
  parameters: string[]
  raw: string
}

// POP3 Response
export interface POP3Response {
  status: '+OK' | '-ERR'
  message: string
  data?: string[]
}

// POP3 Message
export interface POP3Message {
  number: number
  uid: string
  size: number
  deleted: boolean
  subject: string
  from: string
  date: Date
  messageId: string
  content: string
}

// In-memory session storage (use Redis in production)
const sessions = new Map<string, POP3Session>()

// Create new POP3 session
export const createPOP3Session = (): POP3Session => {
  const sessionId = generateMessageId()
  const session: POP3Session = {
    id: sessionId,
    state: 'AUTHORIZATION',
    authenticated: false,
    messages: [],
    deletedMessages: new Set(),
    createdAt: new Date(),
    lastActivity: new Date()
  }
  
  sessions.set(sessionId, session)
  cleanupOldSessions()
  
  return session
}

// Get POP3 session
export const getPOP3Session = (sessionId: string): POP3Session | null => {
  const session = sessions.get(sessionId)
  if (session) {
    session.lastActivity = new Date()
  }
  return session || null
}

// Update POP3 session
export const updatePOP3Session = (sessionId: string, updates: Partial<POP3Session>): POP3Session | null => {
  const session = sessions.get(sessionId)
  if (!session) return null
  
  Object.assign(session, updates, { lastActivity: new Date() })
  sessions.set(sessionId, session)
  return session
}

// Delete POP3 session
export const deletePOP3Session = (sessionId: string): void => {
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

// Parse POP3 command
export const parsePOP3Command = (line: string): POP3Command => {
  const trimmed = line.trim()
  const parts = trimmed.split(' ')
  
  const command = parts[0].toUpperCase()
  const parameters = parts.slice(1)
  
  return {
    command,
    parameters,
    raw: trimmed
  }
}

// Handle USER command
export const handleUSER = (session: POP3Session, username: string): POP3Response => {
  if (session.state !== 'AUTHORIZATION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Command not valid in this state'
    }
  }
  
  if (!username) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Username required'
    }
  }
  
  // Store username for later authentication
  updatePOP3Session(session.id, { accountEmail: username })
  
  return {
    status: POP3_RESPONSES.OK,
    message: `User ${username} accepted`
  }
}

// Handle PASS command
export const handlePASS = async (session: POP3Session, password: string): Promise<POP3Response> => {
  if (session.state !== 'AUTHORIZATION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Command not valid in this state'
    }
  }
  
  if (!session.accountEmail) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'USER command must be given first'
    }
  }
  
  if (!password) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Password required'
    }
  }
  
  try {
    // Verify credentials
    const account = await prisma.emailAccount.findUnique({
      where: { 
        email: session.accountEmail,
        isActive: true
      }
    })
    
    if (!account) {
      return {
        status: POP3_RESPONSES.ERR,
        message: 'Authentication failed'
      }
    }
    
    // TODO: Verify password (implement password hashing/verification)
    
    // Load messages for the user
    const messages = await loadUserMessages(session.accountEmail)
    
    updatePOP3Session(session.id, {
      state: 'TRANSACTION',
      authenticated: true,
      messages
    })
    
    return {
      status: POP3_RESPONSES.OK,
      message: `${messages.length} messages ready`
    }
    
  } catch (error) {
    console.error('POP3 PASS error:', error)
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Authentication failed'
    }
  }
}

// Handle STAT command
export const handleSTAT = (session: POP3Session): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const activeMessages = session.messages.filter(m => !session.deletedMessages.has(m.number))
  const totalSize = activeMessages.reduce((sum, msg) => sum + msg.size, 0)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `${activeMessages.length} ${totalSize}`
  }
}

// Handle LIST command
export const handleLIST = (session: POP3Session, messageNumber?: string): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const activeMessages = session.messages.filter(m => !session.deletedMessages.has(m.number))
  
  if (messageNumber) {
    const msgNum = parseInt(messageNumber)
    const message = activeMessages.find(m => m.number === msgNum)
    
    if (!message) {
      return {
        status: POP3_RESPONSES.ERR,
        message: 'No such message'
      }
    }
    
    return {
      status: POP3_RESPONSES.OK,
      message: `${message.number} ${message.size}`
    }
  }
  
  // List all messages
  const data = activeMessages.map(msg => `${msg.number} ${msg.size}`)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `${activeMessages.length} messages`,
    data
  }
}

// Handle RETR command
export const handleRETR = (session: POP3Session, messageNumber: string): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const msgNum = parseInt(messageNumber)
  if (isNaN(msgNum)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Invalid message number'
    }
  }
  
  const message = session.messages.find(m => m.number === msgNum)
  
  if (!message || session.deletedMessages.has(msgNum)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'No such message'
    }
  }
  
  // Format message content
  const messageContent = formatPOP3Message(message)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `${message.size} octets`,
    data: messageContent
  }
}

// Handle DELE command
export const handleDELE = (session: POP3Session, messageNumber: string): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const msgNum = parseInt(messageNumber)
  if (isNaN(msgNum)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Invalid message number'
    }
  }
  
  const message = session.messages.find(m => m.number === msgNum)
  
  if (!message) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'No such message'
    }
  }
  
  if (session.deletedMessages.has(msgNum)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Message already deleted'
    }
  }
  
  // Mark message for deletion
  session.deletedMessages.add(msgNum)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `Message ${msgNum} deleted`
  }
}

// Handle NOOP command
export const handleNOOP = (session: POP3Session): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  return {
    status: POP3_RESPONSES.OK,
    message: 'No operation performed'
  }
}

// Handle RSET command
export const handleRSET = (session: POP3Session): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  // Unmark all deleted messages
  session.deletedMessages.clear()
  
  const activeMessages = session.messages.length
  const totalSize = session.messages.reduce((sum, msg) => sum + msg.size, 0)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `${activeMessages} messages (${totalSize} octets)`
  }
}

// Handle QUIT command
export const handleQUIT = async (session: POP3Session): Promise<POP3Response> => {
  if (session.state === 'TRANSACTION') {
    // Enter UPDATE state and commit deletions
    updatePOP3Session(session.id, { state: 'UPDATE' })
    
    try {
      // Actually delete marked messages from database
      await commitDeletions(session)
      
      const deletedCount = session.deletedMessages.size
      deletePOP3Session(session.id)
      
      return {
        status: POP3_RESPONSES.OK,
        message: `POP3 server signing off (${deletedCount} messages deleted)`
      }
      
    } catch (error) {
      console.error('POP3 QUIT error:', error)
      deletePOP3Session(session.id)
      
      return {
        status: POP3_RESPONSES.OK,
        message: 'POP3 server signing off (deletion failed)'
      }
    }
  }
  
  deletePOP3Session(session.id)
  
  return {
    status: POP3_RESPONSES.OK,
    message: 'POP3 server signing off'
  }
}

// Handle UIDL command (optional)
export const handleUIDL = (session: POP3Session, messageNumber?: string): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const activeMessages = session.messages.filter(m => !session.deletedMessages.has(m.number))
  
  if (messageNumber) {
    const msgNum = parseInt(messageNumber)
    const message = activeMessages.find(m => m.number === msgNum)
    
    if (!message) {
      return {
        status: POP3_RESPONSES.ERR,
        message: 'No such message'
      }
    }
    
    return {
      status: POP3_RESPONSES.OK,
      message: `${message.number} ${message.uid}`
    }
  }
  
  // List all message UIDs
  const data = activeMessages.map(msg => `${msg.number} ${msg.uid}`)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `${activeMessages.length} messages`,
    data
  }
}

// Handle TOP command (optional)
export const handleTOP = (session: POP3Session, messageNumber: string, lines: string): POP3Response => {
  if (session.state !== 'TRANSACTION') {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Not authenticated'
    }
  }
  
  const msgNum = parseInt(messageNumber)
  const lineCount = parseInt(lines)
  
  if (isNaN(msgNum) || isNaN(lineCount)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'Invalid parameters'
    }
  }
  
  const message = session.messages.find(m => m.number === msgNum)
  
  if (!message || session.deletedMessages.has(msgNum)) {
    return {
      status: POP3_RESPONSES.ERR,
      message: 'No such message'
    }
  }
  
  // Format message headers and limited body
  const messageContent = formatPOP3MessageTop(message, lineCount)
  
  return {
    status: POP3_RESPONSES.OK,
    message: `Top of message ${msgNum}`,
    data: messageContent
  }
}

// Helper functions
const loadUserMessages = async (accountEmail: string): Promise<POP3Message[]> => {
  try {
    // Get emails for the user (only INBOX for POP3)
    const emails = await prisma.email.findMany({
      where: {
        recipients: {
          some: {
            email: accountEmail,
            type: 'TO'
          }
        },
        isDeleted: false
      },
      include: {
        recipients: true,
        attachments: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const pop3Messages: POP3Message[] = []

    emails.forEach((email, index) => {
      const messageNumber = index + 1
      const messageSize = calculateEmailSize(email)

      pop3Messages.push({
        number: messageNumber,
        uid: email.messageId,
        size: messageSize,
        deleted: false,
        subject: email.subject,
        from: email.fromName ? `${email.fromName} <${email.fromEmail}>` : email.fromEmail,
        date: email.createdAt,
        messageId: email.messageId,
        content: formatEmailContent(email)
      })
    })

    return pop3Messages

  } catch (error) {
    console.error('Error loading user messages:', error)
    return []
  }
}

const commitDeletions = async (session: POP3Session): Promise<void> => {
  if (session.deletedMessages.size === 0) {
    return
  }

  try {
    // Get the actual email IDs for deleted message numbers
    const messagesToDelete = session.messages
      .filter(msg => session.deletedMessages.has(msg.number))
      .map(msg => msg.uid)

    // Mark emails as deleted in database
    await prisma.email.updateMany({
      where: {
        messageId: { in: messagesToDelete },
        recipients: {
          some: {
            email: session.accountEmail
          }
        }
      },
      data: {
        isDeleted: true
      }
    })

  } catch (error) {
    console.error('Error committing deletions:', error)
    throw error
  }
}

const formatPOP3Message = (message: POP3Message): string[] => {
  const lines: string[] = []

  // Add headers
  lines.push(`Message-ID: ${message.messageId}`)
  lines.push(`Date: ${message.date.toUTCString()}`)
  lines.push(`From: ${message.from}`)
  lines.push(`Subject: ${message.subject}`)
  lines.push(`Content-Type: text/plain; charset=UTF-8`)
  lines.push(`Content-Transfer-Encoding: 7bit`)
  lines.push('')

  // Add body
  const bodyLines = message.content.split('\n')
  lines.push(...bodyLines)

  // Add termination
  lines.push('.')

  return lines
}

const formatPOP3MessageTop = (message: POP3Message, lineCount: number): string[] => {
  const lines: string[] = []

  // Add headers (always included)
  lines.push(`Message-ID: ${message.messageId}`)
  lines.push(`Date: ${message.date.toUTCString()}`)
  lines.push(`From: ${message.from}`)
  lines.push(`Subject: ${message.subject}`)
  lines.push(`Content-Type: text/plain; charset=UTF-8`)
  lines.push(`Content-Transfer-Encoding: 7bit`)
  lines.push('')

  // Add limited body lines
  const bodyLines = message.content.split('\n')
  const limitedBodyLines = bodyLines.slice(0, lineCount)
  lines.push(...limitedBodyLines)

  // Add termination
  lines.push('.')

  return lines
}

const calculateEmailSize = (email: any): number => {
  let size = 0

  // Calculate text size
  size += Buffer.byteLength(email.subject || '', 'utf8')
  size += Buffer.byteLength(email.body || '', 'utf8')
  size += Buffer.byteLength(email.fromEmail || '', 'utf8')

  // Add recipient sizes
  if (email.recipients) {
    email.recipients.forEach((recipient: any) => {
      size += Buffer.byteLength(recipient.email || '', 'utf8')
      size += Buffer.byteLength(recipient.name || '', 'utf8')
    })
  }

  // Add attachment sizes
  if (email.attachments) {
    size += email.attachments.reduce((sum: number, att: any) => sum + (att.size || 0), 0)
  }

  // Add headers overhead (approximate)
  size += 512

  return size
}

const formatEmailContent = (email: any): string => {
  // Convert HTML to plain text if needed
  let content = email.bodyText || email.body || ''

  // Remove HTML tags if present
  content = content.replace(/<[^>]*>/g, '')

  // Normalize line endings
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  return content
}
