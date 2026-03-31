import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageCircle } from "lucide-react";
import logoImage from "@assets/Asset 6_1763440187916.png";
import { CalloutBadge } from "./CalloutBadge";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const links = {
  product: [
    { label: "Performance", href: "#performance" },
    { label: "Technology", href: "#technology" },
    { label: "Network", href: "#network" },
    { label: "Ecosystem", href: "#ecosystem" },
  ],
  developers: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Tutorials", href: "#" },
  ],
  community: [
    { label: "Discord", href: "#" },
    { label: "Twitter", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Events", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

function FooterAccordion({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 md:border-none">
      {/* Mobile: accordion toggle */}
      <button
        className="md:hidden flex items-center justify-between w-full py-3 text-sm font-bold uppercase tracking-wider"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {/* Desktop: always visible heading */}
      <h3 className="hidden md:block text-sm font-bold uppercase tracking-wider mb-4">{title}</h3>
      {/* Links */}
      <ul
        className={`space-y-3 overflow-hidden transition-all duration-200 ${
          open ? "max-h-60 pb-3" : "max-h-0 md:max-h-none"
        }`}
      >
        {items.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-card/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 w-full">

        {/* Brand row — always full width on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-10">
          <div className="space-y-3">
            <div className="flex items-center" data-testid="logo-footer">
              <img src={logoImage} alt="Liberty Chain" className="h-8 sm:h-10 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs" data-testid="text-footer-tagline">
              The high-performance EVM blockchain built for scale.
            </p>
            <CalloutBadge
              text="Not Your Keys, Not Your Liberty"
              size="sm"
              data-testid="badge-footer-liberty"
            />
          </div>
          {/* Social icons — right side on sm+, inline on mobile */}
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" data-testid="button-social-twitter">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-social-github">
              <Github className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-social-discord">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Link columns — accordion on mobile, 4-col grid on desktop */}
        <div className="md:grid md:grid-cols-4 md:gap-8 mb-6 sm:mb-10 border-t border-border/30 md:border-none pt-2 md:pt-0">
          <FooterAccordion title="Product" items={links.product} />
          <FooterAccordion title="Developers" items={links.developers} />
          <FooterAccordion title="Community" items={links.community} />
          <FooterAccordion title="Company" items={links.company} />
        </div>

        {/* Bottom bar */}
        <div className="pt-4 sm:pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-copyright">
            © 2025 Liberty Chain. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy-policy">
              Privacy Policy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-cookies">
              Cookies
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
