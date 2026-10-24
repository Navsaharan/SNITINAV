import { createClient } from '@supabase/supabase-js'

const ALLOWED_BUCKETS = new Set(['faculty-photos', 'Pics'])

function getStorageAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Converts the internal storage:// reference used for private media into a
 * short-lived URL when rendered on the server. Existing public URLs are
 * returned unchanged so old rows remain compatible.
 */
export async function resolveMediaUrl(value: string | null | undefined): Promise<string> {
  if (!value || !value.startsWith('storage://')) return value || ''

  const reference = value.slice('storage://'.length)
  const separator = reference.indexOf('/')
  if (separator <= 0) return ''

  const bucket = reference.slice(0, separator)
  const filePath = reference.slice(separator + 1)
  if (!ALLOWED_BUCKETS.has(bucket) || !filePath || filePath.includes('..') || filePath.startsWith('/')) return ''

  const storageAdmin = getStorageAdmin()
  if (!storageAdmin) return ''

  const { data, error } = await storageAdmin.storage.from(bucket).createSignedUrl(filePath, 3600)
  return error || !data?.signedUrl ? '' : data.signedUrl
}

export function isAllowedStorageBucket(bucket: string): boolean {
  return ALLOWED_BUCKETS.has(bucket)
}
