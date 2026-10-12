import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export interface DeviceMetadata {
  deviceId?: string | null
  deviceName?: string | null
  platform?: string | null
  language?: string | null
  timezone?: string | null
  userAgent?: string | null
  ipAddress?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
}

function firstForwardedValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null
}

function numberHeader(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function getDeviceMetadata(request: NextRequest, overrides: DeviceMetadata = {}): DeviceMetadata {
  const header = (name: string) => request.headers.get(name)
  return {
    deviceId: overrides.deviceId || header('x-admin-device-id'),
    deviceName: overrides.deviceName || header('x-admin-device-name'),
    platform: overrides.platform || header('x-admin-platform'),
    language: overrides.language || header('accept-language'),
    timezone: overrides.timezone || header('x-admin-timezone'),
    userAgent: overrides.userAgent || header('user-agent'),
    ipAddress: overrides.ipAddress || firstForwardedValue(header('x-forwarded-for')) || header('x-real-ip'),
    country: overrides.country || header('x-vercel-ip-country') || header('cf-ipcountry'),
    region: overrides.region || header('x-vercel-ip-country-region'),
    city: overrides.city || header('x-vercel-ip-city'),
    latitude: overrides.latitude ?? numberHeader(header('x-vercel-ip-latitude')),
    longitude: overrides.longitude ?? numberHeader(header('x-vercel-ip-longitude')),
  }
}

function auditData(metadata: DeviceMetadata) {
  return {
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
    deviceId: metadata.deviceId || null,
    deviceName: metadata.deviceName || null,
    platform: metadata.platform || null,
    language: metadata.language || null,
    timezone: metadata.timezone || null,
    country: metadata.country || null,
    region: metadata.region || null,
    city: metadata.city || null,
    latitude: metadata.latitude ?? null,
    longitude: metadata.longitude ?? null,
  }
}

export interface AuditEventInput extends DeviceMetadata {
  userId?: string | null
  userEmail?: string | null
  sessionId?: string | null
  action: string
  method?: string | null
  resource: string
  resourceId?: string | null
  details?: unknown
  success?: boolean
  errorMessage?: string | null
}

export async function recordAdminAudit(event: AuditEventInput): Promise<void> {
  try {
    const userEmail = event.userEmail || (event.userId
      ? (await prisma.user.findUnique({ where: { id: event.userId }, select: { email: true } }))?.email || null
      : null)
    await prisma.adminAuditLog.create({
      data: {
        id: randomUUID(),
        userId: event.userId || null,
        userEmail,
        sessionId: event.sessionId || null,
        action: event.action,
        method: event.method || null,
        resource: event.resource,
        resourceId: event.resourceId || null,
        details: (event.details ?? {}) as object,
        ...auditData(event),
        success: event.success ?? true,
        errorMessage: event.errorMessage || null,
      },
    })
  } catch (error) {
    // Auditing must never take down a valid admin mutation, but failures are visible in server logs.
    console.error('Failed to persist admin audit event:', error)
  }
}

export async function recordSessionAudit(
  request: NextRequest,
  session: any,
  action: string,
  resource: string,
  details: unknown,
  success = true,
): Promise<void> {
  await recordAdminAudit({
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    sessionId: session?.user?.sessionId,
    action,
    method: request.method,
    resource,
    details,
    success,
    ...getDeviceMetadata(request),
  })
}

export async function createAdminSession(userId: string, metadata: DeviceMetadata): Promise<string> {
  const sessionId = randomUUID()
  const now = new Date()
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true, activeSessionId: true } })
    if (user?.activeSessionId) {
      await tx.adminSession.updateMany({
        where: { id: user.activeSessionId, revokedAt: null },
        data: { revokedAt: now, endedAt: now, revokeReason: 'replaced_by_new_login' },
      })
      await tx.adminAuditLog.create({
        data: {
          id: randomUUID(),
          userId,
          userEmail: user?.email,
          sessionId: user.activeSessionId,
          action: 'SESSION_REVOKED',
          method: 'LOGIN',
          resource: 'authentication',
          details: { reason: 'replaced_by_new_login' },
          ...auditData(metadata),
          success: true,
        },
      })
    }
    await tx.adminSession.create({
      data: {
        id: sessionId,
        userId,
        deviceId: metadata.deviceId || 'unknown-device',
        deviceName: metadata.deviceName || null,
        platform: metadata.platform || null,
        language: metadata.language || null,
        timezone: metadata.timezone || null,
        userAgent: metadata.userAgent || null,
        ipAddress: metadata.ipAddress || null,
        country: metadata.country || null,
        region: metadata.region || null,
        city: metadata.city || null,
        latitude: metadata.latitude ?? null,
        longitude: metadata.longitude ?? null,
        startedAt: now,
        lastSeenAt: now,
      },
    })
    await tx.user.update({
      where: { id: userId },
      data: {
        activeSessionId: sessionId,
        lastLoginAt: now,
        lastLoginIp: metadata.ipAddress || null,
        lastLoginUserAgent: metadata.userAgent || null,
      },
    })
    await tx.adminAuditLog.create({
      data: {
        id: randomUUID(),
        userId,
        userEmail: user?.email,
        sessionId,
        action: 'LOGIN',
        method: 'POST',
        resource: 'authentication',
        details: { replacedPreviousSession: Boolean(user?.activeSessionId) },
        ...auditData(metadata),
        success: true,
      },
    })
  })
  return sessionId
}

export async function isAdminSessionActive(userId: string, sessionId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { activeSessionId: true } })
  if (!user || user.activeSessionId !== sessionId) return false
  await prisma.adminSession.updateMany({
    where: { id: sessionId, userId, revokedAt: null, endedAt: null },
    data: { lastSeenAt: new Date() },
  })
  return true
}

export async function endAdminSession(sessionId: string, metadata: DeviceMetadata, reason = 'logout'): Promise<void> {
  const now = new Date()
  const session = await prisma.adminSession.findUnique({ where: { id: sessionId }, select: { userId: true, user: { select: { email: true } } } })
  if (!session) return
  await prisma.$transaction([
    prisma.adminSession.updateMany({
      where: { id: sessionId, endedAt: null },
      data: { endedAt: now, revokeReason: reason },
    }),
    prisma.user.updateMany({
      where: { id: session.userId, activeSessionId: sessionId },
      data: { activeSessionId: null },
    }),
    prisma.adminAuditLog.create({
      data: {
        id: randomUUID(),
        userId: session.userId,
        userEmail: session.user.email,
        sessionId,
        action: reason === 'logout' ? 'LOGOUT' : 'SESSION_REVOKED',
        method: 'POST',
        resource: 'authentication',
        details: { reason },
        ...auditData(metadata),
        success: true,
      },
    }),
  ])
}
