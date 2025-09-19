import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import PaymentTransactionMonitoring from '@/components/admin/PaymentTransactionMonitoring'

export const metadata: Metadata = {
  title: 'Payment Transaction Monitoring - Admin Panel',
  description: 'Monitor payment transactions and analytics',
}

export default async function PaymentTransactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Transaction Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor all payment transactions, analytics, and gateway performance
          </p>
        </div>
        <PaymentTransactionMonitoring />
      </div>
    </AdminLayout>
  )
}
