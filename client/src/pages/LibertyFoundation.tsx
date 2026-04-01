import { Navigation } from "@/components/Navigation";
import { Heart, Target, Globe, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LibertyFoundation() {
  const missions = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To advance blockchain technology and promote financial freedom through decentralized infrastructure."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Supporting developers and projects worldwide to build the next generation of decentralized applications."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Governed by the community, for the community. Every voice matters in shaping Liberty's future."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">FOUNDATION</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-foundation">
              Liberty Foundation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn about the foundation supporting the growth and adoption of Liberty Chain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {missions.map((mission, index) => (
              <Card key={index} className="p-8 text-center hover-elevate transition-all" data-testid={`mission-card-${index}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <mission.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{mission.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {mission.description}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black mb-6">About Liberty Foundation</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The Liberty Foundation is a non-profit organization dedicated to advancing blockchain technology 
                  and promoting financial freedom through decentralized infrastructure.
                </p>
                <p>
                  We believe in a future where everyone has access to permissionless, censorship-resistant financial 
                  systems. Liberty Chain represents our commitment to making this vision a reality.
                </p>
                <p>
                  Through grants, educational programs, and community initiatives, we support developers and projects 
                  that align with our mission of creating a more open and equitable financial system.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
