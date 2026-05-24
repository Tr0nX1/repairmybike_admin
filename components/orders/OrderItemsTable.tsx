'use client';

import { Badge } from '@/components/ui/badge';
import { LockedPrice } from '@/components/ui/LockedPrice';
import { OrderItem } from '@/types/parts';

interface OrderItemsTableProps {
  items: OrderItem[];
  amountTotal: string;
}

const formatAmount = (value: number | string) => {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const OrderItemsTable = ({ items, amountTotal }: OrderItemsTableProps) => {
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = Number(item.total_price ?? String(Number(item.unit_price) * item.quantity));
    return sum + lineTotal;
  }, 0);

  const expectedTotal = Number(amountTotal || '0');
  const mismatch = subtotal !== expectedTotal;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Part Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          {items.length ? (
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item) => {
                const lineTotal = Number(item.total_price ?? String(Number(item.unit_price) * item.quantity));
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold">{item.part_name || 'Part'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.sku || '-'}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      <LockedPrice amount={item.unit_price} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">₹{formatAmount(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No order items yet.
                </td>
              </tr>
            </tbody>
          )}
          <tfoot>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider">
              <td colSpan={4} className="px-4 py-3 text-right">Subtotal</td>
              <td className="px-4 py-3 text-right">₹{formatAmount(subtotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {mismatch && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <div className="font-semibold">Order total mismatch detected.</div>
          <div className="text-right">
            Expected ₹{formatAmount(expectedTotal)}
          </div>
        </div>
      )}
    </div>
  );
};
