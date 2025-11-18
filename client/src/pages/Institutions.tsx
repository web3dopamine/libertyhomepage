import { Navigation } from "@/components/Navigation";
import { Building2, Lock, Gauge, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Institutions() {
  const features = [
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-grade security with multi-signature support and advanced key management for institutional needs."
    },
    {
      icon: Gauge,
      title: "Scalable Infrastructure",
      description: "Handle millions of transactions with Liberty's high-performance infrastructure designed for enterprise scale."
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Get white-glove support from our enterprise team to ensure smooth integration and operation."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">INSTITUTIONS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-institutions">
              Enterprise Solutions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Blockchain solutions designed for institutional adoption and enterprise needs.
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
            <h2 className="text-3xl font-black mb-4">Ready to Build with Liberty?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join leading institutions building on Liberty Chain. Contact our enterprise team to discuss your needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" data-testid="button-contact-sales">
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" data-testid="button-view-docs">
                View Documentation
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
