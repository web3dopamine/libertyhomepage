import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { Zap, Shield, Layers, Gauge } from "lucide-react";
import { ArrowRight } from "lucide-react";

const icons = [Zap, Gauge, Shield, Layers];

export function PerformanceSection() {
  return (
    <section className="py-32 relative overflow-hidden" id="performance">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5" data-testid="badge-performance">
                <span className="text-sm font-bold uppercase tracking-wider">Unparalleled Performance</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black leading-[0.95] tracking-tight" data-testid="text-performance-title">
                Build beyond limits.{" "}
                <span className="block mt-2">
                  Scale <em className="gradient-text not-italic">without</em> compromise.
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-performance-description">
                {libertyChainData.features.performance.description}
              </p>
            </div>

            <Button size="lg" variant="outline" className="group" data-testid="button-learn-performance">
              Learn about Liberty Chain's performance
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right metrics grid */}
          <div className="grid grid-cols-2 gap-6">
            {libertyChainData.features.performance.metrics.map((metric, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Card 
                  key={index} 
                  className="p-6 space-y-4 hover-elevate active-elevate-2 transition-all duration-300 border-border/50"
                  data-testid={`performance-card-${index}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-4xl font-black tabular-nums gradient-text">
                      <AnimatedCounter 
                        target={parseInt(metric.value)}
                        prefix={metric.prefix}
                        suffix={metric.suffix}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                      {metric.label}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
