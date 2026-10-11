import sanitizeHtml from 'sanitize-html'

const allowedTags = Array.from(new Set([
  ...sanitizeHtml.defaults.allowedTags,
  'img', 'figure', 'figcaption', 'picture', 'source', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'hr', 'pre', 'code', 'u', 's', 'del', 'ins', 'sup', 'sub', 'section', 'div', 'span', 'iframe', 'video',
]))

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
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([0-9.,%\s]+\)$/i],
        'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([0-9.,%\s]+\)$/i],
        'text-align': [/^(left|right|center|justify)$/],
        'font-weight': [/^(normal|bold|[1-9]00)$/],
        'font-style': [/^(normal|italic)$/],
        'text-decoration': [/^(none|underline|line-through)$/],
        width: [/^\d+(\.\d+)?(px|%|em|rem)$/],
        height: [/^\d+(\.\d+)?(px|%|em|rem)$/],
        'max-width': [/^\d+(\.\d+)?(px|%|em|rem)$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
}
