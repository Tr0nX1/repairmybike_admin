'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useVehicles, VehicleType, VehicleBrand, VehicleModel } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, Bike, ChevronRight, Settings, Info, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function VehiclesPage() {
  const { useTypes, useBrands, useModels, createType, createBrand, createModel, updateModel, deleteModel } = useVehicles();
  
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [addModelOpen, setAddModelOpen] = useState(false);

  const [typeName, setTypeName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelEngineCc, setModelEngineCc] = useState('');
  const [modelYearFrom, setModelYearFrom] = useState('');
  const [modelYearTo, setModelYearTo] = useState('');

  const [editModel, setEditModel] = useState<VehicleModel | null>(null);
  const [editModelName, setEditModelName] = useState('');
  const [editModelEngineCc, setEditModelEngineCc] = useState('');
  const [editModelYearFrom, setEditModelYearFrom] = useState('');
  const [editModelYearTo, setEditModelYearTo] = useState('');
  const [modelToDeleteId, setModelToDeleteId] = useState<number | null>(null);

  const handleStartEditModel = (model: VehicleModel) => {
    setEditModel(model);
    setEditModelName(model.name || '');
    setEditModelEngineCc(model.engine_cc ? model.engine_cc.toString() : '');
    setEditModelYearFrom(model.year_from ? model.year_from.toString() : '');
    setEditModelYearTo(model.year_to ? model.year_to.toString() : '');
  };

  const { data: types, isLoading: loadingTypes } = useTypes();
  const { data: brands, isLoading: loadingBrands } = useBrands(selectedTypeId || undefined);
  const { data: models, isLoading: loadingModels } = useModels(selectedBrandId || undefined);

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    createType.mutate({ name: typeName }, {
      onSuccess: () => {
        setTypeName('');
        setAddTypeOpen(false);
      }
    });
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !selectedTypeId) return;
    createBrand.mutate({ name: brandName, vehicle_type: selectedTypeId }, {
      onSuccess: () => {
        setBrandName('');
        setAddBrandOpen(false);
      }
    });
  };

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim() || !selectedBrandId) return;
    createModel.mutate({
      name: modelName,
      vehicle_brand: selectedBrandId,
      engine_cc: modelEngineCc ? parseInt(modelEngineCc) : undefined,
      year_from: modelYearFrom ? parseInt(modelYearFrom) : undefined,
      year_to: modelYearTo ? parseInt(modelYearTo) : undefined,
    }, {
      onSuccess: () => {
        setModelName('');
        setModelEngineCc('');
        setModelYearFrom('');
        setModelYearTo('');
        setAddModelOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vehicle Catalog" 
        subtitle="Manage vehicle types, brands and models supported by the shop"
        actions={
          <Button className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]" onClick={() => setAddTypeOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Quick Add
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        
        {/* COLUMN 1: TYPES */}
        <Card className="flex flex-col shadow-sm border-slate-200">
          <CardHeader className="py-4 bg-slate-50/50 border-b">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vehicle Types</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loadingTypes ? (
              <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
              <div className="divide-y">
                {types?.map((type) => (
                  <div 
                    key={type.id}
                    onClick={() => { setSelectedTypeId(type.id); setSelectedBrandId(null); }}
                    className={cn(
                      "flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedTypeId === type.id ? "bg-blue-50/50 border-r-4 border-[#378ADD]" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border shadow-sm text-slate-400">
                         <Bike className="h-4 w-4" />
                       </div>
                       <span className={cn("text-xs font-bold", selectedTypeId === type.id ? "text-blue-700" : "text-slate-700")}>
                         {type.name}
                       </span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4", selectedTypeId === type.id ? "text-[#378ADD]" : "text-slate-300")} />
                  </div>
                ))}
                <button onClick={() => setAddTypeOpen(true)} className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
                  <Plus className="h-3 w-3" /> Add New Type
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* COLUMN 2: BRANDS */}
        <Card className="flex flex-col shadow-sm border-slate-200">
          <CardHeader className="py-4 bg-slate-50/50 border-b">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brands</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!selectedTypeId ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                <Info className="h-8 w-8 mb-2" />
                <p className="text-[10px] font-bold uppercase">Select a type to view brands</p>
              </div>
            ) : loadingBrands ? (
              <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
              <div className="divide-y">
                {brands?.map((brand) => (
                  <div 
                    key={brand.id}
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={cn(
                      "flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedBrandId === brand.id ? "bg-blue-50/50 border-r-4 border-[#378ADD]" : ""
                    )}
                  >
                    <span className={cn("text-xs font-bold", selectedBrandId === brand.id ? "text-blue-700" : "text-slate-700")}>
                      {brand.name}
                    </span>
                    <ChevronRight className={cn("h-4 w-4", selectedBrandId === brand.id ? "text-[#378ADD]" : "text-slate-300")} />
                  </div>
                ))}
                {brands?.length === 0 && <p className="p-6 text-center text-[10px] text-muted-foreground italic">No brands found for this type</p>}
                <button onClick={() => setAddBrandOpen(true)} className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
                  <Plus className="h-3 w-3" /> Add Brand
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* COLUMN 3: MODELS */}
        <Card className="flex flex-col shadow-sm border-slate-200">
          <CardHeader className="py-4 bg-slate-50/50 border-b">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Models</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!selectedBrandId ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                <Settings className="h-8 w-8 mb-2" />
                <p className="text-[10px] font-bold uppercase">Select a brand to view models</p>
              </div>
            ) : loadingModels ? (
              <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
              <div className="divide-y">
                {models?.map((model) => (
                  <div key={model.id} className="p-4 group hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-black text-slate-800">{model.name}</span>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEditModel(model)}><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setModelToDeleteId(model.id)}><Trash2 className="h-3 w-3" /></Button>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.engine_cc && <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[9px] font-bold">{model.engine_cc} CC</Badge>}
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[9px] font-bold">
                        {model.year_from || 'Any'} - {model.year_to || 'Now'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {models?.length === 0 && <p className="p-6 text-center text-[10px] text-muted-foreground italic">No models found for this brand</p>}
                <button onClick={() => setAddModelOpen(true)} className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
                  <Plus className="h-3 w-3" /> Add Model
                </button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ADD TYPE DIALOG */}
      <Dialog open={addTypeOpen} onOpenChange={setAddTypeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle Type</DialogTitle>
            <DialogDescription>Create a new vehicle type (e.g. Motorcycle, Scooter).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateType} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Type Name</label>
              <Input 
                required 
                placeholder="e.g. Motorcycle" 
                value={typeName} 
                onChange={(e) => setTypeName(e.target.value)} 
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setAddTypeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createType.isPending}>
                {createType.isPending ? 'Saving...' : 'Add Type'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD BRAND DIALOG */}
      <Dialog open={addBrandOpen} onOpenChange={setAddBrandOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
            <DialogDescription>Create a new brand for the selected vehicle type.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBrand} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Brand Name</label>
              <Input 
                required 
                placeholder="e.g. Honda" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)} 
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setAddBrandOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBrand.isPending}>
                {createBrand.isPending ? 'Saving...' : 'Add Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD MODEL DIALOG */}
      <Dialog open={addModelOpen} onOpenChange={setAddModelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle Model</DialogTitle>
            <DialogDescription>Create a new model for the selected brand.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModel} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Model Name</label>
              <Input 
                required 
                placeholder="e.g. Activa 6G" 
                value={modelName} 
                onChange={(e) => setModelName(e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Engine CC</label>
              <Input 
                type="number" 
                placeholder="e.g. 110" 
                value={modelEngineCc} 
                onChange={(e) => setModelEngineCc(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Year From</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 2020" 
                  value={modelYearFrom} 
                  onChange={(e) => setModelYearFrom(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Year To</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 2026" 
                  value={modelYearTo} 
                  onChange={(e) => setModelYearTo(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setAddModelOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createModel.isPending}>
                {createModel.isPending ? 'Saving...' : 'Add Model'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* EDIT MODEL DIALOG */}
      <Dialog open={!!editModel} onOpenChange={(open) => !open && setEditModel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle Model</DialogTitle>
            <DialogDescription>Update model details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!editModel || !editModelName.trim()) return;
            updateModel.mutate({
              id: editModel.id,
              data: {
                name: editModelName,
                engine_cc: editModelEngineCc ? parseInt(editModelEngineCc) : undefined,
                year_from: editModelYearFrom ? parseInt(editModelYearFrom) : undefined,
                year_to: editModelYearTo ? parseInt(editModelYearTo) : undefined,
              }
            }, {
              onSuccess: () => {
                setEditModel(null);
              }
            });
          }} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Model Name</label>
              <Input 
                required 
                placeholder="e.g. Activa 6G" 
                value={editModelName} 
                onChange={(e) => setEditModelName(e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Engine CC</label>
              <Input 
                type="number" 
                placeholder="e.g. 110" 
                value={editModelEngineCc} 
                onChange={(e) => setEditModelEngineCc(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Year From</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 2020" 
                  value={editModelYearFrom} 
                  onChange={(e) => setEditModelYearFrom(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Year To</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 2026" 
                  value={editModelYearTo} 
                  onChange={(e) => setEditModelYearTo(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setEditModel(null)}>Cancel</Button>
              <Button type="submit" disabled={updateModel.isPending}>
                {updateModel.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!modelToDeleteId}
        onOpenChange={(open) => !open && setModelToDeleteId(null)}
        title="Delete Model?"
        description="Delete this model? This cannot be undone. All associated data will be removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (modelToDeleteId) {
            deleteModel.mutate(modelToDeleteId, {
              onSuccess: () => {
                setModelToDeleteId(null);
              }
            });
          }
        }}
      />
    </div>
  );
}
