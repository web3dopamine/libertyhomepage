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
import { useQuery } from "@tanstack/react-query";

// ── Section registry ─────────────────────────────────────────────────────────
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  performance: PerformanceSection,
  meshtastic:  MeshtasticSection,
  evm:         EVMSection,
  network:     NetworkSection,
  trilemma:    TrilemmaSection,
  ecosystem:   EcosystemSection,
  press:       PressSection,
  partners:    PartnersSection,
  newsletter:  NewsletterSection,
  roadmap:     RoadmapSection,
};

const SECTION_NAMES: Record<string, string> = {
  performance: "Performance",
  meshtastic:  "Meshtastic",
  evm:         "EVM Compatible",
  network:     "Network",
  trilemma:    "Trilemma",
  ecosystem:   "Ecosystem",
  press:       "Press",
  partners:    "Partners",
  newsletter:  "Newsletter",
  roadmap:     "Roadmap",
};

const SECTION_CLASSES: Record<string, string> = {
  newsletter: "flex flex-col",
};

const DEFAULT_ORDER = [
  "performance", "meshtastic", "evm", "network",
  "trilemma", "ecosystem", "press", "partners", "newsletter", "roadmap",
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const { data: sectionOrder = DEFAULT_ORDER } = useQuery<string[]>({
    queryKey: ["/api/section-order"],
    staleTime: 1000 * 60 * 5,
  });

  const sectionNames = [
    "Home",
    ...sectionOrder.map(id => SECTION_NAMES[id] ?? id),
    "Connect",
  ];

  return (
    <div className="min-h-screen">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 origin-left"
        style={{ scaleX }}
      />
      <Navigation />

      <FullpageScrollLayout>
        <SectionNavigation sectionNames={sectionNames} />

        {/* Hero — always first */}
        <SectionWrapper id="hero">
          <HeroSection />
        </SectionWrapper>

        {/* Reorderable sections */}
        {sectionOrder.map(id => {
          const Component = SECTION_COMPONENTS[id];
          if (!Component) return null;
          return (
            <SectionWrapper key={id} id={id} className={SECTION_CLASSES[id] ?? ""}>
              <Component />
            </SectionWrapper>
          );
        })}

        {/* Footer — always last */}
        <SectionWrapper id="footer" className="flex flex-col" overflow>
          <CTASection />
          <Footer />
        </SectionWrapper>
      </FullpageScrollLayout>
    </div>
  );
}
