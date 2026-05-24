'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Send, 
  Bell, 
  CheckCircle2, 
  Mail, 
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const notifySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  message: z.string().min(5, 'Message is required'),
  notification_type: z.enum(['booking_update', 'promotion', 'system', 'payment']),
  user_id: z.string().optional(), // In a real app, this would be a user search
});

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, createNotification, markAsRead, markAllRead } = useNotifications({}, page);
  
  const notifications = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 50);

  const form = useForm<z.infer<typeof notifySchema>>({
    resolver: zodResolver(notifySchema),
    defaultValues: {
      title: '',
      message: '',
      notification_type: 'system',
    },
  });

  const onSubmit = async (values: z.infer<typeof notifySchema>) => {
    try {
      await createNotification.mutateAsync({
        ...values,
        user: 1, // Mock user ID for this prototype - in real app, select from search
      });
      setIsModalOpen(false);
      form.reset();
    } catch (e) {}
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'booking_update': return 'bg-blue-50 text-blue-700';
      case 'promotion': return 'bg-purple-50 text-purple-700';
      case 'payment': return 'bg-green-50 text-green-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Notifications" 
        subtitle="Manage push alerts and system messages"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => markAllRead.mutate()}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark All Read
            </Button>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger render={<Button className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]" />}>
                <Send className="h-3.5 w-3.5" />
                Send Notification
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Send New Notification</DialogTitle>
                  <DialogDescription>
                    This alert will be sent immediately to the selected users.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Service Update" {...field} className="h-10 text-xs" /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notification_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs">
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="system">System Alert</SelectItem>
                              <SelectItem value="booking_update">Booking Update</SelectItem>
                              <SelectItem value="promotion">Promotion</SelectItem>
                              <SelectItem value="payment">Payment Alert</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Message</FormLabel>
                          <FormControl><Textarea placeholder="Type your message here..." {...field} className="text-xs resize-none" rows={4} /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full bg-[#378ADD] text-white font-bold h-10 uppercase text-[11px] tracking-widest" disabled={createNotification.isPending}>
                        {createNotification.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-3.5 w-3.5 mr-2" />}
                        Broadcast Now
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              <TableHead className="w-[180px] text-[10px] font-bold uppercase py-3">Created</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Message</TableHead>
              <TableHead className="w-[120px] text-[10px] font-bold uppercase">Type</TableHead>
              <TableHead className="w-[100px] text-[10px] font-bold uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <Bell className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No notifications found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((n) => (
                <TableRow key={n.id} className={cn("hover:bg-slate-50 transition-colors group", !n.is_read && "bg-blue-50/20")}>
                  <TableCell className="text-[11px] font-medium text-muted-foreground">
                    {format(new Date(n.created_at), 'MMM dd, HH:mm')}
                    {!n.is_read && <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{n.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{n.message}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[9px] font-bold uppercase border-none", getTypeStyle(n.notification_type))}>
                      {n.notification_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!n.is_read && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => markAsRead.mutate(n.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="text-sm text-muted-foreground mx-4">Page {page} of {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
