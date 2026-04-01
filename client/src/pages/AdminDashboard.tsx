import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ShieldCheck,
  Calendar,
  Users,
  ArrowRight,
  Radio,
  Rocket,
  Mail,
  PenLine,
  Share2,
  Send,
  Zap,
} from "lucide-react";
import type { Event, WaitlistEntry, AcceleratorApplication, SocialLink, Partner, PressArticle, EmailCampaign, Autoresponder } from "@shared/schema";

interface EmailSettings { hasApiKey: boolean; fromEmail: string; fromName: string; }
interface Contact { id: string; name: string; email: string; source: string; }

export default function AdminDashboard() {
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: waitlist = [] } = useQuery<WaitlistEntry[]>({ queryKey: ["/api/waitlist"] });
  const { data: acceleratorApps = [] } = useQuery<AcceleratorApplication[]>({ queryKey: ["/api/accelerator"] });
  const { data: emailSettings } = useQuery<EmailSettings>({ queryKey: ["/api/admin/email-settings"] });
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/admin/contacts"] });
  const { data: socials = [] } = useQuery<SocialLink[]>({ queryKey: ["/api/socials"] });
  const { data: partners = [] } = useQuery<Partner[]>({ queryKey: ["/api/partners"] });
  const { data: pressArticles = [] } = useQuery<PressArticle[]>({ queryKey: ["/api/press"] });
  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({ queryKey: ["/api/campaigns"] });
  const { data: autoresponders = [] } = useQuery<Autoresponder[]>({ queryKey: ["/api/autoresponders"] });

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).length;
  const totalEvents = events.length;

  const today = new Date().toISOString().slice(0, 10);
  const waitlistToday = waitlist.filter(
    (w) => w.createdAt && String(w.createdAt).slice(0, 10) === today
  ).length;

  const accPending = acceleratorApps.filter((a) => !["accepted", "rejected"].includes(a.pipelineStage)).length;

  const sections = [
    {
      icon: Calendar,
      title: "Events",
      description: "Add, edit, or remove Liberty Chain events shown on the public Events page.",
      href: "/admin/events",
      stats: [
        { label: "Total events", value: totalEvents },
        { label: "Upcoming", value: upcomingEvents },
      ],
      badge: totalEvents > 0 ? `${totalEvents} events` : "No events",
      testId: "card-admin-events",
    },
    {
      icon: Radio,
      title: "Mesh Device Waitlist",
      description: "View and manage signups for Liberty Mesh Devices. Export to CSV anytime.",
      href: "/admin/waitlist",
      stats: [
        { label: "Total signups", value: waitlist.length },
        { label: "Signed up today", value: waitlistToday },
      ],
      badge: waitlist.length > 0 ? `${waitlist.length} signups` : "No signups",
      testId: "card-admin-waitlist",
    },
    {
      icon: Rocket,
      title: "Accelerator Applications",
      description: "Review and manage Liberty Accelerator applications through the pipeline.",
      href: "/admin/accelerator",
      stats: [
        { label: "Total applications", value: acceleratorApps.length },
        { label: "Pending review", value: accPending },
      ],
      badge: acceleratorApps.length > 0 ? `${acceleratorApps.length} applications` : "No applications",
      testId: "card-admin-accelerator",
    },
    {
      icon: Users,
      title: "Contact Database",
      description: "Unified email database across all sources — waitlist, accelerator, and more.",
      href: "/admin/contacts",
      stats: [
        { label: "Total contacts", value: contacts.length },
        { label: "Waitlist", value: contacts.filter((c) => c.source === "waitlist").length },
      ],
      badge: contacts.length > 0 ? `${contacts.length} contacts` : "No contacts",
      testId: "card-admin-contacts",
    },
    {
      icon: Mail,
      title: "App Settings",
      description: "Configure Resend email API, PostgreSQL database credentials, branding, and email templates.",
      href: "/admin/settings",
      stats: [
        { label: "Status", value: emailSettings?.hasApiKey ? "Active" : "Not set" },
        { label: "Templates", value: 3 },
      ],
      badge: emailSettings?.hasApiKey ? "Connected" : "Setup required",
      testId: "card-admin-settings",
    },
    {
      icon: PenLine,
      title: "Content Editor",
      description: "Edit headlines, subtitles, and badge text across all public pages with a live preview.",
      href: "/admin/cms",
      stats: [
        { label: "Editable pages", value: 6 },
        { label: "Content sections", value: 9 },
      ],
      badge: "Live preview",
      testId: "card-admin-cms",
    },
    {
      icon: Share2,
      title: "Socials, Partners & Press",
      description: "Manage social media links (applied site-wide), partner logos, and press article coverage.",
      href: "/admin/socials",
      stats: [
        { label: "Social channels", value: socials.length },
        { label: "Press articles", value: pressArticles.length },
      ],
      badge: `${partners.length} partners`,
      testId: "card-admin-socials",
    },
    {
      icon: Send,
      title: "Email Campaigns",
      description: "Create and send email campaigns with a drag-and-drop editor, open & click tracking, and audience segmentation.",
      href: "/admin/campaigns",
      stats: [
        { label: "Campaigns", value: campaigns.length },
        { label: "Sent", value: campaigns.filter((c) => c.status === "sent").length },
      ],
      badge: campaigns.filter(c => c.status === "sent").length > 0 ? `${campaigns.filter(c=>c.status==="sent").length} sent` : "No campaigns yet",
      testId: "card-admin-campaigns",
    },
    {
      icon: Zap,
      title: "Autoresponders",
      description: "Set up automated emails triggered by user actions like signups, accelerator applications, or event registrations.",
      href: "/admin/autoresponders",
      stats: [
        { label: "Active", value: autoresponders.filter((a) => a.active).length },
        { label: "Total sent", value: autoresponders.reduce((s, a) => s + a.sentCount, 0) },
      ],
      badge: autoresponders.filter(a => a.active).length > 0 ? `${autoresponders.filter(a=>a.active).length} active` : "None configured",
      testId: "card-admin-autoresponders",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-5xl 2xl:max-w-[1100px] mx-auto px-4 sm:px-8">

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">
                Admin
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
              data-testid="heading-admin-dashboard"
            >
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage content across the Liberty Chain website.
            </p>
          </div>

          {/* Section Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.href}
                  className="rounded-2xl p-8 flex flex-col gap-6"
                  data-testid={section.testId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {section.badge}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-black tracking-tight">{section.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {section.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-muted/40 rounded-xl p-3 text-center"
                      >
                        <div className="text-2xl font-black text-primary">{s.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full group" data-testid={`button-goto-${section.href.replace("/admin/", "")}`} asChild>
                    <Link href={section.href}>
                      Manage {section.title}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-12">
            Admin area — for internal use only. All data is stored in server memory and resets on restart.
          </p>
        </div>
      </main>
    </div>
  );
}
