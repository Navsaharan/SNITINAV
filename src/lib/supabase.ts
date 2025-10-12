import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // You might want to handle this error more gracefully
  throw new Error('Supabase URL and anon key are required.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = null // Assuming no admin client for now

export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) throw error
  return data
}

export const uploadBuffer = async (bucket: string, filePath: string, buffer: ArrayBuffer, contentType: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, { contentType })

  if (error) throw error
  return data
}

export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const getSignedUrl = async (bucket: string, filePath: string, expiresIn: number = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn)
  
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
