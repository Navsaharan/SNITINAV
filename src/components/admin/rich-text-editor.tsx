'use client'

import { useEffect, useMemo, useState } from 'react'
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

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  showPreview?: boolean
  splitView?: boolean
  className?: string
}

function ToolbarButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`editor-toolbar-button${active ? ' is-active' : ''}`}>{children}</button>
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing…', showPreview = false, splitView = false, className = '' }: RichTextEditorProps) {
  const [preview, setPreview] = useState(showPreview || splitView)
  const [preferredEditor, setPreferredEditor] = useState<'tiptap' | 'ckeditor'>('tiptap')
  useEffect(() => { fetch('/api/settings/public').then(r => r.ok ? r.json() : {}).then((data: Record<string, { value?: string }>) => { const choice = data.preferred_rich_text_editor?.value; if (choice === 'ckeditor' || choice === 'tiptap') setPreferredEditor(choice) }).catch(() => {}) }, [])
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
    content,
    editorProps: { attributes: { class: 'editor-prose' } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) editor.commands.setContent(content || '', false)
  }, [content, editor])

  if (preferredEditor === 'ckeditor') return <CkEditorAdapter content={content} onChange={onChange} className={className} placeholder={placeholder} />
  if (!editor) return <div className={`rich-text-editor ${className}`}><div className="editor-loading">Loading editor…</div></div>

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
      <div className="editor-status">Editor: TipTap · Change preferred editor in Site Settings</div>
      <div className="editor-status">{editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters</div>
    </div>
  )
}


function CkEditorAdapter({ content, onChange, className, placeholder }: { content: string; onChange: (value: string) => void; className: string; placeholder: string }) {
  const [modules, setModules] = useState<{ CKEditor: any; ClassicEditor: any } | null>(null)
  useEffect(() => { let active = true; Promise.all([import('@ckeditor/ckeditor5-react'), import('@ckeditor/ckeditor5-build-classic')]).then(([react, classic]) => { if (active) setModules({ CKEditor: react.CKEditor, ClassicEditor: classic.default }) }).catch(error => console.error('Could not load CKEditor:', error)); return () => { active = false } }, [])
  if (!modules) return <div className={`rich-text-editor ${className}`}><div className="editor-loading">Loading CKEditor…</div></div>
  const Editor = modules.CKEditor
  const ClassicEditor = modules.ClassicEditor
  return <div className={`rich-text-editor ckeditor-adapter ${className}`}><p className="mb-2 text-xs text-gray-500">CKEditor 5 · formatting, tables, links, images, media embeds and undo/redo</p><Editor editor={ClassicEditor} data={content || `<p>${placeholder}</p>`} config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','blockQuote','insertTable','imageUpload','mediaEmbed','undo','redo'], table: { contentToolbar: ['tableColumn','tableRow','mergeTableCells'] } }} onChange={(_: unknown, editor: { getData: () => string }) => onChange(editor.getData())} /></div>
}
