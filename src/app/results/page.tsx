import { Metadata } from 'next'
import MainLayout from '@/components/layout/main-layout'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { Award, TrendingUp, Users, Calendar, Download, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Results - S.N. ITI',
  description: 'View examination results and academic achievements of students at S.N. Private Industrial Training Institute.',
}

interface ExamResult {
  year: string
  trade: string
  totalStudents: number
  passed: number
  passPercentage: number
  distinction: number
  firstClass: number
  secondClass: number
}

const examResults: ExamResult[] = [
  {
    year: '2024',
    trade: 'Electrician',
    totalStudents: 42,
    passed: 39,
    passPercentage: 92.9,
    distinction: 8,
    firstClass: 15,
    secondClass: 16
  },
  {
    year: '2023',
    trade: 'Electrician',
    totalStudents: 38,
    passed: 35,
    passPercentage: 92.1,
    distinction: 6,
    firstClass: 14,
    secondClass: 15
  },
  {
    year: '2022',
    trade: 'Electrician',
    totalStudents: 40,
    passed: 36,
    passPercentage: 90.0,
    distinction: 7,
    firstClass: 13,
    secondClass: 16
  },
  {
    year: '2021',
    trade: 'Electrician',
    totalStudents: 35,
    passed: 32,
    passPercentage: 91.4,
    distinction: 5,
    firstClass: 12,
    secondClass: 15
  }
]

const toppers = [
  {
    name: 'Rajesh Kumar',
    trade: 'Electrician',
    year: '2024',
    percentage: 89.5,
    grade: 'Distinction'
  },
  {
    name: 'Priya Sharma',
    trade: 'Electrician',
    year: '2024',
    percentage: 87.2,
    grade: 'Distinction'
  },
  {
    name: 'Amit Singh',
    trade: 'Electrician',
    year: '2023',
    percentage: 88.8,
    grade: 'Distinction'
  }
]

export default function ResultsPage() {
  const breadcrumbs = [
    {
      label: 'Trainee',
      href: '/placements',
    },
    {
      label: 'Results',
      href: '/results',
    },
  ]

  const overallStats = {
    totalStudents: examResults.reduce((sum, result) => sum + result.totalStudents, 0),
    totalPassed: examResults.reduce((sum, result) => sum + result.passed, 0),
    averagePassRate: examResults.reduce((sum, result) => sum + result.passPercentage, 0) / examResults.length,
    totalDistinctions: examResults.reduce((sum, result) => sum + result.distinction, 0)
  }

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Examination Results
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Academic achievements and examination results of our students, showcasing excellence in technical education.
            </p>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {overallStats.totalStudents}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Total Students (4 Years)
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                {overallStats.totalPassed}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Students Passed
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8" style={{ color: 'var(--color-info)' }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-info)' }}>
                {overallStats.averagePassRate.toFixed(1)}%
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Average Pass Rate
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-8 w-8" style={{ color: 'var(--color-warning)' }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
                {overallStats.totalDistinctions}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Distinctions Achieved
              </div>
            </div>
          </div>

          {/* Year-wise Results */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Year-wise Results
              </h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pass %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distinction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Second Class
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.trade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.passed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {result.passPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.distinction}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.firstClass}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.secondClass}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toppers.map((topper, index) => (
                <div key={index} className="border rounded-lg p-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {topper.name}
                  </h3>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {topper.trade} - {topper.year}
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                    {topper.percentage}%
                  </p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}>
                    {topper.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Official Result Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="https://ncvtmis.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ExternalLink className="h-6 w-6 mr-3" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    NCVT MIS Portal
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Official NCVT results and certificates
                  </p>
                </div>
              </a>
              <a
                href="https://www.rajasthaniti.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ExternalLink className="h-6 w-6 mr-3" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Rajasthan ITI Portal
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    State-level ITI results and information
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Need Help with Results?
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Contact our academic office for any queries regarding examination results or certificates.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Contact Academic Office
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
