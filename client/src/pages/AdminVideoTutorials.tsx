import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, GripVertical, PlayCircle, ExternalLink,
  Star, Youtube, Film, Image as ImageIcon, X,
} from "lucide-react";
import type { VideoTutorial, InsertVideoTutorial } from "@shared/schema";

// ── Video URL helpers ──────────────────────────────────────────────────────
function parseVideo(url: string): { type: "youtube" | "vimeo" | null; id: string | null } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: "youtube", id: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", id: vm[1] };
  return { type: null, id: null };
}

function autoThumbnail(url: string): string {
  const { type, id } = parseVideo(url);
  if (type === "youtube" && id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return "";
}

function embedUrl(url: string): string | null {
  const { type, id } = parseVideo(url);
  if (type === "youtube" && id) return `https://www.youtube.com/embed/${id}`;
  if (type === "vimeo" && id) return `https://player.vimeo.com/video/${id}`;
  return null;
}

function VideoTypeBadge({ url }: { url: string }) {
  const { type } = parseVideo(url);
  if (type === "youtube") return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-0.5">
      <Youtube className="w-2.5 h-2.5" />YT
    </span>
  );
  if (type === "vimeo") return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-0.5">
      <Film className="w-2.5 h-2.5" />Vimeo
    </span>
  );
  return null;
}

// ── Form blank ─────────────────────────────────────────────────────────────
const BLANK: InsertVideoTutorial = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "",
  duration: "",
  order: 0,
  featured: false,
};

export default function AdminVideoTutorials() {
  const { toast } = useToast();

  // ── Data ────────────────────────────────────────────────────────────────
  const { data: tutorials = [], isLoading } = useQuery<VideoTutorial[]>({
    queryKey: ["/api/video-tutorials"],
  });

  const [localList, setLocalList] = useState<VideoTutorial[]>([]);
  const prevIds = useRef<string>("");

  useEffect(() => {
    const ids = tutorials.map(t => t.id).join(",");
    if (ids === prevIds.current) return;
    prevIds.current = ids;
    setLocalList(tutorials);
  }, [tutorials]);

  // ── Dialog state ────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VideoTutorial | null>(null);
  const [form, setForm] = useState<InsertVideoTutorial>({ ...BLANK });

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK });
    setDialogOpen(true);
  }

  function openEdit(t: VideoTutorial) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description,
      videoUrl: t.videoUrl,
      thumbnailUrl: t.thumbnailUrl,
      category: t.category,
      duration: t.duration,
      order: t.order,
      featured: t.featured,
    });
    setDialogOpen(true);
  }

  const detectedThumb = autoThumbnail(form.videoUrl);
  const previewThumb = form.thumbnailUrl || detectedThumb;
  const { type: vidType } = parseVideo(form.videoUrl);

  // ── CRUD mutations ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: InsertVideoTutorial) =>
      apiRequest("POST", "/api/video-tutorials", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-tutorials"] });
      setDialogOpen(false);
      toast({ title: "Tutorial added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVideoTutorial> }) =>
      apiRequest("PUT", `/api/video-tutorials/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-tutorials"] });
      setDialogOpen(false);
      toast({ title: "Tutorial updated" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/video-tutorials/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-tutorials"] });
      toast({ title: "Tutorial deleted" });
    },
  });

  function handleSubmit() {
    if (!form.title.trim()) return toast({ title: "Title is required", variant: "destructive" });
    if (!form.videoUrl.trim()) return toast({ title: "Video URL is required", variant: "destructive" });
    if (!vidType) return toast({ title: "Enter a valid YouTube or Vimeo URL", variant: "destructive" });
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  // ── Drag-to-reorder ─────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function onDragStart(i: number) {
    return (e: React.DragEvent) => {
      dragIdx.current = i;
      e.dataTransfer.effectAllowed = "move";
    };
  }
  function onDragOver(i: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(i);
    };
  }
  function onDrop() {
    const from = dragIdx.current;
    const to = dragOver;
    if (from === null || to === null || from === to) { setDragOver(null); return; }
    const next = [...localList];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const reordered = next.map((t, idx) => ({ ...t, order: idx + 1 }));
    setLocalList(reordered);
    setDragOver(null);
    dragIdx.current = null;

    setSaving(true);
    apiRequest("PUT", "/api/video-tutorials", reordered.map(t => ({ id: t.id, order: t.order })))
      .then(() => { setSaving(false); queryClient.invalidateQueries({ queryKey: ["/api/video-tutorials"] }); })
      .catch(() => setSaving(false));
  }
  function onDragEnd() { setDragOver(null); dragIdx.current = null; }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 sm:pt-8 pb-12 px-4 sm:px-8">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-primary" />
              Video Tutorials
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage YouTube and Vimeo tutorial videos — drag to reorder
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving order…</span>}
            <Button onClick={openAdd} data-testid="button-add-video">
              <Plus className="w-4 h-4 mr-1" />
              Add Video
            </Button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
          {[
            { label: "Total Videos", count: localList.length, color: "text-primary" },
            { label: "Featured", count: localList.filter(t => t.featured).length, color: "text-yellow-400" },
            { label: "Categories", count: [...new Set(localList.map(t => t.category).filter(Boolean))].length, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── List ───────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : localList.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
            <PlayCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No videos yet</p>
            <p className="text-sm mt-1">Click "Add Video" to add your first tutorial.</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl" data-testid="video-list">
            {localList.map((t, i) => {
              const thumb = t.thumbnailUrl || autoThumbnail(t.videoUrl);
              const isOver = dragOver === i;

              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOver(i)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  className={[
                    "flex items-center gap-3 rounded-xl border bg-card p-3 group transition-all duration-150",
                    isOver
                      ? "border-primary/50 shadow-[0_0_0_2px_rgba(46,184,184,0.2)] scale-[1.01]"
                      : "border-border",
                  ].join(" ")}
                  data-testid={`video-row-${t.id}`}
                >
                  {/* Grip */}
                  <div
                    className="flex-none text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Position */}
                  <div className="flex-none w-5 text-center text-xs font-bold text-muted-foreground/40 tabular-nums">
                    {i + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-none w-20 h-12 rounded-lg overflow-hidden bg-muted border border-border/50">
                    {thumb ? (
                      <img src={thumb} alt={t.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <VideoTypeBadge url={t.videoUrl} />
                      {t.category && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {t.category}
                        </span>
                      )}
                      {t.featured && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      )}
                      {t.duration && (
                        <span className="text-[10px] text-muted-foreground">{t.duration}</span>
                      )}
                    </div>
                    <p className="font-semibold text-sm leading-snug">{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                    >
                      <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" title="Open video">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(t)}
                      data-testid={`button-edit-video-${t.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(t.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-video-${t.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Add / Edit Dialog ───────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tutorial" : "Add Tutorial"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                placeholder="Getting Started with Liberty Chain"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-video-title"
              />
            </div>

            {/* Video URL */}
            <div>
              <Label>Video URL * <span className="text-muted-foreground text-xs font-normal">(YouTube or Vimeo)</span></Label>
              <Input
                className="mt-1"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={form.videoUrl}
                onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                data-testid="input-video-url"
              />
              {form.videoUrl && !vidType && (
                <p className="text-xs text-destructive mt-1">Please enter a valid YouTube or Vimeo URL</p>
              )}
              {vidType && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  {vidType === "youtube" ? <Youtube className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  {vidType === "youtube" ? "YouTube" : "Vimeo"} video detected
                </p>
              )}
            </div>

            {/* Thumbnail preview */}
            <div>
              <Label className="flex items-center gap-2">
                Thumbnail
                <span className="text-muted-foreground text-xs font-normal">
                  {detectedThumb && !form.thumbnailUrl ? "(auto-detected from YouTube)" : "(custom URL optional)"}
                </span>
              </Label>
              {previewThumb ? (
                <div className="mt-1 relative rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                  <img src={previewThumb} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  {form.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, thumbnailUrl: "" }))}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <div className="absolute bottom-2 left-2">
                    {form.thumbnailUrl
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">Custom thumbnail</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">Auto thumbnail</span>
                    }
                  </div>
                </div>
              ) : (
                <div className="mt-1 rounded-lg border border-dashed border-border aspect-video bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <Input
                className="mt-2"
                placeholder="https://example.com/thumbnail.jpg (leave blank for auto)"
                value={form.thumbnailUrl}
                onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                data-testid="input-video-thumbnail"
              />
            </div>

            {/* Category + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input
                  className="mt-1"
                  placeholder="Getting Started"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  data-testid="input-video-category"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  className="mt-1"
                  placeholder="12:34"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  data-testid="input-video-duration"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={3}
                placeholder="Brief description of what this video covers…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                data-testid="input-video-description"
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${form.featured ? "bg-yellow-500 justify-end" : "bg-muted-foreground/30 justify-start"}`}
                data-testid="toggle-video-featured"
              >
                <span className="w-4 h-4 rounded-full bg-white shadow mx-0.5 block" />
              </button>
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  Featured
                </p>
                <p className="text-xs text-muted-foreground">Highlight this video at the top of the page</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isMutating} data-testid="button-save-video">
                {isMutating ? "Saving…" : editing ? "Save Changes" : "Add Tutorial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
