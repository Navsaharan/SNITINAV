import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import EmailAnalytics from '@/components/admin/EmailAnalytics'

export const metadata: Metadata = {
  title: 'Email Analytics - Admin Panel',
  description: 'Email system analytics and reporting',
}

export default async function EmailAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for the email system
          </p>
        </div>
        <EmailAnalytics />
      </div>
    </AdminLayout>
  )
}
