import { Lock } from 'lucide-react';

interface LockedPriceProps {
  amount: number | string;
  currency?: string;
}

const formatAmount = (value: number | string) => {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const LockedPrice = ({ amount, currency = '₹' }: LockedPriceProps) => (
  <div className="flex items-center gap-1 text-xs text-slate-900">
    <Lock className="h-3 w-3 text-muted-foreground" />
    <span className="font-semibold">{currency}{formatAmount(amount)}</span>
  </div>
);
