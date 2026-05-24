'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePlans } from '@/hooks/usePlans';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, CreditCard, Users, History, Loader2, ArrowUpCircle, User, Check, X, AlertTriangle } from 'lucide-react';
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
  
  // Queries
  const { data: pendingData, isLoading: pendingLoading, approveSubscription, rejectSubscription } = useSubscriptions({ status: 'pending' });
  const { data: activeData, isLoading: activeLoading, adjustVisits } = useSubscriptions({ status: 'active' });
  const { data: canceledData, isLoading: canceledLoading } = useSubscriptions({ status: 'canceled' });
  const { data: expiredData, isLoading: expiredLoading } = useSubscriptions({ status: 'expired' });

  // Dialog / Modal States
  const [planModal, setPlanModal] = useState<{ open: boolean, data: any | null }>({ open: false, data: null });
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  
  const [adjustModal, setAdjustModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  const [adjustment, setAdjustment] = useState({ visits: '1', reason: '' });
  const [adjustError, setAdjustError] = useState('');

  const [rejectModal, setRejectModal] = useState<{ open: boolean, sub: any | null }>({ open: false, sub: null });
  const [rejectReason, setRejectReason] = useState('');

  const planColumns = [
    { 
      header: 'Plan Name', 
      accessor: (p: any) => (
        <div className="flex items-start gap-3 py-1">
          <div className="h-10 w-10 bg-blue-50 rounded border flex items-center justify-center text-[#378ADD] shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-800">{p.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{p.duration_months} Months</span>
            {p.benefits_list?.length ? (
              <span className="text-[9px] text-slate-500">{p.benefits_list.length} benefits included</span>
            ) : null}
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
      header: 'Services', 
      accessor: (p: any) => (
        <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-slate-200">
          {p.included_services?.length ?? 0} services
        </Badge>
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

  const pendingColumns = [
    {
      header: 'Subscriber',
      accessor: (s: any) => (
        <div className="flex flex-col py-1">
          <span className="text-xs font-bold text-slate-800">{s.user_name || 'User #' + s.user}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{s.user_phone || s.contact_phone || s.contact_email}</span>
        </div>
      )
    },
    {
      header: 'Plan',
      accessor: (s: any) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-5 border-blue-100 bg-blue-50 text-blue-700 w-fit">
          {s.plan_name}
        </Badge>
      )
    },
    {
      header: 'Requested',
      accessor: (s: any) => (
        <span className="text-xs font-semibold text-slate-600">
          {new Date(s.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (s: any) => (
        <div className="flex justify-end gap-2 px-4">
          <Button
            variant="default"
            size="sm"
            className="h-7 text-[9px] font-bold uppercase bg-green-600 hover:bg-green-700 text-white gap-1"
            onClick={() => approveSubscription.mutate(s.id)}
            disabled={approveSubscription.isPending}
          >
            {approveSubscription.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-[9px] font-bold uppercase bg-red-600 hover:bg-red-700 text-white gap-1"
            onClick={() => setRejectModal({ open: true, sub: s })}
            disabled={rejectSubscription.isPending}
          >
            <X className="h-3 w-3" />
            Reject
          </Button>
        </div>
      ),
      width: '180px',
      className: 'text-right'
    }
  ];

  const subColumns = [
    {
      header: 'Subscriber',
      accessor: (s: any) => (
        <div className="flex flex-col py-1">
          <span className="text-xs font-bold text-slate-800">{s.user_name || 'User #' + s.user}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{s.user_phone || s.contact_phone || s.contact_email}</span>
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
      header: 'Approved By',
      accessor: (s: any) => (
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{s.approved_by || 'system'}</span>
      )
    },
    {
      header: 'Active Since',
      accessor: (s: any) => (
        <span className="text-[10px] font-semibold text-slate-500">
          {s.approved_at ? new Date(s.approved_at).toLocaleDateString() : new Date(s.start_date).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Expires',
      accessor: (s: any) => (
        <span className="text-[10px] font-semibold text-slate-500">
          {s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}
        </span>
      )
    },
    {
      header: 'Visits',
      accessor: (s: any) => (
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-slate-800 min-w-[32px]">{s.visits_used} / {s.plan_visit_limit}</span>
           <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200">
              <div 
                className="h-full bg-[#378ADD]" 
                style={{ width: `${Math.min(100, (s.visits_used / (s.plan_visit_limit || 1)) * 100)}%` }}
              />
           </div>
        </div>
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

  const historyColumns = [
    {
      header: 'Subscriber',
      accessor: (s: any) => (
        <div className="flex flex-col py-1">
          <span className="text-xs font-bold text-slate-800">{s.user_name || 'User #' + s.user}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{s.user_phone || s.contact_phone || s.contact_email}</span>
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
      header: 'Status',
      accessor: (s: any) => (
        <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 h-5 ${
          s.status === 'canceled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {s.status}
        </Badge>
      )
    },
    {
      header: 'Validity',
      accessor: (s: any) => (
        <div className="flex flex-col text-[10px] font-bold tracking-tight">
          <span className="text-slate-700">{new Date(s.start_date).toLocaleDateString()}</span>
          <span className="text-slate-300 uppercase text-[8px]">to</span>
          <span className="text-slate-500">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</span>
        </div>
      )
    },
    {
      header: 'Reason / Details',
      accessor: (s: any) => (
        <span className="text-xs font-medium text-slate-600 block max-w-[200px] truncate" title={s.rejection_reason}>
          {s.rejection_reason || '—'}
        </span>
      )
    }
  ];

  const handleAdjust = () => {
    if (!adjustModal.sub) return;
    const amount = parseInt(adjustment.visits, 10) || 0;
    const currentRemaining = adjustModal.sub?.visits_remaining ?? 0;
    const planLimit = adjustModal.sub?.plan_visit_limit ?? 0;
    const newRemaining = currentRemaining + amount;

    if (!adjustment.reason.trim()) {
      setAdjustError('Please enter a reason for the adjustment.');
      return;
    }

    if (amount === 0) {
      setAdjustError('Adjustment must be a non-zero integer.');
      return;
    }

    if (newRemaining < 0 || newRemaining > planLimit) {
      setAdjustError(`Resulting remaining visits must be between 0 and ${planLimit}.`);
      return;
    }

    setAdjustError('');
    adjustVisits.mutate({
      id: adjustModal.sub.id,
      adjustment: amount,
      reason: adjustment.reason.trim()
    }, {
      onSuccess: () => {
        setAdjustModal({ open: false, sub: null });
        setAdjustment({ visits: '1', reason: '' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscription Management" 
        subtitle="Manage membership plans and monitor active subscribers"
      />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="flex w-fit mb-6 bg-slate-100/50 p-1 rounded-lg">
          <TabsTrigger value="plans" className="text-[10px] font-bold uppercase tracking-widest px-6">PLANS</TabsTrigger>
          <TabsTrigger value="pending" className="text-[10px] font-bold uppercase tracking-widest px-6">PENDING REQUESTS</TabsTrigger>
          <TabsTrigger value="subscribers" className="text-[10px] font-bold uppercase tracking-widest px-6">ACTIVE SUBSCRIBERS</TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] font-bold uppercase tracking-widest px-6">HISTORY</TabsTrigger>
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

        <TabsContent value="pending" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={pendingColumns} 
              data={pendingData?.data} 
              isLoading={pendingLoading} 
              emptyMessage="No pending subscription requests."
            />
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={subColumns} 
              data={activeData?.data} 
              isLoading={activeLoading} 
              emptyMessage="No active subscribers found."
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <DataTable 
              columns={historyColumns} 
              data={[...(canceledData?.data || []), ...(expiredData?.data || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} 
              isLoading={canceledLoading || expiredLoading} 
              emptyMessage="No subscription history found."
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
                  <span className="text-sm font-bold text-slate-800">{adjustModal.sub?.visits_remaining ?? 0}</span>
                  <span className="text-[9px] text-slate-500">Plan limit: {adjustModal.sub?.plan_visit_limit ?? '—'}</span>
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
             {adjustError ? (
                <div className="rounded-md bg-red-50 border border-red-100 p-3 text-xs text-red-700">
                  {adjustError}
                </div>
             ) : null}
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

      <Dialog open={rejectModal.open} onOpenChange={(v) => !v && setRejectModal({ open: false, sub: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Reject Subscription Request
            </DialogTitle>
            <DialogDescription>
              Specify a reason for rejecting the request for {rejectModal.sub?.user_name || 'this subscriber'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Rejection Reason</Label>
                <Textarea 
                  placeholder="e.g. Payment not received, invalid customer details"
                  className="text-xs min-h-[80px] font-medium"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
             </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setRejectModal({ open: false, sub: null }); setRejectReason(''); }} className="text-xs font-bold uppercase">Cancel</Button>
            <Button 
              onClick={() => {
                if (rejectModal.sub) {
                  rejectSubscription.mutate({ id: rejectModal.sub.id, reason: rejectReason.trim() }, {
                    onSuccess: () => {
                      setRejectModal({ open: false, sub: null });
                      setRejectReason('');
                    }
                  });
                }
              }} 
              disabled={rejectSubscription.isPending} 
              className="text-xs font-bold uppercase bg-red-600 hover:bg-red-700 text-white"
            >
              {rejectSubscription.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
