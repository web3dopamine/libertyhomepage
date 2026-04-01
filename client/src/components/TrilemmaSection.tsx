import { Shield, Zap, Users } from "lucide-react";
import { CalloutBadge } from "./CalloutBadge";

export function TrilemmaSection() {
  const features = [
    { icon: Shield, title: "Security", description: "Robust cryptographic security" },
    { icon: Users, title: "Decentralization", description: "True distributed consensus" },
    { icon: Zap, title: "Scalability", description: "High-throughput performance" }
  ];

  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-8 md:py-10 relative z-10 w-full">
        <div className="text-center space-y-6 sm:space-y-8 md:space-y-12">
          <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <div>
              <CalloutBadge text="210M TOTAL Liberty Supply" data-testid="badge-supply" />
            </div>

            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground" data-testid="text-trilemma-intro">
              Legacy chains are forced to choose between security, decentralization, and scalability.
            </p>

            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black leading-[0.85] tracking-tight" data-testid="text-trilemma-title">
              Liberty Chain <em className="gradient-text not-italic">rewrites</em> the rules.
            </h2>

            <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text" data-testid="text-trilemma-tagline">
              All in one.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 pt-2 sm:pt-6 md:pt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-4 sm:p-6 md:p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent hover-elevate active-elevate-2 transition-all duration-300"
                  data-testid={`trilemma-card-${index}`}
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-5 md:mb-6 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
