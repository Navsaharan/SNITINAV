// Supabase temporarily disabled - using local file storage instead
// import { createClient } from '@supabase/supabase-js'

// Supabase clients disabled for local development
export const supabase = null
export const supabaseAdmin = null

// Local file storage helpers (replacing Supabase)
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  await ensureUploadDir()

  const bucketDir = path.join(UPLOAD_DIR, bucket)
  await fs.mkdir(bucketDir, { recursive: true })

  const fullPath = path.join(bucketDir, filePath)
  const buffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(fullPath, buffer)

  return {
    path: filePath,
    fullPath: fullPath
  }
}

export const uploadBuffer = async (bucket: string, filePath: string, buffer: ArrayBuffer, contentType: string) => {
  await ensureUploadDir()

  const bucketDir = path.join(UPLOAD_DIR, bucket)
  await fs.mkdir(bucketDir, { recursive: true })

  const fullPath = path.join(bucketDir, filePath)
  const nodeBuffer = Buffer.from(buffer)

  await fs.writeFile(fullPath, nodeBuffer)

  return {
    path: filePath,
    fullPath: fullPath,
    contentType
  }
}

export const getFileUrl = (bucket: string, filePath: string) => {
  // Return local file URL for development
  return `/api/files/${bucket}/${filePath}`
}

export const getSignedUrl = async (bucket: string, filePath: string, expiresIn: number = 3600) => {
  // For local development, return the same URL (no signing needed)
  return `/api/files/${bucket}/${filePath}`
    .createSignedUrl(path, expiresIn)
  
  if (error) throw error
  return data.signedUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}

export const listFiles = async (bucket: string, folder?: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder)
  
  if (error) throw error
  return data
}

// Email attachment helpers
export const uploadEmailAttachment = async (emailId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `emails/${emailId}/${fileName}`

  try {
    const data = await uploadFile('email-attachments', filePath, file)
    return {
      ...data,
      url: getFileUrl('email-attachments', filePath),
      path: filePath
    }
  } catch (error) {
    console.error('Failed to upload email attachment:', error)
    throw new Error(`Failed to upload attachment: ${file.name}`)
  }
}

export const deleteEmailAttachment = async (filePath: string) => {
  try {
    await deleteFile('email-attachments', filePath)
  } catch (error) {
    console.error('Failed to delete email attachment:', error)
    throw new Error('Failed to delete attachment')
  }
}

export const getEmailAttachmentUrl = async (filePath: string, expiresIn: number = 3600) => {
  try {
    return await getSignedUrl('email-attachments', filePath, expiresIn)
  } catch (error) {
    console.error('Failed to get attachment URL:', error)
    throw new Error('Failed to get attachment URL')
  }
}

// Payment receipt helpers
export const uploadPaymentReceipt = async (paymentId: string, buffer: ArrayBuffer) => {
  const fileName = `receipt-${paymentId}-${Date.now()}.pdf`
  const filePath = `receipts/${fileName}`
  
  const data = await uploadBuffer('payment-receipts', filePath, buffer, 'application/pdf')
  return {
    ...data,
    url: getFileUrl('payment-receipts', filePath)
  }
}

// Database helpers for real-time subscriptions
export const subscribeToEmails = (accountId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('email-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emails',
        filter: `fromEmail=eq.${accountId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToPayments = (studentId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('payment-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `studentId=eq.${studentId}`
      },
      callback
    )
    .subscribe()
}

// Cleanup function
export const unsubscribe = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
}
