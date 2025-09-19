import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import PaymentCatalogManagement from '@/components/admin/PaymentCatalogManagement'

export const metadata: Metadata = {
  title: 'Payment Catalog Management - Admin Panel',
  description: 'Manage payment items, fees, and pricing',
}

export default async function PaymentCatalogPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Catalog Management</h1>
          <p className="text-muted-foreground">
            Manage fees, courses, and payment items with pricing and schedules
          </p>
        </div>
        <PaymentCatalogManagement />
      </div>
    </AdminLayout>
  )
}
