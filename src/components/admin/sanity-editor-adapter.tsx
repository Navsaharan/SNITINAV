'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, Cloud, Eye, FileText, Loader2, Save, Sparkles } from 'lucide-react'
import { parseSanityPageReference } from '@/lib/page-editor-content'
import CkEditorAdapter from './ckeditor-adapter'

interface Props {
  content: string
  title: string
  slug: string
  pageId?: string
  publish: boolean
  onChange: (value: string) => void
}

interface StatusResponse {
  status?: { available?: boolean }
  story?: { content?: string }
  error?: string
}

export default function SanityEditorAdapter({ content, title, slug, pageId, publish, onChange }: Props) {
  const [draft, setDraft] = useState(content)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingContent, setLoadingContent] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [editorKey, setEditorKey] = useState(0)

  useEffect(() => {
    let active = true
    const referenceSlug = parseSanityPageReference(content)
    setLoadingContent(Boolean(referenceSlug))
    setError('')
    fetch('/api/cms/sanity', { cache: 'no-store' })
      .then(async response => {
        const result = await response.json().catch(() => ({})) as StatusResponse
        if (!response.ok) throw new Error(result.error || 'Could not check Sanity connection')
        if (!active) return
        setAvailable(Boolean(result.status?.available))
        if (referenceSlug && result.status?.available) {
          const pageResponse = await fetch(`/api/cms/sanity?slug=${encodeURIComponent(referenceSlug)}`, { cache: 'no-store' })
          const page = await pageResponse.json().catch(() => ({})) as StatusResponse
          if (!pageResponse.ok) throw new Error(page.error || 'Could not load the Sanity document')
          if (active && typeof page.story?.content === 'string') {
            setDraft(page.story.content)
            setEditorKey(value => value + 1)
          }
        } else if (!referenceSlug && active) {
          setDraft(content)
        }
      })
      .catch(reason => {
        if (active) {
          setAvailable(false)
          setError(reason instanceof Error ? reason.message : 'Could not check Sanity connection')
        }
      })
      .finally(() => { if (active) setLoadingContent(false) })
    return () => { active = false }
  }, [content])

  const save = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/cms/sanity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: publish ? 'publish' : 'save', pageId, title, slug, content: draft }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || `Sanity save failed (${response.status})`)
      onChange(result.reference)
      setNotice(publish ? 'Published to Sanity successfully.' : 'Draft saved to Sanity successfully.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sanity save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-[#f7f7f7] shadow-sm" aria-label="Sanity Studio editor">
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#1f2023] px-5 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#f03e2f] font-black">S</div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold"><span>Sanity Studio</span><ChevronDown size={14} className="text-gray-400" /></div>
            <p className="text-[11px] text-gray-400">S.N. ITI · Content workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <span className="hidden items-center gap-1.5 sm:flex"><Cloud size={14} /> Server-side API</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-200'}`}>
            {available ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {available === null ? 'Checking' : available ? 'Connected' : 'Needs setup'}
          </span>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-2"><FileText size={14} className="text-[#f03e2f]" /><span>Content</span><span>/</span><span>snitinavPage</span><span>/</span><strong className="text-gray-800">{title || 'Untitled page'}</strong></div>
        <span className="hidden items-center gap-1.5 md:flex"><Sparkles size={13} className="text-[#f03e2f]" /> Rich text mode</span>
      </div>

      {!available ? (
        <div className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-semibold">Sanity is not connected</p>
          <p className="mt-1">Configure the project ID, dataset, and API token under <strong>Admin → Settings → API configuration</strong>, then reload this editor.</p>
          {error && <p className="mt-3 rounded bg-white/70 p-2 text-xs text-red-700">{error}</p>}
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 bg-white p-4 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Document</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-900">snitinavPage</p>
              <p className="mt-1 break-all text-[11px] text-gray-500">{slug || 'new-page'}</p>
            </div>
            <dl className="mt-5 space-y-3 text-xs">
              <div><dt className="text-gray-400">Title</dt><dd className="mt-0.5 truncate font-medium text-gray-800">{title || 'Untitled'}</dd></div>
              <div><dt className="text-gray-400">Dataset</dt><dd className="mt-0.5 font-medium text-gray-800">Configured securely</dd></div>
              <div><dt className="text-gray-400">Mode</dt><dd className="mt-0.5 font-medium text-gray-800">{publish ? 'Publish on save' : 'Draft'}</dd></div>
            </dl>
          </aside>

          <main className="min-w-0 bg-[#f7f7f7] p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="text-lg font-semibold text-gray-900">{title || 'Untitled page'}</h3><p className="mt-1 text-xs text-gray-500">Edit the page body with formatting preserved from the public page.</p></div>
              <div className="flex items-center gap-2"><button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700"><Eye size={14} /> Preview</button><button type="button" onClick={() => void save()} disabled={saving || loadingContent || !title || !slug} className="inline-flex items-center gap-1.5 rounded-md bg-[#f03e2f] px-3 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? 'Saving…' : publish ? 'Publish' : 'Save draft'}</button></div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              {loadingContent ? <div className="flex h-72 items-center justify-center text-sm text-gray-500"><Loader2 size={17} className="mr-2 animate-spin" />Loading document…</div> : <CkEditorAdapter key={editorKey} content={draft} onChange={setDraft} placeholder="Write your page content…" />}
            </div>
            {notice && <p role="status" className="mt-3 text-sm text-emerald-700">{notice}</p>}
            {error && <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <p className="mt-3 text-[11px] text-gray-500">Changes are saved through the authenticated Sanity API. Tokens stay on the server.</p>
          </main>
        </div>
      )}
    </section>
  )
}
