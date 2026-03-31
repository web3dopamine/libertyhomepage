import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CalloutBadge } from "@/components/CalloutBadge";
import { Link } from "wouter";
import {
  Radio,
  Lock,
  Zap,
  Vote,
  MessageSquare,
  Globe,
  ArrowRight,
  Wifi,
  Shield,
  Users,
  AlertTriangle,
  Map,
  Smartphone,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const messagingFeatures = [
  {
    icon: Lock,
    tag: "Wallet-to-Wallet Messaging",
    title: "Your wallet is your identity.",
    description:
      "Send encrypted messages directly between on-chain identities — address-to-address, with no phone numbers, no emails, and no middlemen. Fully encrypted payloads, native to the Liberty ecosystem.",
    bullets: [
      "Address-to-address communication",
      "No phone numbers, no emails",
      "Fully encrypted payloads",
      "Native to the Liberty ecosystem",
    ],
    cta: "Your wallet becomes your communication layer.",
    gradient: "from-primary/20 via-primary/5 to-transparent",
  },
  {
    icon: Zap,
    tag: "Validator Communication",
    title: "Critical infrastructure, always connected.",
    description:
      "Maintain network coordination even in low-connectivity environments. Liberty validators broadcast liveness signals, checkpoint confirmations, and consensus coordination messages across the mesh.",
    bullets: [
      "Validator liveness signals",
      "Checkpoint confirmations",
      "Consensus coordination messages",
      "Network health broadcasts",
    ],
    cta: "Critical infrastructure, always connected.",
    gradient: "from-yellow-500/15 via-yellow-500/5 to-transparent",
  },
  {
    icon: Vote,
    tag: "DAO Governance Signals",
    title: "Governance that works beyond the internet.",
    description:
      "Enable governance participation anywhere, anytime. Submit proposal voting signals, Snapshot-style intent messages, and emergency governance coordination directly over the mesh — no internet required.",
    bullets: [
      "Proposal voting signals",
      "Snapshot-style intent messages",
      "Emergency governance coordination",
      "Distributed decision making",
    ],
    cta: "Governance that works beyond the internet.",
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
  },
  {
    icon: MessageSquare,
    tag: "Encrypted Off-Grid Chat",
    title: "Messaging that survives outages, censorship, and distance.",
    description:
      "A resilient communication layer for real-world conditions. LoRa mesh-based messaging delivers end-to-end encrypted packets in environments without internet access, designed for low-bandwidth operation.",
    bullets: [
      "LoRa mesh-based messaging",
      "End-to-end encrypted packets",
      "Works without internet access",
      "Designed for low-bandwidth environments",
    ],
    cta: "Messaging that survives outages, censorship, and distance.",
    gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
  },
];

const realWorldUses = [
  { icon: Map, label: "Rural & agricultural networks" },
  { icon: AlertTriangle, label: "Disaster recovery scenarios" },
  { icon: Globe, label: "Censorship-restricted regions" },
  { icon: Smartphone, label: "Mobile, off-grid users" },
  { icon: Shield, label: "High-risk environments" },
  { icon: Users, label: "Remote community networks" },
];

const unifiedPillars = [
  { label: "Identity", value: "Wallet" },
  { label: "Messaging", value: "Native" },
  { label: "Infrastructure", value: "Decentralized" },
];

export default function MeshMessaging() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">

          {/* Hero */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <CalloutBadge icon={Radio}>
                Decentralized Messaging
              </CalloutBadge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl font-black tracking-tight leading-none"
              data-testid="heading-mesh-messaging"
            >
              Liberty Mesh{" "}
              <span className="gradient-text">Messaging Layer</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Communication without infrastructure. Liberty introduces a decentralized messaging layer
              built on Meshtastic, enabling secure, off-grid communication directly between wallets,
              validators, and network participants.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/resilience-layer">
                <Button size="lg" className="group" data-testid="button-resilience-layer">
                  Explore the Resilience Layer
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button size="lg" variant="outline" data-testid="button-docs">
                  Read the Docs
                </Button>
              </Link>
            </motion.div>
          </motion.section>

          {/* Unified System Banner */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                A unified system where everything{" "}
                <span className="gradient-text">just works.</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                On Liberty, your wallet, your messages, and your infrastructure are one seamless layer.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              {unifiedPillars.map((p) => (
                <motion.div
                  key={p.label}
                  variants={fadeUp}
                  className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3"
                >
                  <div className="text-4xl font-black text-primary">{p.value}</div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                    {p.label}
                  </div>
                  <div className="text-xs text-muted-foreground/60">is</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Messaging Feature Sections */}
          <section className="space-y-16">
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Four pillars of{" "}
                <span className="gradient-text">mesh communication.</span>
              </h2>
            </div>

            {messagingFeatures.map((feat, i) => {
              const Icon = feat.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={feat.tag}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={stagger}
                >
                  <Card
                    className={`overflow-hidden rounded-3xl p-0 bg-gradient-to-br ${feat.gradient} border border-primary/10`}
                  >
                    <div
                      className={`grid lg:grid-cols-2 gap-0 ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}
                    >
                      {/* Text side */}
                      <div className="p-8 sm:p-12 space-y-6">
                        <motion.div variants={fadeUp}>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              {feat.tag}
                            </span>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                            {feat.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">{feat.description}</p>
                        </motion.div>

                        <motion.ul variants={stagger} className="space-y-3">
                          {feat.bullets.map((b) => (
                            <motion.li
                              key={b}
                              variants={fadeUp}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <span>{b}</span>
                            </motion.li>
                          ))}
                        </motion.ul>

                        <motion.div
                          variants={fadeUp}
                          className="pt-2 border-t border-primary/10 text-sm text-primary font-semibold"
                        >
                          {feat.cta}
                        </motion.div>
                      </div>

                      {/* Visual side */}
                      <div className="relative flex items-center justify-center p-8 sm:p-12 min-h-[280px]">
                        <MeshVisual icon={Icon} index={i} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </section>

          {/* Built for the Real World */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center space-y-10"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Built for the{" "}
                <span className="gradient-text">real world.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From remote regions to high-risk environments, Liberty Mesh Messaging ensures
                communication never stops — wherever you are, whatever the conditions.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {realWorldUses.map((use) => {
                const Icon = use.icon;
                return (
                  <motion.div
                    key={use.label}
                    variants={fadeUp}
                    className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{use.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Final CTA */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="text-center space-y-8 max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Experience Mesh Messaging on Liberty
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                The network that keeps talking<br />
                <span className="gradient-text">when everything else goes silent.</span>
              </h2>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              Liberty is in Devnet. Join the mesh, run a node, and help build the most resilient
              communication layer in blockchain.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/resilience-layer">
                <Button size="lg" className="group" data-testid="button-cta-resilience">
                  Explore the Resilience Layer
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button size="lg" variant="outline" data-testid="button-cta-docs">
                  Read the Documentation
                </Button>
              </Link>
            </motion.div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}

/* Animated visual for each feature card */
function MeshVisual({ icon: Icon, index }: { icon: React.ElementType; index: number }) {
  const colors = [
    { ring: "border-primary/30 bg-primary/10", dot: "bg-primary", line: "stroke-primary" },
    { ring: "border-yellow-500/30 bg-yellow-500/10", dot: "bg-yellow-400", line: "stroke-yellow-400" },
    { ring: "border-violet-500/30 bg-violet-500/10", dot: "bg-violet-400", line: "stroke-violet-400" },
    { ring: "border-blue-500/30 bg-blue-500/10", dot: "bg-blue-400", line: "stroke-blue-400" },
  ];
  const c = colors[index % colors.length];

  const nodes = [
    { cx: 160, cy: 80 },
    { cx: 80, cy: 180 },
    { cx: 240, cy: 180 },
    { cx: 130, cy: 270 },
    { cx: 200, cy: 270 },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [1, 2],
  ];

  return (
    <div className="relative w-full flex items-center justify-center">
      <svg viewBox="0 0 320 340" className="w-full max-w-[260px] opacity-80">
        {edges.map(([a, b], ei) => (
          <line
            key={ei}
            x1={nodes[a].cx}
            y1={nodes[a].cy}
            x2={nodes[b].cx}
            y2={nodes[b].cy}
            className={c.line}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.5"
          />
        ))}
        {nodes.map((n, ni) => (
          <g key={ni}>
            <circle cx={n.cx} cy={n.cy} r={ni === 0 ? 28 : 18} fill="transparent"
              className={`${c.line}`}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle cx={n.cx} cy={n.cy} r={ni === 0 ? 16 : 10} fill="currentColor"
              className={`${c.line}`}
              opacity="0.15"
            />
            {ni === 0 && (
              <foreignObject x={n.cx - 12} y={n.cy - 12} width="24" height="24">
                <div className="flex items-center justify-center w-full h-full">
                  <Icon size={14} className={`${c.dot === "bg-primary" ? "text-primary" : c.dot.replace("bg-", "text-")}`} />
                </div>
              </foreignObject>
            )}
            {ni !== 0 && (
              <circle cx={n.cx} cy={n.cy} r={4} fill="currentColor"
                className={c.line}
                opacity="0.7"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Pulse rings on main node */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -70%)",
        }}
      >
        {[1, 2, 3].map((r) => (
          <div
            key={r}
            className={`absolute rounded-full border ${c.ring}`}
            style={{
              width: `${r * 36}px`,
              height: `${r * 36}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: `ping ${1.2 + r * 0.4}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              animationDelay: `${r * 0.3}s`,
              opacity: 0.3 / r,
            }}
          />
        ))}
      </div>
    </div>
  );
}
