import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper, Video, Mic, FileText, MessageSquare, Megaphone, Star,
  ExternalLink, Image as ImageIcon
} from "lucide-react";
import type { MediaItem, MediaType } from "@shared/schema";

const TYPE_ICONS: Record<MediaType, typeof Newspaper> = {
  "Blog Post": FileText,
  "Video": Video,
  "Podcast": Mic,
  "Article": Newspaper,
  "Interview": MessageSquare,
  "Announcement": Megaphone,
};

const TYPE_COLORS: Record<MediaType, string> = {
  "Blog Post": "bg-blue-500/10 text-blue-400",
  "Video": "bg-red-500/10 text-red-400",
  "Podcast": "bg-purple-500/10 text-purple-400",
  "Article": "bg-green-500/10 text-green-400",
  "Interview": "bg-orange-500/10 text-orange-400",
  "Announcement": "bg-yellow-500/10 text-yellow-400",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function LibertyMedia() {
  const { data: items = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/media-items"],
  });

  const featured = items.filter((i) => i.featured);
  const rest = items.filter((i) => !i.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">MEDIA</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-media">
              Liberty Media Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore featured blogs, video highlights, interviews and announcements from Liberty.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse h-80" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No media content yet</p>
              <p className="text-sm mt-1">Check back soon for updates.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured items */}
              {featured.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold">Featured</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featured.map((item) => (
                      <MediaCard key={item.id} item={item} featured />
                    ))}
                  </div>
                </section>
              )}

              {/* All items */}
              {rest.length > 0 && (
                <section>
                  {featured.length > 0 && (
                    <h2 className="text-lg font-bold mb-6">More from Liberty</h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MediaCard({ item, featured = false }: { item: MediaItem; featured?: boolean }) {
  const Icon = TYPE_ICONS[item.type] ?? FileText;
  const colorClass = TYPE_COLORS[item.type] ?? "bg-primary/10 text-primary";
  const hasLink = item.url && item.url !== "#";

  return (
    <Card
      className={`overflow-hidden flex flex-col hover-elevate active-elevate-2 transition-all ${featured ? "md:flex-row" : ""}`}
      data-testid={`media-card-${item.id}`}
    >
      {/* Image */}
      <div className={`relative bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ${featured ? "md:w-52 h-48 md:h-auto" : "h-48"}`}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              el.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        {/* Fallback icon (shown if no image or image fails) */}
        <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? "hidden" : ""}`}>
          <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
        </div>
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Featured badge */}
        {featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {item.type}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug line-clamp-2">{item.title}</h3>

        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
          {hasLink ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid={`button-read-${item.id}`}
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                Read More
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled data-testid={`button-read-${item.id}`}>
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
