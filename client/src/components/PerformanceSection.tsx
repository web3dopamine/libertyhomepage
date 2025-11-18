import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";
import { Zap, Shield, Layers, Gauge } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText, AnimatedGradientText } from "./SplitText";
import { FloatingCard3D } from "./FloatingCard3D";

const icons = [Zap, Gauge, Shield, Layers];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

export function PerformanceSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden" id="performance">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div 
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5" data-testid="badge-performance">
                <span className="text-sm font-bold uppercase tracking-wider">Unparalleled Performance</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight" data-testid="text-performance-title">
                <SplitText type="words">Build beyond limits.</SplitText>{" "}
                <span className="block mt-2">
                  <SplitText type="words" delay={0.3}>Scale </SplitText>
                  <AnimatedGradientText>without</AnimatedGradientText>
                  <SplitText type="words" delay={0.4}> compromise.</SplitText>
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed" data-testid="text-performance-description">
                {libertyChainData.features.performance.description}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button size="lg" variant="outline" className="group" data-testid="button-learn-performance">
                Learn about Liberty Chain's performance
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right metrics grid */}
          <motion.div 
            className="grid grid-cols-2 gap-6"
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
                    className="p-6 space-y-4 hover-elevate active-elevate-2 transition-all duration-300 border-border/50 h-full"
                    data-testid={`performance-card-${index}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-4xl font-black tabular-nums gradient-text">
                        <AnimatedCounter 
                          target={parseInt(metric.value)}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                        {metric.label}
                      </div>
                    </div>
                  </Card>
                </FloatingCard3D>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
