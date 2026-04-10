import { motion } from "framer-motion";
import { Shield, Zap, Star } from "lucide-react";
import { SplitText } from "./SplitText";
import { CalloutBadge } from "./CalloutBadge";

// ── Animated traffic-lane visual ──────────────────────────────────────────────
function SentinelVisual({ compact = false }: { compact?: boolean }) {
  const lanes = [
    { label: "Green Lane", sublabel: "Verified builders", color: "emerald", delay: 0, dots: 3 },
    { label: "Amber Lane", sublabel: "Screening & rate-limit", color: "amber", delay: 0.2, dots: 2 },
    { label: "Quarantine", sublabel: "Suspicious — blocked", color: "red", delay: 0.4, dots: 1 },
  ] as const;

  const colorMap = {
    emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/40", dot: "bg-emerald-400", glow: "shadow-emerald-500/30", text: "text-emerald-400" },
    amber:   { bg: "bg-amber-500/20",   border: "border-amber-500/40",   dot: "bg-amber-400",   glow: "shadow-amber-500/30",   text: "text-amber-400"   },
    red:     { bg: "bg-red-500/20",     border: "border-red-500/40",     dot: "bg-red-400",     glow: "shadow-red-500/30",     text: "text-red-400"     },
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-full gap-${compact ? "3" : "4"}`}>
      {/* Glow orb */}
      <motion.div
        className={`absolute ${compact ? "w-32 h-32" : "w-56 h-56"} rounded-full bg-primary/10 blur-3xl`}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sentinel core icon */}
      <motion.div
        className={`relative z-10 ${compact ? "w-12 h-12" : "w-20 h-20"} rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-1`}
        animate={{ boxShadow: ["0 0 10px hsl(var(--primary)/0.3)", "0 0 30px hsl(var(--primary)/0.6)", "0 0 10px hsl(var(--primary)/0.3)"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Shield className={`${compact ? "w-6 h-6" : "w-10 h-10"} text-primary`} />
      </motion.div>

      {/* Traffic lanes */}
      <div className={`relative z-10 w-full ${compact ? "max-w-[220px] space-y-2" : "max-w-xs space-y-3"}`}>
        {lanes.map(({ label, sublabel, color, delay, dots }) => {
          const c = colorMap[color];
          return (
            <motion.div
              key={label}
              className={`flex items-center gap-2 rounded-xl border ${c.bg} ${c.border} ${compact ? "px-3 py-1.5" : "px-4 py-2.5"}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay }}
            >
              {/* Animated dots */}
              <div className="flex gap-1 flex-shrink-0">
                {Array.from({ length: dots }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full ${c.dot} shadow-md ${c.glow}`}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 + delay }}
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className={`${compact ? "text-[10px]" : "text-xs"} font-black ${c.text} leading-none`}>{label}</p>
                {!compact && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{sublabel}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Feature pills ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield,
    title: "AI Mempool Policing",
    desc: "Analyses bytecode complexity, wallet behaviour, and deployment patterns to distinguish builders from botnets before a single block is minted.",
  },
  {
    icon: Zap,
    title: "Adaptive Throughput",
    desc: "Intelligent traffic lanes route verified builders at full speed, screen unknown wallets, and quarantine suspicious activity — keeping the highway clear.",
  },
  {
    icon: Star,
    title: "Reputation-Based Access",
    desc: "The highest-reputation model replaces the highest-bidder. Long-term contributors earn higher throughput quotas and instant admission.",
  },
];

// ── Section ───────────────────────────────────────────────────────────────────
export function SentinelSection() {
  return (
    <section
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-card/30 to-background"
      id="sentinel"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-8 md:py-10 relative z-10 w-full">

        {/* ── Mobile layout ─────────────────────────────── */}
        <div className="flex flex-col sm:hidden gap-4">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <CalloutBadge text="AI-Powered Defense Layer" data-testid="badge-sentinel" />
            <h2 className="text-3xl font-black leading-[0.9] tracking-tight" data-testid="text-sentinel-title">
              <SplitText type="words">Self-Defending Network</SplitText>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Liberty Sentinel is an autonomous AI admission controller that kills spam, prevents congestion, and prioritises real builders — all without charging a fee.
            </p>
          </motion.div>

          <motion.div
            className="relative h-52 w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SentinelVisual compact />
          </motion.div>

          <div className="space-y-2">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black leading-none mb-1">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic text-center">
            "Zero fees. Zero spam. Total Liberty."
          </p>
        </div>

        {/* ── Tablet / Desktop layout ────────────────────── */}
        <div className="hidden sm:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text + features */}
          <motion.div
            className="space-y-6 md:space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-4">
              <CalloutBadge text="AI-Powered Defense Layer" data-testid="badge-sentinel-desktop" />
              <h2 className="text-[clamp(1.875rem,min(5.5vw,10dvh),7rem)] font-black leading-[0.9] tracking-tight">
                <SplitText type="words">Self-Defending Network</SplitText>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Liberty Sentinel is an autonomous AI admission controller that kills spam, prevents congestion, and prioritises real builders — without charging a fee.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm leading-none mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              "Zero fees. Zero spam. Total Liberty."
            </motion.p>
          </motion.div>

          {/* Right — animated visual */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative w-full aspect-square">
              <SentinelVisual compact={false} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
