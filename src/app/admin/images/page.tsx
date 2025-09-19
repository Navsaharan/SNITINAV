'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import ImagePlaceholderManager from '@/components/admin/image-placeholder-manager'
import SlideshowManager from '@/components/admin/slideshow-manager'

export default function AdminImagesPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Management</h1>
          <p className="text-gray-600">
            Manage institutional images and replace placeholders throughout the website.
          </p>
        </div>

        <div className="space-y-8">
          <SlideshowManager />
          <ImagePlaceholderManager />
        </div>
      </div>
    </AdminLayout>
  )
}
