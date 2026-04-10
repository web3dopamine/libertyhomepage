import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import { Shield, Brain, GitBranch, Lock, Coins, TrendingUp, Cpu, Activity, AlertTriangle } from "lucide-react";
import { SplitText } from "./SplitText";
import { CalloutBadge } from "./CalloutBadge";

// ── Animated orbiting node around the brain ───────────────────────────────────
interface NodeProps {
  angle: number; // degrees
  radius: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  color: string; // tailwind color name
  delay: number;
  size?: "sm" | "md";
}

const colorStyles: Record<string, { bg: string; border: string; text: string; glow: string; ring: string }> = {
  cyan:    { bg: "bg-cyan-500/15",    border: "border-cyan-500/40",    text: "text-cyan-400",    glow: "#22d3ee", ring: "rgba(34,211,238,0.2)" },
  violet:  { bg: "bg-violet-500/15",  border: "border-violet-500/40",  text: "text-violet-400",  glow: "#a78bfa", ring: "rgba(167,139,250,0.2)" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", glow: "#34d399", ring: "rgba(52,211,153,0.2)" },
  amber:   { bg: "bg-amber-500/15",   border: "border-amber-500/40",   text: "text-amber-400",   glow: "#fbbf24", ring: "rgba(251,191,36,0.2)" },
};

// ── Scanning ring ─────────────────────────────────────────────────────────────
function ScanRing({ size, duration, opacity }: { size: number; duration: number; opacity: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-primary/20 pointer-events-none"
      style={{ width: size, height: size, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
      animate={{ scale: [1, 1.4, 1], opacity: [opacity, 0, opacity] }}
      transition={{ duration, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

// ── Floating particle along a beam ────────────────────────────────────────────
function Particle({ color, dir, delay }: { color: string; dir: "in" | "out"; delay: number }) {
  return (
    <motion.div
      className={`absolute top-[50%] w-1.5 h-1.5 rounded-full -translate-y-1/2`}
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      initial={{ left: dir === "in" ? "-8px" : "50%" }}
      animate={{ left: dir === "in" ? "50%" : "calc(100% + 8px)", opacity: [0, 1, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: "linear" }}
    />
  );
}

// ── Main AI Brain visual ──────────────────────────────────────────────────────
function SentinelBrain({ compact = false }: { compact?: boolean }) {
  const coreSize = compact ? 52 : 80;
  const ringR    = compact ? 100 : 168;
  // Nodes placed at 45° diagonals so the 0° (right) and 180° (left) sides
  // remain clear for the TX-inflow and exit-lane lines respectively.
  const nodes: NodeProps[] = [
    { angle: -135, radius: ringR, icon: Lock,      label: "Deterministic Guardrails", sublabel: "Hard-coded security rules", color: "cyan",    delay: 0 },
    { angle:  -45, radius: ringR, icon: Brain,     label: "Heuristic Scoring",        sublabel: "50+ AI risk vectors",        color: "violet",  delay: 0.3 },
    { angle:   45, radius: ringR, icon: GitBranch, label: "On-Chain Registry",        sublabel: "Transparent governance",     color: "emerald", delay: 0.6 },
    { angle:  135, radius: ringR, icon: Coins,     label: "Economic Bonds",           sublabel: "Skin-in-the-game deposits",  color: "amber",   delay: 0.9 },
  ];

  const lanes = [
    { label: "Green Lane",  sub: "Verified builders",      color: "#34d399", dotCount: 3, speed: 0.6 },
    { label: "Amber Lane",  sub: "Screening & rate-limit", color: "#fbbf24", dotCount: 2, speed: 1.0 },
    { label: "Quarantine",  sub: "Blocked — suspicious",   color: "#f87171", dotCount: 1, speed: 2.0 },
  ];

  const containerW = compact ? 300 : 500;
  const containerH = compact ? 280 : 480;
  const cx = containerW / 2;
  const cy = containerH / 2;

  // Shift all four corner nodes up-left by ~28px (≈10 mm on screen)
  const nodeOX = -28;
  const nodeOY = -28;

  function toXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: containerW, height: containerH }}
    >
      {/* ── SVG connection lines ─────────────────────────── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={containerW}
        height={containerH}
        style={{ overflow: "visible" }}
      >
        {nodes.map((n) => {
          const { x, y } = toXY(n.angle, n.radius);
          const c = colorStyles[n.color];
          return (
            <motion.line
              key={n.label}
              x1={cx} y1={cy} x2={x + nodeOX} y2={y + nodeOY}
              stroke={c.glow}
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.35"
              initial={{ pathLength: 0 }}
              animate={{ strokeDashoffset: [0, -8] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: n.delay }}
            />
          );
        })}

        {/* TX inflow lines */}
        {[-22, 0, 22].map((offset, i) => (
          <motion.line
            key={`in-${i}`}
            x1={0} y1={cy + offset}
            x2={cx - coreSize / 2 - 6} y2={cy + offset}
            stroke="#22d3ee"
            strokeWidth="1"
            strokeDasharray="3 5"
            strokeOpacity="0.25"
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
          />
        ))}

        {/* Lane outflow lines */}
        {lanes.map(({ color }, i) => {
          const yOff = (i - 1) * (compact ? 22 : 26);
          return (
            <motion.line
              key={`out-${i}`}
              x1={cx + coreSize / 2 + 6} y1={cy + yOff}
              x2={containerW} y2={cy + yOff}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
              animate={{ strokeDashoffset: [0, -8] }}
              transition={{ duration: lanes[i].speed * 0.5, repeat: Infinity, ease: "linear" }}
            />
          );
        })}
      </svg>

      {/* ── Orbiting node cards ──────────────────────────── */}
      {nodes.map((n) => {
        const { x, y } = toXY(n.angle, n.radius);
        const c = colorStyles[n.color];
        const Icon = n.icon;
        return (
          <motion.div
            key={n.label}
            className={`absolute flex flex-col items-center gap-1 text-center`}
            style={{
              left: x + nodeOX,
              top: y + nodeOY,
              transform: "translate(-50%, -50%)",
              width: compact ? 80 : 112,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: n.delay }}
          >
            <motion.div
              className={`rounded-xl border ${c.bg} ${c.border} flex items-center justify-center`}
              style={{ width: compact ? 34 : 46, height: compact ? 34 : 46 }}
              animate={{ boxShadow: [`0 0 8px ${c.glow}40`, `0 0 18px ${c.glow}80`, `0 0 8px ${c.glow}40`] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: n.delay }}
            >
              <Icon className={`${compact ? "w-3.5 h-3.5" : "w-5 h-5"} ${c.text}`} />
            </motion.div>
            {!compact && (
              <>
                <p className={`text-[10px] font-black leading-tight ${c.text}`}>{n.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{n.sublabel}</p>
              </>
            )}
          </motion.div>
        );
      })}

      {/* ── TX inflow labels ─────────────────────────────── */}
      {!compact && (
        <div
          className="absolute flex flex-col gap-2"
          style={{ left: 4, top: "50%", transform: "translateY(-50%)" }}
        >
          {["TX", "TX", "TX"].map((t, i) => (
            <motion.span
              key={i}
              className="text-[9px] font-black text-cyan-400/50 font-mono"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35 }}
            >
              {t}
            </motion.span>
          ))}
        </div>
      )}

      {/* ── Lane exit labels ─────────────────────────────── */}
      {!compact && (
        <div
          className="absolute flex flex-col gap-3"
          style={{ right: 2, top: "50%", transform: "translateY(-50%)" }}
        >
          {lanes.map(({ label, color }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.3 }}
              />
              <span className="text-[9px] font-black" style={{ color }}>{label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Central AI Brain Orb ────────────────────────── */}
      <div
        className="absolute"
        style={{ left: cx, top: cy, transform: "translate(-50%,-50%)" }}
      >
        {/* Scan rings */}
        <ScanRing size={coreSize * 1.8} duration={3}   opacity={0.5} />
        <ScanRing size={coreSize * 2.4} duration={3.8} opacity={0.3} />
        <ScanRing size={coreSize * 3.0} duration={4.8} opacity={0.2} />

        {/* Spinning outer orbit ring */}
        <motion.div
          className="absolute rounded-full border border-dashed border-primary/20 pointer-events-none"
          style={{
            width: coreSize * 2.2, height: coreSize * 2.2,
            top: "50%", left: "50%", x: "-50%", y: "-50%",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full border border-dashed border-primary/10 pointer-events-none"
          style={{
            width: coreSize * 2.7, height: coreSize * 2.7,
            top: "50%", left: "50%", x: "-50%", y: "-50%",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* Core glow blob */}
        <motion.div
          className="absolute rounded-full bg-primary/20 blur-2xl pointer-events-none"
          style={{ width: coreSize * 2, height: coreSize * 2, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Core shield */}
        <motion.div
          className="relative flex items-center justify-center rounded-2xl bg-primary/20 border-2 border-primary/50 backdrop-blur-sm"
          style={{ width: coreSize, height: coreSize }}
          animate={{ boxShadow: ["0 0 12px hsl(var(--primary)/0.4)", "0 0 36px hsl(var(--primary)/0.8)", "0 0 12px hsl(var(--primary)/0.4)"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className={`${compact ? "w-6 h-6" : "w-9 h-9"} text-primary`} />

          {/* Scanning sweep line */}
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          >
            <motion.div
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Left-panel feature rows ───────────────────────────────────────────────────
const BRAIN_COMPONENTS = [
  {
    icon: Lock,
    color: "cyan",
    title: "Deterministic Guardrails",
    desc: "Hard-coded security rules inside the custom Reth tx pool — smart contract blacklists, known-attack pattern hashes, hard limits on gas and bytecode size, MEV sandwich detection.",
  },
  {
    icon: Brain,
    color: "violet",
    title: "Heuristic Scoring Engine",
    desc: "The off-chain AI brain. Scores every transaction across 50+ risk vectors — gas manipulation, wallet age, token volume, contract similarity — returning a 0–100 risk score in under 1 ms.",
  },
  {
    icon: GitBranch,
    color: "emerald",
    title: "On-Chain Deployer Registry",
    desc: "Every deployer's compliance history recorded transparently on-chain. Community can flag wallets; DAO can update scoring weights. Fully auditable.",
  },
  {
    icon: Coins,
    color: "amber",
    title: "Economic Bonds",
    desc: "Large-scale token launches and bridge contracts must post a refundable $LC bond. Released automatically after a clean 30-day audit window. Skin in the game.",
  },
];

const STATS = [
  { value: "50+",    label: "Risk Vectors",     icon: Activity },
  { value: "<1ms",   label: "Scoring Latency",  icon: Cpu },
  { value: "24/7",   label: "Autonomous Guard", icon: AlertTriangle },
  { value: "0",      label: "Fee Required",     icon: TrendingUp },
];

// ── Section ───────────────────────────────────────────────────────────────────
export function SentinelSection() {
  return (
    <section
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-card/30 to-background"
      id="sentinel"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Corner radial glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-8 relative z-10 w-full">

        {/* ── Mobile ─────────────────────────────────────── */}
        <div className="flex flex-col sm:hidden gap-5">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CalloutBadge text="AI-Powered Defense Layer" data-testid="badge-sentinel" />
            <h2 className="text-3xl font-black leading-[0.9] tracking-tight" data-testid="text-sentinel-title">
              <SplitText type="words">Self-Defending Network</SplitText>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Liberty Sentinel is an autonomous AI admission controller that kills spam, prevents congestion, and prioritises real builders — without charging a fee.
            </p>
          </motion.div>

          <div className="flex justify-center">
            <SentinelBrain compact />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-primary leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2">
            {BRAIN_COMPONENTS.slice(0, 2).map(({ icon: Icon, color, title, desc }, i) => {
              const c = colorStyles[color];
              return (
                <motion.div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-black leading-none mb-1 ${c.text}`}>{title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground italic text-center border-l-2 border-primary/30 pl-3">
            "Zero fees. Zero spam. Total Liberty."
          </p>
        </div>

        {/* ── Desktop ────────────────────────────────────── */}
        <div className="hidden sm:grid lg:grid-cols-2 gap-8 xl:gap-14 items-center">

          {/* Left */}
          <motion.div
            className="space-y-5 md:space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-3">
              <CalloutBadge text="AI-Powered Defense Layer" data-testid="badge-sentinel-desktop" />
              <h2 className="text-[clamp(1.875rem,min(5.5vw,10dvh),7rem)] font-black leading-[0.9] tracking-tight">
                <SplitText type="words">Self-Defending Network</SplitText>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Liberty Sentinel is an autonomous AI admission controller that kills spam, prevents congestion, and prioritises real builders — without charging a single fee.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  className="flex flex-col items-center text-center rounded-xl border border-border bg-card/50 px-2 py-2.5"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                >
                  <Icon className="w-3.5 h-3.5 text-primary mb-1" />
                  <p className="text-base font-black text-primary leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Brain components */}
            <div className="space-y-2.5">
              {BRAIN_COMPONENTS.map(({ icon: Icon, color, title, desc }, i) => {
                const c = colorStyles[color];
                return (
                  <motion.div
                    key={title}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                  >
                    <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <div>
                      <p className={`font-black text-sm leading-none mb-1 ${c.text}`}>{title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.p
              className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              "Zero fees. Zero spam. Total Liberty."
            </motion.p>
          </motion.div>

          {/* Right — brain diagram */}
          <motion.div
            className="relative order-1 lg:order-2 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <SentinelBrain compact={false} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
