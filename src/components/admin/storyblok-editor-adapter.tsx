'use client'

import { useEffect, useState } from 'react'
import { parseStoryblokPageReference } from '@/lib/page-editor-content'

interface Props {
  content: string
  title: string
  slug: string
  pageId?: string
  publish: boolean
  onChange: (value: string) => void
}

interface Status {
  storyblok?: { available?: boolean; missing?: string[]; component?: string; htmlField?: string; region?: string }
}

export default function StoryblokEditorAdapter({ content, title, slug, pageId, publish, onChange }: Props) {
  const linkedSlug = parseStoryblokPageReference(content)
  const [status, setStatus] = useState<Status | null>(null)
  const [storyContent, setStoryContent] = useState(linkedSlug ? '' : content)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/cms/status').then(async (response) => {
      if (!response.ok) throw new Error('Could not check CMS configuration')
      const result = await response.json() as Status
      if (active) setStatus(result)
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not check Storyblok configuration') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!linkedSlug || !status?.storyblok?.available) return
    let active = true
    setLoading(true)
    fetch(`/api/cms/storyblok?slug=${encodeURIComponent(linkedSlug)}`).then(async (response) => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load Storyblok content')
      if (active && result.story) setStoryContent(result.story.content || '')
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load Storyblok content') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [linkedSlug, status?.storyblok?.available])

  const save = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/cms/storyblok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, title, slug, content: storyContent, publish }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Storyblok save failed')
      onChange(result.reference)
      setNotice(publish ? 'Published in Storyblok. The public site reads the published Storyblok version.' : 'Saved as a Storyblok draft. The current published version remains live.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Storyblok save failed')
    } finally {
      setSaving(false)
    }
  }

  const available = Boolean(status?.storyblok?.available)
  return (
    <section className="rounded-lg border border-sky-200 bg-white p-4" aria-label="Storyblok editor">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Storyblok content editor</h3>
          <p className="text-xs text-gray-600">Storyblok is authoritative for this page body; the database stores only a Storyblok story reference.</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
          {status ? available ? `Connected · ${status.storyblok?.region}` : 'Connection setup required' : 'Checking connection…'}
        </span>
      </div>
      {!available ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>Set these server-side deployment variables before using this editor: {(status?.storyblok?.missing || ['STORYBLOK_SPACE_ID', 'STORYBLOK_MANAGEMENT_TOKEN', 'STORYBLOK_PUBLIC_ACCESS_TOKEN']).join(', ')}.</p>
          <p className="mt-2">The Storyblok space also needs a <code>{status?.storyblok?.component || 'page'}</code> content type with a text field named <code>{status?.storyblok?.htmlField || 'html_content'}</code>. Tokens are never stored in the database or sent to the browser.</p>
        </div>
      ) : (
        <>
          {loading && <p className="mb-2 text-sm text-gray-600">Loading Storyblok draft…</p>}
          <label htmlFor="storyblok-page-content" className="mb-1 block text-sm font-medium text-gray-700">Story body (HTML)</label>
          <textarea id="storyblok-page-content" rows={18} value={storyContent} onChange={(event) => setStoryContent(event.target.value)} className="w-full rounded border border-gray-300 p-3 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void save()} disabled={saving || loading || !slug || !title} className="rounded bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? 'Saving…' : publish ? 'Save and publish via Storyblok' : 'Save Storyblok draft'}
            </button>
            <p className="text-xs text-gray-500">Slug: <code>{slug || 'set the page slug first'}</code></p>
          </div>
        </>
      )}
      {notice && <p role="status" className="mt-3 text-sm text-green-700">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  )
}
