import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CalloutBadge } from "@/components/CalloutBadge";
import {
  Wifi,
  Shield,
  RefreshCw,
  Globe,
  Radio,
  Cpu,
  Zap,
  Lock,
  ArrowRight,
  Package,
  MapPin,
  Signal,
  Network,
} from "lucide-react";

const howItWorksSteps = [
  {
    icon: Cpu,
    step: "01",
    title: "LoRa Radio Mesh",
    description:
      "Liberty nodes broadcast over LoRa (Long Range) radio — a low-power, wide-area protocol that operates without the internet. Signals travel up to 15km in open terrain, hopping between nodes in a fully decentralized mesh.",
  },
  {
    icon: Signal,
    step: "02",
    title: "Ultra-Lightweight Packets",
    description:
      "Each packet carries only what matters: the latest block height and hash, finalized checkpoints, validator signals, and compressed transaction intents. The entire payload fits in a LoRa frame — no broadband required.",
  },
  {
    icon: Network,
    step: "03",
    title: "Mesh Propagation",
    description:
      "Nodes relay packets across the mesh using a store-and-forward model. Even if a node is temporarily out of range, data propagates as connectivity returns — maintaining chain awareness across the entire network.",
  },
  {
    icon: RefreshCw,
    step: "04",
    title: "Seamless Reconciliation",
    description:
      "When internet connectivity is restored, nodes reconcile from mesh checkpoints. Missing blocks sync automatically and full performance resumes instantly — no manual intervention, no loss of integrity.",
  },
];

const useCases = [
  {
    icon: MapPin,
    title: "Remote & Rural Regions",
    description:
      "Farmers, rural communities, and off-grid settlements can participate in and interact with the Liberty network without any internet infrastructure. Agriculture-based applications, land registries, and supply chain tools remain fully operational.",
  },
  {
    icon: Shield,
    title: "Infrastructure Outages",
    description:
      "Natural disasters, power grid failures, and ISP outages won't take Liberty offline. The mesh layer keeps validators coordinating and the chain producing blocks even during widespread connectivity disruptions.",
  },
  {
    icon: Lock,
    title: "Censorship-Restricted Environments",
    description:
      "In regions where governments control or restrict internet access, Liberty's LoRa mesh bypasses traditional infrastructure entirely. Blockchain access becomes a physical signal, not a permission.",
  },
  {
    icon: Zap,
    title: "Emergency & Disaster Networks",
    description:
      "Emergency responders, humanitarian operations, and disaster relief efforts can leverage Liberty's mesh layer for tamper-proof, decentralized coordination — even in the aftermath of events that destroy infrastructure.",
  },
  {
    icon: Globe,
    title: "Maritime & Aviation",
    description:
      "Shipping vessels, remote aircraft, and offshore platforms can maintain chain awareness via satellite-linked mesh nodes, bridging Liberty to environments where traditional connectivity has always been sparse.",
  },
  {
    icon: Radio,
    title: "Protest & Civil Action",
    description:
      "In environments where communication is monitored or suppressed, the off-grid layer allows participants to transact and coordinate without exposing themselves to internet-level surveillance or control.",
  },
];

const technicalDetails = [
  {
    label: "Protocol",
    value: "LoRa (Long Range Radio)",
    sub: "Sub-GHz ISM bands (868 MHz EU / 915 MHz US)",
  },
  {
    label: "Range",
    value: "Up to 15km",
    sub: "Open terrain, line-of-sight conditions",
  },
  {
    label: "Power",
    value: "Ultra-low consumption",
    sub: "Battery operable — solar compatible",
  },
  {
    label: "Packet payload",
    value: "< 255 bytes",
    sub: "Block hash, height, checkpoints, validator signals",
  },
  {
    label: "Topology",
    value: "Fully decentralized mesh",
    sub: "Store-and-forward, no central relay required",
  },
  {
    label: "Integration",
    value: "Native Liberty node support",
    sub: "No separate software stack required",
  },
];

function AnimatedPulse({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/20"
      animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay }}
    />
  );
}

function MeshHero() {
  const nodes = [
    { x: "50%", y: "50%", main: true },
    { x: "22%", y: "22%", main: false },
    { x: "78%", y: "18%", main: false },
    { x: "82%", y: "60%", main: false },
    { x: "62%", y: "82%", main: false },
    { x: "18%", y: "72%", main: false },
    { x: "40%", y: "30%", main: false },
    { x: "70%", y: "42%", main: false },
  ];

  const links = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 6], [2, 6], [2, 7], [3, 7], [4, 5],
  ];

  return (
    <div className="relative w-full h-64 sm:h-80">
      <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {links.map(([a, b], i) => {
          const na = nodes[a];
          const nb = nodes[b];
          const x1 = parseFloat(na.x) / 100 * 400;
          const y1 = parseFloat(na.y) / 100 * 280;
          const x2 = parseFloat(nb.x) / 100 * 400;
          const y2 = parseFloat(nb.y) / 100 * 280;
          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="4 6"
              strokeOpacity={0.4}
              animate={{
                strokeDashoffset: [0, -40],
                strokeOpacity: [0.25, 0.55, 0.25],
              }}
              transition={{
                strokeDashoffset: { duration: 3 + i * 0.2, repeat: Infinity, ease: "linear" },
                strokeOpacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          );
        })}
        {nodes.map((n, i) => {
          const cx = parseFloat(n.x) / 100 * 400;
          const cy = parseFloat(n.y) / 100 * 280;
          const r = n.main ? 9 : 5;
          return (
            <g key={i}>
              <motion.circle
                cx={cx} cy={cy} r={r * 3.5}
                fill="none" stroke="hsl(var(--primary))" strokeWidth={0.7}
                animate={{ r: [r * 2.5, r * 5.5], opacity: [0.4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
              />
              <circle
                cx={cx} cy={cy} r={r * 2.5}
                fill="hsl(var(--primary))" fillOpacity={0.12}
              />
              <motion.circle
                cx={cx} cy={cy} r={r}
                fill={n.main ? "hsl(var(--primary))" : "hsl(var(--background))"}
                stroke="hsl(var(--primary))"
                strokeWidth={n.main ? 0 : 1.5}
                filter="url(#heroGlow)"
                animate={n.main
                  ? { scale: [1, 1.15, 1] }
                  : { opacity: [0.6, 1, 0.6] }
                }
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ResilienceLayer() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <CalloutBadge text="Off-Grid Resilience Layer" animate showPulse />

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              data-testid="heading-resilience"
            >
              Stay online,<br />
              <span className="gradient-text">even when the world goes offline.</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              data-testid="text-resilience-intro"
            >
              Liberty Chain integrates a Meshtastic-powered LoRa mesh network — enabling blockchain continuity far beyond the reach of traditional internet infrastructure.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <Button size="lg" className="group" data-testid="button-join-devnet">
                Join the Network
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group" data-testid="button-read-docs">
                Read the Docs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Mesh animation */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 overflow-hidden">
              <MeshHero />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-primary/10">
                {[
                  { value: "15km", label: "Signal range" },
                  { value: "< 255B", label: "Packet size" },
                  { value: "0 sats", label: "Infrastructure cost" },
                  { value: "100%", label: "Decentralized" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* How it works */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-how-it-works">How It Works</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                A four-step process that keeps Liberty alive without the internet.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="p-6 h-full border-primary/10 bg-primary/5 space-y-4" data-testid={`card-how-${i}`}>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-4xl font-black text-primary/20 leading-none">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* What the mesh carries */}
          <section className="mb-24">
            <Card className="p-10 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight" data-testid="heading-mesh-carries">
                    What the Mesh Carries
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Every packet is precision-engineered for extreme bandwidth constraints. No bloat. Only what the network needs to stay alive and reach consensus.
                  </p>
                  <ul className="space-y-3 mt-6">
                    {[
                      "Latest block height & hash",
                      "Finalized checkpoints",
                      "Validator presence signals",
                      "Compressed transaction intents",
                      "Epoch transition markers",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="font-mono text-sm bg-background/60 rounded-xl p-6 border border-primary/20 space-y-2">
                    <div className="text-primary/60 text-xs mb-4">// Example LoRa frame payload</div>
                    <div><span className="text-primary">type</span>: <span className="text-secondary">"checkpoint"</span>,</div>
                    <div><span className="text-primary">block</span>: <span className="text-foreground">892411</span>,</div>
                    <div><span className="text-primary">hash</span>: <span className="text-secondary">"0xA3f8...2c91"</span>,</div>
                    <div><span className="text-primary">validators</span>: <span className="text-foreground">[ "0x1a2b", "0x3c4d" ]</span>,</div>
                    <div><span className="text-primary">epoch</span>: <span className="text-foreground">441</span>,</div>
                    <div><span className="text-primary">finalized</span>: <span className="text-primary">true</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Total payload: ~180 bytes — well within LoRa's 255-byte limit.</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Use Cases */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-use-cases">Built for the Real World</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                From disaster zones to censored regions, Liberty operates where others cannot.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Card className="p-6 h-full hover-elevate" data-testid={`card-usecase-${i}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <uc.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Technical Specs */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-technical">Technical Specifications</h2>
            </div>
            <Card className="overflow-hidden border-primary/20">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                {technicalDetails.map((detail, i) => (
                  <div
                    key={detail.label}
                    className={`p-6 space-y-1 ${i < technicalDetails.length - 1 ? "border-b border-r-0 sm:border-b sm:border-r border-primary/10 last:border-0" : ""}`}
                    data-testid={`spec-${i}`}
                  >
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">{detail.label}</div>
                    <div className="text-xl font-black">{detail.value}</div>
                    <div className="text-sm text-muted-foreground">{detail.sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Coming Soon — Devices */}
          <section className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Card className="p-10 sm:p-14 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 border-primary/30 text-center relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,transparent_70%)]" />

                <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AnimatedPulse delay={0} />
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Coming Soon</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight" data-testid="heading-devices">
                      Liberty Mesh Devices
                    </h2>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We're making purpose-built Liberty mesh devices available in the not too distant future — compact, ruggedized hardware pre-configured to run a Liberty node with built-in LoRa radio. Plug it in, and join the off-grid network. No setup. No server. Just signal.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 text-left">
                    {[
                      { title: "Pre-configured", desc: "Ships ready to participate in the Liberty mesh" },
                      { title: "Ruggedized", desc: "Built for field deployment in harsh conditions" },
                      { title: "Solar-ready", desc: "Low-power design compatible with solar panels" },
                    ].map((feat) => (
                      <div key={feat.title} className="bg-background/50 rounded-xl p-4 border border-primary/10">
                        <div className="font-bold text-sm mb-1">{feat.title}</div>
                        <div className="text-xs text-muted-foreground">{feat.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button size="lg" className="group" data-testid="button-notify-devices">
                      Notify Me When Available
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline" data-testid="button-join-waitlist">
                      Join the Waitlist
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Final CTA */}
          <section className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              A blockchain that doesn't just scale —<br />
              <span className="gradient-text">it survives.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Liberty is in Devnet. Join the network today and be part of building the most resilient blockchain ever created.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" data-testid="button-join-network-bottom">
                Join the Network
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" data-testid="button-docs-bottom">
                Read the Documentation
              </Button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
