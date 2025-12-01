'use client';

import { useState } from 'react';
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

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-11-30',
    items: [
      {
        type: 'course',
        title: 'RAS Complete Course 2024',
        category: 'RAS',
        price: 1999,
        validityDays: 365,
      },
    ],
    total: 1999,
    status: 'completed',
    paymentMethod: 'UPI',
    transactionId: 'TXN123456789',
    invoiceUrl: '#',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-11-25',
    items: [
      {
        type: 'test-series',
        title: 'RAS Prelims Mock Test Series 2024',
        category: 'RAS',
        price: 999,
        validityDays: 180,
      },
    ],
    total: 999,
    status: 'completed',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN987654321',
    invoiceUrl: '#',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-11-20',
    items: [
      {
        type: 'course',
        title: 'REET Level 1 & 2 Complete',
        category: 'REET',
        price: 999,
        validityDays: 180,
      },
      {
        type: 'test-series',
        title: 'REET Level 1 Practice Tests',
        category: 'REET',
        price: 599,
        validityDays: 120,
      },
    ],
    total: 1598,
    status: 'completed',
    paymentMethod: 'Net Banking',
    transactionId: 'TXN456789123',
    invoiceUrl: '#',
  },
  {
    id: 'ORD-2024-004',
    date: '2024-11-15',
    items: [
      {
        type: 'test-series',
        title: 'Rajasthan Patwar Test Series',
        category: 'PATWAR',
        price: 399,
        validityDays: 90,
      },
    ],
    total: 399,
    status: 'refunded',
    paymentMethod: 'UPI',
    transactionId: 'TXN789123456',
    refundReason: 'Customer requested refund within 7 days',
  },
  {
    id: 'ORD-2024-005',
    date: '2024-11-10',
    items: [
      {
        type: 'course',
        title: 'Rajasthan GK Complete Course',
        category: 'OTHER',
        price: 699,
        validityDays: 180,
      },
    ],
    total: 699,
    status: 'failed',
    paymentMethod: 'Credit Card',
    failureReason: 'Payment declined by bank',
  },
];

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
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  // Filter orders
  const filteredOrders = mockOrders.filter((order) => {
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Stats
  const totalSpent = mockOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = mockOrders.filter((o) => o.status === 'completed').length;

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
              {mockOrders.filter((o) => o.status === 'completed').length}
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
      {filteredOrders.length === 0 ? (
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
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
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
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{order.date}</span>
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
                                    <p className="font-medium">{selectedOrder.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">{selectedOrder.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Payment Method</p>
                                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Transaction ID</p>
                                    <p className="font-medium font-mono text-xs">
                                      {selectedOrder.transactionId || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                  <p className="mb-2 font-medium">Items</p>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between rounded-lg bg-muted p-3"
                                      >
                                        <div className="flex items-center gap-3">
                                          {item.type === 'course' ? (
                                            <BookOpen className="h-5 w-5 text-primary" />
                                          ) : (
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                          )}
                                          <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {item.validityDays} days validity
                                            </p>
                                          </div>
                                        </div>
                                        <p className="font-medium">₹{item.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                  <p className="font-semibold">Total</p>
                                  <p className="text-xl font-bold">₹{selectedOrder.total}</p>
                                </div>

                                {selectedOrder.status === 'completed' &&
                                  selectedOrder.invoiceUrl && (
                                    <Button className="w-full" variant="outline">
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Invoice
                                    </Button>
                                  )}

                                {selectedOrder.status === 'failed' && (
                                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    <p className="font-medium">Failure Reason:</p>
                                    <p>{selectedOrder.failureReason}</p>
                                  </div>
                                )}

                                {selectedOrder.status === 'refunded' && (
                                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                    <p className="font-medium">Refund Reason:</p>
                                    <p>{selectedOrder.refundReason}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                  item.type === 'course' ? 'bg-primary/10' : 'bg-emerald-100'
                                }`}
                              >
                                {item.type === 'course' ? (
                                  <BookOpen className="h-5 w-5 text-primary" />
                                ) : (
                                  <FileText className="h-5 w-5 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={categoryColors[item.category]}
                                  >
                                    {item.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {item.validityDays} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="font-medium text-foreground">₹{item.price}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-lg font-bold text-foreground">
                          ₹{order.total}
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
