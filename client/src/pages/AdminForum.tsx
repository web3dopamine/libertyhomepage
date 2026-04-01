import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminGate } from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  MessageSquare, Plus, Pencil, Trash2, GripVertical, Users, Lock, Pin,
  BarChart2, ExternalLink, Settings, Eye, CheckCircle2, AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ForumCategory, ForumTopic } from "@shared/schema";

type CategoryWithCounts = ForumCategory & { topicCount: number; replyCount: number };
type TopicWithCategory = ForumTopic & { category?: ForumCategory };

const PRESET_COLORS = ["#2EB8B8", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#f97316"];

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ""; }
}

const EMPTY_CAT = { name: "", description: "", color: "#2EB8B8" };

export default function AdminForum() {
  const { toast } = useToast();
  const [catDialog, setCatDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryWithCounts | null>(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [tab, setTab] = useState<"categories" | "topics">("categories");

  const { data: categories = [] } = useQuery<CategoryWithCounts[]>({ queryKey: ["/api/forum/categories"] });
  const { data: topicsData } = useQuery<{ topics: TopicWithCategory[]; total: number }>({ queryKey: ["/api/forum/topics", { limit: 50 }], queryFn: async () => { const r = await fetch("/api/forum/topics?limit=50"); return r.json(); } });
  const { data: stats } = useQuery<{ topicCount: number; postCount: number; categoryCount: number; uniquePosters: number }>({ queryKey: ["/api/admin/forum/stats"] });

  const topics = topicsData?.topics ?? [];

  const saveCatMutation = useMutation({
    mutationFn: () => editingCat
      ? apiRequest("PUT", `/api/forum/categories/${editingCat.id}`, catForm)
      : apiRequest("POST", "/api/forum/categories", catForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      setCatDialog(false);
      toast({ title: editingCat ? "Category updated" : "Category created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/forum/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] }); toast({ title: "Category deleted" }); },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/forum/topics/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] }); toast({ title: "Topic deleted" }); },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => apiRequest("PUT", `/api/forum/topics/${id}`, { pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] }),
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, closed }: { id: string; closed: boolean }) => apiRequest("PUT", `/api/forum/topics/${id}`, { closed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] }),
  });

  function openNewCat() { setEditingCat(null); setCatForm(EMPTY_CAT); setCatDialog(true); }
  function openEditCat(cat: CategoryWithCounts) { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description, color: cat.color }); setCatDialog(true); }

  return (
    <AdminGate>
      <main className="pt-20 sm:pt-8 pb-12 px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forum Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage categories, topics, and community activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/forum" target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-view-forum">
                <ExternalLink className="w-3.5 h-3.5" />
                View Forum
              </Button>
            </Link>
            <Button onClick={openNewCat} className="gap-2" data-testid="button-new-category">
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Topics", value: stats?.topicCount ?? 0, icon: MessageSquare },
            { label: "Total Posts", value: stats?.postCount ?? 0, icon: Users },
            { label: "Categories", value: stats?.categoryCount ?? 0, icon: Settings },
            { label: "Unique Members", value: stats?.uniquePosters ?? 0, icon: Users },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {(["categories", "topics"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`} data-testid={`tab-${t}`}>{t}</button>
          ))}
        </div>

        {/* Categories Tab */}
        {tab === "categories" && (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4" data-testid={`row-cat-${cat.id}`}>
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{cat.name}</div>
                  {cat.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>}
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{cat.topicCount} topics</span>
                    <span>{cat.replyCount} replies</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEditCat(cat)} data-testid={`button-edit-cat-${cat.id}`}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteCatMutation.mutate(cat.id)} data-testid={`button-delete-cat-${cat.id}`}><Trash2 className="w-4 h-4" /></Button>
                  <Link href={`/forum/c/${cat.slug}`}>
                    <Button size="icon" variant="ghost" data-testid={`button-view-cat-${cat.id}`}><Eye className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-lg">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No categories yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Topics Tab */}
        {tab === "topics" && (
          <div className="space-y-2">
            {topics.map(topic => (
              <div key={topic.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3" data-testid={`row-topic-${topic.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {topic.pinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    {topic.closed && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    {topic.solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    <Link href={`/forum/t/${topic.id}/${topic.slug}`}>
                      <span className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1">{topic.title}</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>by {topic.authorName}</span>
                    {topic.category && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topic.category.color }} />
                        {topic.category.name}
                      </span>
                    )}
                    <span>{topic.replyCount} replies · {topic.viewCount} views</span>
                    <span>{timeAgo(topic.lastActivityAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" title={topic.pinned ? "Unpin" : "Pin"} onClick={() => pinMutation.mutate({ id: topic.id, pinned: !topic.pinned })} data-testid={`button-pin-${topic.id}`}>
                    <Pin className={`w-4 h-4 ${topic.pinned ? "text-primary" : ""}`} />
                  </Button>
                  <Button size="icon" variant="ghost" title={topic.closed ? "Reopen" : "Close"} onClick={() => closeMutation.mutate({ id: topic.id, closed: !topic.closed })} data-testid={`button-close-${topic.id}`}>
                    <Lock className={`w-4 h-4 ${topic.closed ? "text-amber-400" : ""}`} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteTopicMutation.mutate(topic.id)} data-testid={`button-delete-topic-${topic.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-lg">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No topics yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Category dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Developer Tools" data-testid="input-cat-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this category for?" className="resize-none min-h-[80px]" data-testid="input-cat-desc" />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: catForm.color }} />
                <Input type="color" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))} className="w-16 h-8 p-0.5 cursor-pointer" data-testid="input-cat-color" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setCatForm(f => ({ ...f, color: c }))} className={`w-6 h-6 rounded-full border-2 transition-all ${catForm.color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} data-testid={`preset-color-${c.slice(1)}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => saveCatMutation.mutate()} disabled={saveCatMutation.isPending || !catForm.name} data-testid="button-save-category">
                {saveCatMutation.isPending ? "Saving..." : editingCat ? "Save Changes" : "Create Category"}
              </Button>
              <Button variant="outline" onClick={() => setCatDialog(false)} data-testid="button-cancel-category">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGate>
  );
}
