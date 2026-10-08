import { prisma } from './prisma'

// Keep this legacy helper as a compatibility re-export; all application code
// should share the same Prisma client and Supabase connection configuration.
export { prisma }

// Utility functions for common queries with caching
const CACHE_TTL = 1000 * 60 * 5
const queryCache = new Map<string, { data: unknown; timestamp: number }>()

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < ttl) {
    return cached.data as T
  }

  const data = await queryFn()
  queryCache.set(key, { data, timestamp: now })

  // Clean up old entries to keep the per-process cache bounded.
  if (queryCache.size > 100) {
    for (const [cacheKey, value] of queryCache.entries()) {
      if (now - value.timestamp > ttl * 2) {
        queryCache.delete(cacheKey)
      }
    }
  }

  return data
}
