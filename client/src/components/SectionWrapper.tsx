import { ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  overflow?: boolean;
}

export function SectionWrapper({ children, className = '', id, overflow }: SectionWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.3,
    margin: '-10% 0px -10% 0px',
  });

  const sizeClass = overflow ? 'min-h-dvh' : 'min-h-dvh h-dvh';
  const snapClass = overflow ? 'snap-start' : 'snap-start snap-always';

  return (
    <motion.section
      ref={ref}
      id={id}
      data-section
      className={`${sizeClass} ${snapClass} relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      data-testid={`section-${id || 'wrapper'}`}
    >
      {children}
    </motion.section>
  );
}
