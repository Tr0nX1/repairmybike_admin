'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, IndianRupee, Layers } from 'lucide-react';
import { useState } from 'react';
import { ServiceDataGrid } from '@/components/services/ServiceDataGrid';
import { PricingDataGrid } from '@/components/services/PricingDataGrid';
import { ServiceFormModal } from '@/components/services/ServiceFormModal';

export default function ServicesPage() {
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Service Catalog" 
        subtitle="Manage available core services and vehicle-specific labor rates"
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
              <Layers className="h-3.5 w-3.5" />
              Manage Categories
            </Button>
            <Button 
              className="h-9 text-xs gap-1.5 bg-[#378ADD] hover:bg-[#2D6FA3]"
              onClick={() => setServiceModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              {activeTab === 'catalog' ? 'Add Core Service' : 'Add Labor Rate'}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 h-10 p-1 bg-slate-100 rounded-lg">
          <TabsTrigger value="catalog" className="text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-2">
            <Wrench className="h-3 w-3" /> Core Services
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-2">
            <IndianRupee className="h-3 w-3" /> Labor Rates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          <ServiceDataGrid />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingDataGrid />
        </TabsContent>
      </Tabs>

      <ServiceFormModal 
        open={serviceModalOpen} 
        onOpenChange={setServiceModalOpen} 
      />
    </div>
  );
}
