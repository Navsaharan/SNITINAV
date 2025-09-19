import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { stat } from 'fs/promises'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

// GET /api/files/[bucket]/[...path] - Serve local files
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Basic authentication check for file access
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [bucket, ...filePath] = params.path
    const fileName = filePath.join('/')
    
    if (!bucket || !fileName) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const fullPath = path.join(UPLOAD_DIR, bucket, fileName)
    
    // Security check: ensure the path is within the upload directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedUploadDir = path.resolve(UPLOAD_DIR)
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    try {
      // Check if file exists
      const fileStat = await stat(resolvedPath)
      
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      // Read the file
      const fileBuffer = await fs.readFile(resolvedPath)
      
      // Determine content type based on file extension
      const ext = path.extname(fileName).toLowerCase()
      let contentType = 'application/octet-stream'
      
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg'
      }
      
      if (mimeTypes[ext]) {
        contentType = mimeTypes[ext]
      }

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileStat.size.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Disposition': `inline; filename="${path.basename(fileName)}"`
        }
      })

    } catch (fileError) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/files/[bucket] - Upload files to local storage
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [bucket] = params.path
    
    if (!bucket) {
      return NextResponse.json({ error: 'Bucket name required' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create bucket directory if it doesn't exist
    const bucketDir = path.join(UPLOAD_DIR, bucket)
    await fs.mkdir(bucketDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const ext = path.extname(file.name)
    const fileName = `${timestamp}-${randomString}${ext}`
    
    const filePath = path.join(bucketDir, fileName)
    
    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: fileName,
      url: `/api/files/${bucket}/${fileName}`,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
