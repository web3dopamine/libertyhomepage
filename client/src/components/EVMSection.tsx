import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Code2, FileCode, Boxes } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { Link } from "wouter";
import { CalloutBadge } from "./CalloutBadge";

function EVMVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/40 to-primary/40 rounded-[3rem] blur-3xl opacity-50"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          <motion.div
            className={`absolute ${compact ? "top-[15%] left-[20%] w-12 h-12" : "top-1/4 left-1/4 w-20 h-20"} bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30`}
            animate={{ y: [0, compact ? -10 : -20, 0], rotateY: [0, 180, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Code2 className={`${compact ? "w-6 h-6" : "w-10 h-10"} text-primary`} />
          </motion.div>
          <motion.div
            className={`absolute ${compact ? "top-[30%] right-[20%] w-14 h-14" : "top-1/3 right-1/4 w-24 h-24"} bg-secondary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-secondary/30`}
            animate={{ y: [0, compact ? 10 : 20, 0], rotateX: [0, 180, 360] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <FileCode className={`${compact ? "w-7 h-7" : "w-12 h-12"} text-secondary`} />
          </motion.div>
          <motion.div
            className={`absolute ${compact ? "bottom-[20%] left-[30%] w-16 h-16" : "bottom-1/3 left-1/3 w-28 h-28"} bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30`}
            animate={{ y: [0, compact ? -8 : -15, 0], rotateZ: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Boxes className={`${compact ? "w-8 h-8" : "w-14 h-14"} text-primary`} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function EVMSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-card/30 to-background" id="technology">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-10 md:py-16 relative z-10 w-full">

        {/* Mobile layout */}
        <div className="flex flex-col sm:hidden gap-4">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <CalloutBadge text="Programmable, Gas Free" data-testid="badge-evm" />
            <h2 className="text-3xl font-black leading-[0.9] tracking-tight" data-testid="text-evm-title">
              <SplitText type="words">{libertyChainData.features.evmCompatibility.title}</SplitText>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-evm-description">
              {libertyChainData.features.evmCompatibility.description}
            </p>
          </motion.div>

          {/* Compact animation */}
          <motion.div
            className="relative h-44 w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <EVMVisual compact={true} />
          </motion.div>

          <Button size="lg" variant="outline" className="group w-full text-sm" data-testid="button-developer-briefing" asChild>
            <Link href="/build">
              Check the Developer Briefing
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Tablet/desktop layout */}
        <div className="hidden sm:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            className="space-y-6 md:space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-4">
              <CalloutBadge text="Programmable, Gas Free" data-testid="badge-evm-desktop" />
              <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                <SplitText type="words">{libertyChainData.features.evmCompatibility.title}</SplitText>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                {libertyChainData.features.evmCompatibility.description}
              </p>
            </div>
            <Button size="lg" variant="outline" className="group" data-testid="button-developer-briefing-desktop" asChild>
              <Link href="/build">
                Check the Developer Briefing
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative w-full aspect-square">
              <EVMVisual compact={false} />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
