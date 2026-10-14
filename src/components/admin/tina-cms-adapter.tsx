'use client'

import { useEffect, useMemo, useState } from 'react'
import { Form, TinaCMS, TinaProvider } from 'tinacms'

interface Props {
  content: string
  onChange: (value: string) => void
  onPersist?: (value: string) => Promise<void>
}

function TinaPageForm({ content, onChange, onPersist, cms }: Props & { cms: TinaCMS }) {
  const [notice, setNotice] = useState('')
  const [draft, setDraft] = useState(content)
  const form = useMemo(() => new Form<{ content: string }>({
    id: 'snitinav-page-content',
    label: 'Edit page content',
    fields: [{ name: 'content', label: 'Page HTML', component: 'textarea', description: 'Edit the page body. Existing HTML is preserved.' }],
    initialValues: { content },
    onSubmit: async (values) => {
      const next = values.content || ''
      onChange(next)
      if (onPersist) {
        await onPersist(next)
        setNotice('Saved to the existing page record.')
      } else {
        setNotice('Applied to the page draft. Use the page Save button to persist it.')
      }
    },
  }), [content, onChange, onPersist])

  useEffect(() => {
    cms.forms.add(form)
    return () => { cms.forms.remove(form) }
  }, [cms, form])

  useEffect(() => {
    setDraft(content)
    form.change('content', content)
    setNotice('')
  }, [content, form])

  const updateDraft = (value: string) => {
    setDraft(value)
    form.change('content', value)
    setNotice('')
  }

  return (
    <div className="rounded-lg border border-indigo-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">TinaCMS editor</h3>
          <p className="text-xs text-gray-600">Custom Tina form · saves into the existing page content field, not a duplicate Tina/Git content store.</p>
        </div>
        <button type="button" onClick={() => void form.submit()} disabled={form.submitting} className="rounded bg-indigo-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          {form.submitting ? 'Saving…' : 'Save with TinaCMS'}
        </button>
      </div>
      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="tina-page-html">Page content (HTML)</label>
      <textarea id="tina-page-html" rows={16} value={draft} onChange={(event) => updateDraft(event.target.value)} className="w-full rounded border border-gray-300 p-3 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      {notice && <p role="status" className="mt-2 text-sm text-green-700">{notice}</p>}
      <p className="mt-2 text-xs text-gray-500">Tina’s sidebar form is registered while this mode is active. Use the separate page save action when creating a new page.</p>
    </div>
  )
}

export default function TinaCmsAdapter({ content, onChange, onPersist }: Props) {
  const cms = useMemo(() => new TinaCMS({ enabled: true, sidebar: true, isLocalClient: true }), [])
  return <TinaProvider cms={cms}><TinaPageForm content={content} onChange={onChange} onPersist={onPersist} cms={cms} /></TinaProvider>
}
