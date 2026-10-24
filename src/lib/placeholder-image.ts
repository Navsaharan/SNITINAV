const DEFAULT_BG = '#f3f4f6'
const DEFAULT_TEXT = '#6b7280'
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i

export function boundedDimension(value: string | null, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 2000 ? parsed : fallback
}

export function safeColor(value: string | null, fallback: string): string {
  return value && COLOR_PATTERN.test(value) ? value : fallback
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] || character)
}

export { DEFAULT_BG, DEFAULT_TEXT }
