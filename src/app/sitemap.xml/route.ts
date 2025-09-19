import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all published pages
    const pages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        updatedAt: true
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Static pages
    const staticPages = [
      { url: '', lastmod: new Date().toISOString(), priority: '1.0' },
      { url: '/contact', lastmod: new Date().toISOString(), priority: '0.8' },
    ]

    // Dynamic pages from database
    const dynamicPages = pages.map(page => ({
      url: `/${page.slug}`,
      lastmod: page.updatedAt.toISOString(),
      priority: page.slug === 'home' ? '1.0' : '0.7'
    }))

    const allPages = [...staticPages, ...dynamicPages]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
