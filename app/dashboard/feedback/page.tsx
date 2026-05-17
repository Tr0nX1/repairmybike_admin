'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useFeedback, Feedback } from '@/hooks/useFeedback';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

export default function FeedbackPage() {
  const router = useRouter();
  const { data: feedback, isLoading, updateStatus, deleteFeedback } = useFeedback();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const avgRating = feedback?.length 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const columns = [
    {
      header: '',
      accessor: (f: Feedback) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}>
          {expandedId === f.id ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </Button>
      ),
      width: '40px'
    },
    {
      header: 'Customer',
      accessor: (f: Feedback) => (
        <div className="flex flex-col py-1">
          <span className="text-xs font-bold text-slate-800">{f.customer_name || 'Anonymous'}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">#{f.booking_id_display}</span>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: (f: Feedback) => (
        <div className="flex items-center gap-0.5">
           {[...Array(5)].map((_, i) => (
             <Star key={i} className={`h-3 w-3 ${i < f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
           ))}
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (f: Feedback) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-5 border-slate-200 bg-slate-50 text-slate-600">
          {f.category}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessor: (f: Feedback) => <StatusBadge status={f.status} />
    },
    {
      header: 'Date',
      accessor: (f: Feedback) => (
        <span className="text-[10px] font-medium text-slate-500">{format(new Date(f.created_at), 'MMM dd, yyyy')}</span>
      )
    },
    {
      header: 'Actions',
      accessor: (f: Feedback) => (
        <div className="flex justify-end gap-2 px-4">
           {f.status === 'pending' && (
             <Button size="sm" className="h-7 text-[9px] font-bold uppercase bg-green-600 hover:bg-green-700 px-3 tracking-widest shadow-sm" onClick={() => updateStatus.mutate({ id: f.id, status: 'reviewed' })}>
                Reviewed
             </Button>
           )}
           {f.status === 'reviewed' && (
             <Button size="sm" className="h-7 text-[9px] font-bold uppercase bg-[#378ADD] hover:bg-[#2D6FA3] px-3 tracking-widest shadow-sm" onClick={() => updateStatus.mutate({ id: f.id, status: 'resolved' })}>
                Resolved
             </Button>
           )}
           <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteFeedback.mutate(f.id)}>
              <Trash2 className="h-3.5 w-3.5" />
           </Button>
        </div>
      ),
      width: '180px',
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customer Feedback" 
        subtitle="Monitor service quality and customer satisfaction"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-[0.5px] shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 border border-yellow-100">
                  <Star className="h-6 w-6 fill-current" />
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Average Rating</p>
                  <h3 className="text-2xl font-bold text-slate-800">{avgRating} / 5.0</h3>
               </div>
            </CardContent>
         </Card>
         <Card className="border-[0.5px] shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-[#378ADD] border border-blue-100">
                  <MessageSquare className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Reviews</p>
                  <h3 className="text-2xl font-bold text-slate-800">{feedback?.length || 0}</h3>
               </div>
            </CardContent>
         </Card>
         <Card className="border-[0.5px] shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
                  <CheckCircle2 className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Pending Review</p>
                  <h3 className="text-2xl font-bold text-slate-800">{feedback?.filter(f => f.status === 'pending').length || 0}</h3>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
         <DataTable 
           columns={columns} 
           data={feedback} 
           isLoading={isLoading} 
           emptyMessage="No customer feedback found."
         />
      </div>

      {expandedId && (
        <Card className="border-[0.5px] border-l-4 border-l-[#378ADD] shadow-lg animate-in slide-in-from-top-2 bg-slate-50/30">
           <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Full Comment
                 </h4>
                 <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase tracking-widest gap-2 bg-white" onClick={() => router.push(`/dashboard/bookings/${feedback?.find(f => f.id === expandedId)?.booking_id_display}`)}>
                    View Booking <ExternalLink className="h-3 w-3" />
                 </Button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-bold italic bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                 "{feedback?.find(f => f.id === expandedId)?.comment}"
              </p>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
