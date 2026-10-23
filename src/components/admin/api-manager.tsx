'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, CheckCircle2, CircleHelp, ExternalLink, RefreshCw, Search, Shield, XCircle } from 'lucide-react'

type ApiAuth = 'public' | 'session' | 'admin'
type ApiRoute = { path: string; methods: string[]; auth: ApiAuth; area: string; description: string; dynamic?: boolean; probePath?: string; probeExpectedStatuses?: number[] }
type ProbeResult = { status: 'pass' | 'fail' | 'skipped'; code?: number; duration?: number; message?: string }

type ApiResponse = { routes: ApiRoute[]; summary: { total: number; methods: string[]; probeable: number; dynamic: number }; generatedAt: string }

const authLabels: Record<ApiAuth, string> = { public: 'Public', session: 'Signed-in', admin: 'Admin only' }

export default function ApiManager() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [probes, setProbes] = useState<Record<string, ProbeResult>>({})
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('All')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/admin/api-manager', { cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || `Unable to load API inventory (${response.status})`)
      setData(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load API inventory')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const areas = useMemo(() => ['All', ...new Set(data?.routes.map(route => route.area) || [])], [data])
  const routes = useMemo(() => (data?.routes || []).filter(route => {
    const text = `${route.path} ${route.description} ${route.area}`.toLowerCase()
    return (area === 'All' || route.area === area) && text.includes(query.toLowerCase())
  }), [area, data, query])

  const probe = async (route: ApiRoute) => {
    if (!route.probePath) return
    const started = performance.now()
    try {
      const response = await fetch(route.probePath, { cache: 'no-store' })
      const expected = route.probeExpectedStatuses || [200]
      setProbes(previous => ({ ...previous, [route.path]: { status: expected.includes(response.status) ? 'pass' : 'fail', code: response.status, duration: Math.round(performance.now() - started), message: expected.includes(response.status) ? 'Responded as expected' : 'Unexpected HTTP status' } }))
    } catch (reason) {
      setProbes(previous => ({ ...previous, [route.path]: { status: 'fail', duration: Math.round(performance.now() - started), message: reason instanceof Error ? reason.message : 'Request failed' } }))
    }
  }

  const runChecks = async () => {
    if (!data) return
    setChecking(true)
    await Promise.all(data.routes.filter(route => route.probePath).map(probe))
    setChecking(false)
  }

  const passed = Object.values(probes).filter(result => result.status === 'pass').length
  const failed = Object.values(probes).filter(result => result.status === 'fail').length

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><h1 className="text-2xl font-bold text-gray-900">API Manager</h1><p className="mt-1 text-sm text-gray-600">Review the shipped API surface, access rules, and live GET diagnostics.</p></div>
      <div className="flex gap-2">
        <button type="button" onClick={() => void load()} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RefreshCw className="mr-2 h-4 w-4" />Refresh inventory</button>
        <button type="button" onClick={() => void runChecks()} disabled={checking || !data} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Activity className="mr-2 h-4 w-4" />{checking ? 'Checking…' : 'Run live checks'}</button>
      </div>
    </div>

    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className="rounded-lg bg-white p-10 text-center text-sm text-gray-500 shadow">Loading API inventory…</div> : data && <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[['Routes', data.summary.total], ['Probeable', data.summary.probeable], ['Dynamic', data.summary.dynamic], ['Passed', passed], ['Failed', failed]].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p><p className={`mt-2 text-2xl font-bold ${label === 'Failed' && Number(value) ? 'text-red-600' : 'text-gray-900'}`}>{value}</p></div>)}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
        <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search routes or descriptions" className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm" /></label>
        <select value={area} onChange={event => setArea(event.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="All">All areas</option>{areas.slice(1).map(item => <option key={item}>{item}</option>)}</select>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(220px,1.4fr)_110px_105px_minmax(220px,1fr)_160px] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid"><span>Endpoint</span><span>Methods</span><span>Access</span><span>Description</span><span>Diagnostic</span></div>
        {routes.map(route => { const result = probes[route.path]; return <div key={route.path} className="grid gap-3 border-b border-gray-100 px-5 py-4 last:border-0 md:grid-cols-[minmax(220px,1.4fr)_110px_105px_minmax(220px,1fr)_160px] md:items-center md:gap-4">
          <div><code className="break-all text-sm font-medium text-gray-900">{route.path}</code><p className="mt-1 text-xs text-gray-500">{route.area}</p></div>
          <div className="flex flex-wrap gap-1">{route.methods.map(method => <span key={method} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-700">{method}</span>)}</div>
          <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-medium ${route.auth === 'public' ? 'bg-green-50 text-green-700' : route.auth === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}><Shield className="mr-1 h-3 w-3" />{authLabels[route.auth]}</span>
          <p className="text-sm text-gray-600">{route.description}{route.dynamic && <span className="mt-1 block text-xs text-gray-400">Dynamic route — provide an ID to test.</span>}</p>
          <div className="flex items-center gap-2 text-xs">
            {route.probePath ? <><button type="button" onClick={() => void probe(route)} className="rounded border border-gray-300 px-2 py-1 font-medium text-gray-700 hover:bg-gray-50">Test GET</button>{result && <span title={result.message}>{result.status === 'pass' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}{result.code ? `${result.code} · ${result.duration}ms` : ''}</span>}</> : <span className="inline-flex items-center text-gray-400"><CircleHelp className="mr-1 h-4 w-4" />Manual test</span>}
          </div>
        </div>})}
        {!routes.length && <div className="p-10 text-center text-sm text-gray-500">No API routes match this filter.</div>}
      </div>
      <p className="text-xs text-gray-500">Inventory generated {new Date(data.generatedAt).toLocaleString()}. Live checks only issue safe GET requests; mutation and dynamic endpoints are intentionally not invoked.</p>
    </>}
  </div>
}
