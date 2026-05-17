'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'payment';
  className?: string;
}

export const StatusBadge = ({ status, type = 'booking', className }: StatusBadgeProps) => {
  const getBookingStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending':
        return 'bg-[#FAEEDA] text-[#633806] border-none hover:bg-[#FAEEDA]';
      case 'confirmed':
        return 'bg-[#E6F1FB] text-[#0C447C] border-none hover:bg-[#E6F1FB]';
      case 'en_route':
      case 'started':
        return 'bg-[#EEEDFE] text-[#3C3489] border-none hover:bg-[#EEEDFE]';
      case 'arrived':
        return 'bg-[#E1F5EE] text-[#085041] border-none hover:bg-[#E1F5EE]';
      case 'completed':
        return 'bg-[#EAF3DE] text-[#27500A] border-none hover:bg-[#EAF3DE]';
      case 'cancelled':
        return 'bg-[#FCEBEB] text-[#791F1F] border-none hover:bg-[#FCEBEB]';
      default:
        return 'bg-slate-100 text-slate-700 border-none';
    }
  };

  const getPaymentStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending':
        return 'bg-[#FAEEDA] text-[#633806] border-none hover:bg-[#FAEEDA]';
      case 'completed':
        return 'bg-[#EAF3DE] text-[#27500A] border-none hover:bg-[#EAF3DE]';
      default:
        return 'bg-slate-100 text-slate-700 border-none';
    }
  };

  const style = type === 'booking' ? getBookingStyles(status) : getPaymentStyles(status);

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-md", 
        style,
        className
      )}
    >
      {status}
    </Badge>
  );
};
