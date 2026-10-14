'use client'

import { useEffect, useState } from 'react'

type Provider = 'sanity' | 'storyblok'
const fieldGroups: Array<{ provider: Provider; title: string; fields: readonly [string, string][] }> = [
  {
    provider: 'sanity',
    title: 'Sanity',
    fields: [
      ['SANITY_PROJECT_ID', 'Project ID'],
      ['SANITY_DATASET', 'Dataset'],
      ['SANITY_API_TOKEN', 'API token'],
    ],
  },
  {
    provider: 'storyblok',
    title: 'Storyblok',
    fields: [
      ['STORYBLOK_SPACE_ID', 'Space ID'],
      ['STORYBLOK_MANAGEMENT_TOKEN', 'Management token'],
      ['STORYBLOK_PUBLIC_ACCESS_TOKEN', 'Public access token'],
      ['STORYBLOK_REGION', 'Region (eu/us/ap/ca/cn)'],
      ['STORYBLOK_PAGE_COMPONENT', 'Page component (default: page)'],
      ['STORYBLOK_PAGE_HTML_FIELD', 'HTML field (default: html_content)'],
    ],
  },
]

export default function ApiConfiguration() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<{ key: string; maskedValue: string }[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const response = await fetch('/api/settings/api-credentials', { cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || `Could not load API configuration (${response.status})`)
      setSaved(result.credentials || [])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load API configuration')
    }
  }
  useEffect(() => { void load() }, [])

  const save = async (provider: Provider) => {
    const group = fieldGroups.find(item => item.provider === provider)!
    const credentials = Object.fromEntries(group.fields.map(([key]) => [key, values[key] || '']).filter(([, value]) => value.trim()))
    if (!Object.keys(credentials).length) {
      setError(`Enter at least one new ${group.title} value`)
      return
    }
    setSaving(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/settings/api-credentials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, credentials }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save')
      setSaved(result.credentials || []); setValues({}); setNotice(`${group.title} credentials saved securely. Values are encrypted at rest and are not shown again.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save API configuration')
    } finally { setSaving(false) }
  }

  return <section className="mt-8 rounded-lg border border-amber-200 bg-white p-6 shadow">
    <h3 className="text-lg font-medium text-gray-900">Secure CMS API configuration</h3>
    <p className="mt-1 text-sm text-gray-600">Credentials are encrypted on the server and never sent to the browser. Environment variables remain supported for deployments that already use them.</p>
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
      {fieldGroups.map(group => <div key={group.provider} className="rounded border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900">{group.title}</h4>
        <div className="mt-4 space-y-3">{group.fields.map(([key, label]) => <div key={key}>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`api-${key}`}>{label}</label>
          <input id={`api-${key}`} type={key.includes('TOKEN') ? 'password' : 'text'} value={values[key] || ''} onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))} placeholder={saved.find(item => item.key.toLowerCase() === `${group.provider}.${key.toLowerCase()}`)?.maskedValue || 'Not configured'} autoComplete="new-password" className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>)}</div>
        <button type="button" onClick={() => void save(group.provider)} disabled={saving} className="mt-4 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : `Save ${group.title} configuration`}</button>
      </div>)}
    </div>
    {notice && <p role="status" className="mt-3 text-sm text-green-700">{notice}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <div className="mt-5 border-t pt-4"><p className="text-xs font-medium text-gray-700">Configured values</p>{saved.length ? <ul className="mt-2 space-y-1 text-xs text-gray-600">{saved.map(item => <li key={item.key}><code>{item.key}</code>: {item.maskedValue}</li>)}</ul> : <p className="mt-2 text-xs text-gray-500">No encrypted credentials stored yet.</p>}</div>
  </section>
}
