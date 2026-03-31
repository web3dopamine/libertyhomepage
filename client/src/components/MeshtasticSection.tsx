import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Wifi, RefreshCw, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { CalloutBadge } from "./CalloutBadge";

const features = [
  {
    icon: Shield,
    title: "Unstoppable by Design",
    points: ["Chain state awareness", "Validator coordination", "Checkpoint propagation"],
  },
  {
    icon: Wifi,
    title: "LoRa Mesh Packets",
    points: ["Latest block height & hash", "Finalized checkpoints", "Compressed transaction intents"],
  },
  {
    icon: RefreshCw,
    title: "Seamless Recovery",
    points: ["Nodes reconcile from mesh checkpoints", "Missing blocks sync automatically", "Full performance resumes instantly"],
  },
  {
    icon: Globe,
    title: "Built for the Real World",
    points: ["Rural & agricultural environments", "Censorship-restricted regions", "Emergency networks"],
  },
];

const NODE_POSITIONS = [
  { cx: "50%", cy: "50%", r: 8, primary: true },
  { cx: "20%", cy: "20%", r: 5, primary: false },
  { cx: "80%", cy: "15%", r: 5, primary: false },
  { cx: "85%", cy: "55%", r: 6, primary: false },
  { cx: "65%", cy: "82%", r: 5, primary: false },
  { cx: "15%", cy: "70%", r: 5, primary: false },
  { cx: "38%", cy: "28%", r: 4, primary: false },
  { cx: "72%", cy: "38%", r: 4, primary: false },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 6], [2, 6], [2, 7], [3, 7], [3, 4],
  [4, 5], [5, 1], [6, 7],
];

function MeshVisualization() {
  const svgWidth = 400;
  const svgHeight = 400;
  const px = (val: string) => (parseFloat(val) / 100) * svgWidth;
  const py = (val: string) => (parseFloat(val) / 100) * svgHeight;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 rounded-[3rem] blur-3xl opacity-50"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="relative z-10 w-full max-w-[280px] sm:max-w-[360px] h-auto">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {CONNECTIONS.map(([from, to], i) => {
          const a = NODE_POSITIONS[from];
          const b = NODE_POSITIONS[to];
          return (
            <motion.line
              key={i}
              x1={px(a.cx)} y1={py(a.cy)}
              x2={px(b.cx)} y2={py(b.cy)}
              stroke="hsl(var(--primary))"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0.2, 0.5, 0.2],
                strokeDashoffset: [0, -40],
              }}
              transition={{
                pathLength: { duration: 1, delay: i * 0.08 },
                opacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                strokeDashoffset: { duration: 3 + i * 0.2, repeat: Infinity, ease: "linear" },
              }}
            />
          );
        })}
        {NODE_POSITIONS.map((node, i) => (
          <g key={i}>
            <motion.circle
              cx={px(node.cx)} cy={py(node.cy)} r={node.r * 3}
              fill="none" stroke="hsl(var(--primary))" strokeWidth={0.8}
              animate={{ r: [node.r * 2, node.r * 5], opacity: [0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
            />
            <circle cx={px(node.cx)} cy={py(node.cy)} r={node.r * 2.5} fill="url(#nodeGlow)" />
            <motion.circle
              cx={px(node.cx)} cy={py(node.cy)} r={node.r}
              fill={node.primary ? "hsl(var(--primary))" : "hsl(var(--background))"}
              stroke="hsl(var(--primary))" strokeWidth={node.primary ? 0 : 1.5}
              filter="url(#glow)"
              animate={node.primary ? { scale: [1, 1.15, 1] } : { opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          </g>
        ))}
        {[1.5, 2.5, 3.5].map((mult, i) => (
          <motion.circle
            key={`wave-${i}`}
            cx={px("50%")} cy={py("50%")} r={8 * mult}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={0.6} strokeOpacity={0.4}
            animate={{ r: [8 * mult, 8 * mult + 30], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 0.9 }}
          />
        ))}
        <text x={px("50%")} y={py("50%") + 22} textAnchor="middle" fontSize="9" fill="hsl(var(--primary))" fontFamily="monospace" opacity={0.8}>
          LIBERTY NODE
        </text>
      </svg>
      {[
        { label: "Block #892,411", top: "10%", left: "5%" },
        { label: "0 gas fees", top: "55%", right: "3%" },
        { label: "LoRa 915MHz", bottom: "10%", left: "8%" },
      ].map((tag, i) => (
        <motion.div
          key={i}
          className="absolute text-[10px] font-mono text-primary/70 border border-primary/20 bg-primary/5 rounded px-2 py-1 backdrop-blur-sm"
          style={{ top: tag.top, left: tag.left, right: (tag as { right?: string }).right, bottom: tag.bottom }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1.1 }}
        >
          {tag.label}
        </motion.div>
      ))}
    </div>
  );
}

export function MeshtasticSection() {
  return (
    <section
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-card/30 to-background"
      id="meshtastic"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-10 md:py-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">

          {/* Left content */}
          <motion.div
            className="space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-3 sm:space-y-4">
              <CalloutBadge text="Off-Grid Resilience Layer" data-testid="badge-meshtastic" />
              <h2
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight"
                data-testid="text-meshtastic-title"
              >
                <SplitText type="words">
                  Stay online, even when the world goes offline.
                </SplitText>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-muted-foreground leading-relaxed" data-testid="text-meshtastic-description">
                Liberty Chain integrates a Meshtastic-powered mesh network, enabling blockchain continuity beyond traditional internet infrastructure.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="space-y-1 sm:space-y-2 p-3 sm:p-4 rounded-xl border border-primary/10 bg-primary/5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  data-testid={`card-feature-${i}`}
                >
                  <div className="flex items-center gap-2">
                    <feat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">{feat.title}</span>
                  </div>
                  <ul className="space-y-0.5 sm:space-y-1 hidden sm:block">
                    {feat.points.map((pt) => (
                      <li key={pt} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                A blockchain that doesn't just scale — <span className="text-foreground">it survives.</span>
              </p>
              <Link href="/resilience-layer">
                <Button size="lg" variant="outline" className="group w-full sm:w-auto text-sm sm:text-base" data-testid="button-resilience-layer">
                  Explore the Resilience Layer
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right visual — hidden on mobile */}
          <motion.div
            className="relative order-1 lg:order-2 hidden sm:block"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative w-full aspect-square">
              <MeshVisualization />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
