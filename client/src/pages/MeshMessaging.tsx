import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { CalloutBadge } from "@/components/CalloutBadge";
import { Link } from "wouter";
import { useCMSContent } from "@/hooks/use-cms-content";
import libertyLogo from "@assets/Asset_6_1775047791812.png";
import {
  Radio, Lock, Zap, Vote, MessageSquare, Globe, ArrowRight,
  Map, Shield, Users, AlertTriangle, Smartphone, Send,
  Battery, CheckCheck, Check, ChevronLeft, Settings,
  Search, Eye, EyeOff, Wifi, UserCircle, Edit2,
} from "lucide-react";

// ─── Page animation helpers ───────────────────────────────────────────────
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

// ─── Simulation data ──────────────────────────────────────────────────────
type MsgFrom = "me" | "them" | "system" | "node";
interface ChatMsg {
  id: string;
  from: MsgFrom;
  sender?: string;
  text: string;
  time: string;
  encrypted?: boolean;
  vote?: boolean;
  status?: "sent" | "delivered";
}

const CHANNELS = [
  {
    id: "private", label: "Private",
    contact: "0x3B91...F204", contactShort: "0x3B91", avatarLetter: "M",
    status: "Via LoRa Mesh · 4 hops", signal: "-94 dBm", hops: 4,
    lastMsg: "Sure — relaying now via 3 nodes.", lastTime: "14:25",
    messages: [
      { id: "p1", from: "them" as MsgFrom, text: "Hey — sent you 50 LC for the node setup", time: "14:23", encrypted: true, status: "delivered" as const },
      { id: "p2", from: "me" as MsgFrom, text: "Received. Block confirmed #891,247", time: "14:23", encrypted: true, status: "delivered" as const },
      { id: "p3", from: "them" as MsgFrom, text: "Perfect. Internet's down here — mesh only", time: "14:24", encrypted: true, status: "delivered" as const },
      { id: "p4", from: "me" as MsgFrom, text: "Signal strong here. 4 hops, -94 dBm", time: "14:24", encrypted: true, status: "delivered" as const },
      { id: "p5", from: "them" as MsgFrom, text: "Can you relay a tx to 0x9c44 for me?", time: "14:25", encrypted: true, status: "delivered" as const },
      { id: "p6", from: "me" as MsgFrom, text: "Sure — relaying now via 3 nodes.", time: "14:25", encrypted: true, status: "delivered" as const },
    ],
  },
  {
    id: "validators", label: "Validators",
    contact: "Validator Ring", contactShort: "VAL-NET", avatarLetter: "V",
    status: "3 validators · Mesh active", signal: "-88 dBm", hops: 2,
    lastMsg: "Mesh handoff complete. All validators synced.", lastTime: "09:05",
    messages: [
      { id: "v1", from: "system" as MsgFrom, sender: "VAL-01", text: "Checkpoint #441 finalized ✓ · All validators agree", time: "09:01", encrypted: false },
      { id: "v2", from: "system" as MsgFrom, sender: "VAL-03", text: "Liveness confirmed. Epoch 441 active.", time: "09:01", encrypted: false },
      { id: "v3", from: "system" as MsgFrom, sender: "VAL-02", text: "Internet offline in sector 7. Switching to mesh relay.", time: "09:03", encrypted: false },
      { id: "v4", from: "system" as MsgFrom, sender: "VAL-01", text: "Consensus maintained. Epoch 442 in 14 min.", time: "09:04", encrypted: false },
      { id: "v5", from: "node" as MsgFrom, sender: "SYSTEM", text: "Block production ongoing — 10,042 TPS. Mesh uptime 100%.", time: "09:04", encrypted: false },
      { id: "v6", from: "system" as MsgFrom, sender: "VAL-03", text: "Mesh handoff complete. All validators synced.", time: "09:05", encrypted: false },
    ],
  },
  {
    id: "dao", label: "DAO Gov",
    contact: "DAO Governance", contactShort: "DAO", avatarLetter: "D",
    status: "Off-grid · 12 members active", signal: "-102 dBm", hops: 6,
    lastMsg: "Quorum reached. Both proposals passing ✓", lastTime: "11:50",
    messages: [
      { id: "d1", from: "them" as MsgFrom, text: "PROPOSAL-47: Increase staking rewards to 12% APR", time: "11:30", encrypted: false },
      { id: "d2", from: "me" as MsgFrom, text: "VOTE · YES · PROPOSAL-47", time: "11:31", encrypted: true, vote: true, status: "delivered" as const },
      { id: "d3", from: "them" as MsgFrom, text: "Vote registered. Tally: 62% YES · 29% NO · 9% ABSTAIN", time: "11:31", encrypted: false },
      { id: "d4", from: "them" as MsgFrom, text: "PROPOSAL-48: Deploy bridge to Base L2", time: "11:45", encrypted: false },
      { id: "d5", from: "me" as MsgFrom, text: "VOTE · YES · PROPOSAL-48", time: "11:46", encrypted: true, vote: true, status: "delivered" as const },
      { id: "d6", from: "them" as MsgFrom, text: "Quorum reached. Both proposals passing ✓", time: "11:50", encrypted: false },
    ],
  },
] as const;

const CONTACTS_DATA = [
  { address: "0x7f2A...B391", name: "Elena", status: "online",   statusText: "Online · Via Mesh", bars: 5, channelIdx: 0 },
  { address: "0x3B91...F204", name: "Marco", status: "mesh",    statusText: "Mesh only · 4 hops",bars: 3, channelIdx: 0 },
  { address: "validator-01.eth", name: "VAL-01", status: "online", statusText: "Validator · Active", bars: 5, channelIdx: 1 },
  { address: "0x9C44...D01F", name: null,    status: "offline",  statusText: "Last seen 4h ago",  bars: 0, channelIdx: 0 },
  { address: "0xA1F9...7B33", name: "Sarah", status: "mesh",    statusText: "Mesh · 6 hops",     bars: 2, channelIdx: 0 },
];

// ─── Phone sub-screens ────────────────────────────────────────────────────

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2.5;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(onContinue, 300);
      return () => clearTimeout(t);
    }
  }, [progress, onContinue]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer select-none"
      style={{ background: "hsl(220 20% 6%)" }}
      onClick={() => setProgress(100)}
      data-testid="splash-screen"
    >
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.25) 0%, transparent 70%)" }} />
      </div>
      {/* Logo */}
      <motion.img
        src={libertyLogo}
        alt="Liberty"
        className="w-36 relative z-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        data-testid="img-splash-logo"
      />
      {/* Tagline */}
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--primary))" }}>
          Mesh Messaging
        </div>
        <div className="text-[10px] text-white/30 mt-1 tracking-widest">Secure · Off-Grid · Decentralized</div>
      </motion.div>
      {/* Progress bar */}
      <motion.div
        className="relative z-10 w-32 h-0.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "hsl(var(--primary))" }}
        />
      </motion.div>
      <div className="text-[9px] text-white/25 relative z-10">Tap to skip</div>
    </div>
  );
}

function ChatsListScreen({ onOpenChat }: { onOpenChat: (idx: number) => void }) {
  return (
    <div className="flex-1 flex flex-col" style={{ background: "hsl(220 16% 10%)" }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[15px] font-black text-white">Messages</span>
        <Edit2 className="w-4 h-4 text-white/40" />
      </div>
      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <Search className="w-3 h-3 text-white/30" />
          <span className="text-[11px] text-white/25">Search messages</span>
        </div>
      </div>
      {/* Conversations */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {CHANNELS.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => onOpenChat(i)}
            data-testid={`btn-open-chat-${ch.id}`}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "hsl(var(--primary)/0.2)", border: "1.5px solid hsl(var(--primary)/0.4)", color: "hsl(var(--primary))" }}
            >
              {ch.avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-bold text-white truncate">{ch.contact}</span>
                <span className="text-[10px] text-white/30 flex-shrink-0 ml-2">{ch.lastTime}</span>
              </div>
              <div className="flex items-center gap-1">
                {ch.messages.some(m => m.from === "me") && <CheckCheck className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />}
                <span className="text-[11px] text-white/40 truncate">{ch.lastMsg}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ channel, onBack }: { channel: typeof CHANNELS[number]; onBack: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [extraMessages, setExtraMessages] = useState<ChatMsg[]>([]);
  const msgListRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseMessages = channel.messages as ChatMsg[];
  const allMessages = [...baseMessages.slice(0, visibleCount), ...extraMessages];

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
        }, 600 + Math.random() * 400);
      }, delay);
    };
    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const el = msgListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allMessages.length, isTyping]);

  const sendMessage = () => {
    const txt = inputValue.trim();
    if (!txt) return;
    setExtraMessages((m) => [...m, { id: `u${Date.now()}`, from: "me", text: txt, time: "now", encrypted: true, status: "sent" }]);
    setInputValue("");
  };

  const signalBars = Math.max(1, 5 - Math.floor((Math.abs(parseInt(channel.signal)) - 85) / 5));

  return (
    <>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-3 py-2.5 flex-shrink-0 border-b" style={{ background: "hsl(220 16% 12%)", borderColor: "rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} data-testid="btn-chat-back">
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: "hsl(var(--primary)/0.2)", border: "1.5px solid hsl(var(--primary)/0.4)", color: "hsl(var(--primary))" }}>
          {channel.avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white truncate">{channel.contact}</div>
          <div className="text-[10px]" style={{ color: "hsl(var(--primary))" }}>{channel.status}</div>
        </div>
        <div className="flex items-end gap-[2px]">
          {[1,2,3,4,5].map((b) => (
            <div key={b} className="rounded-[1px]" style={{ width: 2, height: 3 + b * 2, background: b <= signalBars ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>

      {/* Encryption notice */}
      <div className="flex items-center justify-center gap-1 py-1 flex-shrink-0">
        <Lock className="w-2 h-2" style={{ color: "hsl(var(--primary))" }} />
        <span className="text-[9px]" style={{ color: "hsl(var(--primary)/0.7)" }}>
          End-to-end encrypted · LoRa · {channel.hops} hops · {channel.signal}
        </span>
      </div>

      {/* Messages */}
      <div ref={msgListRef} className="flex-1 overflow-y-auto px-3 py-1 space-y-2" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence initial={false}>
          {allMessages.map((msg) => {
            const isMe = msg.from === "me";
            const isGroup = msg.from === "system" || msg.from === "node";
            if (isGroup) {
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex justify-center">
                  <div className="rounded-xl px-3 py-1.5 max-w-[88%]" style={{ background: msg.from === "node" ? "hsl(var(--primary)/0.12)" : "hsl(220 14% 16%)", border: msg.from === "node" ? "1px solid hsl(var(--primary)/0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
                    {msg.sender && <span className="text-[9px] font-bold uppercase tracking-wider mr-1.5" style={{ color: "hsl(var(--primary))" }}>{msg.sender}</span>}
                    <span className="text-[11px] text-white/70">{msg.text}</span>
                    <span className="text-[9px] text-white/25 ml-2">{msg.time}</span>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="rounded-2xl px-3 py-2 max-w-[78%] space-y-0.5" style={isMe ? { background: "hsl(var(--primary))", borderBottomRightRadius: 4 } : { background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.07)", borderBottomLeftRadius: 4 }}>
                  {msg.vote ? (
                    <div className="text-[11px] font-bold tracking-wide px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.2)", color: isMe ? "rgba(255,255,255,0.9)" : "hsl(var(--primary))", fontFamily: "monospace" }}>{msg.text}</div>
                  ) : (
                    <p className="text-[12px] leading-snug" style={{ color: isMe ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)" }}>{msg.text}</p>
                  )}
                  <div className={`flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    {msg.encrypted && <Lock className="w-2 h-2" style={{ color: isMe ? "rgba(255,255,255,0.4)" : "hsl(var(--primary)/0.5)" }} />}
                    <span className="text-[9px]" style={{ color: isMe ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.25)" }}>{msg.time}</span>
                    {isMe && (msg.status === "delivered" ? <CheckCheck className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.45)" }} /> : <Check className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.3)" }} />)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 flex items-center gap-1.5" style={{ background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.07)", borderBottomLeftRadius: 4 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--primary))" }} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-t" style={{ background: "hsl(220 16% 12%)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--primary)/0.5)" }} />
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Encrypted message..." data-testid="input-chat-message" className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-white/20" style={{ color: "rgba(255,255,255,0.85)" }} />
        </div>
        <button onClick={sendMessage} data-testid="button-send-message" className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity" style={{ background: "hsl(var(--primary))", opacity: inputValue.trim() ? 1 : 0.45 }}>
          <Send className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary-foreground))" }} />
        </button>
      </div>
    </>
  );
}

function ContactsScreen({ onOpenChat }: { onOpenChat: (idx: number) => void }) {
  const [search, setSearch] = useState("");
  const filtered = CONTACTS_DATA.filter(c =>
    (c.name ?? c.address).toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => s === "online" ? "hsl(var(--primary))" : s === "mesh" ? "#f59e0b" : "rgba(255,255,255,0.25)";

  return (
    <div className="flex-1 flex flex-col" style={{ background: "hsl(220 16% 10%)" }}>
      <div className="px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[15px] font-black text-white">Contacts</span>
      </div>
      <div className="px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <Search className="w-3 h-3 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            data-testid="input-contacts-search"
            className="flex-1 bg-transparent outline-none text-[11px] placeholder:text-white/25"
            style={{ color: "rgba(255,255,255,0.8)" }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {filtered.map((c) => (
          <div key={c.address} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "hsl(220 14% 18%)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                {c.name ? c.name[0].toUpperCase() : "?"}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black" style={{ background: statusColor(c.status) }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{c.name ?? c.address}</div>
              {c.name && <div className="text-[10px] text-white/35 truncate">{c.address}</div>}
              <div className="text-[10px]" style={{ color: c.status === "offline" ? "rgba(255,255,255,0.3)" : "hsl(var(--primary)/0.8)" }}>{c.statusText}</div>
            </div>
            {c.status !== "offline" && (
              <button
                onClick={() => onOpenChat(c.channelIdx)}
                data-testid={`btn-contact-msg-${c.address.slice(0,6)}`}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "hsl(var(--primary)/0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.3)" }}
              >
                Msg
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsProps {
  nickname: string; setNickname: (v: string) => void;
  hideWallet: boolean; setHideWallet: (v: boolean) => void;
  readReceipts: boolean; setReadReceipts: (v: boolean) => void;
  typingIndicators: boolean; setTypingIndicators: (v: boolean) => void;
}
function SettingsScreen({ nickname, setNickname, hideWallet, setHideWallet, readReceipts, setReadReceipts, typingIndicators, setTypingIndicators }: SettingsProps) {
  const [showWallet, setShowWallet] = useState(false);
  const walletFull = "0x7f2A4B1c9D3eF502aAbC6D91e8B33714C5F2B391";
  const walletShort = "0x7f2A...B391";
  const displayAs = nickname.trim() || (hideWallet ? "Anonymous" : walletShort);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="w-10 h-5.5 rounded-full flex-shrink-0 relative transition-all duration-200"
      style={{ background: value ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)", height: 22, width: 40 }}
    >
      <div className="absolute top-0.5 rounded-full bg-white transition-all duration-200" style={{ width: 18, height: 18, left: value ? 20 : 2 }} />
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "hsl(220 16% 10%)", scrollbarWidth: "none" }}>
      <div className="px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[15px] font-black text-white">Settings</span>
      </div>

      {/* Profile */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--primary))" }}>My Profile</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg" style={{ background: "hsl(var(--primary)/0.2)", border: "2px solid hsl(var(--primary)/0.5)", color: "hsl(var(--primary))" }}>
            {nickname.trim() ? nickname.trim()[0].toUpperCase() : <UserCircle className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-[12px] font-bold text-white">{displayAs}</div>
            <div className="text-[10px] text-white/35">Shown to other users</div>
          </div>
        </div>

        {/* Nickname field */}
        <div className="mb-3 rounded-xl overflow-hidden" style={{ background: "hsl(220 14% 16%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-3 pt-2 pb-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">Display Name</div>
          </div>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Satoshi or leave blank"
            data-testid="input-settings-nickname"
            maxLength={24}
            className="w-full bg-transparent px-3 pb-2.5 pt-0.5 outline-none text-[13px] placeholder:text-white/20"
            style={{ color: "rgba(255,255,255,0.85)" }}
          />
        </div>

        {/* Wallet address */}
        <div className="mb-3 rounded-xl overflow-hidden" style={{ background: "hsl(220 14% 16%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-3 pt-2 pb-0.5 flex items-center justify-between">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">Wallet Address</div>
            <button onClick={() => setShowWallet(!showWallet)}>
              {showWallet ? <EyeOff className="w-3 h-3 text-white/30" /> : <Eye className="w-3 h-3 text-white/30" />}
            </button>
          </div>
          <div className="px-3 pb-2.5 pt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
            {showWallet ? walletFull : walletShort}
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="px-4 pt-1 pb-2">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--primary))" }}>Privacy</div>
        <div className="rounded-xl overflow-hidden" style={{ background: "hsl(220 14% 16%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { label: "Hide wallet address", sub: "Show display name only", value: hideWallet, set: setHideWallet, testid: "toggle-hide-wallet" },
            { label: "Read receipts", sub: "Let others see when you've read", value: readReceipts, set: setReadReceipts, testid: "toggle-read-receipts" },
            { label: "Typing indicators", sub: "Show when you're composing", value: typingIndicators, set: setTypingIndicators, testid: "toggle-typing" },
          ].map((row, i, arr) => (
            <div key={row.label} className={`flex items-center justify-between px-3 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div>
                <div className="text-[12px] font-semibold text-white">{row.label}</div>
                <div className="text-[9px] text-white/35">{row.sub}</div>
              </div>
              <Toggle value={row.value} onChange={row.set} />
            </div>
          ))}
        </div>
      </div>

      {/* Network */}
      <div className="px-4 pt-1 pb-4">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--primary))" }}>Network</div>
        <div className="rounded-xl px-3 py-3 space-y-1.5" style={{ background: "hsl(220 14% 16%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            ["Status", "Connected"],
            ["Protocol", "LoRa 915 MHz"],
            ["Signal", "-94 dBm · 4 hops"],
            ["Peers", "12 nodes in range"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[10px] text-white/35">{k}</span>
              <span className="text-[10px] font-semibold" style={{ color: k === "Status" ? "hsl(var(--primary))" : "rgba(255,255,255,0.6)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen }: { screen: string; setScreen: (s: "chats-list" | "contacts" | "settings") => void }) {
  const items = [
    { id: "chats-list", icon: MessageSquare, label: "Chats" },
    { id: "contacts",   icon: Users,         label: "Contacts" },
    { id: "settings",  icon: Settings,      label: "Settings" },
  ] as const;
  return (
    <div className="flex-shrink-0 flex items-center justify-around py-2 border-t" style={{ background: "hsl(220 16% 10%)", borderColor: "rgba(255,255,255,0.06)" }}>
      {items.map((item) => {
        const active = screen === item.id;
        return (
          <button key={item.id} onClick={() => setScreen(item.id)} data-testid={`nav-${item.id}`} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all">
            <item.icon className="w-5 h-5" style={{ color: active ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] font-semibold" style={{ color: active ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main phone demo ──────────────────────────────────────────────────────
type PhoneScreen = "splash" | "chats-list" | "chat" | "contacts" | "settings";

function MeshPhoneDemo() {
  const [screen, setScreen] = useState<PhoneScreen>("splash");
  const [channelIdx, setChannelIdx] = useState(0);
  const [nickname, setNickname] = useState("");
  const [hideWallet, setHideWallet] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  const channel = CHANNELS[channelIdx];

  const openChat = (idx: number) => {
    setChannelIdx(idx);
    setScreen("chat");
  };

  const currentTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Tab groups above the phone
  const screenTabs = [
    { id: "splash",     label: "Splash" },
    { id: "contacts",  label: "Contacts" },
    { id: "settings",  label: "Settings" },
  ] as const;

  const chatTabs = CHANNELS.map((ch, i) => ({ id: ch.id, label: ch.label, idx: i }));

  const isScreenTab = (s: PhoneScreen) => ["splash", "contacts", "settings"].includes(s);
  const isChatTab = (s: PhoneScreen, idx: number) => s === "chat" && channelIdx === idx;

  return (
    <div className="flex flex-col items-center gap-6" data-testid="phone-demo-wrapper">
      {/* Tab controls */}
      <div className="flex flex-wrap justify-center gap-2">
        {/* Screen tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
          <span className="text-[10px] text-muted-foreground px-1.5 font-medium">Screens</span>
          {screenTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${screen === tab.id && !isScreenTab(screen) === false ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              style={{ background: screen === tab.id ? "hsl(var(--primary))" : undefined, color: screen === tab.id ? "hsl(var(--primary-foreground))" : undefined }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Chat demo tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
          <span className="text-[10px] text-muted-foreground px-1.5 font-medium">Chats</span>
          {chatTabs.map((tab) => {
            const active = isChatTab(screen, tab.idx);
            return (
              <button
                key={tab.id}
                onClick={() => openChat(tab.idx)}
                data-testid={`tab-channel-${tab.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: active ? "hsl(var(--primary))" : undefined, color: active ? "hsl(var(--primary-foreground))" : undefined }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone frame */}
      <div className="relative select-none" style={{ width: 320, height: 660 }} data-testid="phone-mockup">
        {/* Shell */}
        <div className="absolute inset-0 rounded-[3rem] border-2 border-white/10" style={{ background: "hsl(220 14% 8%)", boxShadow: "0 40px 80px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.06)" }} />
        {/* Side buttons */}
        <div className="absolute top-[110px] w-[3px] h-[32px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: -3 }} />
        <div className="absolute top-[155px] w-[3px] h-[56px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: -3 }} />
        <div className="absolute top-[220px] w-[3px] h-[56px] rounded-r-sm" style={{ background: "hsl(220 14% 14%)", left: -3 }} />
        <div className="absolute top-[145px] w-[3px] h-[72px] rounded-l-sm" style={{ background: "hsl(220 14% 14%)", right: -3 }} />

        {/* Screen */}
        <div className="absolute inset-[4px] rounded-[2.7rem] overflow-hidden flex flex-col" style={{ background: "hsl(220 16% 10%)" }}>
          {/* Dynamic island */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-24 h-6 rounded-full" style={{ background: "hsl(220 14% 6%)" }} />
          </div>
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pb-1 flex-shrink-0">
            <span className="text-[11px] font-bold text-white/80">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[2px]">
                {[1,2,3,4,5].map((b) => (
                  <div key={b} className="rounded-[1px]" style={{ width: 3, height: 4 + b * 2, background: screen === "chat" ? (b <= Math.max(1, 5 - Math.floor((Math.abs(parseInt(channel.signal)) - 85) / 5)) ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)") : b <= 4 ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "hsl(var(--primary))" }}>Mesh</span>
              <Battery className="w-3.5 h-3.5 text-white/60" />
            </div>
          </div>

          {/* Screen content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={screen === "chat" ? `chat-${channelIdx}` : screen}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {screen === "splash" && <SplashScreen onContinue={() => setScreen("chats-list")} />}
              {screen === "chats-list" && <ChatsListScreen onOpenChat={openChat} />}
              {screen === "chat" && <ChatScreen key={`${channelIdx}`} channel={channel} onBack={() => setScreen("chats-list")} />}
              {screen === "contacts" && <ContactsScreen onOpenChat={openChat} />}
              {screen === "settings" && (
                <SettingsScreen
                  nickname={nickname} setNickname={setNickname}
                  hideWallet={hideWallet} setHideWallet={setHideWallet}
                  readReceipts={readReceipts} setReadReceipts={setReadReceipts}
                  typingIndicators={typingIndicators} setTypingIndicators={setTypingIndicators}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom nav (not on splash or chat) */}
          {screen !== "splash" && screen !== "chat" && (
            <BottomNav
              screen={screen}
              setScreen={(s) => setScreen(s)}
            />
          )}

          {/* Home bar */}
          <div className="flex justify-center pb-2 pt-1 flex-shrink-0">
            <div className="w-24 h-1 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* Stats below phone */}
      <div className="flex items-center gap-6 text-center">
        {[
          { label: "Signal",    value: screen === "chat" ? channel.signal : "−94 dBm" },
          { label: "Hops",      value: screen === "chat" ? `${channel.hops} nodes` : "4 nodes" },
          { label: "Protocol",  value: "LoRa 915MHz" },
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

// ─── Page ──────────────────────────────────────────────────────────────────
export default function MeshMessaging() {
  const cms = useCMSContent("mesh-messaging");

  const heroBadge = cms["hero.badge"] ?? "Decentralized Messaging";
  const heroSubtitle = cms["hero.subtitle"] ?? "Liberty combines Meshtastic and Reticulum into one resilient stack — off-grid LoRa transport meets end-to-end encrypted routing. Wallet-to-wallet messaging that works anywhere on Earth, with or without the internet.";
  const heroCta1Url = cms["hero.cta1Url"] ?? "/resilience-layer";
  const heroCta2Url = cms["hero.cta2Url"] ?? "/documentation";

  const unifiedTitle = cms["unified.title"] ?? "A unified system where everything just works.";
  const unifiedSubtitle = cms["unified.subtitle"] ?? "On Liberty, your wallet, your messages, and your infrastructure are one seamless layer.";
  const unifiedPillars = [
    { label: cms["unified.pillar1Label"] ?? "Identity",        value: cms["unified.pillar1Value"] ?? "Wallet" },
    { label: cms["unified.pillar2Label"] ?? "Messaging",       value: cms["unified.pillar2Value"] ?? "Native" },
    { label: cms["unified.pillar3Label"] ?? "Infrastructure",  value: cms["unified.pillar3Value"] ?? "Decentralized" },
  ];

  const pillarsTitle = cms["pillars.title"] ?? "Four pillars of mesh communication.";

  const features = [
    { tag: cms["feature1.tag"] ?? "Wallet-to-Wallet Messaging", title: cms["feature1.title"] ?? "Your wallet is your identity.", description: cms["feature1.description"] ?? "Send encrypted messages directly between on-chain identities — address-to-address, with no phone numbers, no emails, and no middlemen. Fully encrypted payloads, native to the Liberty ecosystem.", bullets: ["Address-to-address communication","No phone numbers, no emails","Fully encrypted payloads","Native to the Liberty ecosystem"], cta: cms["feature1.cta"] ?? "Your wallet becomes your communication layer." },
    { tag: cms["feature2.tag"] ?? "Validator Communication", title: cms["feature2.title"] ?? "Critical infrastructure, always connected.", description: cms["feature2.description"] ?? "Maintain network coordination even in low-connectivity environments. Liberty validators broadcast liveness signals, checkpoint confirmations, and consensus coordination messages across the mesh.", bullets: ["Validator liveness signals","Checkpoint confirmations","Consensus coordination messages","Network health broadcasts"], cta: cms["feature2.cta"] ?? "Critical infrastructure, always connected." },
    { tag: cms["feature3.tag"] ?? "DAO Governance Signals", title: cms["feature3.title"] ?? "Governance that works beyond the internet.", description: cms["feature3.description"] ?? "Enable governance participation anywhere, anytime. Submit proposal voting signals, Snapshot-style intent messages, and emergency governance coordination directly over the mesh — no internet required.", bullets: ["Proposal voting signals","Snapshot-style intent messages","Emergency governance coordination","Distributed decision making"], cta: cms["feature3.cta"] ?? "Governance that works beyond the internet." },
    { tag: cms["feature4.tag"] ?? "Encrypted Off-Grid Chat", title: cms["feature4.title"] ?? "Messaging that survives outages, censorship, and distance.", description: cms["feature4.description"] ?? "A resilient communication layer for real-world conditions. LoRa mesh-based messaging delivers end-to-end encrypted packets in environments without internet access, designed for low-bandwidth operation.", bullets: ["LoRa mesh-based messaging","End-to-end encrypted packets","Works without internet access","Designed for low-bandwidth environments"], cta: cms["feature4.cta"] ?? "Messaging that survives outages, censorship, and distance." },
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
          <motion.section initial="hidden" animate="visible" variants={stagger} className="text-center space-y-6 max-w-4xl mx-auto">
            <motion.div variants={fadeUp}><CalloutBadge icon={Radio}>{heroBadge}</CalloutBadge></motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-black tracking-tight leading-none" data-testid="heading-mesh-messaging">
              Liberty Mesh <span className="gradient-text">Messaging Layer</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">{heroSubtitle}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" data-testid="button-resilience-layer" asChild>
                <Link href={heroCta1Url}>Explore the Resilience Layer<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-docs" asChild>
                <Link href={heroCta2Url}>Read the Docs</Link>
              </Button>
            </motion.div>
          </motion.section>

          {/* Live Simulation */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} data-testid="section-simulation">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Interactive Demo</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" data-testid="heading-simulation">
                Explore the Liberty Mesh App <span className="gradient-text">live</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Navigate between screens using the buttons above the phone or the bottom nav inside the app. Switch chat demos, browse contacts, update your settings, and try the splash screen.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div variants={fadeUp} className="flex justify-center">
                <MeshPhoneDemo />
              </motion.div>

              <motion.div variants={stagger} className="space-y-5">
                {[
                  { icon: Lock, title: "AES-256 End-to-End Encryption", desc: "Every message is encrypted before it leaves your device. Neither mesh relay nodes nor anyone on the network can read your payloads — only the intended recipient's wallet key can decrypt.", tag: "Private chat" },
                  { icon: Users, title: "Contacts & Wallet Identities", desc: "Your contacts are on-chain wallet addresses. Status indicators show whether peers are online via internet, reachable mesh-only, or offline. Tap any active contact to open a direct encrypted channel.", tag: "Contacts screen" },
                  { icon: Settings, title: "Privacy & Display Control", desc: "Choose a display name or stay pseudonymous. Toggle wallet address visibility, read receipts, and typing indicators — all settings persist across your mesh identity.", tag: "Settings screen" },
                  { icon: Wifi, title: "Zero-Infrastructure Delivery", desc: "When connectivity returns, the node syncs any missed blocks in seconds. Messages sent off-grid are queued and delivered as peers come online — nothing is lost.", tag: null },
                ].map((f) => (
                  <motion.div key={f.title} variants={fadeUp} className="flex gap-4 p-5 rounded-2xl border border-border bg-card/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{f.title}</span>
                        {f.tag && <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.25)" }}>{f.tag}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Liberty Network Stack: Meshtastic + Reticulum */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} data-testid="section-network-stack">
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Liberty Resilient Network Stack</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Beyond the internet. Built for reality. Two complementary protocols operating as one seamless layer.</p>
            </motion.div>

            <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6 mb-6">
              <motion.div variants={fadeUp}>
                <Card className="p-6 sm:p-7 border-primary/20 bg-primary/5 h-full space-y-4" data-testid="card-stack-meshtastic">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Radio className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Off-Grid Transport Layer</p>
                      <h3 className="text-lg font-black leading-tight">Meshtastic</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">A LoRa-based mesh network enabling communication without any internet infrastructure. Long-range, low-power, solar-compatible nodes that deploy anywhere on Earth.</p>
                  <ul className="space-y-1.5">
                    {["Long-range, low-power mesh networking", "Solar-powered, deploy-anywhere nodes", "Ideal for rural, remote, and disaster environments"].map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5 flex-shrink-0">›</span>{pt}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-semibold text-foreground">Physical resilience. Real-world coverage.</p>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card className="p-6 sm:p-7 border-primary/20 bg-primary/5 h-full space-y-4" data-testid="card-stack-reticulum">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Encrypted Routing Layer</p>
                      <h3 className="text-lg font-black leading-tight">Reticulum</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">A decentralized networking protocol enabling secure communication across any transport — internet, mesh, or radio. Cryptographic identity addressing with intelligent routing.</p>
                  <ul className="space-y-1.5">
                    {["End-to-end encrypted messaging", "Transport-agnostic (internet, mesh, radio)", "Cryptographic identity-based addressing"].map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5 flex-shrink-0">›</span>{pt}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-semibold text-foreground">Intelligent routing. Secure by design.</p>
                </Card>
              </motion.div>
            </motion.div>

            {/* Together / Environment Matrix */}
            <motion.div variants={fadeUp}>
              <Card className="p-6 sm:p-8 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" data-testid="card-stack-together">
                <div className="grid sm:grid-cols-2 gap-8 items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">The Liberty Advantage</p>
                        <h3 className="text-lg font-black leading-tight">Together — One Network</h3>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {[
                        "Routes messages across internet + mesh seamlessly",
                        "Maintains communication during outages or censorship",
                        "Enables wallet-to-wallet messaging anywhere on Earth",
                        "Supports validator coordination and DAO governance off-grid",
                      ].map((pt) => (
                        <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5 flex-shrink-0">›</span>{pt}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-foreground pt-2">Liberty doesn't rely on infrastructure — it builds around it.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">One Network. Any Environment.</p>
                    {[
                      { env: "Cities", stack: "Internet + Reticulum" },
                      { env: "Rural", stack: "Mesh + Reticulum" },
                      { env: "Off-grid", stack: "Meshtastic only" },
                    ].map((row) => (
                      <div key={row.env} className="flex items-center justify-between border-b border-primary/10 pb-3 last:border-0 last:pb-0">
                        <span className="text-sm font-semibold">{row.env}</span>
                        <span className="text-xs font-mono text-muted-foreground">{row.stack}</span>
                      </div>
                    ))}
                    <p className="text-sm text-muted-foreground pt-2">A blockchain that adapts to the real world.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.section>

          {/* Unified System Banner */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                {unifiedTitle.includes("just works") ? <>{unifiedTitle.split("just works")[0]}<span className="gradient-text">just works.</span></> : unifiedTitle}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{unifiedSubtitle}</p>
            </motion.div>
            <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {unifiedPillars.map((p) => (
                <motion.div key={p.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3">
                  <div className="text-4xl font-black text-primary">{p.value}</div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{p.label}</div>
                  <div className="text-xs text-muted-foreground/60">is</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Feature sections */}
          <section className="space-y-16">
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {pillarsTitle.includes("mesh communication") ? <>{pillarsTitle.split("mesh communication")[0]}<span className="gradient-text">mesh communication.</span></> : pillarsTitle}
              </h2>
            </div>
            {features.map((feat, i) => {
              const Icon = featureIcons[i];
              const isEven = i % 2 === 0;
              return (
                <motion.div key={feat.tag} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
                  <Card className={`overflow-hidden rounded-3xl p-0 bg-gradient-to-br ${featureGradients[i]} border border-primary/10`}>
                    <div className={`grid lg:grid-cols-2 gap-0 ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}>
                      <div className="p-8 sm:p-12 space-y-6">
                        <motion.div variants={fadeUp}>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">{feat.tag}</span>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">{feat.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feat.description}</p>
                        </motion.div>
                        <motion.ul variants={stagger} className="space-y-3">
                          {feat.bullets.map((b) => (
                            <motion.li key={b} variants={fadeUp} className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" /><span>{b}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                        <motion.div variants={fadeUp} className="pt-2 border-t border-primary/10 text-sm text-primary font-semibold">{feat.cta}</motion.div>
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

          {/* Real World */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center space-y-10">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                {realWorldTitle.includes("real world") ? <>{realWorldTitle.split("real world")[0]}<span className="gradient-text">real world.</span></> : realWorldTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{realWorldSubtitle}</p>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {realWorldUses.map((use, idx) => {
                const Icon = realWorldIcons[idx];
                return (
                  <motion.div key={use.label} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
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
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={stagger} className="text-center space-y-8 max-w-3xl mx-auto">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{finalCtaBadge}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                {finalCtaTitle.includes("goes silent") ? <>{finalCtaTitle.split("goes silent")[0]}<br /><span className="gradient-text">goes silent.</span></> : finalCtaTitle}
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">{finalCtaSubtitle}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" data-testid="button-cta-resilience" asChild>
                <Link href={finalCta1Url}>{finalCta1}<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-cta-docs" asChild>
                <Link href={finalCta2Url}>{finalCta2}</Link>
              </Button>
            </motion.div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}

// ─── MeshVisual ────────────────────────────────────────────────────────────
function MeshVisual({ icon: Icon, index }: { icon: React.ElementType; index: number }) {
  const colors = [
    { ring: "border-primary/30 bg-primary/10", dot: "bg-primary", line: "stroke-primary" },
    { ring: "border-yellow-500/30 bg-yellow-500/10", dot: "bg-yellow-400", line: "stroke-yellow-400" },
    { ring: "border-violet-500/30 bg-violet-500/10", dot: "bg-violet-400", line: "stroke-violet-400" },
    { ring: "border-blue-500/30 bg-blue-500/10", dot: "bg-blue-400", line: "stroke-blue-400" },
  ];
  const c = colors[index % colors.length];
  const nodes = [{ cx: 160, cy: 80 }, { cx: 80, cy: 180 }, { cx: 240, cy: 180 }, { cx: 130, cy: 270 }, { cx: 200, cy: 270 }];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [1, 2]];
  return (
    <div className="relative w-full flex items-center justify-center">
      <svg viewBox="0 0 320 340" className="w-full max-w-[260px] opacity-80">
        {edges.map(([a, b], ei) => <line key={ei} x1={nodes[a].cx} y1={nodes[a].cy} x2={nodes[b].cx} y2={nodes[b].cy} className={c.line} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />)}
        {nodes.map((n, ni) => (
          <g key={ni}>
            <circle cx={n.cx} cy={n.cy} r={ni === 0 ? 28 : 18} fill="transparent" className={c.line} stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <circle cx={n.cx} cy={n.cy} r={ni === 0 ? 16 : 10} fill="currentColor" className={c.line} opacity="0.15" />
            {ni === 0 && <foreignObject x={n.cx - 12} y={n.cy - 12} width="24" height="24"><div className="flex items-center justify-center w-full h-full"><Icon size={14} className={c.dot === "bg-primary" ? "text-primary" : c.dot.replace("bg-", "text-")} /></div></foreignObject>}
            {ni !== 0 && <circle cx={n.cx} cy={n.cy} r={4} fill="currentColor" className={c.line} opacity="0.7" />}
          </g>
        ))}
      </svg>
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -70%)" }}>
        {[1, 2, 3].map((r) => (
          <div key={r} className={`absolute rounded-full border ${c.ring}`} style={{ width: `${r * 36}px`, height: `${r * 36}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)", animation: `ping ${1.2 + r * 0.4}s cubic-bezier(0,0,0.2,1) ${r * 0.3}s infinite`, opacity: 0.3 / r }} />
        ))}
      </div>
    </div>
  );
}
