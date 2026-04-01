import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CalloutBadge } from "@/components/CalloutBadge";
import { Link } from "wouter";
import { useCMSContent } from "@/hooks/use-cms-content";
import {
  Radio,
  Lock,
  Zap,
  Vote,
  MessageSquare,
  Globe,
  ArrowRight,
  Map,
  Shield,
  Users,
  AlertTriangle,
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

const featureIcons = [Lock, Zap, Vote, MessageSquare];
const featureGradients = [
  "from-primary/20 via-primary/5 to-transparent",
  "from-yellow-500/15 via-yellow-500/5 to-transparent",
  "from-violet-500/15 via-violet-500/5 to-transparent",
  "from-blue-500/15 via-blue-500/5 to-transparent",
];

const realWorldIcons = [Map, AlertTriangle, Globe, Smartphone, Shield, Users];

export default function MeshMessaging() {
  const cms = useCMSContent("mesh-messaging");

  const heroBadge = cms["hero.badge"] ?? "Decentralized Messaging";
  const heroTitle = cms["hero.title"] ?? "Liberty Mesh Messaging Layer";
  const heroSubtitle = cms["hero.subtitle"] ?? "Communication without infrastructure. Liberty introduces a decentralized messaging layer built on Meshtastic, enabling secure, off-grid communication directly between wallets, validators, and network participants.";
  const heroCta1 = cms["hero.cta1"] ?? "Explore the Resilience Layer";
  const heroCta1Url = cms["hero.cta1Url"] ?? "/resilience-layer";
  const heroCta2 = cms["hero.cta2"] ?? "Read the Docs";
  const heroCta2Url = cms["hero.cta2Url"] ?? "/documentation";

  const unifiedTitle = cms["unified.title"] ?? "A unified system where everything just works.";
  const unifiedSubtitle = cms["unified.subtitle"] ?? "On Liberty, your wallet, your messages, and your infrastructure are one seamless layer.";
  const unifiedPillars = [
    { label: cms["unified.pillar1Label"] ?? "Identity", value: cms["unified.pillar1Value"] ?? "Wallet" },
    { label: cms["unified.pillar2Label"] ?? "Messaging", value: cms["unified.pillar2Value"] ?? "Native" },
    { label: cms["unified.pillar3Label"] ?? "Infrastructure", value: cms["unified.pillar3Value"] ?? "Decentralized" },
  ];

  const pillarsTitle = cms["pillars.title"] ?? "Four pillars of mesh communication.";

  const features = [
    {
      tag: cms["feature1.tag"] ?? "Wallet-to-Wallet Messaging",
      title: cms["feature1.title"] ?? "Your wallet is your identity.",
      description: cms["feature1.description"] ?? "Send encrypted messages directly between on-chain identities — address-to-address, with no phone numbers, no emails, and no middlemen. Fully encrypted payloads, native to the Liberty ecosystem.",
      bullets: [
        "Address-to-address communication",
        "No phone numbers, no emails",
        "Fully encrypted payloads",
        "Native to the Liberty ecosystem",
      ],
      cta: cms["feature1.cta"] ?? "Your wallet becomes your communication layer.",
    },
    {
      tag: cms["feature2.tag"] ?? "Validator Communication",
      title: cms["feature2.title"] ?? "Critical infrastructure, always connected.",
      description: cms["feature2.description"] ?? "Maintain network coordination even in low-connectivity environments. Liberty validators broadcast liveness signals, checkpoint confirmations, and consensus coordination messages across the mesh.",
      bullets: [
        "Validator liveness signals",
        "Checkpoint confirmations",
        "Consensus coordination messages",
        "Network health broadcasts",
      ],
      cta: cms["feature2.cta"] ?? "Critical infrastructure, always connected.",
    },
    {
      tag: cms["feature3.tag"] ?? "DAO Governance Signals",
      title: cms["feature3.title"] ?? "Governance that works beyond the internet.",
      description: cms["feature3.description"] ?? "Enable governance participation anywhere, anytime. Submit proposal voting signals, Snapshot-style intent messages, and emergency governance coordination directly over the mesh — no internet required.",
      bullets: [
        "Proposal voting signals",
        "Snapshot-style intent messages",
        "Emergency governance coordination",
        "Distributed decision making",
      ],
      cta: cms["feature3.cta"] ?? "Governance that works beyond the internet.",
    },
    {
      tag: cms["feature4.tag"] ?? "Encrypted Off-Grid Chat",
      title: cms["feature4.title"] ?? "Messaging that survives outages, censorship, and distance.",
      description: cms["feature4.description"] ?? "A resilient communication layer for real-world conditions. LoRa mesh-based messaging delivers end-to-end encrypted packets in environments without internet access, designed for low-bandwidth operation.",
      bullets: [
        "LoRa mesh-based messaging",
        "End-to-end encrypted packets",
        "Works without internet access",
        "Designed for low-bandwidth environments",
      ],
      cta: cms["feature4.cta"] ?? "Messaging that survives outages, censorship, and distance.",
    },
  ];

  const realWorldTitle = cms["realWorld.title"] ?? "Built for the real world.";
  const realWorldSubtitle = cms["realWorld.subtitle"] ?? "From remote regions to high-risk environments, Liberty Mesh Messaging ensures communication never stops — wherever you are, whatever the conditions.";
  const realWorldUses = [
    { label: cms["realWorld.use1"] ?? "Rural & agricultural networks" },
    { label: cms["realWorld.use2"] ?? "Disaster recovery scenarios" },
    { label: cms["realWorld.use3"] ?? "Censorship-restricted regions" },
    { label: cms["realWorld.use4"] ?? "Mobile, off-grid users" },
    { label: cms["realWorld.use5"] ?? "High-risk environments" },
    { label: cms["realWorld.use6"] ?? "Remote community networks" },
  ];

  const finalCtaBadge = cms["finalCta.badge"] ?? "Experience Mesh Messaging on Liberty";
  const finalCtaTitle = cms["finalCta.title"] ?? "The network that keeps talking when everything else goes silent.";
  const finalCtaSubtitle = cms["finalCta.subtitle"] ?? "Liberty is in Testnet. Join the mesh, run a node, and help build the most resilient communication layer in blockchain.";
  const finalCta1 = cms["finalCta.cta1"] ?? "Explore the Resilience Layer";
  const finalCta1Url = cms["finalCta.cta1Url"] ?? "/resilience-layer";
  const finalCta2 = cms["finalCta.cta2"] ?? "Read the Documentation";
  const finalCta2Url = cms["finalCta.cta2Url"] ?? "/documentation";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 pb-24">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-32">

          {/* Hero */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <CalloutBadge icon={Radio}>
                {heroBadge}
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
              {heroSubtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" data-testid="button-resilience-layer" asChild>
                <Link href={heroCta1Url}>
                  {heroCta1}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-docs" asChild>
                <Link href={heroCta2Url}>
                  {heroCta2}
                </Link>
              </Button>
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
                {unifiedTitle.includes("just works") ? (
                  <>
                    {unifiedTitle.split("just works")[0]}
                    <span className="gradient-text">just works.</span>
                  </>
                ) : unifiedTitle}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {unifiedSubtitle}
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
                {pillarsTitle.includes("mesh communication") ? (
                  <>
                    {pillarsTitle.split("mesh communication")[0]}
                    <span className="gradient-text">mesh communication.</span>
                  </>
                ) : pillarsTitle}
              </h2>
            </div>

            {features.map((feat, i) => {
              const Icon = featureIcons[i];
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
                    className={`overflow-hidden rounded-3xl p-0 bg-gradient-to-br ${featureGradients[i]} border border-primary/10`}
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
                {realWorldTitle.includes("real world") ? (
                  <>
                    {realWorldTitle.split("real world")[0]}
                    <span className="gradient-text">real world.</span>
                  </>
                ) : realWorldTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {realWorldSubtitle}
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {realWorldUses.map((use, idx) => {
                const Icon = realWorldIcons[idx];
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
                  {finalCtaBadge}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                {finalCtaTitle.includes("goes silent") ? (
                  <>
                    {finalCtaTitle.split("goes silent")[0]}
                    <br />
                    <span className="gradient-text">goes silent.</span>
                  </>
                ) : finalCtaTitle}
              </h2>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              {finalCtaSubtitle}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="group" data-testid="button-cta-resilience" asChild>
                <Link href={finalCta1Url}>
                  {finalCta1}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-cta-docs" asChild>
                <Link href={finalCta2Url}>
                  {finalCta2}
                </Link>
              </Button>
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
