import { describe, expect, it } from '@jest/globals'
import {
  makeStoryblokPageReference,
  parsePuckPageContent,
  parseStoryblokPageReference,
  puckPageContentToHtml,
  serializePuckPageContent,
} from './page-editor-content'

describe('editor page content formats', () => {
  it('keeps legacy HTML outside the Puck envelope', () => {
    const legacy = '<h2>Existing page</h2><p>Keep this content.</p>'
    expect(parsePuckPageContent(legacy)).toBeNull()
    expect(puckPageContentToHtml(legacy)).toBeNull()
  })

  it('round-trips a Puck document in the existing string field', () => {
    const data = { root: { props: { pageTitle: 'About' } }, content: [{ type: 'Heading', props: { text: 'Our school', level: 'h3' } }] }
    const stored = serializePuckPageContent(data)
    expect(parsePuckPageContent(stored)).toEqual(data)
    expect(puckPageContentToHtml(stored)).toBe('<h2>About</h2><h3>Our school</h3>')
  })

  it('converts common Puck rich-text marks and neutralizes unsafe link schemes when switching editors', () => {
    const stored = serializePuckPageContent({
      root: { props: {} },
      content: [{
        type: 'RichText',
        props: { body: { type: 'doc', content: [{ type: 'paragraph', content: [
          { type: 'text', text: '<welcome>', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' click', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
        ] }] } },
      }],
    })
    expect(puckPageContentToHtml(stored)).toBe('<p><strong>&lt;welcome&gt;</strong><a href="#" rel="noopener noreferrer"> click</a></p>')
  })

  it('encodes and validates Storyblok references', () => {
    const reference = makeStoryblokPageReference('about/our-school')
    expect(parseStoryblokPageReference(reference)).toBe('about/our-school')
    expect(parseStoryblokPageReference('<!--snitinav-storyblok-page:v1-->https://evil.example')).toBeNull()
    expect(parseStoryblokPageReference('<p>legacy</p>')).toBeNull()
  })
})
