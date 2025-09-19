'use client'

import { useEffect } from 'react'
import ErrorPage from '@/components/error/error-page'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <ErrorPage 
      statusCode={500}
      title="Something went wrong!"
      message="An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
      showRetry={true}
    />
  )
}
