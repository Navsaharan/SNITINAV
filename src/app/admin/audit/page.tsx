'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuditLog {
  id: string
  action: string
  method?: string | null
  resource: string
  userId?: string | null
  details: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
  deviceId?: string | null
  deviceName?: string | null
  platform?: string | null
  timezone?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  success: boolean
  errorMessage?: string | null
  createdAt: string
  user?: { id: string; name?: string | null; email: string } | null
}

interface AuditResponse {
  data: AuditLog[]
  pagination: { page: number; totalPages: number; total: number; hasNext: boolean; hasPrev: boolean }
}

export default function AdminAuditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login')
  }, [status, router])

  useEffect(() => {
    if (!session || (session.user as any)?.role !== 'ADMIN') return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const query = new URLSearchParams({ page: String(page), limit: '50' })
    if (action.trim()) query.set('action', action.trim())
    if (resource.trim()) query.set('resource', resource.trim())
    fetch(`/api/admin/audit?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load audit logs')
        return result as AuditResponse
      })
      .then((result) => {
        setLogs(result.data || [])
        setTotalPages(result.pagination?.totalPages || 1)
        setTotal(result.pagination?.total || 0)
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Could not load audit logs')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [session, page, action, resource])

  if (status === 'loading' || !session) return <div className="p-8 text-gray-600">Loading…</div>
  if ((session.user as any)?.role !== 'ADMIN') return <div className="rounded-lg bg-red-50 p-6 text-red-700">Administrator access is required to view audit logs.</div>

  return (
    <section aria-labelledby="audit-heading" className="space-y-6">
      <div>
        <h1 id="audit-heading" className="text-2xl font-bold text-gray-900">Admin audit logs</h1>
        <p className="mt-1 text-sm text-gray-600">Every recorded login, logout, session change, and protected admin-panel mutation.</p>
      </div>
      <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <input value={action} onChange={(event) => { setPage(1); setAction(event.target.value) }} placeholder="Filter action" className="rounded border border-gray-300 px-3 py-2 text-sm" />
        <input value={resource} onChange={(event) => { setPage(1); setResource(event.target.value) }} placeholder="Filter resource" className="rounded border border-gray-300 px-3 py-2 text-sm" />
        <span className="py-2 text-sm text-gray-500">{total} records</span>
      </div>
      {error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Device / location</th><th className="px-4 py-3">Details</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading audit logs…</td></tr> : logs.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No audit records found.</td></tr> : logs.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.action}</span><div className="mt-1 text-xs text-gray-500">{log.method || ''}</div></td>
                <td className="px-4 py-3 text-gray-700">{log.user?.name || log.user?.email || log.userId || 'Unknown'}</td>
                <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-700">{log.resource}</td>
                <td className="max-w-xs px-4 py-3 text-xs text-gray-600"><div>{log.ipAddress || 'IP unavailable'}</div><div>{[log.city, log.region, log.country].filter(Boolean).join(', ') || 'Location unavailable'}</div><div>{log.deviceName || log.platform || 'Device unavailable'}</div><div className="break-all">{log.deviceId || ''}</div></td>
                <td className="max-w-sm break-words px-4 py-3 text-xs text-gray-600"><pre className="whitespace-pre-wrap">{JSON.stringify(log.details || {}, null, 2)}</pre>{log.errorMessage && <div className="mt-1 text-red-600">{log.errorMessage}</div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-gray-300 px-3 py-2 disabled:opacity-40">Previous</button>
        <span className="text-gray-600">Page {page} of {totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded border border-gray-300 px-3 py-2 disabled:opacity-40">Next</button>
      </div>
    </section>
  )
}
