import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
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
  Radio,
  Lock,
  Wifi,
  DollarSign,
  BadgeCheck,
  Save,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { WaitlistEntry } from "@shared/schema";

const DEVICE_LABELS: Record<string, { label: string; color: string }> = {
  meshtastic: { label: "Meshtastic", color: "bg-primary/15 text-primary border-primary/30" },
  reticulum:  { label: "Reticulum",  color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  both:       { label: "Both",       color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export default function AdminWaitlist() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [markPaidEntry, setMarkPaidEntry] = useState<WaitlistEntry | null>(null);
  const [txHashInput, setTxHashInput] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [copiedWallet, setCopiedWallet] = useState(false);

  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
  });

  const { data: walletData, isLoading: walletLoading } = useQuery<{ address: string; isConfigured: boolean }>({
    queryKey: ["/api/admin/device-wallet"],
  });

  useEffect(() => {
    if (walletData?.address && !walletInput) setWalletInput(walletData.address);
  }, [walletData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/waitlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDeleteId(null);
      toast({ title: "Entry removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove entry.", variant: "destructive" }),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, txHash }: { id: string; txHash: string }) =>
      apiRequest("POST", `/api/waitlist/${id}/mark-paid`, { txHash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setMarkPaidEntry(null);
      setTxHashInput("");
      toast({ title: "Marked as paid", description: "Entry updated with payment confirmation." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update payment status.", variant: "destructive" }),
  });

  const saveWalletMutation = useMutation({
    mutationFn: (address: string) => apiRequest("POST", "/api/admin/device-wallet", { address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/device-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/device-wallet"] });
      toast({ title: "USDT wallet saved", description: walletInput.trim() ? "Pre-payment is now active on the waitlist form." : "Pre-payment removed — waitlist is now free." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save wallet address.", variant: "destructive" }),
  });

  function exportCSV() {
    const headers = ["Name", "Email", "Country", "Device", "Intended Use", "Paid", "TX Hash", "Message", "Signed Up"];
    const rows = entries.map((e) => [
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.country}"`,
      `"${e.deviceType ?? ""}"`,
      `"${e.intendedUse}"`,
      `"${e.paid ? "Yes" : "No"}"`,
      `"${e.paymentTxHash ?? ""}"`,
      `"${(e.message ?? "").replace(/"/g, '""')}"`,
      `"${format(new Date(e.signedUpAt), "yyyy-MM-dd HH:mm")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liberty-device-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyWallet() {
    if (!walletData?.address) return;
    navigator.clipboard.writeText(walletData.address).then(() => {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    });
  }

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.country.toLowerCase().includes(search.toLowerCase()) ||
      (e.deviceType ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.intendedUse.toLowerCase().includes(search.toLowerCase())
  );

  const paidCount = entries.filter((e) => e.paid).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8">

          {/* Breadcrumb */}
          <div>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-admin-back">
                <ChevronLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Waitlist</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-admin-waitlist">
                Device Waitlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage Meshtastic &amp; Reticulum device reservations and pre-payment settings.
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

          {/* USDT Wallet Settings */}
          <Card className="p-6 border-primary/20 bg-primary/5 space-y-4" data-testid="card-wallet-settings">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="font-black text-lg">USDT Pre-Payment Wallet</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set a USDT wallet address here to enable pre-payment on the public waitlist form. Customers who pay first get priority shipping. Leave blank to keep the waitlist free.
            </p>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-0 space-y-1.5">
                <Label htmlFor="wallet-input">USDT Wallet Address (TRC20 / ERC20)</Label>
                <div className="flex gap-2">
                  <Input
                    id="wallet-input"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="Enter USDT wallet address..."
                    className="font-mono text-sm"
                    data-testid="input-usdt-wallet"
                  />
                  {walletData?.isConfigured && (
                    <Button type="button" size="icon" variant="outline" onClick={copyWallet} data-testid="button-copy-wallet">
                      {copiedWallet ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => saveWalletMutation.mutate(walletInput)}
                disabled={saveWalletMutation.isPending || walletLoading}
                data-testid="button-save-wallet"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveWalletMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
            {walletData?.isConfigured ? (
              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                <BadgeCheck className="w-4 h-4 flex-shrink-0" />
                Pre-payment active — wallet address is shown on the public waitlist form.
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No wallet set — waitlist is currently free.</p>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">{entries.length}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Total
              </div>
            </Card>
            <Card className="p-5 text-center">
              <div className="text-3xl font-black gradient-text">{paidCount}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Paid
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
                  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                }).length}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Today
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, country, device, or use case..."
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
                      <th className="text-left p-4 font-semibold">Device</th>
                      <th className="text-left p-4 font-semibold">Country</th>
                      <th className="text-left p-4 font-semibold">Payment</th>
                      <th className="text-left p-4 font-semibold">Signed Up</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => {
                      const deviceInfo = DEVICE_LABELS[entry.deviceType ?? "meshtastic"] ?? DEVICE_LABELS.meshtastic;
                      const DevIcon = entry.deviceType === "reticulum" ? Lock : entry.deviceType === "both" ? Wifi : Radio;
                      return (
                        <tr
                          key={entry.id}
                          className={`border-b border-border/50 hover:bg-card/40 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                          data-testid={`waitlist-row-${entry.id}`}
                        >
                          <td className="p-4 font-semibold whitespace-nowrap">{entry.name}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <a href={`mailto:${entry.email}`} className="hover:text-primary transition-colors">
                                {entry.email}
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${deviceInfo.color}`}>
                              <DevIcon className="w-3 h-3 flex-shrink-0" />
                              {deviceInfo.label}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {entry.country || <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td className="p-4">
                            {entry.paid ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-full">
                                  <BadgeCheck className="w-3 h-3" /> Paid
                                </span>
                                {entry.paymentTxHash && (
                                  <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]" title={entry.paymentTxHash}>
                                    {entry.paymentTxHash.slice(0, 10)}…
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 gap-1"
                                onClick={() => { setMarkPaidEntry(entry); setTxHashInput(""); }}
                                data-testid={`button-mark-paid-${entry.id}`}
                              >
                                <DollarSign className="w-3 h-3" />
                                Mark paid
                              </Button>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Mark Paid dialog */}
      <Dialog open={!!markPaidEntry} onOpenChange={(open) => { if (!open) setMarkPaidEntry(null); }}>
        <DialogContent data-testid="dialog-mark-paid">
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Confirm payment for <span className="font-semibold text-foreground">{markPaidEntry?.name}</span>. Optionally add the USDT transaction hash.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="admin-txhash">Transaction Hash <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="admin-txhash"
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                placeholder="0x... or txid..."
                className="font-mono text-sm"
                data-testid="input-admin-txhash"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidEntry(null)}>Cancel</Button>
            <Button
              onClick={() => markPaidEntry && markPaidMutation.mutate({ id: markPaidEntry.id, txHash: txHashInput })}
              disabled={markPaidMutation.isPending}
              data-testid="button-confirm-mark-paid"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              {markPaidMutation.isPending ? "Saving..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              className="bg-destructive text-destructive-foreground"
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
