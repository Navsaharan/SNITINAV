'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  BarChart, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface PaymentTransaction {
  id: string
  transactionId: string
  student: {
    email: string
    displayName: string
    type: string
  }
  feeType: string
  totalAmount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  gateway: string
  paymentMethod: string
  createdAt: string
  completedAt: string | null
  dueDate: string | null
}

interface PaymentAnalytics {
  revenue: {
    _sum: { totalAmount: number }
    _count: number
    _avg: { totalAmount: number }
  }
  statusBreakdown: Array<{
    status: string
    _count: number
    _sum: { totalAmount: number }
  }>
  gatewayPerformance: Array<{
    gateway: string
    _count: number
    _sum: { totalAmount: number }
    _avg: { totalAmount: number }
  }>
}

export default function PaymentTransactionMonitoring() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    gateway: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 20
  })

  // Load transactions
  useEffect(() => {
    loadTransactions()
  }, [filters])

  // Load analytics
  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.gateway && { gateway: filters.gateway }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount })
      })

      const response = await fetch(`/api/admin/payments/transactions?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(data.transactions)
      } else {
        console.error('Failed to load transactions:', data.error)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      // Use client-side safe date generation
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const response = await fetch('/api/admin/payments/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analytics',
          analytics: {
            timeRange: {
              start: thirtyDaysAgo.toISOString(),
              end: now.toISOString()
            },
            metrics: ['revenue', 'status', 'gateways']
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      } else {
        console.error('Analytics API error:', data.error)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleViewTransaction = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDialog(true)
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/payments/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          filters: filters
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Create and download CSV
        const csv = convertToCSV(data.data)
        downloadCSV(csv, 'payment-transactions.csv')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      case 'REFUNDED':
        return <RefreshCw className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const TransactionDetailsDialog = () => {
    if (!selectedTransaction) return null

    return (
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the payment transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Transaction Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Transaction ID</Label>
                <p className="text-sm font-mono">{selectedTransaction.transactionId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div>
              <Label className="text-sm font-medium">Student Information</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded">
                <p className="font-medium">{selectedTransaction.student.displayName}</p>
                <p className="text-sm text-gray-600">{selectedTransaction.student.email}</p>
                <Badge variant="outline">{selectedTransaction.student.type}</Badge>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedTransaction.totalAmount, selectedTransaction.currency)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fee Type</Label>
                <p className="text-sm">{selectedTransaction.feeType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment Gateway</Label>
                <p className="text-sm">{selectedTransaction.gateway}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment Method</Label>
                <p className="text-sm">{selectedTransaction.paymentMethod}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Completed</Label>
                <p className="text-sm">
                  {selectedTransaction.completedAt 
                    ? new Date(selectedTransaction.completedAt).toLocaleString()
                    : 'Not completed'
                  }
                </p>
              </div>
            </div>

            {selectedTransaction.dueDate && (
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <p className="text-sm">{new Date(selectedTransaction.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.revenue._sum.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold">{analytics.revenue._count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Average Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.revenue._avg.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {analytics.statusBreakdown.length > 0
                      ? Math.round((analytics.statusBreakdown.find(s => s.status === 'SUCCESS')?._count || 0) / analytics.revenue._count * 100)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Transaction Monitoring
          </CardTitle>
          <CardDescription>
            Monitor all payment transactions, analytics, and gateway performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.gateway} onValueChange={(value) => setFilters({ ...filters, gateway: value === 'all' ? '' : value, page: 1 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Gateways" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gateways</SelectItem>
                    <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                    <SelectItem value="PAYU">PayU</SelectItem>
                    <SelectItem value="CASHFREE">Cashfree</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value, page: 1 })}
                />
                <Input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value, page: 1 })}
                />
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Date Range */}
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <div className="font-mono text-sm">{transaction.transactionId}</div>
                              <div className="text-xs text-gray-500">{transaction.feeType}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.student.displayName}</div>
                              <div className="text-sm text-gray-500">{transaction.student.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(transaction.totalAmount, transaction.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transaction.status)}
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{transaction.gateway}</div>
                              <div className="text-xs text-gray-500">{transaction.paymentMethod}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Payment analytics and reporting charts will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Payment reconciliation tools will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TransactionDetailsDialog />
    </div>
  )
}
