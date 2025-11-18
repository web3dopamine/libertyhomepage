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

export default function Home() {
  return (
    <div className="min-h-screen">
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
