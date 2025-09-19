import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use existing instance if available (hot reload)
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Enable connection pooling
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  // Log slow queries
  if (after - before > 1000) { // 1 second
    console.warn(`🚨 Slow query (${after - before}ms): ${params.model}.${params.action}`);
  }
  
  return result;
});

// Store in global for hot reloading in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };

// Utility functions for common queries with caching
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const queryCache = new Map();

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp < ttl)) {
    return cached.data;
  }
  
  const data = await queryFn();
  queryCache.set(key, { data, timestamp: now });
  
  // Clean up old cache entries
  if (queryCache.size > 100) {
    for (const [k, v] of queryCache.entries()) {
      if (now - v.timestamp > ttl * 2) {
        queryCache.delete(k);
      }
    }
  }
  
  return data;
}
