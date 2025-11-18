import { libertyChainData } from "@shared/schema";

export function FloatingKeywords() {
  const keywords = [...libertyChainData.keywords, ...libertyChainData.keywords];
  
  return (
    <section className="py-16 overflow-hidden border-y border-border/50 bg-gradient-to-r from-background via-card/30 to-background" data-testid="section-keywords">
      <div className="space-y-8">
        {/* First row - scrolling right */}
        <div className="relative flex overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {keywords.map((keyword, index) => (
              <div
                key={`row1-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm"
                data-testid={`keyword-chip-row1-${index}`}
              >
                <span className="text-sm font-semibold uppercase tracking-wider">{keyword}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-8 animate-marquee whitespace-nowrap absolute top-0" aria-hidden="true">
            {keywords.map((keyword, index) => (
              <div
                key={`row1-dup-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm"
              >
                <span className="text-sm font-semibold uppercase tracking-wider">{keyword}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Second row - scrolling left */}
        <div className="relative flex overflow-hidden">
          <div className="flex gap-8 animate-marquee-reverse whitespace-nowrap">
            {keywords.map((keyword, index) => (
              <div
                key={`row2-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-secondary/20 bg-secondary/5 backdrop-blur-sm"
                data-testid={`keyword-chip-row2-${index}`}
              >
                <span className="text-sm font-semibold uppercase tracking-wider">{keyword}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-8 animate-marquee-reverse whitespace-nowrap absolute top-0" aria-hidden="true">
            {keywords.map((keyword, index) => (
              <div
                key={`row2-dup-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-secondary/20 bg-secondary/5 backdrop-blur-sm"
              >
                <span className="text-sm font-semibold uppercase tracking-wider">{keyword}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
