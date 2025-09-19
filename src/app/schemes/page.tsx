import { Metadata } from 'next'
import MainLayout from '@/components/layout/main-layout'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { Award, Users, BookOpen, Target, CheckCircle, ArrowRight, Calendar, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Schemes Running in The Institute - S.N. ITI',
  description: 'Explore the various government and institutional schemes running at S.N. Private Industrial Training Institute for skill development and employment.',
}

export default function SchemesPage() {
  const breadcrumbs = [
    {
      label: 'About Us',
      href: '/about-institute',
    },
    {
      label: 'Schemes Running in The Institute',
      href: '/schemes',
    },
  ]

  const schemes = [
    {
      title: 'Craftsmen Training Scheme (CTS)',
      category: 'NCVT Scheme',
      description: 'The flagship scheme for providing vocational training to youth in various trades to make them employable and self-reliant.',
      duration: '1-2 Years',
      eligibility: '8th/10th/12th Pass',
      benefits: [
        'NCVT Certificate recognized nationwide',
        'Industry-relevant skill training',
        'Placement assistance',
        'Entrepreneurship development'
      ],
      trades: ['Electrician', 'Fitter', 'Mechanic (Diesel)'],
      icon: Award,
      color: 'bg-blue-500'
    },
    {
      title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
      category: 'Government Scheme',
      description: 'Skill development initiative to enable youth to take up industry-relevant skill training for better livelihood.',
      duration: '3-6 Months',
      eligibility: 'School Dropout/Unemployed Youth',
      benefits: [
        'Free training with monetary rewards',
        'Assessment and certification',
        'Placement support',
        'Recognition of Prior Learning (RPL)'
      ],
      trades: ['Electrical', 'Electronics', 'Automotive'],
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Skill India Mission',
      category: 'National Initiative',
      description: 'Part of the national mission to skill over 40 crore people by 2025 through various skill development programs.',
      duration: 'Variable',
      eligibility: 'Youth aged 15-45 years',
      benefits: [
        'Industry-aligned training',
        'Digital certification',
        'Career guidance',
        'Entrepreneurship support'
      ],
      trades: ['Multiple Trades Available'],
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      title: 'Apprenticeship Training',
      category: 'Industry Partnership',
      description: 'Practical training program combining classroom learning with on-the-job training in industry.',
      duration: '1-4 Years',
      eligibility: 'ITI Pass/Graduate',
      benefits: [
        'Hands-on industry experience',
        'Monthly stipend',
        'Job guarantee post completion',
        'Professional networking'
      ],
      trades: ['Electrician', 'Fitter', 'Mechanic'],
      icon: BookOpen,
      color: 'bg-orange-500'
    }
  ]

  const achievements = [
    {
      metric: '500+',
      label: 'Students Trained',
      description: 'Under various government schemes'
    },
    {
      metric: '85%',
      label: 'Placement Rate',
      description: 'Successful job placements'
    },
    {
      metric: '15+',
      label: 'Industry Partners',
      description: 'For apprenticeship programs'
    },
    {
      metric: '3',
      label: 'Active Schemes',
      description: 'Currently running programs'
    }
  ]

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Schemes Running in The Institute
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Discover the comprehensive range of government and institutional schemes designed to enhance 
              skills, provide employment opportunities, and foster entrepreneurship among our students.
            </p>
          </div>

          {/* Achievements Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                  {achievement.metric}
                </div>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {achievement.label}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {schemes.map((scheme, index) => {
              const IconComponent = scheme.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${scheme.color} mr-4`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {scheme.title}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100" 
                            style={{ color: 'var(--color-text-secondary)' }}>
                            {scheme.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {scheme.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Duration
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {scheme.duration}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <Users className="h-4 w-4 mr-2" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Eligibility
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {scheme.eligibility}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Key Benefits:
                      </h4>
                      <ul className="space-y-1">
                        {scheme.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" 
                              style={{ color: 'var(--color-success)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Available Trades:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {scheme.trades.map((trade, tradeIndex) => (
                          <span key={tradeIndex} 
                            className="inline-flex px-3 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: 'var(--color-bg-secondary)', 
                              color: 'var(--color-text-primary)' 
                            }}>
                            {trade}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)' }}>
                      Apply for This Scheme
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              How to Apply for Schemes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Visit Institute
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Visit our institute with required documents and eligibility criteria
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Submit Application
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Fill out the application form and submit with necessary documents
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Start Training
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Begin your skill development journey with expert guidance
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Get More Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Contact Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Address</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        D-117, Kaka Colony, Gandhi Vidhya Mandir<br />
                        Teh.-Sardar Shahar, Dist. Churu, Rajasthan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <a href="/admission-criteria" 
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    View Admission Criteria
                  </a>
                  <a href="/contact" 
                    className="block w-full text-center px-4 py-2 border text-sm font-medium rounded-md transition-colors"
                    style={{ 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-bg-primary)'
                    }}>
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
