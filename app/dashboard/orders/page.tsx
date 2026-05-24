'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { useOrders } from '@/hooks/useOrders';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_STATUS, type OrderStatus } from '@/types/enums';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function OrdersPage() {
  const [activeFilter, setActiveStatus] = useState<'all' | OrderStatus>('all');
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: ordersData, isLoading, error } = useOrders({
    status: activeFilter === 'all' ? undefined : activeFilter,
  });
  const orders = ordersData?.data || [];

  const filters = [
    { label: 'All Orders', value: 'all' },
    { label: 'Created', value: ORDER_STATUS.CREATED },
    { label: 'Confirmed', value: ORDER_STATUS.CONFIRMED },
    { label: 'Fulfilled', value: ORDER_STATUS.FULFILLED },
    { label: 'Cancelled', value: ORDER_STATUS.CANCELLED },
  ] as const;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-xl border bg-white border-dashed">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-sm font-bold text-foreground uppercase tracking-tight">Access Restricted / API Error</p>
        <div className="bg-slate-50 border p-3 rounded mt-2 max-w-md text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Backend Message:</p>
            <p className="text-xs font-mono font-bold text-red-600">{error.message}</p>
        </div>
        <Button 
            variant="outline" 
            size="sm" 
            className="mt-6 text-[10px] font-bold uppercase gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
        >
            <RefreshCw className="h-3 w-3" /> Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Spare Part Orders" 
        subtitle="Manage inventory purchases and part deliveries"
        badge={{ label: orders.length }}
      />

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveStatus(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border",
              activeFilter === f.value
                ? "bg-[#378ADD] text-white border-[#378ADD] shadow-sm"
                : "bg-white text-muted-foreground hover:border-[#378ADD] hover:text-[#378ADD]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              <TableHead className="w-[100px] text-[10px] font-bold uppercase py-3 px-4">Order ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Customer</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Items</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right">Total</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Payment</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No spare part orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  <TableCell className="text-xs font-bold text-[#378ADD] px-4">#{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{order.customer_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{order.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.items?.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-700 line-clamp-1">
                            {item.part_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          +{order.items.length - 2} more
                        </span>
                      )}
                      {(!order.items || order.items.length === 0) && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          No items
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-right">₹{parseFloat(order.amount_total).toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.payment_status} type="payment" />
                  </TableCell>
                  <TableCell className="text-right px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#378ADD]"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/dashboard/orders/${order.id}`);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
