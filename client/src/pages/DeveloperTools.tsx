import { Navigation } from "@/components/Navigation";
import { Wrench, Code, Package, TestTube } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DeveloperTools() {
  const tools = [
    {
      icon: Code,
      title: "Liberty CLI",
      category: "Command Line",
      description: "Powerful command-line interface for smart contract development, deployment, and testing.",
      features: ["Contract deployment", "Network management", "Account utilities"],
      href: "/documentation",
    },
    {
      icon: Package,
      title: "Liberty SDK",
      category: "SDK",
      description: "JavaScript/TypeScript SDK for building dApps and integrating with Liberty Chain.",
      features: ["Web3 compatible", "TypeScript support", "React hooks"],
      href: "/documentation",
    },
    {
      icon: TestTube,
      title: "Liberty Testnet",
      category: "Testing",
      description: "Full-featured testnet for developing and testing your applications before mainnet deployment.",
      features: ["Free testnet tokens", "Identical to mainnet", "Fast iterations"],
      href: "https://explorer.libertychain.org/",
      external: true,
    },
    {
      icon: Wrench,
      title: "Development Frameworks",
      category: "Frameworks",
      description: "Hardhat and Foundry support for comprehensive smart contract development workflows.",
      features: ["Testing frameworks", "Deployment scripts", "Local development"],
      href: "/documentation",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">DEVELOPER TOOLS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-dev-tools">
              Developer Tools & Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our directory of tools and services used to build on Liberty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {tools.map((tool, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`tool-card-${index}`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <tool.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold mb-2">
                        {tool.category}
                      </div>
                      <h3 className="text-2xl font-bold">{tool.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4" data-testid={`button-tool-${index}`} asChild>
                    {tool.external ? (
                      <a href={tool.href} target="_blank" rel="noopener noreferrer">Learn More</a>
                    ) : (
                      <Link href={tool.href}>Learn More</Link>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-12 mt-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-black mb-4">Want to Add Your Tool?</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking to expand our developer ecosystem. Submit your tool for consideration.
            </p>
            <Button size="lg" data-testid="button-submit-tool" asChild>
              <a href="https://discord.gg/libertychain" target="_blank" rel="noopener noreferrer">
                Submit Your Tool
              </a>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
