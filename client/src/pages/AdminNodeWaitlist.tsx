import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Server,
  Users,
  Globe,
  Calendar,
  ChevronLeft,
  Download,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Twitter,
  MessageSquare,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { NodeApplication } from "@shared/schema";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, className: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  approved: { label: "Approved", icon: CheckCircle2, className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-400 border-red-400/30 bg-red-400/10" },
};

export default function AdminNodeWaitlist() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewApp, setViewApp] = useState<NodeApplication | null>(null);
  const [notesInput, setNotesInput] = useState("");

  const { data: entries = [], isLoading } = useQuery<NodeApplication[]>({
    queryKey: ["/api/node-applications"],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: NodeApplication["status"]; notes?: string }) =>
      apiRequest("PATCH", `/api/node-applications/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/node-applications"] });
      toast({ title: "Status updated" });
      if (viewApp) {
        const updated = entries.find((e) => e.id === viewApp.id);
        if (updated) setViewApp(updated);
      }
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/node-applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/node-applications"] });
      setDeleteId(null);
      setViewApp(null);
      toast({ title: "Application removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function exportCSV() {
    const headers = ["Name", "Email", "Country", "Node Type", "Hardware", "Bandwidth", "Experience", "Storage (GB)", "RAM (GB)", "Uptime %", "Twitter", "Telegram", "Discord", "Motivation", "Status", "Applied"];
    const rows = entries.map((e) => [
      `"${e.name}"`, `"${e.email}"`, `"${e.country}"`,
      `"${e.nodeType}"`, `"${e.hardware}"`, `"${e.bandwidth}"`, `"${e.experience}"`,
      `"${e.storageGb}"`, `"${e.ramGb}"`, `"${e.uptime}"`,
      `"${e.twitter}"`, `"${e.telegram}"`, `"${e.discord}"`,
      `"${(e.motivation || "").replace(/"/g, '""')}"`,
      `"${e.status}"`, `"${format(new Date(e.appliedAt), "yyyy-MM-dd HH:mm")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liberty-chain-node-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.country.toLowerCase().includes(search.toLowerCase()) ||
      e.nodeType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
    countries: new Set(entries.map((e) => e.country).filter(Boolean)).size,
  };

  const topNodeType = Object.entries(
    entries.reduce<Record<string, number>>((acc, e) => {
      const k = e.nodeType || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  function handleStatusChange(app: NodeApplication, status: NodeApplication["status"]) {
    statusMutation.mutate({ id: app.id, status, notes: notesInput.trim() || app.notes });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-admin-back">
                <ChevronLeft className="w-4 h-4" />Admin
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Node Runners</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-node-waitlist">
                Node Runner Waitlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Review, approve, and manage applications to run Liberty Chain nodes.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href="/run-a-node">
                  <Server className="w-4 h-4 mr-2" />
                  View Form
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={exportCSV}
                disabled={entries.length === 0}
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">{counts.total}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Total
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black text-amber-400">{counts.pending}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black text-emerald-400">{counts.approved}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black text-red-400">{counts.rejected}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Rejected
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">{counts.countries}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Countries
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search name, email, country, node type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="select-status-filter">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading applications...</div>
          ) : entries.length === 0 ? (
            <Card className="p-16 text-center">
              <Server className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-semibold">No applications yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Applications submitted at <strong>/run-a-node</strong> will appear here.
              </p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No applications match your filters.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="text-left p-4 font-semibold">Applicant</th>
                      <th className="text-left p-4 font-semibold">Node Type</th>
                      <th className="text-left p-4 font-semibold">Hardware</th>
                      <th className="text-left p-4 font-semibold">Bandwidth</th>
                      <th className="text-left p-4 font-semibold">Experience</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Applied</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app, i) => {
                      const statusCfg = STATUS_CONFIG[app.status];
                      return (
                        <tr
                          key={app.id}
                          className={`border-b border-border/50 hover:bg-card/40 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                          data-testid={`row-node-app-${app.id}`}
                        >
                          <td className="p-4">
                            <p className="font-semibold whitespace-nowrap">{app.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />{app.email}
                            </p>
                            {app.country && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3" />{app.country}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs whitespace-nowrap text-primary border-primary/30">
                              {app.nodeType}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{app.hardware}</td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{app.bandwidth}</td>
                          <td className="p-4 text-xs text-muted-foreground max-w-[140px] truncate">{app.experience}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-xs whitespace-nowrap gap-1 ${statusCfg.className}`}>
                              <statusCfg.icon className="w-3 h-3" />
                              {statusCfg.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(app.appliedAt), "MMM d, yyyy")}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => { setViewApp(app); setNotesInput(app.notes || ""); }}
                                data-testid={`button-view-${app.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteId(app.id)}
                                data-testid={`button-delete-${app.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Detail dialog */}
      <Dialog open={!!viewApp} onOpenChange={(open) => { if (!open) setViewApp(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined} data-testid="dialog-app-detail">
          {viewApp && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black">{viewApp.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{viewApp.email} · Applied {format(new Date(viewApp.appliedAt), "MMMM d, yyyy")}</p>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Status actions */}
                <div className="flex flex-wrap gap-2">
                  {(["pending", "approved", "rejected"] as const).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant={viewApp.status === s ? "default" : "outline"}
                        onClick={() => handleStatusChange(viewApp, s)}
                        disabled={statusMutation.isPending}
                        data-testid={`button-status-${s}`}
                      >
                        <cfg.icon className="w-3.5 h-3.5 mr-1.5" />
                        {cfg.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Tech specs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/40 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5"><Server className="w-3.5 h-3.5" />Node Type</p>
                    <p className="text-sm font-medium">{viewApp.nodeType}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />Hardware</p>
                    <p className="text-sm font-medium">{viewApp.hardware}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" />Bandwidth</p>
                    <p className="text-sm font-medium">{viewApp.bandwidth}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />Experience</p>
                    <p className="text-sm font-medium">{viewApp.experience}</p>
                  </div>
                  {(viewApp.storageGb || viewApp.ramGb) && (
                    <div className="rounded-lg bg-muted/40 border border-border p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />Resources</p>
                      <p className="text-sm font-medium">
                        {viewApp.storageGb ? `${viewApp.storageGb} GB storage` : ""}
                        {viewApp.storageGb && viewApp.ramGb ? " · " : ""}
                        {viewApp.ramGb ? `${viewApp.ramGb} GB RAM` : ""}
                      </p>
                    </div>
                  )}
                  {viewApp.uptime && (
                    <div className="rounded-lg bg-muted/40 border border-border p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Uptime Commitment</p>
                      <p className="text-sm font-medium">{viewApp.uptime}%</p>
                    </div>
                  )}
                </div>

                {/* Social */}
                {(viewApp.twitter || viewApp.telegram || viewApp.discord) && (
                  <div className="flex flex-wrap gap-3">
                    {viewApp.twitter && (
                      <a href={`https://twitter.com/${viewApp.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="w-4 h-4" /> {viewApp.twitter}
                      </a>
                    )}
                    {viewApp.telegram && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" /> {viewApp.telegram}
                      </span>
                    )}
                    {viewApp.discord && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" /> {viewApp.discord}
                      </span>
                    )}
                  </div>
                )}

                {/* Motivation */}
                {viewApp.motivation && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Motivation</p>
                    <div className="rounded-lg bg-muted/40 border border-border p-3 text-sm text-muted-foreground">
                      {viewApp.motivation}
                    </div>
                  </div>
                )}

                {/* Admin notes */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Admin Notes</p>
                  <Textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add internal notes about this applicant..."
                    className="text-sm resize-none"
                    rows={3}
                    data-testid="textarea-admin-notes"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-wrap gap-2 justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(viewApp.id)}
                  data-testid="button-delete-from-detail"
                >
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => statusMutation.mutate({ id: viewApp.id, status: viewApp.status, notes: notesInput.trim() })}
                  disabled={statusMutation.isPending}
                  data-testid="button-save-notes"
                >
                  Save Notes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this node runner application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
