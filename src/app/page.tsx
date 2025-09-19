import MainLayout from '@/components/layout/main-layout'
import { ArrowRight, Users, Award, Building, Briefcase } from 'lucide-react'
import Link from 'next/link'
import HomepageSlideshow from '@/components/ui/homepage-slideshow'

// Optimize for static generation - revalidate every hour
export const revalidate = 3600

export default async function Home() {
  const stats = [
    { icon: Users, label: 'Students Trained', value: '500+' },
    { icon: Award, label: 'Years of Excellence', value: '15+' },
    { icon: Building, label: 'Modern Facilities', value: '10+' },
    { icon: Briefcase, label: 'Industry Partners', value: '25+' },
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-white py-20" style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to SN Pvt ITI
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Job oriented Industrial Training Courses for employment in public or private sector & Self employment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admission-criteria"
                className="px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-primary)' }}
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about-institute"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 text-white rounded-full mb-4" style={{ backgroundColor: 'var(--color-accent)' }}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  S.N. Pvt. Industrial Training Institute was established in 2009. At present institute having a total capacity of 126 sanction seats in Electrician trade affiliated to NCVT.
                </p>
                <p>
                  Nav Chetana Shikshan Sansthan has taken up skill development as one of its major focus area for preparing employable youth through technical education.
                </p>
              </div>
              <Link
                href="/introduction-institute"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold mt-4"
              >
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <HomepageSlideshow />
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vision & Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">VISION</h3>
              <p className="text-gray-600">
                To be recognized as an Excellent Organization Providing World Class Technical Education at all Levels.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">MISSION</h3>
              <p className="text-gray-600">
                To Strive for Excellence in Technical Education
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 text-white rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-2">
                  <p><strong>Address:</strong></p>
                  <p>D-117, Kaka Colony, Gandhi Vidhya Mandir,<br />
                     Teh.-Sardar Shahar, Dist. Churu</p>
                  <p><strong>Phone:</strong> 01564-275628</p>
                  <p><strong>Mobile:</strong> 9414947801</p>
                  <p><strong>Email:</strong> snitcsrdr@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  href="/contact"
                  className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
                >
                  Get Directions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
