'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Receipt,
  RefreshCw
} from 'lucide-react'

interface PaymentItem {
  id: string
  name: string
  description: string
  feeType: 'ADMISSION' | 'SEMESTER' | 'EXAM' | 'LIBRARY' | 'HOSTEL' | 'TRANSPORT' | 'MISCELLANEOUS'
  amount: number
  currency: string
  dueDate: string | null
  lateFee: number
  discountPercentage: number
  isRecurring: boolean
  status: 'PENDING' | 'OVERDUE' | 'PAID'
}

interface Payment {
  id: string
  transactionId: string
  amount: number
  totalAmount: number
  currency: string
  feeType: string
  description: string
  gateway: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  receiptNumber: string | null
  receiptUrl: string | null
  createdAt: string
  completedAt: string | null
  catalogItem?: PaymentItem
}

interface PaymentStats {
  totalPending: number
  totalPaid: number
  totalOverdue: number
  pendingAmount: number
  paidAmount: number
  overdueAmount: number
}

export default function StudentPaymentsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  // State management
  const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>([])
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalPending: 0,
    totalPaid: 0,
    totalOverdue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load payment data
  const loadPaymentData = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.email) return
    
    setIsLoading(true)
    try {
      // Load pending payments
      const pendingResponse = await fetch('/api/student/payments/pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingPayments(pendingData.payments || [])
      }

      // Load payment history
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter !== 'ALL' ? statusFilter : '',
        feeType: feeTypeFilter !== 'ALL' ? feeTypeFilter : ''
      })

      const historyResponse = await fetch(`/api/student/payments/history?${params}`)
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setPaymentHistory(historyData.payments || [])
        setTotalPages(historyData.pagination?.pages || 1)
      }

      // Load payment statistics
      const statsResponse = await fetch('/api/student/payments/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setPaymentStats(statsData.stats || paymentStats)
      }
    } catch (error) {
      console.error('Failed to load payment data:', error)
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [status, session, currentPage, searchTerm, statusFilter, feeTypeFilter, toast])

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadPaymentData()
  }, [loadPaymentData])

  // Handle authentication redirects after all hooks
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/student/login')
  }

  // Handle payment initiation
  const handlePayNow = async (paymentItem: PaymentItem) => {
    try {
      const response = await fetch('/api/student/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          catalogItemId: paymentItem.id,
          amount: paymentItem.amount,
          feeType: paymentItem.feeType
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment gateway
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        }
      } else {
        throw new Error('Failed to initiate payment')
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Download receipt
  const downloadReceipt = async (payment: Payment) => {
    if (!payment.receiptUrl) return

    try {
      const response = await fetch(payment.receiptUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${payment.receiptNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download receipt:', error)
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      })
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return 'default'
      case 'PENDING':
      case 'PROCESSING':
        return 'secondary'
      case 'FAILED':
      case 'CANCELLED':
        return 'destructive'
      case 'OVERDUE':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Manage your fee payments and view transaction history</p>
          </div>
          <Button onClick={loadPaymentData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{paymentStats.totalPending}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(paymentStats.pendingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold">{paymentStats.totalPaid}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(paymentStats.paidAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">{paymentStats.totalOverdue}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(paymentStats.overdueAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          {/* Pending Payments Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Pending Payments</span>
                </CardTitle>
                <CardDescription>
                  Pay your pending fees and charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading payments...</span>
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All payments up to date!</h3>
                    <p className="text-gray-600">You have no pending payments at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{payment.name}</h4>
                                <p className="text-sm text-gray-600">{payment.description}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="outline">{payment.feeType}</Badge>
                                  {payment.dueDate && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <Calendar className="h-4 w-4" />
                                      <span>Due: {formatDate(payment.dueDate)}</span>
                                    </div>
                                  )}
                                  {payment.isRecurring && (
                                    <Badge variant="secondary">Recurring</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            {payment.discountPercentage > 0 && (
                              <p className="text-sm text-green-600">
                                {payment.discountPercentage}% discount applied
                              </p>
                            )}
                            {payment.lateFee > 0 && payment.status === 'OVERDUE' && (
                              <p className="text-sm text-red-600">
                                Late fee: {formatCurrency(payment.lateFee)}
                              </p>
                            )}
                            <div className="mt-3">
                              <Badge variant={getStatusBadgeVariant(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                            <Button
                              className="mt-3 w-full"
                              onClick={() => handlePayNow(payment)}
                              disabled={payment.status === 'PAID'}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="feeType">Fee Type</Label>
                    <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="ADMISSION">Admission</SelectItem>
                        <SelectItem value="SEMESTER">Semester</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                        <SelectItem value="LIBRARY">Library</SelectItem>
                        <SelectItem value="HOSTEL">Hostel</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                        <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadPaymentData} className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Payment History</span>
                </CardTitle>
                <CardDescription>
                  View your past transactions and download receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading payment history...</span>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                    <p className="text-gray-600">Your payment transactions will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {payment.status === 'SUCCESS' ? (
                                  <CheckCircle className="h-8 w-8 text-green-500" />
                                ) : payment.status === 'FAILED' ? (
                                  <XCircle className="h-8 w-8 text-red-500" />
                                ) : (
                                  <Clock className="h-8 w-8 text-yellow-500" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{payment.description}</h4>
                                <p className="text-sm text-gray-600">Transaction ID: {payment.transactionId}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="outline">{payment.feeType}</Badge>
                                  <Badge variant="outline">{payment.gateway}</Badge>
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(payment.createdAt)}</span>
                                  </div>
                                  {payment.receiptNumber && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <Receipt className="h-4 w-4" />
                                      <span>Receipt: {payment.receiptNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(payment.totalAmount)}
                            </div>
                            {payment.amount !== payment.totalAmount && (
                              <p className="text-sm text-gray-600">
                                Base: {formatCurrency(payment.amount)}
                              </p>
                            )}
                            <div className="mt-2">
                              <Badge variant={getStatusBadgeVariant(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                            {payment.receiptUrl && payment.status === 'SUCCESS' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => downloadReceipt(payment)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
