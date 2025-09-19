import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import EmailMonitoring from '@/components/admin/EmailMonitoring'

export const metadata: Metadata = {
  title: 'Email Monitoring - Admin Panel',
  description: 'Monitor email traffic and content',
}

export default async function EmailMonitoringPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor email traffic, search content, and track security threats
          </p>
        </div>
        <EmailMonitoring />
      </div>
    </AdminLayout>
  )
}
