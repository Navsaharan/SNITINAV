import { describe, expect, it } from '@jest/globals'
import { boundedDimension, escapeXml, safeColor } from './placeholder-image'

describe('placeholder image input safety', () => {
  it('bounds dimensions', () => {
    expect(boundedDimension('800', 400)).toBe(800)
    expect(boundedDimension('0', 400)).toBe(400)
    expect(boundedDimension('99999', 400)).toBe(400)
    expect(boundedDimension('12.5', 400)).toBe(400)
  })

  it('allows only six-digit hex colors', () => {
    expect(safeColor('#abcdef', '#000000')).toBe('#abcdef')
    expect(safeColor('red;url(javascript:alert(1))', '#000000')).toBe('#000000')
  })

  it('escapes XML control characters', () => {
    expect(escapeXml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
  })
})
