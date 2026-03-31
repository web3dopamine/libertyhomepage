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
} from "lucide-react";
import type { Event, WaitlistEntry, AcceleratorApplication } from "@shared/schema";

export default function AdminDashboard() {
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: waitlist = [] } = useQuery<WaitlistEntry[]>({ queryKey: ["/api/waitlist"] });
  const { data: acceleratorApps = [] } = useQuery<AcceleratorApplication[]>({ queryKey: ["/api/accelerator"] });

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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-8">

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
