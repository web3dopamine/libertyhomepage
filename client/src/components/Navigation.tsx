import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/Asset 6_1763440187916.png";
import { Rocket } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-2xl shadow-2xl shadow-primary/10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="hover-elevate active-elevate-2 rounded-xl px-4 py-2 -ml-4 cursor-pointer transition-all duration-500 ease-out" data-testid="logo-main">
              <img src={logoImage} alt="Liberty Chain" className="h-12 w-auto" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            <Link href="/ecosystem" className="relative text-base font-semibold text-muted-foreground hover:text-foreground transition-all duration-500 ease-out group" data-testid="link-nav-ecosystem">
              <span className="relative z-10">Ecosystem</span>
              <div className="absolute inset-0 -inset-x-3 -inset-y-2 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 ease-out" />
            </Link>
            <Link href="/events" className="relative text-base font-semibold text-muted-foreground hover:text-foreground transition-all duration-500 ease-out group" data-testid="link-nav-events">
              <span className="relative z-10">Events</span>
              <div className="absolute inset-0 -inset-x-3 -inset-y-2 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 ease-out" />
            </Link>
            <Link href="/blog" className="relative text-base font-semibold text-muted-foreground hover:text-foreground transition-all duration-500 ease-out group" data-testid="link-nav-blog">
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 -inset-x-3 -inset-y-2 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 ease-out" />
            </Link>
          </div>

          <Button 
            variant="default" 
            size="lg" 
            className="shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 group"
            data-testid="button-launch-app"
          >
            <Rocket className="mr-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform duration-300" data-testid="icon-rocket-explorer" />
            <span className="font-semibold" data-testid="text-explorer-label">Explorer</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
