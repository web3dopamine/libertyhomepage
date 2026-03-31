import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Sparkles, Code } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { FloatingCard3D } from "./FloatingCard3D";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export function EcosystemSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-card to-background" id="ecosystem">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 md:py-16 relative z-10 w-full">
        <motion.div
          className="text-center space-y-3 sm:space-y-4 md:space-y-6 mb-4 sm:mb-8 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Liberty Logo Video — hidden on mobile */}
          <div className="hidden sm:flex justify-center mb-4 md:mb-8">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[1280px] h-auto object-contain"
              data-testid="video-liberty-logo"
            >
              <source src="/attached_assets/Liberty-logo-overlay_1763452972699.webm" type="video/webm" />
            </video>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight" data-testid="text-ecosystem-title">
            <SplitText type="words">
              Explore the Onchain World on Liberty Chain
            </SplitText>
          </h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {libertyChainData.ecosystem.map((item, index) => {
            const Icon = index === 0 ? Sparkles : Code;
            return (
              <FloatingCard3D key={index} intensity={8}>
                <Card
                  className="group relative overflow-hidden border-border/50 hover-elevate active-elevate-2 transition-all duration-500 cursor-pointer h-full"
                  data-testid={`ecosystem-card-${index}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-5 sm:p-8 md:p-12 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-xl sm:text-3xl font-black tracking-tight">{item.title}</h3>
                      <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">{item.description}</p>
                    </div>
                    <a href={item.link}>
                      <Button
                        variant="ghost"
                        className="group/button p-0 h-auto hover:bg-transparent"
                        data-testid={`button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span className="text-primary font-semibold flex items-center gap-2">
                          Explore
                          <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </a>
                  </div>
                </Card>
              </FloatingCard3D>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
