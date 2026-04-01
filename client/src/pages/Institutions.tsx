import { Navigation } from "@/components/Navigation";
import { Building2, Lock, Gauge, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCMSContent } from "@/hooks/use-cms-content";

export default function Institutions() {
  const cms = useCMSContent("institutions");

  const heroTitle = cms["hero.title"] ?? "Enterprise Solutions";
  const heroSubtitle = cms["hero.subtitle"] ?? "Blockchain solutions designed for institutional adoption and enterprise needs.";
  const heroBadge = cms["hero.badge"] ?? "INSTITUTIONS";

  const features = [
    {
      icon: Lock,
      title: cms["feature1.title"] ?? "Enterprise Security",
      description: cms["feature1.description"] ?? "Bank-grade security with multi-signature support and advanced key management for institutional needs.",
    },
    {
      icon: Gauge,
      title: cms["feature2.title"] ?? "Scalable Infrastructure",
      description: cms["feature2.description"] ?? "Handle millions of transactions with Liberty's high-performance infrastructure designed for enterprise scale.",
    },
    {
      icon: Users,
      title: cms["feature3.title"] ?? "Dedicated Support",
      description: cms["feature3.description"] ?? "Get white-glove support from our enterprise team to ensure smooth integration and operation.",
    },
  ];

  const ctaTitle = cms["cta.title"] ?? "Ready to Build with Liberty?";
  const ctaBody = cms["cta.body"] ?? "Join leading institutions building on Liberty Chain. Contact our enterprise team to discuss your needs.";
  const primaryLabel = cms["cta.primaryLabel"] ?? "Contact Sales";
  const primaryUrl = cms["cta.primaryUrl"] ?? "https://discord.gg/libertychain";
  const secondaryLabel = cms["cta.secondaryLabel"] ?? "View Documentation";
  const secondaryUrl = cms["cta.secondaryUrl"] ?? "/documentation";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{heroBadge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-institutions">
              {heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 text-center hover-elevate active-elevate-2 transition-all" data-testid={`feature-card-${index}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-3xl font-black mb-4">{ctaTitle}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {ctaBody}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" data-testid="button-contact-sales" asChild>
                <a href={primaryUrl} target={primaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{primaryLabel}</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-view-docs" asChild>
                <a href={secondaryUrl}>{secondaryLabel}</a>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
