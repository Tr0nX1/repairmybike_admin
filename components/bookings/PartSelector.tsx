'use client';

import { useState } from 'react';
import { useParts } from '@/hooks/useParts';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PartSelectorProps {
  bookingId: number;
  onPartAdded?: () => void;
}

export const PartSelector = ({ bookingId, onPartAdded }: PartSelectorProps) => {
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: partsData, isLoading: isLoadingParts } = useParts({ q: debouncedSearch });
  const { addPart } = useBookingDetail(bookingId);

  const parts = partsData?.data || [];
  const selectedPart = parts.find(p => p.id === selectedPartId);

  const handleAdd = async () => {
    if (!selectedPartId) return;

    try {
      await addPart.mutateAsync({ part_id: selectedPartId, quantity });
      setSearch('');
      setSelectedPartId(null);
      setQuantity(1);
      onPartAdded?.();
    } catch (e) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-white shadow-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search parts by name or SKU..." 
          className="pl-9 h-10 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoadingParts && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {search.length >= 2 && !selectedPartId && (
        <div className="max-h-[200px] overflow-y-auto border rounded-md divide-y shadow-inner">
          {parts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No parts found matching "{search}"</div>
          ) : (
            parts.map(part => (
              <div 
                key={part.id} 
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors",
                  part.stock_qty <= 0 && "opacity-50 grayscale pointer-events-none"
                )}
                onClick={() => setSelectedPartId(part.id)}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{part.name}</span>
                  <span className="text-[10px] text-muted-foreground">SKU: {part.sku}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-[#378ADD]">₹{parseFloat(part.sale_price).toLocaleString()}</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    part.stock_qty < 5 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    Stock: {part.stock_qty}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedPart && (
        <div className="rounded-md bg-slate-50 border border-[#378ADD] p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-100 text-[#378ADD]">
              <Package className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">{selectedPart.name}</span>
              <span className="text-[10px] text-muted-foreground">₹{parseFloat(selectedPart.sale_price).toLocaleString()} per unit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              className="h-8 w-16 text-center text-xs" 
              value={quantity}
              min={1}
              max={selectedPart.stock_qty}
              onChange={(e) => setQuantity(Math.min(selectedPart.stock_qty, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <Button 
              size="sm" 
              className="h-8 bg-[#378ADD] hover:bg-[#2D6FA3] text-white text-[10px] px-3"
              onClick={handleAdd}
              disabled={addPart.isPending}
            >
              {addPart.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              Add
            </Button>
          </div>
        </div>
      )}

      {!selectedPart && search.length < 2 && (
        <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
          <Package className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-[10px] font-medium uppercase tracking-widest">Select a part to add to job</p>
        </div>
      )}
    </div>
  );
};
