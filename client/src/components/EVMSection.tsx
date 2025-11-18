import { Button } from "@/components/ui/button";
import { libertyChainData } from "@shared/schema";
import { ArrowRight, Code2, FileCode, Boxes } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { CalloutBadge } from "./CalloutBadge";

export function EVMSection() {
  return (
    <section className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-card/30 to-background" id="technology">
      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div 
            className="space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-4">
              <CalloutBadge 
                text="Programmable, Gas Free" 
                data-testid="badge-evm"
              />
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight" data-testid="text-evm-title">
                <SplitText type="words">
                  {libertyChainData.features.evmCompatibility.title}
                </SplitText>
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed" data-testid="text-evm-description">
                {libertyChainData.features.evmCompatibility.description}
              </p>
            </div>

            <Button size="lg" variant="outline" className="group" data-testid="button-developer-briefing">
              Check the Developer Briefing
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Right visual */}
          <motion.div 
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative w-full aspect-square">
              {/* Gradient blob */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/40 to-primary/40 rounded-[3rem] blur-3xl opacity-50"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Icons floating with 3D effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                  <motion.div 
                    className="absolute top-1/4 left-1/4 w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30"
                    animate={{
                      y: [0, -20, 0],
                      rotateY: [0, 180, 360],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Code2 className="w-10 h-10 text-primary" />
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/3 right-1/4 w-24 h-24 bg-secondary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-secondary/30"
                    animate={{
                      y: [0, 20, 0],
                      rotateX: [0, 180, 360],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <FileCode className="w-12 h-12 text-secondary" />
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30"
                    animate={{
                      y: [0, -15, 0],
                      rotateZ: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Boxes className="w-14 h-14 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
