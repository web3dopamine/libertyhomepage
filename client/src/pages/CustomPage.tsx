import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCMSContent } from "@/hooks/use-cms-content";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

interface CustomPageDef {
  id: string;
  title: string;
  path: string;
  createdAt: string;
}

export default function CustomPage({ pageId }: { pageId: string }) {
  const cms = useCMSContent(pageId);

  const { data: pages = [] } = useQuery<CustomPageDef[]>({
    queryKey: ["/api/cms/pages"],
  });

  const pageDef = pages.find((p) => p.id === pageId);

  const heroBadge = cms["hero.badge"] || "";
  const heroTitle = cms["hero.title"] || pageDef?.title || "Untitled Page";
  const heroSubtitle = cms["hero.subtitle"] || "";
  const heroCta1 = cms["hero.cta1"] || "";
  const heroCta1Url = cms["hero.cta1Url"] || "";
  const heroCta2 = cms["hero.cta2"] || "";
  const heroCta2Url = cms["hero.cta2Url"] || "";

  const section2Title = cms["section2.title"] || "";
  const section2Body = cms["section2.body"] || "";

  const cards = [
    { title: cms["card1.title"] || "", desc: cms["card1.description"] || "", cta: cms["card1.cta"] || "", ctaUrl: cms["card1.ctaUrl"] || "" },
    { title: cms["card2.title"] || "", desc: cms["card2.description"] || "", cta: cms["card2.cta"] || "", ctaUrl: cms["card2.ctaUrl"] || "" },
    { title: cms["card3.title"] || "", desc: cms["card3.description"] || "", cta: cms["card3.cta"] || "", ctaUrl: cms["card3.ctaUrl"] || "" },
  ].filter((c) => c.title);

  const ctaTitle = cms["cta.title"] || "";
  const ctaBody = cms["cta.body"] || "";
  const ctaBtn1 = cms["cta.button1Label"] || "";
  const ctaBtn1Url = cms["cta.button1Url"] || "";
  const ctaBtn2 = cms["cta.button2Label"] || "";
  const ctaBtn2Url = cms["cta.button2Url"] || "";

  function renderLink(label: string, href: string, variant: "default" | "outline" = "default") {
    if (!label || !href) return null;
    const isExternal = href.startsWith("http");
    return (
      <Button size="lg" variant={variant} asChild>
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        ) : (
          <Link href={href}>{label}</Link>
        )}
      </Button>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-16">
            {heroBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{heroBadge}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
              {heroTitle}
            </h1>
            {heroSubtitle && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {heroSubtitle}
              </p>
            )}
            {(heroCta1 || heroCta2) && (
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                {renderLink(heroCta1, heroCta1Url, "default")}
                {renderLink(heroCta2, heroCta2Url, "outline")}
              </div>
            )}
          </div>

          {/* Optional second section */}
          {(section2Title || section2Body) && (
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              {section2Title && <h2 className="text-3xl font-black">{section2Title}</h2>}
              {section2Body && <p className="text-lg text-muted-foreground">{section2Body}</p>}
            </div>
          )}

          {/* Feature Cards */}
          {cards.length > 0 && (
            <div className={`grid gap-8 mb-16 ${cards.length === 1 ? "max-w-sm mx-auto" : cards.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
              {cards.map((card, index) => (
                <Card key={index} className="p-8 text-center hover-elevate active-elevate-2 transition-all">
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  {card.desc && <p className="text-muted-foreground leading-relaxed mb-6">{card.desc}</p>}
                  {card.cta && card.ctaUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      {card.ctaUrl.startsWith("http") ? (
                        <a href={card.ctaUrl} target="_blank" rel="noopener noreferrer">{card.cta}</a>
                      ) : (
                        <Link href={card.ctaUrl}>{card.cta}</Link>
                      )}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {(ctaTitle || ctaBody) && (
            <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              {ctaTitle && <h2 className="text-3xl font-black mb-4">{ctaTitle}</h2>}
              {ctaBody && <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{ctaBody}</p>}
              {(ctaBtn1 || ctaBtn2) && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {renderLink(ctaBtn1, ctaBtn1Url, "default")}
                  {renderLink(ctaBtn2, ctaBtn2Url, "outline")}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
