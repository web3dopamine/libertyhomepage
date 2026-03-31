import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface EmailSettings {
  hasApiKey: boolean;
  fromEmail: string;
  fromName: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const { data: settings, isLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/email-settings"],
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
    if (!Object.keys(body).length) {
      toast({ title: "Nothing to save", description: "Fill in at least one field to update.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(body);
  }

  const templates = [
    {
      name: "Waitlist Confirmation",
      trigger: "When someone joins the waitlist",
      subject: "You're on the Liberty Chain Waitlist",
      preview: "Hi [Name], welcome to the Liberty Chain waitlist. You'll be among the first to gain access...",
    },
    {
      name: "Accelerator Application Received",
      trigger: "When an accelerator application is submitted",
      subject: "Liberty Chain Accelerator — Application Received",
      preview: "Hi [Name], we've received your application for [Project]. Our team will review it within 5–7 days...",
    },
    {
      name: "Accelerator Stage Update",
      trigger: "When an application moves to a new pipeline stage",
      subject: "Liberty Chain Accelerator — Application Update",
      preview: "Hi [Name], there's an update on your application for [Project]...",
    },
  ];

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
            <p className="text-sm text-muted-foreground">Configure Resend to send automated emails</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
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
                ? <Badge className="gap-1.5" data-testid="badge-api-status-connected"><CheckCircle2 className="w-3 h-3" />Connected</Badge>
                : <Badge variant="outline" className="gap-1.5 text-muted-foreground" data-testid="badge-api-status-disconnected"><XCircle className="w-3 h-3" />Not configured</Badge>
            )}
          </div>
        </div>

        {/* Credentials Form */}
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

          <div className="space-y-4">
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
          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full"
            data-testid="button-save-settings"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </div>

        {/* Test Connection */}
        <div className="rounded-xl border border-border p-6 mb-8 space-y-4">
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

        {/* Email Templates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-primary">Automated Email Templates</h2>
          </div>
          <div className="space-y-3">
            {templates.map((tpl) => (
              <div key={tpl.name} className="rounded-xl border border-border p-4" data-testid={`card-template-${tpl.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tpl.trigger}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0 text-green-400 border-green-400/30">
                    Auto-send
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2.5 mt-2">
                  <p className="text-xs text-muted-foreground font-mono">Subject: {tpl.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tpl.preview}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Templates are sent automatically when their trigger condition is met. Emails are only sent if an API key is configured.
          </p>
        </div>
      </div>
    </div>
  );
}
