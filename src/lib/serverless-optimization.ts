/**
 * Serverless Optimization Utilities for Vercel Deployment
 * Provides utilities for optimizing API routes and pages for serverless environments
 */

import { NextRequest, NextResponse } from 'next/server'

// Serverless function timeout configuration
export const SERVERLESS_TIMEOUT = 30000 // 30 seconds max for Vercel

// Cache headers for different content types
export const CACHE_HEADERS = {
  // Static content - cache for 1 hour
  STATIC: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'CDN-Cache-Control': 'public, max-age=3600',
  },
  // Dynamic content - cache for 5 minutes with revalidation
  DYNAMIC: {
    'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
    'CDN-Cache-Control': 'public, max-age=300',
  },
  // No cache for sensitive data
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  // API responses - short cache with revalidation
  API: {
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
  },
}

// Response compression for large payloads
export function compressResponse(data: any): string {
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, process.env.NODE_ENV === 'development' ? 2 : 0)
}

// Timeout wrapper for long-running operations
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = SERVERLESS_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Optimized API response wrapper
export function createOptimizedResponse(
  data: any,
  options: {
    status?: number
    cacheType?: keyof typeof CACHE_HEADERS
    compress?: boolean
    headers?: Record<string, string>
  } = {}
): NextResponse {
  const {
    status = 200,
    cacheType = 'API',
    compress = true,
    headers = {}
  } = options

  const responseData = compress ? compressResponse(data) : data
  const cacheHeaders = CACHE_HEADERS[cacheType]

  return new NextResponse(
    typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...cacheHeaders,
        ...headers,
      },
    }
  )
}

// Database operation wrapper with timeout and error handling
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  fallback?: T,
  timeoutMs: number = 20000
): Promise<T> {
  try {
    return await withTimeout(operation(), timeoutMs)
  } catch (error) {
    console.error('Database operation failed:', error)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    throw error
  }
}

// Memory usage monitoring for serverless functions
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    const used = usage.heapUsed
    const total = usage.heapTotal
    
    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100)
    }
  }
  
  return { used: 0, total: 0, percentage: 0 }
}

// Request size validation for serverless limits
export async function validateRequestSize(
  request: NextRequest,
  maxSizeMB: number = 6 // Vercel limit is 6MB
): Promise<void> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const sizeMB = parseInt(contentLength) / 1024 / 1024
    if (sizeMB > maxSizeMB) {
      throw new Error(`Request size ${sizeMB.toFixed(2)}MB exceeds limit of ${maxSizeMB}MB`)
    }
  }
}

// Batch processing utility for large datasets
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchPromises = batch.map(processor)
    
    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    } catch (error) {
      console.error(`Batch processing failed for items ${i}-${i + batchSize}:`, error)
      throw error
    }
    
    // Add delay between batches to prevent overwhelming the system
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return results
}

// Edge-compatible JSON parsing with error handling
export async function parseRequestBody<T = any>(request: NextRequest): Promise<T> {
  try {
    const text = await request.text()
    if (!text.trim()) {
      throw new Error('Request body is empty')
    }
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error.message}`)
  }
}

// Serverless-optimized error response
export function createServerlessError(
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && details && { details })
  }

  return createOptimizedResponse(errorResponse, {
    status,
    cacheType: 'NO_CACHE'
  })
}

// Health check utility for monitoring
export function createHealthCheck(checks: Record<string, () => Promise<boolean>>) {
  return async (): Promise<NextResponse> => {
    const results: Record<string, boolean> = {}
    const startTime = Date.now()
    
    try {
      await Promise.all(
        Object.entries(checks).map(async ([name, check]) => {
          try {
            results[name] = await withTimeout(check(), 5000)
          } catch (error) {
            console.error(`Health check failed for ${name}:`, error)
            results[name] = false
          }
        })
      )
      
      const allHealthy = Object.values(results).every(Boolean)
      const responseTime = Date.now() - startTime
      
      return createOptimizedResponse({
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks: results,
        responseTime,
        timestamp: new Date().toISOString(),
        memory: getMemoryUsage()
      }, {
        status: allHealthy ? 200 : 503,
        cacheType: 'NO_CACHE'
      })
      
    } catch (error) {
      return createServerlessError('Health check failed', 503, error)
    }
  }
}
