import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Use consistent date formatting to prevent hydration mismatch
  const formatLastUpdated = () => {
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <footer className="bg-gray-100 text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Institute Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 relative flex-shrink-0">
                <Image
                  src="/snitilogo.png"
                  alt="S.N. Pvt. Industrial Training Institute Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">S.N. Pvt. Industrial Training Institute</h3>
                <p className="text-sm text-gray-600">Excellence in Technical Education</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 max-w-md">
              Approved by Directorate of Technical Education, Govt. of Rajasthan.
              Affiliated to NCVT (DGE&T) Govt. of India since 2009.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  D-117, Kaka Colony, Gandhi Vidhya Mandir, Teh.-Sardar Shahar, Dist. Churu
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">01564-275628, 9414947801</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">snitcsrdr@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about-institute" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  About Institute
                </Link>
              </li>
              <li>
                <Link href="/admission-criteria" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Admission Criteria
                </Link>
              </li>
              <li>
                <Link href="/trades-ncvt-scvt" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Trades Affiliated
                </Link>
              </li>
              <li>
                <Link href="/infrastructure" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Important</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/results" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Results
                </Link>
              </li>
              <li>
                <Link href="/placements" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Placements
                </Link>
              </li>
              <li>
                <Link href="/rti" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  RTI
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-700 hover:text-blue-600 text-sm transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <a
                  href="/downloads/QUALITY MANNUAL.pdf"
                  className="text-gray-700 hover:text-blue-600 text-sm transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quality Manual
                </a>
              </li>
              <li>
                <Link href="/student/login" className="text-gray-700 hover:text-blue-600 text-sm transition-colors font-medium">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-700">
                © {currentYear} S.N. ITI. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Last Updated: {formatLastUpdated()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
