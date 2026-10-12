import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { prisma } from './prisma'

function encryptionKey(): Buffer {
  const source = process.env.API_CREDENTIAL_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET
  if (!source) throw new Error('API_CREDENTIAL_ENCRYPTION_KEY or NEXTAUTH_SECRET is required')
  return createHash('sha256').update(source).digest()
}

export function encryptCredential(value: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptCredential(payload: string): string {
  const [iv, tag, encrypted] = payload.split('.')
  if (!iv || !tag || !encrypted) throw new Error('Invalid encrypted credential')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
}

export function maskCredential(value: string): string {
  if (!value) return ''
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}

export async function getCredential(key: string): Promise<string | null> {
  const item = await prisma.apiCredential.findUnique({ where: { key } })
  if (!item) return null
  await prisma.apiCredential.update({ where: { key }, data: { lastUsedAt: new Date() } })
  return decryptCredential(item.encryptedValue)
}

export async function listCredentialMetadata() {
  const items = await prisma.apiCredential.findMany({ orderBy: { key: 'asc' }, select: { key: true, provider: true, maskedValue: true, updatedAt: true, lastUsedAt: true } })
  return items.map((item: typeof items[number]) => ({ ...item, updatedAt: item.updatedAt.toISOString(), lastUsedAt: item.lastUsedAt?.toISOString() || null }))
}
