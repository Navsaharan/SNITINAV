import Link from 'next/link'
import Image from 'next/image'
import { Home, ArrowLeft, Search, Phone, Mail } from 'lucide-react'

export default function NotFound() {
  const currentYear = new Date().getFullYear()

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

        {/* 404 Error */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Sorry, we couldn't find the page you're looking for. The page may have been moved, 
            deleted, or you may have entered an incorrect URL.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          
          <Link
            href="/about"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>About Us</span>
          </Link>
          
          <Link
            href="/courses"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Courses</span>
          </Link>
          
          <Link
            href="/contact"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="h-5 w-5" />
            <span>Contact</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Link href="/admissions" className="text-blue-600 hover:text-blue-800 hover:underline">
              Admissions
            </Link>
            <Link href="/faculty" className="text-blue-600 hover:text-blue-800 hover:underline">
              Faculty
            </Link>
            <Link href="/facilities" className="text-blue-600 hover:text-blue-800 hover:underline">
              Facilities
            </Link>
            <Link href="/placements" className="text-blue-600 hover:text-blue-800 hover:underline">
              Placements
            </Link>
            <Link href="/gallery" className="text-blue-600 hover:text-blue-800 hover:underline">
              Gallery
            </Link>
            <Link href="/feedback" className="text-blue-600 hover:text-blue-800 hover:underline">
              Feedback
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
