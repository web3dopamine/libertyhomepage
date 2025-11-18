import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3 cursor-pointer" data-testid="logo-main">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight" data-testid="text-brand-name">LIBERTY CHAIN</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#performance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-performance">
              Performance
            </a>
            <a href="#technology" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-technology">
              Technology
            </a>
            <a href="#network" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-network">
              Network
            </a>
            <a href="#ecosystem" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-ecosystem">
              Ecosystem
            </a>
          </div>

          <Button variant="default" size="default" data-testid="button-launch-app">
            Launch App
          </Button>
        </div>
      </div>
    </nav>
  );
}
