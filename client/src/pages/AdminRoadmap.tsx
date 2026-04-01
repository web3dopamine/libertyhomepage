import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminSideNav } from "@/components/AdminSideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, CheckCircle2, Zap, Circle, GripVertical, Map } from "lucide-react";
import type { RoadmapMilestone, InsertRoadmapMilestone } from "@shared/schema";

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "text-primary" },
  { value: "active", label: "In Progress", icon: Zap, color: "text-white" },
  { value: "upcoming", label: "Upcoming", icon: Circle, color: "text-muted-foreground" },
];

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-primary/20 text-primary border border-primary/30",
  active: "bg-white/10 text-white border border-white/30",
  upcoming: "bg-muted/30 text-muted-foreground border border-muted-foreground/20",
};

const EMPTY: InsertRoadmapMilestone = {
  quarter: "",
  title: "",
  description: "",
  status: "upcoming",
  order: 0,
};

function MilestoneForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: InsertRoadmapMilestone;
  onSave: (data: InsertRoadmapMilestone) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<InsertRoadmapMilestone>(initial);

  const set = (k: keyof InsertRoadmapMilestone, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Quarter / Period</Label>
          <Input
            placeholder="e.g. Q3 2026"
            value={form.quarter}
            onChange={(e) => set("quarter", e.target.value)}
            data-testid="input-milestone-quarter"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger data-testid="select-milestone-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Milestone Title</Label>
        <Input
          placeholder="e.g. Cross-Chain Bridge"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          data-testid="input-milestone-title"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="Brief description of what this milestone achieves..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          data-testid="input-milestone-description"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Display Order</Label>
        <Input
          type="number"
          min={1}
          value={form.order || ""}
          onChange={(e) => set("order", parseInt(e.target.value) || 0)}
          placeholder="e.g. 1"
          data-testid="input-milestone-order"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} data-testid="button-cancel-milestone">Cancel</Button>
        <Button
          onClick={() => onSave(form)}
          disabled={isPending || !form.quarter || !form.title}
          data-testid="button-save-milestone"
        >
          Save Milestone
        </Button>
      </div>
    </div>
  );
}

export default function AdminRoadmap() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapMilestone | null>(null);

  const { data: milestones = [], isLoading } = useQuery<RoadmapMilestone[]>({
    queryKey: ["/api/roadmap"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRoadmapMilestone) =>
      apiRequest("POST", "/api/roadmap", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
      setDialogOpen(false);
      toast({ title: "Milestone added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertRoadmapMilestone> }) =>
      apiRequest("PUT", `/api/roadmap/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
      setEditing(null);
      toast({ title: "Milestone updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/roadmap/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
      toast({ title: "Milestone deleted" });
    },
  });

  const handleSave = (data: InsertRoadmapMilestone) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (m: RoadmapMilestone) => { setEditing(m); setDialogOpen(true); };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const activeCount = milestones.filter((m) => m.status === "active").length;
  const upcomingCount = milestones.filter((m) => m.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-background">
      <AdminSideNav />
      <main className="pl-56 pt-8 pb-12 px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="w-6 h-6 text-primary" />
              Roadmap & Vision
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage milestones shown on the public roadmap slide
            </p>
          </div>
          <Button onClick={openAdd} data-testid="button-add-milestone">
            <Plus className="w-4 h-4 mr-1" />
            Add Milestone
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
          {[
            { label: "Completed", count: completedCount, color: "text-primary" },
            { label: "In Progress", count: activeCount, color: "text-white" },
            { label: "Upcoming", count: upcomingCount, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
            <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No milestones yet</p>
            <p className="text-sm mt-1">Click "Add Milestone" to define your roadmap.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {milestones.map((m) => {
              const statusOpt = STATUS_OPTIONS.find((s) => s.value === m.status);
              const Icon = statusOpt?.icon ?? Circle;
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 group"
                  data-testid={`roadmap-row-${m.id}`}
                >
                  {/* Order handle (visual only) */}
                  <div className="mt-1 text-muted-foreground/30 flex-none">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Status icon */}
                  <div className="mt-0.5 flex-none">
                    <Icon className={`w-5 h-5 ${statusOpt?.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{m.quarter}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[m.status]}`}>
                        {statusOpt?.label}
                      </span>
                      <span className="text-xs text-muted-foreground/50">#{m.order}</span>
                    </div>
                    <p className="font-semibold text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(m)}
                      data-testid={`button-edit-milestone-${m.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(m.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-milestone-${m.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogContent className="max-w-lg" data-testid="dialog-milestone">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Milestone" : "New Milestone"}</DialogTitle>
            </DialogHeader>
            <MilestoneForm
              initial={editing ? { quarter: editing.quarter, title: editing.title, description: editing.description, status: editing.status, order: editing.order } : EMPTY}
              onSave={handleSave}
              onCancel={() => { setDialogOpen(false); setEditing(null); }}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
