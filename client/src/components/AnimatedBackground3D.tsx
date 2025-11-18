import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function AnimatedBackground3D() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
          y: y1,
          scale,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          y: y2,
        }}
      />

      {/* 3D Geometric shapes */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-32 h-32"
        style={{
          y: y1,
          rotate,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-full h-full border-2 border-primary/20 rounded-lg"
          style={{
            transform: "rotateX(45deg) rotateY(45deg)",
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute top-2/3 right-1/3 w-24 h-24"
        style={{
          y: y2,
          rotate: useTransform(rotate, (r) => -r),
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-full h-full border-2 border-secondary/20"
          style={{
            transform: "rotateX(60deg) rotateZ(30deg)",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 4;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Grid lines with perspective */}
      <div className="absolute inset-0" style={{ perspective: "1000px" }}>
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"
          style={{
            transformOrigin: "center center",
            rotateX: useTransform(scrollYProgress, [0, 1], [0, 10]),
          }}
        />
      </div>
    </div>
  );
}
