'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Image as ImageIcon, 
  FileText, 
  HelpCircle, 
  Trash2, 
  ExternalLink,
  Loader2,
  Save,
  Eye
} from 'lucide-react';
import { useCMS, Banner } from '@/hooks/useCMS';
import { useContent, StaticPage } from '@/hooks/useContent';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function ContentManagementPage() {
  const { banners, isLoading: cmsLoading, updateBanner, deleteBanner } = useCMS();
  const { pages, isLoading: contentLoading, updatePage } = useContent();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Content Management" 
        subtitle="Control banners, static pages and public content"
      />

      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 border h-11 w-full justify-start gap-1">
          <TabsTrigger value="banners" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <ImageIcon className="h-3.5 w-3.5 mr-2" /> Banners
          </TabsTrigger>
          <TabsTrigger value="pages" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <FileText className="h-3.5 w-3.5 mr-2" /> Static Pages
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <HelpCircle className="h-3.5 w-3.5 mr-2" /> FAQs
          </TabsTrigger>
        </TabsList>

        {/* BANNERS TAB */}
        <TabsContent value="banners" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider">Active Banners</h3>
            <Button size="sm" className="h-8 text-[10px] font-bold uppercase bg-[#378ADD] gap-1.5">
              <Plus className="h-3 w-3" /> Add Banner
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cmsLoading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
               ))
            ) : banners.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground italic border-2 border-dashed rounded-xl">
                No banners found. Add your first promotional carousel.
              </div>
            ) : (
              banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden shadow-sm border-slate-200 group">
                  <div className="aspect-video relative bg-slate-100 overflow-hidden">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 left-2">
                       <Badge className={banner.is_active ? "bg-green-500" : "bg-slate-500"}>
                         {banner.is_active ? 'Active' : 'Inactive'}
                       </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                       <h4 className="text-xs font-bold">{banner.title}</h4>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase">Order: {banner.display_order}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1 font-bold uppercase">Edit</Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 text-red-500 hover:bg-red-50"
                        onClick={() => deleteBanner.mutate(banner.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* STATIC PAGES TAB */}
        <TabsContent value="pages" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              {pages.map((page) => (
                <Button 
                  key={page.key} 
                  variant="ghost" 
                  className="w-full justify-start text-xs font-bold uppercase tracking-tight h-10 border border-transparent hover:border-slate-200 px-3"
                >
                  {page.title}
                </Button>
              ))}
            </div>
            
            <div className="md:col-span-3">
              {pages.length > 0 ? (
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase">{pages[0].title}</CardTitle>
                      <CardDescription className="text-[10px]">Slug: {pages[0].key}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Active</span>
                         <Switch checked={pages[0].is_active} />
                       </div>
                       <Button size="sm" className="h-8 bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold uppercase tracking-widest gap-2">
                         <Save className="h-3 w-3" /> Save Changes
                       </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      className="min-h-[400px] text-xs font-mono leading-relaxed" 
                      defaultValue={pages[0].body}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="py-24 text-center text-xs text-muted-foreground border-2 border-dashed rounded-xl">
                  Select a page to edit or create a new one.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* FAQS TAB (MOCKED) */}
        <TabsContent value="faqs" className="mt-6">
          <Card className="border-dashed border-2 bg-slate-50/50">
             <CardContent className="py-24 flex flex-col items-center justify-center space-y-4">
                <HelpCircle className="h-12 w-12 text-slate-300" />
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">FAQ Builder coming soon</p>
                  <p className="text-[10px] text-slate-400 mt-1">For now, manage FAQs via the "faqs" static page.</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">Open FAQ Editor</Button>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
