'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  useCashSessions, 
  useStaffList, 
  useApproveCashSession,
  useCashMovements,
  CashSession,
  CashMovement
} from '@/hooks/useCashSessions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle,
  Banknote,
  Calendar,
  User,
  History
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function CashManagementPage() {
  const [filters, setFilters] = useState({
    staff_id: '' as string,
    status: '' as string,
    date_from: '' as string,
    date_to: '' as string
  });
  
  const { data: sessions, isLoading, refetch } = useCashSessions(filters);
  const { data: staffList } = useStaffList();
  
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; session: CashSession | null; approved: boolean }>({
    open: false,
    session: null,
    approved: true
  });
  const [notes, setNotes] = useState('');
  
  const approveMutation = useApproveCashSession();

  const handleExportCSV = () => {
    if (!sessions || sessions.length === 0) return;
    
    const headers = ['ID', 'Date', 'Staff', 'Opening', 'Closing', 'Expected', 'Variance', 'Status'];
    const rows = sessions.map(s => [
      s.id,
      s.date,
      s.staff_name,
      s.opening_balance,
      s.closing_balance || 'N/A',
      s.expected_closing || 'N/A',
      s.variance || '0',
      s.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cash_management_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (session: CashSession, approved: boolean) => {
    setApproveDialog({ open: true, session, approved });
    setNotes('');
  };

  const confirmAction = () => {
    if (!approveDialog.session) return;
    approveMutation.mutate({
      id: approveDialog.session.id,
      approved: approveDialog.approved,
      notes
    }, {
      onSuccess: () => setApproveDialog({ open: false, session: null, approved: true })
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cash Management" 
        subtitle="Manage daily cash sessions and verify reconciliation"
        actions={
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-[0.5px] shadow-sm overflow-visible bg-white">
        <CardContent className="p-4 flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 tracking-wider">
              <User className="h-3 w-3" /> Staff Member
            </label>
            <Select value={filters.staff_id || 'all'} onValueChange={(v: string | null) => setFilters(f => ({...f, staff_id: (v === 'all' || !v) ? '' : v}))}>
              <SelectTrigger className="w-[180px] h-9 text-xs font-medium">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList?.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name || s.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 tracking-wider">
              <History className="h-3 w-3" /> Status
            </label>
            <Select value={filters.status || 'all'} onValueChange={(v: string | null) => setFilters(f => ({...f, status: (v === 'all' || !v) ? '' : v}))}>
              <SelectTrigger className="w-[150px] h-9 text-xs font-medium">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 tracking-wider">
              <Calendar className="h-3 w-3" /> From Date
            </label>
            <Input 
              type="date" 
              className="h-9 w-[150px] text-xs font-medium" 
              value={filters.date_from} 
              onChange={(e) => setFilters(f => ({...f, date_from: e.target.value}))} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 tracking-wider">
              <Calendar className="h-3 w-3" /> To Date
            </label>
            <Input 
              type="date" 
              className="h-9 w-[150px] text-xs font-medium" 
              value={filters.date_to} 
              onChange={(e) => setFilters(f => ({...f, date_to: e.target.value}))} 
            />
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 text-xs font-bold text-[#378ADD] hover:bg-blue-50" 
            onClick={() => setFilters({staff_id: '', status: '', date_from: '', date_to: ''})}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-[10px] font-bold uppercase py-4 tracking-wider">Date & Staff</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider">Opening / Expected</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider">Closing / Variance</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right px-6 tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#378ADD]" /></div>
                </TableCell>
              </TableRow>
            ) : !sessions || sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <div className="flex flex-col items-center opacity-40">
                    <Banknote className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No cash sessions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map(session => (
                <SessionRow 
                  key={session.id} 
                  session={session} 
                  expanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  onAction={handleAction}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={approveDialog.open} onOpenChange={(open) => !open && setApproveDialog(prev => ({...prev, open: false}))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approveDialog.approved ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {approveDialog.approved ? 'Approve Cash Session' : 'Flag Cash Session'}
            </DialogTitle>
            <DialogDescription>
              {approveDialog.approved 
                ? `You are confirming the cash reconciliation for ${approveDialog.session?.staff_name}.`
                : `You are flagging this session for further investigation.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground font-medium">Variance:</span>
                  <span className={`font-bold ${parseFloat(approveDialog.session?.variance || '0') !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                    ₹{approveDialog.session?.variance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Closing Balance:</span>
                  <span className="font-bold">₹{approveDialog.session?.closing_balance}</span>
                </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Internal Notes</label>
               <Textarea 
                placeholder="Add any comments regarding this approval/flag..."
                className="text-xs min-h-[100px] font-medium"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
               />
             </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setApproveDialog(prev => ({...prev, open: false}))} className="text-xs font-bold uppercase">Cancel</Button>
            <Button 
              className={approveDialog.approved ? 'bg-green-600 hover:bg-green-700 text-xs font-bold uppercase' : 'bg-amber-500 hover:bg-amber-600 text-xs font-bold uppercase'}
              onClick={confirmAction}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              Confirm {approveDialog.approved ? 'Approval' : 'Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionRow({ session, expanded, onToggle, onAction }: { 
  session: CashSession; 
  expanded: boolean; 
  onToggle: () => void;
  onAction: (s: CashSession, approved: boolean) => void;
}) {
  const { data: movements, isLoading } = useCashMovements(expanded ? session.id : null);

  return (
    <>
      <TableRow className={`hover:bg-slate-50/80 transition-colors border-b last:border-0 ${expanded ? 'bg-slate-50/50' : ''}`}>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200" onClick={onToggle}>
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-[10px] font-bold text-[#378ADD] uppercase tracking-tighter">{session.staff_name}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">₹{parseFloat(session.opening_balance).toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Exp: ₹{parseFloat(session.expected_closing || '0').toLocaleString()}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">₹{session.closing_balance ? parseFloat(session.closing_balance).toLocaleString() : '---'}</span>
            <span className={`text-[9px] font-bold uppercase tracking-tighter ${parseFloat(session.variance || '0') !== 0 ? 'text-red-500' : 'text-green-600'}`}>
              Var: ₹{parseFloat(session.variance || '0').toLocaleString()}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge status={session.status} />
        </TableCell>
        <TableCell className="text-right px-6">
          {session.status === 'pending_approval' && (
            <div className="flex justify-end gap-2">
              <Button size="sm" className="h-7 text-[9px] font-bold uppercase bg-green-600 hover:bg-green-700 px-3 tracking-widest shadow-sm" onClick={() => onAction(session, true)}>Approve</Button>
              <Button size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase text-amber-600 border-amber-200 hover:bg-amber-50 px-3 tracking-widest" onClick={() => onAction(session, false)}>Flag</Button>
            </div>
          )}
          {session.status === 'approved' && (
             <div className="text-[9px] font-bold text-green-600 uppercase flex flex-col items-end tracking-tight">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Verified by {session.approved_by_name}</span>
                <span className="text-slate-400 font-medium lowercase">On {session.approved_at ? format(new Date(session.approved_at), 'MMM dd, HH:mm') : '-'}</span>
             </div>
          )}
          {session.status === 'flagged' && (
             <div className="text-[9px] font-bold text-amber-600 uppercase flex flex-col items-end tracking-tight">
                <span className="flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" /> Flagged by {session.approved_by_name}</span>
                <span className="text-slate-400 font-medium lowercase">On {session.approved_at ? format(new Date(session.approved_at), 'MMM dd, HH:mm') : '-'}</span>
             </div>
          )}
          {session.status === 'open' && (
             <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest italic opacity-60">In Progress</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-slate-50/50 hover:bg-transparent">
          <TableCell colSpan={6} className="p-0">
            <div className="px-12 py-6 border-b bg-slate-50/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Banknote className="h-3 w-3" /> Session Movements
                </h4>
                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-white">
                  {movements?.length || 0} Transactions
                </Badge>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : !movements || movements.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">No movements recorded</p>
                </div>
              ) : (
                <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[9px] font-bold uppercase py-2 tracking-wider">Time</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase tracking-wider">Type</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase tracking-wider">Description / Booking</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-right px-6 tracking-wider">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map(m => (
                        <TableRow key={m.id} className="hover:bg-slate-50/50 border-b last:border-0">
                          <TableCell className="text-[10px] font-medium text-slate-500">
                            {format(new Date(m.recorded_at), 'HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[8px] font-bold uppercase h-4 px-1.5 ${m.movement_type === 'collection' ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                              {m.movement_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-700">{m.description}</span>
                              {m.booking_id && (
                                <span className="text-[9px] text-[#378ADD] font-bold uppercase tracking-tighter mt-0.5">
                                  #{m.booking_id}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] font-bold text-right px-6 text-slate-800">
                            ₹{parseFloat(m.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {session.notes && (
                  <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/50">
                    <p className="text-[10px] font-bold uppercase text-blue-800 mb-1.5 tracking-wider">Staff Notes</p>
                    <p className="text-[11px] text-blue-700 font-medium italic leading-relaxed">"{session.notes}"</p>
                  </div>
                )}
                {session.approval_notes && (
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Manager Feedback</p>
                    <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">"{session.approval_notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
