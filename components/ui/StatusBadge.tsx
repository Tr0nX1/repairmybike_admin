'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'payment' | 'quick_service';
  className?: string;
}

export const StatusBadge = ({ status, type = 'booking', className }: StatusBadgeProps) => {
  const getBookingStyles = (s: string): string | null => {
    switch (s.toLowerCase()) {
      case 'pending':
        return 'bg-[#FAEEDA] text-[#633806] border-none hover:bg-[#FAEEDA]';
      case 'confirmed':
        return 'bg-[#E6F1FB] text-[#0C447C] border-none hover:bg-[#E6F1FB]';
      case 'created':
        return 'bg-slate-100 text-slate-700 border-none hover:bg-slate-100';
      case 'en_route':
      case 'started':
      case 'in_progress':
        return 'bg-[#EEEDFE] text-[#3C3489] border-none hover:bg-[#EEEDFE]';
      case 'arrived':
        return 'bg-[#E1F5EE] text-[#085041] border-none hover:bg-[#E1F5EE]';
      case 'completed':
      case 'fulfilled':
        return 'bg-[#EAF3DE] text-[#27500A] border-none hover:bg-[#EAF3DE]';
      case 'cancelled':
        return 'bg-[#FCEBEB] text-[#791F1F] border-none hover:bg-[#FCEBEB]';
      default:
        return null;
    }
  };

  const getPaymentStyles = (s: string): string | null => {
    switch (s.toLowerCase()) {
      case 'pending':
      case 'cash_due':
        return 'bg-[#FAEEDA] text-[#633806] border-none hover:bg-[#FAEEDA]';
      case 'completed':
      case 'cash_paid':
        return 'bg-[#EAF3DE] text-[#27500A] border-none hover:bg-[#EAF3DE]';
      default:
        return null;
    }
  };

  const getQuickServiceStyles = (s: string): string | null => {
    switch (s.toLowerCase()) {
      case 'initiated':
        return 'bg-blue-100 text-blue-800 border-none hover:bg-blue-100';
      case 'contacted':
        return 'bg-amber-100 text-amber-800 border-none hover:bg-amber-100';
      case 'mechanic_dispatched':
        return 'bg-purple-100 text-purple-800 border-none hover:bg-purple-100';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-none hover:bg-orange-100';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-none hover:bg-emerald-100';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-none hover:bg-rose-100';
      default:
        return null;
    }
  };

  const style = type === 'booking' 
    ? getBookingStyles(status) 
    : type === 'quick_service' 
      ? getQuickServiceStyles(status)
      : getPaymentStyles(status);

  if (style === null) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-md border-slate-300 text-slate-400 bg-transparent", 
          className
        )}
      >
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-md", 
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};
