import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { Interactive3DGlobe } from "./Interactive3DGlobe";
import { CalloutBadge } from "./CalloutBadge";
import { Link } from "wouter";

export function NetworkSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-card" id="network">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 md:py-12 relative z-10 w-full">
        <div className="text-center space-y-4 sm:space-y-8 md:space-y-12">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <CalloutBadge text="Scalable Decentralization" data-testid="badge-network" />
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight" data-testid="text-network-title">
              {libertyChainData.features.network.title}
            </h2>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed" data-testid="text-network-description">
              {libertyChainData.features.network.description}
            </p>
          </div>

          {/* Globe — scaled down on mobile */}
          <div className="relative w-full max-w-3xl mx-auto h-[180px] sm:h-[300px] md:h-[380px] lg:h-[400px]">
            <Interactive3DGlobe />
          </div>

          {/* Bottom content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <p className="text-base sm:text-xl font-semibold text-balance" data-testid="text-network-subtitle">
              {libertyChainData.features.network.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button size="lg" variant="outline" className="group w-full sm:w-auto text-sm sm:text-base" data-testid="button-learn-architecture" asChild>
                <Link href="/documentation">
                  Learn about the architecture
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group w-full sm:w-auto text-sm sm:text-base" data-testid="button-learn-node" asChild>
                <Link href="/validators">
                  Learn how to run a node
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
