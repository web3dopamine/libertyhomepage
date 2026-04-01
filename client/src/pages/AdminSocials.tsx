import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LogoImagePicker } from "@/components/LogoImagePicker";
import { Link } from "wouter";
import {
  Share2, Handshake, Newspaper, Plus, Pencil, Trash2, ArrowLeft, ExternalLink,
  RefreshCw, Image as ImageIcon, Check,
} from "lucide-react";
import { SOCIAL_ICON_MAP, SOCIAL_ICON_OPTIONS } from "@/lib/social-icons";
import type { SocialLink, Partner, PressArticle } from "@shared/schema";

function SocialIcon({ iconName, color }: { iconName: string; color?: string }) {
  const Icon = SOCIAL_ICON_MAP[iconName];
  if (!Icon) return <span className="text-xs text-muted-foreground">{iconName}</span>;
  return <Icon className="w-5 h-5" style={color ? { color } : undefined} />;
}

// ── Social Links Tab ──────────────────────────────────────────────────────────
function SocialsTab() {
  const { toast } = useToast();
  const { data: socials = [], isLoading } = useQuery<SocialLink[]>({ queryKey: ["/api/socials"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({
    name: "", url: "", icon: "SiX", color: "", handle: "", description: "", order: 0,
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", url: "", icon: "SiX", color: "", handle: "", description: "", order: socials.length + 1 });
    setDialogOpen(true);
  };
  const openEdit = (s: SocialLink) => {
    setEditing(s);
    setForm({ name: s.name, url: s.url, icon: s.icon, color: s.color, handle: s.handle, description: s.description, order: s.order });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return apiRequest("PUT", `/api/socials/${editing.id}`, form);
      }
      return apiRequest("POST", "/api/socials", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/socials"] });
      setDialogOpen(false);
      toast({ title: editing ? "Social link updated" : "Social link added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/socials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/socials"] });
      toast({ title: "Social link deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          These links appear in the footer, the Social Media page, and anywhere else across the site. Changes apply everywhere instantly.
        </p>
        <Button onClick={openAdd} data-testid="button-add-social">
          <Plus className="w-4 h-4 mr-2" /> Add Social
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
      ) : socials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No social links yet.</div>
      ) : (
        <div className="space-y-3">
          {socials.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-4" data-testid={`social-row-${s.id}`}>
              <div className="flex-shrink-0">
                <SocialIcon iconName={s.icon} color={s.color || undefined} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{s.name}</span>
                  {s.handle && <Badge variant="secondary" className="text-xs">{s.handle}</Badge>}
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5 truncate">
                  {s.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`button-edit-social-${s.id}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-social-${s.id}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="s-name">Name</Label>
                <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="X / Twitter" data-testid="input-social-name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-icon">Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger id="s-icon" data-testid="select-social-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_ICON_OPTIONS.map((opt) => {
                      const Icon = SOCIAL_ICON_MAP[opt.value];
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            {opt.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-url">URL</Label>
              <Input id="s-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://twitter.com/yourhandle" data-testid="input-social-url" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="s-handle">Handle</Label>
                <Input id="s-handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  placeholder="@yourhandle" data-testid="input-social-handle" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-color">Icon Colour (hex)</Label>
                <div className="flex items-center gap-2">
                  <Input id="s-color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="#5865F2 or blank" data-testid="input-social-color" />
                  {form.color && (
                    <div className="w-8 h-8 rounded-md border border-border flex-shrink-0" style={{ backgroundColor: form.color }} />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-desc">Description</Label>
              <Textarea id="s-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description shown on the Social Media page" rows={2} data-testid="input-social-description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-order">Display Order</Label>
              <Input id="s-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                data-testid="input-social-order" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.url}
              data-testid="button-save-social">
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Partners Tab ──────────────────────────────────────────────────────────────
function PartnersTab() {
  const { toast } = useToast();
  const { data: partners = [], isLoading } = useQuery<Partner[]>({ queryKey: ["/api/partners"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({ name: "", logoUrl: "", link: "", description: "", order: 0 });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", logoUrl: "", link: "", description: "", order: partners.length + 1 });
    setDialogOpen(true);
  };
  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({ name: p.name, logoUrl: p.logoUrl, link: p.link, description: p.description, order: p.order });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return apiRequest("PUT", `/api/partners/${editing.id}`, form);
      return apiRequest("POST", "/api/partners", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setDialogOpen(false);
      toast({ title: editing ? "Partner updated" : "Partner added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Partners are shown on the Partners slide of the homepage. Add logos and links for each partner organisation.
        </p>
        <Button onClick={openAdd} data-testid="button-add-partner">
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No partners yet. Add your first partner.</div>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-4" data-testid={`partner-row-${p.id}`}>
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className="h-8 w-16 object-contain flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-primary">{p.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm">{p.name}</span>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5 truncate">
                    {p.link} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
                {p.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`button-edit-partner-${p.id}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-partner-${p.id}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Partner" : "Add Partner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Partner Name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Corp" data-testid="input-partner-name" />
            </div>
            <LogoImagePicker
              label="Partner Logo"
              value={form.logoUrl}
              onChange={(url) => setForm({ ...form, logoUrl: url })}
              testIdPrefix="partner-logo"
            />
            <div className="space-y-1.5">
              <Label htmlFor="p-link">Website URL</Label>
              <Input id="p-link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://example.com" data-testid="input-partner-link" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of the partnership" rows={2} data-testid="input-partner-description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-order">Display Order</Label>
              <Input id="p-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                data-testid="input-partner-order" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}
              data-testid="button-save-partner">
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MediumItem {
  title: string;
  link: string;
  date: string;
  imageUrl: string;
  excerpt: string;
  publicationName: string;
  publicationLogo: string;
}

// ── Press Articles Tab ────────────────────────────────────────────────────────
function PressTab() {
  const { toast } = useToast();
  const { data: articles = [], isLoading } = useQuery<PressArticle[]>({ queryKey: ["/api/press"] });

  // Edit / create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PressArticle | null>(null);
  const [form, setForm] = useState({
    publicationName: "", publicationLogo: "", headline: "", excerpt: "",
    articleUrl: "", imageUrl: "", date: "", order: 0,
  });

  // Medium import dialog
  const [mediumOpen, setMediumOpen] = useState(false);
  const [mediumItems, setMediumItems] = useState<MediumItem[]>([]);
  const [mediumLoading, setMediumLoading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const existingUrls = new Set(articles.map((a) => a.articleUrl));

  const openAdd = () => {
    setEditing(null);
    setForm({ publicationName: "", publicationLogo: "", headline: "", excerpt: "", articleUrl: "", imageUrl: "", date: "", order: articles.length + 1 });
    setDialogOpen(true);
  };
  const openEdit = (a: PressArticle) => {
    setEditing(a);
    setForm({ publicationName: a.publicationName, publicationLogo: a.publicationLogo || "", headline: a.headline, excerpt: a.excerpt, articleUrl: a.articleUrl, imageUrl: (a as any).imageUrl || "", date: a.date, order: a.order });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return apiRequest("PUT", `/api/press/${editing.id}`, form);
      return apiRequest("POST", "/api/press", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/press"] });
      setDialogOpen(false);
      toast({ title: editing ? "Article updated" : "Article added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/press/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/press"] });
      toast({ title: "Article deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async (items: MediumItem[]) => {
      for (const item of items) {
        await apiRequest("POST", "/api/press", {
          publicationName: "Medium",
          publicationLogo: "",
          headline: item.title,
          excerpt: item.excerpt,
          articleUrl: item.link,
          imageUrl: item.imageUrl,
          date: item.date,
          order: articles.length + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/press"] });
      setMediumOpen(false);
      setSelectedUrls(new Set());
      toast({ title: "Articles imported from Medium" });
    },
    onError: () => toast({ title: "Import failed", variant: "destructive" }),
  });

  async function fetchMedium() {
    setMediumLoading(true);
    setMediumItems([]);
    try {
      const res = await fetch("/api/admin/medium-feed");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        toast({ title: "Could not fetch Medium feed", description: err.error, variant: "destructive" });
        return;
      }
      const data: MediumItem[] = await res.json();
      setMediumItems(data);
      // Pre-select posts not already imported
      setSelectedUrls(new Set(data.filter((d) => !existingUrls.has(d.link)).map((d) => d.link)));
    } catch (e: any) {
      toast({ title: "Failed to reach Medium", description: e.message, variant: "destructive" });
    } finally {
      setMediumLoading(false);
    }
  }

  function toggleMediumOpen() {
    setMediumOpen(true);
    fetchMedium();
  }

  function toggleSelect(url: string) {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  }

  function handleImport() {
    const toImport = mediumItems.filter((i) => selectedUrls.has(i.link));
    if (toImport.length === 0) return;
    importMutation.mutate(toImport);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Press articles appear on the "As Featured In" section on the homepage. Add coverage, reviews, and announcements.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleMediumOpen} data-testid="button-import-medium">
            <RefreshCw className="w-4 h-4 mr-2" />
            Import from Medium
          </Button>
          <Button onClick={openAdd} data-testid="button-add-press">
            <Plus className="w-4 h-4 mr-2" /> Add Article
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No press articles yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <Card key={a.id} className="overflow-hidden flex flex-col" data-testid={`press-row-${a.id}`}>
              {/* Thumbnail */}
              <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {(a as any).imageUrl ? (
                  <img
                    src={(a as any).imageUrl}
                    alt={a.headline}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Content */}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold">{a.publicationName}</Badge>
                  {a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}
                </div>
                <p className="font-semibold text-sm line-clamp-2 flex-1">"{a.headline}"</p>
                <div className="flex items-center justify-between pt-1">
                  {a.articleUrl && a.articleUrl !== "#" ? (
                    <a href={a.articleUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[160px]">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Read article</span>
                    </a>
                  ) : <span />}
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)} data-testid={`button-edit-press-${a.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-press-${a.id}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Press Article" : "Add Press Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pr-pub">Publication Name</Label>
                <Input id="pr-pub" value={form.publicationName} onChange={(e) => setForm({ ...form, publicationName: e.target.value })}
                  placeholder="CoinTelegraph" data-testid="input-press-publication" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-date">Date</Label>
                <Input id="pr-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  data-testid="input-press-date" />
              </div>
            </div>
            <LogoImagePicker
              label="Publication Logo (optional)"
              value={form.publicationLogo}
              onChange={(url) => setForm({ ...form, publicationLogo: url })}
              testIdPrefix="press-logo"
            />
            {/* Cover image */}
            <div className="space-y-1.5">
              <Label htmlFor="pr-image">Cover Image URL</Label>
              <Input id="pr-image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg" data-testid="input-press-image" />
              {form.imageUrl && (
                <div className="mt-2 rounded-md overflow-hidden h-28 bg-muted">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-headline">Headline</Label>
              <Textarea id="pr-headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Article headline as it appeared in the publication" rows={2} data-testid="input-press-headline" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-excerpt">Excerpt (optional)</Label>
              <Textarea id="pr-excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary or pull quote" rows={2} data-testid="input-press-excerpt" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-url">Article URL</Label>
              <Input id="pr-url" value={form.articleUrl} onChange={(e) => setForm({ ...form, articleUrl: e.target.value })}
                placeholder="https://medium.com/..." data-testid="input-press-url" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-order">Display Order</Label>
              <Input id="pr-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                data-testid="input-press-order" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.publicationName || !form.headline}
              data-testid="button-save-press">
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medium import dialog */}
      <Dialog open={mediumOpen} onOpenChange={(v) => { if (!v) { setMediumOpen(false); setMediumItems([]); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Import from libertychain.medium.com
            </DialogTitle>
          </DialogHeader>

          {mediumLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin" />
              <p className="text-sm">Fetching latest Medium posts…</p>
            </div>
          ) : mediumItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Newspaper className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No posts found</p>
              <p className="text-xs mt-1">The feed may be empty or temporarily unavailable.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchMedium}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedUrls.size} of {mediumItems.length} posts selected.
                {mediumItems.filter((i) => existingUrls.has(i.link)).length > 0 && (
                  <span className="ml-1 text-muted-foreground/60">(already-imported posts are shown but de-selected)</span>
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pb-2">
                {mediumItems.map((item) => {
                  const alreadyImported = existingUrls.has(item.link);
                  const selected = selectedUrls.has(item.link);
                  return (
                    <button
                      key={item.link}
                      onClick={() => !alreadyImported && toggleSelect(item.link)}
                      disabled={alreadyImported}
                      data-testid={`medium-item-${item.link}`}
                      className={`text-left rounded-lg border overflow-hidden transition-all ${
                        alreadyImported
                          ? "opacity-40 cursor-not-allowed border-border"
                          : selected
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover-elevate"
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-28 bg-muted overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                          </div>
                        )}
                        {selected && !alreadyImported && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                        {alreadyImported && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">Already imported</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold line-clamp-2 leading-snug">{item.title}</p>
                        {item.date && <p className="text-xs text-muted-foreground mt-1">{item.date}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => { setMediumOpen(false); setMediumItems([]); }}>Cancel</Button>
            <Button
              onClick={handleImport}
              disabled={selectedUrls.size === 0 || importMutation.isPending || mediumLoading}
              data-testid="button-confirm-medium-import"
            >
              {importMutation.isPending ? "Importing…" : `Import ${selectedUrls.size} Post${selectedUrls.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSocials() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Share2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2" data-testid="heading-admin-socials">
              Socials, Partners & Press
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage social media links, partner logos, and press coverage — all from one place.
            </p>
          </div>

          <Tabs defaultValue="socials">
            <TabsList className="mb-8">
              <TabsTrigger value="socials" data-testid="tab-socials">
                <Share2 className="w-4 h-4 mr-2" /> Social Links
              </TabsTrigger>
              <TabsTrigger value="partners" data-testid="tab-partners">
                <Handshake className="w-4 h-4 mr-2" /> Partners
              </TabsTrigger>
              <TabsTrigger value="press" data-testid="tab-press">
                <Newspaper className="w-4 h-4 mr-2" /> Press & Articles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="socials">
              <SocialsTab />
            </TabsContent>
            <TabsContent value="partners">
              <PartnersTab />
            </TabsContent>
            <TabsContent value="press">
              <PressTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
