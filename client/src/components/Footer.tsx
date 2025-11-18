import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageCircle } from "lucide-react";
import logoImage from "@assets/Asset 6_1763440187916.png";

export function Footer() {
  const links = {
    product: [
      { label: "Performance", href: "#performance" },
      { label: "Technology", href: "#technology" },
      { label: "Network", href: "#network" },
      { label: "Ecosystem", href: "#ecosystem" }
    ],
    developers: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Tutorials", href: "#" }
    ],
    community: [
      { label: "Discord", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Events", href: "#" }
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press Kit", href: "#" },
      { label: "Contact", href: "#" }
    ]
  };

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center" data-testid="logo-footer">
              <img src={logoImage} alt="Liberty Chain" className="h-10 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-footer-tagline">
              The high-performance EVM blockchain built for scale.
            </p>
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

          {/* Links columns */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Developers</h3>
            <ul className="space-y-3">
              {links.developers.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              {links.community.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            © 2025 Liberty Chain. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy-policy">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-cookies">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
