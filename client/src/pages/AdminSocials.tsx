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

// ── Press Articles Tab ────────────────────────────────────────────────────────
function PressTab() {
  const { toast } = useToast();
  const { data: articles = [], isLoading } = useQuery<PressArticle[]>({ queryKey: ["/api/press"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PressArticle | null>(null);
  const [form, setForm] = useState({
    publicationName: "", publicationLogo: "", headline: "", excerpt: "", articleUrl: "", date: "", order: 0,
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ publicationName: "", publicationLogo: "", headline: "", excerpt: "", articleUrl: "", date: "", order: articles.length + 1 });
    setDialogOpen(true);
  };
  const openEdit = (a: PressArticle) => {
    setEditing(a);
    setForm({ publicationName: a.publicationName, publicationLogo: a.publicationLogo, headline: a.headline, excerpt: a.excerpt, articleUrl: a.articleUrl, date: a.date, order: a.order });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Press articles appear on the "As Featured In" slide on the homepage. Add links to editorial coverage, reviews, and announcements.
        </p>
        <Button onClick={openAdd} data-testid="button-add-press">
          <Plus className="w-4 h-4 mr-2" /> Add Article
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No press articles yet.</div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Card key={a.id} className="p-4 flex items-start gap-4" data-testid={`press-row-${a.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className="text-xs font-bold">{a.publicationName}</Badge>
                  {a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}
                </div>
                <p className="font-semibold text-sm line-clamp-2 mb-1">"{a.headline}"</p>
                {a.articleUrl && a.articleUrl !== "#" && (
                  <a href={a.articleUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate">
                    {a.articleUrl} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(a)} data-testid={`button-edit-press-${a.id}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-press-${a.id}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Press Article" : "Add Press Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              label="Publication Logo (optional — name shown if blank)"
              value={form.publicationLogo}
              onChange={(url) => setForm({ ...form, publicationLogo: url })}
              testIdPrefix="press-logo"
            />
            <div className="space-y-1.5">
              <Label htmlFor="pr-headline">Headline</Label>
              <Textarea id="pr-headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Article headline as it appeared in the publication" rows={2} data-testid="input-press-headline" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-excerpt">Excerpt (optional)</Label>
              <Textarea id="pr-excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary or pull quote from the article" rows={2} data-testid="input-press-excerpt" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-url">Article URL</Label>
              <Input id="pr-url" value={form.articleUrl} onChange={(e) => setForm({ ...form, articleUrl: e.target.value })}
                placeholder="https://cointelegraph.com/news/..." data-testid="input-press-url" />
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
