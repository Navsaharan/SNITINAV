import { Metadata } from 'next'
import Image from 'next/image'
import MainLayout from '@/components/layout/main-layout'
import { Mail, Phone, Calendar, Award, GraduationCap, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to avoid build-time database issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Faculty - S.N. ITI',
  description: 'Meet our experienced faculty members at S.N. Private Industrial Training Institute, dedicated to providing quality technical education.',
}

interface FacultyMember {
  id: string
  name: string
  designation: string
  department?: string
  email?: string
  phone?: string
  photoUrl?: string
  bio?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Fetch faculty members from database
async function getFacultyMembers(): Promise<FacultyMember[]> {
  try {
    const faculty = await prisma.faculty.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
    return faculty
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return []
  }
}
export default async function FacultyPage() {
  const facultyMembers = await getFacultyMembers()
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Faculty</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our experienced and dedicated faculty members who are committed to providing 
              quality technical education and shaping the future of our students.
            </p>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {facultyMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Faculty Members</h3>
            <p className="text-gray-600">Faculty information will be displayed here once added by administrators.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyMembers.map((faculty) => (
              <div key={faculty.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="text-center p-6 pb-4">
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    {faculty.photoUrl ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                        <Image
                          src={faculty.photoUrl}
                          alt={faculty.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-100">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {faculty.name}
                  </h3>
                  <p className="text-blue-600 font-medium">{faculty.designation}</p>
                  {faculty.department && (
                    <p className="text-sm text-gray-500 mt-1">{faculty.department}</p>
                  )}
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* Bio */}
                  {faculty.bio && (
                    <div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {faculty.bio}
                      </p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {faculty.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        <a href={`mailto:${faculty.email}`} className="hover:text-blue-600 break-all">
                          {faculty.email}
                        </a>
                      </div>
                    )}
                    {faculty.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        <a href={`tel:${faculty.phone}`} className="hover:text-blue-600">
                          {faculty.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            ))}
          </div>
        )}

        {/* Faculty Statistics */}
        {facultyMembers.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Faculty Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{facultyMembers.length}</div>
                <div className="text-sm text-gray-600">Total Faculty</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {facultyMembers.filter(f => f.email).length}
                </div>
                <div className="text-sm text-gray-600">With Email</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {facultyMembers.filter(f => f.department).length}
                </div>
                <div className="text-sm text-gray-600">With Department</div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Join Our Faculty Team
          </h3>
          <p className="text-gray-600 mb-6">
            We are always looking for qualified and passionate instructors to join our team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact Us for Opportunities
          </a>
        </div>
      </div>
      </div>
    </MainLayout>
  )
}
