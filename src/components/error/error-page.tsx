import Link from 'next/link'
import Image from 'next/image'
import { Home, ArrowLeft, RefreshCw, Phone, Mail, AlertTriangle, Lock, Server } from 'lucide-react'

interface ErrorPageProps {
  statusCode: number
  title?: string
  message?: string
  showRetry?: boolean
}

const getErrorDetails = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return {
        title: 'Bad Request',
        message: 'The request could not be understood by the server. Please check your input and try again.',
        icon: AlertTriangle,
        color: 'text-orange-600'
      }
    case 401:
      return {
        title: 'Unauthorized',
        message: 'You need to be logged in to access this page. Please sign in and try again.',
        icon: Lock,
        color: 'text-red-600'
      }
    case 403:
      return {
        title: 'Access Forbidden',
        message: 'You don\'t have permission to access this resource. Please contact the administrator if you believe this is an error.',
        icon: Lock,
        color: 'text-red-600'
      }
    case 404:
      return {
        title: 'Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist. It may have been moved or deleted.',
        icon: AlertTriangle,
        color: 'text-blue-600'
      }
    case 500:
      return {
        title: 'Internal Server Error',
        message: 'Something went wrong on our end. Our team has been notified and is working to fix the issue.',
        icon: Server,
        color: 'text-red-600'
      }
    case 502:
      return {
        title: 'Bad Gateway',
        message: 'The server received an invalid response. Please try again in a few moments.',
        icon: Server,
        color: 'text-red-600'
      }
    case 503:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        icon: Server,
        color: 'text-orange-600'
      }
    default:
      return {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        icon: AlertTriangle,
        color: 'text-gray-600'
      }
  }
}

export default function ErrorPage({
  statusCode, 
  title, 
  message, 
  showRetry = false 
}: ErrorPageProps) {
  const currentYear = new Date().getFullYear()
  const errorDetails = getErrorDetails(statusCode)
  const ErrorIcon = errorDetails.icon

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* SNPITC Logo */}
        <div className="mb-8">
          <Image
            src="/snitilogo.png"
            alt="S.N. Pvt. Industrial Training Institute"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            S.N. Pvt. Industrial Training Institute
          </h1>
          <p className="text-sm text-gray-600">
            Approved by Directorate of Technical Education, Govt. of Rajasthan
          </p>
        </div>

        {/* Error Display */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6`}>
            <ErrorIcon className={`h-12 w-12 ${errorDetails.color}`} />
          </div>
          
          <div className={`text-6xl font-bold mb-4 ${errorDetails.color}`}>
            {statusCode}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title || errorDetails.title}
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {message || errorDetails.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          
          {showRetry && (
            <button
              onClick={handleRetry}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Link href="/about" className="text-blue-600 hover:text-blue-800 hover:underline">
              About Us
            </Link>
            <Link href="/admissions" className="text-blue-600 hover:text-blue-800 hover:underline">
              Admissions
            </Link>
            <Link href="/courses" className="text-blue-600 hover:text-blue-800 hover:underline">
              Courses
            </Link>
            <Link href="/faculty" className="text-blue-600 hover:text-blue-800 hover:underline">
              Faculty
            </Link>
            <Link href="/facilities" className="text-blue-600 hover:text-blue-800 hover:underline">
              Facilities
            </Link>
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
              Contact
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help? Contact Us
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>01564-275628, 9414947801</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>info@snpitc.in</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">
          <p>© {currentYear} S.N. Pvt. Industrial Training Institute. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
