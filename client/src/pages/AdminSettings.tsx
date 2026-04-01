import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Mail,
  Key,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Send,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Zap,
  Palette,
  Monitor,
  Twitter,
  MessageSquare,
  Github,
  RefreshCw,
} from "lucide-react";

interface EmailSettings {
  hasApiKey: boolean;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
}

interface EmailBranding {
  logoText: string;
  tagline: string;
  twitterUrl: string;
  discordUrl: string;
  githubUrl: string;
  footerText: string;
}

const TEMPLATES = [
  {
    id: "waitlist",
    name: "Waitlist Confirmation",
    trigger: "When someone joins the waitlist",
    subject: "You're on the Liberty Chain Waitlist",
    badge: "Auto-send",
  },
  {
    id: "accelerator-received",
    name: "Accelerator — Application Received",
    trigger: "When an accelerator application is submitted",
    subject: "Liberty Chain Accelerator — Application Received",
    badge: "Auto-send",
  },
  {
    id: "accelerator-update",
    name: "Accelerator — Stage Update",
    trigger: "When an application moves to a new pipeline stage",
    subject: "Liberty Chain Accelerator — Application Update",
    badge: "Auto-send",
  },
  {
    id: "testnet-invite",
    name: "Testnet Access Invitation",
    trigger: "When granting early testnet access to a waitlist member",
    subject: "Your Liberty Chain Testnet Access is Ready",
    badge: "Manual",
  },
  {
    id: "event-confirmation",
    name: "Event Registration Confirmation",
    trigger: "When someone registers for a Liberty Chain event",
    subject: "Event Registration Confirmed — [Event Name]",
    badge: "Auto-send",
  },
  {
    id: "announcement",
    name: "General Announcement",
    trigger: "Manual send to all contacts",
    subject: "Custom subject",
    badge: "Manual",
  },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // API credentials state
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Branding state
  const [brandingDraft, setBrandingDraft] = useState<Partial<EmailBranding>>({});

  // Preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; name: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: settings, isLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/email-settings"],
    select: (data: any) => data,
  });

  // Populate adminEmail field from loaded settings
  useEffect(() => {
    if (settings?.adminEmail !== undefined) setAdminEmail(settings.adminEmail);
  }, [settings?.adminEmail]);

  const { data: branding, isLoading: brandingLoading } = useQuery<EmailBranding>({
    queryKey: ["/api/admin/email-branding"],
    select: (data: any) => data,
  });

  const saveMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/email-settings", body),
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Email configuration updated." });
      qc.invalidateQueries({ queryKey: ["/api/admin/email-settings"] });
      setApiKey("");
    },
    onError: () => {
      toast({ title: "Save failed", description: "Check your input and try again.", variant: "destructive" });
    },
  });

  const brandingMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/email-branding", body),
    onSuccess: () => {
      toast({ title: "Branding saved", description: "Email header & footer updated." });
      qc.invalidateQueries({ queryKey: ["/api/admin/email-branding"] });
      setBrandingDraft({});
    },
    onError: () => {
      toast({ title: "Save failed", description: "Check your input and try again.", variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: (toEmail: string) => apiRequest("POST", "/api/admin/test-email", { toEmail }),
    onSuccess: async (res: any) => {
      const data = await res.json();
      if (data.success) {
        toast({ title: "Test email sent!", description: `Check your inbox at ${testEmail}.` });
      } else {
        toast({ title: "Test failed", description: data.error || "Unknown error.", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Test failed", description: "Could not send test email.", variant: "destructive" });
    },
  });

  function handleSave() {
    const body: Record<string, string> = {};
    if (apiKey.trim()) body.apiKey = apiKey.trim();
    if (fromEmail.trim()) body.fromEmail = fromEmail.trim();
    if (fromName.trim()) body.fromName = fromName.trim();
    body.adminEmail = adminEmail.trim(); // always include (can be cleared)
    if (!apiKey.trim() && !fromEmail.trim() && !fromName.trim() && adminEmail === (settings?.adminEmail ?? "")) {
      toast({ title: "Nothing to save", description: "Fill in at least one field to update.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(body);
  }

  function handleSaveBranding() {
    if (!Object.keys(brandingDraft).length) {
      toast({ title: "Nothing to save", description: "Edit a field first.", variant: "destructive" });
      return;
    }
    brandingMutation.mutate(brandingDraft);
  }

  async function openPreview(templateId: string, name: string) {
    setPreviewTemplate({ id: templateId, name });
    setPreviewHtml(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/email-preview/${templateId}`);
      if (!res.ok) throw new Error("Not found");
      const html = await res.text();
      setPreviewHtml(html);
    } catch {
      toast({ title: "Preview failed", description: "Could not load template preview.", variant: "destructive" });
      setPreviewTemplate(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function refreshPreview() {
    if (!previewTemplate) return;
    setPreviewLoading(true);
    setPreviewHtml(null);
    try {
      const res = await fetch(`/api/admin/email-preview/${previewTemplate.id}`);
      const html = await res.text();
      setPreviewHtml(html);
    } catch {
      toast({ title: "Refresh failed", variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  }

  const brandingField = (key: keyof EmailBranding) =>
    brandingDraft[key] !== undefined ? brandingDraft[key] : branding?.[key] ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-28">

        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2" data-testid="button-back-dashboard">
          <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" />Dashboard</Link>
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight" data-testid="heading-settings">Email Settings</h1>
            <p className="text-sm text-muted-foreground">Configure Resend, design email branding, and preview templates</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Resend Integration</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLoading ? "Checking..." : settings?.hasApiKey
                    ? `Sending from ${settings.fromName} <${settings.fromEmail}>`
                    : "No API key configured"}
                </p>
              </div>
            </div>
            {!isLoading && (
              settings?.hasApiKey
                ? <Badge className="gap-1.5 shrink-0" data-testid="badge-api-status-connected"><CheckCircle2 className="w-3 h-3" />Connected</Badge>
                : <Badge variant="outline" className="gap-1.5 text-muted-foreground shrink-0" data-testid="badge-api-status-disconnected"><XCircle className="w-3 h-3" />Not configured</Badge>
            )}
          </div>
        </div>

        {/* ─── API Credentials ─────────────────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">API Credentials</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Get your API key from{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              resend.com/api-keys <ExternalLink className="w-3 h-3" />
            </a>
          </p>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Resend API Key</label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={settings?.hasApiKey ? "••••••••••••••• (saved)" : "re_xxxxxxxxxxxxxxxx"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-sm"
                data-testid="input-api-key"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-toggle-key-visibility"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From Email</label>
              <Input
                type="email"
                placeholder={settings?.fromEmail || "noreply@libertychain.org"}
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="text-sm"
                data-testid="input-from-email"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From Name</label>
              <Input
                type="text"
                placeholder={settings?.fromName || "Liberty Chain"}
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="text-sm"
                data-testid="input-from-name"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Admin Notification Email
              <span className="ml-2 text-[10px] font-normal text-muted-foreground/60">receives roadmap deadline reminders</span>
            </label>
            <Input
              type="email"
              placeholder="admin@libertychain.org"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="text-sm"
              data-testid="input-admin-email"
            />
          </div>

          <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full" data-testid="button-save-settings">
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </div>

        {/* ─── Test Connection ──────────────────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Test Connection</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">Send a test email to verify your configuration is working.</p>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="text-sm"
              data-testid="input-test-email"
            />
            <Button
              variant="outline"
              onClick={() => testEmail && testMutation.mutate(testEmail)}
              disabled={!testEmail || testMutation.isPending || !settings?.hasApiKey}
              className="flex-shrink-0"
              data-testid="button-send-test"
            >
              {testMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Send className="w-4 h-4 mr-2" />Send Test</>
              }
            </Button>
          </div>
          {!settings?.hasApiKey && (
            <p className="text-xs text-muted-foreground">Save a valid API key first to enable testing.</p>
          )}
        </div>

        {/* ─── Header & Footer Branding ─────────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Email Header & Footer</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Customize the branded header and footer shown on all outgoing emails.
          </p>

          {brandingLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading branding settings…
            </div>
          ) : (
            <>
              {/* Header fields */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Header</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Logo Text</label>
                    <Input
                      value={brandingField("logoText") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, logoText: e.target.value }))}
                      placeholder="LIBERTY CHAIN"
                      className="text-sm font-semibold"
                      data-testid="input-branding-logo"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tagline</label>
                    <Input
                      value={brandingField("tagline") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, tagline: e.target.value }))}
                      placeholder="Built for Freedom · Zero Gas · 10,000+ TPS"
                      className="text-sm"
                      data-testid="input-branding-tagline"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Footer fields */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Footer</p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                      <Twitter className="w-3 h-3" /> Twitter / X URL
                    </label>
                    <Input
                      value={brandingField("twitterUrl") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, twitterUrl: e.target.value }))}
                      placeholder="https://twitter.com/libertychain"
                      className="text-sm"
                      data-testid="input-branding-twitter"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                      <MessageSquare className="w-3 h-3" /> Discord URL
                    </label>
                    <Input
                      value={brandingField("discordUrl") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, discordUrl: e.target.value }))}
                      placeholder="https://discord.gg/libertychain"
                      className="text-sm"
                      data-testid="input-branding-discord"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                      <Github className="w-3 h-3" /> GitHub URL
                    </label>
                    <Input
                      value={brandingField("githubUrl") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, githubUrl: e.target.value }))}
                      placeholder="https://github.com/liberty-chain"
                      className="text-sm"
                      data-testid="input-branding-github"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Footer Note</label>
                    <Input
                      value={brandingField("footerText") as string}
                      onChange={(e) => setBrandingDraft((d) => ({ ...d, footerText: e.target.value }))}
                      placeholder="You received this email because you signed up for Liberty Chain updates."
                      className="text-sm"
                      data-testid="input-branding-footer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveBranding}
                  disabled={brandingMutation.isPending || !Object.keys(brandingDraft).length}
                  className="flex-1"
                  data-testid="button-save-branding"
                >
                  {brandingMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Branding
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openPreview("test", "Test Email")}
                  data-testid="button-preview-branding"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ─── Email Templates ──────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Automated Email Templates</h2>
          </div>
          <div className="space-y-3">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border border-border p-4"
                data-testid={`card-template-${tpl.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tpl.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${tpl.badge === "Auto-send" ? "text-green-400 border-green-400/30" : "text-amber-400 border-amber-400/30"}`}
                    >
                      {tpl.badge}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPreview(tpl.id, tpl.name)}
                      data-testid={`button-preview-${tpl.id}`}
                    >
                      <Monitor className="w-3.5 h-3.5 mr-1.5" />
                      Preview
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg px-3 py-2.5 mt-2">
                  <p className="text-xs text-muted-foreground font-mono truncate">Subject: {tpl.subject}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Templates are sent automatically when their trigger condition is met. Emails are only sent if an API key is configured.
          </p>
        </div>

      </div>

      {/* ─── Preview Modal ────────────────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden" aria-describedby={undefined} data-testid="dialog-email-preview">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold truncate">
                {previewTemplate?.name ?? "Email Preview"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Live render with current branding</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={previewLoading}
              className="flex-shrink-0"
              data-testid="button-refresh-preview"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${previewLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </DialogHeader>

          <div className="relative bg-muted/20" style={{ height: "70vh" }}>
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Rendering template…</p>
                </div>
              </div>
            )}
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                title={`Preview: ${previewTemplate?.name}`}
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
                data-testid="iframe-email-preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
