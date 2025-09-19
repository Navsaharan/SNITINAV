import { csrfHandler } from '@/lib/secure-api'

// GET /api/csrf - Get CSRF token for authenticated users
export const GET = csrfHandler
