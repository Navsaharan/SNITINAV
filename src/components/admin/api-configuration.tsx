'use client'
import { useEffect, useState } from 'react'
const fields = [
  ['SANITY_PROJECT_ID', 'Sanity project ID'],
  ['SANITY_DATASET', 'Sanity dataset'],
  ['SANITY_API_TOKEN', 'Sanity API token'],
] as const
export default function ApiConfiguration() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<{ key: string; maskedValue: string }[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { fetch('/api/settings/api-credentials', { cache: 'no-store' }).then(r => r.json()).then(result => setSaved(result.credentials || [])).catch(() => setError('Could not load API configuration')) }, [])
  const save = async () => {
    const credentials = Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim()))
    if (!Object.keys(credentials).length) return setError('Enter at least one new value')
    setSaving(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/settings/api-credentials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'sanity', credentials }) })
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save')
      setSaved(result.credentials || []); setValues({}); setNotice('Saved securely. Values are encrypted at rest and will not be shown again.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save API configuration') } finally { setSaving(false) }
  }
  return <section className="mt-8 rounded-lg border border-amber-200 bg-white p-6 shadow"><h3 className="text-lg font-medium text-gray-900">Secure API configuration</h3><p className="mt-1 text-sm text-gray-600">Sanity credentials are encrypted on the server. They are never included in frontend bundles or API responses; after saving, only a masked fingerprint is shown.</p><div className="mt-5 grid gap-4 md:grid-cols-3">{fields.map(([key, label]) => <div key={key}><label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`api-${key}`}>{label}</label><input id={`api-${key}`} type={key.endsWith('TOKEN') ? 'password' : 'text'} value={values[key] || ''} onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))} placeholder={saved.find(item => item.key === `sanity.${key.toLowerCase()}`)?.maskedValue || 'Not configured'} autoComplete="new-password" className="w-full rounded border border-gray-300 px-3 py-2" /></div>)}</div><button type="button" onClick={() => void save()} disabled={saving} className="mt-5 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save API configuration'}</button>{notice && <p role="status" className="mt-3 text-sm text-green-700">{notice}</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 border-t pt-4"><p className="text-xs font-medium text-gray-700">Configured values</p>{saved.length ? <ul className="mt-2 space-y-1 text-xs text-gray-600">{saved.map(item => <li key={item.key}><code>{item.key}</code>: {item.maskedValue}</li>)}</ul> : <p className="mt-2 text-xs text-gray-500">No encrypted credentials stored yet.</p>}</div></section>
}
