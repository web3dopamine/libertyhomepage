import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";
import { SplitText, AnimatedGradientText } from "./SplitText";
import { AnimatedBackground3D } from "./AnimatedBackground3D";
import { Floating3DShapes } from "./Floating3DShapes";
import { CalloutBadge } from "./CalloutBadge";
import { useCMSContent } from "@/hooks/use-cms-content";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export function HeroSection() {
  const cms = useCMSContent("home");
  const heroBadge = cms["hero.badge"] ?? "Over 50 Million BTC Addresses Eligible";
  const heroTitle = cms["hero.title"] ?? libertyChainData.hero.title;
  const heroSubtitle = cms["hero.subtitle"] ?? libertyChainData.hero.subtitle;
  const heroPrimaryCTA = cms["hero.primaryCTA"] ?? libertyChainData.hero.primaryCTA;
  const heroSecondaryCTA = cms["hero.secondaryCTA"] ?? libertyChainData.hero.secondaryCTA;

  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          data-testid="video-hero-background"
        >
          <source src="/attached_assets/lbtc-header-video_1763447952310.MP4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80 backdrop-blur-[1px]" />
      </div>

      {/* Animated 3D background */}
      <div className="absolute inset-0">
        <AnimatedBackground3D />
        <Floating3DShapes />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-10 md:py-16 text-center w-full">
        <motion.div
          className="space-y-4 sm:space-y-6 md:space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <CalloutBadge
              text={heroBadge}
              data-testid="badge-new-benchmark"
            />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter max-w-6xl mx-auto"
            data-testid="text-hero-title"
            variants={itemVariants}
          >
            <SplitText type="words" delay={0.3}>
              {heroTitle.split('EVM')[0]}
            </SplitText>
            <AnimatedGradientText>EVM</AnimatedGradientText>
            <SplitText type="words" delay={0.5}>
              {heroTitle.split('EVM')[1]}
            </SplitText>
          </motion.h1>

          {/* Animated TPS counter */}
          <motion.div
            className="flex items-center justify-center gap-3 sm:gap-6"
            variants={itemVariants}
          >
            <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tabular-nums gradient-text" data-testid="text-tps-counter">
              <AnimatedCounter target={10000} suffix="+" />
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold" data-testid="text-tps-label">TPS</div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide" data-testid="text-tps-sublabel">Transactions/sec</div>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants}>
            {/* Mobile: just the tagline */}
            <p
              className="sm:hidden text-sm max-w-sm mx-auto leading-relaxed font-semibold tracking-wide text-primary"
              data-testid="text-hero-subtitle"
            >
              {heroSubtitle.split('|').at(-1) ?? ''}
            </p>
            {/* Tablet and up: full subtitle */}
            <p
              className="hidden sm:block text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              aria-hidden="true"
            >
              {heroSubtitle.split('|').map((line, index, arr) => (
                <span key={index} className={index === arr.length - 1 ? "text-primary font-semibold" : ""}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-8"
            variants={itemVariants}
          >
            <Button size="lg" className="group text-sm sm:text-lg px-5 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto" data-testid="button-start-building" asChild>
              <Link href="/build">
                {heroPrimaryCTA}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm text-sm sm:text-lg px-5 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto" data-testid="button-documentation" asChild>
              <Link href="/documentation">
                {heroSecondaryCTA}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
