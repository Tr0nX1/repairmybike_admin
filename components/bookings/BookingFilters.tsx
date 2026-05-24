'use client';

import { useState } from 'react';
import { Search, Calendar, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBookingStats } from '@/hooks/useBookingStats';
import {
  BOOKING_PAYMENT_METHOD,
  BOOKING_STATUS,
  type BookingPaymentMethod,
  type BookingStatus,
} from '@/types/enums';

type BookingFilterValues = {
  status?: BookingStatus;
  date?: string;
  search?: string;
  payment_method?: BookingPaymentMethod;
};

interface BookingFiltersProps {
  onChange: (filters: BookingFilterValues) => void;
}

export const BookingFilters = ({ onChange }: BookingFiltersProps) => {
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const { data: stats } = useBookingStats();

  const statuses = [
    { label: 'All', value: 'all', count: stats?.total_bookings },
    { label: 'Pending', value: BOOKING_STATUS.PENDING, count: stats?.booking_status?.pending },
    { label: 'Confirmed', value: BOOKING_STATUS.CONFIRMED, count: stats?.booking_status?.confirmed },
    { label: 'Started', value: BOOKING_STATUS.STARTED, count: stats?.booking_status?.started },
    { label: 'Completed', value: BOOKING_STATUS.COMPLETED, count: stats?.booking_status?.completed },
    { label: 'Cancelled', value: BOOKING_STATUS.CANCELLED, count: stats?.booking_status?.cancelled },
  ] as const;

  const handleStatusChange = (val: 'all' | BookingStatus) => {
    setActiveStatus(val);
    onChange({ status: val === 'all' ? undefined : val });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    // TODO: Add debounce logic here if needed, or handle in parent
    onChange({ search: val });
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Status Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
              activeStatus === s.value
                ? "bg-[#378ADD] text-white shadow-sm"
                : "bg-white text-muted-foreground border hover:border-[#378ADD] hover:text-[#378ADD]"
            )}
          >
            {s.label}
            {s.count !== undefined && (
              <span className={cn(
                "px-1.5 rounded-full text-[10px]",
                activeStatus === s.value ? "bg-white/20 text-white" : "bg-slate-100 text-muted-foreground"
              )}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Secondary Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer name or phone..."
            className="pl-9 h-9 text-xs bg-white"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              className="pl-9 h-9 text-xs bg-white w-[160px]"
              onChange={(e) => onChange({ date: e.target.value })}
            />
          </div>

          <Select
            onValueChange={(val: string | null) =>
              onChange({
                payment_method:
                  val && val !== 'all' ? (val as BookingPaymentMethod) : undefined,
              })
            }
          >
            <SelectTrigger className="h-9 w-[150px] text-xs bg-white">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value={BOOKING_PAYMENT_METHOD.CASH}>Cash</SelectItem>
              <SelectItem value={BOOKING_PAYMENT_METHOD.RAZORPAY}>Razorpay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
