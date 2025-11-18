import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SectionTransitionProps {
  variant?: "wave" | "diagonal" | "circle" | "gradient";
}

export function SectionTransition({ variant = "wave" }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const clipPath = useTransform(scrollYProgress, [0, 0.5, 1], 
    variant === "wave" 
      ? [
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(0 10%, 100% 0, 100% 90%, 0 100%)",
          "polygon(0 20%, 100% 0, 100% 80%, 0 100%)"
        ]
      : variant === "diagonal"
      ? [
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(0 0, 100% 15%, 100% 100%, 0 85%)",
          "polygon(0 0, 100% 30%, 100% 100%, 0 70%)"
        ]
      : variant === "circle"
      ? [
          "circle(0% at 50% 50%)",
          "circle(50% at 50% 50%)",
          "circle(100% at 50% 50%)"
        ]
      : [
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        ]
  );

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  if (variant === "gradient") {
    return (
      <div ref={ref} className="h-32 w-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
          style={{ opacity }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.3) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "200% 0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className="h-24 w-full relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"
        style={{ clipPath, opacity }}
      />
    </div>
  );
}
