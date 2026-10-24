'use client'

import { useEffect, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Image as ImageIcon, Italic, Code2, Youtube,
  Link as LinkIcon, List, ListOrdered, Quote, Redo2, Table as TableIcon,
  Underline as UnderlineIcon, Undo2,
} from 'lucide-react'

interface Props {
  content: string
  onChange: (content: string) => void
  placeholder: string
  preview: boolean
  onTogglePreview: () => void
  chooser: React.ReactNode
  className: string
}

function ToolbarButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`editor-toolbar-button${active ? ' is-active' : ''}`}>{children}</button>
}

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element: HTMLElement) => element.style.fontSize || null,
          renderHTML: (attributes: { fontSize?: string | null }) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }]
  },
})

export default function TipTapEditor({ content, onChange, placeholder, preview, onTogglePreview, chooser, className }: Props) {
  const extensions = useMemo(() => [
    StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'editor-code-block' } } }),
    Underline,
    Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: 'editor-image' } }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle, Color, Highlight.configure({ multicolor: true }), FontSize,
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

  if (!editor) return <div className={className}>{chooser}<div className="rich-text-editor"><div className="editor-loading">Loading editor…</div></div></div>

  const addLink = () => {
    const href = window.prompt('Enter the link URL')
    if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }
  const addEmbed = () => {
    const url = window.prompt('Enter an embed URL (YouTube, Vimeo, or other trusted URL)')
    if (url) editor.chain().focus().insertContent(`<p><a href="${url.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}" target="_blank" rel="noopener noreferrer">${url}</a></p>`).run()
  }
  const addImage = () => {
    const src = window.prompt('Enter the image URL')
    if (src) editor.chain().focus().setImage({ src, alt: window.prompt('Enter image description') || '' }).run()
  }

  return <div className={`rich-text-editor ${className}`}>
    {chooser}
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="editor-toolbar-group">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolbarButton>
        <select aria-label="Heading level" className="editor-heading-select" value={editor.isActive('heading') ? editor.getAttributes('heading').level : 0} onChange={(event) => { const level = Number(event.target.value); level ? editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run() : editor.chain().focus().setParagraph().run() }}>
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
        <label className="editor-toolbar-button" title="Text color">Text <input aria-label="Text color" type="color" value={editor.getAttributes('textStyle').color || '#000000'} onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} /></label>
        <label className="editor-toolbar-button" title="Highlight color">Highlight <input aria-label="Highlight color" type="color" value={editor.getAttributes('highlight').color || '#ffff00'} onChange={(event) => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} /></label>
        <select aria-label="Font size" className="editor-heading-select" defaultValue="" onChange={(event) => { const value = event.target.value; if (value) editor.chain().focus().setMark('textStyle', { fontSize: value }).run() }}>
          <option value="">Font size</option><option value="12px">12px</option><option value="16px">16px</option><option value="20px">20px</option><option value="28px">28px</option>
        </select>
      </div>
      <div className="editor-toolbar-group editor-toolbar-group-end">
        <ToolbarButton label="Insert link" active={editor.isActive('link')} onClick={addLink}><LinkIcon size={16} /></ToolbarButton>
        <ToolbarButton label="Insert embed link" onClick={addEmbed}><Youtube size={16} /></ToolbarButton>
        <ToolbarButton label="Insert image" onClick={addImage}><ImageIcon size={16} /></ToolbarButton>
        <ToolbarButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}><TableIcon size={16} /></ToolbarButton>
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></ToolbarButton>
        <button type="button" className="editor-preview-toggle" onClick={onTogglePreview}>{preview ? 'Edit' : 'Preview'}</button>
      </div>
    </div>
    <div className={preview ? 'editor-workspace is-preview' : 'editor-workspace'}>
      {!preview && <EditorContent editor={editor} />}
      {preview && <div className="editor-preview editor-prose" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />}
    </div>
    <div className="editor-status">Editor: TipTap · Change the editor for this editing session above, or set a default in Site Settings.</div>
    <div className="editor-status">{editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters</div>
  </div>
}
