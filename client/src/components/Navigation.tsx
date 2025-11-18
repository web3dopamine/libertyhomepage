import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/Asset 6_1763440187916.png";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home">
            <div className="hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3 cursor-pointer" data-testid="logo-main">
              <img src={logoImage} alt="Liberty Chain" className="h-8 w-auto" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/ecosystem" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-ecosystem">
              Ecosystem
            </Link>
            <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-events">
              Events
            </Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-blog">
              Blog
            </Link>
          </div>

          <Button variant="default" size="default" data-testid="button-launch-app">
            Launch App
          </Button>
        </div>
      </div>
    </nav>
  );
}
