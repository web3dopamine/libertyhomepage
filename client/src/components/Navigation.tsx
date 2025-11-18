import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/Asset 6_1763440187916.png";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="hover-elevate active-elevate-2 rounded-lg px-4 py-2 -ml-4 cursor-pointer transition-all duration-300" data-testid="logo-main">
              <img src={logoImage} alt="Liberty Chain" className="h-12 w-auto" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/ecosystem" className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105" data-testid="link-nav-ecosystem">
              Ecosystem
            </Link>
            <Link href="/events" className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105" data-testid="link-nav-events">
              Events
            </Link>
            <Link href="/blog" className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105" data-testid="link-nav-blog">
              Blog
            </Link>
          </div>

          <Button variant="default" size="lg" className="shadow-lg shadow-primary/20" data-testid="button-launch-app">
            Explorer
          </Button>
        </div>
      </div>
    </nav>
  );
}
