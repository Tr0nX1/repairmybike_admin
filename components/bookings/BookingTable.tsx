'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Booking } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Eye, UserPlus, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onAssign: (id: number) => void;
  onView: (id: number) => void;
}

export const BookingTable = ({ bookings, isLoading, onAssign, onView }: BookingTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              {[...Array(9)].map((_, i) => (
                <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(9)].map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-md border bg-white border-dashed">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No bookings found</p>
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-slate-50/50">
            <TableHead className="w-[40px] px-4"><Checkbox /></TableHead>
            <TableHead className="w-[80px] text-[10px] font-bold uppercase py-3">ID</TableHead>
            <TableHead className="w-[180px] text-[10px] font-bold uppercase">Customer</TableHead>
            <TableHead className="w-[150px] text-[10px] font-bold uppercase">Vehicle</TableHead>
            <TableHead className="w-[140px] text-[10px] font-bold uppercase">Date/Time</TableHead>
            <TableHead className="w-[120px] text-[10px] font-bold uppercase">Status</TableHead>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase">Payment</TableHead>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase text-right">Total</TableHead>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase text-right px-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const isUnassigned = booking.booking_status === 'pending';
            
            return (
              <TableRow 
                key={booking.id} 
                className={cn(
                  "hover:bg-slate-50 transition-colors cursor-pointer group",
                  isUnassigned && "border-l-2 border-l-amber-500"
                )}
                onClick={() => onView(booking.id)}
              >
                <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell className="text-xs font-bold text-[#378ADD]">#{booking.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{booking.customer.name}</span>
                    <span className="text-[10px] text-muted-foreground">{booking.customer.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium">{booking.vehicle_model_name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-foreground font-medium">{booking.appointment_date}</span>
                    <span className="text-[10px] text-muted-foreground">{booking.appointment_time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.booking_status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={booking.payment_status} type="payment" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold text-center">
                      {booking.payment_method}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-bold text-right">
                  ₹{parseFloat(booking.total_amount).toLocaleString()}
                </TableCell>
                <TableCell className="text-right px-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnassigned && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(booking.id);
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-[#378ADD]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
