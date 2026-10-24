import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { stat } from 'fs/promises'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_BUCKETS = new Set(['uploads', 'faculty-photos', 'Pics'])
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'])
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

type RouteContext = { params: Promise<{ path: string[] }> }

function safePath(bucket: string, segments: string[]) {
  if (!ALLOWED_BUCKETS.has(bucket) || segments.length === 0) return null
  if (segments.some((segment) => !segment || segment === '.' || segment === '..' || segment.includes('\\'))) return null

  const root = path.resolve(UPLOAD_DIR)
  const resolved = path.resolve(root, bucket, ...segments)
  const bucketRoot = path.resolve(root, bucket)
  return resolved === bucketRoot || resolved.startsWith(`${bucketRoot}${path.sep}`) ? resolved : null
}

async function requireSession(request: NextRequest, write = false) {
  const session = await getServerSession(authOptions)
  const role = String((session as { user?: { role?: string } } | null)?.user?.role || '').toUpperCase()
  if (!session || (write && role !== 'ADMIN')) return null
  return session
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireSession(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [bucket, ...segments] = (await params).path
    const resolvedPath = safePath(bucket, segments)
    if (!resolvedPath) return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })

    const fileStat = await stat(resolvedPath).catch(() => null)
    if (!fileStat?.isFile()) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    const extension = path.extname(resolvedPath).toLowerCase()
    const contentType = MIME_TYPES[extension] || 'application/octet-stream'
    const fileBuffer = await fs.readFile(resolvedPath)
    const fileName = path.basename(resolvedPath).replace(/[\r\n"\\]/g, '_')

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireSession(request, true))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [bucket] = (await params).path
    if (!ALLOWED_BUCKETS.has(bucket)) return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })

    const formData = await request.formData()
    const formFile = formData.get('file')
    const file = formFile instanceof File ? formFile : null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File must be larger than 0 bytes and no larger than 10 MB' }, { status: 400 })

    const extension = Object.entries(MIME_TYPES).find(([, mime]) => mime === file.type)?.[0] || ''
    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const resolvedPath = safePath(bucket, [fileName])
    if (!resolvedPath) return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })

    await fs.mkdir(path.dirname(resolvedPath), { recursive: true })
    await fs.writeFile(resolvedPath, Buffer.from(await file.arrayBuffer()), { flag: 'wx' })

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName,
      url: `/api/files/${encodeURIComponent(bucket)}/${encodeURIComponent(fileName)}`,
      size: file.size,
      type: file.type,
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
