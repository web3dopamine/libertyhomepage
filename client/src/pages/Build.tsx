import { Navigation } from "@/components/Navigation";
import { Code, Rocket, Users, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCMSContent } from "@/hooks/use-cms-content";

export default function Build() {
  const cms = useCMSContent("build");

  const heroBadge = cms["hero.badge"] ?? "BUILD";
  const heroTitle = cms["hero.title"] ?? "Build on Liberty";
  const heroSubtitle = cms["hero.subtitle"] ?? "Explore programs, resources, and a world-class community for founders and developers building on Liberty.";

  const programs = [
    {
      icon: Rocket,
      title: cms["program1.title"] ?? "Liberty Accelerator",
      description: cms["program1.description"] ?? "Get funding, mentorship, and resources to launch your project on Liberty Chain. Applications open quarterly.",
      cta: cms["program1.cta"] ?? "Apply Now",
      href: cms["program1.ctaUrl"] ?? "/accelerator/apply",
    },
    {
      icon: Users,
      title: cms["program2.title"] ?? "Developer Community",
      description: cms["program2.description"] ?? "Join thousands of developers building the future of blockchain. Access forums, Discord, and regular meetups.",
      cta: cms["program2.cta"] ?? "Join Community",
      href: cms["program2.ctaUrl"] ?? "/community",
    },
    {
      icon: BookOpen,
      title: cms["program3.title"] ?? "Learning Resources",
      description: cms["program3.description"] ?? "Comprehensive tutorials, guides, and courses to help you master Liberty Chain development.",
      cta: cms["program3.cta"] ?? "Start Learning",
      href: cms["program3.ctaUrl"] ?? "/documentation",
    },
  ];

  const whyBuildTitle = cms["whyBuild.title"] ?? "Why Build on Liberty?";
  const whyFeatures = [
    { title: cms["whyBuild.feature1Title"] ?? "10,000+ TPS", desc: cms["whyBuild.feature1Desc"] ?? "Scale your application without limits" },
    { title: cms["whyBuild.feature2Title"] ?? "Zero Gas Fees", desc: cms["whyBuild.feature2Desc"] ?? "No transaction costs for your users" },
    { title: cms["whyBuild.feature3Title"] ?? "EVM Compatible", desc: cms["whyBuild.feature3Desc"] ?? "Use familiar Solidity smart contracts" },
    { title: cms["whyBuild.feature4Title"] ?? "True Decentralization", desc: cms["whyBuild.feature4Desc"] ?? "Built on proven blockchain security" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{heroBadge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-build">
              {heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {programs.map((program, index) => (
              <Card key={index} className="p-8 text-center hover-elevate active-elevate-2 transition-all" data-testid={`program-card-${index}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <program.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {program.description}
                </p>
                <Button variant="outline" className="w-full" data-testid={`button-${index}`} asChild>
                  {program.href.startsWith("http") ? (
                    <a href={program.href} target="_blank" rel="noopener noreferrer">{program.cta}</a>
                  ) : (
                    <Link href={program.href}>{program.cta}</Link>
                  )}
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-black mb-4">{whyBuildTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left mt-8">
                {whyFeatures.map((f, i) => (
                  <div key={i}>
                    <h4 className="font-bold mb-2">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
