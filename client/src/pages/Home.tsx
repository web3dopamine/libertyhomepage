import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MetricsBar } from "@/components/MetricsBar";
import { FloatingKeywords } from "@/components/FloatingKeywords";
import { PerformanceSection } from "@/components/PerformanceSection";
import { EVMSection } from "@/components/EVMSection";
import { NetworkSection } from "@/components/NetworkSection";
import { TrilemmaSection } from "@/components/TrilemmaSection";
import { EcosystemSection } from "@/components/EcosystemSection";
import { Footer } from "@/components/Footer";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 origin-left"
        style={{ scaleX }}
      />
      <Navigation />
      <main>
        <HeroSection />
        <MetricsBar />
        <FloatingKeywords />
        <PerformanceSection />
        <EVMSection />
        <NetworkSection />
        <TrilemmaSection />
        <EcosystemSection />
      </main>
      <Footer />
    </div>
  );
}
