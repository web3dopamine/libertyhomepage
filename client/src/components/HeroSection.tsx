import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";
import { SplitText, AnimatedGradientText, TextReveal } from "./SplitText";
import { AnimatedBackground3D } from "./AnimatedBackground3D";

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
      {/* Animated 3D background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card">
        <AnimatedBackground3D />
      </div>

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

          {/* Main headline with split text animation */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter max-w-5xl mx-auto" 
            data-testid="text-hero-title"
            variants={itemVariants}
          >
            <SplitText type="words" delay={0.3}>
              {libertyChainData.hero.title.split('EVM')[0]}
            </SplitText>
            <AnimatedGradientText>EVM</AnimatedGradientText>
            <SplitText type="words" delay={0.5}>
              {libertyChainData.hero.title.split('EVM')[1]}
            </SplitText>
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

          {/* Subtitle with character-by-character reveal */}
          <motion.div variants={itemVariants}>
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" 
              data-testid="text-hero-subtitle"
            >
              <SplitText type="chars" delay={0.6}>
                {libertyChainData.hero.subtitle}
              </SplitText>
            </p>
          </motion.div>

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
