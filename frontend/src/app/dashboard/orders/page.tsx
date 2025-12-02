'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  BookOpen,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types for payment history
interface PaymentItem {
  course?: { _id: string; title: string; category: string };
  testSeries?: { _id: string; title: string; category: string };
  itemType: 'course' | 'test_series';
}

interface PaymentHistory {
  orderId: string;
  amount: number;
  status: string;
  createdAt: string;
  razorpayPaymentId?: string;
  course?: { _id: string; title: string; category: string };
  testSeries?: { _id: string; title: string; category: string };
  itemType: 'course' | 'test_series';
}

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
  },
  refunded: {
    label: 'Refunded',
    icon: AlertCircle,
    color: 'bg-blue-100 text-blue-700',
  },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PaymentHistory | null>(null);

  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setOrders(data.data.payments || []);
        } else {
          console.error('Failed to fetch payment history:', data.error);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (searchQuery && !order.orderId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Stats
  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);
  const totalOrders = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">View your purchase history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {totalOrders}
            </p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No orders found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't made any purchases yet"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const itemTitle = order.course?.title || order.testSeries?.title || 'Unknown Item';
            const itemCategory = order.course?.category || order.testSeries?.category || 'OTHER';
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{order.orderId}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{orderDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={status.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Order ID</p>
                                    <p className="font-medium">{selectedOrder.orderId}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{selectedOrder.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Payment ID</p>
                                    <p className="font-medium font-mono text-xs">
                                      {selectedOrder.razorpayPaymentId || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                  <p className="mb-2 font-medium">Item</p>
                                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-3">
                                      {selectedOrder.course ? (
                                        <BookOpen className="h-5 w-5 text-primary" />
                                      ) : (
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                      )}
                                      <div>
                                        <p className="font-medium">
                                          {selectedOrder.course?.title || selectedOrder.testSeries?.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {selectedOrder.itemType === 'course' ? 'Course' : 'Test Series'}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="font-medium">₹{selectedOrder.amount}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                  <p className="font-semibold">Total</p>
                                  <p className="text-xl font-bold">₹{selectedOrder.amount}</p>
                                </div>

                                {selectedOrder.status === 'completed' && (
                                  <Button className="w-full" variant="outline" asChild>
                                    <Link href={selectedOrder.course ? `/dashboard/courses` : `/dashboard/test-series`}>
                                      View {selectedOrder.course ? 'Course' : 'Test Series'}
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              order.course ? 'bg-primary/10' : 'bg-emerald-100'
                            }`}
                          >
                            {order.course ? (
                              <BookOpen className="h-5 w-5 text-primary" />
                            ) : (
                              <FileText className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{itemTitle}</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={categoryColors[itemCategory] || categoryColors.OTHER}
                              >
                                {itemCategory}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {order.itemType === 'course' ? 'Course' : 'Test Series'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="font-medium text-foreground">₹{order.amount}</p>
                      </div>

                      {/* Order Total */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-lg font-bold text-foreground">
                          ₹{order.amount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
