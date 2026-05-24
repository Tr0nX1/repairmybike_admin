'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { useLogs } from '@/hooks/useLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  ChevronLeft, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Clock,
  UserPlus,
  Copy,
  CheckCircle2,
  Bike,
  Info,
  Banknote,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { UpdateStatusModal } from '@/components/bookings/UpdateStatusModal';
import { AssignMechanicModal } from '@/components/bookings/AssignMechanicModal';
import { BookingServicesPanel } from '@/components/bookings/BookingServicesPanel';
import { useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CustomerDetailPanel } from '@/components/customers/CustomerDetailPanel';
import { isTerminalBookingStatus } from '@/lib/booking-transitions';
import { BookingPartsPanel } from '@/components/bookings/BookingPartsPanel';
import { usePaymentCollection } from '@/hooks/usePaymentCollection';

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const bookingId = parseInt(id as string);
  const { 
    data: booking, 
    isLoading, 
    refetch, 
    updateBooking 
  } = useBookingDetail(bookingId);

  const { collectPayment } = usePaymentCollection();
  const { data: logs } = useLogs({ booking_id: bookingId });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Initialize internal notes when booking data arrives
  if (booking && !isEditingNotes && internalNotes === '' && booking.internal_notes !== internalNotes) {
    setInternalNotes(booking.internal_notes || '');
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#378ADD]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-sm font-bold text-muted-foreground">Booking not found</p>
        <Button variant="link" onClick={() => router.push('/dashboard/bookings')}>Back to list</Button>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSaveNotes = () => {
    updateBooking.mutate({ internal_notes: internalNotes }, {
      onSuccess: () => setIsEditingNotes(false)
    });
  };

  const servicesSubtotal = booking.booking_services.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const partsSubtotal = booking.booking_parts.reduce((sum, p) => sum + (p.quantity * parseFloat(p.unit_price)), 0);
  const discountAmount = parseFloat(booking.discount_amount || '0');
  const finalTotal = servicesSubtotal + partsSubtotal - discountAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 p-0 hover:bg-transparent" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" /> Back to bookings
        </Button>
      </div>

      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <span>Booking #{booking.id}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(booking.id.toString())}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        } 
        subtitle={`Created on ${booking.created_at ? format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm') : booking.appointment_date}`}
        badge={{ label: booking.booking_status }}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5"
              disabled={isTerminalBookingStatus(booking.booking_status)}
              onClick={() => setStatusModalOpen(true)}
            >
              Update Status
            </Button>
            <Button className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]" onClick={() => setAssignModalOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" /> {booking.mechanic_name ? 'Reassign' : 'Assign Mechanic'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 border-r pr-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <UserPlus className="h-5 w-5 text-[#378ADD]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Mechanic</span>
            <span className="text-sm font-bold">{booking.mechanic_name || 'Unassigned'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 border-r pr-4">
          <div className="bg-slate-50 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status</span>
            <StatusBadge status={booking.booking_status} />
          </div>
        </div>
        <div className="flex items-center gap-3 border-r pr-4">
          <div className="bg-slate-50 p-2 rounded-lg">
            <Banknote className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Payment</span>
            <StatusBadge status={booking.payment_status} type="payment" />
          </div>
        </div>
        <div className="flex items-center gap-3 justify-center lg:justify-end">
           <Badge variant="outline" className="h-7 text-[10px] font-bold uppercase border-slate-200">
             {booking.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[0.5px] shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#378ADD]">
                    {booking.customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="text-base font-bold cursor-pointer hover:text-[#378ADD] hover:underline flex items-center gap-1"
                      onClick={() => setCustomerSheetOpen(true)}
                    >
                      {booking.customer.name} <ExternalLink className="h-3 w-3" />
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 font-medium">
                      <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-1 hover:text-foreground">
                        <Phone className="h-3 w-3" /> {booking.customer.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-bold">{booking.customer.email || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[0.5px] shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Bike className="h-3 w-3" /> Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Model</span>
                    <span className="text-xs font-bold">{booking.vehicle_brand_name} {booking.vehicle_model_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase">{booking.vehicle_type_name || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Odometer Reading</span>
                    <span className="text-xs font-bold">{booking.odometer_reading ? `${booking.odometer_reading} KM` : 'Not captured'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services & Location */}
          <BookingServicesPanel
            bookingId={booking.id}
            bookingServices={booking.booking_services}
            bookingStatus={booking.booking_status}
            vehicleModelId={booking.vehicle_model}
          />

          {/* Parts */}
          <Card className="border-[0.5px] shadow-sm">
            <CardContent className="p-6">
              <BookingPartsPanel
                bookingId={booking.id}
                bookingStatus={booking.booking_status}
                parts={booking.booking_parts}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[0.5px] shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 min-h-[120px]">
                <p className="text-xs text-foreground leading-relaxed italic">
                  {booking.customer_notes ? `"${booking.customer_notes}"` : 'No notes provided by customer.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[0.5px] shadow-sm">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="h-3 w-3" /> Internal Notes
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[9px] font-bold uppercase"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                >
                  {isEditingNotes ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea 
                      className="text-xs min-h-[80px]" 
                      value={internalNotes} 
                      onChange={(e) => setInternalNotes(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-full text-[10px] font-bold uppercase bg-[#378ADD]"
                      onClick={handleSaveNotes}
                      disabled={updateBooking.isPending}
                    >
                      {updateBooking.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                      Save Internal Notes
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {booking.internal_notes || 'No internal notes added yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Financial Breakdown */}
          <Card className="border-[0.5px] shadow-sm overflow-hidden bg-slate-900 text-white">
            <div className="bg-[#378ADD] px-6 py-4">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Order Value</span>
              <div className="text-3xl font-bold mt-1">₹{finalTotal.toLocaleString()}</div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Service Items</span>
                  <span>₹{servicesSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Spare Parts</span>
                  <span>₹{partsSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-medium text-green-400">
                    <span>Discount Applied</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <Separator className="bg-slate-800" />
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Grand Total</span>
                  <span className="text-[#378ADD]">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              {booking.payment_status === 'pending' && (
                <Button 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-[11px] mt-4 shadow-lg shadow-green-900/20"
                  onClick={() => collectPayment.mutate({
                    booking_id: bookingId,
                    amount: parseFloat(booking.total_amount)
                  })}
                  disabled={collectPayment.isPending}
                >
                  {collectPayment.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4 mr-2" />
                  )}
                  Collect Cash Payment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Appointment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-[#378ADD]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Schedule</span>
                  <span className="text-xs font-bold">{booking.appointment_date}</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase">{booking.appointment_time}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Address</span>
                  <p className="text-xs font-bold leading-relaxed">{booking.address || 'Service at Shop'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Booking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative space-y-5 pl-4 border-l-2 border-slate-100 ml-2">
                {logs?.results?.map((log, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#378ADD] border-2 border-white shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">{log.description}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                        </span>
                        <span className="text-[8px] text-slate-300 font-bold uppercase">BY</span>
                        <span className="text-[9px] font-bold text-[#378ADD] uppercase tracking-tighter">{log.full_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!logs?.results?.length && (
                  <div className="text-[10px] text-muted-foreground italic py-4">No events recorded yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <UpdateStatusModal 
        bookingId={bookingId} 
        currentStatus={booking.booking_status}
        open={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)} 
      />

      <AssignMechanicModal 
        bookingId={bookingId} 
        booking={booking}
        open={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        onSuccess={() => refetch()}
      />

      <Sheet open={customerSheetOpen} onOpenChange={setCustomerSheetOpen}>
        <SheetContent className="sm:max-w-2xl p-0 overflow-y-auto border-l-0 shadow-2xl">
          <CustomerDetailPanel 
            id={booking.customer.id || 0} 
            onClose={() => setCustomerSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
