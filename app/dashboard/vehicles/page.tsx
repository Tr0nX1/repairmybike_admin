'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useVehicles, VehicleType, VehicleBrand, VehicleModel } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, Bike, ChevronRight, Settings, Info, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function VehiclesPage() {
  const { useTypes, useBrands, useModels } = useVehicles();
  
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const { data: types, isLoading: loadingTypes } = useTypes();
  const { data: brands, isLoading: loadingBrands } = useBrands(selectedTypeId || undefined);
  const { data: models, isLoading: loadingModels } = useModels(selectedBrandId || undefined);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vehicle Catalog" 
        subtitle="Manage vehicle types, brands and models supported by the shop"
        actions={
          <Button className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]">
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
                <button className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
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
                <button className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
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
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500"><Trash2 className="h-3 w-3" /></Button>
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
                <button className="w-full p-4 flex items-center gap-2 text-[10px] font-bold uppercase text-[#378ADD] hover:bg-slate-50 transition-colors">
                  <Plus className="h-3 w-3" /> Add Model
                </button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
