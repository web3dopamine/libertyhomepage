import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import type { PressArticle } from "@shared/schema";

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
              <motion.a
                key={article.id}
                href={article.articleUrl || "#"}
                target={article.articleUrl && article.articleUrl !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group flex flex-col gap-4 p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                data-testid={`press-card-${article.id}`}
              >
                <div className="flex items-center justify-between gap-2">
                  {article.publicationLogo ? (
                    <img
                      src={article.publicationLogo}
                      alt={article.publicationName}
                      className="h-6 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-sm font-black text-primary uppercase tracking-wider">
                      {article.publicationName}
                    </span>
                  )}
                  <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>

                <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  "{article.headline}"
                </h3>

                {article.excerpt && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                {article.date && (
                  <p className="text-xs text-muted-foreground/50 mt-auto">
                    {new Date(article.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
