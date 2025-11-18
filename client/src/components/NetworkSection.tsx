import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Globe, Server, Network } from "lucide-react";

export function NetworkSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background to-card" id="network">
      {/* Dark background with globe effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5" data-testid="badge-network">
              <span className="text-sm font-bold uppercase tracking-wider">Scalable Decentralization</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black leading-[0.95] tracking-tight" data-testid="text-network-title">
              {libertyChainData.features.network.title}
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-network-description">
              {libertyChainData.features.network.description}
            </p>
          </div>

          {/* Network visualization */}
          <div className="relative w-full max-w-2xl mx-auto aspect-square">
            {/* Central globe */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl animate-pulse" />
                <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <Globe className="w-24 h-24 text-primary animate-pulse" />
                </div>
              </div>
            </div>

            {/* Orbiting nodes */}
            {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-full h-full"
                style={{
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-card border-2 border-primary/50 rounded-full flex items-center justify-center animate-pulse backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <Server className="w-6 h-6 text-primary" />
                </div>
              </div>
            ))}

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" style={{ overflow: 'visible' }}>
              <circle cx="50%" cy="50%" r="40%" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
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
