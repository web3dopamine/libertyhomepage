import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Zap,
  Package,
  AlertTriangle,
  ExternalLink,
  Eye,
  RefreshCw,
  Edit2,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { WaitlistEntry, DevicePrices, DeviceType } from "@shared/schema";
import { deviceTypeValues } from "@shared/schema";

const DEVICE_LABELS: Record<string, { label: string; color: string; Icon: typeof Radio }> = {
  meshtastic: { label: "Meshtastic Node",     color: "bg-primary/15 text-primary border-primary/30",        Icon: Radio },
  reticulum:  { label: "Reticulum Node",      color: "bg-violet-500/15 text-violet-400 border-violet-500/30", Icon: Lock  },
  both:       { label: "Both Devices",        color: "bg-amber-500/15 text-amber-400 border-amber-500/30",  Icon: Wifi  },
};

const TRON_EXPLORER = "https://tronscan.org/#/transaction/";
const BSC_EXPLORER  = "https://bscscan.com/tx/";

function txExplorerUrl(txHash: string, network?: string): string {
  if (!txHash) return "";
  if (network === "TRC20" || (!network && !txHash.startsWith("0x"))) return TRON_EXPLORER + txHash;
  return BSC_EXPLORER + txHash;
}

interface VerifyResult {
  success: boolean;
  verified: boolean;
  network?: string;
  amountUsdt?: number;
  error?: string;
}

export default function AdminWaitlist() {
  const { toast } = useToast();
  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [detailEntry, setDetailEntry]     = useState<WaitlistEntry | null>(null);
  const [walletInput, setWalletInput]         = useState("");   // BSC
  const [trc20WalletInput, setTrc20WalletInput] = useState(""); // TRC20
  const [copiedWallet, setCopiedWallet]       = useState(false);
  const [priceInputs, setPriceInputs]     = useState({ meshtastic: "0", reticulum: "0", shipping: "0" });

  // Date-range export state
  const [exportFrom, setExportFrom]       = useState("");
  const [exportTo, setExportTo]           = useState("");

  // Edit state inside the detail dialog
  const [editMode, setEditMode]           = useState(false);
  const [editForm, setEditForm]           = useState<Partial<WaitlistEntry>>({});
  const [txHashInput, setTxHashInput]     = useState("");
  const [verifyResult, setVerifyResult]   = useState<VerifyResult | null>(null);
  const [verifying, setVerifying]         = useState(false);

  // ── Queries ────────────────────────────────────────────
  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({ queryKey: ["/api/waitlist"] });

  const { data: walletData, isLoading: walletLoading } = useQuery<{ address: string; bscAddress: string; trc20Address: string; isConfigured: boolean }>({
    queryKey: ["/api/admin/device-wallet"],
  });

  const { data: pricesData, isLoading: pricesLoading } = useQuery<DevicePrices>({
    queryKey: ["/api/admin/device-prices"],
  });

  // Sync wallet inputs when data loads
  useEffect(() => {
    if (walletData) {
      if (walletData.bscAddress && !walletInput)       setWalletInput(walletData.bscAddress);
      if (walletData.trc20Address && !trc20WalletInput) setTrc20WalletInput(walletData.trc20Address);
    }
  }, [walletData]);

  // Sync price inputs when data loads
  useEffect(() => {
    if (pricesData) {
      setPriceInputs({
        meshtastic: String(pricesData.meshtastic),
        reticulum:  String(pricesData.reticulum),
        shipping:   String(pricesData.shipping),
      });
    }
  }, [pricesData]);

  // Open detail dialog
  function openDetail(entry: WaitlistEntry) {
    setDetailEntry(entry);
    setEditMode(false);
    setEditForm({ ...entry });
    setTxHashInput(entry.paymentTxHash ?? "");
    setVerifyResult(null);
  }

  // ── Mutations ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/waitlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDeleteId(null);
      toast({ title: "Entry removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove entry.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WaitlistEntry> }) =>
      apiRequest("PATCH", `/api/waitlist/${id}`, updates).then((r) => r.json()),
    onSuccess: (data: WaitlistEntry) => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDetailEntry(data);
      setEditMode(false);
      toast({ title: "Order updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update order.", variant: "destructive" }),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, txHash }: { id: string; txHash: string }) =>
      apiRequest("POST", `/api/waitlist/${id}/mark-paid`, { txHash }).then((r) => r.json()),
    onSuccess: (data: WaitlistEntry) => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setDetailEntry(data);
      toast({ title: "Marked as paid" });
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("409") ? "That transaction hash is already used for another entry." : "Failed to update.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const saveWalletMutation = useMutation({
    mutationFn: ({ bsc, trc20 }: { bsc: string; trc20: string }) =>
      apiRequest("POST", "/api/admin/device-wallet", { address: bsc, trc20Address: trc20 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/device-wallet", "/api/device-wallet"] });
      const active = walletInput.trim() || trc20WalletInput.trim();
      toast({ title: "Wallets saved", description: active ? "Pre-payment is now active." : "Pre-payment disabled." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save wallet addresses.", variant: "destructive" }),
  });

  const savePricesMutation = useMutation({
    mutationFn: (p: { meshtastic: number; reticulum: number; shipping: number }) =>
      apiRequest("POST", "/api/admin/device-prices", p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/device-prices", "/api/device-prices"] });
      toast({ title: "Prices saved" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save prices.", variant: "destructive" }),
  });

  // On-chain verify (in detail dialog)
  async function handleVerify() {
    if (!detailEntry) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const r = await apiRequest("POST", `/api/waitlist/${detailEntry.id}/verify-payment`, {
        txHash: txHashInput.trim(),
        senderWallet: (editForm.senderWallet ?? detailEntry.senderWallet ?? "").trim(),
      });
      const data: VerifyResult = await r.json();
      setVerifyResult(data);
      if (data.verified) {
        queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
        setDetailEntry((prev) => prev ? { ...prev, paid: true, paidVerified: true, paymentTxHash: txHashInput.trim(), verifiedNetwork: data.network } : prev);
        toast({ title: "Payment verified on-chain!", description: `${data.amountUsdt?.toFixed(2)} USDT confirmed on ${data.network}.` });
      }
    } catch {
      setVerifyResult({ success: false, verified: false, error: "Verification request failed." });
    } finally {
      setVerifying(false);
    }
  }

  function computeDevicePrice(entry: WaitlistEntry | null, prices?: DevicePrices): number {
    if (!entry || !prices) return 0;
    if (entry.deviceType === "both") return prices.meshtastic + prices.reticulum;
    return entry.deviceType === "meshtastic" ? prices.meshtastic : prices.reticulum;
  }

  function copyWallet() {
    if (!walletData?.address) return;
    navigator.clipboard.writeText(walletData.address).then(() => {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    });
  }

  function buildCSV(rows: WaitlistEntry[]) {
    const headers = ["Name","Email","Country","Device","Intended Use","Postal Address","Paid","Auto-Verified","Network","TX Hash","Sender Wallet","Paid At","Signed Up"];
    const csvRows = rows.map((e) => [
      `"${(e.name ?? "").replace(/"/g, '""')}"`,
      `"${(e.email ?? "").replace(/"/g, '""')}"`,
      `"${(e.country ?? "").replace(/"/g, '""')}"`,
      `"${e.deviceType ?? ""}"`,
      `"${(e.intendedUse ?? "").replace(/"/g, '""')}"`,
      `"${(e.postalAddress ?? "").replace(/\n/g, " | ").replace(/"/g, '""')}"`,
      `"${e.paid ? "Yes" : "No"}"`,
      `"${e.paidVerified ? "Yes" : "No"}"`,
      `"${e.verifiedNetwork ?? ""}"`,
      `"${e.paymentTxHash ?? ""}"`,
      `"${e.senderWallet ?? ""}"`,
      `"${e.paidAt ? format(new Date(e.paidAt), "yyyy-MM-dd HH:mm") : ""}"`,
      `"${format(new Date(e.signedUpAt), "yyyy-MM-dd HH:mm")}"`,
    ]);
    return [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  }

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    downloadCSV(buildCSV(entries), `liberty-device-waitlist-all-${format(new Date(), "yyyy-MM-dd")}.csv`);
  }

  function exportPaidCSV() {
    const fromDate = exportFrom ? new Date(exportFrom + "T00:00:00") : null;
    const toDate   = exportTo   ? new Date(exportTo   + "T23:59:59") : null;
    const paid = entries.filter((e) => {
      if (!e.paid) return false;
      const signedAt = new Date(e.signedUpAt);
      if (fromDate && signedAt < fromDate) return false;
      if (toDate   && signedAt > toDate)   return false;
      return true;
    });
    if (paid.length === 0) {
      toast({ title: "No paid orders in this range", description: "Try widening the date range or checking your filters." });
      return;
    }
    const datePart = exportFrom || exportTo
      ? `${exportFrom || "start"}_to_${exportTo || "today"}`
      : format(new Date(), "yyyy-MM-dd");
    downloadCSV(buildCSV(paid), `liberty-paid-orders-${datePart}_exported-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast({ title: `Exported ${paid.length} paid order${paid.length === 1 ? "" : "s"}` });
  }

  const filtered = entries.filter((e) =>
    [e.name, e.email, e.country, e.deviceType??'', e.intendedUse]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );
  const paidCount     = entries.filter((e) => e.paid).length;
  const verifiedCount = entries.filter((e) => e.paidVerified).length;

  const computedBoth = (parseFloat(priceInputs.meshtastic)||0) + (parseFloat(priceInputs.reticulum)||0);

  // Keep detail entry in sync with latest data
  useEffect(() => {
    if (detailEntry) {
      const fresh = entries.find((e) => e.id === detailEntry.id);
      if (fresh) setDetailEntry(fresh);
    }
  }, [entries]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 space-y-8">

          {/* Breadcrumb */}
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-admin-back">
              <ChevronLeft className="w-4 h-4" /> Admin
            </Button>
          </Link>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Waitlist</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-admin-waitlist">Device Waitlist</h1>
              <p className="text-muted-foreground mt-2">Manage Meshtastic &amp; Reticulum device reservations, pricing and payment settings.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportCSV} disabled={entries.length === 0} data-testid="button-export-csv">
                <Download className="w-4 h-4 mr-2" /> Export All
              </Button>
            </div>
          </div>

          {/* Settings row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* USDT Wallet */}
            <Card className="p-6 border-primary/20 bg-primary/5 space-y-4" data-testid="card-wallet-settings">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                <h2 className="font-black text-lg">USDT Payment Wallet</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set your USDT receiving addresses. You can use one or both networks. Activates the pre-payment section on the public form. Leave both blank to disable.
              </p>

              {/* BSC Wallet */}
              <div className="space-y-1.5">
                <Label htmlFor="wallet-input" className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                  BNB Chain (BSC) — USDT BEP-20
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="wallet-input" value={walletInput} onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x... (BSC wallet address)" className="font-mono text-sm"
                    data-testid="input-usdt-wallet-bsc"
                  />
                  {walletData?.bscAddress && (
                    <Button type="button" size="icon" variant="outline" onClick={copyWallet} title="Copy BSC address" data-testid="button-copy-wallet">
                      {copiedWallet ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* TRC20 Wallet */}
              <div className="space-y-1.5">
                <Label htmlFor="trc20-wallet-input" className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                  Tron Network (TRC20) — USDT TRC-20
                </Label>
                <Input
                  id="trc20-wallet-input" value={trc20WalletInput} onChange={(e) => setTrc20WalletInput(e.target.value)}
                  placeholder="T... (Tron/TRC20 wallet address)" className="font-mono text-sm"
                  data-testid="input-usdt-wallet-trc20"
                />
              </div>

              <Button
                onClick={() => saveWalletMutation.mutate({ bsc: walletInput, trc20: trc20WalletInput })}
                disabled={saveWalletMutation.isPending || walletLoading}
                className="w-full sm:w-auto"
                data-testid="button-save-wallet"
              >
                <Save className="w-4 h-4 mr-2" /> {saveWalletMutation.isPending ? "Saving..." : "Save Wallet Addresses"}
              </Button>

              {walletData?.isConfigured
                ? (
                  <div className="space-y-1">
                    <p className="text-xs text-primary font-semibold flex items-center gap-1"><BadgeCheck className="w-4 h-4 flex-shrink-0" /> Pre-payment active.</p>
                    {walletData.bscAddress   && <p className="text-xs text-muted-foreground font-mono truncate">BSC: {walletData.bscAddress}</p>}
                    {walletData.trc20Address && <p className="text-xs text-muted-foreground font-mono truncate">TRC20: {walletData.trc20Address}</p>}
                  </div>
                )
                : <p className="text-xs text-muted-foreground">No wallet set — waitlist is currently free.</p>}
            </Card>

            {/* Device Prices */}
            <Card className="p-6 space-y-4" data-testid="card-device-prices">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary flex-shrink-0" />
                <h2 className="font-black text-lg">Device Prices (USDT)</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set prices per device. "Both Devices" is automatically charged as Meshtastic + Reticulum combined.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "meshtastic", label: "Meshtastic Node" },
                  { key: "reticulum",  label: "Reticulum Node" },
                  { key: "shipping",   label: "Worldwide Shipping" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`price-${key}`} className="text-xs">{label}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input id={`price-${key}`} type="number" min="0" step="0.01"
                        value={priceInputs[key as keyof typeof priceInputs]}
                        onChange={(e) => setPriceInputs((p) => ({ ...p, [key]: e.target.value }))}
                        className="pl-7" data-testid={`input-price-${key}`} />
                    </div>
                  </div>
                ))}
                {/* Computed "both" display */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Both Devices (computed)</Label>
                  <div className="flex items-center h-9 px-3 bg-muted/40 rounded-md border border-border text-sm font-semibold text-muted-foreground">
                    ${computedBoth.toFixed(2)} USDT
                  </div>
                </div>
              </div>
              <Button onClick={() => savePricesMutation.mutate({
                meshtastic: parseFloat(priceInputs.meshtastic)||0,
                reticulum: parseFloat(priceInputs.reticulum)||0,
                shipping: parseFloat(priceInputs.shipping)||0,
              })} disabled={savePricesMutation.isPending||pricesLoading} className="w-full" data-testid="button-save-prices">
                <Save className="w-4 h-4 mr-2" /> {savePricesMutation.isPending ? "Saving..." : "Save Prices"}
              </Button>
            </Card>
          </div>

          {/* Paid orders export with date range */}
          <Card className="p-5" data-testid="card-paid-export">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2 flex-shrink-0 mb-1">
                <Download className="w-4 h-4 text-primary" />
                <p className="font-black text-sm">Export Paid Orders</p>
              </div>
              <div className="flex flex-wrap gap-3 flex-1 items-end">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From (order date)</Label>
                  <Input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} className="w-40 text-sm" data-testid="input-export-from" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To (order date)</Label>
                  <Input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} className="w-40 text-sm" data-testid="input-export-to" />
                </div>
                <Button onClick={exportPaidCSV} disabled={paidCount === 0} data-testid="button-export-paid-csv" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export {paidCount > 0 ? `${paidCount} Paid` : "Paid"} Orders
                </Button>
              </div>
              <p className="w-full text-xs text-muted-foreground">Exports only paid orders (confirmed + auto-verified). Filename is date-stamped. Includes shipping address.</p>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: entries.length,     label: "Total",        Icon: Users     },
              { val: paidCount,          label: "Paid",         Icon: DollarSign },
              { val: verifiedCount,      label: "Auto-verified", Icon: Zap       },
              { val: new Set(entries.map((e) => e.country).filter(Boolean)).size, label: "Countries", Icon: Globe },
            ].map(({ val, label, Icon }) => (
              <Card key={label} className="p-5 text-center">
                <div className="text-3xl font-black gradient-text">{val}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by name, email, country, device…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-waitlist" />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading waitlist…</div>
          ) : entries.length === 0 ? (
            <Card className="p-16 text-center">
              <Cpu className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-semibold">No signups yet.</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center"><p className="text-muted-foreground">No entries match your search.</p></Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      {["Name","Email","Device","Country","Payment","Signed Up",""].map((h) => (
                        <th key={h} className="text-left p-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => {
                      const dev = DEVICE_LABELS[entry.deviceType ?? "meshtastic"] ?? DEVICE_LABELS.meshtastic;
                      const DevIcon = dev.Icon;
                      return (
                        <tr key={entry.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors ${i === filtered.length-1 ? "border-0" : ""}`} data-testid={`waitlist-row-${entry.id}`}>
                          <td className="p-4">
                            <div className="font-semibold whitespace-nowrap">{entry.name}</div>
                            {entry.senderWallet && (
                              <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px] mt-0.5" title={entry.senderWallet}>{entry.senderWallet.slice(0,14)}…</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <a href={`mailto:${entry.email}`} className="hover:text-primary transition-colors">{entry.email}</a>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${dev.color}`}>
                              <DevIcon className="w-3 h-3 flex-shrink-0" /> {dev.label}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{entry.country || <span className="opacity-40">—</span>}</td>
                          <td className="p-4">
                            {entry.paid ? (
                              entry.paidVerified
                                ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-full"><Zap className="w-3 h-3" /> Verified</span>
                                : <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-1 rounded-full"><BadgeCheck className="w-3 h-3" /> Confirmed</span>
                            ) : entry.paymentTxHash ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3" /> Pending</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">No payment</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap text-muted-foreground text-xs">{format(new Date(entry.signedUpAt), "MMM d, yyyy · HH:mm")}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openDetail(entry)} data-testid={`button-view-${entry.id}`} title="View / Edit order">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setDeleteId(entry.id)} data-testid={`button-delete-waitlist-${entry.id}`}>
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

      {/* ─── Order Detail / Edit Dialog ─────────────────── */}
      <Dialog open={!!detailEntry} onOpenChange={(open) => { if (!open) { setDetailEntry(null); setEditMode(false); setVerifyResult(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-order-detail">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editMode ? <Edit2 className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4 text-primary" />}
              {editMode ? "Edit Order" : "Order Details"}
              {detailEntry && (
                <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full border ${DEVICE_LABELS[detailEntry.deviceType ?? "meshtastic"]?.color}`}>
                  {DEVICE_LABELS[detailEntry.deviceType ?? "meshtastic"]?.label}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {detailEntry && (
            <div className="space-y-5 py-1">
              {/* Customer info */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer Details</p>
                {editMode ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={editForm.name ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} data-testid="input-edit-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input value={editForm.email ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} data-testid="input-edit-email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Input value={editForm.country ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} data-testid="input-edit-country" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Device</Label>
                      <Select value={editForm.deviceType ?? "meshtastic"} onValueChange={(v) => setEditForm((f) => ({ ...f, deviceType: v as DeviceType }))}>
                        <SelectTrigger data-testid="select-edit-device"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {deviceTypeValues.map((v) => (
                            <SelectItem key={v} value={v}>{DEVICE_LABELS[v]?.label ?? v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Twitter</Label>
                      <Input value={editForm.twitter ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, twitter: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Telegram</Label>
                      <Input value={editForm.telegram ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, telegram: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs">Shipping Address</Label>
                      <Textarea
                        value={editForm.postalAddress ?? ""}
                        rows={3}
                        className="font-mono text-xs"
                        placeholder={"Full name\nStreet, apt\nCity, State, ZIP\nCountry"}
                        onChange={(e) => setEditForm((f) => ({ ...f, postalAddress: e.target.value }))}
                        data-testid="input-edit-postal"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs">Message / Notes</Label>
                      <Textarea value={editForm.message ?? ""} rows={2} onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    {[
                      ["Name", detailEntry.name],
                      ["Email", detailEntry.email],
                      ["Country", detailEntry.country || "—"],
                      ["Intended Use", detailEntry.intendedUse || "—"],
                      ["Twitter", detailEntry.twitter || "—"],
                      ["Telegram", detailEntry.telegram || "—"],
                      ["Signed Up", format(new Date(detailEntry.signedUpAt), "MMM d, yyyy HH:mm")],
                      ["Paid At", detailEntry.paidAt ? format(new Date(detailEntry.paidAt), "MMM d, yyyy HH:mm") : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-muted-foreground min-w-[90px] flex-shrink-0">{k}</span>
                        <span className="font-medium break-all">{v}</span>
                      </div>
                    ))}
                    {detailEntry.postalAddress && (
                      <div className="sm:col-span-2 flex gap-2">
                        <span className="text-muted-foreground min-w-[90px] flex-shrink-0">Ship To</span>
                        <span className="font-medium whitespace-pre-wrap font-mono text-xs leading-relaxed">{detailEntry.postalAddress}</span>
                      </div>
                    )}
                    {detailEntry.message && (
                      <div className="sm:col-span-2 flex gap-2">
                        <span className="text-muted-foreground min-w-[90px] flex-shrink-0">Message</span>
                        <span className="font-medium whitespace-pre-wrap">{detailEntry.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              {pricesData && (
                <div className="rounded-xl border border-border bg-card/60 p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Summary</p>
                  <div className="space-y-1.5 text-sm">
                    {(() => {
                      const devPrice = computeDevicePrice(editMode ? ({ ...detailEntry, ...editForm } as WaitlistEntry) : detailEntry, pricesData);
                      const ship    = pricesData.shipping;
                      const total   = devPrice + ship;
                      const devType = editMode ? (editForm.deviceType ?? detailEntry.deviceType) : detailEntry.deviceType;
                      const devLbl  = devType === "both" ? "Meshtastic + Reticulum" : DEVICE_LABELS[devType ?? "meshtastic"]?.label;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{devLbl}</span>
                            <span className="font-semibold">${devPrice.toFixed(2)} USDT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Worldwide Shipping</span>
                            <span className="font-semibold">${ship.toFixed(2)} USDT</span>
                          </div>
                          <div className="flex justify-between border-t border-border pt-2 font-black text-base">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)} USDT</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Payment section */}
              <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-1">Payment Details</p>
                  {detailEntry.paid ? (
                    detailEntry.paidVerified
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-full"><Zap className="w-3 h-3" /> On-chain verified — {detailEntry.verifiedNetwork}</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-1 rounded-full"><BadgeCheck className="w-3 h-3" /> Manually confirmed</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-full">
                      {detailEntry.paymentTxHash ? <><AlertTriangle className="w-3 h-3" /> Pending</> : <>No payment</>}
                    </span>
                  )}
                </div>

                {/* TX hash input + verify */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Transaction Hash (BSC 0x… or TRC20 hex)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={txHashInput}
                      onChange={(e) => { setTxHashInput(e.target.value); setVerifyResult(null); }}
                      placeholder="0x... or 64-char hex..."
                      className="font-mono text-xs flex-1"
                      data-testid="input-detail-txhash"
                    />
                    {txHashInput && (
                      <a
                        href={txExplorerUrl(txHashInput, detailEntry.verifiedNetwork)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button type="button" size="icon" variant="outline" title="View on explorer">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Sender wallet */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Sender Wallet (for verification)</Label>
                  <Input
                    value={editForm.senderWallet ?? detailEntry.senderWallet ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, senderWallet: e.target.value }))}
                    placeholder="Customer's BSC or TRC20 wallet..."
                    className="font-mono text-xs"
                    data-testid="input-detail-sender"
                  />
                </div>

                {/* Verify result */}
                {verifyResult && (
                  <div className={`rounded-lg p-3 text-sm border ${verifyResult.verified ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
                    {verifyResult.verified
                      ? <><Zap className="inline w-4 h-4 mr-1" />Payment verified — <strong>${verifyResult.amountUsdt?.toFixed(2)} USDT</strong> on {verifyResult.network}.</>
                      : <><AlertTriangle className="inline w-4 h-4 mr-1" />{verifyResult.error || "Verification failed."}</>
                    }
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerify}
                    disabled={!txHashInput.trim() || verifying}
                    data-testid="button-verify-onchain"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
                    {verifying ? "Verifying…" : "Verify On-Chain"}
                  </Button>
                  {!detailEntry.paid && (
                    <Button
                      size="sm"
                      onClick={() => markPaidMutation.mutate({ id: detailEntry.id, txHash: txHashInput })}
                      disabled={markPaidMutation.isPending}
                      data-testid="button-confirm-payment"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />
                      {markPaidMutation.isPending ? "Saving…" : "Confirm Payment"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => { setEditMode(false); setEditForm({ ...detailEntry! }); }}>Cancel</Button>
                <Button
                  onClick={() => detailEntry && updateMutation.mutate({ id: detailEntry.id, updates: { ...editForm, paymentTxHash: txHashInput } })}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-edit"
                >
                  <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDetailEntry(null)}>Close</Button>
                <Button onClick={() => setEditMode(true)} data-testid="button-edit-order">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Order
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Waitlist Entry</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this person from the waitlist. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-waitlist">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete-waitlist">
              {deleteMutation.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
