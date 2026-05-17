'use client';

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Package } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface NewPartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewPartForm = ({ open, onOpenChange }: NewPartFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    mrp: '',
    sale_price: '',
    stock_qty: '0'
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ['parts', 'categories'],
    queryFn: () => get<any[]>('/api/spare-parts/categories/'),
  });

  const createPart = useMutation({
    mutationFn: (data: any) => post('/api/spare-parts/parts/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('New part added to inventory');
      onOpenChange(false);
      setFormData({ name: '', sku: '', category: '', brand: '', mrp: '', sale_price: '', stock_qty: '0' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create part');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (parseFloat(formData.sale_price) > parseFloat(formData.mrp)) {
      toast.error('Sale price cannot be higher than MRP');
      return;
    }

    createPart.mutate({
      ...formData,
      mrp: parseFloat(formData.mrp),
      sale_price: parseFloat(formData.sale_price),
      stock_qty: parseInt(formData.stock_qty)
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto">
        <SheetHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#378ADD] mb-2">
            <Package className="h-5 w-5" />
          </div>
          <SheetTitle>Add New Part</SheetTitle>
          <SheetDescription>
            Enter details to add a new spare part to the inventory system.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Name</label>
            <Input 
              required 
              placeholder="e.g. Brake Pad - Front" 
              className="text-xs"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SKU / Part No.</label>
              <Input 
                required 
                placeholder="SKU-12345" 
                className="text-xs"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <Select onValueChange={(val: string | null) => setFormData({...formData, category: val || ''})}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brand ID</label>
            <Input 
              required 
              type="number"
              placeholder="Brand ID" 
              className="text-xs"
              value={formData.brand}
              onChange={e => setFormData({...formData, brand: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MRP (₹)</label>
              <Input 
                required 
                type="number" 
                placeholder="0.00" 
                className="text-xs font-bold"
                value={formData.mrp}
                onChange={e => setFormData({...formData, mrp: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sale Price (₹)</label>
              <Input 
                required 
                type="number" 
                placeholder="0.00" 
                className="text-xs font-bold text-[#378ADD]"
                value={formData.sale_price}
                onChange={e => setFormData({...formData, sale_price: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Initial Stock Quantity</label>
            <Input 
              required 
              type="number" 
              className="text-xs"
              value={formData.stock_qty}
              onChange={e => setFormData({...formData, stock_qty: e.target.value})}
            />
          </div>

          <SheetFooter className="pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#378ADD] hover:bg-[#2D6FA3] text-white text-xs"
              disabled={createPart.isPending}
            >
              {createPart.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Part
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
