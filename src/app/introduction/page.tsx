import { Metadata } from 'next'
import MainLayout from '@/components/layout/main-layout'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { Building, Users, Award, Target, Eye, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Introduction of Institute - S.N. ITI',
  description: 'Learn about the history, mission, and vision of S.N. Private Industrial Training Institute, established in 2009.',
}

export default function IntroductionPage() {
  const breadcrumbs = [
    {
      label: 'About Us',
      href: '/about-institute',
    },
    {
      label: 'Introduction of Institute',
      href: '/introduction',
    },
  ]

  const managingSocietyMembers = [
    {
      name: 'Sh. Ramji Lal Saharan',
      designation: 'Chairman',
      fatherName: 'Narayan Ram',
      address: 'V. Hariyasar Jatan, Post-Jaisaharshar, Teh-Sardarsahar, Churu',
      mobile: '9001834274'
    },
    {
      name: 'Smt. Vinod Saran',
      designation: 'Vice-Chairman',
      fatherName: 'W/O Vikash Khaliya',
      address: 'V.Pallu, Teh-Rawtsar,Dist. Hanimangarh',
      mobile: '9414947801'
    },
    {
      name: 'Ram Kumar',
      designation: 'Secretary',
      fatherName: 'Chet Ram',
      address: 'Daniyasar, Th. Pallu, Hanuman garg',
      mobile: 'Not specified'
    },
    {
      name: 'Mukhram Potaliya',
      designation: 'Treasurer',
      fatherName: 'Nopa Ram',
      address: 'V.-Bijrasar Sardarshahar, Churu',
      mobile: '9414436862'
    }
  ]

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Introduction of Institute
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Discover the rich history, founding principles, and commitment to excellence that defines 
              S.N. Private Industrial Training Institute.
            </p>
          </div>

          {/* Main Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
              <p className="mb-4">
                SN Private Industrial Training Institute, a constituent activity of Nav Chetana Shikhshan Sansthan, 
                was established in the year 2009 to fulfil the first of the objective of its managing society i.e. 
                preparing employable youth through technical education.
              </p>
              <p className="mb-4">
                Nav Chetana Shikhshan Sansthan, the managing society of this institute, is a society registered under 
                Rajasthan societies registration act. 1958 in the office of Assistant Registrar (societies) vide 
                registration no. 104/Churu/2008-2009 on 15 Jan 2009.
              </p>
              <p className="mb-4">
                This institute was founded by a retired police officer Shri RamiLal Saharan with an objective of 
                overall development of the society with special emphasis on educating and imparting employable skills 
                to the youth so that they can earn their livelihood and serve the nation. The other targeted areas of 
                work of the institute include development of animal husbandry, agriculture, health and hygiene of the people.
              </p>
              <p>
                SN Private Industrial Training Institute is category I- institute where trades/ units have already been 
                accorded affiliation to NCVT and it has applied for the extension of the units in the electrician trade.
              </p>
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Our Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Trade Expansion
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    To introduce at least three most sought trades of the nearby industries viz. electrician, 
                    fitter, mechanic (diesel) in next 2-3 years.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Industry Exposure
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    To expose students to minimum of three companies as industry inter phase program.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    100% Placement
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    To achieve 100 per cent placement for the passed out trainees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission and Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 mr-3" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Our Vision
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                To be recognized as an Excellent Organization Providing World Class Technical Education at all Levels.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 mr-3" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Our Mission
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Striving for Excellence in Technical Education and developing skill sets suitable to the advancement 
                of manufacturing and service sector.
              </p>
            </div>
          </div>

          {/* Managing Society */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Managing Society
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Nav Chetana Shikshan Sansthan, Sardarshahar
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Registration Number: S.N. - 104/Churu/ 2008-2009
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father's Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile No.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managingSocietyMembers.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.fatherName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {member.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.mobile}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Join Our Mission
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Be part of our journey towards excellence in technical education and skill development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/admission-criteria"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Apply for Admission
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 border text-base font-medium rounded-md transition-colors"
                style={{ 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
