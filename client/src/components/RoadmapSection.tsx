import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Zap, ChevronLeft, ChevronRight, MousePointerClick,
} from "lucide-react";
import type { RoadmapMilestone } from "@shared/schema";
import { useRef, useState, useEffect, useCallback } from "react";

// ── Layout constants ───────────────────────────────────────────────────────
const CARD_W = 200;
const COL_W  = 270;
const LANE_H = 188;
const SPINE_H = 44;
const CONNECTOR_H = 18;
const H_PAD = 56; // left/right padding inside the scrollable area

// ── Status styles ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  completed: {
    dot: "bg-primary",
    glow: "shadow-[0_0_10px_2px_rgba(46,184,184,0.55)]",
    ring: "border-primary",
    badge: "bg-primary/20 text-primary border-primary/30",
    title: "text-primary",
    card: "border-primary/25 bg-gradient-to-b from-primary/10 to-transparent",
    connector: "bg-primary/40",
    label: "Completed",
    Icon: CheckCircle2,
  },
  active: {
    dot: "bg-white",
    glow: "shadow-[0_0_18px_5px_rgba(46,184,184,0.85)]",
    ring: "border-primary",
    badge: "bg-white/12 text-white border-white/25",
    title: "text-white",
    card: "border-white/25 bg-gradient-to-b from-white/7 to-transparent shadow-[0_0_32px_-4px_rgba(46,184,184,0.28)]",
    connector: "bg-white/30",
    label: "In Progress",
    Icon: Zap,
  },
  upcoming: {
    dot: "bg-muted-foreground/35",
    glow: "",
    ring: "border-muted-foreground/30",
    badge: "bg-muted/30 text-muted-foreground border-muted-foreground/20",
    title: "text-foreground/60",
    card: "border-white/7 bg-white/[0.025]",
    connector: "bg-white/10",
    label: "Upcoming",
    Icon: Circle,
  },
};

// ── Card content ───────────────────────────────────────────────────────────
function CardContent({ m }: { m: RoadmapMilestone }) {
  const cfg = STATUS_CFG[m.status];
  const { Icon } = cfg;
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${cfg.card}`}
      style={{ width: CARD_W }}
      data-testid={`roadmap-card-${m.id}`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
        <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase leading-none">
          {m.quarter}
        </span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge}`}>
          <Icon className="w-2 h-2" />
          {cfg.label}
        </span>
      </div>
      <h3 className={`text-sm font-bold leading-snug mb-1.5 ${cfg.title}`}>{m.title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{m.description}</p>
      {m.status === "active" && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary font-semibold">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          Live now
        </div>
      )}
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────────────────
export function RoadmapSection() {
  const { data: milestones = [] } = useQuery<RoadmapMilestone[]>({
    queryKey: ["/api/roadmap"],
  });

  const scrollRef    = useRef<HTMLDivElement>(null);
  const isDragging   = useRef(false);
  const startX       = useRef(0);
  const startScroll  = useRef(0);
  const hasDragged   = useRef(false);

  const [canLeft,        setCanLeft]        = useState(false);
  const [canRight,       setCanRight]       = useState(false);
  const [visibleSet,     setVisibleSet]     = useState<Set<number>>(new Set());
  const [hasInteracted,  setHasInteracted]  = useState(false);
  const [dragging,       setDragging]       = useState(false);

  // ── Track scroll state ─────────────────────────────────────────────────
  const syncScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 8);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 8);

    // reveal cards that enter the viewport
    const lo = scrollLeft - 60;
    const hi = scrollLeft + clientWidth + 60;
    const toAdd: number[] = [];
    milestones.forEach((_, i) => {
      const colLeft = H_PAD + i * COL_W;
      if (colLeft + COL_W > lo && colLeft < hi) toAdd.push(i);
    });
    if (toAdd.length) {
      setVisibleSet(prev => {
        if (toAdd.every(n => prev.has(n))) return prev;
        return new Set([...prev, ...toAdd]);
      });
    }
    if (scrollLeft > 20) setHasInteracted(true);
  }, [milestones.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll);
    const t = setTimeout(syncScroll, 80);
    return () => {
      el.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
      clearTimeout(t);
    };
  }, [syncScroll]);

  // ── Mouse drag ─────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current     = e.pageX;
    startScroll.current = scrollRef.current?.scrollLeft ?? 0;
    setDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 4) hasDragged.current = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = startScroll.current - dx;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    setDragging(false);
    if (hasDragged.current) setHasInteracted(true);
  };

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * COL_W * 2.5, behavior: "smooth" });
    setHasInteracted(true);
  };

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const activeIdx      = milestones.findIndex(m => m.status === "active");
  const progressPct    = milestones.length ? (completedCount / milestones.length) * 100 : 0;
  const totalW         = milestones.length * COL_W + H_PAD * 2;
  const innerH         = LANE_H * 2 + SPINE_H;
  const spineY         = LANE_H; // top offset of the spine inside innerH

  return (
    <section
      className="relative w-full h-screen flex flex-col overflow-hidden bg-background"
      data-testid="roadmap-section"
    >
      {/* ── Background ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(46,184,184,.7) 1px, transparent 1px),linear-gradient(90deg, rgba(46,184,184,.7) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-primary/8" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-primary/8" />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      {/* pt-20 on mobile (h-16 nav + 16px), pt-24 on sm+ (h-20 nav + 16px) */}
      <div className="relative z-10 flex-none pt-20 sm:pt-24 pb-2 px-6 sm:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.22em] text-primary uppercase">Vision & Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-none mb-2">
            Building Tomorrow's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-primary">
              Blockchain.
            </span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Every milestone brings us closer to a fully decentralized, sovereign internet.
          </p>

          {/* Progress */}
          {milestones.length > 0 && (
            <div className="mt-3 max-w-[220px] mx-auto">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{completedCount}/{milestones.length} complete</span>
                <span className="text-primary font-semibold">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1 rounded-full bg-primary/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Timeline area ────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-hidden">

        {/* Left scroll button */}
        <AnimatePresence>
          {canLeft && (
            <motion.button
              key="left"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollBy(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 border border-border/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover-elevate"
              data-testid="button-roadmap-scroll-left"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll button */}
        <AnimatePresence>
          {canRight && (
            <motion.button
              key="right"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollBy(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 border border-border/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover-elevate"
              data-testid="button-roadmap-scroll-right"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Drag / scroll hint */}
        <AnimatePresence>
          {!hasInteracted && milestones.length > 3 && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/40 backdrop-blur-sm pointer-events-none"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Drag or use arrows to explore</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="h-full overflow-x-auto overflow-y-hidden select-none"
          style={{ scrollbarWidth: "none", cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Inner wide container */}
          <div
            className="h-full flex items-center"
            style={{ width: totalW, minWidth: totalW }}
          >
            {milestones.length === 0 ? (
              <div className="w-full text-center text-muted-foreground">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No milestones yet — add them in the admin panel.</p>
              </div>
            ) : (
              /* ── Two-lane timeline ─────────────────────────────────── */
              <div
                className="relative flex-none flex flex-row"
                style={{ height: innerH, paddingLeft: H_PAD, paddingRight: H_PAD }}
              >
                {/* ── Spine track (background) ───────────── */}
                <div
                  className="absolute bg-border/25"
                  style={{
                    top: spineY + SPINE_H / 2 - 0.5,
                    left: H_PAD + COL_W / 2,
                    right: H_PAD + COL_W / 2,
                    height: 1,
                  }}
                />

                {/* ── Spine track (progress filled) ──────── */}
                <motion.div
                  className="absolute bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                  style={{
                    top: spineY + SPINE_H / 2 - 0.5,
                    left: H_PAD + COL_W / 2,
                    height: 1,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{
                    width: activeIdx >= 0
                      ? `${activeIdx * COL_W + COL_W / 2}px`
                      : completedCount > 0
                        ? `${completedCount * COL_W}px`
                        : 0,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                />

                {/* ── Columns ────────────────────────────── */}
                {milestones.map((m, i) => {
                  const isTop     = i % 2 === 0;
                  const cfg       = STATUS_CFG[m.status];
                  const visible   = visibleSet.has(i);
                  const isActive  = m.status === "active";

                  return (
                    <div
                      key={m.id}
                      className="relative flex-none flex flex-col items-center"
                      style={{ width: COL_W }}
                    >
                      {/* ── Top lane ─────────────────── */}
                      <div
                        className="flex flex-col items-center justify-end"
                        style={{ height: LANE_H, width: COL_W }}
                      >
                        {isTop && (
                          <motion.div
                            initial={{ opacity: 0, y: -22 }}
                            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -22 }}
                            transition={{ duration: 0.42, ease: "easeOut" }}
                          >
                            <CardContent m={m} />
                          </motion.div>
                        )}
                        {/* connector from card down to dot */}
                        <div
                          className={`flex-none ${isTop ? cfg.connector : "bg-transparent"}`}
                          style={{ width: 1, height: CONNECTOR_H }}
                        />
                      </div>

                      {/* ── Spine dot ────────────────── */}
                      <div
                        className="relative z-10 flex items-center justify-center flex-none"
                        style={{ height: SPINE_H, width: COL_W }}
                      >
                        <div className={`relative w-3.5 h-3.5 rounded-full ${cfg.dot} border-2 ${cfg.ring} ${cfg.glow}`}>
                          {isActive && (
                            <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping" />
                          )}
                        </div>
                      </div>

                      {/* ── Bottom lane ──────────────── */}
                      <div
                        className="flex flex-col items-center justify-start"
                        style={{ height: LANE_H, width: COL_W }}
                      >
                        {/* connector from dot down to card */}
                        <div
                          className={`flex-none ${!isTop ? cfg.connector : "bg-transparent"}`}
                          style={{ width: 1, height: CONNECTOR_H }}
                        />
                        {!isTop && (
                          <motion.div
                            initial={{ opacity: 0, y: 22 }}
                            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                            transition={{ duration: 0.42, ease: "easeOut" }}
                          >
                            <CardContent m={m} />
                          </motion.div>
                        )}
                      </div>

                      {/* ── Quarter label on spine ───── */}
                      <div
                        className="absolute text-[9px] font-bold tracking-widest text-muted-foreground/50 uppercase"
                        style={{
                          top: LANE_H + SPINE_H / 2 + 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.quarter}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
