import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";

export function CTASection() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-8 text-center">
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm" data-testid="badge-get-started">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-base font-bold uppercase tracking-wider">Ready to Build?</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter" data-testid="text-cta-title">
            <SplitText type="words">Start Building on</SplitText>
            <br />
            <span className="gradient-text">Liberty Chain</span>
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="text-cta-subtitle">
            Join the next generation of blockchain developers building faster, cheaper, and more scalable applications.
          </p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="group text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto" data-testid="button-start-building-cta">
              <Rocket className="mr-2 h-5 w-5" />
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="group text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto backdrop-blur-sm" data-testid="button-read-docs-cta">
              <BookOpen className="mr-2 h-5 w-5" />
              Read Documentation
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
