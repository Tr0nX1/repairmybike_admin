'use client';

import { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2, Wrench, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ServiceSelectorProps {
  bookingId: number;
  onServiceAdded?: () => void;
}

export const ServiceSelector = ({ bookingId, onServiceAdded }: ServiceSelectorProps) => {
  const [search, setSearch] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: servicesData, isLoading: isLoadingServices } = useServices({ q: debouncedSearch });
  const { addService } = useBookingDetail(bookingId);
  const user = useAuthStore((state) => state.user);

  const isManagerOrAdmin = Boolean(
    user?.is_manager || user?.is_superuser || user?.role === 'admin'
  );

  const services = servicesData?.data || [];
  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleAdd = async () => {
    if (!selectedServiceId) return;

    try {
      const payload: { service_id: number; custom_price?: number } = {
        service_id: selectedServiceId,
      };

      if (customPrice.trim() !== '') {
        const parsedPrice = parseFloat(customPrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          toast.error('Custom price must be a valid non-negative number');
          return;
        }
        payload.custom_price = parsedPrice;
      }

      await addService.mutateAsync(payload);
      setSearch('');
      setSelectedServiceId(null);
      setCustomPrice('');
      onServiceAdded?.();
    } catch (e: any) {
      const code = e?.code;
      const status = e?.status;
      const message = e?.message || e?.data?.message;

      if (status === 403 || message?.includes('managers or admins')) {
        toast.error('Only managers or admins can override service price');
      } else if (code === 'BOOKING_TERMINAL') {
        toast.error('Completed or cancelled bookings cannot be changed');
      } else if (code === 'SERVICE_ALREADY_ADDED') {
        toast.error('This service is already added to this booking');
      } else {
        toast.error(message || 'Failed to add service');
      }
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-white shadow-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search services by name..." 
          className="pl-9 h-10 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoadingServices && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {search.length >= 2 && !selectedServiceId && (
        <div className="max-h-[200px] overflow-y-auto border rounded-md divide-y shadow-inner">
          {services.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No services found matching "{search}"</div>
          ) : (
            services.map(service => (
              <div 
                key={service.id} 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedServiceId(service.id)}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{service.name}</span>
                  <span className="text-[10px] text-muted-foreground">{service.category_name || 'Service'}</span>
                </div>
                <div className="flex items-center gap-1 text-[#378ADD] text-xs font-bold">
                  Select
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedService && (
        <div className="rounded-md bg-slate-50 border border-[#378ADD] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-100 text-[#378ADD]">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">{selectedService.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {selectedService.category_name || 'General Service'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isManagerOrAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">Custom Price:</span>
                <Input 
                  type="number" 
                  placeholder="Auto"
                  className="h-8 w-24 text-xs" 
                  value={customPrice}
                  min={0}
                  step="0.01"
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                <ShieldAlert className="h-3 w-3" />
                <span>Default pricing applied</span>
              </div>
            )}

            <Button 
              size="sm" 
              className="h-8 bg-[#378ADD] hover:bg-[#2D6FA3] text-white text-[10px] px-3"
              onClick={handleAdd}
              disabled={addService.isPending}
            >
              {addService.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              Add
            </Button>
          </div>
        </div>
      )}

      {!selectedService && search.length < 2 && (
        <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
          <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-[10px] font-medium uppercase tracking-widest">Select a service to add to job</p>
        </div>
      )}
    </div>
  );
};
