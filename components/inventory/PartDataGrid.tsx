'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  History,
  Barcode,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { SparePart } from '@/types/parts';
import { cn } from '@/lib/utils';
import { useParts } from '@/hooks/useParts';
import { EditPartModal } from './EditPartModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface PartDataGridProps {
  parts: SparePart[];
  isLoading: boolean;
}

export const PartDataGrid = ({ parts, isLoading }: PartDataGridProps) => {
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<string>('');
  
  const [fullEditPart, setFullEditPart] = useState<SparePart | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { updatePart, deletePart } = useParts();

  const handleInlineEdit = (part: SparePart) => {
    setInlineEditingId(part.id);
    setEditStock(part.stock_qty);
    setEditPrice(part.sale_price);
  };

  const handleInlineSave = async (id: number) => {
    try {
      await updatePart.mutateAsync({ 
        id, 
        stock_qty: editStock, 
        sale_price: editPrice 
      });
      setInlineEditingId(null);
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl border">
        <Loader2 className="h-6 w-6 animate-spin text-[#378ADD]" />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-slate-50/50">
            <TableHead className="w-[100px] text-[10px] font-bold uppercase py-3 px-4">SKU</TableHead>
            <TableHead className="text-[10px] font-bold uppercase">Item Name</TableHead>
            <TableHead className="w-[120px] text-[10px] font-bold uppercase">Stock Level</TableHead>
            <TableHead className="w-[120px] text-[10px] font-bold uppercase">Sale Price</TableHead>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase">Status</TableHead>
            <TableHead className="w-[180px] text-[10px] font-bold uppercase text-right px-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => {
            const isInlineEditing = inlineEditingId === part.id;
            const isLowStock = part.stock_qty < 5;

            return (
              <TableRow 
                key={part.id} 
                className={cn(
                  "hover:bg-slate-50 transition-colors group",
                  isLowStock && !isInlineEditing && "bg-red-50/30"
                )}
              >
                <TableCell className="text-xs font-bold text-muted-foreground px-4">{part.sku}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{part.name}</span>
                    <span className="text-[10px] text-muted-foreground">Category ID: {part.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {isInlineEditing ? (
                    <Input 
                      type="number" 
                      className="h-8 text-xs w-20" 
                      value={editStock} 
                      onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold", isLowStock ? "text-red-600" : "text-foreground")}>
                        {part.stock_qty}
                      </span>
                      {isLowStock && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isInlineEditing ? (
                    <Input 
                      className="h-8 text-xs w-24" 
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  ) : (
                    <span className="text-xs font-bold">₹{parseFloat(part.sale_price).toLocaleString()}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[9px] font-bold uppercase",
                      part.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {part.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-4">
                  <div className="flex justify-end gap-1">
                    {isInlineEditing ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-green-600 hover:text-green-700"
                          onClick={() => handleInlineSave(part.id)}
                          disabled={updatePart.isPending}
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-600 hover:text-red-700"
                          onClick={() => setInlineEditingId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="History">
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#378ADD]" onClick={() => handleInlineEdit(part)} title="Inline Edit">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600" onClick={() => setFullEditPart(part)} title="Full Edit">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeletingId(part.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {fullEditPart && (
        <EditPartModal 
          part={fullEditPart} 
          open={!!fullEditPart} 
          onOpenChange={(open) => !open && setFullEditPart(null)} 
        />
      )}

      <ConfirmDialog 
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Remove Part?"
        description="This will permanently remove the item from inventory. This action cannot be undone."
        confirmLabel="Delete Permanently"
        variant="danger"
        onConfirm={() => deletingId && deletePart.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
      />
    </div>
  );
};
