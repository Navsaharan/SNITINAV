import { NextRequest, NextResponse } from 'next/server'
import { boundedDimension, escapeXml, safeColor, DEFAULT_BG, DEFAULT_TEXT } from '@/lib/placeholder-image'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = boundedDimension(searchParams.get('width'), 400)
  const height = boundedDimension(searchParams.get('height'), 300)
  const text = escapeXml((searchParams.get('text') || 'Placeholder').slice(0, 200))
  const bgColor = safeColor(searchParams.get('bg'), DEFAULT_BG)
  const textColor = safeColor(searchParams.get('color'), DEFAULT_TEXT)

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
