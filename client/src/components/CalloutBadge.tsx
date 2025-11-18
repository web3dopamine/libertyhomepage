import { motion } from 'framer-motion';

interface CalloutBadgeProps {
  text: string;
  animate?: boolean;
  showPulse?: boolean;
  useGradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-testid'?: string;
}

export function CalloutBadge({ 
  text, 
  animate = true, 
  showPulse = true,
  useGradient = true,
  size = 'md',
  className = "", 
  "data-testid": testId 
}: CalloutBadgeProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-3 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  const textClasses = useGradient ? 'gradient-text' : 'text-primary';

  const badge = (
    <div 
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm shadow-lg shadow-primary/10 ${className}`}
      data-testid={testId}
    >
      {showPulse && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" data-testid={testId ? `${testId}-pulse` : undefined} />}
      <span className={`font-bold uppercase tracking-wider ${textClasses}`} data-testid={testId ? `${testId}-text` : undefined}>
        {text}
      </span>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}
