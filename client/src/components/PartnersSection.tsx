import { useQuery } from "@tanstack/react-query";
import { Handshake, ExternalLink, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Partner } from "@shared/schema";

export function PartnersSection() {
  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  return (
    <div className="relative flex flex-col justify-center items-center h-full px-8 py-16 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Handshake className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Partners</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
            Built Together
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Working with leading projects and organisations to build the freedom layer for Web3.
          </p>
        </motion.div>

        {partners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6 py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Handshake className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black">Partner with Liberty Chain</h3>
              <p className="text-muted-foreground max-w-md">
                Join us in building the next generation of decentralised infrastructure.
                Reach out to explore partnership opportunities.
              </p>
            </div>
            <Button asChild>
              <Link href="/community">Get in Touch</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.map((partner, i) => (
              <motion.a
                key={partner.id}
                href={partner.link || "#"}
                target={partner.link ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 text-center cursor-pointer"
                data-testid={`partner-card-${partner.id}`}
              >
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-12 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-lg font-black text-primary">
                      {partner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 justify-center">
                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    {partner.link && (
                      <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  {partner.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {partner.description}
                    </p>
                  )}
                </div>
              </motion.a>
            ))}

            <motion.a
              href="/community"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: partners.length * 0.07 + 0.1 }}
              className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-dashed border-border/40 hover:border-primary/30 transition-all duration-300 text-center cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Become a Partner
                </h3>
              </div>
            </motion.a>
          </div>
        )}
      </div>
    </div>
  );
}
