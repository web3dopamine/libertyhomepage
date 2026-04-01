import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Rocket,
  Trash2,
  ChevronLeft,
  Mail,
  Globe,
  Twitter,
  Github,
  Users,
  Tag,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { AcceleratorApplication, AcceleratorStage } from "@shared/schema";

const PIPELINE_STAGES: { id: AcceleratorStage; label: string; color: string }[] = [
  { id: "applied",   label: "Applied",   color: "bg-muted text-muted-foreground" },
  { id: "review",    label: "In Review", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "interview", label: "Interview", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { id: "accepted",  label: "Accepted",  color: "bg-primary/10 text-primary border-primary/20" },
  { id: "rejected",  label: "Rejected",  color: "bg-destructive/10 text-destructive border-destructive/20" },
];

function StageBadge({ stage }: { stage: AcceleratorStage }) {
  const s = PIPELINE_STAGES.find((p) => p.id === stage);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s?.color}`}>
      {s?.label ?? stage}
    </span>
  );
}

function AppCard({
  app,
  onOpen,
  onDelete,
  onStage,
}: {
  app: AcceleratorApplication;
  onOpen: () => void;
  onDelete: () => void;
  onStage: (stage: AcceleratorStage) => void;
}) {
  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === app.pipelineStage);
  const next = PIPELINE_STAGES[stageIndex + 1];
  const canAdvance = next && next.id !== "rejected";

  return (
    <Card className="p-5 flex flex-col gap-3 hover-elevate cursor-pointer" onClick={onOpen} data-testid={`card-app-${app.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold truncate">{app.projectName}</p>
          <p className="text-xs text-muted-foreground truncate">{app.name} · {app.email}</p>
        </div>
        <StageBadge stage={app.pipelineStage} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {app.category && (
          <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{app.category}</span>
        )}
        {app.teamSize && (
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{app.teamSize}</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {app.description}
      </p>

      <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-muted-foreground">
          {format(new Date(app.appliedAt), "MMM d, yyyy")}
        </span>
        <div className="flex items-center gap-1.5">
          {canAdvance && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              onClick={() => onStage(next.id)}
              data-testid={`button-advance-${app.id}`}
            >
              Move to {next.label}
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {app.pipelineStage !== "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => onStage("rejected")}
              data-testid={`button-reject-${app.id}`}
            >
              Reject
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onDelete()}
            data-testid={`button-delete-${app.id}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AppDetailDialog({ app, open, onClose, onStage }: {
  app: AcceleratorApplication | null;
  open: boolean;
  onClose: () => void;
  onStage: (id: string, stage: AcceleratorStage) => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">{app.projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex flex-wrap gap-2">
            <StageBadge stage={app.pipelineStage} />
            {app.category && <Badge variant="secondary">{app.category}</Badge>}
            {app.projectStage && <Badge variant="secondary">{app.projectStage}</Badge>}
            {app.teamSize && <Badge variant="secondary">{app.teamSize} people</Badge>}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact</p>
            <p className="font-semibold">{app.name}</p>
            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Mail className="w-3.5 h-3.5" />{app.email}
            </a>
          </div>

          {(app.website || app.twitter || app.github) && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Links</p>
              {app.website && (
                <a href={app.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="w-3.5 h-3.5" />{app.website}
                </a>
              )}
              {app.twitter && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Twitter className="w-3.5 h-3.5" />{app.twitter}
                </p>
              )}
              {app.github && (
                <a href={app.github.startsWith("http") ? app.github : `https://${app.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-3.5 h-3.5" />{app.github}
                </a>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{app.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How Can We Help</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{app.howCanWeHelp}</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-3">Move pipeline stage:</p>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={app.pipelineStage === s.id ? "default" : "outline"}
                  disabled={app.pipelineStage === s.id}
                  onClick={() => onStage(app.id, s.id)}
                  data-testid={`button-stage-${s.id}`}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Applied {format(new Date(app.appliedAt), "MMMM d, yyyy 'at' HH:mm")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAccelerator() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<AcceleratorApplication | null>(null);

  const { data: apps = [], isLoading } = useQuery<AcceleratorApplication[]>({
    queryKey: ["/api/accelerator"],
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: AcceleratorStage }) =>
      apiRequest("PATCH", `/api/accelerator/${id}/stage`, { stage }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/accelerator"] });
      if (detailApp?.id === vars.id) {
        setDetailApp((prev) => prev ? { ...prev, pipelineStage: vars.stage } : null);
      }
      toast({ title: "Stage updated" });
    },
    onError: () => toast({ title: "Error", description: "Could not update stage.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/accelerator/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accelerator"] });
      setDeleteId(null);
      if (detailApp?.id === deleteId) setDetailApp(null);
      toast({ title: "Application deleted" });
    },
    onError: () => toast({ title: "Error", description: "Could not delete application.", variant: "destructive" }),
  });

  const byStage = PIPELINE_STAGES.map((s) => ({
    ...s,
    apps: apps.filter((a) => a.pipelineStage === s.id),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" asChild>
              <Link href="/admin">
                <ChevronLeft className="w-4 h-4" />
                Admin
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Accelerator</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-admin-accelerator">
                Accelerator Pipeline
              </h1>
              <p className="text-muted-foreground mt-2">
                {apps.length} application{apps.length !== 1 ? "s" : ""} total — drag cards or use buttons to move through stages.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <a href="/accelerator/apply" target="_blank" rel="noopener noreferrer" data-testid="link-view-form">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Form
              </a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {PIPELINE_STAGES.map((s) => {
              const count = apps.filter((a) => a.pipelineStage === s.id).length;
              return (
                <Card key={s.id} className="p-4 text-center">
                  <div className="text-2xl font-black text-primary">{count}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </Card>
              );
            })}
          </div>

          {/* Pipeline columns */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading applications...</div>
          ) : apps.length === 0 ? (
            <Card className="p-16 text-center">
              <Rocket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-semibold">No applications yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Applications submitted via the public form will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {byStage.map((col) => (
                <div key={col.id} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {col.label}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {col.apps.length}
                    </span>
                  </div>
                  {col.apps.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-xs text-muted-foreground/50">Empty</p>
                    </div>
                  ) : (
                    col.apps.map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        onOpen={() => setDetailApp(app)}
                        onDelete={() => setDeleteId(app.id)}
                        onStage={(stage) => stageMutation.mutate({ id: app.id, stage })}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail dialog */}
      <AppDetailDialog
        app={detailApp}
        open={!!detailApp}
        onClose={() => setDetailApp(null)}
        onStage={(id, stage) => stageMutation.mutate({ id, stage })}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
