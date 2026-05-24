'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, Loader2, Package, Phone, User, WalletCards } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { OrderItemsTable } from '@/components/orders/OrderItemsTable';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import { getValidNextOrderStatuses, isTerminalOrderStatus } from '@/lib/order-transitions';
import { useOrderDetail } from '@/hooks/useOrderDetail';
import { ORDER_PAYMENT_STATUS, ORDER_STATUS, type OrderStatus } from '@/types/enums';
import { toast } from 'sonner';

const labelForStatus = (status: string) => status.replace('_', ' ');

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const orderId = Number(id);
  const { data: order, isLoading, transitionStatus, markCashPaid } = useOrderDetail(orderId);
  const [statusNotes, setStatusNotes] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const nextStatuses = getValidNextOrderStatuses(order?.status);
  const items = order?.items || [];
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const lineTotal = Number(item.total_price || Number(item.unit_price) * item.quantity);
        return sum + lineTotal;
      }, 0),
    [items]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#378ADD]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-sm font-bold text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => router.push('/dashboard/orders')}>Back to orders</Button>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!pendingStatus) return;
    try {
      await transitionStatus.mutateAsync({ status: pendingStatus, notes: statusNotes });
      setPendingStatus(null);
      setStatusNotes('');
    } catch (error) {
      const code = (error as { code?: string }).code;
      toast.error(code === 'INVALID_TRANSITION' ? 'This transition is not allowed' : (error as Error).message);
    }
  };

  const handleMarkCashPaid = async () => {
    try {
      await markCashPaid.mutateAsync({
        amount_received: amountReceived || order.amount_total,
        notes: paymentNotes,
      });
      setPaymentNotes('');
      setAmountReceived('');
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'ALREADY_PAID') {
        toast.error('This order is already marked cash paid');
        return;
      }
      if (code === 'ORDER_CANCELLED') {
        toast.error('Cancelled orders cannot be marked cash paid');
        return;
      }
      toast.error((error as Error).message || 'Failed to mark cash paid');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.id}`}
        subtitle={`Created ${format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}`}
        badge={{ label: order.status }}
        actions={
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => router.push('/dashboard/orders')}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to orders
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Order Header</CardTitle>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{order.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <Separator />
              <p className="text-muted-foreground">{order.address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-[#378ADD]" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsTable items={items} amountTotal={order.amount_total} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={statusNotes}
                onChange={(event) => setStatusNotes(event.target.value)}
                placeholder="Optional status note"
                rows={3}
                className="text-xs"
              />
              {isTerminalOrderStatus(order.status) || nextStatuses.length === 0 ? (
                <div className="rounded-md border border-dashed bg-slate-50 p-3 text-xs text-muted-foreground">
                  No further status transitions are available.
                </div>
              ) : (
                <div className="grid gap-2">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={status === ORDER_STATUS.CANCELLED ? 'destructive' : 'outline'}
                      className="h-9 justify-between text-xs font-bold uppercase"
                      disabled={transitionStatus.isPending}
                      onClick={() => setPendingStatus(status)}
                    >
                      {labelForStatus(status)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {order.payment_status === ORDER_PAYMENT_STATUS.CASH_DUE && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <WalletCards className="h-4 w-4 text-[#10B981]" />
                  Cash Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(event) => setAmountReceived(event.target.value)}
                  placeholder={order.amount_total}
                  className="h-10 text-sm font-bold"
                />
                <Textarea
                  value={paymentNotes}
                  onChange={(event) => setPaymentNotes(event.target.value)}
                  placeholder="Optional payment note"
                  rows={3}
                  className="text-xs"
                />
                <Button
                  className="w-full bg-[#10B981] text-xs font-bold uppercase hover:bg-[#059669]"
                  disabled={order.status === ORDER_STATUS.CANCELLED || markCashPaid.isPending}
                  onClick={handleMarkCashPaid}
                >
                  {markCashPaid.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Mark Cash Paid
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity / Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Tracking: {order.tracking_number || 'Not assigned'}</p>
              <p>Courier: {order.courier_name || 'Not assigned'}</p>
              <p>ActivityLog entries for order status and payment changes are written by the backend workflow endpoints.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title="Confirm status change"
        description={`Change order #${order.id} from ${labelForStatus(order.status)} to ${pendingStatus ? labelForStatus(pendingStatus) : ''}?`}
        confirmLabel="Change status"
        variant={pendingStatus === ORDER_STATUS.CANCELLED ? 'danger' : 'default'}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
