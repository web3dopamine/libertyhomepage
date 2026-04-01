import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Database,
  ServerCrash,
  Server,
  ShieldCheck,
  Link2,
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

interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  hasPassword: boolean;
  ssl: boolean;
  connectionString: string;
  isConfigured: boolean;
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

  // ── Resend state ─────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // ── PostgreSQL state ──────────────────────────
  const [dbMode, setDbMode] = useState<"fields" | "string">("fields");
  const [dbHost, setDbHost] = useState("");
  const [dbPort, setDbPort] = useState("5432");
  const [dbName, setDbName] = useState("");
  const [dbUser, setDbUser] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [dbSsl, setDbSsl] = useState(false);
  const [dbConnectionString, setDbConnectionString] = useState("");
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; version?: string } | null>(null);

  // ── Branding state ────────────────────────────
  const [brandingDraft, setBrandingDraft] = useState<Partial<EmailBranding>>({});

  // Preview modal
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; name: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: settings, isLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/email-settings"],
    select: (data: any) => data,
  });

  useEffect(() => {
    if (settings?.adminEmail !== undefined) setAdminEmail(settings.adminEmail);
  }, [settings?.adminEmail]);

  const { data: branding, isLoading: brandingLoading } = useQuery<EmailBranding>({
    queryKey: ["/api/admin/email-branding"],
    select: (data: any) => data,
  });

  const { data: dbConfig, isLoading: dbLoading } = useQuery<DbConfig>({
    queryKey: ["/api/admin/db-settings"],
    select: (data: any) => data,
  });

  // Populate DB fields from loaded config
  useEffect(() => {
    if (dbConfig) {
      if (dbConfig.connectionString) {
        setDbConnectionString(dbConfig.connectionString);
        setDbMode("string");
      } else {
        setDbHost(dbConfig.host || "");
        setDbPort(String(dbConfig.port || 5432));
        setDbName(dbConfig.database || "");
        setDbUser(dbConfig.user || "");
        setDbSsl(dbConfig.ssl || false);
        setDbMode("fields");
      }
    }
  }, [dbConfig]);

  // ── Email save ────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/email-settings", body),
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Email configuration updated." });
      qc.invalidateQueries({ queryKey: ["/api/admin/email-settings"] });
      setApiKey("");
    },
    onError: () => toast({ title: "Save failed", description: "Check your input and try again.", variant: "destructive" }),
  });

  // ── DB save ────────────────────────────────────
  const dbSaveMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/db-settings", body),
    onSuccess: () => {
      toast({ title: "Database settings saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/db-settings"] });
      setDbPassword("");
    },
    onError: () => toast({ title: "Save failed", description: "Check your input and try again.", variant: "destructive" }),
  });

  // ── DB test ────────────────────────────────────
  const dbTestMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/test-db", {}),
    onSuccess: async (res: any) => {
      const data = await res.json();
      setDbTestResult(data);
      if (data.success) toast({ title: "Connection successful", description: data.version });
      else toast({ title: "Connection failed", description: data.message, variant: "destructive" });
    },
    onError: () => toast({ title: "Test failed", variant: "destructive" }),
  });

  // ── Branding save ──────────────────────────────
  const brandingMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/email-branding", body),
    onSuccess: () => {
      toast({ title: "Branding saved", description: "Email header & footer updated." });
      qc.invalidateQueries({ queryKey: ["/api/admin/email-branding"] });
      setBrandingDraft({});
    },
    onError: () => toast({ title: "Save failed", description: "Check your input and try again.", variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: (toEmail: string) => apiRequest("POST", "/api/admin/test-email", { toEmail }),
    onSuccess: async (res: any) => {
      const data = await res.json();
      if (data.success) toast({ title: "Test email sent!", description: `Check your inbox at ${testEmail}.` });
      else toast({ title: "Test failed", description: data.error || "Unknown error.", variant: "destructive" });
    },
    onError: () => toast({ title: "Test failed", description: "Could not send test email.", variant: "destructive" }),
  });

  function handleSave() {
    const body: Record<string, string> = {};
    if (apiKey.trim()) body.apiKey = apiKey.trim();
    if (fromEmail.trim()) body.fromEmail = fromEmail.trim();
    if (fromName.trim()) body.fromName = fromName.trim();
    body.adminEmail = adminEmail.trim();
    if (!apiKey.trim() && !fromEmail.trim() && !fromName.trim() && adminEmail === (settings?.adminEmail ?? "")) {
      toast({ title: "Nothing to save", description: "Fill in at least one field to update.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(body);
  }

  function handleDbSave() {
    const body: Record<string, unknown> = { ssl: dbSsl };
    if (dbMode === "string") {
      if (!dbConnectionString.trim()) {
        toast({ title: "Nothing to save", description: "Enter a connection string.", variant: "destructive" });
        return;
      }
      body.connectionString = dbConnectionString.trim();
      body.host = ""; body.database = ""; body.user = ""; body.password = "";
    } else {
      if (!dbHost.trim() && !dbName.trim() && !dbUser.trim() && !dbPassword.trim()) {
        toast({ title: "Nothing to save", description: "Fill in at least one field.", variant: "destructive" });
        return;
      }
      if (dbHost.trim()) body.host = dbHost.trim();
      if (dbPort.trim()) body.port = parseInt(dbPort, 10) || 5432;
      if (dbName.trim()) body.database = dbName.trim();
      if (dbUser.trim()) body.user = dbUser.trim();
      if (dbPassword.trim()) body.password = dbPassword.trim();
      body.connectionString = "";
    }
    dbSaveMutation.mutate(body);
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
            <h1 className="text-2xl font-black tracking-tight" data-testid="heading-settings">App Settings</h1>
            <p className="text-sm text-muted-foreground">Configure email, database, and branding</p>
          </div>
        </div>

        {/* ─── Status row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Resend status */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Resend Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isLoading ? "Checking…" : settings?.hasApiKey
                      ? `${settings.fromName} <${settings.fromEmail}>`
                      : "Not configured"}
                  </p>
                </div>
              </div>
              {!isLoading && (
                settings?.hasApiKey
                  ? <Badge className="gap-1 shrink-0" data-testid="badge-api-status-connected"><CheckCircle2 className="w-3 h-3" />Active</Badge>
                  : <Badge variant="outline" className="gap-1 text-muted-foreground shrink-0" data-testid="badge-api-status-disconnected"><XCircle className="w-3 h-3" />Off</Badge>
              )}
            </div>
          </div>

          {/* PostgreSQL status */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">PostgreSQL</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dbLoading ? "Checking…" : dbConfig?.isConfigured
                      ? dbConfig.connectionString
                        ? "Connection string set"
                        : `${dbConfig.user}@${dbConfig.host}/${dbConfig.database}`
                      : "Not configured"}
                  </p>
                </div>
              </div>
              {!dbLoading && (
                dbConfig?.isConfigured
                  ? <Badge className="gap-1 shrink-0 bg-emerald-500/20 text-emerald-400 border-emerald-500/30" data-testid="badge-db-status-configured"><CheckCircle2 className="w-3 h-3" />Set</Badge>
                  : <Badge variant="outline" className="gap-1 text-muted-foreground shrink-0" data-testid="badge-db-status-unconfigured"><XCircle className="w-3 h-3" />Off</Badge>
              )}
            </div>
          </div>
        </div>

        {/* ─── Resend API Credentials ─────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Resend — Email API</h2>
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
            Save Resend Configuration
          </Button>
        </div>

        {/* ─── PostgreSQL Credentials ──────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">PostgreSQL Database</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Configure your PostgreSQL connection. Credentials are stored in memory for this session — add them to environment variables for persistence.
          </p>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setDbMode("fields")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dbMode === "fields" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              data-testid="tab-db-fields"
            >
              Individual Fields
            </button>
            <button
              type="button"
              onClick={() => setDbMode("string")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dbMode === "string" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              data-testid="tab-db-string"
            >
              Connection String
            </button>
          </div>

          {dbMode === "string" ? (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                <Link2 className="w-3.5 h-3.5" /> Connection String
              </label>
              <Input
                type="text"
                placeholder="postgresql://user:password@host:5432/database?sslmode=require"
                value={dbConnectionString}
                onChange={(e) => setDbConnectionString(e.target.value)}
                className="font-mono text-sm"
                data-testid="input-db-connection-string"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Supports standard PostgreSQL connection strings (postgres:// or postgresql://).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                    <Server className="w-3 h-3" /> Host
                  </label>
                  <Input
                    placeholder={dbConfig?.host || "db.example.com"}
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    className="text-sm"
                    data-testid="input-db-host"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Port</label>
                  <Input
                    placeholder="5432"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    className="text-sm"
                    data-testid="input-db-port"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Database Name</label>
                <Input
                  placeholder={dbConfig?.database || "liberty_chain"}
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="text-sm"
                  data-testid="input-db-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Username</label>
                  <Input
                    placeholder={dbConfig?.user || "postgres"}
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="text-sm"
                    data-testid="input-db-user"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showDbPassword ? "text" : "password"}
                      placeholder={dbConfig?.hasPassword ? "•••••••• (saved)" : "••••••••"}
                      value={dbPassword}
                      onChange={(e) => setDbPassword(e.target.value)}
                      className="pr-10 text-sm"
                      data-testid="input-db-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDbPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-db-password"
                    >
                      {showDbPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/40 border border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="ssl-toggle">
                    Require SSL / TLS
                  </Label>
                </div>
                <Switch
                  id="ssl-toggle"
                  checked={dbSsl}
                  onCheckedChange={setDbSsl}
                  data-testid="switch-db-ssl"
                />
              </div>
            </div>
          )}

          {/* Test result banner */}
          {dbTestResult && (
            <div className={`rounded-md border p-3 flex items-start gap-3 ${dbTestResult.success ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"}`} data-testid="banner-db-test-result">
              {dbTestResult.success
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                : <ServerCrash className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-xs font-semibold ${dbTestResult.success ? "text-emerald-300" : "text-destructive"}`}>
                  {dbTestResult.success ? "Connection successful" : "Connection failed"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dbTestResult.version || dbTestResult.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleDbSave}
              disabled={dbSaveMutation.isPending}
              className="flex-1"
              data-testid="button-save-db"
            >
              {dbSaveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save DB Configuration
            </Button>
            <Button
              variant="outline"
              onClick={() => { setDbTestResult(null); dbTestMutation.mutate(); }}
              disabled={dbTestMutation.isPending || !dbConfig?.isConfigured}
              className="flex-shrink-0 gap-2"
              data-testid="button-test-db"
            >
              {dbTestMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Zap className="w-4 h-4" />
              }
              Test Connection
            </Button>
          </div>

          {/* Env variable tip */}
          <div className="rounded-md bg-muted/40 border border-border p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Recommended: Use environment variables</p>
            <p className="text-xs text-muted-foreground">
              For persistent configuration, set these in your project secrets:{" "}
              <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">DATABASE_URL</code> or{" "}
              <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">PGHOST</code>{" / "}
              <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">PGDATABASE</code>{" / "}
              <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">PGUSER</code>{" / "}
              <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">PGPASSWORD</code>.
            </p>
          </div>
        </div>

        {/* ─── Test Email Connection ────────────────────────── */}
        <div className="rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Test Email</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">Send a test email to verify your Resend configuration is working.</p>
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
            <p className="text-xs text-muted-foreground">Save a valid Resend API key first to enable testing.</p>
          )}
        </div>

        {/* ─── Header & Footer Branding ──────────────────────── */}
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

        {/* ─── Email Templates ───────────────────────────────── */}
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
            Templates are sent automatically when their trigger condition is met. Emails are only sent if a Resend API key is configured.
          </p>
        </div>

      </div>

      {/* ─── Preview Modal ─────────────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden" aria-describedby={undefined} data-testid="dialog-email-preview">
          <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {previewTemplate?.name ?? "Preview"}
            </DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={refreshPreview}
              disabled={previewLoading}
              className="flex-shrink-0"
              data-testid="button-refresh-preview"
            >
              <RefreshCw className={`w-4 h-4 ${previewLoading ? "animate-spin" : ""}`} />
            </Button>
          </DialogHeader>
          <div className="h-[70vh] w-full overflow-hidden bg-white">
            {previewLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
                data-testid="iframe-email-preview"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
