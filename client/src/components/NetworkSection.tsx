import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { Interactive3DGlobe } from "./Interactive3DGlobe";

export function NetworkSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-card" id="network">
      {/* Dark background with globe effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-8 py-12 relative z-10 w-full">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5" data-testid="badge-network">
              <span className="text-sm font-bold uppercase tracking-wider">Scalable Decentralization</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight" data-testid="text-network-title">
              {libertyChainData.features.network.title}
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed" data-testid="text-network-description">
              {libertyChainData.features.network.description}
            </p>
          </div>

          {/* Network visualization - 3D Interactive Globe */}
          <div className="relative w-full max-w-3xl mx-auto h-[400px]">
            <Interactive3DGlobe />
          </div>

          {/* Bottom content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-xl font-semibold text-balance" data-testid="text-network-subtitle">
              {libertyChainData.features.network.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="outline" className="group" data-testid="button-database-info">
                Learn about the architecture
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group" data-testid="button-run-node">
                Learn how to run a node
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
