import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PerformanceSection } from "@/components/PerformanceSection";
import { MeshtasticSection } from "@/components/MeshtasticSection";
import { EVMSection } from "@/components/EVMSection";
import { NetworkSection } from "@/components/NetworkSection";
import { TrilemmaSection } from "@/components/TrilemmaSection";
import { EcosystemSection } from "@/components/EcosystemSection";
import { PressSection } from "@/components/PressSection";
import { PartnersSection } from "@/components/PartnersSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { RoadmapSection } from "@/components/RoadmapSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { FullpageScrollLayout } from "@/components/FullpageScrollLayout";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SectionNavigation } from "@/components/SectionNavigation";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const sectionNames = [
    "Home",
    "Performance",
    "Meshtastic",
    "EVM Compatible",
    "Network",
    "Trilemma",
    "Ecosystem",
    "Press",
    "Partners",
    "Newsletter",
    "Roadmap",
    "Connect",
  ];

  return (
    <div className="min-h-screen">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 origin-left"
        style={{ scaleX }}
      />
      <Navigation />

      <FullpageScrollLayout>
        {/* Section navigation dots */}
        <SectionNavigation sectionNames={sectionNames} />

        <SectionWrapper id="hero">
          <HeroSection />
        </SectionWrapper>

        <SectionWrapper id="performance">
          <PerformanceSection />
        </SectionWrapper>

        <SectionWrapper id="meshtastic">
          <MeshtasticSection />
        </SectionWrapper>

        <SectionWrapper id="evm">
          <EVMSection />
        </SectionWrapper>

        <SectionWrapper id="network">
          <NetworkSection />
        </SectionWrapper>

        <SectionWrapper id="trilemma">
          <TrilemmaSection />
        </SectionWrapper>

        <SectionWrapper id="ecosystem">
          <EcosystemSection />
        </SectionWrapper>

        <SectionWrapper id="press">
          <PressSection />
        </SectionWrapper>

        <SectionWrapper id="partners">
          <PartnersSection />
        </SectionWrapper>

        <SectionWrapper id="newsletter" className="flex flex-col">
          <NewsletterSection />
        </SectionWrapper>

        <SectionWrapper id="roadmap">
          <RoadmapSection />
        </SectionWrapper>

        <SectionWrapper id="footer" className="flex flex-col">
          <CTASection />
          <Footer />
        </SectionWrapper>
      </FullpageScrollLayout>
    </div>
  );
}
