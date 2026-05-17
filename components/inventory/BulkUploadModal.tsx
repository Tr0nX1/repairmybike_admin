'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInventoryUpload } from '@/hooks/useInventoryUpload';
import { Loader2, Upload, Download, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkUploadModal = ({ open, onOpenChange }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const { bulkUpload } = useInventoryUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['name', 'category_slug', 'brand_slug', 'sku', 'mrp', 'sale_price', 'stock_qty', 'description'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
      + "Sample Part,engine-oil,castrol,SKU-001,500,450,10,High performance oil";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "spare_parts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      await bulkUpload.mutateAsync(file);
      onOpenChange(false);
      setFile(null);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Inventory Upload</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create or update spare parts in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border shadow-sm">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Template File</span>
                <span className="text-[10px] text-muted-foreground">Download the correct format</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={handleDownloadTemplate}>
              Download CSV
            </Button>
          </div>

          {!file ? (
            <label className={cn(
              "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all",
              "hover:bg-slate-50 hover:border-[#378ADD] group"
            )}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-[#378ADD]" />
                <p className="mb-2 text-xs font-bold text-slate-500">Click to upload or drag and drop</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">CSV files only</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative p-4 rounded-xl border bg-blue-50/50 border-blue-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center border shadow-sm">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-bold truncate">{file.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {bulkUpload.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-red-800">Upload Errors Found</p>
                <p className="text-[10px] text-red-700 mt-1">{(bulkUpload.error as any)?.response?.data?.message || 'Check CSV formatting'}</p>
                {(bulkUpload.error as any)?.response?.data?.row_errors && (
                  <div className="mt-2 max-h-24 overflow-y-auto bg-white/50 p-2 rounded text-[9px] font-mono">
                    {(bulkUpload.error as any).response.data.row_errors.map((err: any, i: number) => (
                      <div key={i} className="mb-1 text-red-800">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="h-9 text-xs bg-[#378ADD] hover:bg-[#2D6FA3] text-white px-6 gap-2" 
            disabled={!file || bulkUpload.isPending}
            onClick={handleSubmit}
          >
            {bulkUpload.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Confirm Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
