import { Link, useLocation } from "wouter";
import {
  ShieldCheck,
  Calendar,
  Radio,
  Rocket,
  Users,
  Mail,
  PenLine,
  Share2,
  Send,
  Zap,
  LayoutDashboard,
  Map,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Waitlist", href: "/admin/waitlist", icon: Radio },
  { label: "Accelerator", href: "/admin/accelerator", icon: Rocket },
  { label: "Contacts", href: "/admin/contacts", icon: Users },
  { label: "Email Settings", href: "/admin/settings", icon: Mail },
  { label: "Content Editor", href: "/admin/cms", icon: PenLine },
  { label: "Socials & Press", href: "/admin/socials", icon: Share2 },
  { label: "Campaigns", href: "/admin/campaigns", icon: Send },
  { label: "Autoresponders", href: "/admin/autoresponders", icon: Zap },
  { label: "Roadmap", href: "/admin/roadmap", icon: Map },
];

export function AdminSideNav() {
  const [location] = useLocation();

  function isActive(href: string, exact?: boolean) {
    if (exact) return location === href;
    return location === href || location.startsWith(href + "/");
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-card border-r border-border z-40 flex flex-col pt-20 pb-6 overflow-y-auto">
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`sidenav-${item.href.replace("/admin/", "").replace("/admin", "dashboard")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover-elevate"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-4 border-t border-border mt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover-elevate"
          data-testid="sidenav-back-to-site"
        >
          <span>← Back to site</span>
        </Link>
      </div>
    </aside>
  );
}
