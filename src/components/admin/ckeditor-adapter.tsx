'use client'

import { useEffect, useState } from 'react'
import 'ckeditor5/ckeditor5.css'

interface Props {
  content: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export default function CkEditorAdapter({ content, onChange, className = '', placeholder = 'Start writing…' }: Props) {
  const [modules, setModules] = useState<{ CKEditor: any; ClassicEditor: any; plugins: Record<string, any> } | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([import('@ckeditor/ckeditor5-react'), import('ckeditor5')]).then(([react, ckeditor]) => {
      if (active) setModules({ CKEditor: react.CKEditor, ClassicEditor: ckeditor.ClassicEditor, plugins: ckeditor as unknown as Record<string, any> })
    }).catch(error => {
      console.error('Could not load CKEditor:', error)
      if (active) setLoadError('CKEditor could not be loaded. Refresh the page or use another editor.')
    })
    return () => { active = false }
  }, [])

  if (loadError) return <div role="alert" className={`rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}>{loadError}</div>
  if (!modules) return <div className={`rich-text-editor ${className}`}><div className="editor-loading">Loading rich editor…</div></div>

  const Editor = modules.CKEditor
  const ClassicEditor = modules.ClassicEditor
  const p = modules.plugins
  const attachAdminUploadAdapter = (editor: any) => {
    const repository = editor.plugins.get('FileRepository')
    repository.createUploadAdapter = (loader: { file: Promise<File> }) => {
      const controller = new AbortController()
      return {
        upload: async () => {
          const file = await loader.file
          const form = new FormData()
          form.append('file', file)
          form.append('category', 'GENERAL')
          form.append('alt', file.name)
          form.append('isPublic', 'true')
          const response = await fetch('/api/media', { method: 'POST', body: form, signal: controller.signal })
          const result = await response.json().catch(() => ({}))
          if (!response.ok || typeof result.url !== 'string' || !result.url) throw new Error(result.error || 'Image upload failed')
          return { default: result.url }
        },
        abort: () => controller.abort(),
      }
    }
  }

  const config = {
    licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || 'GPL',
    placeholder,
    plugins: [
      p.Essentials, p.Paragraph, p.Heading, p.Bold, p.Italic, p.Underline, p.Strikethrough,
      p.Link, p.List, p.BlockQuote, p.Table, p.TableToolbar, p.Image, p.ImageToolbar,
      p.ImageCaption, p.ImageStyle, p.ImageUpload, p.MediaEmbed, p.CodeBlock, p.Alignment,
      p.Font, p.FontFamily, p.FontSize, p.FontColor, p.FontBackgroundColor, p.GeneralHtmlSupport,
    ].filter(Boolean),
    extraPlugins: [attachAdminUploadAdapter],
    toolbar: [
      'undo', 'redo', '|', 'heading', '|', 'fontFamily', 'fontSize', '|', 'bold', 'italic',
      'underline', 'strikethrough', 'fontColor', 'fontBackgroundColor', '|', 'link',
      'bulletedList', 'numberedList', 'blockQuote', '|', 'insertTable', 'uploadImage',
      'mediaEmbed', 'codeBlock', '|', 'alignment',
    ],
    fontFamily: { supportAllValues: true },
    fontSize: { options: [9, 11, 13, 'default', 17, 19, 21, 27, 35], supportAllValues: true },
    htmlSupport: {
      allow: [{ name: /^(?!script$|style$).*$/, attributes: true, classes: true, styles: true }],
    },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    image: { toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'] },
    mediaEmbed: { previewsInData: true },
  }

  return <div className={`rich-text-editor ckeditor-adapter ${className}`}>
    <Editor
      editor={ClassicEditor}
      data={content || ''}
      config={config}
      onChange={(_: unknown, editor: { getData: () => string }) => onChange(editor.getData())}
      onError={(error: any, details: any) => {
        if (!details?.willEditorRestart) {
          console.error('CKEditor runtime error:', error)
          setLoadError(error?.message || 'CKEditor encountered a runtime error. Refresh the page and try again.')
        }
      }}
    />
  </div>
}
