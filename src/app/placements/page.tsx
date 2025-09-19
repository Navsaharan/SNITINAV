import { Metadata } from 'next'
import Image from 'next/image'
import MainLayout from '@/components/layout/main-layout'
import { Building2, Users, TrendingUp, Award, Download, MapPin, Calendar, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Placements - S.N. ITI',
  description: 'Placement records and career opportunities for students at S.N. Private Industrial Training Institute.',
}

interface PlacementRecord {
  id: string
  studentName: string
  trade: string
  company: string
  position: string
  location: string
  salary: string
  year: string
  type: 'Government' | 'Private' | 'Self-Employment'
}

interface PlacementPartner {
  id: string
  name: string
  sector: string
  location: string
  positions: string[]
  logo?: string
}

const placementRecords: PlacementRecord[] = [
  {
    id: '1',
    studentName: 'Rajesh Kumar',
    trade: 'Electrician',
    company: 'Rajasthan State Electricity Board',
    position: 'Junior Technician',
    location: 'Churu, Rajasthan',
    salary: '₹25,000/month',
    year: '2024',
    type: 'Government'
  },
  {
    id: '2',
    studentName: 'Priya Sharma',
    trade: 'Electrician',
    company: 'Siemens India',
    position: 'Electrical Technician',
    location: 'Jaipur, Rajasthan',
    salary: '₹22,000/month',
    year: '2024',
    type: 'Private'
  },
  {
    id: '3',
    studentName: 'Amit Singh',
    trade: 'Electrician',
    company: 'Own Electrical Services',
    position: 'Entrepreneur',
    location: 'Sardarshahar, Churu',
    salary: '₹30,000/month',
    year: '2023',
    type: 'Self-Employment'
  },
  {
    id: '4',
    studentName: 'Sunita Devi',
    trade: 'Electrician',
    company: 'L&T Construction',
    position: 'Site Electrician',
    location: 'Bikaner, Rajasthan',
    salary: '₹20,000/month',
    year: '2023',
    type: 'Private'
  },
  {
    id: '5',
    studentName: 'Vikash Choudhary',
    trade: 'Electrician',
    company: 'Railway Department',
    position: 'Electrical Maintainer',
    location: 'Jodhpur, Rajasthan',
    salary: '₹28,000/month',
    year: '2023',
    type: 'Government'
  }
]

const placementPartners: PlacementPartner[] = [
  {
    id: '1',
    name: 'Rajasthan State Electricity Board',
    sector: 'Power & Energy',
    location: 'Rajasthan',
    positions: ['Junior Technician', 'Electrical Maintainer', 'Line Technician']
  },
  {
    id: '2',
    name: 'Indian Railways',
    sector: 'Transportation',
    location: 'Pan India',
    positions: ['Electrical Maintainer', 'Signal Technician', 'Power Technician']
  },
  {
    id: '3',
    name: 'Siemens India',
    sector: 'Industrial Automation',
    location: 'Multiple Cities',
    positions: ['Electrical Technician', 'Maintenance Engineer', 'Field Service Engineer']
  },
  {
    id: '4',
    name: 'L&T Construction',
    sector: 'Construction & Infrastructure',
    location: 'Pan India',
    positions: ['Site Electrician', 'Electrical Supervisor', 'Installation Technician']
  },
  {
    id: '5',
    name: 'Bajaj Electricals',
    sector: 'Electrical Equipment',
    location: 'North India',
    positions: ['Service Technician', 'Installation Engineer', 'Quality Inspector']
  }
]

const placementStats = {
  totalPlacements: 156,
  placementRate: 92,
  averageSalary: 24000,
  topSalary: 35000,
  governmentJobs: 45,
  privateJobs: 89,
  selfEmployed: 22
}

export default function PlacementsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Placements</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to student success extends beyond education. We ensure our graduates 
              are well-prepared for the industry and help them secure meaningful employment opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Placement Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Placement Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{placementStats.totalPlacements}</div>
              <div className="text-sm text-gray-600">Total Placements</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{placementStats.placementRate}%</div>
              <div className="text-sm text-gray-600">Placement Rate</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">₹{placementStats.averageSalary.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Average Salary</div>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">₹{placementStats.topSalary.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Highest Salary</div>
            </div>
          </div>
        </div>

        {/* Placement Cell Information */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Placement Cell</h2>
              <p className="text-gray-600 mb-6">
                Our dedicated placement cell works tirelessly to connect our students with leading 
                employers in the industry. We provide comprehensive career guidance, interview 
                preparation, and job placement assistance to ensure our graduates achieve their 
                career goals.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Dedicated placement officers for personalized guidance</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-5 w-5 mr-3 text-green-500" />
                  <span>Strong industry partnerships and connections</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Regular skill development and interview preparation sessions</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-5 w-5 mr-3 text-orange-500" />
                  <span>100% placement assistance for all eligible students</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Placement Cell Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Placements */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Placements</h2>
            <a
              href="/downloads/placement-records.pdf"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Records
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {placementRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">{record.trade}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {record.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {record.salary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.type === 'Government' ? 'bg-blue-100 text-blue-800' :
                          record.type === 'Private' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {record.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placement Partners */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Placement Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementPartners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.sector}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {partner.location}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Positions:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.positions.map((position, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded border">
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Start Your Career?
          </h3>
          <p className="text-gray-600 mb-6">
            Join our institute and take the first step towards a successful career in the technical field.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/admission-criteria"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Contact Placement Cell
            </a>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  )
}
