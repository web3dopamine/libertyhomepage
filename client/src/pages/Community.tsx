import { Navigation } from "@/components/Navigation";
import { MessageSquare, Users, Heart, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCMSContent } from "@/hooks/use-cms-content";

export default function Community() {
  const cms = useCMSContent("community");

  const heroBadge = cms["hero.badge"] ?? "COMMUNITY";
  const heroTitle = cms["hero.title"] ?? "Join the Community";
  const heroSubtitle = cms["hero.subtitle"] ?? "Connect with our vibrant community for discussions, support, and collaboration.";

  const channelIcons = [MessageSquare, Users, Lightbulb, Heart];
  const channels = [
    {
      title: cms["channel1.title"] ?? "Discord Server",
      members: cms["channel1.members"] ?? "50K+ members",
      description: cms["channel1.description"] ?? "Join 50,000+ community members in our Discord for discussions, support, and collaboration.",
      cta: cms["channel1.cta"] ?? "Join Discord",
      href: cms["channel1.ctaUrl"] ?? "https://discord.gg/libertychain",
    },
    {
      title: cms["channel2.title"] ?? "Forum",
      members: cms["channel2.members"] ?? "Active discussions",
      description: cms["channel2.description"] ?? "Participate in governance discussions, proposals, and long-form conversations.",
      cta: cms["channel2.cta"] ?? "Visit Forum",
      href: cms["channel2.ctaUrl"] ?? "https://discord.gg/libertychain",
    },
    {
      title: cms["channel3.title"] ?? "Developer Community",
      members: cms["channel3.members"] ?? "5K+ developers",
      description: cms["channel3.description"] ?? "Connect with builders, share ideas, and get technical support from experienced developers.",
      cta: cms["channel3.cta"] ?? "Join Developers",
      href: cms["channel3.ctaUrl"] ?? "/build",
    },
    {
      title: cms["channel4.title"] ?? "Ambassador Program",
      members: cms["channel4.members"] ?? "Global network",
      description: cms["channel4.description"] ?? "Become a Liberty ambassador and help grow the community in your region.",
      cta: cms["channel4.cta"] ?? "Apply Now",
      href: cms["channel4.ctaUrl"] ?? "https://discord.gg/libertychain",
    },
  ];

  const guidelinesTitle = cms["guidelines.title"] ?? "Community Guidelines";
  const guidelinesBody = cms["guidelines.body"] ?? "We're building an inclusive, respectful community. Please read our community guidelines before participating in discussions.";
  const guidelinesCta = cms["guidelines.cta"] ?? "Read Guidelines";
  const guidelinesCtaUrl = cms["guidelines.ctaUrl"] ?? "https://discord.gg/libertychain";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{heroBadge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-community">
              {heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {channels.map((channel, index) => {
              const Icon = channelIcons[index];
              return (
                <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`community-card-${index}`}>
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
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
                      {channel.href.startsWith("http") ? (
                        <a href={channel.href} target="_blank" rel="noopener noreferrer">{channel.cta}</a>
                      ) : (
                        <Link href={channel.href}>{channel.cta}</Link>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-12 mt-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-black mb-4">{guidelinesTitle}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {guidelinesBody}
            </p>
            <Button variant="outline" data-testid="button-guidelines" asChild>
              {guidelinesCtaUrl.startsWith("http") ? (
                <a href={guidelinesCtaUrl} target="_blank" rel="noopener noreferrer">{guidelinesCta}</a>
              ) : (
                <Link href={guidelinesCtaUrl}>{guidelinesCta}</Link>
              )}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
