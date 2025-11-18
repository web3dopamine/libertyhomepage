import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";
import { SplitText, AnimatedGradientText, TextReveal } from "./SplitText";
import { AnimatedBackground3D } from "./AnimatedBackground3D";
import { Floating3DShapes } from "./Floating3DShapes";

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
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Animated 3D background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card">
        <AnimatedBackground3D />
        <Floating3DShapes />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 text-center">
        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm shadow-lg shadow-primary/10" data-testid="badge-new-benchmark">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">Over 50 Million BTC Addresses Eligible</span>
            </div>
          </motion.div>

          {/* Main headline with split text animation */}
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter max-w-6xl mx-auto" 
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
            className="flex items-center justify-center gap-4 sm:gap-6"
            variants={itemVariants}
          >
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tabular-nums gradient-text" data-testid="text-tps-counter">
              <AnimatedCounter target={10000} suffix="+" />
            </div>
            <div className="text-left">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" data-testid="text-tps-label">TPS</div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide" data-testid="text-tps-sublabel">Transactions/sec</div>
            </div>
          </motion.div>

          {/* Subtitle with character-by-character reveal */}
          <motion.div variants={itemVariants}>
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed" 
              data-testid="text-hero-subtitle"
            >
              <SplitText type="chars" delay={0.6}>
                {libertyChainData.hero.subtitle}
              </SplitText>
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8"
            variants={itemVariants}
          >
            <Button size="lg" className="group text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto" data-testid="button-start-building">
              {libertyChainData.hero.primaryCTA}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto" data-testid="button-documentation">
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
