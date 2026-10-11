'use client'

import { useMemo } from 'react'
import { Puck } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { parsePuckPageContent, serializePuckPageContent } from '@/lib/page-editor-content'
import { pageBuilderConfig } from '@/lib/puck-page-config'

interface Props {
  content: string
  onChange: (value: string) => void
  onPersist?: (value: string) => Promise<void>
}

export default function PuckEditorAdapter({ content, onChange, onPersist }: Props) {
  const data = useMemo(() => {
    const saved = parsePuckPageContent(content)
    if (saved) return saved as never
    return {
      root: { props: { pageTitle: '' } },
      content: content.trim()
        ? [{ type: 'Html', props: { id: 'legacy-html', html: content } }]
        : [{ type: 'Heading', props: { id: 'default-heading', text: 'Welcome', level: 'h2' } }],
      zones: {},
    } as never
  // Puck's data prop is initial-only by design; the keyed adapter remounts for a new page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const serialize = (next: unknown) => serializePuckPageContent(next as Record<string, unknown>)
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b bg-blue-50 px-4 py-2 text-sm text-blue-900">
        Puck visual builder · arrange blocks, edit rich text and preview responsive layouts. Publish saves to this page’s existing database record.
      </div>
      <div className="min-h-[650px]">
        <Puck
          config={pageBuilderConfig}
          data={data}
          height={650}
          headerTitle="Edit page"
          onChange={(next) => onChange(serialize(next))}
          onPublish={async (next) => {
            const value = serialize(next)
            onChange(value)
            if (onPersist) await onPersist(value)
          }}
        />
      </div>
    </div>
  )
}
