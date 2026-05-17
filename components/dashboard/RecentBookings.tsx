'use client';

import { useBookings } from '@/hooks/useBookings';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const RecentBookings = () => {
  const router = useRouter();
  const { data, isLoading } = useBookings({ limit: 5, ordering: '-created_at' });
  const bookings = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-white shadow-sm border-[0.5px]">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Bookings</h3>
        <Link 
          href="/dashboard/bookings" 
          className="text-[10px] font-bold uppercase tracking-wider text-[#378ADD] hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] text-[10px] font-bold uppercase">ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Customer</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Vehicle</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-[10px] font-bold uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-xs font-medium">#{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{booking.customer.name}</span>
                      <span className="text-[10px] text-muted-foreground">{booking.customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{booking.vehicle_model_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${getStatusColor(booking.booking_status)}`}>
                      {booking.booking_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-right">₹{parseFloat(booking.total_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {booking.booking_status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-[#378ADD] hover:text-[#2D6FA3] hover:bg-blue-50"
                        onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
