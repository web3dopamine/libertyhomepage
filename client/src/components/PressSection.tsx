import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { PressArticle } from "@shared/schema";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function PressSection() {
  const { data: articles = [] } = useQuery<PressArticle[]>({
    queryKey: ["/api/press"],
  });

  return (
    <div className="relative flex flex-col justify-center items-center h-full px-8 py-16 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-background to-card/10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Newspaper className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">In the Press</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
            As Featured In
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Trusted coverage from leading crypto and technology media.
          </p>
        </motion.div>

        {articles.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 text-sm">
            No press articles yet. Add some from the admin panel.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <a
                  href={article.articleUrl || "#"}
                  target={article.articleUrl && article.articleUrl !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block h-full"
                  data-testid={`press-card-${article.id}`}
                >
                  <Card className="overflow-hidden flex flex-col h-full hover-elevate active-elevate-2 transition-all group cursor-pointer">
                    {/* Cover image */}
                    <div className="relative h-44 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.headline}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = "none";
                          }}
                        />
                      ) : null}
                      {/* Fallback when no image */}
                      {!article.imageUrl && (
                        <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                      )}
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {/* External link icon */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      {/* Publication */}
                      <div className="flex items-center gap-2">
                        {article.publicationLogo ? (
                          <img
                            src={article.publicationLogo}
                            alt={article.publicationName}
                            className="h-5 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary uppercase tracking-wider">
                            {article.publicationName}
                          </span>
                        )}
                      </div>

                      {/* Headline */}
                      <h3 className="font-bold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors flex-1">
                        {article.headline}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Date */}
                      {article.date && (
                        <p className="text-xs text-muted-foreground/60 mt-auto">
                          {formatDate(article.date)}
                        </p>
                      )}
                    </div>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
