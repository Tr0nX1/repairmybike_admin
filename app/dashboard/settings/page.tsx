'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ExternalLink, ShieldAlert, CreditCard, Bell, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure application preferences and administrative defaults"
      />

      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Note: Multi-system Control</AlertTitle>
        <AlertDescription className="text-[11px] font-medium leading-relaxed">
          Core database schemas, model permissions, and low-level API configurations are managed via the 
          <a href="http://localhost:8000/admin" target="_blank" className="inline-flex items-center gap-1 mx-1 text-[#378ADD] hover:underline">
            Django Admin Panel <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4 h-9 p-1 bg-slate-100">
          <TabsTrigger value="general" className="text-[10px] uppercase font-bold tracking-wider">General</TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px] uppercase font-bold tracking-wider">Pricing</TabsTrigger>
          <TabsTrigger value="payment" className="text-[10px] uppercase font-bold tracking-wider">Payment</TabsTrigger>
          <TabsTrigger value="notifs" className="text-[10px] uppercase font-bold tracking-wider">Notifs</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4">
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-[#378ADD]" /> Application Identity
              </CardTitle>
              <CardDescription className="text-xs">Visual identifiers for the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Application Name</label>
                <Input defaultValue="RepairMyBike Admin" readOnly className="text-xs bg-slate-50 font-medium" />
              </div>
              <div className="grid gap-2 max-w-md">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Base API URL</label>
                <Input defaultValue="http://localhost:8000" readOnly className="text-xs bg-slate-50 font-medium" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold">Service Pricing Schema</CardTitle>
              <CardDescription className="text-xs">View active labor rates and service charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="h-8 w-8 text-muted-foreground mb-3 opacity-40" />
                <p className="text-xs font-bold text-foreground">Pricing management is currently locked.</p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[300px]">
                  Labor rates and service categorisation are defined in the backend core. 
                  Use Django Admin to modify the ServicePricing model.
                </p>
                <Button variant="outline" size="sm" className="mt-4 h-8 text-[10px] font-bold uppercase gap-1.5">
                  <ExternalLink className="h-3 w-3" /> Go to Django Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#378ADD]" /> Payment Gateways
              </CardTitle>
              <CardDescription className="text-xs">Configure Razorpay and Cash flow settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Razorpay Integration</span>
                  <span className="text-[10px] text-muted-foreground">Accept online payments during booking</span>
                </div>
                <div className="h-6 w-10 rounded-full bg-green-500 flex items-center justify-end px-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-muted-foreground">Standard field mechanic collection enabled</span>
                </div>
                <div className="h-6 w-10 rounded-full bg-green-500 flex items-center justify-end px-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifs" className="mt-6">
          <Card className="border-[0.5px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#378ADD]" /> System Notifications
              </CardTitle>
              <CardDescription className="text-xs">Manage administrative alerts and customer SMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">FCM/SMS Configuration Pending</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
