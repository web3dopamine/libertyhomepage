import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { CalloutBadge } from "./CalloutBadge";
import { Link } from "wouter";

export function CTASection() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-5xl 2xl:max-w-[1100px] mx-auto px-4 sm:px-8 text-center">
        <motion.div
          className="space-y-6 sm:space-y-8 md:space-y-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CalloutBadge text="Join the Revolution" size="lg" data-testid="badge-get-started" />

          <h2 className="text-[clamp(1.875rem,min(5.5vw,10dvh),7rem)] font-black leading-[0.9] tracking-tighter" data-testid="text-cta-title">
            <SplitText type="words">Start Building on</SplitText>
            <br />
            <span className="gradient-text">Liberty Chain</span>
          </h2>

          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="text-cta-subtitle">
            Join the next generation of blockchain developers building faster, cheaper, and more scalable applications.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="group text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto" data-testid="button-start-building-cta" asChild>
              <Link href="/build">
                <Rocket className="mr-2 h-5 w-5" />
                Start Building Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto backdrop-blur-sm" data-testid="button-read-docs-cta" asChild>
              <Link href="/documentation">
                <BookOpen className="mr-2 h-5 w-5" />
                Read Documentation
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
