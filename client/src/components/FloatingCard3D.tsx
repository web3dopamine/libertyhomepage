import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";

interface FloatingCard3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function FloatingCard3D({ children, className = "", intensity = 15 }: FloatingCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxElementProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxElement({ children, className = "", speed = 0.5 }: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  const ySmooth = useSpring(y, { damping: 20, stiffness: 100 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: useTransform(ySmooth, [0, 1], [0, speed * 100]) }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}
