'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useCMS, Banner } from '@/hooks/useCMS';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  image: z.any().optional(),
  image_url: z.string().optional(),
  link_url: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.number().int(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

interface BannerFormModalProps {
  open: boolean;
  onClose: () => void;
  banner?: Banner | null;
}

export function BannerFormModal({ open, onClose, banner }: BannerFormModalProps) {
  const isEdit = !!banner;
  const { createBanner, updateBanner } = useCMS();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      image: null,
      image_url: '',
      link_url: '',
      is_active: true,
      display_order: 0,
      start_date: '',
      end_date: '',
    },
  });

  useEffect(() => {
    if (banner && open) {
      form.reset({
        title: banner.title,
        image: null,
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
        is_active: banner.is_active,
        display_order: banner.display_order || 0,
        start_date: banner.start_date || '',
        end_date: banner.end_date || '',
      });
    } else if (open) {
      form.reset({
        title: '',
        image: null,
        image_url: '',
        link_url: '',
        is_active: true,
        display_order: 0,
        start_date: '',
        end_date: '',
      });
    }
  }, [banner, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('is_active', String(values.is_active));
    formData.append('display_order', String(values.display_order));
    if (values.image_url) formData.append('image_url', values.image_url);
    if (values.link_url) formData.append('link_url', values.link_url);
    if (values.start_date) formData.append('start_date', values.start_date);
    if (values.end_date) formData.append('end_date', values.end_date);
    if (values.image instanceof File) {
      formData.append('image', values.image);
    }

    if (isEdit && banner) {
      updateBanner.mutate({ id: banner.id, data: formData }, { onSuccess: onClose });
    } else {
      createBanner.mutate(formData, { onSuccess: onClose });
    }
  };

  const isPending = createBanner.isPending || updateBanner.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Banner' : 'New Banner'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500 block text-center">Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value || banner?.image_url} 
                        onChange={field.onChange} 
                        onClear={() => field.onChange(null)}
                        aspectRatio="16:9"
                        className="w-full h-32 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Banner Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Discount Offer" className="text-xs font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Image URL Fallback</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://example.com/banner.jpg" className="text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Target/Link URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://store.com/summer-sale" className="text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" className="text-xs" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-2 shadow-sm bg-slate-50/50 mt-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[11px] font-bold">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">End Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold uppercase">Cancel</Button>
              <Button type="submit" disabled={isPending} className="text-xs font-bold uppercase bg-[#378ADD]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
