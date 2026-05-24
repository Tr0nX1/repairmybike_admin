import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useParts } from '@/hooks/useParts';
import { ApiResponse } from '@/types/api';
import { SparePart } from '@/types/parts';
import { Loader2, Package, Plus, X, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

import { StockBadge } from '@/components/ui/StockBadge';

const partSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  sku: z.string().min(3, 'SKU is required'),
  category: z.number(),
  brand: z.number(),
  sale_price: z.string().min(1, 'Price is required'),
  stock_qty: z.number().int().min(0),
  active: z.boolean(),
});

interface EditPartModalProps {
  part: SparePart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPartModal = ({ part, open, onOpenChange }: EditPartModalProps) => {
  const { updatePart, uploadThumbnail, uploadGalleryImage, deleteGalleryImage } = useParts();
  
  const { data: categories } = useQuery<any[]>({
    queryKey: ['parts', 'categories'],
    queryFn: async () => {
      const response = await get<ApiResponse<any[]>>('/api/spare-parts/categories/');
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof partSchema>>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: part.name || '',
      sku: part.sku || '',
      category: Number(part.category) || 0,
      brand: Number(part.brand) || 0,
      sale_price: part.sale_price || '0',
      stock_qty: Number(part.stock_qty) || 0,
      active: true,
    },
  });

  const handleThumbnailChange = async (file: File) => {
    try {
      await uploadThumbnail.mutateAsync({ id: part.id, file });
    } catch (e) {}
  };

  const handleThumbnailClear = async () => {
    try {
      // Backend action needed if we want to support clearing via patch null
      // For now we just allow replacement.
      toast.info("Thumbnail cannot be cleared, only replaced.");
    } catch (e) {}
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadGalleryImage.mutateAsync({ id: part.id, file, altText: part.name });
    } catch (e) {}
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    try {
      await deleteGalleryImage.mutateAsync({ partId: part.id, imageId });
    } catch (e) {}
  };

  const onSubmit = async (values: z.infer<typeof partSchema>) => {
    try {
      await updatePart.mutateAsync({ id: part.id, data: values });
      onOpenChange(false);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#378ADD] mb-2">
            <Package className="h-5 w-5" />
          </div>
          <SheetTitle>Edit Spare Part</SheetTitle>
          <SheetDescription>
            Update inventory details for {part.sku}.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            
            {/* THUMBNAIL SECTION */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Main Image (Thumbnail)
              </label>
              <ImageUpload
                value={part.thumbnail_url ?? undefined}
                onChange={handleThumbnailChange}
                onClear={handleThumbnailClear}
                aspectRatio="1:1"
                label="Thumbnail"
                disabled={uploadThumbnail.isPending}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Name</FormLabel>
                  <FormControl><Input {...field} className="h-10 text-xs" /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</FormLabel>
                    <FormControl><Input {...field} className="h-10 text-xs" /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sale Price (₹)</FormLabel>
                    <FormControl><Input {...field} className="h-10 text-xs font-bold text-[#378ADD]" /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Qty</FormLabel>
                    <FormControl>
                       <Input 
                         type="number" 
                         {...field} 
                         onChange={(e) => field.onChange(Number(e.target.value))}
                         className="h-10 text-xs" 
                       />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* GALLERY SECTION */}
            <div className="space-y-3">
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Image Gallery</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {part.images?.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img 
                      src={img.image_url} 
                      className="w-full h-full object-cover rounded-lg border bg-slate-50"
                      alt={img.alt_text}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={deleteGalleryImage.isPending}
                    >
                      <X size={10} />
                    </button>
                    {img.is_primary && (
                      <span className="absolute bottom-1 left-1 bg-[#378ADD] text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#378ADD] hover:bg-blue-50/50 transition-all">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAddGalleryImage}
                    disabled={uploadGalleryImage.isPending}
                  />
                  {uploadGalleryImage.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : (
                    <>
                      <Plus size={20} className="text-slate-400 mb-1" />
                      <span className="text-[8px] font-bold uppercase text-slate-400">Add Image</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <SheetFooter className="pt-6">
              <Button type="submit" className="w-full bg-[#378ADD] hover:bg-[#2D6FA3] text-white h-10 font-bold uppercase text-[11px] tracking-widest" disabled={updatePart.isPending}>
                {updatePart.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Part Details
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
