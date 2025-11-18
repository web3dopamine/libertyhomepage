import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Sparkles, Code } from "lucide-react";

export function EcosystemSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-card to-background" id="ecosystem">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" data-testid="text-ecosystem-title">
            Explore the Onchain World on Liberty Chain
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {libertyChainData.ecosystem.map((item, index) => {
            const Icon = index === 0 ? Sparkles : Code;
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden border-border/50 hover-elevate active-elevate-2 transition-all duration-500 cursor-pointer"
                data-testid={`ecosystem-card-${index}`}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-8 md:p-12 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-3xl font-black tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <a href={item.link}>
                    <Button 
                      variant="ghost" 
                      className="group/button p-0 h-auto hover:bg-transparent"
                      data-testid={`button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className="text-primary font-semibold flex items-center gap-2">
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
