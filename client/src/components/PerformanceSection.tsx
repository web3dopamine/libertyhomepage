import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { Zap, Shield, Layers, Gauge, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SplitText, AnimatedGradientText } from "./SplitText";
import { Floating3DShapes } from "./Floating3DShapes";
import { FloatingCard3D } from "./FloatingCard3D";
import { CalloutBadge } from "./CalloutBadge";

const icons = [Zap, Gauge, Shield, Layers];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export function PerformanceSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden" id="performance">
      <Floating3DShapes />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-8 md:py-10 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            className="space-y-4 sm:space-y-6 md:space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="space-y-3 sm:space-y-4" variants={itemVariants}>
              <CalloutBadge text="Gas Free, Liberty for All" data-testid="badge-performance" />
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight" data-testid="text-performance-title">
                <SplitText type="words">Build beyond limits.</SplitText>{" "}
                <span className="block mt-1 sm:mt-2">
                  <SplitText type="words" delay={0.3}>Scale </SplitText>
                  <AnimatedGradientText>without</AnimatedGradientText>
                  <SplitText type="words" delay={0.4}> compromise.</SplitText>
                </span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed" data-testid="text-performance-description">
                {libertyChainData.features.performance.description}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button size="lg" variant="outline" className="group text-sm sm:text-base" data-testid="button-learn-performance" asChild>
                <Link href="/documentation">
                  Learn about Liberty Chain's performance
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right metrics grid — hidden on small mobile, shown from sm up */}
          <motion.div
            className="hidden sm:grid grid-cols-2 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {libertyChainData.features.performance.metrics.map((metric, index) => {
              const Icon = icons[index % icons.length];
              return (
                <FloatingCard3D key={index} intensity={10}>
                  <Card
                    className="p-4 sm:p-6 space-y-3 sm:space-y-4 hover-elevate active-elevate-2 transition-all duration-300 border-border/50 h-full"
                    data-testid={`performance-card-${index}`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl font-black tabular-nums gradient-text">
                        <AnimatedCounter
                          target={parseInt(metric.value)}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                        {metric.label}
                      </div>
                    </div>
                  </Card>
                </FloatingCard3D>
              );
            })}
          </motion.div>

          {/* Mobile-only: compact 2-column metric strip */}
          <div className="sm:hidden grid grid-cols-2 gap-3">
            {libertyChainData.features.performance.metrics.map((metric, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Card
                  key={index}
                  className="p-3 space-y-1 border-border/50"
                  data-testid={`performance-card-mobile-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="text-xl font-black tabular-nums gradient-text">
                      <AnimatedCounter
                        target={parseInt(metric.value)}
                        prefix={metric.prefix}
                        suffix={metric.suffix}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {metric.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
