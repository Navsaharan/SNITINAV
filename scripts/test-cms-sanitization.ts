import assert from 'node:assert/strict'
import { sanitizePageHtml } from '../src/lib/sanitize-page-html'

const output = sanitizePageHtml(
  '<h2 onclick="alert(1)">Welcome</h2><script>alert(2)</script><a href="javascript:alert(3)">unsafe</a><table><tr><td>kept</td></tr></table><iframe src="https://evil.example/embed"></iframe><iframe src="https://www.youtube-nocookie.com/embed/abc" title="Video"></iframe>',
)
assert.match(output, /<h2>Welcome<\/h2>/)
assert.match(output, /<table>/)
assert.doesNotMatch(output, /<script|onclick|javascript:|evil\.example/i)
assert.match(output, /www\.youtube-nocookie\.com\/embed\/abc/)
console.log('CMS HTML sanitization smoke tests passed.')
