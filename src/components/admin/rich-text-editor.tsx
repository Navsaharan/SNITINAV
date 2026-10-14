'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Image as ImageIcon, Italic, Code2, Youtube,
  Link as LinkIcon, List, ListOrdered, Quote, Redo2, Table as TableIcon,
  Underline as UnderlineIcon, Undo2
} from 'lucide-react'
import '@/styles/rich-text-editor.css'
import 'ckeditor5/ckeditor5.css'
import StoryblokEditorAdapter from './storyblok-editor-adapter'
import SanityEditorAdapter from './sanity-editor-adapter'
import CkEditorAdapter from './ckeditor-adapter'
import { parseStoryblokPageReference, puckPageContentToHtml } from '@/lib/page-editor-content'

const PuckEditorAdapter = dynamic(() => import('./puck-editor-adapter'), { ssr: false })
const TinaCmsAdapter = dynamic(() => import('./tina-cms-adapter'), { ssr: false })
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

function ToolbarButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`editor-toolbar-button${active ? ' is-active' : ''}`}>{children}</button>
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing…', showPreview = false, splitView = false, className = '', pageId, pageTitle = '', pageSlug = '', publish = false, onPersist }: RichTextEditorProps) {
  const [preview, setPreview] = useState(showPreview || splitView)
  const [selectedEditor, setSelectedEditor] = useState<EditorMode>('tiptap')
  const [resolvedContent, setResolvedContent] = useState(content)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const storyblokSourceSlug = parseStoryblokPageReference(content)
  useEffect(() => {
    fetch('/api/settings/public').then(r => r.ok ? r.json() : {}).then((data: Record<string, { value?: string }>) => {
      const choice = data.preferred_rich_text_editor?.value
      if (choice === 'ckeditor' || choice === 'tiptap' || choice === 'puck' || choice === 'tina' || choice === 'storyblok' || choice === 'sanity') setSelectedEditor(choice)
    }).catch(() => {})
  }, [])
  useEffect(() => {
    if (!storyblokSourceSlug || selectedEditor === 'storyblok') {
      setResolvedContent(content)
      setSourceLoading(false)
      setSourceError('')
      return
    }
    let active = true
    setSourceLoading(true)
    setSourceError('')
    fetch(`/api/cms/storyblok?slug=${encodeURIComponent(storyblokSourceSlug)}`).then(async (response) => {
      const result = await response.json()
      if (!response.ok || !result.story) throw new Error(result.error || 'Could not read the Storyblok-backed page')
      if (active) setResolvedContent(result.story.content || '')
    }).catch((reason) => {
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
  const extensions = useMemo(() => [
    StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'editor-code-block' } } }),
    Underline,
    Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: 'editor-image' } }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
  ], [placeholder])

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: editorContent,
    editorProps: { attributes: { class: 'editor-prose' } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useEffect(() => {
    if (editor && editorContent !== editor.getHTML()) editor.commands.setContent(editorContent || '', false)
  }, [editorContent, editor])

  const chooser = (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <label htmlFor="page-editor-choice" className="text-sm font-medium text-gray-800">Choose editor for this edit</label>
      <select id="page-editor-choice" value={selectedEditor} onChange={(event) => setSelectedEditor(event.target.value as EditorMode)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm">
        <option value="tiptap">TipTap — rich text</option>
        <option value="ckeditor">CKEditor 5 — rich text</option>
        <option value="puck">Puck — visual page builder</option>
        <option value="tina">TinaCMS — CMS form editor</option>
        <option value="storyblok">Storyblok — connected headless CMS</option>
        <option value="sanity">Sanity — connected headless CMS</option>
      </select>
      <span className="text-xs text-gray-600">The selection is per editing session; existing HTML remains available in the rich-text editors.</span>
    </div>
  )

  if (storyblokSourceSlug && selectedEditor !== 'storyblok' && sourceLoading) return <div className={className}>{chooser}<div role="status" className="rounded border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">Loading the current Storyblok body before switching editors…</div></div>
  if (storyblokSourceSlug && selectedEditor !== 'storyblok' && sourceError) return <div className={className}>{chooser}<div role="alert" className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Could not load this Storyblok page for local editing: {sourceError}. The Storyblok reference has not been changed. Configure the Storyblok server tokens or switch back to Storyblok mode.</div></div>
  if (selectedEditor === 'puck') return <div className={className}>{chooser}<PuckEditorAdapter key={pageId || 'new-page'} content={editorContent} onChange={onChange} onPersist={onPersist} /></div>
  if (selectedEditor === 'tina') return <div className={className}>{chooser}<TinaCmsAdapter content={editorContent} onChange={onChange} onPersist={onPersist} /></div>
  if (selectedEditor === 'storyblok') return <div className={className}>{chooser}<StoryblokEditorAdapter content={content} title={pageTitle} slug={pageSlug} pageId={pageId} publish={publish} onChange={onChange} /></div>
  if (selectedEditor === 'sanity') return <div className={className}>{chooser}<SanityEditorAdapter content={content} title={pageTitle} slug={pageSlug} pageId={pageId} publish={publish} onChange={onChange} /></div>
  if (selectedEditor === 'ckeditor') return <div className={className}>{chooser}<CkEditorAdapter content={editorContent} onChange={onChange} className="" placeholder={placeholder} /></div>
  if (!editor) return <div className={className}>{chooser}<div className="rich-text-editor"><div className="editor-loading">Loading editor…</div></div></div>

  const addLink = () => {
    const href = window.prompt('Enter the link URL')
    if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }
  const addEmbed = () => { const url = window.prompt('Enter an embed URL (YouTube, Vimeo, or other trusted URL)'); if (url) editor.chain().focus().insertContent(`<p><a href="${url.replaceAll('&', '&amp;').replaceAll('\"', '&quot;')}" target="_blank" rel="noopener noreferrer">${url}</a></p>`).run() }
  const addImage = () => {
    const src = window.prompt('Enter the image URL')
    if (src) editor.chain().focus().setImage({ src, alt: window.prompt('Enter image description') || '' }).run()
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {chooser}
      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
        <div className="editor-toolbar-group">
          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
          <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolbarButton>
          <select aria-label="Heading level" className="editor-heading-select" value={editor.isActive('heading') ? editor.getAttributes('heading').level : 0} onChange={(e) => { const level = Number(e.target.value); level ? editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run() : editor.chain().focus().setParagraph().run() }}>
            <option value={0}>Paragraph</option><option value={1}>Heading 1</option><option value={2}>Heading 2</option><option value={3}>Heading 3</option>
          </select>
        </div>
        <div className="editor-toolbar-group">
          <ToolbarButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
          <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={16} /></ToolbarButton>
          <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
          <ToolbarButton label="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={16} /></ToolbarButton>
          <ToolbarButton label="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={16} /></ToolbarButton>
          <ToolbarButton label="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={16} /></ToolbarButton>
        </div>
        <div className="editor-toolbar-group editor-toolbar-group-end">
          <ToolbarButton label="Insert link" active={editor.isActive('link')} onClick={addLink}><LinkIcon size={16} /></ToolbarButton>
          <ToolbarButton label="Insert embed link" onClick={addEmbed}><Youtube size={16} /></ToolbarButton>
          <ToolbarButton label="Insert image" onClick={addImage}><ImageIcon size={16} /></ToolbarButton>
          <ToolbarButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}><TableIcon size={16} /></ToolbarButton>
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></ToolbarButton>
          <button type="button" className="editor-preview-toggle" onClick={() => setPreview((value) => !value)}>{preview ? 'Edit' : 'Preview'}</button>
        </div>
      </div>
      <div className={preview ? 'editor-workspace is-preview' : 'editor-workspace'}>
        {!preview && <EditorContent editor={editor} />}
        {preview && <div className="editor-preview editor-prose" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />}
      </div>
      <div className="editor-status">Editor: TipTap · Change the editor for this editing session above, or set a default in Site Settings.</div>
      <div className="editor-status">{editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters</div>
    </div>
  )
}
