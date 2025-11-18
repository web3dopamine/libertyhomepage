import { Navigation } from "@/components/Navigation";
import { FileText, BookOpen, Code2, Terminal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Documentation() {
  const docSections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Quick start guide to building your first dApp on Liberty Chain.",
      links: [
        { label: "Introduction", href: "#intro" },
        { label: "Installation", href: "#install" },
        { label: "Your First Contract", href: "#first-contract" },
      ]
    },
    {
      icon: Code2,
      title: "Smart Contracts",
      description: "Learn how to write and deploy Solidity smart contracts on Liberty.",
      links: [
        { label: "Contract Basics", href: "#basics" },
        { label: "Advanced Patterns", href: "#advanced" },
        { label: "Security Best Practices", href: "#security" },
      ]
    },
    {
      icon: Terminal,
      title: "CLI Tools",
      description: "Command-line tools for Liberty Chain development and deployment.",
      links: [
        { label: "Installation", href: "#cli-install" },
        { label: "Commands Reference", href: "#commands" },
        { label: "Configuration", href: "#config" },
      ]
    },
    {
      icon: FileText,
      title: "API Reference",
      description: "Complete API documentation for Liberty Chain RPC methods.",
      links: [
        { label: "JSON-RPC API", href: "#rpc" },
        { label: "Web3 Integration", href: "#web3" },
        { label: "GraphQL API", href: "#graphql" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">DOCUMENTATION</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-documentation">
              Developer Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn how to write smart contracts and build applications on Liberty Chain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {docSections.map((section, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`doc-section-${index}`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{section.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {section.description}
                </p>
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      className="block text-sm text-primary hover:underline"
                      data-testid={`link-${index}-${linkIndex}`}
                    >
                      → {link.label}
                    </a>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-12 mt-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-black mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Join our developer community for support and discussions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/community">
                <a className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-primary text-primary-foreground hover-elevate active-elevate-2">
                  Join Discord
                </a>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
