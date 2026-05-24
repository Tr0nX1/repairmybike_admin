import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

interface StockBadgeProps {
  stock_qty: number;
}

export const StockBadge = ({ stock_qty }: StockBadgeProps) => {
  if (stock_qty === 0) {
    return (
      <Badge variant="destructive" className="text-[10px] font-bold uppercase px-2 h-5">
        Out of Stock
      </Badge>
    );
  }

  if (stock_qty <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge variant="outline" className="text-[10px] font-bold uppercase px-2 h-5 border-yellow-500 text-yellow-600 bg-yellow-50">
        Low Stock ({stock_qty})
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-[10px] font-bold uppercase px-2 h-5 border-green-500 text-green-600 bg-green-50">
      In Stock ({stock_qty})
    </Badge>
  );
};
