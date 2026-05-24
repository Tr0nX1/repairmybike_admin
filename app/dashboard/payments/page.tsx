'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { Search, RefreshCcw, ArrowUpRight, CreditCard } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';

const paymentStatusClasses: Record<string, string> = {
  created: 'bg-amber-100 text-amber-700',
  authorized: 'bg-sky-100 text-sky-700',
  captured: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-slate-100 text-slate-700',
};

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function PaymentsPage() {
  const { data: payments = [], isLoading, refetch } = usePayments();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        searchText.trim().length === 0 ||
        payment.booking.toString().includes(searchText.trim()) ||
        (payment.razorpay_order_id || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (payment.razorpay_payment_id || '').toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod =
        methodFilter === 'all' ||
        (payment.payment_method || 'manual').toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchText, statusFilter, methodFilter]);

  const summary = useMemo(() => {
    const totalAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const captured = payments.filter((item) => item.status === 'captured').length;
    const pending = payments.filter((item) => ['created', 'authorized'].includes(item.status)).length;
    const failed = payments.filter((item) => ['failed', 'refunded'].includes(item.status)).length;

    return {
      totalAmount,
      captured,
      pending,
      failed,
    };
  }, [payments]);

  const columns = [
    {
      header: 'Booking',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <div className="flex flex-col gap-1 py-1">
          <Link href={`/dashboard/bookings/${payment.booking}`} className="text-sm font-semibold text-[#378ADD] inline-flex items-center gap-1">
            #{payment.booking}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {payment.currency}
          </span>
        </div>
      ),
      width: '18%',
    },
    {
      header: 'Amount',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <span className="text-sm font-semibold text-foreground">{formatCurrency(payment.amount)}</span>
      ),
      width: '16%',
    },
    {
      header: 'Method',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <span className="text-sm text-slate-700 capitalize">
          {payment.payment_method || 'manual'}
        </span>
      ),
      width: '16%',
    },
    {
      header: 'Status',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <Badge className={`text-[10px] font-bold uppercase ${paymentStatusClasses[payment.status] || 'bg-slate-100 text-slate-700'}`}>
          {payment.status}
        </Badge>
      ),
      width: '16%',
    },
    {
      header: 'Gateway IDs',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <div className="flex flex-col gap-1 text-[11px] text-slate-600">
          <span>{payment.razorpay_order_id || '—'}</span>
          <span>{payment.razorpay_payment_id || '—'}</span>
        </div>
      ),
      width: '24%',
    },
    {
      header: 'Created',
      accessor: (payment: (typeof filteredPayments)[number]) => (
        <span className="text-[11px] text-slate-500">
          {new Date(payment.created_at).toLocaleString()}
        </span>
      ),
      width: '20%',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track booking payments, gateway activity, and settlement status across the admin console"
        actions={
          <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase gap-2" onClick={() => refetch()}>
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Total Volume</p>
            <p className="mt-3 text-lg font-bold text-foreground">{formatCurrency(summary.totalAmount.toString())}</p>
          </CardContent>
        </Card>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Captured</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.captured}</p>
          </CardContent>
        </Card>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pending</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Issues</p>
            <p className="mt-3 text-lg font-bold text-foreground">{summary.failed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search booking, order, or payment ID"
              className="pl-9 text-xs"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="authorized">Authorized</SelectItem>
              <SelectItem value="captured">Captured</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Method</Label>
          <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value || 'all')}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredPayments}
          isLoading={isLoading}
          emptyMessage="No payment records yet. Online payments will appear here once payment gateway integration is activated. Cash collections are tracked in the Cash tab."
        />
      </div>
    </div>
  );
}
