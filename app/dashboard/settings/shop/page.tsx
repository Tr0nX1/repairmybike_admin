'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Save, MapPin, PhoneCall, Clock3, Building2 } from 'lucide-react';
import { useShopInfo, ShopInfo } from '@/hooks/useShopInfo';

const normalizeForm = (shopInfo?: ShopInfo | null, draft?: Partial<ShopInfo> | null) => ({
  name: draft?.name ?? shopInfo?.name ?? '',
  address: draft?.address ?? shopInfo?.address ?? '',
  phone: draft?.phone ?? shopInfo?.phone ?? '',
  email: draft?.email ?? shopInfo?.email ?? '',
  latitude: draft?.latitude ?? shopInfo?.latitude ?? null,
  longitude: draft?.longitude ?? shopInfo?.longitude ?? null,
  opening_time: draft?.opening_time ?? shopInfo?.opening_time ?? '',
  closing_time: draft?.closing_time ?? shopInfo?.closing_time ?? '',
  working_days: draft?.working_days ?? shopInfo?.working_days ?? '',
  is_active: draft?.is_active ?? shopInfo?.is_active ?? true,
});

export default function ShopSettingsPage() {
  const { shopInfo, isLoading, updateShopInfo } = useShopInfo();
  const [draft, setDraft] = useState<Partial<ShopInfo> | null>(null);

  const form = useMemo(() => normalizeForm(shopInfo, draft), [shopInfo, draft]);

  const isDirty = useMemo(() => {
    if (!shopInfo) {
      return false;
    }

    return JSON.stringify(normalizeForm(shopInfo, null)) !== JSON.stringify(form);
  }, [form, shopInfo]);

  const handleFieldChange = <K extends keyof ShopInfo>(key: K, value: ShopInfo[K] | string | number | null) => {
    setDraft((current) => ({
      ...(current ?? {}),
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!shopInfo) {
      return;
    }

    const payload = {
      name: form.name?.trim(),
      address: form.address?.trim(),
      phone: form.phone?.trim(),
      email: form.email?.trim() || null,
      latitude: form.latitude == null ? null : Number(form.latitude),
      longitude: form.longitude == null ? null : Number(form.longitude),
      opening_time: form.opening_time || null,
      closing_time: form.closing_time || null,
      working_days: form.working_days?.trim() || shopInfo.working_days,
      is_active: form.is_active ?? shopInfo.is_active,
    };

    await updateShopInfo.mutateAsync({
      id: shopInfo.id,
      data: payload,
    });

    setDraft(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Shop Profile"
          subtitle="Manage the public shop identity and operating details shown to customers."
        />
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to settings
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : !shopInfo ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-xs text-muted-foreground">
            No shop information is available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Building2 className="h-4 w-4 text-[#378ADD]" /> Shop details
              </CardTitle>
              <CardDescription className="text-xs">Update the fields customers see in your store locator and contact pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shop name</label>
                  <Input
                    value={form.name ?? ''}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</label>
                  <Input
                    value={form.phone ?? ''}
                    onChange={(event) => handleFieldChange('phone', event.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</label>
                <Textarea
                  value={form.address ?? ''}
                  onChange={(event) => handleFieldChange('address', event.target.value)}
                  className="min-h-[140px] text-xs"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={form.latitude ?? ''}
                    onChange={(event) => handleFieldChange('latitude', event.target.value === '' ? null : Number(event.target.value))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={form.longitude ?? ''}
                    onChange={(event) => handleFieldChange('longitude', event.target.value === '' ? null : Number(event.target.value))}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Opening time</label>
                  <Input
                    type="time"
                    value={form.opening_time ?? ''}
                    onChange={(event) => handleFieldChange('opening_time', event.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Closing time</label>
                  <Input
                    type="time"
                    value={form.closing_time ?? ''}
                    onChange={(event) => handleFieldChange('closing_time', event.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Working days</label>
                <Input
                  value={form.working_days ?? ''}
                  onChange={(event) => handleFieldChange('working_days', event.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 bg-slate-50">
                <div>
                  <p className="text-xs font-bold">Publish shop profile</p>
                  <p className="text-[10px] text-muted-foreground">Toggle visibility for customer-facing store pages.</p>
                </div>
                <Switch
                  checked={form.is_active ?? false}
                  onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!isDirty || updateShopInfo.isPending}
                  className="h-9 text-[10px] font-bold uppercase gap-1.5 bg-[#378ADD]"
                >
                  {updateShopInfo.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-[#378ADD]" /> Location summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">{shopInfo.address}</p>
                <p className="font-semibold">{shopInfo.name}</p>
                <p className="text-xs text-muted-foreground">{shopInfo.working_days}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <PhoneCall className="h-4 w-4 text-[#378ADD]" /> Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
                <p>{shopInfo.phone}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                <p>{shopInfo.email || 'Not provided'}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <Clock3 className="h-4 w-4 text-[#378ADD]" /> Opening hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{shopInfo.opening_time ?? 'Not set'} — {shopInfo.closing_time ?? 'Not set'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
