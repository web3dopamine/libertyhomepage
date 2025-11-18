import { Navigation } from "@/components/Navigation";
import { Palette, Download, Image, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BrandingMediaKit() {
  const assets = [
    {
      icon: Image,
      title: "Logo Pack",
      description: "Liberty Chain logos in various formats including SVG, PNG, and EPS.",
      items: ["Primary logo", "Icon only", "Wordmark", "Light & dark versions"],
      size: "2.4 MB"
    },
    {
      icon: Palette,
      title: "Brand Colors",
      description: "Official color palette with hex codes and usage guidelines.",
      items: ["Primary teal", "Secondary blue", "Gradient definitions", "Accessibility notes"],
      size: "450 KB"
    },
    {
      icon: FileText,
      title: "Typography",
      description: "Font families, weights, and typography guidelines for Liberty branding.",
      items: ["DM Sans", "Inter", "JetBrains Mono", "Usage examples"],
      size: "1.8 MB"
    },
    {
      icon: Image,
      title: "Marketing Assets",
      description: "Social media templates, banners, and promotional graphics.",
      items: ["Twitter banners", "Discord assets", "Presentation templates", "Print materials"],
      size: "15.2 MB"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">BRAND RESOURCES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-branding">
              Branding & Media Kit
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Official logos, brand guidelines, and media resources for the Liberty ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {assets.map((asset, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`asset-card-${index}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <asset.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{asset.size}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{asset.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {asset.description}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {asset.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" data-testid={`button-download-${index}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-black">Brand Usage Guidelines</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong>DO:</strong> Use our official logo and colors when representing Liberty Chain in your projects, 
                  presentations, or communications.
                </p>
                <p>
                  <strong>DON'T:</strong> Modify the logo, use unofficial colors, or create derivative works without permission.
                </p>
                <p>
                  For questions about brand usage or to request special permissions, please contact our team.
                </p>
              </div>
              <Button variant="outline" className="mt-6" data-testid="button-contact">
                Contact Brand Team
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
