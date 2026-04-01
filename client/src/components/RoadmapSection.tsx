import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, ArrowRight } from "lucide-react";
import type { RoadmapMilestone } from "@shared/schema";

const STATUS_CONFIG = {
  completed: {
    dot: "bg-primary shadow-[0_0_12px_2px_rgba(46,184,184,0.6)]",
    ring: "border-primary",
    badge: "bg-primary/20 text-primary border border-primary/30",
    card: "border-primary/30 bg-gradient-to-b from-primary/10 to-transparent",
    label: "Completed",
    icon: CheckCircle2,
  },
  active: {
    dot: "bg-white shadow-[0_0_20px_6px_rgba(46,184,184,0.9)]",
    ring: "border-primary animate-pulse",
    badge: "bg-white/10 text-white border border-white/30",
    card: "border-white/30 bg-gradient-to-b from-white/8 to-transparent shadow-[0_0_40px_-5px_rgba(46,184,184,0.3)]",
    label: "In Progress",
    icon: Zap,
  },
  upcoming: {
    dot: "bg-muted-foreground/30",
    ring: "border-muted-foreground/30",
    badge: "bg-muted/30 text-muted-foreground border border-muted-foreground/20",
    card: "border-white/8 bg-white/3",
    label: "Upcoming",
    icon: Circle,
  },
};

function MilestoneCard({ milestone, index }: { milestone: RoadmapMilestone; index: number }) {
  const cfg = STATUS_CONFIG[milestone.status];
  const Icon = cfg.icon;
  const isActive = milestone.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="relative flex flex-col flex-none w-64 xl:w-72"
      data-testid={`roadmap-card-${milestone.id}`}
    >
      {/* Connector dot on the timeline */}
      <div className="flex items-center justify-center mb-4 relative">
        <div className={`relative z-10 w-4 h-4 rounded-full ${cfg.dot} border-2 ${cfg.ring} flex-none`}>
          {isActive && (
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          )}
        </div>
      </div>

      {/* Card */}
      <div className={`flex-1 rounded-xl border p-5 transition-all duration-300 ${cfg.card}`}>
        {/* Quarter + status badge */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {milestone.quarter}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.badge}`}>
            <Icon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold mb-2 leading-snug ${
          milestone.status === "completed" ? "text-primary" :
          milestone.status === "active" ? "text-white" :
          "text-foreground/70"
        }`}>
          {milestone.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {milestone.description}
        </p>

        {isActive && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live now
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function RoadmapSection() {
  const { data: milestones = [] } = useQuery<RoadmapMilestone[]>({
    queryKey: ["/api/roadmap"],
  });

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progressPct = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <section
      className="relative w-full h-screen flex flex-col overflow-hidden bg-background"
      data-testid="roadmap-section"
    >
      {/* ── Decorative Background ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial teal glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(46,184,184,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(46,184,184,.6) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        {/* Decorative arcs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-primary/10" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-primary/8" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-primary/10" />
      </div>

      {/* ── Vision Header ────────────────────────────────── */}
      <div className="relative z-10 flex-none pt-16 pb-8 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Vision & Roadmap</span>
          </div>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-foreground leading-none mb-4">
            Building Tomorrow's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-primary">
              Blockchain. Today.
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            From genesis block to global infrastructure — every milestone brings us closer to a fully decentralized, sovereign internet.
          </p>

          {/* Progress bar */}
          {milestones.length > 0 && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{completedCount} of {milestones.length} milestones complete</span>
                <span className="text-primary font-semibold">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Timeline ─────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-hidden px-8 pb-8">
        {/* Horizontal scroll container */}
        <div className="h-full overflow-x-auto overflow-y-hidden scrollbar-none">
          <div className="h-full flex flex-col justify-center" style={{ minWidth: `max(100%, ${milestones.length * 300}px)` }}>
            {/* Timeline line */}
            <div className="relative mb-0">
              {/* Background track */}
              <div className="absolute top-1/2 left-8 right-8 h-px bg-border/40 -translate-y-1/2" />
              {/* Filled progress portion */}
              <motion.div
                className="absolute top-1/2 left-8 h-px bg-gradient-to-r from-primary/60 via-primary to-primary/60 -translate-y-1/2"
                style={{ right: milestones.length > 0 ? `${(1 - (completedCount + 0.5) / milestones.length) * 100 * 0.84}%` : "84%" }}
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            {/* Cards row */}
            <div className="flex gap-4 items-start justify-center px-4">
              {milestones.map((m, i) => (
                <MilestoneCard key={m.id} milestone={m} index={i} />
              ))}

              {milestones.length === 0 && (
                <div className="text-center text-muted-foreground py-16">
                  <Circle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No milestones yet — add them in the admin panel.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll hint (shown if many milestones) */}
        {milestones.length > 5 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-40 pointer-events-none">
            <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}
      </div>
    </section>
  );
}
