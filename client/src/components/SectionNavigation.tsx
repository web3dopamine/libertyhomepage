import { motion } from 'framer-motion';
import { useFullpageScroll } from './FullpageScrollLayout';

interface SectionNavigationProps {
  sectionNames?: string[];
}

export function SectionNavigation({ sectionNames = [] }: SectionNavigationProps) {
  const { activeSection, totalSections, scrollToSection } = useFullpageScroll();

  const sections = sectionNames.length > 0 
    ? sectionNames 
    : Array.from({ length: totalSections }, (_, i) => `Section ${i + 1}`);

  return (
    <nav 
      className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      data-testid="section-navigation"
    >
      <div className="flex flex-col gap-4">
        {sections.map((name, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center gap-3"
            aria-label={`Go to ${name}`}
            data-testid={`nav-dot-${index}`}
          >
            {/* Dot */}
            <div className="relative">
              <div 
                className={`w-2 h-2 rounded-full border-2 transition-all duration-300 ${
                  activeSection === index
                    ? 'border-primary bg-primary scale-125'
                    : 'border-muted-foreground/40 bg-transparent hover:border-primary/60'
                }`}
              />
              {activeSection === index && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </div>

            {/* Label on hover */}
            <span 
              className="absolute right-6 px-3 py-1 bg-card border border-border rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              data-testid={`nav-label-${index}`}
            >
              {name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
