import { describe, expect, it, jest } from '@jest/globals'

const { Request: FetchRequest, Response: FetchResponse, Headers: FetchHeaders } = require('@supabase/node-fetch')
global.Request = FetchRequest
global.Response = FetchResponse
global.Headers = FetchHeaders

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init: { status: number }) => ({ body, status: init.status }),
  },
}))

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}))

const mockedGetToken = (jest.requireMock('next-auth/jwt') as { getToken: jest.Mock }).getToken
const { requireRole } = require('./security') as typeof import('./security')

async function statusFor(token: Record<string, unknown> | null, roles: string[]) {
  mockedGetToken.mockResolvedValue(token as never)
  const response = await requireRole({} as never, roles)
  return response?.status ?? 200
}

describe('requireRole', () => {
  it('returns 401 for anonymous requests', async () => {
    await expect(statusFor(null, ['ADMIN', 'EDITOR'])).resolves.toBe(401)
  })

  it('returns 403 for an authenticated viewer', async () => {
    await expect(statusFor({ role: 'VIEWER' }, ['ADMIN', 'EDITOR'])).resolves.toBe(403)
  })

  it('allows an editor for content-management roles', async () => {
    await expect(statusFor({ role: 'EDITOR' }, ['ADMIN', 'EDITOR'])).resolves.toBe(200)
  })
})
