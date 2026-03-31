import { Button } from "@/components/ui/button";
import { Github, MessageCircle } from "lucide-react";
import { SiX } from "react-icons/si";
import logoImage from "@assets/Asset 6_1763440187916.png";
import { CalloutBadge } from "./CalloutBadge";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "wouter";

type FooterLink = { label: string; href: string; external?: boolean };

const links: Record<string, FooterLink[]> = {
  product: [
    { label: "Performance", href: "/" },
    { label: "Technology", href: "/" },
    { label: "Network", href: "/" },
    { label: "Ecosystem", href: "/ecosystem" },
  ],
  developers: [
    { label: "Documentation", href: "/documentation" },
    { label: "API Reference", href: "/documentation" },
    { label: "GitHub", href: "https://github.com/liberty-chain", external: true },
    { label: "Tutorials", href: "/documentation" },
  ],
  community: [
    { label: "Discord", href: "https://discord.gg/libertychain", external: true },
    { label: "Twitter", href: "https://twitter.com/libertychain", external: true },
    { label: "Blog", href: "/blog" },
    { label: "Events", href: "/events" },
  ],
  company: [
    { label: "About", href: "/liberty-foundation" },
    { label: "Careers", href: "#" },
    { label: "Press Kit", href: "/branding-media-kit" },
    { label: "Contact", href: "#" },
  ],
};

function FooterLink({ link }: { link: FooterLink }) {
  const cls = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  const testId = `link-footer-${link.label.toLowerCase().replace(/\s+/g, "-")}`;
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls} data-testid={testId}>
        {link.label}
      </a>
    );
  }
  if (link.href === "#") {
    return (
      <a href={link.href} className={cls} data-testid={testId}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls} data-testid={testId}>
      {link.label}
    </Link>
  );
}

function FooterAccordion({
  title,
  items,
}: {
  title: string;
  items: FooterLink[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 md:border-none">
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
      <h3 className="hidden md:block text-sm font-bold uppercase tracking-wider mb-4">{title}</h3>
      <ul
        className={`space-y-3 overflow-hidden transition-all duration-200 ${
          open ? "max-h-60 pb-3" : "max-h-0 md:max-h-none"
        }`}
      >
        {items.map((link) => (
          <li key={link.label}>
            <FooterLink link={link} />
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

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-10">
          <div className="space-y-3">
            <Link href="/" className="inline-block" data-testid="logo-footer">
              <img src={logoImage} alt="Liberty Chain" className="h-8 sm:h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs" data-testid="text-footer-tagline">
              The first Meshtastic-powered EVM Layer 1 blockchain.
            </p>
            <CalloutBadge
              text="Not Your Keys, Not Your Liberty"
              size="sm"
              data-testid="badge-footer-liberty"
            />
          </div>
          <div className="flex items-center gap-2">
            <a href="https://twitter.com/libertychain" target="_blank" rel="noopener noreferrer" data-testid="button-social-twitter">
              <Button size="icon" variant="ghost" asChild>
                <span><SiX className="w-5 h-5" /></span>
              </Button>
            </a>
            <a href="https://github.com/liberty-chain" target="_blank" rel="noopener noreferrer" data-testid="button-social-github">
              <Button size="icon" variant="ghost" asChild>
                <span><Github className="w-5 h-5" /></span>
              </Button>
            </a>
            <a href="https://discord.gg/libertychain" target="_blank" rel="noopener noreferrer" data-testid="button-social-discord">
              <Button size="icon" variant="ghost" asChild>
                <span><MessageCircle className="w-5 h-5" /></span>
              </Button>
            </a>
          </div>
        </div>

        <div className="md:grid md:grid-cols-4 md:gap-8 mb-6 sm:mb-10 border-t border-border/30 md:border-none pt-2 md:pt-0">
          <FooterAccordion title="Product" items={links.product} />
          <FooterAccordion title="Developers" items={links.developers} />
          <FooterAccordion title="Community" items={links.community} />
          <FooterAccordion title="Company" items={links.company} />
        </div>

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
