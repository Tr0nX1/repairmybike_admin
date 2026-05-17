'use client';

import { ReactNode } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  width?: string;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
}

export function DataTable<T extends { id: number | string }>({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = "No data found",
  onRowClick,
  rowClassName
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-slate-50/50">
            {columns.map((col, i) => (
              <TableHead 
                key={i} 
                style={{ width: col.width }}
                className={cn("text-[10px] font-bold uppercase py-3", col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item.id}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-slate-50",
                typeof rowClassName === 'function' ? rowClassName(item) : rowClassName
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col, j) => (
                <TableCell key={j} className={cn("py-3", col.className)}>
                  {col.render 
                    ? col.render(item) 
                    : typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
