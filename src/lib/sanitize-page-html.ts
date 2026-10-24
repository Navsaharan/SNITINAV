import sanitizeHtml from 'sanitize-html'

const allowedTags = Array.from(new Set([
  ...sanitizeHtml.defaults.allowedTags,
  'img', 'figure', 'figcaption', 'picture', 'source', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'hr', 'pre', 'code', 'u', 's', 'del', 'ins', 'sup', 'sub', 'section', 'div', 'span', 'iframe', 'video',
]))

const safeColor = /^(#[0-9a-f]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|(black|white|red|green|blue|yellow|orange|purple|gray|grey|transparent))$/i
const safeLength = /^\d+(\.\d+)?(px|%|em|rem|vh|vw)$/

export function sanitizePageHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      source: ['src', 'type'],
      video: ['src', 'controls', 'width', 'height', 'poster'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy'],
      td: ['colspan', 'rowspan', 'headers'],
      th: ['colspan', 'rowspan', 'scope', 'headers'],
      ol: ['start', 'reversed'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { iframe: ['https'], img: ['http', 'https'], source: ['http', 'https'], video: ['http', 'https'] },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    allowedStyles: {
      '*': {
        color: [safeColor],
        'background-color': [safeColor],
        'text-align': [/^(left|right|center|justify)$/],
        'font-weight': [/^(normal|bold|[1-9]00)$/],
        'font-style': [/^(normal|italic)$/],
        'text-decoration': [/^(none|underline|line-through)$/],
        'font-size': [safeLength],
        padding: [safeLength],
        margin: [safeLength],
        width: [safeLength],
        height: [safeLength],
        'max-width': [safeLength],
        'border-radius': [safeLength],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
}
