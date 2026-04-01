import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminGate } from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Star, ExternalLink, Image, Link2, Upload,
  Newspaper, Video, Mic, FileText, MessageSquare, Megaphone, LayoutGrid, X,
  Bold, Italic, Heading2, List, ListOrdered, Code2, Link as LinkIcon,
  Image as ImageIcon2, Eye, PenLine, Quote,
} from "lucide-react";
import type { MediaItem, InsertMediaItem, MediaType } from "@shared/schema";
import { MEDIA_TYPES } from "@shared/schema";

function renderMarkdown(md: string): string {
  const html = marked.parse(md, { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
}

const TYPE_ICONS: Record<MediaType, typeof Newspaper> = {
  "Blog Post": FileText,
  "Video": Video,
  "Podcast": Mic,
  "Article": Newspaper,
  "Interview": MessageSquare,
  "Announcement": Megaphone,
};

const TYPE_COLORS: Record<MediaType, string> = {
  "Blog Post": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Video": "bg-red-500/10 text-red-400 border-red-500/20",
  "Podcast": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Article": "bg-green-500/10 text-green-400 border-green-500/20",
  "Interview": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Announcement": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const EMPTY_FORM: Omit<InsertMediaItem, "order"> = {
  type: "Blog Post",
  title: "",
  description: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  url: "",
  imageUrl: "",
  featured: false,
};

export default function AdminMediaHub() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<Omit<InsertMediaItem, "order">>(EMPTY_FORM);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [contentTab, setContentTab] = useState<"write" | "preview">("write");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { data: items = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/media-items"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<InsertMediaItem, "order">) =>
      apiRequest("POST", "/api/media-items", { ...data, order: items.length + 1 }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-items"] });
      toast({ title: "Media item created" });
      closeDialog();
    },
    onError: () => toast({ title: "Failed to create item", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMediaItem> }) =>
      apiRequest("PUT", `/api/media-items/${id}`, data).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-items"] });
      toast({ title: "Media item updated" });
      closeDialog();
    },
    onError: () => toast({ title: "Failed to update item", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/media-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-items"] });
      toast({ title: "Media item deleted" });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
  });

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.url }));
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Max 8 MB. JPEG, PNG, GIF, WebP, SVG.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setImageMode("url");
    setContentTab("write");
    setDialogOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditItem(item);
    setForm({
      type: item.type,
      title: item.title,
      description: item.description,
      content: item.content ?? "",
      date: item.date,
      url: item.url,
      imageUrl: item.imageUrl,
      featured: item.featured,
    });
    setImageMode(item.imageUrl?.startsWith("/uploads/") ? "upload" : "url");
    setContentTab("write");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
    setImageMode("url");
    setContentTab("write");
  }

  /** Insert markdown syntax around selection or at cursor */
  function insertMarkdown(prefix: string, suffix = "", placeholder = "") {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    const selected = value.slice(start, end) || placeholder;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newVal = `${before}${prefix}${selected}${suffix}${after}`;
    setForm((f) => ({ ...f, content: newVal }));
    // Restore cursor
    setTimeout(() => {
      ta.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const featured = items.filter((i) => i.featured);
  const all = items;

  return (
    <AdminGate>
      <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-primary" />
              Media Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage blog posts, videos, podcasts, and announcements shown on the public Media Hub page.
            </p>
          </div>
          <Button onClick={openCreate} data-testid="button-add-media-item">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: items.length },
            { label: "Featured", value: featured.length },
            { label: "Videos", value: items.filter((i) => i.type === "Video").length },
            { label: "Articles", value: items.filter((i) => i.type === "Article" || i.type === "Blog Post").length },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Items grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-64" />
            ))}
          </div>
        ) : all.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No media items yet</p>
              <p className="text-sm mt-1">Click "Add Item" to create your first media card.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {all.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? FileText;
              return (
                <Card key={item.id} className="overflow-hidden flex flex-col" data-testid={`media-card-${item.id}`}>
                  {/* Image */}
                  <div className="relative h-44 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Image className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    {item.featured && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {item.content && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                        <PenLine className="w-3 h-3" /> Full Post
                      </span>
                    )}
                    <span className={`absolute top-2 right-2 text-xs font-bold border px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type]}`}>
                      {item.type}
                    </span>
                  </div>

                  {/* Body */}
                  <CardContent className="p-4 flex flex-col flex-1 gap-3">
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{item.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                      <div className="flex items-center gap-1">
                        {item.url && item.url !== "#" && (
                          <Button size="icon" variant="ghost" asChild data-testid={`button-open-${item.id}`}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item)} data-testid={`button-edit-${item.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(item.id)} data-testid={`button-delete-${item.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Media Item" : "Add Media Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="media-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MediaType })}>
                <SelectTrigger id="media-type" data-testid="select-media-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="media-title">Title *</Label>
              <Input
                id="media-title"
                data-testid="input-media-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter a compelling title"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="media-description">Description / Subtitle</Label>
              <Textarea
                id="media-description"
                data-testid="input-media-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary shown on the media hub card"
                rows={2}
              />
            </div>

            {/* Full content Markdown editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Full Post Content (Markdown)</Label>
                <div className="flex items-center rounded-md border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setContentTab("write")}
                    data-testid="tab-content-write"
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      contentTab === "write"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <PenLine className="w-3 h-3" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    data-testid="tab-content-preview"
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      contentTab === "preview"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              </div>

              {/* Formatting toolbar */}
              {contentTab === "write" && (
                <div className="flex items-center gap-0.5 p-1 rounded-md border bg-muted/30 flex-wrap">
                  {[
                    { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
                    { icon: Italic, label: "Italic", prefix: "_", suffix: "_", placeholder: "italic text" },
                    { icon: Heading2, label: "Heading", prefix: "## ", suffix: "", placeholder: "Heading" },
                    { icon: Quote, label: "Quote", prefix: "> ", suffix: "", placeholder: "quote" },
                    { icon: List, label: "Bullet list", prefix: "- ", suffix: "", placeholder: "list item" },
                    { icon: ListOrdered, label: "Numbered list", prefix: "1. ", suffix: "", placeholder: "list item" },
                    { icon: Code2, label: "Code", prefix: "`", suffix: "`", placeholder: "code" },
                    { icon: LinkIcon, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
                    { icon: ImageIcon2, label: "Image", prefix: "![", suffix: "](image-url)", placeholder: "alt text" },
                  ].map(({ icon: Icon, label, prefix, suffix, placeholder }) => (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      onClick={() => insertMarkdown(prefix, suffix, placeholder)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}

              {contentTab === "write" ? (
                <Textarea
                  ref={contentRef}
                  data-testid="input-media-content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={`Write the full post in Markdown…\n\n## Introduction\n\nYour content here…`}
                  rows={16}
                  className="font-mono text-sm leading-relaxed resize-y"
                />
              ) : (
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-md border bg-card p-4">
                  {form.content ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none
                        prose-headings:font-bold prose-p:text-foreground/90
                        prose-a:text-primary prose-code:text-primary prose-code:bg-muted
                        prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                        prose-pre:bg-muted prose-blockquote:border-primary/40
                        prose-img:rounded-md prose-img:mx-auto"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
                      data-testid="content-preview"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Nothing to preview yet. Switch to Write and add some content.</p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Leave blank to use the external link instead of an internal reader page.
              </p>
            </div>

            {/* Cover image — URL or Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cover Image</Label>
                <div className="flex items-center rounded-md border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    data-testid="tab-image-url"
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      imageMode === "url"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link2 className="w-3 h-3" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    data-testid="tab-image-upload"
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      imageMode === "upload"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                </div>
              </div>

              {imageMode === "url" ? (
                <Input
                  id="media-image"
                  data-testid="input-media-image"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <div>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    data-testid="input-media-file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file);
                    }}
                  />
                  {/* Drop zone / click to upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) uploadFile(file);
                    }}
                    className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
                    data-testid="dropzone-media-image"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-6 h-6 animate-bounce" />
                        <p className="text-sm">Uploading…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-6 h-6 opacity-50" />
                        <p className="text-sm font-medium">Click or drag & drop an image</p>
                        <p className="text-xs">JPEG, PNG, GIF, WebP, SVG — max 8 MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview (shown in both modes when imageUrl is set) */}
              {form.imageUrl && (
                <div className="relative mt-1 rounded-md overflow-hidden h-32 bg-muted group">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-clear-image"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <Label htmlFor="media-url">Link URL</Label>
              <Input
                id="media-url"
                data-testid="input-media-url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://blog.libertychain.org/post/..."
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="media-date">Date</Label>
              <Input
                id="media-date"
                data-testid="input-media-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="media-featured"
                data-testid="switch-media-featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
              <Label htmlFor="media-featured">Mark as featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-media-item"
            >
              {editItem ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete media item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove this media card from the public page.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGate>
  );
}
