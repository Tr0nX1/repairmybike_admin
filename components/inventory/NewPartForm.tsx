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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { StockBadge } from '@/components/ui/StockBadge';
import { useParts, useCategories } from '@/hooks/useParts';

interface NewPartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewPartForm = ({ open, onOpenChange }: NewPartFormProps) => {
  const queryClient = useQueryClient();
  const { uploadThumbnail } = useParts();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    mrp: '',
    sale_price: '',
    stock_qty: '0'
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const { data: categories } = useCategories();

  const createPart = useMutation({
    mutationFn: (data: any) => post<{ data: { id: number } }>('/api/spare-parts/parts/', data),
    onSuccess: async (response) => {
      // If thumbnail selected, upload it
      if (thumbnailFile) {
        try {
          await uploadThumbnail.mutateAsync({ 
            id: response.data.id, 
            file: thumbnailFile 
          });
        } catch (e) {
          console.error("Thumbnail upload failed", e);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('New part added to inventory');
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create part');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', sku: '', category: '', brand: '', mrp: '', sale_price: '', stock_qty: '0' });
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

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
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Initial Stock Quantity</label>
              <StockBadge stock_qty={parseInt(formData.stock_qty || '0')} />
            </div>
            <Input 
              required 
              type="number" 
              min={0}
              className="text-xs"
              value={formData.stock_qty}
              onChange={e => setFormData({...formData, stock_qty: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Part Image (Thumbnail)
            </label>
            <ImageUpload
              value={thumbnailPreview ?? undefined}
              onChange={(file) => {
                setThumbnailFile(file);
                setThumbnailPreview(URL.createObjectURL(file));
              }}
              onClear={() => {
                setThumbnailFile(null);
                setThumbnailPreview(null);
              }}
              aspectRatio="1:1"
              label="Upload part image"
              maxSizeMB={5}
            />
          </div>

          <SheetFooter className="pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              className="text-xs"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#378ADD] hover:bg-[#2D6FA3] text-white text-xs"
              disabled={createPart.isPending || uploadThumbnail.isPending}
            >
              {createPart.isPending || uploadThumbnail.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Part
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
