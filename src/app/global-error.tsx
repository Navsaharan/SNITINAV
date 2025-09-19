'use client'

import ErrorPage from '@/components/error/error-page'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorPage 
          statusCode={500}
          title="Application Error"
          message="A critical error occurred in the application. Our team has been notified and is working to resolve the issue."
          showRetry={true}
        />
      </body>
    </html>
  )
}
