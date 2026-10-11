import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const browser = new JSDOM('<!doctype html><html><body><div id="editor"><p>CKEditor runtime smoke test</p></div></body></html>', { pretendToBeVisual: true }).window
browser.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
browser.matchMedia ||= () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false } })
Object.defineProperty(globalThis, 'window', { value: browser, configurable: true })
Object.defineProperty(globalThis, 'document', { value: browser.document, configurable: true })
for (const key of Object.getOwnPropertyNames(browser)) {
  if (/^(HTML|SVG|Node$|Element$|Document$|MouseEvent$|KeyboardEvent$|FocusEvent$|PointerEvent$|Event$|Range$|MutationObserver$|CustomEvent$|DOMParser$|URL$|CSS$|ShadowRoot$|File$|Blob$|ResizeObserver$)/.test(key)) {
    try { Object.defineProperty(globalThis, key, { value: browser[key], configurable: true, writable: true }) } catch {}
  }
}
globalThis.getComputedStyle = browser.getComputedStyle.bind(browser)
globalThis.requestAnimationFrame = browser.requestAnimationFrame.bind(browser)
globalThis.cancelAnimationFrame = browser.cancelAnimationFrame.bind(browser)

const ckeditor = await import('ckeditor5')
const pluginNames = ['ClassicEditor', 'Essentials', 'Paragraph', 'Heading', 'Bold', 'Italic', 'Underline', 'Link', 'List', 'BlockQuote', 'Table', 'TableToolbar', 'Image', 'ImageToolbar', 'ImageCaption', 'ImageStyle', 'ImageUpload', 'MediaEmbed', 'CodeBlock', 'Alignment']
for (const name of pluginNames) assert.ok(name in ckeditor, `CKEditor export ${name} is missing`)

const editor = await ckeditor.ClassicEditor.create(document.querySelector('#editor'), {
  licenseKey: 'GPL',
  plugins: pluginNames.filter(name => name !== 'ClassicEditor').map(name => ckeditor[name]),
  toolbar: ['undo', 'redo', 'heading', 'bold', 'italic', 'underline', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'uploadImage', 'mediaEmbed', 'codeBlock', 'alignment'],
  table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
  image: { toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'] },
  mediaEmbed: { previewsInData: true },
})
assert.match(editor.getData(), /CKEditor runtime smoke test/)
await editor.destroy()
browser.close()
console.log('CKEditor runtime smoke test passed: imports, configured plugins, editor initialization and data output.')
