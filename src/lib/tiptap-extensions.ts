import { Extension, Node } from '@tiptap/core'

// Comprehensive extension to preserve all HTML attributes and prevent content cleaning
export const PreserveAttributes = Extension.create({
  name: 'preserveAttributes',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem',
          'bulletList', 'orderedList', 'textStyle',
          'image', 'link', 'table', 'tableRow', 'tableCell', 'tableHeader'
        ],
        attributes: {
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          id: {
            default: null,
            parseHTML: element => element.getAttribute('id'),
            renderHTML: attributes => {
              if (!attributes.id) {
                return {}
              }
              return {
                id: attributes.id,
              }
            },
          },
          'data-*': {
            default: null,
            parseHTML: element => {
              const dataAttrs = {}
              Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                  dataAttrs[attr.name] = attr.value
                }
              })
              return Object.keys(dataAttrs).length > 0 ? dataAttrs : null
            },
            renderHTML: attributes => {
              if (!attributes['data-*']) {
                return {}
              }
              return attributes['data-*']
            },
          },
        },
      },
    ]
  },
})

// Custom div node to handle styled containers
export const CustomDiv = Node.create({
  name: 'customDiv',
  group: 'block',
  content: 'block*',

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) {
            return {}
          }
          return {
            class: attributes.class,
          }
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
          }
        },
      },
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            id: attributes.id,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: element => {
          // Only parse divs that have styling or classes
          const hasClass = element.getAttribute('class')
          const hasStyle = element.getAttribute('style')
          const hasId = element.getAttribute('id')
          return hasClass || hasStyle || hasId ? {} : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
})

// Custom span node for inline styled elements
export const CustomSpan = Node.create({
  name: 'customSpan',
  group: 'inline',
  inline: true,
  content: 'text*',

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) {
            return {}
          }
          return {
            class: attributes.class,
          }
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
          }
        },
      },
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            id: attributes.id,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          // Parse spans that have styling, classes, or specific attributes
          const hasClass = element.getAttribute('class')
          const hasStyle = element.getAttribute('style')
          const hasId = element.getAttribute('id')
          return hasClass || hasStyle || hasId ? {} : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
})

// Enhanced content preservation extension
export const ContentPreservation = Extension.create({
  name: 'contentPreservation',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
        },
      },
    ]
  },

  // Prevent automatic content cleaning
  addProseMirrorPlugins() {
    return []
  },
})

// Extension to preserve unknown HTML elements (excluding text nodes)
export const PreserveUnknownElements = Extension.create({
  name: 'preserveUnknownElements',

  addGlobalAttributes() {
    return [
      {
        // Apply to all node types except text nodes
        types: [
          'paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem',
          'bulletList', 'orderedList', 'textStyle', 'customDiv', 'customSpan',
          'image', 'link', 'table', 'tableRow', 'tableCell', 'tableHeader'
        ],
        attributes: {
          // Preserve additional HTML attributes
          'data-preserve': {
            default: null,
            parseHTML: element => {
              // Store additional attributes as JSON (excluding standard ones)
              const attrs = {}
              const standardAttrs = ['class', 'style', 'id']
              Array.from(element.attributes).forEach(attr => {
                if (!standardAttrs.includes(attr.name) && attr.name.startsWith('data-')) {
                  attrs[attr.name] = attr.value
                }
              })
              return Object.keys(attrs).length > 0 ? JSON.stringify(attrs) : null
            },
            renderHTML: attributes => {
              if (!attributes['data-preserve']) {
                return {}
              }
              try {
                return JSON.parse(attributes['data-preserve'])
              } catch {
                return {}
              }
            },
          },
        },
      },
    ]
  },
})

// Text formatting preservation through wrapper elements
export const TextFormatPreservation = Extension.create({
  name: 'textFormatPreservation',

  addGlobalAttributes() {
    return [
      {
        // Apply to inline formatting elements that can wrap text
        types: ['textStyle', 'bold', 'italic', 'strike', 'underline', 'code'],
        attributes: {
          'data-format': {
            default: null,
            parseHTML: element => {
              // Preserve formatting-specific attributes
              const formatAttrs = {}
              const formatAttributes = ['color', 'background-color', 'font-family', 'font-size', 'font-weight']

              formatAttributes.forEach(attr => {
                const value = element.style.getPropertyValue(attr) || element.getAttribute(attr)
                if (value) {
                  formatAttrs[attr] = value
                }
              })

              return Object.keys(formatAttrs).length > 0 ? JSON.stringify(formatAttrs) : null
            },
            renderHTML: attributes => {
              if (!attributes['data-format']) {
                return {}
              }
              try {
                const formatAttrs = JSON.parse(attributes['data-format'])
                const style = Object.entries(formatAttrs)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('; ')
                return style ? { style } : {}
              } catch {
                return {}
              }
            },
          },
        },
      },
    ]
  },
})
