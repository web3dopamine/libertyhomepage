import { ReactNode, createContext, useContext, useState, useEffect, useRef } from 'react';

interface FullpageScrollContextType {
  activeSection: number;
  totalSections: number;
  scrollToSection: (index: number) => void;
}

const FullpageScrollContext = createContext<FullpageScrollContextType>({
  activeSection: 0,
  totalSections: 0,
  scrollToSection: () => {},
});

export const useFullpageScroll = () => useContext(FullpageScrollContext);

interface FullpageScrollLayoutProps {
  children: ReactNode;
}

export function FullpageScrollLayout({ children }: FullpageScrollLayoutProps) {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);

  const totalSections = Array.isArray(children) ? children.length : 1;

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = Array.from(
      containerRef.current.querySelectorAll('[data-section]')
    ) as HTMLElement[];
    sectionRefs.current = sections;

    const observerOptions = {
      root: containerRef.current,
      threshold: 0.5,
      rootMargin: '-10% 0px -10% 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            setActiveSection(index);
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [children]);

  return (
    <FullpageScrollContext.Provider
      value={{ activeSection, totalSections, scrollToSection }}
    >
      <div
        ref={containerRef}
        className="h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        data-testid="fullpage-scroll-container"
      >
        <style>{`
          div[data-testid="fullpage-scroll-container"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>
    </FullpageScrollContext.Provider>
  );
}
