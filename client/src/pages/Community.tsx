import { Navigation } from "@/components/Navigation";
import { MessageSquare, Users, Heart, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Community() {
  const communityChannels = [
    {
      icon: MessageSquare,
      title: "Discord Server",
      description: "Join 50,000+ community members in our Discord for discussions, support, and collaboration.",
      cta: "Join Discord",
      members: "50K+ members",
      href: "https://discord.gg/libertychain",
      external: true,
    },
    {
      icon: Users,
      title: "Forum",
      description: "Participate in governance discussions, proposals, and long-form conversations.",
      cta: "Visit Forum",
      members: "Active discussions",
      href: "https://discord.gg/libertychain",
      external: true,
    },
    {
      icon: Lightbulb,
      title: "Developer Community",
      description: "Connect with builders, share ideas, and get technical support from experienced developers.",
      cta: "Join Developers",
      members: "5K+ developers",
      href: "/build",
      external: false,
    },
    {
      icon: Heart,
      title: "Ambassador Program",
      description: "Become a Liberty ambassador and help grow the community in your region.",
      cta: "Apply Now",
      members: "Global network",
      href: "https://discord.gg/libertychain",
      external: true,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">COMMUNITY</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-community">
              Join the Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with our vibrant community for discussions, support, and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {communityChannels.map((channel, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`community-card-${index}`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <channel.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{channel.title}</h3>
                    <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold mb-3">
                      {channel.members}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {channel.description}
                  </p>
                  <Button variant="outline" className="w-full" data-testid={`button-community-${index}`} asChild>
                    {channel.external ? (
                      <a href={channel.href} target="_blank" rel="noopener noreferrer">{channel.cta}</a>
                    ) : (
                      <Link href={channel.href}>{channel.cta}</Link>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-12 mt-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-black mb-4">Community Guidelines</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're building an inclusive, respectful community. Please read our community guidelines 
              before participating in discussions.
            </p>
            <Button variant="outline" data-testid="button-guidelines" asChild>
              <a href="https://discord.gg/libertychain" target="_blank" rel="noopener noreferrer">Read Guidelines</a>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
