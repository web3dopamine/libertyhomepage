import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ExternalLink, Calendar, Newspaper,
  Video, Mic, FileText, MessageSquare, Megaphone,
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
  "Blog Post": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Video": "bg-red-500/10 text-red-400 border-red-500/20",
  "Podcast": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Article": "bg-green-500/10 text-green-400 border-green-500/20",
  "Interview": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Announcement": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function parseMarkdown(md: string): string {
  const html = marked.parse(md, { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MediaPost() {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading, isError } = useQuery<MediaItem>({
    queryKey: ["/api/media-items", id],
    queryFn: () => fetch(`/api/media-items/${id}`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">

          {/* Back link */}
          <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
            <Link href="/liberty-media">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Media Hub
            </Link>
          </Button>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-3/4 bg-muted rounded-md" />
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
              <div className="h-4 w-4/6 bg-muted rounded" />
            </div>
          )}

          {isError && (
            <div className="text-center py-24 text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-lg mb-2">Post not found</p>
              <p className="text-sm">This post may have been removed or the link is incorrect.</p>
            </div>
          )}

          {item && (
            <article>
              {/* Type badge + meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {(() => {
                  const Icon = TYPE_ICONS[item.type] ?? FileText;
                  return (
                    <Badge variant="outline" className={`flex items-center gap-1.5 ${TYPE_COLORS[item.type]}`}>
                      <Icon className="w-3 h-3" />
                      {item.type}
                    </Badge>
                  );
                })()}
                {item.date && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.date)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6" data-testid="post-title">
                {item.title}
              </h1>

              {/* Description / subtitle */}
              {item.description && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Cover image */}
              {item.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-10 aspect-[2/1] bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Full content */}
              {item.content ? (
                <div
                  className="prose prose-invert prose-lg max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-foreground/90 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-card prose-pre:border prose-pre:border-border
                    prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
                    prose-strong:text-foreground prose-em:text-foreground/80
                    prose-hr:border-border prose-li:text-foreground/90
                    prose-img:rounded-lg prose-img:mx-auto"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(item.content) }}
                  data-testid="post-content"
                />
              ) : (
                <div className="text-muted-foreground italic text-sm py-8 border-t border-border">
                  No full content available for this post.
                </div>
              )}

              {/* External link CTA */}
              {item.url && item.url !== "#" && (
                <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-muted-foreground">View the original source</p>
                  <Button asChild variant="outline">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read original
                    </a>
                  </Button>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
