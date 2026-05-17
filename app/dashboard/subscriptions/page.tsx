'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePlans } from '@/hooks/usePlans';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, CreditCard, Users, History, Loader2, ArrowUpCircle, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanFormModal } from '@/components/subscriptions/PlanFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { data: plans, isLoading: plansLoading, deletePlan } = usePlans();
  const { data: subs, isLoading: subsLoading, adjustVisits } = useSubscriptions();

  const [planModal, setPlanModal] = useState<{ open: boolean, data: any | null }>({ open: false, data: null });
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  
  const [adjustModal, setAdjustModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  const [adjustment, setAdjustment] = useState({ visits: '1', reason: '' });

  const planColumns = [
    { 
      header: 'Plan Name', 
      accessor: (p: any) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 bg-blue-50 rounded border flex items-center justify-center text-[#378ADD] shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{p.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{p.duration_months} Months</span>
          </div>
        </div>
      ),
      width: '250px'
    },
    { 
      header: 'Pricing', 
      accessor: (p: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">₹{parseFloat(p.price).toLocaleString()}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">One-time</span>
        </div>
      )
    },
    { 
      header: 'Visits', 
      accessor: (p: any) => (
        <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-slate-200">{p.visits_allowed} Visits</Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (p: any) => (
        <div className="flex justify-end gap-1 px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => setPlanModal({ open: true, data: p })}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeletingPlanId(p.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      width: '100px',
      className: 'text-right'
    }
  ];

  const subColumns = [
    {
      header: 'Subscriber',
      accessor: (s: any) => (
        <div className="flex flex-col py-1">
          <span className="text-xs font-bold text-slate-800">{s.user_details?.full_name || s.contact_phone || 'User #' + s.user}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{s.contact_phone || s.contact_email}</span>
        </div>
      )
    },
    {
      header: 'Plan',
      accessor: (s: any) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-5 border-blue-100 bg-blue-50 text-blue-700">
          {s.plan_name}
        </Badge>
      )
    },
    {
      header: 'Validity',
      accessor: (s: any) => (
        <div className="flex flex-col text-[10px] font-bold tracking-tight">
          <span className="text-slate-700">{new Date(s.start_date).toLocaleDateString()}</span>
          <span className="text-slate-300 uppercase text-[8px]">to</span>
          <span className="text-slate-500">{new Date(s.end_date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Visits (Used/Rem)',
      accessor: (s: any) => (
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-slate-800 min-w-[32px]">{s.visits_used} / {s.visits_remaining}</span>
           <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200">
              <div 
                className="h-full bg-[#378ADD]" 
                style={{ width: `${Math.min(100, (s.visits_used / (s.visits_used + s.visits_remaining || 1)) * 100)}%` }}
              />
           </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (s: any) => (
        <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className={`text-[9px] font-bold uppercase px-2 h-5 ${s.status === 'active' ? 'bg-green-600' : ''}`}>
          {s.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (s: any) => (
        <div className="flex justify-end gap-1 px-4">
           <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase text-[#378ADD] gap-1 hover:bg-blue-50" onClick={() => setAdjustModal({ open: true, sub: s })}>
              <ArrowUpCircle className="h-3 w-3" /> Adjust
           </Button>
           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#378ADD]" onClick={() => s.user && router.push(`/dashboard/customers?search=${s.contact_phone || s.user}`)}>
              <User className="h-3.5 w-3.5" />
           </Button>
        </div>
      ),
      width: '130px',
      className: 'text-right'
    }
  ];

  const handleAdjust = () => {
    if (!adjustModal.sub) return;
    adjustVisits.mutate({
      id: adjustModal.sub.id,
      visits_to_add: parseInt(adjustment.visits),
      reason: adjustment.reason
    }, {
      onSuccess: () => setAdjustModal({ open: false, sub: null })
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscription Management" 
        subtitle="Manage membership plans and monitor active subscribers"
      />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-fit grid-cols-2 mb-6 bg-slate-100/50 p-1">
          <TabsTrigger value="plans" className="text-[10px] font-bold uppercase tracking-widest px-10">PLANS</TabsTrigger>
          <TabsTrigger value="subscribers" className="text-[10px] font-bold uppercase tracking-widest px-10">ACTIVE SUBSCRIBERS</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4 outline-none">
          <div className="flex justify-end">
            <Button className="h-9 text-xs font-bold uppercase tracking-widest gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3] shadow-sm" onClick={() => setPlanModal({ open: true, data: null })}>
              <Plus className="h-3.5 w-3.5" /> New Plan
            </Button>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={planColumns} 
              data={plans?.data} 
              isLoading={plansLoading} 
              emptyMessage="No subscription plans defined."
            />
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={subColumns} 
              data={subs?.data} 
              isLoading={subsLoading} 
              emptyMessage="No active subscribers found."
            />
          </div>
        </TabsContent>
      </Tabs>

      <PlanFormModal 
        open={planModal.open} 
        onOpenChange={(open) => setPlanModal({ open, data: open ? planModal.data : null })} 
        initialData={planModal.data} 
      />

      <ConfirmDialog 
        open={!!deletingPlanId}
        onOpenChange={(open) => !open && setDeletingPlanId(null)}
        title="Delete Plan?"
        description="This will remove the plan from future purchases. Existing subscriptions will remain active."
        confirmLabel="Delete Plan"
        variant="danger"
        onConfirm={() => deletingPlanId && deletePlan.mutate(deletingPlanId, { onSuccess: () => setDeletingPlanId(null) })}
      />

      <Dialog open={adjustModal.open} onOpenChange={(v) => !v && setAdjustModal({ open: false, sub: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-[#378ADD]" /> Adjust Subscription Visits
            </DialogTitle>
            <DialogDescription>
              Modify the remaining visits for {adjustModal.sub?.user_details?.full_name || 'this subscriber'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Visits to Add/Sub</Label>
                  <Input 
                    type="number" 
                    value={adjustment.visits} 
                    onChange={(e) => setAdjustment(p => ({...p, visits: e.target.value}))}
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Current Remaining</span>
                  <span className="text-sm font-bold text-slate-800">{adjustModal.sub?.visits_remaining}</span>
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Reason for Adjustment</Label>
                <Textarea 
                  placeholder="e.g. Compensation for delay, Manual renewal"
                  className="text-xs min-h-[80px] font-medium"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment(p => ({...p, reason: e.target.value}))}
                />
             </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setAdjustModal({ open: false, sub: null })} className="text-xs font-bold uppercase">Cancel</Button>
            <Button onClick={handleAdjust} disabled={adjustVisits.isPending} className="text-xs font-bold uppercase bg-[#378ADD] hover:bg-[#2D6FA3]">
              {adjustVisits.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
