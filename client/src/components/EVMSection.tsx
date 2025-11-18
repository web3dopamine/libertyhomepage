import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Code2, FileCode, Boxes } from "lucide-react";

export function EVMSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background" id="technology">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full border border-secondary/20 bg-secondary/5" data-testid="badge-evm">
                <span className="text-sm font-bold uppercase tracking-wider">Plug and Play</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black leading-[0.95] tracking-tight" data-testid="text-evm-title">
                {libertyChainData.features.evmCompatibility.title}
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-evm-description">
                {libertyChainData.features.evmCompatibility.description}
              </p>
            </div>

            <Button size="lg" variant="outline" className="group" data-testid="button-developer-briefing">
              Check the Developer Briefing
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right visual */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full aspect-square">
              {/* Gradient blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/40 to-primary/40 rounded-[3rem] blur-3xl opacity-50" />
              
              {/* Icons floating */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 animate-pulse">
                    <Code2 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-secondary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-secondary/30 animate-pulse" style={{ animationDelay: "0.5s" }}>
                    <FileCode className="w-12 h-12 text-secondary" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 animate-pulse" style={{ animationDelay: "1s" }}>
                    <Boxes className="w-14 h-14 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
