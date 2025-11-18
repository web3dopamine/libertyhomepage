import { Shield, Zap, Users } from "lucide-react";

export function TrilemmaSection() {
  const features = [
    { icon: Shield, title: "Security", description: "Robust cryptographic security" },
    { icon: Users, title: "Decentralization", description: "True distributed consensus" },
    { icon: Zap, title: "Scalability", description: "High-throughput performance" }
  ];

  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10 w-full">
        <div className="text-center space-y-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-muted-foreground" data-testid="text-trilemma-intro">
              Legacy chains are forced to choose between security, decentralization, and scalability.
            </p>
            
            <h2 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight" data-testid="text-trilemma-title">
              Liberty Chain <em className="gradient-text not-italic">rewrites</em> the rules.
            </h2>

            <p className="text-3xl md:text-4xl font-bold gradient-text" data-testid="text-trilemma-tagline">
              All in one.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent hover-elevate active-elevate-2 transition-all duration-300"
                  data-testid={`trilemma-card-${index}`}
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
