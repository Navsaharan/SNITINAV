'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { parseStoryblokPageReference, puckPageContentToHtml } from '@/lib/page-editor-content'
import TipTapEditor from './tiptap-editor'

const PuckEditorAdapter = dynamic(() => import('./puck-editor-adapter'), { ssr: false })
const TinaCmsAdapter = dynamic(() => import('./tina-cms-adapter'), { ssr: false })
const StoryblokEditorAdapter = dynamic(() => import('./storyblok-editor-adapter'), { ssr: false })
const SanityEditorAdapter = dynamic(() => import('./sanity-editor-adapter'), { ssr: false })
const CkEditorAdapter = dynamic(() => import('./ckeditor-adapter'), { ssr: false })

type EditorMode = 'tiptap' | 'ckeditor' | 'puck' | 'tina' | 'storyblok' | 'sanity'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  showPreview?: boolean
  splitView?: boolean
  className?: string
  pageId?: string
  pageTitle?: string
  pageSlug?: string
  publish?: boolean
  onPersist?: (content: string) => Promise<void>
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing…', showPreview = false, splitView = false, className = '', pageId, pageTitle = '', pageSlug = '', publish = false, onPersist }: RichTextEditorProps) {
  const [preview, setPreview] = useState(showPreview || splitView)
  const [selectedEditor, setSelectedEditor] = useState<EditorMode>('tiptap')
  const [resolvedContent, setResolvedContent] = useState(content)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const storyblokSourceSlug = parseStoryblokPageReference(content)

  useEffect(() => {
    fetch('/api/settings/public').then(response => response.ok ? response.json() : {}).then((data: Record<string, { value?: string }>) => {
      const choice = data.preferred_rich_text_editor?.value
      if (choice === 'ckeditor' || choice === 'tiptap' || choice === 'puck' || choice === 'tina' || choice === 'storyblok' || choice === 'sanity') setSelectedEditor(choice)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!storyblokSourceSlug || selectedEditor === 'storyblok') {
      setResolvedContent(content); setSourceLoading(false); setSourceError(''); return
    }
    let active = true
    setSourceLoading(true); setSourceError('')
    fetch(`/api/cms/storyblok?slug=${encodeURIComponent(storyblokSourceSlug)}`).then(async response => {
      const result = await response.json()
      if (!response.ok || !result.story) throw new Error(result.error || 'Could not read the Storyblok-backed page')
      if (active) setResolvedContent(result.story.content || '')
    }).catch(reason => {
      if (active) setSourceError(reason instanceof Error ? reason.message : 'Could not read Storyblok content')
    }).finally(() => { if (active) setSourceLoading(false) })
    return () => { active = false }
  }, [content, selectedEditor, storyblokSourceSlug])

  const puckSourceHtml = puckPageContentToHtml(content)
  const editorContent = storyblokSourceSlug && selectedEditor !== 'storyblok'
    ? resolvedContent
    : puckSourceHtml !== null && selectedEditor !== 'puck'
      ? puckSourceHtml
      : content

  const chooser = (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <label htmlFor="page-editor-choice" className="text-sm font-medium text-gray-800">Choose editor for this edit</label>
      <select id="page-editor-choice" value={selectedEditor} onChange={event => setSelectedEditor(event.target.value as EditorMode)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm">
        <option value="tiptap">TipTap — rich text</option>
        <option value="ckeditor">CKEditor 5 — rich text</option>
        <option value="puck">Puck — visual page builder</option>
        <option value="tina">TinaCMS — CMS form editor</option>
        <option value="storyblok">Storyblok — connected headless CMS</option>
        <option value="sanity">Sanity — connected headless CMS</option>
      </select>
      <span className="text-xs text-gray-600">Only the selected editor is loaded, so one CMS integration cannot break the others.</span>
    </div>
  )

  if (storyblokSourceSlug && selectedEditor !== 'storyblok' && sourceLoading) return <div className={className}>{chooser}<div role="status" className="rounded border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">Loading the current Storyblok body before switching editors…</div></div>
  if (storyblokSourceSlug && selectedEditor !== 'storyblok' && sourceError) return <div className={className}>{chooser}<div role="alert" className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Could not load this Storyblok page for local editing: {sourceError}. The Storyblok reference has not been changed. Configure the Storyblok server tokens or switch back to Storyblok mode.</div></div>
  if (selectedEditor === 'puck') return <div className={className}>{chooser}<PuckEditorAdapter key={pageId || 'new-page'} content={editorContent} onChange={onChange} onPersist={onPersist} /></div>
  if (selectedEditor === 'tina') return <div className={className}>{chooser}<TinaCmsAdapter content={editorContent} onChange={onChange} onPersist={onPersist} /></div>
  if (selectedEditor === 'storyblok') return <div className={className}>{chooser}<StoryblokEditorAdapter content={content} title={pageTitle} slug={pageSlug} pageId={pageId} publish={publish} onChange={onChange} /></div>
  if (selectedEditor === 'sanity') return <div className={className}>{chooser}<SanityEditorAdapter content={content} title={pageTitle} slug={pageSlug} pageId={pageId} publish={publish} onChange={onChange} /></div>
  if (selectedEditor === 'ckeditor') return <div className={className}>{chooser}<CkEditorAdapter content={editorContent} onChange={onChange} placeholder={placeholder} /></div>
  return <TipTapEditor content={editorContent} onChange={onChange} placeholder={placeholder} preview={preview} onTogglePreview={() => setPreview(value => !value)} chooser={chooser} className={className} />
}
