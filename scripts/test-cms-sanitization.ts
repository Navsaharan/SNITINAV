import assert from 'node:assert/strict'
import { sanitizePageHtml } from '../src/lib/sanitize-page-html'

const output = sanitizePageHtml(
  '<h2 onclick="alert(1)">Welcome</h2><script>alert(2)</script><a href="javascript:alert(3)">unsafe</a><table><tr><td>kept</td></tr></table><iframe src="https://evil.example/embed"></iframe><iframe src="https://www.youtube-nocookie.com/embed/abc" title="Video"></iframe>',
)
assert.match(output, /<h2>Welcome<\/h2>/)
assert.match(output, /<table>/)
assert.doesNotMatch(output, /<script|onclick|javascript:|evil\.example/i)
assert.match(output, /www\.youtube-nocookie\.com\/embed\/abc/)

const styled = sanitizePageHtml('<p style="color: #123456; background-color: rgb(1, 2, 3); font-size: 20px; padding: 8px; width: 80%; border-radius: 4px">Styled</p>')
assert.match(styled, /color:#123456/)
assert.match(styled, /background-color:rgb\(1, 2, 3\)/)
assert.match(styled, /font-size:20px/)
assert.match(styled, /padding:8px/)
assert.match(styled, /width:80%/)
assert.match(styled, /border-radius:4px/)

const maliciousStyle = sanitizePageHtml('<p style="background-image:url(javascript:alert(1)); color: expression(alert(1))">safe</p>')
assert.doesNotMatch(maliciousStyle, /javascript|expression/i)
console.log('CMS HTML sanitization smoke tests passed.')
