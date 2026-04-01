import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Users,
  Mail,
  Globe,
  Cpu,
  Trash2,
  Download,
  Search,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { WaitlistEntry } from "@shared/schema";

export default function AdminWaitlist() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/waitlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDeleteId(null);
      toast({ title: "Entry removed", description: "The waitlist entry has been deleted." });
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to remove entry.", variant: "destructive" }),
  });

  function exportCSV() {
    const headers = ["Name", "Email", "Country", "Intended Use", "Message", "Signed Up"];
    const rows = entries.map((e) => [
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.country}"`,
      `"${e.intendedUse}"`,
      `"${e.message.replace(/"/g, '""')}"`,
      `"${format(new Date(e.signedUpAt), "yyyy-MM-dd HH:mm")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liberty-mesh-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.country.toLowerCase().includes(search.toLowerCase()) ||
      e.intendedUse.toLowerCase().includes(search.toLowerCase())
  );

  const byUse = entries.reduce<Record<string, number>>((acc, e) => {
    const key = e.intendedUse || "Not specified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topUse = Object.entries(byUse).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-admin-back">
                <ChevronLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Waitlist</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-admin-waitlist">
                Mesh Device Waitlist
              </h1>
              <p className="text-muted-foreground mt-2">
                All signups for Liberty Mesh Devices — export, search, and manage below.
              </p>
            </div>
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

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">{entries.length}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Total Signups
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">
                {new Set(entries.map((e) => e.country).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Countries
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">
                {entries.filter((e) => {
                  const d = new Date(e.signedUpAt);
                  const now = new Date();
                  return (
                    d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate()
                  );
                }).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Today
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-sm font-black gradient-text truncate px-1">
                {topUse ? topUse[0] : "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Top Use Case
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, country, or use case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-waitlist"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading waitlist...</div>
          ) : entries.length === 0 ? (
            <Card className="p-16 text-center">
              <Cpu className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-semibold">No signups yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Signups from the Resilience Layer page will appear here.
              </p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No entries match your search.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Country</th>
                      <th className="text-left p-4 font-semibold">Intended Use</th>
                      <th className="text-left p-4 font-semibold">Message</th>
                      <th className="text-left p-4 font-semibold">Signed Up</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => (
                      <tr
                        key={entry.id}
                        className={`border-b border-border/50 hover:bg-card/40 transition-colors ${
                          i === filtered.length - 1 ? "border-0" : ""
                        }`}
                        data-testid={`waitlist-row-${entry.id}`}
                      >
                        <td className="p-4 font-semibold whitespace-nowrap">{entry.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <a
                              href={`mailto:${entry.email}`}
                              className="hover:text-primary transition-colors"
                            >
                              {entry.email}
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {entry.country || <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="p-4">
                          {entry.intendedUse ? (
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {entry.intendedUse}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="p-4 max-w-xs">
                          {entry.message ? (
                            <span className="text-muted-foreground line-clamp-2 text-xs">
                              {entry.message}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-muted-foreground text-xs">
                          {format(new Date(entry.signedUpAt), "MMM d, yyyy · HH:mm")}
                        </td>
                        <td className="p-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(entry.id)}
                            data-testid={`button-delete-waitlist-${entry.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Waitlist Entry</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this person from the waitlist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-waitlist">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-waitlist"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
