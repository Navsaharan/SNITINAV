export const PUCK_PAGE_PREFIX = '<!--snitinav-puck-page:v1-->\n'
export const STORYBLOK_PAGE_PREFIX = '<!--snitinav-storyblok-page:v1-->'

export function makeStoryblokPageReference(slug: string): string {
  return `${STORYBLOK_PAGE_PREFIX}${encodeURIComponent(slug)}`
}

export function parseStoryblokPageReference(value?: string | null): string | null {
  if (!value?.startsWith(STORYBLOK_PAGE_PREFIX)) return null
  try {
    const slug = decodeURIComponent(value.slice(STORYBLOK_PAGE_PREFIX.length))
    return /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(slug) ? slug : null
  } catch {
    return null
  }
}

export function parsePuckPageContent(value?: string | null): Record<string, unknown> | null {
  if (!value?.startsWith(PUCK_PAGE_PREFIX)) return null
  try {
    const parsed = JSON.parse(value.slice(PUCK_PAGE_PREFIX.length)) as unknown
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

export function serializePuckPageContent(value: Record<string, unknown>): string {
  return `${PUCK_PAGE_PREFIX}${JSON.stringify(value)}`
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const safeHref = (value: unknown) => {
  const url = String(value ?? '').trim()
  return /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : '#'
}

function renderTiptapNode(node: any): string {
  if (typeof node === 'string') return /<\/?[a-z][\s\S]*>/i.test(node) ? node : `<p>${escapeHtml(node)}</p>`
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') {
    let html = escapeHtml(node.text)
    for (const mark of node.marks || []) {
      switch (mark.type) {
        case 'bold': html = `<strong>${html}</strong>`; break
        case 'italic': html = `<em>${html}</em>`; break
        case 'underline': html = `<u>${html}</u>`; break
        case 'strike': html = `<s>${html}</s>`; break
        case 'code': html = `<code>${html}</code>`; break
        case 'link': html = `<a href="${escapeHtml(safeHref(mark.attrs?.href))}" rel="noopener noreferrer">${html}</a>`; break
      }
    }
    return html
  }
  const children = Array.isArray(node.content) ? node.content.map(renderTiptapNode).join('') : ''
  switch (node.type) {
    case 'doc': return children
    case 'paragraph': return `<p>${children}</p>`
    case 'heading': { const level = Math.max(1, Math.min(6, Number(node.attrs?.level) || 2)); return `<h${level}>${children}</h${level}>` }
    case 'blockquote': return `<blockquote>${children}</blockquote>`
    case 'bulletList': return `<ul>${children}</ul>`
    case 'orderedList': return `<ol>${children}</ol>`
    case 'listItem': return `<li>${children}</li>`
    case 'hardBreak': return '<br>'
    case 'horizontalRule': return '<hr>'
    case 'codeBlock': return `<pre><code>${children || escapeHtml(node.textContent)}</code></pre>`
    case 'table': return `<table><tbody>${children}</tbody></table>`
    case 'tableRow': return `<tr>${children}</tr>`
    case 'tableHeader': return `<th>${children}</th>`
    case 'tableCell': return `<td>${children}</td>`
    case 'image': return `<img src="${escapeHtml(safeHref(node.attrs?.src))}" alt="${escapeHtml(node.attrs?.alt)}">`
    default: return children
  }
}

export function puckPageContentToHtml(value?: string | null): string | null {
  const data = parsePuckPageContent(value)
  if (!data) return null
  const rootProps = (data.root as any)?.props || {}
  const blocks = Array.isArray(data.content) ? data.content : []
  const body = blocks.map((block: any) => {
    const props = block?.props || {}
    switch (block?.type) {
      case 'Heading': {
        const level = ['h2', 'h3', 'h4'].includes(props.level) ? props.level : 'h2'
        return `<${level}>${escapeHtml(props.text)}</${level}>`
      }
      case 'RichText': return renderTiptapNode(props.body)
      case 'Html': return String(props.html || '')
      case 'Image': return props.src ? `<figure><img src="${escapeHtml(safeHref(props.src))}" alt="${escapeHtml(props.alt)}">${props.caption ? `<figcaption>${escapeHtml(props.caption)}</figcaption>` : ''}</figure>` : ''
      case 'Button': return `<p><a href="${escapeHtml(safeHref(props.url))}">${escapeHtml(props.label)}</a></p>`
      default: return ''
    }
  }).join('\n')
  const title = rootProps.pageTitle ? `<h2>${escapeHtml(rootProps.pageTitle)}</h2>` : ''
  return `${title}${body}`
}
