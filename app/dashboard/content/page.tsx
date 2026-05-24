'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Image as ImageIcon, FileText, Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import { useCMS, Banner } from '@/hooks/useCMS';
import { useContent, StaticPage } from '@/hooks/useContent';
import { BannerFormModal } from '@/components/content/BannerFormModal';

export default function ContentManagementPage() {
  const { banners, isLoading: cmsLoading, deleteBanner } = useCMS();
  const { pages, isLoading: contentLoading, createPage, updatePage, deletePage } = useContent();

  const [bannerModal, setBannerModal] = useState<{
    open: boolean;
    data: Banner | null;
  }>({ open: false, data: null });

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);

  const filteredPages = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      return pages;
    }

    return pages.filter((page) =>
      page.key.toLowerCase().includes(query) || page.title.toLowerCase().includes(query)
    );
  }, [pages, search]);

  const resetForm = () => {
    setKey('');
    setTitle('');
    setBody('');
    setIsActive(true);
  };

  const openCreate = () => {
    setEditingPage(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (page: StaticPage) => {
    setEditingPage(page);
    setKey(page.key);
    setTitle(page.title);
    setBody(page.body);
    setIsActive(page.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const trimmedKey = key.trim();
    const trimmedTitle = title.trim();

    if (!trimmedKey || !trimmedTitle || !body.trim()) {
      return;
    }

    if (editingPage) {
      await updatePage.mutateAsync({
        key: trimmedKey,
        title: trimmedTitle,
        body,
        is_active: isActive,
      });
    } else {
      await createPage.mutateAsync({
        key: trimmedKey,
        title: trimmedTitle,
        body,
        is_active: isActive,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deletePage.mutateAsync(deleteTarget.key);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        subtitle="Control banners and managed static content for the storefront"
      />

      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 border h-11 w-full justify-start gap-1">
          <TabsTrigger value="banners" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <ImageIcon className="h-3.5 w-3.5 mr-2" /> Banners
          </TabsTrigger>
          <TabsTrigger value="static-content" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <FileText className="h-3.5 w-3.5 mr-2" /> Static Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider">Active Banners</h3>
            <Button size="sm" className="h-8 text-[10px] font-bold uppercase bg-[#378ADD] gap-1.5" onClick={() => setBannerModal({ open: true, data: null })}>
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
                      <Badge className={banner.is_active ? 'bg-green-500' : 'bg-slate-500'}>
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
                      <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1 font-bold uppercase" onClick={() => setBannerModal({ open: true, data: banner })}>Edit</Button>
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

        <TabsContent value="static-content" className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Managed Static Content</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Create, edit, and remove reusable public content entries.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by key or title"
                  className="pl-9 h-9 text-xs w-full sm:w-64"
                />
              </div>
              <Button onClick={openCreate} className="h-9 text-[10px] font-bold uppercase bg-[#378ADD] gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Static Content
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {contentLoading ? (
              <div className="rounded-xl border border-dashed bg-white p-12 text-center text-xs text-muted-foreground">
                Loading static content…
              </div>
            ) : filteredPages.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="py-12 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No static content found</p>
                  <p className="text-[10px] text-slate-400 mt-2">Create your first entry to manage page content.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPages.map((page) => (
                <Card key={page.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{page.key}</span>
                          <Badge variant={page.is_active ? 'default' : 'secondary'} className={page.is_active ? 'bg-green-600' : ''}>
                            {page.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{page.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-3">{page.body}</p>
                        <p className="text-[10px] text-muted-foreground">Updated {new Date(page.updated_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase gap-1.5" onClick={() => openEdit(page)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 text-[10px] font-bold uppercase gap-1.5 text-red-600"
                          onClick={() => setDeleteTarget(page)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Static Content' : 'Create Static Content'}</DialogTitle>
            <DialogDescription>
              {editingPage
                ? 'Update the visible content and activity state for this entry.'
                : 'Create a reusable content block keyed by an identifier.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key</label>
              {editingPage ? (
                <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">{key}</div>
              ) : (
                <Input
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                  placeholder="privacy_policy"
                  className="h-10 text-xs"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Privacy Policy"
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Body</label>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Paste or write the full body content here..."
                className="min-h-[220px] text-xs"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4 bg-slate-50">
              <div>
                <p className="text-xs font-bold">Active</p>
                <p className="text-[10px] text-muted-foreground">Toggle visibility for public consumers.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs font-bold uppercase">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPage.isPending || updatePage.isPending}
              className="text-xs font-bold uppercase bg-[#378ADD]"
            >
              {(createPage.isPending || updatePage.isPending) && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {editingPage ? 'Save Changes' : 'Create Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Static Content?"
        description={`This will remove ${deleteTarget?.title || 'this content'} from the public content registry.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />

      <BannerFormModal
        open={bannerModal.open}
        banner={bannerModal.data}
        onClose={() => setBannerModal({ open: false, data: null })}
      />
    </div>
  );
}
