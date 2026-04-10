import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { useCMSContent } from "@/hooks/use-cms-content";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import productSheetImg from "@assets/Liberty_Mesh_Node_-_Product_Sheet_1775046844792.png";
import fieldDeployImg from "@assets/Liberty_Mesh_Node_1775046844795.png";
import reticulumDeviceImg from "@assets/liberty-reticulum-device_1775814916093.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { CalloutBadge } from "@/components/CalloutBadge";
import { useToast } from "@/hooks/use-toast";
import { intendedUseValues, deviceTypeValues, type InsertWaitlist, type DeviceType, type DevicePrices } from "@shared/schema";
import {
  Wifi,
  Shield,
  RefreshCw,
  Globe,
  Radio,
  Cpu,
  Zap,
  Lock,
  ArrowRight,
  Package,
  MapPin,
  Signal,
  Network,
  CheckCircle2,
  Copy,
  Check,
  DollarSign,
  BadgeCheck,
  Wallet,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

// ── BSC USDT constants ─────────────────────────────────
const BSC_CHAIN_ID   = "0x38"; // 56 decimal
const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_DECIMALS  = 18;
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];
const BSC_NETWORK_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"],
};

const howItWorksSteps = [
  {
    icon: Cpu,
    step: "01",
    title: "LoRa Radio Mesh",
    description:
      "Liberty nodes broadcast over LoRa (Long Range) radio — a low-power, wide-area protocol that operates without the internet. Signals travel up to 15km in open terrain, hopping between nodes in a fully decentralized mesh.",
  },
  {
    icon: Signal,
    step: "02",
    title: "Ultra-Lightweight Packets",
    description:
      "Each packet carries only what matters: the latest block height and hash, finalized checkpoints, validator signals, and compressed transaction intents. The entire payload fits in a LoRa frame — no broadband required.",
  },
  {
    icon: Network,
    step: "03",
    title: "Mesh Propagation",
    description:
      "Nodes relay packets across the mesh using a store-and-forward model. Even if a node is temporarily out of range, data propagates as connectivity returns — maintaining chain awareness across the entire network.",
  },
  {
    icon: RefreshCw,
    step: "04",
    title: "Seamless Reconciliation",
    description:
      "When internet connectivity is restored, nodes reconcile from mesh checkpoints. Missing blocks sync automatically and full performance resumes instantly — no manual intervention, no loss of integrity.",
  },
];

const useCases = [
  {
    icon: MapPin,
    title: "Remote & Rural Regions",
    description:
      "Farmers, rural communities, and off-grid settlements can participate in and interact with the Liberty network without any internet infrastructure. Agriculture-based applications, land registries, and supply chain tools remain fully operational.",
  },
  {
    icon: Shield,
    title: "Infrastructure Outages",
    description:
      "Natural disasters, power grid failures, and ISP outages won't take Liberty offline. The mesh layer keeps validators coordinating and the chain producing blocks even during widespread connectivity disruptions.",
  },
  {
    icon: Lock,
    title: "Censorship-Restricted Environments",
    description:
      "In regions where governments control or restrict internet access, Liberty's LoRa mesh bypasses traditional infrastructure entirely. Blockchain access becomes a physical signal, not a permission.",
  },
  {
    icon: Zap,
    title: "Emergency & Disaster Networks",
    description:
      "Emergency responders, humanitarian operations, and disaster relief efforts can leverage Liberty's mesh layer for tamper-proof, decentralized coordination — even in the aftermath of events that destroy infrastructure.",
  },
  {
    icon: Globe,
    title: "Maritime & Aviation",
    description:
      "Shipping vessels, remote aircraft, and offshore platforms can maintain chain awareness via satellite-linked mesh nodes, bridging Liberty to environments where traditional connectivity has always been sparse.",
  },
  {
    icon: Radio,
    title: "Protest & Civil Action",
    description:
      "In environments where communication is monitored or suppressed, the off-grid layer allows participants to transact and coordinate without exposing themselves to internet-level surveillance or control.",
  },
];

const technicalDetails = [
  {
    label: "Protocol",
    value: "LoRa (Long Range Radio)",
    sub: "Sub-GHz ISM bands (868 MHz EU / 915 MHz US)",
  },
  {
    label: "Range",
    value: "Up to 15km",
    sub: "Open terrain, line-of-sight conditions",
  },
  {
    label: "Power",
    value: "Ultra-low consumption",
    sub: "Battery operable — solar compatible",
  },
  {
    label: "Packet payload",
    value: "< 255 bytes",
    sub: "Block hash, height, checkpoints, validator signals",
  },
  {
    label: "Topology",
    value: "Fully decentralized mesh",
    sub: "Store-and-forward, no central relay required",
  },
  {
    label: "Integration",
    value: "Native Liberty node support",
    sub: "No separate software stack required",
  },
];

const DEVICE_OPTIONS: { value: DeviceType; label: string; desc: string; icon: typeof Radio }[] = [
  { value: "meshtastic", label: "Meshtastic Node", desc: "LoRa mesh transport — off-grid coverage", icon: Radio },
  { value: "reticulum", label: "Reticulum Node", desc: "Encrypted routing — secure by design", icon: Lock },
  { value: "both", label: "Both Devices", desc: "Full stack — charged separately for each device", icon: Wifi },
];

const EMPTY_FORM: InsertWaitlist = {
  name: "",
  email: "",
  country: "",
  intendedUse: "",
  message: "",
  twitter: "",
  telegram: "",
  deviceType: "meshtastic",
  paymentTxHash: "",
  senderWallet: "",
  postalAddress: "",
};

function WaitlistForm() {
  const { toast } = useToast();
  const [form, setForm] = useState<InsertWaitlist>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  // When transitioning to the success screen, scroll the section back into view
  // from the top so the result is immediately visible without any downward drift.
  useEffect(() => {
    if (submitted) {
      const el = document.getElementById("waitlist-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitted]);
  const [copied, setCopied] = useState(false);

  // MetaMask payment state
  const [payMethod, setPayMethod] = useState<"manual" | "metamask">("manual");
  const [mmAddress, setMmAddress] = useState<string>("");
  const [mmSending, setMmSending] = useState(false);
  const [mmError, setMmError] = useState<string>("");
  const [mmTxHash, setMmTxHash] = useState<string>("");

  // Submit tracking
  const [submittedAsPaid, setSubmittedAsPaid]   = useState(false);
  const [submittedEmail, setSubmittedEmail]     = useState("");
  const [payError, setPayError]                 = useState("");
  const [pendingIntent, setPendingIntent]       = useState<"free"|"paid"|null>(null);
  type VerifResult = { verified: boolean; network?: string; amountUsdt?: number; error?: string } | null;
  const [verification, setVerification]         = useState<VerifResult>(null);

  // Pay-later form (shown after free signup)
  const [payLaterTxHash, setPayLaterTxHash]     = useState("");
  const [payLaterSender, setPayLaterSender]     = useState("");
  const [payLaterPostal, setPayLaterPostal]     = useState("");
  const [payLaterSending, setPayLaterSending]   = useState(false);
  const [payLaterDone, setPayLaterDone]         = useState(false);
  const [payLaterError, setPayLaterError]       = useState("");

  const { data: walletData } = useQuery<{ address: string | null; bscAddress: string | null; trc20Address: string | null; isConfigured: boolean }>({
    queryKey: ["/api/device-wallet"],
  });
  const { data: prices } = useQuery<DevicePrices>({
    queryKey: ["/api/device-prices"],
  });
  const bscAddress  = walletData?.bscAddress  || null;
  const trc20Address = walletData?.trc20Address || null;
  // Legacy compat: any configured address activates the payment section
  const usdtAddress = walletData?.isConfigured ? (bscAddress || trc20Address) : null;

  const devicePrice = prices
    ? form.deviceType === "both"
      ? prices.both  // already has bulk discount applied
      : form.deviceType === "meshtastic" ? prices.meshtastic : prices.reticulum
    : 0;
  const undiscountedBothPrice = prices ? prices.meshtastic + prices.reticulum : 0;
  const bulkDiscount  = prices?.bulkDiscount ?? 0;
  const bundleSaving  = form.deviceType === "both" && bulkDiscount > 0
    ? parseFloat((undiscountedBothPrice - (prices?.both ?? 0)).toFixed(2))
    : 0;
  const shippingPrice = prices?.shipping ?? 0;
  const totalPrice = devicePrice + shippingPrice;
  const hasPricing = prices && (prices.meshtastic > 0 || prices.reticulum > 0);

  const mutation = useMutation({
    mutationFn: ({ data, asPaid }: { data: InsertWaitlist; asPaid: boolean }) =>
      apiRequest("POST", "/api/waitlist", data)
        .then(async (r) => {
          const json = await r.json();
          return { json, asPaid };
        }),
    onSuccess: ({ json, asPaid }) => {
      setSubmitted(true);
      setSubmittedAsPaid(asPaid);
      setSubmittedEmail(form.email);
      setVerification(json.verification ?? null);
      setForm(EMPTY_FORM);
      setPendingIntent(null);
    },
    onError: (err: Error) => {
      setPendingIntent(null);
      // err.message = "<status>: <json body>" — extract the server's error field when available
      let msg = "Something went wrong. Please try again.";
      try {
        const jsonStart = err.message.indexOf("{");
        if (jsonStart !== -1) {
          const parsed = JSON.parse(err.message.slice(jsonStart));
          if (parsed?.error) msg = parsed.error;
        }
      } catch {
        if (err.message.includes("409")) msg = "This email is already on the waitlist.";
      }
      toast({ title: "Could not sign up", description: msg, variant: "destructive" });
    },
  });

  function handleFreeJoin() {
    setPayError("");
    setPendingIntent("free");
    mutation.mutate({
      data: { ...form, paymentTxHash: "", senderWallet: "", postalAddress: "" },
      asPaid: false,
    });
  }

  function handlePaidJoin() {
    setPayError("");
    const txHash = form.paymentTxHash.trim() || mmTxHash.trim();
    if (!txHash) {
      setPayError("Please enter your transaction hash before proceeding.");
      return;
    }
    if (!form.postalAddress.trim()) {
      setPayError("Please enter your shipping address so we know where to send your device.");
      return;
    }
    setPendingIntent("paid");
    mutation.mutate({
      data: { ...form, paymentTxHash: txHash },
      asPaid: true,
    });
  }

  async function handlePayLaterSubmit() {
    setPayLaterError("");
    if (!payLaterTxHash.trim()) {
      setPayLaterError("Please enter your transaction hash.");
      return;
    }
    setPayLaterSending(true);
    try {
      const r = await apiRequest("POST", "/api/waitlist/submit-payment", {
        email: submittedEmail,
        txHash: payLaterTxHash.trim(),
        senderWallet: payLaterSender.trim() || undefined,
        postalAddress: payLaterPostal.trim() || undefined,
      });
      const data = await r.json();
      setVerification(data.verification ?? null);
      setPayLaterDone(true);
    } catch (err: unknown) {
      // apiRequest throws "status: {json}" — parse the server's error field
      let msg = "Network error — please try again.";
      try {
        const raw = (err as Error).message ?? "";
        const jsonStart = raw.indexOf("{");
        if (jsonStart !== -1) {
          const parsed = JSON.parse(raw.slice(jsonStart));
          if (parsed?.error) msg = parsed.error;
        }
      } catch { /* leave default */ }
      setPayLaterError(msg);
    } finally {
      setPayLaterSending(false);
    }
  }

  function copyAddress() {
    if (!usdtAddress) return;
    navigator.clipboard.writeText(usdtAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function connectAndPayWithMetaMask() {
    const eth = (window as Window & { ethereum?: unknown }).ethereum as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } | undefined;
    if (!eth) {
      setMmError("MetaMask is not installed. Please install it from metamask.io.");
      return;
    }
    if (!usdtAddress) {
      setMmError("Payment wallet not configured.");
      return;
    }
    if (totalPrice <= 0) {
      setMmError("No price set for this device. Select a device first.");
      return;
    }
    setMmError("");
    setMmSending(true);
    try {
      // 1. Connect wallet
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      const address  = accounts[0];
      setMmAddress(address);
      setForm((f) => ({ ...f, senderWallet: address }));

      // 2. Switch to BNB Chain
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
      } catch (switchErr: unknown) {
        // 4902 = chain not added
        if ((switchErr as { code?: number }).code === 4902) {
          await eth.request({ method: "wallet_addEthereumChain", params: [BSC_NETWORK_PARAMS] });
        } else {
          throw switchErr;
        }
      }

      // 3. Send USDT transfer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new BrowserProvider(eth as any);
      const signer   = await provider.getSigner();
      const usdt     = new Contract(USDT_BSC_CONTRACT, USDT_ABI, signer);
      const amount   = parseUnits(totalPrice.toFixed(USDT_DECIMALS), USDT_DECIMALS);
      const tx       = await usdt.transfer(usdtAddress, amount);

      // 4. Auto-fill TX hash
      setMmTxHash(tx.hash as string);
      setForm((f) => ({ ...f, paymentTxHash: tx.hash as string, senderWallet: address }));

      toast({
        title: "Transaction submitted!",
        description: "Your USDT transfer is on-chain. The hash has been filled in automatically.",
      });
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e.code === 4001) {
        setMmError("Transaction cancelled.");
      } else {
        setMmError(e.message?.slice(0, 120) ?? "MetaMask payment failed.");
      }
    } finally {
      setMmSending(false);
    }
  }

  const hasMetaMask = typeof window !== "undefined" && !!(window as Window & { ethereum?: unknown }).ethereum;
  const hasPaid = !!(form.paymentTxHash.trim() || mmTxHash);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
        data-testid="waitlist-success"
      >
        {/* Base success */}
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 className="w-10 h-10 text-primary" />
          <p className="text-xl font-bold">
            {submittedAsPaid ? "Payment Submitted!" : "You're on the list!"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            {submittedAsPaid
              ? "Your priority slot is reserved. We'll send shipping details when production starts."
              : "We'll notify you when Liberty Mesh Devices are ready. Thanks for being early!"}
          </p>
        </div>

        {/* Verification result badge — shown after paid signup */}
        {submittedAsPaid && verification && (
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            verification.verified
              ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-300"
              : verification.error
                ? "border-destructive/40 bg-destructive/8 text-destructive"
                : "border-amber-500/40 bg-amber-500/8 text-amber-300"
          }`} data-testid="section-verification-result">
            {verification.verified ? (
              <BadgeCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              {verification.verified ? (
                <>
                  <p className="font-bold">Payment verified on-chain</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {verification.amountUsdt !== undefined ? `$${verification.amountUsdt.toFixed(2)} USDT` : ""}
                    {verification.network ? ` · ${verification.network}` : ""}
                  </p>
                </>
              ) : verification.error ? (
                <>
                  <p className="font-bold">Payment could not be verified</p>
                  <p className="text-xs opacity-80 mt-0.5">{verification.error}</p>
                  <p className="text-xs opacity-60 mt-1">Your reservation is saved — an admin will review your transaction manually.</p>
                </>
              ) : (
                <>
                  <p className="font-bold">Payment accepted — pending manual review</p>
                  <p className="text-xs opacity-80 mt-0.5">Auto-verification is not configured yet. An admin will confirm your payment shortly.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Free signup: show pay-later CTA + form */}
        {!submittedAsPaid && usdtAddress && !payLaterDone && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-black text-emerald-300 uppercase tracking-wide">Upgrade to Priority Delivery</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pre-paid orders ship first. Send <span className="font-semibold text-foreground">{totalPrice > 0 ? `$${totalPrice.toFixed(2)} USDT` : "USDT"}</span> to one of the addresses below, then submit your transaction hash here.
            </p>

            {bscAddress && (
              <div className="space-y-1">
                <p className="text-xs text-yellow-400 font-semibold flex items-center gap-1.5"><span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />BNB Chain (BSC)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 border border-border font-mono truncate">{bscAddress}</code>
                  <Button type="button" size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(bscAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            {trc20Address && (
              <div className="space-y-1">
                <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />Tron Network (TRC20)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 border border-border font-mono truncate">{trc20Address}</code>
                  <Button type="button" size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(trc20Address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="paylater-txhash" className="text-xs">Transaction Hash <span className="text-destructive">*</span></Label>
                <Input id="paylater-txhash" value={payLaterTxHash} onChange={(e) => { setPayLaterTxHash(e.target.value); setPayLaterError(""); }}
                  placeholder="0x... (BSC) or 64-char hex (TRC20)..."
                  className="font-mono text-xs" data-testid="input-paylater-txhash" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="paylater-sender" className="text-xs">Your Wallet <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="paylater-sender" value={payLaterSender} onChange={(e) => setPayLaterSender(e.target.value)}
                    placeholder="BSC or TRC20 address..." className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paylater-postal" className="text-xs">Shipping Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="paylater-postal" value={payLaterPostal} onChange={(e) => setPayLaterPostal(e.target.value)}
                    placeholder="City, Country..." />
                </div>
              </div>
              {payLaterError && (
                <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{payLaterError}</p>
              )}
              <Button type="button" onClick={handlePayLaterSubmit} disabled={payLaterSending} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 gap-2" data-testid="button-paylater-submit">
                {payLaterSending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</> : <><Zap className="w-4 h-4" /> Submit My Transaction Hash</>}
              </Button>
            </div>
          </div>
        )}

        {/* Pay-later submitted — show result */}
        {payLaterDone && (
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            verification?.verified
              ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-300"
              : verification?.error
                ? "border-amber-500/40 bg-amber-500/8 text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
          }`} data-testid="section-paylater-verification">
            {verification?.verified
              ? <BadgeCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            }
            <div>
              {verification?.verified ? (
                <>
                  <p className="font-bold">Payment verified on-chain!</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {verification.amountUsdt !== undefined ? `$${verification.amountUsdt.toFixed(2)} USDT` : ""}
                    {verification.network ? ` · ${verification.network}` : ""}
                    {" "}&mdash; your slot is now priority.
                  </p>
                </>
              ) : verification?.error ? (
                <>
                  <p className="font-bold">Hash submitted — pending manual review</p>
                  <p className="text-xs opacity-80 mt-0.5">{verification.error}</p>
                </>
              ) : (
                <>
                  <p className="font-bold">Payment hash received</p>
                  <p className="text-xs opacity-80 mt-0.5">We'll verify it on-chain and upgrade your slot to priority delivery.</p>
                </>
              )}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={() => { setSubmitted(false); setSubmittedAsPaid(false); setSubmittedEmail(""); setVerification(null); setPayLaterDone(false); setPayLaterTxHash(""); setPayLaterSender(""); setPayLaterPostal(""); setPayLaterError(""); }}>
          Sign up another email
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full max-w-lg mx-auto text-left space-y-4 pt-2"
      data-testid="form-waitlist"
    >
      {/* Device Selection */}
      <div className="space-y-2">
        <Label>Device <span className="text-xs text-muted-foreground">(select one or both)</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DEVICE_OPTIONS.map((opt) => {
            const active = form.deviceType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, deviceType: opt.value })}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/40 text-muted-foreground hover-elevate"
                }`}
                data-testid={`button-device-${opt.value}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <opt.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                  <span className="text-xs font-bold">{opt.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
                </div>
                <span className="text-[11px] leading-tight pl-6">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="wl-name">Name *</Label>
          <Input
            id="wl-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            required
            data-testid="input-waitlist-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wl-email">Email *</Label>
          <Input
            id="wl-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
            data-testid="input-waitlist-email"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="wl-country">Country / Region</Label>
          <Input
            id="wl-country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="e.g. United Kingdom"
            data-testid="input-waitlist-country"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wl-use">Intended Use</Label>
          <Select
            value={form.intendedUse}
            onValueChange={(val) => setForm({ ...form, intendedUse: val })}
          >
            <SelectTrigger id="wl-use" data-testid="select-waitlist-use">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {intendedUseValues.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="wl-twitter">X / Twitter <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="wl-twitter"
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            placeholder="@handle"
            data-testid="input-waitlist-twitter"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wl-telegram">Telegram <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="wl-telegram"
            value={form.telegram}
            onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            placeholder="@handle"
            data-testid="input-waitlist-telegram"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wl-message">Tell us more <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          id="wl-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Where do you plan to deploy? Any specific use case in mind?"
          rows={3}
          data-testid="input-waitlist-message"
        />
      </div>

      {/* Strong CTA — shown when pre-payment is available */}
      {usdtAddress && (
        <div className="rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5 p-4 space-y-2" data-testid="section-prepay-cta">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm font-black text-primary uppercase tracking-wide">Get Your Device First</p>
          </div>
          <p className="text-sm text-foreground font-semibold leading-snug">
            Pre-paid reservations are shipped in priority order — before free waitlist spots.
          </p>
          <ul className="space-y-1">
            {[
              "Guaranteed first-batch delivery",
              "Lock in today's price before production starts",
              "Your TX hash auto-verified on-chain — no manual review",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pre-payment section — only shown when admin has configured a USDT wallet */}
      {usdtAddress && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-4" data-testid="section-payment">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm font-bold">Pre-pay to secure your priority slot</p>
          </div>

          {/* Network warning */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed font-medium">
              <span className="font-bold text-amber-200">Only send via BNB Chain (BSC) or TRC20.</span>{" "}
              Payments on any other network (ETH mainnet, Polygon, Arbitrum, etc.) will not be received and cannot be recovered.
            </p>
          </div>

          {/* Pricing breakdown */}
          {hasPricing && totalPrice > 0 && (
            <div className="rounded-lg bg-background/60 border border-border p-3 space-y-1.5" data-testid="pricing-breakdown">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Device price ({DEVICE_OPTIONS.find((d) => d.value === form.deviceType)?.label})</span>
                <div className="flex items-center gap-1.5">
                  {bundleSaving > 0 && (
                    <span className="text-xs line-through text-muted-foreground">${undiscountedBothPrice.toFixed(2)}</span>
                  )}
                  <span className="font-semibold">${devicePrice.toFixed(2)} USDT</span>
                </div>
              </div>
              {bundleSaving > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    Bundle discount ({bulkDiscount}% off)
                  </span>
                  <span className="text-emerald-400 font-semibold">-${bundleSaving.toFixed(2)} USDT</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Worldwide shipping</span>
                <span className="font-semibold">${shippingPrice.toFixed(2)} USDT</span>
              </div>
              <div className="border-t border-border pt-1.5 flex items-center justify-between text-sm font-black">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)} USDT</span>
              </div>
            </div>
          )}

          {/* "30% cheaper" prepayment incentive message */}
          {hasPricing && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300">
              <span className="mt-0.5 flex-shrink-0 text-emerald-400 font-black">%</span>
              <p>
                <span className="font-bold">Pre-paid devices are 30% cheaper</span> than devices purchased at launch.
                {form.deviceType === "both" && bulkDiscount > 0 && (
                  <span className="ml-1">Plus your <span className="font-bold">{bulkDiscount}% bundle discount</span> for ordering both together.</span>
                )}
              </p>
            </div>
          )}

          {/* Postal / shipping address — required for pre-payment */}
          <div className="space-y-1.5">
            <Label htmlFor="wl-postal" className="text-sm font-semibold">
              Shipping Address <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal text-xs ml-1">(required for delivery)</span>
            </Label>
            <Textarea
              id="wl-postal"
              value={form.postalAddress}
              onChange={(e) => setForm({ ...form, postalAddress: e.target.value })}
              placeholder={"Full name\nStreet address, apt/unit\nCity, State/Province, ZIP\nCountry"}
              rows={4}
              className="text-sm font-mono resize-none"
              data-testid="input-waitlist-postal"
            />
            <p className="text-xs text-muted-foreground">Enter your complete shipping address including country. We ship worldwide.</p>
          </div>

          {/* Payment method toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setPayMethod("manual"); setMmError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${payMethod === "manual" ? "bg-primary text-primary-foreground" : "bg-background/60 text-muted-foreground hover:text-foreground"}`}
              data-testid="tab-pay-manual"
            >
              <Copy className="w-3.5 h-3.5" /> Manual (BSC or TRC20)
            </button>
            <button
              type="button"
              onClick={() => { setPayMethod("metamask"); setMmError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 border-l border-border transition-colors ${payMethod === "metamask" ? "bg-primary text-primary-foreground" : "bg-background/60 text-muted-foreground hover:text-foreground"}`}
              data-testid="tab-pay-metamask"
            >
              <Wallet className="w-3.5 h-3.5" /> MetaMask (BNB Chain)
            </button>
          </div>

          {/* ── Manual payment ─────────────────────────────── */}
          {payMethod === "manual" && (
            <div className="space-y-3">
              {/* USDT addresses — show each configured network */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Send USDT to one of these addresses</p>

                {bscAddress && (
                  <div className="space-y-1">
                    <p className="text-xs text-yellow-400 font-semibold flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                      BNB Chain (BSC) — BEP-20
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 border border-border font-mono truncate" data-testid="text-bsc-address">
                        {bscAddress}
                      </code>
                      <Button type="button" size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(bscAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }} data-testid="button-copy-bsc">
                        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {trc20Address && (
                  <div className="space-y-1">
                    <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                      Tron Network (TRC20)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 border border-border font-mono truncate" data-testid="text-trc20-address">
                        {trc20Address}
                      </code>
                      <Button type="button" size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(trc20Address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} data-testid="button-copy-trc20">
                        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sender wallet */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-sender">Your Sending Wallet <span className="text-muted-foreground text-xs">(enables auto-verification)</span></Label>
                <Input
                  id="wl-sender"
                  value={form.senderWallet}
                  onChange={(e) => setForm({ ...form, senderWallet: e.target.value })}
                  placeholder="Your BSC or TRC20 wallet address..."
                  className="font-mono text-xs"
                  data-testid="input-waitlist-sender"
                />
              </div>

              {/* TX hash */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-txhash">Transaction Hash <span className="text-muted-foreground text-xs">(paste after sending)</span></Label>
                <Input
                  id="wl-txhash"
                  value={form.paymentTxHash}
                  onChange={(e) => setForm({ ...form, paymentTxHash: e.target.value })}
                  placeholder="0x... (BSC) or 64-char hex (TRC20)..."
                  data-testid="input-waitlist-txhash"
                />
              </div>
            </div>
          )}

          {/* ── MetaMask payment ────────────────────────────── */}
          {payMethod === "metamask" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-background/60 p-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>Clicking the button below will:</p>
                <ol className="list-decimal list-inside space-y-1 text-foreground/80">
                  <li>Connect your MetaMask wallet</li>
                  <li>Switch to <span className="font-semibold text-foreground">BNB Smart Chain</span> automatically</li>
                  <li>Send <span className="font-semibold text-primary">{totalPrice > 0 ? `$${totalPrice.toFixed(2)} USDT` : "USDT"}</span> to the payment address</li>
                  <li>Fill in your TX hash automatically</li>
                </ol>
                <p className="text-amber-300/80 font-medium">TRC20 payments must be made manually (Tron is not EVM-compatible).</p>
              </div>

              {/* Connected wallet display */}
              {mmAddress && (
                <div className="flex items-center gap-2 text-xs bg-primary/10 border border-primary/25 rounded-lg px-3 py-2">
                  <Wallet className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Connected:</span>
                  <code className="font-mono text-primary flex-1 truncate">{mmAddress}</code>
                </div>
              )}

              {/* TX confirmed */}
              {mmTxHash && (
                <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 font-semibold">Transaction submitted!</span>
                  <a
                    href={`https://bscscan.com/tx/${mmTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Error */}
              {mmError && (
                <div className="flex items-start gap-2 text-xs bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {mmError}
                </div>
              )}

              {!hasMetaMask && (
                <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  MetaMask not detected. Please{" "}
                  <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    install MetaMask
                  </a>{" "}
                  to use this option.
                </div>
              )}

              <Button
                type="button"
                onClick={connectAndPayWithMetaMask}
                disabled={mmSending || !hasMetaMask || (mmTxHash !== "")}
                className="w-full gap-2"
                data-testid="button-pay-metamask"
              >
                {mmSending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Confirm in MetaMask…</>
                ) : mmTxHash ? (
                  <><Check className="w-4 h-4" /> Payment Sent</>
                ) : mmAddress ? (
                  <><Wallet className="w-4 h-4" /> Send {totalPrice > 0 ? `$${totalPrice.toFixed(2)} USDT` : "USDT"} via MetaMask</>
                ) : (
                  <><Wallet className="w-4 h-4" /> Connect MetaMask &amp; Pay</>
                )}
              </Button>
            </div>
          )}

          {hasPaid && (
            <div className="flex items-center gap-2 text-xs text-primary font-semibold">
              <BadgeCheck className="w-4 h-4 flex-shrink-0" />
              Payment hash provided — we'll verify it automatically and confirm your priority slot.
            </div>
          )}
        </div>
      )}

      {/* Validation error */}
      {payError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive" data-testid="text-pay-error">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {payError}
        </div>
      )}

      {/* Two action buttons */}
      <div className="grid grid-cols-2 gap-3" data-testid="section-submit-buttons">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="gap-2"
          disabled={mutation.isPending}
          onClick={handleFreeJoin}
          data-testid="button-join-free"
        >
          {mutation.isPending && pendingIntent === "free"
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Signing up…</>
            : <><ArrowRight className="w-4 h-4" /> Join Waitlist</>
          }
        </Button>
        <Button
          type="button"
          size="lg"
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          disabled={mutation.isPending}
          onClick={handlePaidJoin}
          data-testid="button-join-paid"
        >
          {mutation.isPending && pendingIntent === "paid"
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
            : <><Zap className="w-4 h-4" /> Pay &amp; Reserve</>
          }
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        <span className="text-foreground/60 font-medium">Join Waitlist</span> — free, notified when ready.{" "}
        <span className="text-emerald-400 font-semibold">Pay &amp; Reserve</span> — ships first, requires TX hash.
      </p>
    </form>
  );
}

function AnimatedPulse({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/20"
      animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay }}
    />
  );
}

function MeshHero() {
  const nodes = [
    { x: "50%", y: "50%", main: true },
    { x: "22%", y: "22%", main: false },
    { x: "78%", y: "18%", main: false },
    { x: "82%", y: "60%", main: false },
    { x: "62%", y: "82%", main: false },
    { x: "18%", y: "72%", main: false },
    { x: "40%", y: "30%", main: false },
    { x: "70%", y: "42%", main: false },
  ];

  const links = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 6], [2, 6], [2, 7], [3, 7], [4, 5],
  ];

  return (
    <div className="relative w-full h-64 sm:h-80">
      <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {links.map(([a, b], i) => {
          const na = nodes[a];
          const nb = nodes[b];
          const x1 = parseFloat(na.x) / 100 * 400;
          const y1 = parseFloat(na.y) / 100 * 280;
          const x2 = parseFloat(nb.x) / 100 * 400;
          const y2 = parseFloat(nb.y) / 100 * 280;
          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="4 6"
              strokeOpacity={0.4}
              animate={{
                strokeDashoffset: [0, -40],
                strokeOpacity: [0.25, 0.55, 0.25],
              }}
              transition={{
                strokeDashoffset: { duration: 3 + i * 0.2, repeat: Infinity, ease: "linear" },
                strokeOpacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          );
        })}
        {nodes.map((n, i) => {
          const cx = parseFloat(n.x) / 100 * 400;
          const cy = parseFloat(n.y) / 100 * 280;
          const r = n.main ? 9 : 5;
          return (
            <g key={i}>
              <motion.circle
                cx={cx} cy={cy} r={r * 3.5}
                fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7}
                animate={{ r: [r * 2.5, r * 5.5], opacity: [0.4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
              />
              <circle
                cx={cx} cy={cy} r={r * 2.5}
                fill="hsl(var(--primary))" fillOpacity={0.12}
              />
              <motion.circle
                cx={cx} cy={cy} r={r}
                fill={n.main ? "hsl(var(--primary))" : "hsl(var(--background))"}
                stroke="hsl(var(--primary))"
                strokeWidth={n.main ? 0 : 1.5}
                filter="url(#heroGlow)"
                animate={n.main
                  ? { scale: [1, 1.15, 1] }
                  : { opacity: [0.6, 1, 0.6] }
                }
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ResilienceLayer() {
  const cms = useCMSContent("resilience-layer");
  const heroBadge = cms["hero.badge"] ?? "Off-Grid Resilience Layer";
  const heroTitle = cms["hero.title"] ?? "Stay online, even when the world goes offline.";
  const heroSubtitle = cms["hero.subtitle"] ?? "Liberty Chain combines Meshtastic and Reticulum into a fully resilient communication layer — off-grid LoRa transport meets end-to-end encrypted routing, operating anywhere on Earth.";
  const heroCta1 = cms["hero.cta1"] ?? "Join the Waitlist";
  const heroCta2 = cms["hero.cta2"] ?? "Learn How It Works";
  const howItWorksTitle = cms["howItWorks.title"] ?? "How the Resilience Layer Works";
  const useCasesTitle = cms["useCases.title"] ?? "Built for the Real World";
  const waitlistTitle = cms["waitlist.title"] ?? "Join the Liberty Mesh Device Waitlist";
  const waitlistSubtitle = cms["waitlist.subtitle"] ?? "Be among the first to receive a Liberty Mesh Device — purpose-built hardware for running LoRa nodes and contributing to the Liberty resilience layer.";

  const cmsHowItWorksSteps = [
    { ...howItWorksSteps[0], title: cms["howItWorks.step1Title"] ?? howItWorksSteps[0].title, description: cms["howItWorks.step1Desc"] ?? howItWorksSteps[0].description },
    { ...howItWorksSteps[1], title: cms["howItWorks.step2Title"] ?? howItWorksSteps[1].title, description: cms["howItWorks.step2Desc"] ?? howItWorksSteps[1].description },
    { ...howItWorksSteps[2], title: cms["howItWorks.step3Title"] ?? howItWorksSteps[2].title, description: cms["howItWorks.step3Desc"] ?? howItWorksSteps[2].description },
    { ...howItWorksSteps[3], title: cms["howItWorks.step4Title"] ?? howItWorksSteps[3].title, description: cms["howItWorks.step4Desc"] ?? howItWorksSteps[3].description },
  ];

  const cmsUseCases = [
    { ...useCases[0], title: cms["useCases.case1Title"] ?? useCases[0].title, description: cms["useCases.case1Desc"] ?? useCases[0].description },
    { ...useCases[1], title: cms["useCases.case2Title"] ?? useCases[1].title, description: cms["useCases.case2Desc"] ?? useCases[1].description },
    { ...useCases[2], title: cms["useCases.case3Title"] ?? useCases[2].title, description: cms["useCases.case3Desc"] ?? useCases[2].description },
    { ...useCases[3], title: cms["useCases.case4Title"] ?? useCases[3].title, description: cms["useCases.case4Desc"] ?? useCases[3].description },
    { ...useCases[4], title: cms["useCases.case5Title"] ?? useCases[4].title, description: cms["useCases.case5Desc"] ?? useCases[4].description },
    { ...useCases[5], title: cms["useCases.case6Title"] ?? useCases[5].title, description: cms["useCases.case6Desc"] ?? useCases[5].description },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <CalloutBadge text={heroBadge} animate showPulse />

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              data-testid="heading-resilience"
            >
              <span className="gradient-text">{heroTitle}</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              data-testid="text-resilience-intro"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <Button size="lg" className="group" data-testid="button-join-testnet" onClick={() => document.getElementById("waitlist-section")?.scrollIntoView({ behavior: "smooth" })}>
                {heroCta1}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group" data-testid="button-read-docs" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                {heroCta2}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Mesh animation */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 overflow-hidden">
              <MeshHero />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-primary/10">
                {[
                  { value: "15km", label: "Signal range" },
                  { value: "< 255B", label: "Packet size" },
                  { value: "0 sats", label: "Infrastructure cost" },
                  { value: "100%", label: "Decentralized" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Network Stack: Meshtastic + Reticulum */}
          <motion.section
            className="mb-24"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            data-testid="section-network-stack"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Liberty Resilient Network Stack</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                Beyond the internet. Built for reality. Two complementary protocols working as one.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Meshtastic card */}
              <Card className="p-6 sm:p-8 border-primary/20 bg-primary/5 space-y-5" data-testid="card-meshtastic">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">Off-Grid Transport Layer</p>
                    <h3 className="text-xl font-black">Meshtastic</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A LoRa-based mesh network enabling communication without internet infrastructure — long-range, low-power, solar-compatible nodes that deploy anywhere.
                </p>
                <ul className="space-y-2">
                  {["Long-range, low-power mesh networking", "Solar-powered, deploy-anywhere nodes", "Ideal for rural, remote, and disaster environments"].map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                      <span className="text-muted-foreground">{pt}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-foreground">Physical resilience. Real-world coverage.</p>
              </Card>

              {/* Reticulum card */}
              <Card className="p-6 sm:p-8 border-primary/20 bg-primary/5 space-y-5" data-testid="card-reticulum">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">Encrypted Routing Layer</p>
                    <h3 className="text-xl font-black">Reticulum</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A decentralized networking protocol that enables secure communication across any transport — internet, mesh, or radio. Intelligent routing, secure by design.
                </p>
                <ul className="space-y-2">
                  {["End-to-end encrypted messaging", "Transport-agnostic (internet, mesh, radio)", "Cryptographic identity-based addressing"].map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                      <span className="text-muted-foreground">{pt}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-foreground">Intelligent routing. Secure by design.</p>
              </Card>
            </div>

            {/* Together / Liberty Advantage */}
            <Card className="p-6 sm:p-8 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent space-y-5" data-testid="card-liberty-advantage">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">The Liberty Advantage</p>
                  <h3 className="text-xl font-black">Together — One Network. Any Environment.</h3>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">By combining both layers, Liberty creates a unified network that routes messages across internet and mesh seamlessly, maintains communication during outages or censorship, and enables wallet-to-wallet messaging anywhere on Earth.</p>
                  <p className="text-sm font-semibold text-foreground mt-3">Liberty doesn't rely on infrastructure — it builds around it.</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">One Network. Any Environment.</p>
                  {[
                    { env: "Cities", stack: "Internet + Reticulum" },
                    { env: "Rural", stack: "Mesh + Reticulum" },
                    { env: "Off-grid", stack: "Meshtastic only" },
                  ].map((row) => (
                    <div key={row.env} className="flex items-center justify-between text-sm border-b border-primary/10 pb-2 last:border-0 last:pb-0">
                      <span className="font-semibold">{row.env}</span>
                      <span className="text-muted-foreground font-mono text-xs">{row.stack}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.section>

          {/* How it works */}
          <section className="mb-24" id="how-it-works">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-how-it-works">{howItWorksTitle}</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                A four-step process that keeps Liberty alive without the internet.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cmsHowItWorksSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="p-6 h-full border-primary/10 bg-primary/5 space-y-4" data-testid={`card-how-${i}`}>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-4xl font-black text-primary/20 leading-none">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* What the mesh carries */}
          <section className="mb-24">
            <Card className="p-10 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight" data-testid="heading-mesh-carries">
                    What the Mesh Carries
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Every packet is precision-engineered for extreme bandwidth constraints. No bloat. Only what the network needs to stay alive and reach consensus.
                  </p>
                  <ul className="space-y-3 mt-6">
                    {[
                      "Latest block height & hash",
                      "Finalized checkpoints",
                      "Validator presence signals",
                      "Compressed transaction intents",
                      "Epoch transition markers",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="font-mono text-sm bg-background/60 rounded-xl p-6 border border-primary/20 space-y-2">
                    <div className="text-primary/60 text-xs mb-4">// Example LoRa frame payload</div>
                    <div><span className="text-primary">type</span>: <span className="text-secondary">"checkpoint"</span>,</div>
                    <div><span className="text-primary">block</span>: <span className="text-foreground">892411</span>,</div>
                    <div><span className="text-primary">hash</span>: <span className="text-secondary">"0xA3f8...2c91"</span>,</div>
                    <div><span className="text-primary">validators</span>: <span className="text-foreground">[ "0x1a2b", "0x3c4d" ]</span>,</div>
                    <div><span className="text-primary">epoch</span>: <span className="text-foreground">441</span>,</div>
                    <div><span className="text-primary">finalized</span>: <span className="text-primary">true</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Total payload: ~180 bytes — well within LoRa's 255-byte limit.</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Use Cases */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-use-cases">{useCasesTitle}</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                From disaster zones to censored regions, Liberty operates where others cannot.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cmsUseCases.map((uc, i) => (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Card className="p-6 h-full hover-elevate" data-testid={`card-usecase-${i}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <uc.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Technical Specs */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-technical">Technical Specifications</h2>
            </div>
            <Card className="overflow-hidden border-primary/20">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                {technicalDetails.map((detail, i) => (
                  <div
                    key={detail.label}
                    className={`p-6 space-y-1 ${i < technicalDetails.length - 1 ? "border-b border-r-0 sm:border-b sm:border-r border-primary/10 last:border-0" : ""}`}
                    data-testid={`spec-${i}`}
                  >
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">{detail.label}</div>
                    <div className="text-xl font-black">{detail.value}</div>
                    <div className="text-sm text-muted-foreground">{detail.sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Coming Soon — Devices */}
          <section className="mb-24" id="waitlist-section">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Card className="p-10 sm:p-14 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 border-primary/30 text-center relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,transparent_70%)]" />

                <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AnimatedPulse delay={0} />
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Coming Soon</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight" data-testid="heading-devices">
                      {waitlistTitle}
                    </h2>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {waitlistSubtitle}
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 text-left">
                    {[
                      { title: "Pre-configured", desc: "Ships ready to participate in the Liberty mesh" },
                      { title: "Ruggedized", desc: "Built for field deployment in harsh conditions" },
                      { title: "Solar-ready", desc: "Low-power design compatible with solar panels" },
                    ].map((feat) => (
                      <div key={feat.title} className="bg-background/50 rounded-xl p-4 border border-primary/10">
                        <div className="font-bold text-sm mb-1">{feat.title}</div>
                        <div className="text-xs text-muted-foreground">{feat.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Waitlist Form */}
                  <WaitlistForm />
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Mesh Messaging Teaser */}
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 sm:p-12 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
                    <Radio className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Decentralized Messaging
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Liberty Mesh{" "}
                    <span className="gradient-text">Messaging Layer</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Communication without infrastructure. Send encrypted messages wallet-to-wallet,
                    coordinate validators, and participate in DAO governance — all over LoRa, all
                    without the internet.
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Wallet-to-wallet encrypted messaging",
                      "Validator coordination signals",
                      "Off-grid DAO governance",
                      "LoRa mesh — no internet required",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/mesh-messaging">
                    <Button size="lg" className="group mt-2" data-testid="button-mesh-messaging">
                      Explore Mesh Messaging
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:flex items-center justify-center p-8 sm:p-12 relative">
                  {/* Simple animated mesh visual */}
                  <div className="relative w-48 h-48">
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <div
                        key={deg}
                        className="absolute w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-72px)`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      </div>
                    ))}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center">
                      <Radio className="w-7 h-7 text-primary" />
                    </div>
                    {[1, 2, 3].map((r) => (
                      <div
                        key={r}
                        className="absolute top-1/2 left-1/2 rounded-full border border-primary/20"
                        style={{
                          width: `${r * 56}px`,
                          height: `${r * 56}px`,
                          transform: "translate(-50%, -50%)",
                          animation: `ping ${1.5 + r * 0.5}s cubic-bezier(0,0,0.2,1) infinite`,
                          animationDelay: `${r * 0.4}s`,
                          opacity: 0.25 / r,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.section>

          {/* Hardware Renders */}
          <section className="mb-24 mt-24" data-testid="section-hardware-renders">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-5">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Hardware Preview</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" data-testid="heading-hardware">
                Meet the Liberty Mesh Node
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Purpose-built hardware for the off-grid frontier. Five form factors — one mission: keep the chain alive anywhere on Earth.
              </p>
            </motion.div>

            {/* Product sheet — full lineup */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-10"
            >
              <Card className="overflow-hidden border-primary/20 bg-card/60">
                <div className="p-6 sm:p-8 pb-0">
                  <h3 className="text-xl font-black mb-1" data-testid="heading-product-lineup">The Full Lineup</h3>
                  <p className="text-sm text-muted-foreground mb-6">Five purpose-built variants covering every deployment scenario.</p>
                </div>
                <img
                  src={productSheetImg}
                  alt="Liberty Mesh Node product lineup — five hardware variants including solar outdoor node, desktop validator node, portable flat node, boxed product, and ruggedized field case"
                  className="w-full object-cover"
                  data-testid="img-product-sheet"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-primary/10 border-t border-primary/20">
                  {[
                    { label: "Solar Outdoor", desc: "Weatherproof enclosure + integrated LoRa antenna, designed for fence-line or rooftop mounting. Pairs with any 5V solar panel for fully autonomous off-grid operation." },
                    { label: "Desktop Validator", desc: "High-performance node with active cooling and a teal accent ring. Built for permanent installation as a full or validator node — runs 24/7 in any rack or desk setup." },
                    { label: "Portable Flat", desc: "Ultra-compact form factor with a low-profile antenna. Slides into a bag or backpack for mobile deployment at events, protests, or rural field visits." },
                    { label: "Boxed Edition", desc: "Premium retail-ready packaging with magnetic closure and a branded teal power glow. Ships pre-configured — open the box, plug it in, and you're on the mesh." },
                    { label: "Ruggedized Case", desc: "Military-grade hard-shell carry case with foam-lined solar panel, device, and accessories. Built for disaster zones, maritime use, and humanitarian deployments." },
                  ].map((v) => (
                    <div key={v.label} className="bg-card/80 p-5 space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-primary">{v.label}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Field deployment render */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <Card className="overflow-hidden border-primary/20 bg-card/60">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative min-h-64 lg:min-h-0">
                    <img
                      src={fieldDeployImg}
                      alt="Liberty Mesh Node deployed on a pole in a vineyard at sunset — solar panel visible, device glowing teal"
                      className="w-full h-full object-cover"
                      data-testid="img-field-deploy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 hidden lg:block" />
                  </div>
                  <div className="p-8 sm:p-10 flex flex-col justify-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 self-start">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Field Deployment Render</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black leading-tight" data-testid="heading-field-deploy">
                      Deploy it anywhere.<br />
                      <span className="gradient-text">It just works.</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      This render shows the Solar Outdoor variant pole-mounted at a remote vineyard — typical of the agricultural and rural use cases Liberty is built for. The solar panel keeps the node charged indefinitely, the integrated LoRa antenna broadcasts up to 15 km in open terrain, and the teal status LEDs confirm live mesh activity.
                    </p>
                    <ul className="space-y-2.5 text-sm">
                      {[
                        "IP67-rated weatherproof housing — rain, dust, and sun resistant",
                        "LoRa antenna with up to 15 km open-terrain range",
                        "Status LED array: mesh sync, block height, battery level",
                        "Universal mount bracket — poles, walls, fences, rooftops",
                        "Solar input compatible — no mains power required",
                      ].map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Reticulum Device */}
          <motion.section
            className="mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            data-testid="section-reticulum-device"
          >
            <Card className="overflow-hidden border-primary/20 bg-card/60">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative min-h-64 lg:min-h-0 order-1">
                  <img
                    src={reticulumDeviceImg}
                    alt="Liberty Reticulum Device — compact encrypted routing hardware with LoRa antenna and Liberty branding, shown in retail box and ruggedized carry case"
                    className="w-full h-full object-cover"
                    data-testid="img-reticulum-device"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/60 hidden lg:block" />
                </div>
                {/* Content */}
                <div className="p-8 sm:p-10 flex flex-col justify-center space-y-5 order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 self-start">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Reticulum Device</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight" data-testid="heading-reticulum-device">
                    The Liberty Reticulum Node.<br />
                    <span className="gradient-text">Encrypted routing, anywhere.</span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The Liberty Reticulum Node is a purpose-built hardware device that runs the Reticulum encrypted routing layer on top of the Meshtastic mesh transport. It sits between your wallet and the world — handling cryptographic identity, end-to-end encryption, and intelligent routing across internet, mesh, and radio simultaneously.
                  </p>
                  <ul className="space-y-2.5 text-sm">
                    {[
                      "Cryptographic identity — your wallet is your address",
                      "End-to-end encrypted across every transport type",
                      "Routes seamlessly between internet, LoRa mesh, and radio",
                      "Compact form factor — fits in a pocket, deploys anywhere",
                      "Premium retail packaging + ruggedized carry case included",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        <span className="text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    className="group self-start mt-2"
                    data-testid="button-reticulum-waitlist"
                    onClick={() => document.getElementById("waitlist-section")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Join the Device Waitlist
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.section>

          {/* Final CTA */}
          <section className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              A blockchain that doesn't just scale —<br />
              <span className="gradient-text">it survives.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Liberty is in Testnet. Join the network today and be part of building the most resilient blockchain ever created.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" data-testid="button-join-network-bottom" asChild>
                <Link href="/validators">
                  Join Testnet
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-docs-bottom" asChild>
                <Link href="/documentation">Read the Documentation</Link>
              </Button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
