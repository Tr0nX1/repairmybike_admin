'use client';

import Image from 'next/image';
import { useCustomerDetail } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  User, Phone, Calendar,
  MapPin, Bike, History, Star,
  CreditCard, Loader2, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/parts';

interface CustomerDetailPanelProps {
  id: number;
  onClose: () => void;
}

type BookingRecord = {
  id: number;
  booking_status: string;
  service_name: string;
  appointment_date: string;
  total_amount: number;
  payment_status: string;
};

type VehicleRecord = {
  id: number;
  vehicle_model_details: {
    brand_name: string;
    name: string;
  };
  registration_number: string;
  is_default: boolean;
};

type AddressRecord = {
  id: number;
  full_name: string;
  is_default: boolean;
  flat_house_no: string;
  area_street: string;
  landmark?: string;
  town_city: string;
  state: string;
  pincode: string;
  phone_number: string;
};

export function CustomerDetailPanel({ id, onClose }: CustomerDetailPanelProps) {
  const { data: customer, isLoading, error } = useCustomerDetail(id);
  const router = useRouter();
  const partsOrdersQuery = useOrders(
    customer?.phone_number ? { phone: customer.phone_number } : {},
    1,
    Boolean(customer?.phone_number)
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load customer details</p>
        <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
      </div>
    );
  }

  const partsOrders = partsOrdersQuery.data?.data ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
              {customer.profile_picture_url ? (
                <Image
                  src={customer.profile_picture_url}
                  alt={customer.full_name}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{customer.full_name}</h2>
              <p className="text-sm text-muted-foreground font-medium">ID: #{customer.id} | Joined {new Date(customer.created_at).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 py-0.5 px-2">
                  <Star className="h-3 w-3 mr-1 fill-current" /> {customer.loyalty_points} Points
                </Badge>
                {customer.active_subscriptions > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-0.5 px-2">
                    Active Subscriber
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Total Bookings</p>
            <p className="text-lg font-bold text-slate-800">{customer.booking_count}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Total Spent</p>
            <p className="text-lg font-bold text-green-600">₹{customer.total_spent}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Referral Code</p>
            <p className="text-lg font-bold text-primary">{customer.referral_code}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-100/50 p-1">
            <TabsTrigger value="history" className="text-xs font-bold uppercase tracking-tight">History</TabsTrigger>
            {customer.phone_number ? (
              <TabsTrigger value="parts-orders" className="text-xs font-bold uppercase tracking-tight">Parts Orders</TabsTrigger>
            ) : null}
            <TabsTrigger value="vehicles" className="text-xs font-bold uppercase tracking-tight">Vehicles</TabsTrigger>
            <TabsTrigger value="addresses" className="text-xs font-bold uppercase tracking-tight">Addresses</TabsTrigger>
            <TabsTrigger value="info" className="text-xs font-bold uppercase tracking-tight">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4 outline-none">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <History className="h-4 w-4 text-primary" /> Recent Bookings
              </h3>
            </div>
            {customer.recent_bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center italic bg-white rounded-xl border border-dashed">No booking history yet</p>
            ) : (
              <div className="space-y-3">
                {customer.recent_bookings.map((booking: BookingRecord) => (
                  <Card key={booking.id} className="hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]" onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">#{booking.id}</span>
                            <StatusBadge status={booking.booking_status} />
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">{booking.service_name}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> {new Date(booking.appointment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">₹{booking.total_amount}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{booking.payment_status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full text-[11px] font-bold uppercase tracking-widest border-slate-200 h-10" onClick={() => router.push(`/dashboard/bookings?search=${customer.phone_number}`)}>
              View All Bookings
            </Button>
          </TabsContent>

          {customer.phone_number ? (
            <TabsContent value="parts-orders" className="space-y-4 outline-none">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <History className="h-4 w-4 text-primary" /> Parts Orders
                </h3>
              </div>
              {partsOrdersQuery.isLoading ? (
                <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                </div>
              ) : partsOrdersQuery.error ? (
                <p className="text-xs text-destructive py-12 text-center italic bg-white rounded-xl border border-dashed">Failed to load parts orders</p>
              ) : partsOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-12 text-center italic bg-white rounded-xl border border-dashed">No parts orders found for this phone number</p>
              ) : (
                <div className="space-y-3">
                  {partsOrders.map((order: Order) => (
                    <Card
                      key={order.id}
                      className="hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 tracking-tight">#{order.id}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                              <span>{order.items?.length ?? 0} items</span>
                              <span>•</span>
                              <span>₹{order.amount_total}</span>
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <StatusBadge status={order.payment_status} type="payment" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ) : null}

          <TabsContent value="vehicles" className="space-y-4 outline-none">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
              <Bike className="h-4 w-4 text-primary" /> Saved Vehicles
            </h3>
            {customer.vehicles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center italic bg-white rounded-xl border border-dashed">No vehicles registered</p>
            ) : (
              <div className="space-y-3">
                {customer.vehicles.map((v: VehicleRecord) => (
                  <Card key={v.id} className="shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                        <Bike className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{v.vehicle_model_details.brand_name} {v.vehicle_model_details.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wider">REG: {v.registration_number}</p>
                        {v.is_default && <Badge variant="secondary" className="text-[8px] h-4 mt-2 font-bold uppercase bg-blue-50 text-blue-600 border-blue-100">Default</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4 outline-none">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
              <MapPin className="h-4 w-4 text-primary" /> Saved Addresses
            </h3>
            {customer.addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center italic bg-white rounded-xl border border-dashed">No addresses saved</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr: AddressRecord) => (
                  <Card key={addr.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2.5">
                        <p className="text-xs font-bold text-slate-800">{addr.full_name}</p>
                        {addr.is_default && <Badge className="text-[8px] h-4 font-bold uppercase bg-primary text-white border-none px-1.5">Default</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {addr.flat_house_no}, {addr.area_street}<br />
                        {addr.landmark && <span className="text-slate-400">{addr.landmark}, </span>}
                        <span className="text-slate-600">{addr.town_city}, {addr.state} - {addr.pincode}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                        <Phone className="h-3 w-3 text-slate-300" /> {addr.phone_number}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-6 outline-none">
            <div className="bg-white rounded-xl border p-5 shadow-sm space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <CreditCard className="h-4 w-4 text-primary" /> Account Details
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Email</p>
                  <p className="text-xs font-bold text-slate-700">{customer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Phone</p>
                  <p className="text-xs font-bold text-slate-700">{customer.phone_number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Username</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{customer.username}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Status</p>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100 py-0 px-2 h-5">Verified</Badge>
                </div>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="bg-slate-50/50 rounded-xl border border-dashed p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Internal Notes</h3>
              <p className="text-[11px] text-slate-400 font-medium italic">No internal notes for this customer.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
