'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useLogs } from '@/hooks/useLogs';
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
import { Loader2, Download, History, User, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LogsPage() {
  const [filters, setFilters] = useState<{ action_type?: string }>({});
  const [page, setPage] = useState(1);
  
  const { data: paginatedData, isLoading } = useLogs(filters, page);
  const logs = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = Math.ceil(totalCount / 50); // Assuming 50 per page as per backend

  const getLogStyle = (action: string) => {
    switch (action) {
      case 'status_change': return 'bg-blue-50 text-blue-700';
      case 'part_added': return 'bg-amber-50 text-amber-700';
      case 'stock_update': return 'bg-purple-50 text-purple-700';
      case 'error': return 'bg-red-50 text-red-700';
      case 'completed': return 'bg-green-50 text-green-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const handleExport = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'User', 'Action', 'Description'];
    const rows = logs.map(l => [l.timestamp, l.username, l.action_type, l.description]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Audit Logs" 
        subtitle={`Detailed history of all administrative actions (${totalCount} total)`}
        actions={
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={handleExport} disabled={!logs.length}>
            <Download className="h-3.5 w-3.5" />
            Export Current Page CSV
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-6">
        <Select onValueChange={(val: string | null) => { setFilters({ action_type: val === 'all' || !val ? undefined : val }); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-9 text-xs bg-white">
            <SelectValue placeholder="All Action Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="status_change">Status Changes</SelectItem>
            <SelectItem value="part_added">Parts Added</SelectItem>
            <SelectItem value="stock_update">Stock Updates</SelectItem>
            <SelectItem value="price_change">Price Changes</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => { setFilters({}); setPage(1); }}>
          <Filter className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              <TableHead className="w-[180px] text-[10px] font-bold uppercase py-3">Timestamp</TableHead>
              <TableHead className="w-[150px] text-[10px] font-bold uppercase">User</TableHead>
              <TableHead className="w-[150px] text-[10px] font-bold uppercase">Action</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <History className="h-10 w-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No activity logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <TableCell className="text-[11px] font-medium text-muted-foreground">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase">
                        {log.username[0]}
                      </div>
                      <span className="text-xs font-bold text-foreground">{log.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[9px] font-bold uppercase border-none", getLogStyle(log.action_type))}>
                      {log.action_type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground group-hover:text-blue-700 transition-colors">
                    {log.description}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground mx-4">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
