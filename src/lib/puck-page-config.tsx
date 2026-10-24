import type { ReactNode } from 'react'
import type { Config } from '@puckeditor/core'
import { sanitizePageHtml } from '@/lib/sanitize-page-html'

type PageBuilderProps = {
  Heading: { text: string; level: string }
  RichText: { body: unknown }
  Html: { html: string }
  Image: { src: string; alt: string; caption: string }
  Button: { label: string; url: string }
}

const safeUrl = (value: string) => /^(https?:|mailto:|tel:|\/|#)/i.test(value || '') ? value : '#'

export const pageBuilderConfig: Config<PageBuilderProps> = {
  root: {
    fields: { pageTitle: { type: 'text', label: 'Section title' } },
    defaultProps: { pageTitle: '' },
    render: ({ children, pageTitle }) => (
      <section className="space-y-6">
        {pageTitle ? <h2 className="text-2xl font-bold">{pageTitle}</h2> : null}
        {children}
      </section>
    ),
  },
  components: {
    Heading: {
      label: 'Heading',
      fields: {
        text: { type: 'text', label: 'Heading text' },
        level: {
          type: 'select', label: 'Level',
          options: [
            { label: 'Heading 2', value: 'h2' },
            { label: 'Heading 3', value: 'h3' },
            { label: 'Heading 4', value: 'h4' },
          ],
        },
      },
      defaultProps: { text: 'Section heading', level: 'h2' },
      render: ({ text, level }) => {
        const Tag = level as 'h2' | 'h3' | 'h4'
        return <Tag className="font-bold">{text}</Tag>
      },
    },
    RichText: {
      label: 'Rich text',
      fields: { body: { type: 'richtext' } },
      defaultProps: { body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Add your content here.' }] }] } },
      render: ({ body }) => <div className="prose max-w-none">{body as ReactNode}</div>,
    },
    Html: {
      label: 'Legacy HTML (preserve existing content)',
      fields: { html: { type: 'textarea', label: 'HTML content' } },
      defaultProps: { html: '<p>Existing content</p>' },
      render: ({ html }) => <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizePageHtml(html) }} />,
    },
    Image: {
      label: 'Image',
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text', label: 'Alternative text' },
        caption: { type: 'text', label: 'Caption' },
      },
      defaultProps: { src: '', alt: '', caption: '' },
      render: ({ src, alt, caption }) => src ? (
        <figure className="my-6">
          <img src={safeUrl(src)} alt={alt || ''} className="h-auto max-w-full rounded-lg" />
          {caption ? <figcaption className="mt-2 text-center text-sm text-gray-600">{caption}</figcaption> : null}
        </figure>
      ) : <></>,
    },
    Button: {
      label: 'Link button',
      fields: { label: { type: 'text', label: 'Button text' }, url: { type: 'text', label: 'Destination URL' } },
      defaultProps: { label: 'Learn more', url: '/' },
      render: ({ label, url }) => <a href={safeUrl(url)} className="inline-block rounded bg-blue-700 px-4 py-2 text-white">{label}</a>,
    },
  },
}
