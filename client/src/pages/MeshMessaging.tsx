import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  Wifi,
  Battery,
  Signal,
  CheckCheck,
  Check,
  ChevronLeft,
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

// ─── Chat simulation data ─────────────────────────────────────────────────
type MsgFrom = "me" | "them" | "system" | "node";
interface ChatMsg {
  id: string;
  from: MsgFrom;
  sender?: string;
  text: string;
  time: string;
  encrypted?: boolean;
  vote?: boolean;
  status?: "sending" | "sent" | "delivered";
  signal?: string;
}

const CHANNELS: {
  id: string;
  label: string;
  contact: string;
  contactShort: string;
  avatarLetter: string;
  status: string;
  signal: string;
  hops: number;
  messages: ChatMsg[];
}[] = [
  {
    id: "private",
    label: "Private",
    contact: "0x3B91...F204",
    contactShort: "0x3B91",
    avatarLetter: "W",
    status: "Via LoRa Mesh · 4 hops",
    signal: "-94 dBm",
    hops: 4,
    messages: [
      { id: "p1", from: "them", text: "Hey — sent you 50 LC for the node setup", time: "14:23", encrypted: true, status: "delivered" },
      { id: "p2", from: "me", text: "Received. Block confirmed #891,247", time: "14:23", encrypted: true, status: "delivered" },
      { id: "p3", from: "them", text: "Perfect. Internet's down here — mesh only right now", time: "14:24", encrypted: true, status: "delivered" },
      { id: "p4", from: "me", text: "Signal strong here. 4 hops, -94 dBm", time: "14:24", encrypted: true, status: "delivered" },
      { id: "p5", from: "them", text: "Can you relay a tx to 0x9c44 for me?", time: "14:25", encrypted: true, status: "delivered" },
      { id: "p6", from: "me", text: "Sure — relaying now via 3 nodes.", time: "14:25", encrypted: true, status: "delivered" },
    ],
  },
  {
    id: "validators",
    label: "Validators",
    contact: "Validator Ring",
    contactShort: "VAL-NET",
    avatarLetter: "V",
    status: "3 validators · Mesh active",
    signal: "-88 dBm",
    hops: 2,
    messages: [
      { id: "v1", from: "system", sender: "VAL-01", text: "Checkpoint #441 finalized ✓ · All validators agree", time: "09:01", encrypted: false },
      { id: "v2", from: "system", sender: "VAL-03", text: "Liveness confirmed. Epoch 441 active.", time: "09:01", encrypted: false },
      { id: "v3", from: "system", sender: "VAL-02", text: "Internet offline in sector 7. Switching to mesh relay.", time: "09:03", encrypted: false },
      { id: "v4", from: "system", sender: "VAL-01", text: "Consensus maintained. Epoch 442 in 14 min.", time: "09:04", encrypted: false },
      { id: "v5", from: "node", sender: "SYSTEM", text: "Block production ongoing — 10,042 TPS. Mesh uptime 100%.", time: "09:04", encrypted: false },
      { id: "v6", from: "system", sender: "VAL-03", text: "Mesh handoff complete. All validators synced.", time: "09:05", encrypted: false },
    ],
  },
  {
    id: "dao",
    label: "DAO Gov",
    contact: "DAO Governance",
    contactShort: "DAO",
    avatarLetter: "D",
    status: "Off-grid · 12 members active",
    signal: "-102 dBm",
    hops: 6,
    messages: [
      { id: "d1", from: "them", text: "PROPOSAL-47: Increase staking rewards to 12% APR", time: "11:30", encrypted: false },
      { id: "d2", from: "me", text: "VOTE · YES · PROPOSAL-47", time: "11:31", encrypted: true, vote: true, status: "delivered" },
      { id: "d3", from: "them", text: "Vote registered. Tally: 62% YES · 29% NO · 9% ABSTAIN", time: "11:31", encrypted: false },
      { id: "d4", from: "them", text: "PROPOSAL-48: Deploy bridge to Base L2", time: "11:45", encrypted: false },
      { id: "d5", from: "me", text: "VOTE · YES · PROPOSAL-48", time: "11:46", encrypted: true, vote: true, status: "delivered" },
      { id: "d6", from: "them", text: "Quorum reached. Both proposals passing ✓", time: "11:50", encrypted: false },
    ],
  },
];

// ─── Phone Simulation Component ────────────────────────────────────────────
function MeshPhoneDemo() {
  const [channelIdx, setChannelIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [extraMessages, setExtraMessages] = useState<ChatMsg[]>([]);
  const [currentTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });
  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const channel = CHANNELS[channelIdx];
  const baseMessages = channel.messages;
  const allMessages = [...baseMessages.slice(0, visibleCount), ...extraMessages];

  // Reset + replay when channel changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisibleCount(0);
    setExtraMessages([]);
    setIsTyping(false);

    let i = 0;
    const schedule = () => {
      if (i >= baseMessages.length) return;
      const delay = i === 0 ? 400 : 900 + Math.random() * 400;
      timerRef.current = setTimeout(() => {
        setIsTyping(true);
        timerRef.current = setTimeout(() => {
          setIsTyping(false);
          setVisibleCount((c) => c + 1);
          i++;
          schedule();
        }, 700 + Math.random() * 500);
      }, delay);
    };
    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [channelIdx]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, isTyping]);

  const sendMessage = () => {
    const txt = inputValue.trim();
    if (!txt) return;
    const msg: ChatMsg = {
      id: `user-${Date.now()}`,
      from: "me",
      text: txt,
      time: currentTime,
      encrypted: true,
      status: "sent",
    };
    setExtraMessages((m) => [...m, msg]);
    setInputValue("");
  };

  const signalBars = (dbm: string) => {
    const v = Math.abs(parseInt(dbm));
    if (v < 90) return 5;
    if (v < 95) return 4;
    if (v < 100) return 3;
    if (v < 105) return 2;
    return 1;
  };
  const bars = signalBars(channel.signal);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Channel Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-card border border-border">
        {CHANNELS.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => setChannelIdx(i)}
            data-testid={`tab-channel-${ch.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              i === channelIdx
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Phone Frame */}
      <div
        className="relative select-none"
        style={{ width: 320, height: 660 }}
        data-testid="phone-mockup"
      >
        {/* Outer shell */}
        <div
          className="absolute inset-0 rounded-[3rem] border-2 border-white/10"
          style={{ background: "hsl(220 14% 8%)", boxShadow: "0 40px 80px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.06)" }}
        />

        {/* Side buttons */}
        <div className="absolute left-0 top-[110px] w-[3px] h-[32px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: "-3px" }} />
        <div className="absolute left-0 top-[155px] w-[3px] h-[56px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: "-3px" }} />
        <div className="absolute left-0 top-[220px] w-[3px] h-[56px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: "-3px" }} />
        <div className="absolute right-0 top-[145px] w-[3px] h-[72px] rounded-l-sm" style={{ background: "hsl(220 14% 14%)", right: "-3px" }} />

        {/* Screen */}
        <div
          className="absolute inset-[4px] rounded-[2.7rem] overflow-hidden flex flex-col"
          style={{ background: "hsl(220 16% 10%)" }}
        >
          {/* Dynamic island / notch */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-24 h-6 rounded-full" style={{ background: "hsl(220 14% 6%)" }} />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pb-1 flex-shrink-0">
            <span className="text-[11px] font-bold text-white/80">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              {/* LoRa signal bars */}
              <div className="flex items-end gap-[2px]" title={`LoRa ${channel.signal}`}>
                {[1,2,3,4,5].map((b) => (
                  <div
                    key={b}
                    className="rounded-[1px] transition-all"
                    style={{
                      width: 3,
                      height: 4 + b * 2,
                      background: b <= bars
                        ? "hsl(var(--primary))"
                        : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "hsl(var(--primary))" }}>Mesh</span>
              <Battery className="w-3.5 h-3.5 text-white/60" />
            </div>
          </div>

          {/* Chat Header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 border-b"
            style={{ background: "hsl(220 16% 12%)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <ChevronLeft className="w-5 h-5 text-white/50" />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "hsl(var(--primary)/0.2)", border: "1.5px solid hsl(var(--primary)/0.4)", color: "hsl(var(--primary))" }}
            >
              {channel.avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white leading-tight truncate">{channel.contact}</div>
              <div className="text-[10px] leading-tight" style={{ color: "hsl(var(--primary))" }}>{channel.status}</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.3)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))" }} />
              <span className="text-[9px] font-bold uppercase" style={{ color: "hsl(var(--primary))" }}>Live</span>
            </div>
          </div>

          {/* Encryption notice */}
          <div className="flex items-center justify-center gap-1.5 py-1.5 flex-shrink-0">
            <Lock className="w-2.5 h-2.5" style={{ color: "hsl(var(--primary))" }} />
            <span className="text-[9px]" style={{ color: "hsl(var(--primary)/0.8)" }}>
              End-to-end encrypted · LoRa mesh · {channel.hops} hops
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2" style={{ scrollbarWidth: "none" }}>
            <AnimatePresence initial={false}>
              {allMessages.map((msg) => {
                const isMe = msg.from === "me";
                const isSystem = msg.from === "system";
                const isNode = msg.from === "node";

                if (isSystem || isNode) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex justify-center"
                    >
                      <div
                        className="rounded-xl px-3 py-1.5 max-w-[85%]"
                        style={{
                          background: isNode
                            ? "hsl(var(--primary)/0.12)"
                            : "hsl(220 14% 16%)",
                          border: isNode
                            ? "1px solid hsl(var(--primary)/0.3)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {msg.sender && (
                          <span className="text-[9px] font-bold uppercase tracking-wider mr-1.5" style={{ color: "hsl(var(--primary))" }}>
                            {msg.sender}
                          </span>
                        )}
                        <span className="text-[11px] text-white/70">{msg.text}</span>
                        <span className="text-[9px] text-white/30 ml-2">{msg.time}</span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="rounded-2xl px-3 py-2 max-w-[78%] space-y-0.5"
                      style={
                        isMe
                          ? {
                              background: "hsl(var(--primary))",
                              borderBottomRightRadius: 4,
                            }
                          : {
                              background: "hsl(220 14% 18%)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              borderBottomLeftRadius: 4,
                            }
                      }
                    >
                      {msg.vote ? (
                        <div
                          className="text-[11px] font-bold tracking-wide px-2 py-1 rounded-lg"
                          style={{
                            background: "rgba(0,0,0,0.2)",
                            color: isMe ? "rgba(255,255,255,0.9)" : "hsl(var(--primary))",
                            fontFamily: "monospace",
                          }}
                        >
                          {msg.text}
                        </div>
                      ) : (
                        <p className="text-[12px] leading-snug" style={{ color: isMe ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)" }}>
                          {msg.text}
                        </p>
                      )}

                      <div className={`flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        {msg.encrypted && (
                          <Lock className="w-2 h-2" style={{ color: isMe ? "rgba(255,255,255,0.5)" : "hsl(var(--primary)/0.6)" }} />
                        )}
                        <span className="text-[9px]" style={{ color: isMe ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.3)" }}>
                          {msg.time}
                        </span>
                        {isMe && (
                          msg.status === "delivered"
                            ? <CheckCheck className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.5)" }} />
                            : <Check className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.35)" }} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-2xl px-4 py-2.5 flex items-center gap-1.5"
                    style={{ background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.07)", borderBottomLeftRadius: 4 }}
                  >
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(var(--primary))" }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-t"
            style={{ background: "hsl(220 16% 12%)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--primary)/0.6)" }} />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Encrypted message..."
                data-testid="input-chat-message"
                className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-white/25"
                style={{ color: "rgba(255,255,255,0.85)" }}
              />
            </div>
            <button
              onClick={sendMessage}
              data-testid="button-send-message"
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{ background: "hsl(var(--primary))", opacity: inputValue.trim() ? 1 : 0.5 }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary-foreground))" }} />
            </button>
          </div>

          {/* Home bar */}
          <div className="flex justify-center pb-2 pt-1 flex-shrink-0">
            <div className="w-24 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Signal info below phone */}
      <div className="flex items-center gap-6 text-center">
        {[
          { label: "Signal", value: channel.signal },
          { label: "Hops", value: `${channel.hops} nodes` },
          { label: "Protocol", value: "LoRa 915MHz" },
          { label: "Encrypted", value: "AES-256" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-black text-foreground">{s.value}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
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

          {/* ── Live Simulation ─────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            data-testid="section-simulation"
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Simulation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" data-testid="heading-simulation">
                See Mesh Messaging{" "}
                <span className="gradient-text">in action</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore three live scenarios — wallet-to-wallet private chat, validator network coordination, and off-grid DAO governance votes. All over LoRa mesh. No internet.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Phone mockup */}
              <motion.div variants={fadeUp} className="flex justify-center">
                <MeshPhoneDemo />
              </motion.div>

              {/* Feature callouts */}
              <motion.div variants={stagger} className="space-y-5">
                {[
                  {
                    icon: Lock,
                    title: "AES-256 End-to-End Encryption",
                    desc: "Every message is encrypted before it leaves your device. Neither mesh relay nodes nor anyone on the network can read your payloads — only the intended recipient's wallet key can decrypt.",
                    channel: "Private",
                  },
                  {
                    icon: Signal,
                    title: "Multi-Hop LoRa Relay",
                    desc: "Messages hop between Liberty Mesh Nodes automatically — up to 15 km per hop, with no central router. The network self-heals around obstacles and offline nodes.",
                    channel: "Validators",
                  },
                  {
                    icon: Vote,
                    title: "On-Chain Intent Signals",
                    desc: "Governance votes, transaction intents, and validator signals are serialized into sub-255-byte LoRa frames — small enough for a radio packet, signed by your wallet private key.",
                    channel: "DAO Gov",
                  },
                  {
                    icon: Wifi,
                    title: "Instant Internet Reconciliation",
                    desc: "When connectivity returns, the node syncs any missed blocks in seconds. Messages sent off-grid are queued and delivered as peers come online — nothing is lost.",
                    channel: null,
                  },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="flex gap-4 p-5 rounded-2xl border border-border bg-card/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{f.title}</span>
                        {f.channel && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.25)" }}>
                            {f.channel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
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
