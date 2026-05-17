'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Eye, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function OrdersPage() {
  const [activeFilter, setActiveStatus] = useState('all');
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading, error } = useOrders();
  const orders = ordersData?.data || [];

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filters = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Fulfilled', value: 'fulfilled' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

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
              <TableHead className="text-[10px] font-bold uppercase text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No spare part orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell className="text-xs font-bold text-[#378ADD] px-4">#{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{order.customer_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{order.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      {order.items?.length || 0} items
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-right">₹{parseFloat(order.amount_total).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[9px] font-bold uppercase", getStatusStyle(order.status))}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[#378ADD]">
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
