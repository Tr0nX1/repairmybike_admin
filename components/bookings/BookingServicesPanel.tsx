'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LockedPrice } from '@/components/ui/LockedPrice';
import { BookingService } from '@/types/booking';
import { BOOKING_STATUS, type BookingStatus } from '@/types/enums';
import { isTerminalBookingStatus } from '@/lib/booking-transitions';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { ServiceSelector } from './ServiceSelector';

interface BookingServicesPanelProps {
  bookingId: number;
  bookingServices: BookingService[];
  bookingStatus: BookingStatus;
  vehicleModelId?: number | null;
}

const EDITABLE_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
];

export const BookingServicesPanel = ({
  bookingId,
  bookingServices,
  bookingStatus,
}: BookingServicesPanelProps) => {
  const [showAddService, setShowAddService] = useState(false);
  const isTerminal = isTerminalBookingStatus(bookingStatus);
  const isEditable = !isTerminal && EDITABLE_BOOKING_STATUSES.includes(bookingStatus);
  const totalPrice = bookingServices.reduce((sum, service) => sum + Number(service.price || 0), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Service Items</h3>
            <Badge className="text-[10px] font-bold uppercase" variant="outline">Locked prices</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Service prices are locked at booking creation time or manually set by managers.
          </p>
        </div>
        {isEditable && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 whitespace-nowrap text-[#378ADD] border-[#378ADD]/30 hover:bg-blue-50"
            onClick={() => setShowAddService((prev) => !prev)}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Service
          </Button>
        )}
      </div>

      {showAddService && isEditable && (
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <ServiceSelector bookingId={bookingId} onServiceAdded={() => setShowAddService(false)} />
        </div>
      )}

      {bookingServices.length ? (
        <div className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookingServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold">{service.service_name || String(service.service)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{service.category_name || 'Service'}</td>
                  <td className="px-4 py-3 text-right">
                    <LockedPrice amount={service.price} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {service.created_at ? format(new Date(service.created_at), 'dd MMM yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-b-xl border-t border-slate-200 bg-slate-50 p-6 text-center text-sm text-muted-foreground">
          No services added yet.
        </div>
      )}
    </div>
  );
};
