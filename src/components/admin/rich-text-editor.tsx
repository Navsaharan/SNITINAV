'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import '@/styles/rich-text-editor.css'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Placeholder from '@tiptap/extension-placeholder'
import { PreserveAttributes, ContentPreservation, CustomDiv, CustomSpan, PreserveUnknownElements, TextFormatPreservation } from '@/lib/tiptap-extensions'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Edit,
  Columns,
  Type,
  Palette,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Square,
  Circle,
  Minus,
  ArrowRight,
  GripHorizontal,
  MousePointer,
  FileText,
  Layout,
  Download,
  Shield,
  Grid3X3,
  Columns2,
  FolderOpen,
  Upload,
  X,
  Code,
  Palette,
  History,
  Save
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  showPreview?: boolean
  splitView?: boolean
  className?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  showPreview = false,
  splitView = false,
  className = ''
}: RichTextEditorProps) {
  // All useState hooks must be declared first and in consistent order
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSplitView, setIsSplitView] = useState(splitView)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [currentTextColor, setCurrentTextColor] = useState('#000000')
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#ffff00')
  const [showLinkDropdown, setShowLinkDropdown] = useState(false)
  const [showImageDropdown, setShowImageDropdown] = useState(false)
  const [showTableDropdown, setShowTableDropdown] = useState(false)
  const [showBoxDropdown, setShowBoxDropdown] = useState(false)
  const [showCalloutDropdown, setShowCalloutDropdown] = useState(false)
  const [showShapeDropdown, setShowShapeDropdown] = useState(false)
  const [showSpacerDropdown, setShowSpacerDropdown] = useState(false)
  const [showButtonDropdown, setShowButtonDropdown] = useState(false)
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false)
  const [showTypographyDropdown, setShowTypographyDropdown] = useState(false)
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [showCSSPanel, setShowCSSPanel] = useState(false)
  const [customCSS, setCustomCSS] = useState('')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [contentHistory, setContentHistory] = useState<Array<{id: string, content: string, timestamp: Date, description: string}>>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)

  // All useRef hooks
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // useEditor hook must be called early and consistently
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        // Preserve existing HTML structure and disable content cleaning
        dropcursor: {
          color: '#DBEAFE',
          width: 4,
        },
        gapcursor: false,
        // Disable automatic paragraph wrapping to preserve structure
        paragraph: {
          HTMLAttributes: {
            class: null, // Allow custom classes
          },
        },
        // Preserve heading attributes
        heading: {
          HTMLAttributes: {
            class: null, // Allow custom classes
          },
        },
      }),
      // Content preservation extensions
      PreserveAttributes,
      ContentPreservation,
      CustomDiv,
      CustomSpan,
      PreserveUnknownElements,
      TextFormatPreservation,

      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-table:text-sm',
        style: '--tw-prose-body: inherit; --tw-prose-headings: inherit;',
      },
      // Preserve all HTML attributes during parsing
      transformPastedHTML: (html) => {
        console.log('Preserving pasted HTML:', html)
        // Don't transform pasted HTML at all
        return html
      },
      transformPastedText: (text) => {
        console.log('Preserving pasted text:', text)
        return text
      },
      // Handle DOM parsing to preserve attributes
      handleDOMEvents: {
        paste: (view, event) => {
          // Let the default paste handler work but preserve formatting
          return false
        },
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    // Disable content transformation rules
    enableInputRules: false, // Disable input rules that might transform content
    enablePasteRules: false, // Disable paste rules that might clean content

    // Custom HTML parser options
    injectCSS: false, // Don't inject default CSS that might override styles
  })

  // Function definitions that are used in useEffect hooks
  const fetchMediaFiles = async () => {
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const files = await response.json()
        setMediaFiles(files)
      }
    } catch (error) {
      console.error('Error fetching media files:', error)
    }
  }

  const saveToHistory = (description: string) => {
    if (!editor) return
    const currentContent = editor.getHTML()
    const historyEntry = {
      id: Date.now().toString(),
      content: currentContent,
      timestamp: new Date(),
      description
    }

    setContentHistory(prev => {
      const newHistory = [...prev.slice(0, currentHistoryIndex + 1), historyEntry]
      // Keep only last 50 entries to prevent memory issues
      return newHistory.slice(-50)
    })
    setCurrentHistoryIndex(prev => prev + 1)
  }

  const createSnapshot = () => {
    const description = window.prompt('Enter a description for this snapshot:')
    if (description) {
      saveToHistory(`Snapshot: ${description}`)
      alert('Snapshot saved successfully!')
    }
  }

  const exportContent = (format: 'html' | 'markdown' | 'text') => {
    if (!editor) return
    const content = editor.getHTML()
    let exportData = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'html':
        exportData = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Content</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
        filename = 'content.html'
        mimeType = 'text/html'
        break
      case 'markdown':
        // Simple HTML to Markdown conversion
        exportData = content
          .replace(/<h([1-6])>/g, (match, level) => '#'.repeat(parseInt(level)) + ' ')
          .replace(/<\/h[1-6]>/g, '\n\n')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '\n\n')
          .replace(/<strong>/g, '**')
          .replace(/<\/strong>/g, '**')
          .replace(/<em>/g, '*')
          .replace(/<\/em>/g, '*')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        filename = 'content.md'
        mimeType = 'text/markdown'
        break
      case 'text':
        exportData = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        filename = 'content.txt'
        mimeType = 'text/plain'
        break
    }

    // Create download
    const blob = new Blob([exportData], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Close all dropdowns function - defined before useEffect
  const closeAllDropdowns = () => {
    setShowColorPicker(false)
    setShowHighlightPicker(false)
    setShowLinkDropdown(false)
    setShowImageDropdown(false)
    setShowTableDropdown(false)
    setShowBoxDropdown(false)
    setShowCalloutDropdown(false)
    setShowShapeDropdown(false)
    setShowSpacerDropdown(false)
    setShowButtonDropdown(false)
    setShowTemplatesDropdown(false)
    setShowTypographyDropdown(false)
    setShowLayoutDropdown(false)
    setShowExportDropdown(false)
    setShowAccessibilityPanel(false)
    setShowMediaGallery(false)
    setShowCSSPanel(false)
    setShowHistoryPanel(false)
  }

  // ALL useEffect hooks must be called unconditionally and in consistent order
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.relative')) {
        closeAllDropdowns()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load media files when gallery opens
  useEffect(() => {
    if (showMediaGallery && mediaFiles.length === 0) {
      fetchMediaFiles()
    }
  }, [showMediaGallery, mediaFiles.length])

  // Auto-save to history on significant changes
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        // Auto-save every 30 seconds or on significant content changes
        const currentContent = editor.getHTML()
        const lastEntry = contentHistory[contentHistory.length - 1]

        if (!lastEntry || currentContent !== lastEntry.content) {
          const now = new Date()
          const lastSave = lastEntry ? lastEntry.timestamp : new Date(0)
          const timeDiff = now.getTime() - lastSave.getTime()

          // Auto-save if 30 seconds have passed or content is significantly different
          if (timeDiff > 30000 || Math.abs(currentContent.length - (lastEntry?.content.length || 0)) > 100) {
            saveToHistory('Auto-save')
          }
        }
      }

      editor.on('update', handleUpdate)
      return () => {
        editor.off('update', handleUpdate)
      }
    }
  }, [editor, contentHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            createSnapshot()
            break
          case 'h':
            event.preventDefault()
            setShowHistoryPanel(true)
            break
          case 'm':
            event.preventDefault()
            setShowMediaGallery(true)
            break
          case 'e':
            event.preventDefault()
            exportContent('html')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      const alt = window.prompt('Enter image description (alt text):') || 'Image'
      editor.chain().focus().setImage({ src: url, alt }).run()
    }
  }

  const addImageWithCaption = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      const alt = window.prompt('Enter image description (alt text):') || 'Image'
      const caption = window.prompt('Enter image caption (optional):') || ''
      const html = `<figure style="margin: 20px 0; text-align: center;">
        <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
        ${caption ? `<figcaption style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">${caption}</figcaption>` : ''}
      </figure>`
      editor.chain().focus().insertContent(html).run()
    }
  }

  const addLink = () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )
    const url = window.prompt('Enter URL:')
    if (url) {
      const linkText = selectedText || window.prompt('Enter link text:') || url
      if (selectedText) {
        editor.chain().focus().setLink({ href: url }).run()
      } else {
        editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run()
      }
    }
  }

  const addAdvancedLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      const text = window.prompt('Enter link text:') || url
      const title = window.prompt('Enter link title (tooltip):') || ''
      const openInNewTab = window.confirm('Open link in new tab?')
      const html = `<a href="${url}" ${title ? `title="${title}"` : ''} ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="color: #3b82f6; text-decoration: underline; font-weight: 500;">${text}</a>`
      editor.chain().focus().insertContent(html).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addCustomTable = () => {
    const rows = parseInt(window.prompt('Number of rows:') || '3')
    const cols = parseInt(window.prompt('Number of columns:') || '3')
    const withHeader = window.confirm('Include header row?')
    if (rows > 0 && cols > 0) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run()
    }
  }

  const addStyledTable = () => {
    const html = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #f8fafc;">
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 1</th>
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 2</th>
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 3</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #ffffff;">
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 1</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 2</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 3</td>
        </tr>
        <tr style="background-color: #f9fafb;">
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 4</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 5</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 6</td>
        </tr>
      </tbody>
    </table>`
    editor.chain().focus().insertContent(html).run()
  }

  const addTableRow = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const addTableColumn = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteTableRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const deleteTableColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      })
    }
  }

  // Color and formatting functions
  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setCurrentTextColor(color)
    setShowColorPicker(false)
  }

  const setHighlightColor = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run()
    setCurrentHighlightColor(color)
    setShowHighlightPicker(false)
  }

  const setFontFamily = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run()
  }

  const insertColoredBox = (backgroundColor: string) => {
    const html = `<div style="background-color: ${backgroundColor}; padding: 16px; margin: 8px 0; border-radius: 4px; min-height: 60px; border: 2px dashed rgba(0,0,0,0.1);">
      <p>Click here to add content...</p>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertTextBox = (borderColor: string = '#e5e7eb', backgroundColor: string = '#ffffff') => {
    const html = `<div style="border: 2px solid ${borderColor}; background-color: ${backgroundColor}; padding: 20px; margin: 12px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="margin-top: 0; color: #374151;">Title</h3>
      <p>Add your content here...</p>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertCalloutBox = (type: 'info' | 'warning' | 'success' | 'error') => {
    const styles = {
      info: { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️' },
      warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
      success: { bg: '#f0fdf4', border: '#10b981', icon: '✅' },
      error: { bg: '#fef2f2', border: '#ef4444', icon: '❌' }
    }
    const style = styles[type]
    const html = `<div style="background-color: ${style.bg}; border-left: 4px solid ${style.border}; padding: 16px; margin: 12px 0; border-radius: 4px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 18px;">${style.icon}</span>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; text-transform: capitalize;">${type}</h4>
          <p style="margin: 0; color: #6b7280;">Add your ${type} message here...</p>
        </div>
      </div>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertTwoColumnLayout = () => {
    const html = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 16px 0; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px;">
      <div style="padding: 12px; background-color: #f9fafb; border-radius: 4px; min-height: 100px;">
        <h4 style="margin-top: 0;">Left Column</h4>
        <p>Add content for the left column...</p>
      </div>
      <div style="padding: 12px; background-color: #f9fafb; border-radius: 4px; min-height: 100px;">
        <h4 style="margin-top: 0;">Right Column</h4>
        <p>Add content for the right column...</p>
      </div>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertQuoteBox = () => {
    const html = `<blockquote style="border-left: 4px solid #6366f1; background-color: #f8fafc; padding: 20px; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: italic;">
      <p style="margin: 0 0 12px 0; font-size: 18px; line-height: 1.6; color: #475569;">"Add your quote here..."</p>
      <footer style="margin: 0; font-size: 14px; color: #64748b; font-style: normal;">
        — <cite>Author Name</cite>
      </footer>
    </blockquote>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertShape = (shape: 'rectangle' | 'circle' | 'arrow') => {
    const shapes = {
      rectangle: `<div style="width: 200px; height: 100px; background-color: #3b82f6; border-radius: 8px; margin: 16px auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Rectangle</div>`,
      circle: `<div style="width: 150px; height: 150px; background-color: #10b981; border-radius: 50%; margin: 16px auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Circle</div>`,
      arrow: `<div style="width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-bottom: 40px solid #f59e0b; margin: 16px auto; position: relative;">
        <div style="position: absolute; top: 40px; left: -15px; width: 30px; height: 20px; background-color: #f59e0b;"></div>
      </div>`
    }
    editor.chain().focus().insertContent(shapes[shape]).run()
  }

  const insertSpacer = (height: string) => {
    const html = `<div style="height: ${height}; margin: 8px 0; border: 1px dashed #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; background-color: #f9fafb;">
      Spacer (${height})
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertDivider = (style: 'solid' | 'dashed' | 'dotted' | 'double') => {
    const html = `<hr style="border: none; border-top: 2px ${style} #d1d5db; margin: 24px 0; width: 100%;" />`
    editor.chain().focus().insertContent(html).run()
  }

  const insertButton = (variant: 'primary' | 'secondary' | 'outline') => {
    const styles = {
      primary: 'background-color: #3b82f6; color: white; border: 2px solid #3b82f6;',
      secondary: 'background-color: #6b7280; color: white; border: 2px solid #6b7280;',
      outline: 'background-color: transparent; color: #3b82f6; border: 2px solid #3b82f6;'
    }
    const html = `<div style="text-align: center; margin: 16px 0;">
      <a href="#" style="display: inline-block; padding: 12px 24px; ${styles[variant]} text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.2s;">
        Button Text
      </a>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  // Content Templates
  const insertTemplate = (templateType: string) => {
    const templates = {
      'about-page': `
        <h1>About Our Institute</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div>
            <h2>Our Mission</h2>
            <p>Add your mission statement here...</p>

            <h2>Our Vision</h2>
            <p>Add your vision statement here...</p>
          </div>
          <div style="text-align: center;">
            <img src="https://via.placeholder.com/400x300" alt="Institute Image" style="max-width: 100%; border-radius: 8px;" />
            <p style="font-style: italic; margin-top: 8px;">Institute Campus</p>
          </div>
        </div>

        <h2>Key Features</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #1e40af;">Quality Education</h3>
            <p>Comprehensive technical training programs...</p>
          </div>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #047857;">Industry Partnerships</h3>
            <p>Strong connections with leading companies...</p>
          </div>
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #d97706;">Modern Facilities</h3>
            <p>State-of-the-art equipment and infrastructure...</p>
          </div>
        </div>
      `,
      'course-page': `
        <h1>Course Information</h1>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Course Overview</h2>
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
            <div>
              <p><strong>Course Name:</strong> [Course Title]</p>
              <p><strong>Duration:</strong> [Duration]</p>
              <p><strong>Eligibility:</strong> [Requirements]</p>
              <p><strong>Certification:</strong> [Certificate Details]</p>
            </div>
            <div style="text-align: center;">
              <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0;">Apply Now</h3>
                <p style="margin: 8px 0;">Admissions Open</p>
                <a href="#" style="color: white; text-decoration: underline;">Contact Us</a>
              </div>
            </div>
          </div>
        </div>

        <h2>Curriculum</h2>
        <div style="margin: 20px 0;">
          <h3>Module 1: Foundation</h3>
          <ul>
            <li>Basic concepts and principles</li>
            <li>Safety procedures</li>
            <li>Tool identification</li>
          </ul>

          <h3>Module 2: Practical Training</h3>
          <ul>
            <li>Hands-on workshop sessions</li>
            <li>Project-based learning</li>
            <li>Industry simulations</li>
          </ul>

          <h3>Module 3: Advanced Topics</h3>
          <ul>
            <li>Specialized techniques</li>
            <li>Quality control</li>
            <li>Industry standards</li>
          </ul>
        </div>

        <h2>Career Opportunities</h2>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Graduates can pursue careers in:</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">
            <div style="background-color: white; padding: 12px; border-radius: 6px; text-align: center;">Manufacturing</div>
            <div style="background-color: white; padding: 12px; border-radius: 6px; text-align: center;">Maintenance</div>
            <div style="background-color: white; padding: 12px; border-radius: 6px; text-align: center;">Quality Control</div>
            <div style="background-color: white; padding: 12px; border-radius: 6px; text-align: center;">Supervision</div>
          </div>
        </div>
      `,
      'news-article': `
        <div style="max-width: 800px; margin: 0 auto;">
          <h1>[Article Title]</h1>

          <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <div style="width: 60px; height: 60px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
              SN
            </div>
            <div>
              <p style="margin: 0; font-weight: 600;">S.N. ITI News</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">[Date] • [Category]</p>
            </div>
          </div>

          <img src="https://via.placeholder.com/800x400" alt="Article Image" style="width: 100%; border-radius: 8px; margin: 20px 0;" />

          <div style="font-size: 18px; line-height: 1.6; margin: 20px 0;">
            <p><strong>Lead paragraph:</strong> Write a compelling introduction that summarizes the key points of your article...</p>

            <h2>Main Content</h2>
            <p>Add your main article content here. Use clear, engaging language that tells the story effectively...</p>

            <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0; font-style: italic; color: #4b5563;">
              "Add a relevant quote or highlight key information here."
            </blockquote>

            <h2>Additional Details</h2>
            <p>Provide more context, background information, or supporting details...</p>

            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Key Takeaways</h3>
              <ul>
                <li>Important point 1</li>
                <li>Important point 2</li>
                <li>Important point 3</li>
              </ul>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="font-size: 14px; color: #6b7280;">
              For more information, contact us at <a href="mailto:snitcsrdr@gmail.com">snitcsrdr@gmail.com</a> or call 01564-275628.
            </p>
          </div>
        </div>
      `,
      'contact-page': `
        <h1>Contact Us</h1>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
          <div>
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

            <div style="space-y: 16px; margin: 20px 0;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white;">📍</span>
                </div>
                <div>
                  <h4 style="margin: 0;">Address</h4>
                  <p style="margin: 0; color: #6b7280;">D-117, Kaka Colony, Gandhi Vidhya Mandir, Teh.-Sardar Shahar, Dist. Churu</p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white;">📞</span>
                </div>
                <div>
                  <h4 style="margin: 0;">Phone</h4>
                  <p style="margin: 0; color: #6b7280;">01564-275628, 9414947801</p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white;">✉️</span>
                </div>
                <div>
                  <h4 style="margin: 0;">Email</h4>
                  <p style="margin: 0; color: #6b7280;">snitcsrdr@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2>Office Hours</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 12px;">
                <strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM
              </div>
              <div style="margin-bottom: 12px;">
                <strong>Saturday:</strong> 9:00 AM - 1:00 PM
              </div>
              <div>
                <strong>Sunday:</strong> Closed
              </div>
            </div>

            <div style="margin-top: 20px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1e40af;">Quick Contact</h3>
              <p style="margin-bottom: 16px;">For immediate assistance, please call our main office during business hours.</p>
              <a href="tel:01564275628" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Call Now</a>
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 30px; background-color: #f0fdf4; border-radius: 8px;">
          <h2 style="text-align: center; margin-bottom: 20px;">Visit Our Campus</h2>
          <p style="text-align: center; margin-bottom: 20px;">We welcome visitors to tour our facilities and learn more about our programs.</p>
          <div style="text-align: center;">
            <a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 8px;">Schedule a Visit</a>
            <a href="#" style="background-color: transparent; color: #10b981; padding: 12px 24px; text-decoration: none; border-radius: 6px; border: 2px solid #10b981; margin: 0 8px;">Download Brochure</a>
          </div>
        </div>
      `
    }

    const template = templates[templateType as keyof typeof templates]
    if (template) {
      editor.chain().focus().setContent(template).run()
    }
  }

  // Advanced Typography Functions
  const setLineHeight = (lineHeight: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const html = `<span style="line-height: ${lineHeight};">${editor.state.doc.textBetween(selection.from, selection.to)}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    }
  }

  const setLetterSpacing = (spacing: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const html = `<span style="letter-spacing: ${spacing};">${editor.state.doc.textBetween(selection.from, selection.to)}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    }
  }

  const setTextShadow = (shadow: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const html = `<span style="text-shadow: ${shadow};">${editor.state.doc.textBetween(selection.from, selection.to)}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    }
  }

  const setFontSize = (size: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const html = `<span style="font-size: ${size};">${editor.state.doc.textBetween(selection.from, selection.to)}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    }
  }

  // Layout Grid System
  const insertGridLayout = (columns: number) => {
    const columnWidth = `repeat(${columns}, 1fr)`
    const gridItems = Array.from({ length: columns }, (_, i) =>
      `<div style="padding: 16px; background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; min-height: 120px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
        <p>Column ${i + 1}<br/>Add content here...</p>
      </div>`
    ).join('')

    const html = `<div style="display: grid; grid-template-columns: ${columnWidth}; gap: 20px; margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
      ${gridItems}
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  const insertFlexLayout = (direction: 'row' | 'column') => {
    const html = `<div style="display: flex; flex-direction: ${direction}; gap: 16px; margin: 20px 0; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px;">
      <div style="flex: 1; padding: 16px; background-color: #f0f9ff; border-radius: 6px; min-height: 100px;">
        <h4 style="margin-top: 0;">Flex Item 1</h4>
        <p>Add content here...</p>
      </div>
      <div style="flex: 1; padding: 16px; background-color: #f0fdf4; border-radius: 6px; min-height: 100px;">
        <h4 style="margin-top: 0;">Flex Item 2</h4>
        <p>Add content here...</p>
      </div>
    </div>`
    editor.chain().focus().insertContent(html).run()
  }

  // Content Blocks Library
  const insertContentBlock = (blockType: string) => {
    const blocks = {
      testimonial: `
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <blockquote style="margin: 0 0 16px 0; font-size: 18px; font-style: italic; color: #374151;">
            "Add your testimonial quote here. This is a great way to showcase customer feedback and build trust."
          </blockquote>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
              JD
            </div>
            <div>
              <div style="font-weight: 600; color: #374151;">John Doe</div>
              <div style="font-size: 14px; color: #6b7280;">CEO, Company Name</div>
            </div>
          </div>
        </div>
      `,
      featureBox: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px;">
            ⭐
          </div>
          <h3 style="margin: 0 0 12px 0; font-size: 20px;">Feature Title</h3>
          <p style="margin: 0; opacity: 0.9; line-height: 1.6;">Describe your amazing feature here. Highlight the benefits and value it provides to your users.</p>
        </div>
      `,
      statsCard: `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e0e7ff;">
            <div style="font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">100+</div>
            <div style="color: #6b7280; font-size: 14px;">Students Trained</div>
          </div>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #dcfce7;">
            <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 8px;">95%</div>
            <div style="color: #6b7280; font-size: 14px;">Success Rate</div>
          </div>
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #fef3c7;">
            <div style="font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 8px;">50+</div>
            <div style="color: #6b7280; font-size: 14px;">Industry Partners</div>
          </div>
        </div>
      `,
      ctaSection: `
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <h2 style="margin: 0 0 16px 0; font-size: 28px;">Ready to Get Started?</h2>
          <p style="margin: 0 0 24px 0; font-size: 18px; opacity: 0.9;">Join thousands of students who have transformed their careers with our training programs.</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="#" style="background-color: white; color: #1e40af; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Enroll Now</a>
            <a href="#" style="background-color: transparent; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 2px solid white; display: inline-block;">Learn More</a>
          </div>
        </div>
      `
    }

    const block = blocks[blockType as keyof typeof blocks]
    if (block) {
      editor.chain().focus().insertContent(block).run()
    }
  }

  // Accessibility Checker
  const checkAccessibility = () => {
    const content = editor.getHTML()
    const issues: string[] = []

    // Check for images without alt text
    const imgRegex = /<img[^>]*>/g
    const images = content.match(imgRegex) || []
    images.forEach(img => {
      if (!img.includes('alt=') || img.includes('alt=""')) {
        issues.push('Image found without alt text - this affects screen reader users')
      }
    })

    // Check for proper heading hierarchy
    const headingRegex = /<h([1-6])[^>]*>/g
    const headings = content.match(headingRegex) || []
    const headingLevels = headings.map(h => parseInt(h.match(/h([1-6])/)?.[1] || '1'))
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i-1] + 1) {
        issues.push('Heading hierarchy issue - skipping heading levels affects navigation')
      }
    }

    // Check for color contrast (basic check for inline styles)
    if (content.includes('color:') && !content.includes('background')) {
      issues.push('Text color found without background - ensure sufficient contrast ratio')
    }

    // Check for links without descriptive text
    const linkRegex = /<a[^>]*>([^<]*)<\/a>/g
    const links = content.match(linkRegex) || []
    links.forEach(link => {
      const linkText = link.match(/>([^<]*)</)?.[1] || ''
      if (linkText.toLowerCase().includes('click here') || linkText.toLowerCase().includes('read more') || linkText.length < 4) {
        issues.push('Link with non-descriptive text found - use descriptive link text')
      }
    })

    // Display results
    if (issues.length === 0) {
      alert('✅ No accessibility issues found! Your content follows WCAG guidelines.')
    } else {
      alert(`⚠️ Accessibility Issues Found:\n\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n\n')}\n\nPlease review and fix these issues to improve accessibility.`)
    }
  }

  // Media Gallery Functions (moved to top to avoid hooks order issues)
  const uploadMediaFile = async (file: File) => {
    setUploadingMedia(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const uploadedFile = await response.json()
        setMediaFiles(prev => [uploadedFile, ...prev])
        return uploadedFile
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
      return null
    } finally {
      setUploadingMedia(false)
    }
  }

  const insertMediaFromGallery = (mediaFile: any) => {
    const html = `<figure style="margin: 20px 0; text-align: center;">
      <img src="${mediaFile.url}" alt="${mediaFile.alt || mediaFile.filename}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
      ${mediaFile.caption ? `<figcaption style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">${mediaFile.caption}</figcaption>` : ''}
    </figure>`
    editor.chain().focus().insertContent(html).run()
    setShowMediaGallery(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        await uploadMediaFile(file)
      } else {
        alert(`${file.name} is not an image file. Only images are supported.`)
      }
    }
  }

  // Custom CSS Functions
  const applyCustomClass = (className: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const selectedText = editor.state.doc.textBetween(selection.from, selection.to)
      const html = `<span class="${className}">${selectedText}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    } else {
      // If no selection, wrap the current node
      const html = `<div class="${className}">Add content here...</div>`
      editor.chain().focus().insertContent(html).run()
    }
  }

  const applyCustomStyle = (styles: string) => {
    const selection = editor.state.selection
    if (!selection.empty) {
      const selectedText = editor.state.doc.textBetween(selection.from, selection.to)
      const html = `<span style="${styles}">${selectedText}</span>`
      editor.chain().focus().deleteSelection().insertContent(html).run()
    } else {
      const html = `<div style="${styles}">Add content here...</div>`
      editor.chain().focus().insertContent(html).run()
    }
  }

  const insertCustomHTML = (htmlCode: string) => {
    try {
      // Basic validation to prevent malicious code
      const sanitizedHTML = htmlCode
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')

      editor.chain().focus().insertContent(sanitizedHTML).run()
    } catch (error) {
      alert('Invalid HTML code. Please check your syntax.')
    }
  }

  const predefinedClasses = [
    { name: 'Highlight Box', class: 'bg-yellow-100 border-l-4 border-yellow-500 p-4 my-4' },
    { name: 'Info Box', class: 'bg-blue-100 border-l-4 border-blue-500 p-4 my-4' },
    { name: 'Success Box', class: 'bg-green-100 border-l-4 border-green-500 p-4 my-4' },
    { name: 'Warning Box', class: 'bg-orange-100 border-l-4 border-orange-500 p-4 my-4' },
    { name: 'Error Box', class: 'bg-red-100 border-l-4 border-red-500 p-4 my-4' },
    { name: 'Card', class: 'bg-white shadow-lg rounded-lg p-6 my-4' },
    { name: 'Centered Text', class: 'text-center' },
    { name: 'Large Text', class: 'text-xl font-semibold' },
    { name: 'Small Text', class: 'text-sm text-gray-600' },
    { name: 'Rounded Image', class: 'rounded-full' }
  ]

  // Enhanced History Functions (moved to avoid duplication)
  const restoreFromHistory = (historyEntry: any) => {
    editor.commands.setContent(historyEntry.content)
    setShowHistoryPanel(false)
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setContentHistory([])
      setCurrentHistoryIndex(-1)
    }
  }

  // Predefined color palette
  const colorPalette = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6600', '#ffcc00', '#33cc33', '#0066cc', '#6600cc',
    '#ff3366', '#ff9933', '#ffff33', '#66ff66', '#3399ff', '#9966ff',
    '#cc0000', '#cc6600', '#cccc00', '#00cc00', '#0000cc', '#6600cc'
  ]

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="flex flex-wrap gap-1">
        {/* Content Templates */}
        <div className="toolbar-section">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowTemplatesDropdown(!showTemplatesDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showTemplatesDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Template"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">Templates</span>
            </button>
            {showTemplatesDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[160px]">
                <button
                  onClick={() => {
                    insertTemplate('about-page')
                    setShowTemplatesDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  About Page
                </button>
                <button
                  onClick={() => {
                    insertTemplate('course-page')
                    setShowTemplatesDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Course Page
                </button>
                <button
                  onClick={() => {
                    insertTemplate('news-article')
                    setShowTemplatesDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  News Article
                </button>
                <button
                  onClick={() => {
                    insertTemplate('contact-page')
                    setShowTemplatesDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Contact Page
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Formatting */}
        <div className="toolbar-section">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${
              editor.isActive('bold') ? 'active' : ''
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-gray-300' : ''
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('strike') ? 'bg-gray-300' : ''
            }`}
            title="Strikethrough"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('underline') ? 'bg-gray-300' : ''
            }`}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('subscript') ? 'bg-gray-300' : ''
            }`}
            title="Subscript"
          >
            <SubscriptIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('superscript') ? 'bg-gray-300' : ''
            }`}
            title="Superscript"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Color and Highlighting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
              title="Text Color"
            >
              <Type className="h-4 w-4" />
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: currentTextColor }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentTextColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                editor.isActive('highlight') ? 'bg-gray-300' : ''
              }`}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: currentHighlightColor }}
              />
            </button>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => setHighlightColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentHighlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Font Controls */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <select
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 text-sm"
            title="Font Family"
          >
            <option value="">Default Font</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
          </select>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value)
              if (level === 0) {
                editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
              }
            }}
            className="px-2 py-1 rounded border border-gray-300 text-sm"
            value={
              editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
              editor.isActive('heading', { level: 3 }) ? 3 : 0
            }
          >
            <option value={0}>Paragraph</option>
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('blockquote') ? 'bg-gray-300' : ''
            }`}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced Typography */}
        <div className="toolbar-section">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowTypographyDropdown(!showTypographyDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showTypographyDropdown ? 'bg-gray-200' : ''
              }`}
              title="Typography Controls"
            >
              <AlignLeft className="h-4 w-4" />
              <span className="text-xs">Typography</span>
            </button>
            {showTypographyDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-3 min-w-[200px]">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Font Size</label>
                    <select
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Default</option>
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                      <option value="32px">32px</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Line Height</label>
                    <select
                      onChange={(e) => setLineHeight(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Default</option>
                      <option value="1.2">1.2 (Tight)</option>
                      <option value="1.4">1.4 (Snug)</option>
                      <option value="1.6">1.6 (Normal)</option>
                      <option value="1.8">1.8 (Relaxed)</option>
                      <option value="2.0">2.0 (Loose)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Letter Spacing</label>
                    <select
                      onChange={(e) => setLetterSpacing(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Default</option>
                      <option value="-0.05em">Tighter</option>
                      <option value="-0.025em">Tight</option>
                      <option value="0.025em">Wide</option>
                      <option value="0.05em">Wider</option>
                      <option value="0.1em">Widest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Text Shadow</label>
                    <select
                      onChange={(e) => setTextShadow(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">None</option>
                      <option value="1px 1px 2px rgba(0,0,0,0.3)">Subtle</option>
                      <option value="2px 2px 4px rgba(0,0,0,0.5)">Medium</option>
                      <option value="3px 3px 6px rgba(0,0,0,0.7)">Strong</option>
                      <option value="0 0 10px rgba(59,130,246,0.8)">Blue Glow</option>
                      <option value="0 0 10px rgba(16,185,129,0.8)">Green Glow</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowLinkDropdown(!showLinkDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showLinkDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="text-xs">Link</span>
            </button>
            {showLinkDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    addLink()
                    setShowLinkDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Simple Link
                </button>
                <button
                  onClick={() => {
                    addAdvancedLink()
                    setShowLinkDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Advanced Link
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowImageDropdown(!showImageDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showImageDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs">Image</span>
            </button>
            {showImageDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[160px]">
                <button
                  onClick={() => {
                    setShowMediaGallery(true)
                    setShowImageDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded flex items-center gap-2"
                >
                  <FolderOpen className="h-3 w-3" /> Media Gallery
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    addImage()
                    setShowImageDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  URL Image
                </button>
                <button
                  onClick={() => {
                    addImageWithCaption()
                    setShowImageDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  URL with Caption
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowTableDropdown(!showTableDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showTableDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
              <span className="text-xs">Table</span>
            </button>
            {showTableDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    addTable()
                    setShowTableDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Basic Table
                </button>
                <button
                  onClick={() => {
                    addCustomTable()
                    setShowTableDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Custom Size
                </button>
                <button
                  onClick={() => {
                    addStyledTable()
                    setShowTableDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Styled Table
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Controls - Show only when in table */}
        {editor.isActive('table') && (
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={addTableRow}
              className="p-2 rounded hover:bg-gray-200 text-xs"
              title="Add Row"
            >
              +R
            </button>
            <button
              onClick={addTableColumn}
              className="p-2 rounded hover:bg-gray-200 text-xs"
              title="Add Column"
            >
              +C
            </button>
            <button
              onClick={deleteTableRow}
              className="p-2 rounded hover:bg-gray-200 text-xs text-red-600"
              title="Delete Row"
            >
              -R
            </button>
            <button
              onClick={deleteTableColumn}
              className="p-2 rounded hover:bg-gray-200 text-xs text-red-600"
              title="Delete Column"
            >
              -C
            </button>
            <button
              onClick={deleteTable}
              className="p-2 rounded hover:bg-gray-200 text-xs text-red-600"
              title="Delete Table"
            >
              ×T
            </button>
          </div>
        )}

        {/* Design Elements */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowBoxDropdown(!showBoxDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showBoxDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Colored Box"
            >
              <Square className="h-4 w-4" />
              <span className="text-xs">Box</span>
            </button>
            {showBoxDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {colorPalette.slice(0, 16).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        insertColoredBox(color)
                        setShowBoxDropdown(false)
                      }}
                      className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`Insert ${color} box`}
                    />
                  ))}
                </div>
                <div className="border-t pt-2 space-y-1">
                  <button
                    onClick={() => {
                      insertTextBox()
                      setShowBoxDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Text Box
                  </button>
                  <button
                    onClick={() => {
                      insertTwoColumnLayout()
                      setShowBoxDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Two Columns
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowCalloutDropdown(!showCalloutDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showCalloutDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Callout"
            >
              <Circle className="h-4 w-4" />
              <span className="text-xs">Alert</span>
            </button>
            {showCalloutDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    insertCalloutBox('info')
                    setShowCalloutDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded flex items-center gap-2"
                >
                  <span>ℹ️</span> Info
                </button>
                <button
                  onClick={() => {
                    insertCalloutBox('warning')
                    setShowCalloutDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-yellow-50 rounded flex items-center gap-2"
                >
                  <span>⚠️</span> Warning
                </button>
                <button
                  onClick={() => {
                    insertCalloutBox('success')
                    setShowCalloutDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-green-50 rounded flex items-center gap-2"
                >
                  <span>✅</span> Success
                </button>
                <button
                  onClick={() => {
                    insertCalloutBox('error')
                    setShowCalloutDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-red-50 rounded flex items-center gap-2"
                >
                  <span>❌</span> Error
                </button>
              </div>
            )}
          </div>

          <button
            onClick={insertQuoteBox}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>

        {/* Visual Design Tools */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowShapeDropdown(!showShapeDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showShapeDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Shape"
            >
              <Circle className="h-4 w-4" />
              <span className="text-xs">Shape</span>
            </button>
            {showShapeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    insertShape('rectangle')
                    setShowShapeDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Square className="h-3 w-3" /> Rectangle
                </button>
                <button
                  onClick={() => {
                    insertShape('circle')
                    setShowShapeDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Circle className="h-3 w-3" /> Circle
                </button>
                <button
                  onClick={() => {
                    insertShape('arrow')
                    setShowShapeDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <ArrowRight className="h-3 w-3" /> Arrow
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowSpacerDropdown(!showSpacerDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showSpacerDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Spacer"
            >
              <GripHorizontal className="h-4 w-4" />
              <span className="text-xs">Space</span>
            </button>
            {showSpacerDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    insertSpacer('20px')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Small (20px)
                </button>
                <button
                  onClick={() => {
                    insertSpacer('40px')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Medium (40px)
                </button>
                <button
                  onClick={() => {
                    insertSpacer('80px')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Large (80px)
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    insertDivider('solid')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Solid Line
                </button>
                <button
                  onClick={() => {
                    insertDivider('dashed')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Dashed Line
                </button>
                <button
                  onClick={() => {
                    insertDivider('dotted')
                    setShowSpacerDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Dotted Line
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowButtonDropdown(!showButtonDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showButtonDropdown ? 'bg-gray-200' : ''
              }`}
              title="Insert Button"
            >
              <MousePointer className="h-4 w-4" />
              <span className="text-xs">Button</span>
            </button>
            {showButtonDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[120px]">
                <button
                  onClick={() => {
                    insertButton('primary')
                    setShowButtonDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded"
                >
                  Primary
                </button>
                <button
                  onClick={() => {
                    insertButton('secondary')
                    setShowButtonDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Secondary
                </button>
                <button
                  onClick={() => {
                    insertButton('outline')
                    setShowButtonDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Outline
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Layout & Content Blocks */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowLayoutDropdown(!showLayoutDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showLayoutDropdown ? 'bg-gray-200' : ''
              }`}
              title="Layout & Blocks"
            >
              <Layout className="h-4 w-4" />
              <span className="text-xs">Layout</span>
            </button>
            {showLayoutDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[160px]">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">Grid Layouts</div>
                  <button
                    onClick={() => {
                      insertGridLayout(2)
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Grid3X3 className="h-3 w-3" /> 2 Columns
                  </button>
                  <button
                    onClick={() => {
                      insertGridLayout(3)
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Grid3X3 className="h-3 w-3" /> 3 Columns
                  </button>
                  <button
                    onClick={() => {
                      insertGridLayout(4)
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Grid3X3 className="h-3 w-3" /> 4 Columns
                  </button>

                  <hr className="my-1" />
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">Flex Layouts</div>
                  <button
                    onClick={() => {
                      insertFlexLayout('row')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Columns2 className="h-3 w-3" /> Horizontal
                  </button>
                  <button
                    onClick={() => {
                      insertFlexLayout('column')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Columns2 className="h-3 w-3 rotate-90" /> Vertical
                  </button>

                  <hr className="my-1" />
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">Content Blocks</div>
                  <button
                    onClick={() => {
                      insertContentBlock('testimonial')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Testimonial
                  </button>
                  <button
                    onClick={() => {
                      insertContentBlock('featureBox')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Feature Box
                  </button>
                  <button
                    onClick={() => {
                      insertContentBlock('statsCard')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Stats Cards
                  </button>
                  <button
                    onClick={() => {
                      insertContentBlock('ctaSection')
                      setShowLayoutDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    CTA Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export & Tools */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <div className="relative">
            <button
              onClick={() => {
                closeAllDropdowns()
                setShowExportDropdown(!showExportDropdown)
              }}
              className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
                showExportDropdown ? 'bg-gray-200' : ''
              }`}
              title="Export & Tools"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">Export</span>
            </button>
            {showExportDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 min-w-[140px]">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">Export As</div>
                  <button
                    onClick={() => {
                      exportContent('html')
                      setShowExportDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    HTML File
                  </button>
                  <button
                    onClick={() => {
                      exportContent('markdown')
                      setShowExportDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => {
                      exportContent('text')
                      setShowExportDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Plain Text
                  </button>

                  <hr className="my-1" />
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">Tools</div>
                  <button
                    onClick={() => {
                      checkAccessibility()
                      setShowExportDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Shield className="h-3 w-3" /> Check Accessibility
                  </button>
                  <button
                    onClick={() => {
                      setShowCSSPanel(true)
                      setShowExportDropdown(false)
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Code className="h-3 w-3" /> Custom CSS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Horizontal Scroll Controls */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Scroll Left"
              aria-label="Scroll editor content left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Scroll Right"
              aria-label="Scroll editor content right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Undo/Redo & History */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
            <button
              onClick={createSnapshot}
              className="p-2 rounded hover:bg-gray-200"
              title="Create Snapshot"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowHistoryPanel(true)}
              className="p-2 rounded hover:bg-gray-200"
              title="View History"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Controls */}
        {showPreview && (
          <div className="flex gap-1 border-l border-gray-300 pl-2">
            <button
              onClick={() => {
                setIsPreviewMode(!isPreviewMode)
                setIsSplitView(false)
              }}
              className={`p-2 rounded hover:bg-gray-200 ${
                isPreviewMode && !isSplitView ? 'bg-blue-100 text-blue-600' : ''
              }`}
              title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            >
              {isPreviewMode && !isSplitView ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                setIsSplitView(!isSplitView)
                setIsPreviewMode(false)
              }}
              className={`p-2 rounded hover:bg-gray-200 ${
                isSplitView ? 'bg-blue-100 text-blue-600' : ''
              }`}
              title="Split View"
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        {isSplitView ? (
          <div className="flex h-[500px]">
            {/* Editor Side */}
            <div className="flex-1 border-r border-gray-300">
              <div
                ref={editorContainerRef}
                className="h-full overflow-x-auto overflow-y-auto editor-scroll-container"
                style={{ scrollbarWidth: 'thin' }}
              >
                <EditorContent
                  editor={editor}
                  placeholder={placeholder}
                  className="h-full min-w-full"
                />
              </div>
            </div>
            {/* Preview Side */}
            <div className="flex-1">
              <div className="h-full overflow-y-auto p-4 bg-gray-50">
                <div className="prose prose-sm max-w-none prose-table:text-sm">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </div>
            </div>
          </div>
        ) : isPreviewMode ? (
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-4 min-h-[300px] prose-table:text-sm">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div
            ref={editorContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[600px] editor-scroll-container"
            style={{ scrollbarWidth: 'thin' }}
          >
            <EditorContent
              editor={editor}
              placeholder={placeholder}
              className="min-w-full"
            />
          </div>
        )}
      </div>

      {/* Media Gallery Modal */}
      {showMediaGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Media Gallery</h3>
              <button
                onClick={() => setShowMediaGallery(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Upload Section */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadingMedia && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Uploading...
                  </div>
                )}
              </div>
            </div>

            {/* Media Grid */}
            <div className="p-4 overflow-y-auto max-h-96">
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No media files found. Upload some images to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => insertMediaFromGallery(file)}
                    >
                      <div className="aspect-square">
                        <img
                          src={file.url}
                          alt={file.alt || file.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-full p-2">
                            <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs truncate">{file.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{mediaFiles.length} files available</span>
                <button
                  onClick={() => setShowMediaGallery(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS Panel */}
      {showCSSPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Custom CSS & Styling</h3>
              <button
                onClick={() => setShowCSSPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-96">
              {/* Predefined Classes */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Styles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedClasses.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        applyCustomClass(item.class)
                        setShowCSSPanel(false)
                      }}
                      className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Class Input */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom CSS Class</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter CSS class name (e.g., my-custom-class)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          applyCustomClass(input.value.trim())
                          input.value = ''
                          setShowCSSPanel(false)
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        applyCustomClass(input.value.trim())
                        input.value = ''
                        setShowCSSPanel(false)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Custom Style Input */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Inline Styles</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter CSS styles (e.g., color: red; font-size: 18px;)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          applyCustomStyle(input.value.trim())
                          input.value = ''
                          setShowCSSPanel(false)
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        applyCustomStyle(input.value.trim())
                        input.value = ''
                        setShowCSSPanel(false)
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Custom HTML Input */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom HTML</h4>
                <textarea
                  placeholder="Enter custom HTML code..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (customCSS.trim()) {
                        insertCustomHTML(customCSS)
                        setCustomCSS('')
                        setShowCSSPanel(false)
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Insert HTML
                  </button>
                  <button
                    onClick={() => setCustomCSS('')}
                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>⚠️ Advanced feature - use with caution</span>
                <button
                  onClick={() => setShowCSSPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistoryPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Content History</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="p-4 overflow-y-auto max-h-96">
              {contentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No history available. Start editing to create history entries.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contentHistory.slice().reverse().map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => restoreFromHistory(entry)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {entry.description}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.timestamp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {entry.content.length} characters
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            restoreFromHistory(entry)
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{contentHistory.length} history entries</span>
                <div className="flex gap-2">
                  <button
                    onClick={createSnapshot}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Create Snapshot
                  </button>
                  <button
                    onClick={() => setShowHistoryPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
