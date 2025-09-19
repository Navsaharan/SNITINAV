import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import PaymentGatewayManagement from '@/components/admin/PaymentGatewayManagement'

export const metadata: Metadata = {
  title: 'Payment Gateway Management - Admin Panel',
  description: 'Configure and manage payment gateways',
}

export default async function PaymentGatewaysPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Gateway Management</h1>
          <p className="text-muted-foreground">
            Configure payment gateways, API keys, and processing settings
          </p>
        </div>
        <PaymentGatewayManagement />
      </div>
    </AdminLayout>
  )
}
