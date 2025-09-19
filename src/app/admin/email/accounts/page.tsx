import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import EmailAccountManagement from '@/components/admin/EmailAccountManagement'

export const metadata: Metadata = {
  title: 'Email Account Management - Admin Panel',
  description: 'Manage student and staff email accounts',
}

export default async function EmailAccountsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Account Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor student and staff email accounts
          </p>
        </div>
        <EmailAccountManagement />
      </div>
    </AdminLayout>
  )
}
