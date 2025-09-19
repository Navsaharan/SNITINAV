import { prisma } from './prisma'
import { generateMessageId } from './email-utils'

// IMAP Response Types (RFC 3501)
export const IMAP_RESPONSES = {
  // Status responses
  OK: 'OK',
  NO: 'NO',
  BAD: 'BAD',
  PREAUTH: 'PREAUTH',
  BYE: 'BYE',
  
  // Server responses
  CAPABILITY: 'CAPABILITY',
  LIST: 'LIST',
  LSUB: 'LSUB',
  STATUS: 'STATUS',
  SEARCH: 'SEARCH',
  FLAGS: 'FLAGS',
  EXISTS: 'EXISTS',
  RECENT: 'RECENT',
  EXPUNGE: 'EXPUNGE',
  FETCH: 'FETCH'
} as const

// IMAP States
export type IMAPState = 'NOT_AUTHENTICATED' | 'AUTHENTICATED' | 'SELECTED' | 'LOGOUT'

// IMAP Session
export interface IMAPSession {
  id: string
  state: IMAPState
  accountEmail?: string
  selectedFolder?: string
  authenticated: boolean
  capabilities: string[]
  createdAt: Date
  lastActivity: Date
}

// IMAP Command
export interface IMAPCommand {
  tag: string
  command: string
  parameters: string[]
  raw: string
}

// IMAP Response
export interface IMAPResponse {
  tag?: string
  type: 'untagged' | 'tagged' | 'continuation'
  status?: string
  command?: string
  data?: string
  message?: string
}

// IMAP Folder
export interface IMAPFolder {
  name: string
  delimiter: string
  attributes: string[]
  exists: number
  recent: number
  unseen: number
  uidvalidity: number
  uidnext: number
  flags: string[]
}

// IMAP Message
export interface IMAPMessage {
  uid: number
  sequence: number
  flags: string[]
  internalDate: Date
  size: number
  envelope: {
    date: string
    subject: string
    from: Array<{ name?: string; email: string }>
    sender?: Array<{ name?: string; email: string }>
    replyTo?: Array<{ name?: string; email: string }>
    to: Array<{ name?: string; email: string }>
    cc?: Array<{ name?: string; email: string }>
    bcc?: Array<{ name?: string; email: string }>
    messageId: string
  }
  bodyStructure?: any
  body?: string
}

// In-memory session storage (use Redis in production)
const sessions = new Map<string, IMAPSession>()

// Create new IMAP session
export const createIMAPSession = (): IMAPSession => {
  const sessionId = generateMessageId()
  const session: IMAPSession = {
    id: sessionId,
    state: 'NOT_AUTHENTICATED',
    authenticated: false,
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
    createdAt: new Date(),
    lastActivity: new Date()
  }
  
  sessions.set(sessionId, session)
  cleanupOldSessions()
  
  return session
}

// Get IMAP session
export const getIMAPSession = (sessionId: string): IMAPSession | null => {
  const session = sessions.get(sessionId)
  if (session) {
    session.lastActivity = new Date()
  }
  return session || null
}

// Update IMAP session
export const updateIMAPSession = (sessionId: string, updates: Partial<IMAPSession>): IMAPSession | null => {
  const session = sessions.get(sessionId)
  if (!session) return null
  
  Object.assign(session, updates, { lastActivity: new Date() })
  sessions.set(sessionId, session)
  return session
}

// Delete IMAP session
export const deleteIMAPSession = (sessionId: string): void => {
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

// Parse IMAP command
export const parseIMAPCommand = (line: string): IMAPCommand => {
  const trimmed = line.trim()
  const parts = trimmed.split(' ')
  
  if (parts.length < 2) {
    throw new Error('Invalid IMAP command format')
  }
  
  const tag = parts[0]
  const command = parts[1].toUpperCase()
  const parameters = parts.slice(2)
  
  return {
    tag,
    command,
    parameters,
    raw: trimmed
  }
}

// Handle CAPABILITY command
export const handleCAPABILITY = (session: IMAPSession, tag: string): IMAPResponse[] => {
  return [
    {
      type: 'untagged',
      command: 'CAPABILITY',
      data: session.capabilities.join(' ')
    },
    {
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'CAPABILITY completed'
    }
  ]
}

// Handle LOGIN command
export const handleLOGIN = async (
  session: IMAPSession, 
  tag: string, 
  username: string, 
  password: string
): Promise<IMAPResponse[]> => {
  try {
    // Verify credentials
    const account = await prisma.emailAccount.findUnique({
      where: { 
        email: username,
        isActive: true
      }
    })
    
    if (!account) {
      return [{
        type: 'tagged',
        tag,
        status: IMAP_RESPONSES.NO,
        message: 'LOGIN failed'
      }]
    }
    
    // TODO: Verify password (implement password hashing/verification)
    
    updateIMAPSession(session.id, {
      state: 'AUTHENTICATED',
      authenticated: true,
      accountEmail: username
    })
    
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'LOGIN completed'
    }]
    
  } catch (error) {
    console.error('IMAP LOGIN error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'LOGIN failed'
    }]
  }
}

// Handle LIST command
export const handleLIST = async (
  session: IMAPSession, 
  tag: string, 
  reference: string = '', 
  mailbox: string = '*'
): Promise<IMAPResponse[]> => {
  if (session.state === 'NOT_AUTHENTICATED') {
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'Not authenticated'
    }]
  }
  
  try {
    const folders = await getMailboxList(session.accountEmail!, reference, mailbox)
    const responses: IMAPResponse[] = []
    
    // Add LIST responses for each folder
    folders.forEach(folder => {
      responses.push({
        type: 'untagged',
        command: 'LIST',
        data: `(${folder.attributes.join(' ')}) "${folder.delimiter}" "${folder.name}"`
      })
    })
    
    responses.push({
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'LIST completed'
    })
    
    return responses
    
  } catch (error) {
    console.error('IMAP LIST error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'LIST failed'
    }]
  }
}

// Handle SELECT command
export const handleSELECT = async (
  session: IMAPSession, 
  tag: string, 
  mailbox: string
): Promise<IMAPResponse[]> => {
  if (session.state === 'NOT_AUTHENTICATED') {
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'Not authenticated'
    }]
  }
  
  try {
    const folderInfo = await getMailboxInfo(session.accountEmail!, mailbox)
    
    if (!folderInfo) {
      return [{
        type: 'tagged',
        tag,
        status: IMAP_RESPONSES.NO,
        message: 'Mailbox does not exist'
      }]
    }
    
    updateIMAPSession(session.id, {
      state: 'SELECTED',
      selectedFolder: mailbox
    })
    
    return [
      {
        type: 'untagged',
        command: 'FLAGS',
        data: `(${folderInfo.flags.join(' ')})`
      },
      {
        type: 'untagged',
        command: 'OK',
        data: `[PERMANENTFLAGS (${folderInfo.flags.join(' ')} \\*)] Flags permitted`
      },
      {
        type: 'untagged',
        data: `${folderInfo.exists} EXISTS`
      },
      {
        type: 'untagged',
        data: `${folderInfo.recent} RECENT`
      },
      {
        type: 'untagged',
        command: 'OK',
        data: `[UNSEEN ${folderInfo.unseen}] First unseen`
      },
      {
        type: 'untagged',
        command: 'OK',
        data: `[UIDVALIDITY ${folderInfo.uidvalidity}] UIDs valid`
      },
      {
        type: 'untagged',
        command: 'OK',
        data: `[UIDNEXT ${folderInfo.uidnext}] Predicted next UID`
      },
      {
        type: 'tagged',
        tag,
        status: IMAP_RESPONSES.OK,
        message: `[READ-WRITE] SELECT completed`
      }
    ]
    
  } catch (error) {
    console.error('IMAP SELECT error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'SELECT failed'
    }]
  }
}

// Handle FETCH command
export const handleFETCH = async (
  session: IMAPSession, 
  tag: string, 
  sequence: string, 
  items: string
): Promise<IMAPResponse[]> => {
  if (session.state !== 'SELECTED') {
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'No mailbox selected'
    }]
  }
  
  try {
    const messages = await fetchMessages(session.accountEmail!, session.selectedFolder!, sequence, items)
    const responses: IMAPResponse[] = []
    
    messages.forEach(message => {
      responses.push({
        type: 'untagged',
        command: 'FETCH',
        data: formatFetchResponse(message, items)
      })
    })
    
    responses.push({
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'FETCH completed'
    })
    
    return responses
    
  } catch (error) {
    console.error('IMAP FETCH error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'FETCH failed'
    }]
  }
}

// Handle SEARCH command
export const handleSEARCH = async (
  session: IMAPSession, 
  tag: string, 
  criteria: string[]
): Promise<IMAPResponse[]> => {
  if (session.state !== 'SELECTED') {
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'No mailbox selected'
    }]
  }
  
  try {
    const messageNumbers = await searchMessages(session.accountEmail!, session.selectedFolder!, criteria)
    
    return [
      {
        type: 'untagged',
        command: 'SEARCH',
        data: messageNumbers.join(' ')
      },
      {
        type: 'tagged',
        tag,
        status: IMAP_RESPONSES.OK,
        message: 'SEARCH completed'
      }
    ]
    
  } catch (error) {
    console.error('IMAP SEARCH error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'SEARCH failed'
    }]
  }
}

// Handle STORE command
export const handleSTORE = async (
  session: IMAPSession, 
  tag: string, 
  sequence: string, 
  flags: string, 
  flagList: string[]
): Promise<IMAPResponse[]> => {
  if (session.state !== 'SELECTED') {
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'No mailbox selected'
    }]
  }
  
  try {
    const updatedMessages = await storeFlags(session.accountEmail!, session.selectedFolder!, sequence, flags, flagList)
    const responses: IMAPResponse[] = []
    
    updatedMessages.forEach(message => {
      responses.push({
        type: 'untagged',
        command: 'FETCH',
        data: `${message.sequence} (FLAGS (${message.flags.join(' ')}))`
      })
    })
    
    responses.push({
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'STORE completed'
    })
    
    return responses
    
  } catch (error) {
    console.error('IMAP STORE error:', error)
    return [{
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.NO,
      message: 'STORE failed'
    }]
  }
}

// Handle LOGOUT command
export const handleLOGOUT = (session: IMAPSession, tag: string): IMAPResponse[] => {
  deleteIMAPSession(session.id)
  
  return [
    {
      type: 'untagged',
      status: IMAP_RESPONSES.BYE,
      message: 'IMAP4rev1 Server logging out'
    },
    {
      type: 'tagged',
      tag,
      status: IMAP_RESPONSES.OK,
      message: 'LOGOUT completed'
    }
  ]
}

// Helper functions implementation
const getMailboxList = async (accountEmail: string, reference: string, mailbox: string): Promise<IMAPFolder[]> => {
  try {
    // Get folders for the account
    const folders = await prisma.emailFolder.findMany({
      where: {
        account: { email: accountEmail }
      },
      include: {
        _count: {
          select: {
            emails: {
              where: { isDeleted: false }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    const imapFolders: IMAPFolder[] = []

    // Add standard IMAP folders
    const standardFolders = [
      { name: 'INBOX', type: 'INBOX', attributes: ['\\HasNoChildren'] },
      { name: 'Sent', type: 'SENT', attributes: ['\\Sent', '\\HasNoChildren'] },
      { name: 'Drafts', type: 'DRAFTS', attributes: ['\\Drafts', '\\HasNoChildren'] },
      { name: 'Trash', type: 'TRASH', attributes: ['\\Trash', '\\HasNoChildren'] },
      { name: 'Spam', type: 'SPAM', attributes: ['\\Junk', '\\HasNoChildren'] }
    ]

    for (const stdFolder of standardFolders) {
      const dbFolder = folders.find(f => f.type === stdFolder.type)

      imapFolders.push({
        name: stdFolder.name,
        delimiter: '/',
        attributes: stdFolder.attributes,
        exists: dbFolder?._count.emails || 0,
        recent: 0, // TODO: Calculate recent messages
        unseen: 0, // TODO: Calculate unseen messages
        uidvalidity: Date.now(), // TODO: Use proper UID validity
        uidnext: (dbFolder?._count.emails || 0) + 1,
        flags: ['\\Seen', '\\Answered', '\\Flagged', '\\Deleted', '\\Draft']
      })
    }

    // Add custom folders
    folders.filter(f => f.type === 'CUSTOM').forEach(folder => {
      imapFolders.push({
        name: folder.name,
        delimiter: '/',
        attributes: ['\\HasNoChildren'],
        exists: folder._count.emails,
        recent: 0,
        unseen: 0,
        uidvalidity: Date.now(),
        uidnext: folder._count.emails + 1,
        flags: ['\\Seen', '\\Answered', '\\Flagged', '\\Deleted', '\\Draft']
      })
    })

    // Filter based on mailbox pattern
    if (mailbox !== '*') {
      const pattern = mailbox.replace(/\*/g, '.*').replace(/\%/g, '[^/]*')
      const regex = new RegExp(`^${pattern}$`, 'i')
      return imapFolders.filter(folder => regex.test(folder.name))
    }

    return imapFolders

  } catch (error) {
    console.error('Error getting mailbox list:', error)
    return []
  }
}

const getMailboxInfo = async (accountEmail: string, mailbox: string): Promise<IMAPFolder | null> => {
  try {
    // Map IMAP folder names to database folder types
    const folderTypeMap: Record<string, string> = {
      'INBOX': 'INBOX',
      'Sent': 'SENT',
      'Drafts': 'DRAFTS',
      'Trash': 'TRASH',
      'Spam': 'SPAM'
    }

    const folderType = folderTypeMap[mailbox] || 'CUSTOM'

    // Get folder from database
    const folder = await prisma.emailFolder.findFirst({
      where: {
        account: { email: accountEmail },
        OR: [
          { type: folderType },
          { name: mailbox, type: 'CUSTOM' }
        ]
      },
      include: {
        _count: {
          select: {
            emails: {
              where: { isDeleted: false }
            }
          }
        }
      }
    })

    if (!folder && folderType !== 'CUSTOM') {
      // Create standard folder if it doesn't exist
      const account = await prisma.emailAccount.findUnique({
        where: { email: accountEmail }
      })

      if (account) {
        await prisma.emailFolder.create({
          data: {
            name: mailbox,
            type: folderType as any,
            accountId: account.id,
            order: Object.keys(folderTypeMap).indexOf(mailbox)
          }
        })
      }
    }

    // Get message counts
    const emailCounts = await prisma.email.groupBy({
      by: ['isRead'],
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        isDeleted: false,
        // TODO: Filter by folder
      },
      _count: { id: true }
    })

    const totalEmails = emailCounts.reduce((sum, group) => sum + group._count.id, 0)
    const unreadEmails = emailCounts.find(group => !group.isRead)?._count.id || 0

    return {
      name: mailbox,
      delimiter: '/',
      attributes: ['\\HasNoChildren'],
      exists: totalEmails,
      recent: 0, // TODO: Calculate recent messages
      unseen: unreadEmails,
      uidvalidity: Date.now(), // TODO: Use proper UID validity
      uidnext: totalEmails + 1,
      flags: ['\\Seen', '\\Answered', '\\Flagged', '\\Deleted', '\\Draft']
    }

  } catch (error) {
    console.error('Error getting mailbox info:', error)
    return null
  }
}

const fetchMessages = async (accountEmail: string, folder: string, sequence: string, items: string): Promise<IMAPMessage[]> => {
  try {
    // Parse sequence set (e.g., "1:5", "1,3,5", "*")
    const messageNumbers = parseSequenceSet(sequence)

    // Get emails from database
    const emails = await prisma.email.findMany({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        isDeleted: false,
        // TODO: Filter by folder
      },
      include: {
        recipients: true,
        attachments: true
      },
      orderBy: { createdAt: 'asc' },
      take: messageNumbers.length > 0 ? undefined : 50 // Limit if no specific sequence
    })

    const imapMessages: IMAPMessage[] = []

    emails.forEach((email, index) => {
      const sequenceNumber = index + 1

      // Skip if not in requested sequence
      if (messageNumbers.length > 0 && !messageNumbers.includes(sequenceNumber)) {
        return
      }

      const toRecipients = email.recipients.filter(r => r.type === 'TO')
      const ccRecipients = email.recipients.filter(r => r.type === 'CC')
      const bccRecipients = email.recipients.filter(r => r.type === 'BCC')

      imapMessages.push({
        uid: parseInt(email.id.slice(-8), 16), // Use last 8 chars of ID as UID
        sequence: sequenceNumber,
        flags: getMessageFlags(email),
        internalDate: email.createdAt,
        size: calculateMessageSize(email),
        envelope: {
          date: email.createdAt.toISOString(),
          subject: email.subject,
          from: [{ name: email.fromName, email: email.fromEmail }],
          to: toRecipients.map(r => ({ name: r.name, email: r.email })),
          cc: ccRecipients.length > 0 ? ccRecipients.map(r => ({ name: r.name, email: r.email })) : undefined,
          bcc: bccRecipients.length > 0 ? bccRecipients.map(r => ({ name: r.name, email: r.email })) : undefined,
          messageId: email.messageId
        },
        body: email.body
      })
    })

    return imapMessages

  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

const searchMessages = async (accountEmail: string, folder: string, criteria: string[]): Promise<number[]> => {
  try {
    // Parse search criteria
    const searchQuery = parseSearchCriteria(criteria)

    // Build database query
    const where: any = {
      OR: [
        { fromEmail: accountEmail },
        { recipients: { some: { email: accountEmail } } }
      ],
      isDeleted: false,
      // TODO: Filter by folder
      ...searchQuery
    }

    const emails = await prisma.email.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true }
    })

    // Return sequence numbers (1-based)
    return emails.map((_, index) => index + 1)

  } catch (error) {
    console.error('Error searching messages:', error)
    return []
  }
}

const storeFlags = async (accountEmail: string, folder: string, sequence: string, flags: string, flagList: string[]): Promise<IMAPMessage[]> => {
  try {
    const messageNumbers = parseSequenceSet(sequence)

    // Get emails to update
    const emails = await prisma.email.findMany({
      where: {
        OR: [
          { fromEmail: accountEmail },
          { recipients: { some: { email: accountEmail } } }
        ],
        isDeleted: false,
        // TODO: Filter by folder and sequence
      },
      include: {
        recipients: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const updatedMessages: IMAPMessage[] = []

    for (let i = 0; i < emails.length; i++) {
      const sequenceNumber = i + 1

      if (messageNumbers.length === 0 || messageNumbers.includes(sequenceNumber)) {
        const email = emails[i]

        // Update flags based on operation
        const updates: any = {}

        if (flags.includes('+FLAGS')) {
          // Add flags
          if (flagList.includes('\\Seen')) updates.isRead = true
          if (flagList.includes('\\Flagged')) updates.isStarred = true
          if (flagList.includes('\\Deleted')) updates.isDeleted = true
        } else if (flags.includes('-FLAGS')) {
          // Remove flags
          if (flagList.includes('\\Seen')) updates.isRead = false
          if (flagList.includes('\\Flagged')) updates.isStarred = false
          if (flagList.includes('\\Deleted')) updates.isDeleted = false
        } else if (flags.includes('FLAGS')) {
          // Replace flags
          updates.isRead = flagList.includes('\\Seen')
          updates.isStarred = flagList.includes('\\Flagged')
          updates.isDeleted = flagList.includes('\\Deleted')
        }

        // Update in database
        if (Object.keys(updates).length > 0) {
          await prisma.email.update({
            where: { id: email.id },
            data: updates
          })
        }

        // Add to response
        updatedMessages.push({
          uid: parseInt(email.id.slice(-8), 16),
          sequence: sequenceNumber,
          flags: getMessageFlags({ ...email, ...updates }),
          internalDate: email.createdAt,
          size: calculateMessageSize(email),
          envelope: {
            date: email.createdAt.toISOString(),
            subject: email.subject,
            from: [{ name: email.fromName, email: email.fromEmail }],
            to: email.recipients.filter(r => r.type === 'TO').map(r => ({ name: r.name, email: r.email })),
            messageId: email.messageId
          }
        })
      }
    }

    return updatedMessages

  } catch (error) {
    console.error('Error storing flags:', error)
    return []
  }
}

const formatFetchResponse = (message: IMAPMessage, items: string): string => {
  const itemsUpper = items.toUpperCase()
  const parts: string[] = []

  if (itemsUpper.includes('UID')) {
    parts.push(`UID ${message.uid}`)
  }

  if (itemsUpper.includes('FLAGS')) {
    parts.push(`FLAGS (${message.flags.join(' ')})`)
  }

  if (itemsUpper.includes('INTERNALDATE')) {
    parts.push(`INTERNALDATE "${message.internalDate.toISOString()}"`)
  }

  if (itemsUpper.includes('RFC822.SIZE')) {
    parts.push(`RFC822.SIZE ${message.size}`)
  }

  if (itemsUpper.includes('ENVELOPE')) {
    parts.push(`ENVELOPE ${formatEnvelope(message.envelope)}`)
  }

  if (itemsUpper.includes('BODY') && !itemsUpper.includes('BODYSTRUCTURE')) {
    parts.push(`BODY "${message.body || ''}"`)
  }

  if (itemsUpper.includes('BODYSTRUCTURE')) {
    parts.push(`BODYSTRUCTURE ${formatBodyStructure(message)}`)
  }

  return `${message.sequence} (${parts.join(' ')})`
}

// Utility functions
const parseSequenceSet = (sequence: string): number[] => {
  if (sequence === '*') {
    return [] // Return empty to indicate all messages
  }

  const numbers: number[] = []
  const parts = sequence.split(',')

  for (const part of parts) {
    if (part.includes(':')) {
      const [start, end] = part.split(':').map(n => n === '*' ? Number.MAX_SAFE_INTEGER : parseInt(n))
      for (let i = start; i <= end; i++) {
        numbers.push(i)
      }
    } else {
      const num = part === '*' ? Number.MAX_SAFE_INTEGER : parseInt(part)
      numbers.push(num)
    }
  }

  return numbers.sort((a, b) => a - b)
}

const parseSearchCriteria = (criteria: string[]): any => {
  const query: any = {}

  for (let i = 0; i < criteria.length; i++) {
    const criterion = criteria[i].toUpperCase()

    switch (criterion) {
      case 'ALL':
        // No additional filter
        break

      case 'UNSEEN':
        query.isRead = false
        break

      case 'SEEN':
        query.isRead = true
        break

      case 'FLAGGED':
        query.isStarred = true
        break

      case 'UNFLAGGED':
        query.isStarred = false
        break

      case 'DELETED':
        query.isDeleted = true
        break

      case 'UNDELETED':
        query.isDeleted = false
        break

      case 'FROM':
        if (i + 1 < criteria.length) {
          query.fromEmail = { contains: criteria[++i], mode: 'insensitive' }
        }
        break

      case 'TO':
        if (i + 1 < criteria.length) {
          query.recipients = {
            some: {
              email: { contains: criteria[++i], mode: 'insensitive' },
              type: 'TO'
            }
          }
        }
        break

      case 'SUBJECT':
        if (i + 1 < criteria.length) {
          query.subject = { contains: criteria[++i], mode: 'insensitive' }
        }
        break

      case 'BODY':
        if (i + 1 < criteria.length) {
          query.body = { contains: criteria[++i], mode: 'insensitive' }
        }
        break

      case 'SINCE':
        if (i + 1 < criteria.length) {
          query.createdAt = { gte: new Date(criteria[++i]) }
        }
        break

      case 'BEFORE':
        if (i + 1 < criteria.length) {
          query.createdAt = { lt: new Date(criteria[++i]) }
        }
        break
    }
  }

  return query
}

const getMessageFlags = (email: any): string[] => {
  const flags: string[] = []

  if (email.isRead) flags.push('\\Seen')
  if (email.isStarred) flags.push('\\Flagged')
  if (email.isDeleted) flags.push('\\Deleted')
  if (email.status === 'DRAFT') flags.push('\\Draft')

  return flags
}

const calculateMessageSize = (email: any): number => {
  let size = 0

  // Calculate text size
  size += Buffer.byteLength(email.subject || '', 'utf8')
  size += Buffer.byteLength(email.body || '', 'utf8')
  size += Buffer.byteLength(email.fromEmail || '', 'utf8')

  // Add attachment sizes
  if (email.attachments) {
    size += email.attachments.reduce((sum: number, att: any) => sum + (att.size || 0), 0)
  }

  // Add headers overhead (approximate)
  size += 1024

  return size
}

const formatEnvelope = (envelope: any): string => {
  const formatAddressList = (addresses: any[]) => {
    if (!addresses || addresses.length === 0) return 'NIL'

    const formatted = addresses.map(addr =>
      `("${addr.name || 'NIL'}" NIL "${addr.email.split('@')[0]}" "${addr.email.split('@')[1]}")`
    ).join('')

    return `(${formatted})`
  }

  return `("${envelope.date}" "${envelope.subject}" ${formatAddressList(envelope.from)} ${formatAddressList(envelope.sender || envelope.from)} ${formatAddressList(envelope.replyTo || envelope.from)} ${formatAddressList(envelope.to)} ${formatAddressList(envelope.cc || [])} ${formatAddressList(envelope.bcc || [])} NIL "${envelope.messageId}")`
}

const formatBodyStructure = (message: IMAPMessage): string => {
  // Simplified body structure for text/plain messages
  return '("TEXT" "PLAIN" ("CHARSET" "UTF-8") NIL NIL "7BIT" ' + message.size + ' ' + (message.body?.split('\n').length || 0) + ')'
}
