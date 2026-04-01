import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { SOCIAL_ICON_MAP } from "@/lib/social-icons";
import type { SocialLink } from "@shared/schema";

export default function SocialMedia() {
  const { data: socials = [], isLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/socials"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">SOCIAL MEDIA</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
              data-testid="heading-social"
            >
              Connect With Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow Liberty Chain across all platforms for updates, community highlights, and ecosystem news.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-8 h-40 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : socials.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              No social links configured yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {socials.map((platform, index) => {
                const Icon = SOCIAL_ICON_MAP[platform.icon];
                return (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`social-card-${index}`}
                  >
                    <Card className="p-8 h-full hover-elevate active-elevate-2 transition-all cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          {Icon ? (
                            <Icon
                              className="w-6 h-6"
                              style={platform.color ? { color: platform.color } : undefined}
                            />
                          ) : (
                            <Share2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{platform.name}</h3>
                          {platform.handle && (
                            <p className="text-sm text-primary font-mono">{platform.handle}</p>
                          )}
                        </div>
                        {platform.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {platform.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
