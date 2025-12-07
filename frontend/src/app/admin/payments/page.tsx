'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  MoreVertical,
  Eye,
  RefreshCcw,
  Download,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, Column } from '@/components/admin';
import { toast } from 'sonner';

interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  testSeries?: {
    _id: string;
    title: string;
  };
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  itemType: 'course' | 'testSeries';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Summary {
  _id: string;
  count: number;
  totalAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState<Summary[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundDialog, setRefundDialog] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(itemTypeFilter !== 'all' && { itemType: itemTypeFilter }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setPayments(data.data.payments);
        setPagination(data.data.pagination);
        setSummary(data.data.summary || []);
      }
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, itemTypeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefund = async () => {
    if (!refundDialog) return;
    setIsRefunding(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments/${refundDialog._id}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: refundAmount ? Number(refundAmount) : undefined,
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Refund initiated successfully');
        fetchPayments();
        setRefundDialog(null);
        setRefundAmount('');
      } else {
        toast.error(data.error?.message || 'Failed to process refund');
      }
    } catch (error) {
      toast.error('Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-600 text-white';
      case 'pending':
        return 'bg-amber-600 text-white';
      case 'failed':
        return 'bg-red-600 text-white';
      case 'refunded':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <RefreshCcw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSummaryStats = () => {
    const completed = summary.find((s) => s._id === 'completed');
    const pending = summary.find((s) => s._id === 'pending');
    const refunded = summary.find((s) => s._id === 'refunded');

    return {
      totalRevenue: completed?.totalAmount || 0,
      completedCount: completed?.count || 0,
      pendingCount: pending?.count || 0,
      refundedAmount: refunded?.totalAmount || 0,
    };
  };

  const stats = getSummaryStats();

  const columns: Column<Payment>[] = [
    {
      key: 'user',
      header: 'Customer',
      cell: (payment) => (
        <div>
          <p className="font-medium text-foreground">{payment.user?.name || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">{payment.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      cell: (payment) => (
        <div>
          <p className="font-medium text-foreground line-clamp-1">
            {payment.course?.title || payment.testSeries?.title || '-'}
          </p>
          <Badge variant="secondary" className="bg-muted text-xs">
            {payment.itemType === 'course' ? 'Course' : 'Test Series'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment) => (
        <span className="font-semibold text-foreground">₹{payment.amount}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment) => (
        <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1 w-fit`}>
          {getStatusIcon(payment.status)}
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (payment) => (
        <span className="text-foreground text-sm">{formatDate(payment.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem
              className="text-foreground hover:bg-muted"
              onClick={() => setSelectedPayment(payment)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {payment.status === 'completed' && (
              <DropdownMenuItem
                className="text-foreground hover:bg-muted"
                onClick={() => {
                  setRefundDialog(payment);
                  setRefundAmount(String(payment.amount));
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Initiate Refund
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">View and manage all transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.completedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold text-foreground">₹{stats.refundedAmount.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <RefreshCcw className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border text-foreground">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Status</SelectItem>
            <SelectItem value="completed" className="text-foreground">Completed</SelectItem>
            <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
            <SelectItem value="failed" className="text-foreground">Failed</SelectItem>
            <SelectItem value="refunded" className="text-foreground">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border text-foreground">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Types</SelectItem>
            <SelectItem value="course" className="text-foreground">Courses</SelectItem>
            <SelectItem value="testSeries" className="text-foreground">Test Series</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
        keyExtractor={(payment) => payment._id}
        emptyMessage="No payments found"
        emptyIcon={<CreditCard className="h-12 w-12 text-muted-foreground" />}
      />

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(selectedPayment.status)}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-xl font-bold text-foreground">₹{selectedPayment.amount}</span>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Customer</span>
                  <p className="text-foreground">{selectedPayment.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.user?.email}</p>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Item</span>
                  <p className="text-foreground">
                    {selectedPayment.course?.title || selectedPayment.testSeries?.title}
                  </p>
                  <Badge variant="secondary" className="bg-muted text-xs mt-1">
                    {selectedPayment.itemType === 'course' ? 'Course' : 'Test Series'}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Date</span>
                  <p className="text-foreground">{formatDate(selectedPayment.createdAt)}</p>
                </div>

                {selectedPayment.razorpayOrderId && (
                  <div>
                    <span className="text-xs text-muted-foreground">Order ID</span>
                    <p className="text-foreground font-mono text-sm">{selectedPayment.razorpayOrderId}</p>
                  </div>
                )}

                {selectedPayment.razorpayPaymentId && (
                  <div>
                    <span className="text-xs text-muted-foreground">Payment ID</span>
                    <p className="text-foreground font-mono text-sm">{selectedPayment.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={!!refundDialog} onOpenChange={() => setRefundDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Initiate Refund</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Process a refund for this payment. Enter the amount to refund (partial or full).
            </DialogDescription>
          </DialogHeader>
          {refundDialog && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="text-xl font-bold text-foreground">₹{refundDialog.amount}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundAmount" className="text-foreground">
                  Refund Amount (₹)
                </Label>
                <Input
                  id="refundAmount"
                  type="number"
                  min="1"
                  max={refundDialog.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty or enter full amount for complete refund
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialog(null)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={isRefunding}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isRefunding ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
