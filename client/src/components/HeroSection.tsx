import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      </div>

      {/* Purple glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 text-center">
        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm" data-testid="badge-new-benchmark">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium uppercase tracking-wider">A NEW BENCHMARK</span>
            </div>
          </motion.div>

          {/* Main headline with gradient */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter max-w-5xl mx-auto" 
            data-testid="text-hero-title"
            variants={itemVariants}
          >
            {libertyChainData.hero.title.split('EVM')[0]}
            <span className="gradient-text">EVM</span>
            {libertyChainData.hero.title.split('EVM')[1]}
          </motion.h1>

          {/* Animated TPS counter */}
          <motion.div 
            className="flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <div className="text-7xl md:text-8xl font-black tabular-nums gradient-text" data-testid="text-tps-counter">
              <AnimatedCounter target={10000} suffix="+" />
            </div>
            <div className="text-left">
              <div className="text-2xl md:text-3xl font-bold" data-testid="text-tps-label">TPS</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide" data-testid="text-tps-sublabel">Transactions/sec</div>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" 
            data-testid="text-hero-subtitle"
            variants={itemVariants}
          >
            {libertyChainData.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            variants={itemVariants}
          >
            <Button size="lg" className="group" data-testid="button-start-building">
              {libertyChainData.hero.primaryCTA}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm" data-testid="button-documentation">
              {libertyChainData.hero.secondaryCTA}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
