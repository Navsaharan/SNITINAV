import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        {/* SNPITC Logo */}
        <div className="mb-8">
          <Image
            src="/snitilogo.png"
            alt="S.N. Pvt. Industrial Training Institute"
            width={120}
            height={120}
            className="mx-auto mb-4 animate-pulse"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            S.N. Pvt. Industrial Training Institute
          </h1>
          <p className="text-sm text-gray-600">
            Approved by Directorate of Technical Education, Govt. of Rajasthan
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-lg text-gray-600 mt-4">Loading...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
