import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PerformanceSection } from "@/components/PerformanceSection";
import { EVMSection } from "@/components/EVMSection";
import { NetworkSection } from "@/components/NetworkSection";
import { TrilemmaSection } from "@/components/TrilemmaSection";
import { EcosystemSection } from "@/components/EcosystemSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { FullpageScrollLayout } from "@/components/FullpageScrollLayout";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SectionNavigation } from "@/components/SectionNavigation";
import { SidebarNav } from "@/components/SidebarNav";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [showSidebar, setShowSidebar] = useState(false);

  // Show sidebar after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('[data-testid="fullpage-scroll-container"]');
      const heroSection = document.getElementById('hero');
      
      if (scrollContainer && heroSection) {
        const scrollTop = scrollContainer.scrollTop;
        const heroHeight = heroSection.offsetHeight;
        // Show sidebar when scrolled more than 50% past hero
        setShowSidebar(scrollTop > heroHeight * 0.5);
      }
    };

    const scrollContainer = document.querySelector('[data-testid="fullpage-scroll-container"]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const sectionNames = [
    "Home",
    "Performance",
    "EVM Compatible",
    "Network",
    "Trilemma",
    "Ecosystem",
    "Connect"
  ];

  return (
    <div className="min-h-screen">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 origin-left"
        style={{ scaleX }}
      />
      <Navigation />
      
      {/* Section navigation dots */}
      <SectionNavigation sectionNames={sectionNames} />

      {/* Sidebar - shown after hero section */}
      {showSidebar && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 top-20 bottom-0 z-40"
        >
          <SidebarNav />
        </motion.div>
      )}

      <FullpageScrollLayout>
        <SectionWrapper id="hero">
          <HeroSection />
        </SectionWrapper>

        <SectionWrapper id="performance">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <PerformanceSection />
          </div>
        </SectionWrapper>

        <SectionWrapper id="evm">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <EVMSection />
          </div>
        </SectionWrapper>

        <SectionWrapper id="network">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <NetworkSection />
          </div>
        </SectionWrapper>

        <SectionWrapper id="trilemma">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <TrilemmaSection />
          </div>
        </SectionWrapper>

        <SectionWrapper id="ecosystem">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <EcosystemSection />
          </div>
        </SectionWrapper>

        <SectionWrapper id="footer" className="flex flex-col">
          <div className={showSidebar ? "md:ml-[60px]" : ""}>
            <CTASection />
            <Footer />
          </div>
        </SectionWrapper>
      </FullpageScrollLayout>
    </div>
  );
}
