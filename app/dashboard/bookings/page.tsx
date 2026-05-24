'use client';

import { Suspense, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { BookingFilters } from '@/components/bookings/BookingFilters';
import { BookingTable } from '@/components/bookings/BookingTable';
import { BookingDetailPanel } from '@/components/bookings/BookingDetailPanel';
import { Button } from '@/components/ui/button';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import type { BookingPaymentMethod, BookingStatus } from '@/types/enums';
import { useSearchParams } from 'next/navigation';

function BookingsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const mechanicIdParam = searchParams.get('mechanic_id') || undefined;

  const [filters, setFilters] = useState<{
    status?: BookingStatus;
    date?: string;
    search?: string;
    payment_method?: BookingPaymentMethod;
  }>({});

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Debounce search filter to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 400);

  const { data, isLoading, isRefetching } = useBookings({
    ...filters,
    search: debouncedSearch,
    mechanic_id: mechanicIdParam,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] });
  };

  const handleViewDetail = (id: number) => {
    setSelectedBookingId(id);
    setDetailOpen(true);
  };

  const handleAssignMechanic = (id: number) => {
    setSelectedBookingId(id);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Service Bookings" 
        subtitle="Manage job cards, assign mechanics and track status"
        badge={{ label: data?.count || 0 }}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs gap-1.5"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={isRefetching ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" disabled title="Coming in v2">
              <Download className="h-3.5 w-3.5" />
              Export (Coming in v2)
            </Button>
            <Button className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]" disabled title="Coming in v2">
              <Plus className="h-3.5 w-3.5" />
              Create Booking (Coming in v2)
            </Button>
          </>
        }
      />

      <BookingFilters 
        onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} 
      />

      <BookingTable 
        bookings={data?.data || []} 
        isLoading={isLoading} 
        onView={handleViewDetail}
        onAssign={handleAssignMechanic}
      />

      <BookingDetailPanel 
        id={selectedBookingId} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
