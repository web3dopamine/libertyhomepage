import { libertyChainData, defaultEventCategories } from "@shared/schema";
import type { EmailTemplate, InsertEmailTemplate } from "@shared/schema";
import type {
  Event, InsertEvent,
  WaitlistEntry, InsertWaitlist,
  AcceleratorApplication, InsertAcceleratorApplication, AcceleratorStage,
  EventRegistration, InsertEventRegistration,
  SocialLink, InsertSocialLink,
  Partner, InsertPartner,
  PressArticle, InsertPressArticle,
  EmailCampaign, InsertCampaign,
  Autoresponder, InsertAutoresponder,
  Newsletter, InsertNewsletter,
  RoadmapMilestone, InsertRoadmapMilestone,
  VideoTutorial, InsertVideoTutorial,
} from "@shared/schema";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve("data/db.json");

export interface IStorage {
  getChainData(): typeof libertyChainData;
  getMetrics(): typeof libertyChainData.metrics;
  getFeatures(): typeof libertyChainData.features;
  getCMSContent(pageId: string): Record<string, string>;
  updateCMSContent(pageId: string, fields: Record<string, string>): void;
  resetCMSContent(pageId: string): void;
  getEventCategories(): string[];
  createEventCategory(name: string): string[];
  deleteEventCategory(name: string): string[];
  getEvents(): Event[];
  getEvent(id: string): Event | undefined;
  createEvent(event: InsertEvent): Event;
  updateEvent(id: string, event: Partial<InsertEvent>): Event | undefined;
  deleteEvent(id: string): boolean;
  getEventRegistrations(eventId?: string): EventRegistration[];
  createEventRegistration(eventId: string, eventTitle: string, data: InsertEventRegistration): EventRegistration;
  isEmailRegisteredForEvent(eventId: string, email: string): boolean;
  getWaitlist(): WaitlistEntry[];
  getWaitlistEntry(id: string): WaitlistEntry | undefined;
  createWaitlistEntry(entry: InsertWaitlist): WaitlistEntry;
  deleteWaitlistEntry(id: string): boolean;
  isEmailOnWaitlist(email: string): boolean;
  getAcceleratorApplications(): AcceleratorApplication[];
  getAcceleratorApplication(id: string): AcceleratorApplication | undefined;
  createAcceleratorApplication(app: InsertAcceleratorApplication): AcceleratorApplication;
  updateAcceleratorStage(id: string, stage: AcceleratorStage): AcceleratorApplication | undefined;
  deleteAcceleratorApplication(id: string): boolean;
  isEmailInAccelerator(email: string): boolean;
  getSocialLinks(): SocialLink[];
  createSocialLink(data: InsertSocialLink): SocialLink;
  updateSocialLink(id: string, data: Partial<InsertSocialLink>): SocialLink | undefined;
  deleteSocialLink(id: string): boolean;
  getPartners(): Partner[];
  createPartner(data: InsertPartner): Partner;
  updatePartner(id: string, data: Partial<InsertPartner>): Partner | undefined;
  deletePartner(id: string): boolean;
  getPressArticles(): PressArticle[];
  createPressArticle(data: InsertPressArticle): PressArticle;
  updatePressArticle(id: string, data: Partial<InsertPressArticle>): PressArticle | undefined;
  deletePressArticle(id: string): boolean;
  getCampaigns(): EmailCampaign[];
  getCampaign(id: string): EmailCampaign | undefined;
  createCampaign(data: InsertCampaign): EmailCampaign;
  updateCampaign(id: string, data: Partial<EmailCampaign>): EmailCampaign | undefined;
  deleteCampaign(id: string): boolean;
  cloneCampaign(id: string): EmailCampaign | undefined;
  trackOpen(campaignId: string, recipientId: string): void;
  trackClick(campaignId: string, recipientId: string, url: string): void;
  getAutoresponders(): Autoresponder[];
  getAutoresponder(id: string): Autoresponder | undefined;
  createAutoresponder(data: InsertAutoresponder): Autoresponder;
  updateAutoresponder(id: string, data: Partial<Autoresponder>): Autoresponder | undefined;
  deleteAutoresponder(id: string): boolean;
  incrementAutoresponderSent(id: string): void;
  getNewsletterSignups(): Newsletter[];
  createNewsletterSignup(data: InsertNewsletter): Newsletter;
  isEmailSubscribed(email: string): boolean;
  getCustomPages(): { id: string; title: string; path: string; createdAt: string }[];
  createCustomPage(data: { title: string; path: string }): { id: string; title: string; path: string; createdAt: string };
  deleteCustomPage(id: string): boolean;
  getEmailTemplates(): EmailTemplate[];
  getEmailTemplate(id: string): EmailTemplate | undefined;
  createEmailTemplate(data: InsertEmailTemplate): EmailTemplate;
  updateEmailTemplate(id: string, data: Partial<EmailTemplate>): EmailTemplate | undefined;
  deleteEmailTemplate(id: string): boolean;
  addUnsubscribe(email: string): void;
  isUnsubscribed(email: string): boolean;
  getUnsubscribedEmails(): string[];
  getRoadmapMilestones(): RoadmapMilestone[];
  createRoadmapMilestone(data: InsertRoadmapMilestone): RoadmapMilestone;
  updateRoadmapMilestone(id: string, data: Partial<InsertRoadmapMilestone>): RoadmapMilestone | undefined;
  deleteRoadmapMilestone(id: string): boolean;
  getSectionOrder(): string[];
  setSectionOrder(order: string[]): void;
  getVideoTutorials(): VideoTutorial[];
  createVideoTutorial(data: InsertVideoTutorial): VideoTutorial;
  updateVideoTutorial(id: string, data: Partial<InsertVideoTutorial>): VideoTutorial | undefined;
  deleteVideoTutorial(id: string): boolean;
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: "sl-1", name: "X / Twitter", url: "https://twitter.com/libertychain", icon: "SiX", color: "", handle: "@LibertyChain", description: "Follow us for real-time updates, community highlights, and ecosystem news.", order: 1 },
  { id: "sl-2", name: "Discord", url: "https://discord.gg/libertychain", icon: "SiDiscord", color: "#5865F2", handle: "Liberty Community", description: "Join our Discord server for community discussions, support, and collaboration.", order: 2 },
  { id: "sl-3", name: "GitHub", url: "https://github.com/liberty-chain", icon: "SiGithub", color: "", handle: "liberty-chain", description: "Explore our open-source repositories and contribute to the ecosystem.", order: 3 },
  { id: "sl-4", name: "Telegram", url: "https://t.me/libertychain", icon: "SiTelegram", color: "#0088cc", handle: "LibertyChainOfficial", description: "Join our Telegram channel for instant updates and community chat.", order: 4 },
  { id: "sl-5", name: "YouTube", url: "https://youtube.com/@libertychain", icon: "SiYoutube", color: "#FF0000", handle: "Liberty Chain", description: "Watch tutorials, technical deep dives, and community updates.", order: 5 },
  { id: "sl-6", name: "Medium", url: "https://medium.com/@libertychain", icon: "SiMedium", color: "", handle: "@libertychain", description: "Read our latest blog posts, technical articles, and ecosystem updates.", order: 6 },
];

const DEFAULT_PRESS: PressArticle[] = [
  {
    id: "pa-1",
    publicationName: "CoinTelegraph",
    publicationLogo: "",
    headline: "Liberty Chain Launches with 10,000+ TPS and Zero Gas Fees, Challenging Ethereum's Dominance",
    excerpt: "The new EVM-compatible Layer 1 blockchain promises to deliver unprecedented performance while maintaining full compatibility with existing Ethereum tooling and infrastructure.",
    articleUrl: "https://cointelegraph.com",
    date: "2025-01-15",
    order: 1,
  },
];

const PREMIUM_TEMPLATES: EmailTemplate[] = [
  {
    id: "premium-welcome",
    name: "Welcome to Liberty Chain",
    description: "Onboard new community members with a warm, engaging welcome email",
    category: "welcome",
    isPremium: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    blocks: [
      { id: "pw-1", type: "spacer", props: { height: "20" } },
      { id: "pw-2", type: "heading", props: { text: "Welcome to Liberty Chain", size: "h1", align: "center", color: "#2EB8B8" } },
      { id: "pw-3", type: "text", props: { content: "You've just joined a movement redefining what blockchain technology can be. We're thrilled to have you in the Liberty Chain community.", align: "center", color: "#8ab8b8" } },
      { id: "pw-4", type: "divider", props: { color: "#1a3a3a", spacing: "24" } },
      { id: "pw-5", type: "heading", props: { text: "What makes Liberty Chain different?", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "pw-6", type: "text", props: { content: "⚡ 10,000+ TPS — Ultra-high throughput for real-world applications\n\n🔥 Zero Gas Fees — No barriers, no friction for users or builders\n\n⚡ Instant Finality — Transactions confirmed in under one second\n\n🔒 Fully Decentralized — No trusted parties, no single points of failure", align: "left", color: "#8ab8b8" } },
      { id: "pw-7", type: "spacer", props: { height: "12" } },
      { id: "pw-8", type: "button", props: { text: "Explore Liberty Chain", url: "https://libertychain.org", align: "center", size: "large", color: "#2EB8B8" } },
      { id: "pw-9", type: "spacer", props: { height: "20" } },
    ],
  },
  {
    id: "premium-network-update",
    name: "Network Update",
    description: "Share monthly chain metrics and network performance highlights",
    category: "update",
    isPremium: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    blocks: [
      { id: "nu-1", type: "spacer", props: { height: "12" } },
      { id: "nu-2", type: "heading", props: { text: "Network Update", size: "h1", align: "left", color: "#2EB8B8" } },
      { id: "nu-3", type: "text", props: { content: "Here are this month's highlights from the Liberty Chain network.", align: "left", color: "#8ab8b8" } },
      { id: "nu-4", type: "divider", props: { color: "#1a3a3a", spacing: "20" } },
      { id: "nu-5", type: "heading", props: { text: "Performance Metrics", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "nu-6", type: "text", props: { content: "Peak TPS: 10,247 transactions/second\nAverage Block Time: 0.8 seconds\nNetwork Uptime: 99.98%\nTotal Transactions: 48.2M+", align: "left", color: "#8ab8b8" } },
      { id: "nu-7", type: "divider", props: { color: "#1a3a3a", spacing: "20" } },
      { id: "nu-8", type: "heading", props: { text: "Community Growth", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "nu-9", type: "text", props: { content: "Active Validators: 1,024\nDeveloper Projects: 340+\nCommunity Members: 52,000+\nNew dApps Launched: 18", align: "left", color: "#8ab8b8" } },
      { id: "nu-10", type: "divider", props: { color: "#1a3a3a", spacing: "20" } },
      { id: "nu-11", type: "button", props: { text: "View Full Dashboard", url: "https://explorer.libertychain.org", align: "center", size: "large", color: "#2EB8B8" } },
      { id: "nu-12", type: "spacer", props: { height: "12" } },
    ],
  },
  {
    id: "premium-event-announcement",
    name: "Event Announcement",
    description: "Announce upcoming events, hackathons, and community meetups",
    category: "announcement",
    isPremium: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    blocks: [
      { id: "ea-1", type: "image", props: { src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80", alt: "Liberty Chain Event", link: "", width: "100%", align: "center" } },
      { id: "ea-2", type: "spacer", props: { height: "16" } },
      { id: "ea-3", type: "heading", props: { text: "You're Invited", size: "h1", align: "center", color: "#2EB8B8" } },
      { id: "ea-4", type: "text", props: { content: "Join us for an exclusive Liberty Chain community event. Connect with builders, validators, and ecosystem partners shaping the future of decentralized infrastructure.", align: "center", color: "#8ab8b8" } },
      { id: "ea-5", type: "divider", props: { color: "#1a3a3a", spacing: "20" } },
      { id: "ea-6", type: "heading", props: { text: "When & Where", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "ea-7", type: "text", props: { content: "📅 Date: [Event Date]\n📍 Location: [Event Venue or Online]\n🕐 Time: [Start Time] – [End Time]\n🎟️ Admission: Free for community members", align: "left", color: "#8ab8b8" } },
      { id: "ea-8", type: "spacer", props: { height: "12" } },
      { id: "ea-9", type: "button", props: { text: "Register Now", url: "https://libertychain.org/events", align: "center", size: "large", color: "#2EB8B8" } },
      { id: "ea-10", type: "spacer", props: { height: "16" } },
    ],
  },
  {
    id: "premium-dispatch",
    name: "The Liberty Dispatch",
    description: "Premium newsletter template with multiple content sections",
    category: "newsletter",
    isPremium: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    blocks: [
      { id: "ld-1", type: "heading", props: { text: "The Liberty Dispatch", size: "h1", align: "center", color: "#2EB8B8" } },
      { id: "ld-2", type: "text", props: { content: "Your weekly digest of everything happening across the Liberty Chain ecosystem.", align: "center", color: "#8ab8b8" } },
      { id: "ld-3", type: "divider", props: { color: "#1a3a3a", spacing: "24" } },
      { id: "ld-4", type: "heading", props: { text: "Feature Story", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "ld-5", type: "text", props: { content: "Write your lead story here. This is the main narrative of this week's dispatch — highlight a major milestone, new partnership, or community achievement.", align: "left", color: "#8ab8b8" } },
      { id: "ld-6", type: "divider", props: { color: "#1a3a3a", spacing: "24" } },
      { id: "ld-7", type: "heading", props: { text: "Ecosystem Updates", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "ld-8", type: "text", props: { content: "• [Update 1] — Brief description of the update\n• [Update 2] — Brief description of the update\n• [Update 3] — Brief description of the update\n• [Update 4] — Brief description of the update", align: "left", color: "#8ab8b8" } },
      { id: "ld-9", type: "divider", props: { color: "#1a3a3a", spacing: "24" } },
      { id: "ld-10", type: "heading", props: { text: "Developer Corner", size: "h2", align: "left", color: "#e0f0f0" } },
      { id: "ld-11", type: "text", props: { content: "Share technical updates, new tools, or developer resources here. Keep builders informed about what's changing in the ecosystem.", align: "left", color: "#8ab8b8" } },
      { id: "ld-12", type: "spacer", props: { height: "12" } },
      { id: "ld-13", type: "button", props: { text: "Read Full Edition", url: "https://libertychain.org", align: "center", size: "large", color: "#2EB8B8" } },
      { id: "ld-14", type: "spacer", props: { height: "12" } },
    ],
  },
];

const DEFAULT_ROADMAP: RoadmapMilestone[] = [
  { id: "rm-1", quarter: "Q1 2025", title: "Genesis Block",        description: "Liberty Chain mainnet launches with 10,000+ TPS and zero gas fees. The foundation of a new decentralized era is laid — EVM-compatible from day one.",                                              status: "completed", order: 1, icon: "Rocket"         },
  { id: "rm-2", quarter: "Q2 2025", title: "DeFi Foundation",      description: "The first wave of DeFi protocols deploy on Liberty Chain. Zero-fee swaps, overcollateralized lending, and yield farming go live across the ecosystem.",                                                  status: "completed", order: 2, icon: "Coins"          },
  { id: "rm-3", quarter: "Q3 2025", title: "Developer Ecosystem",  description: "SDK releases, the Liberty Grants Program launches, and developer tooling reaches 1,000+ active builders. The open-source community takes shape.",                                                       status: "completed", order: 3, icon: "Terminal"       },
  { id: "rm-4", quarter: "Q4 2025", title: "Cross-Chain Bridge",   description: "Native bridge enables seamless asset transfers between Liberty Chain, Ethereum, and 10+ EVM-compatible networks with sub-second finality.",                                                              status: "active",    order: 4, icon: "ArrowLeftRight" },
  { id: "rm-5", quarter: "Q1 2026", title: "On-Chain Governance",  description: "Community-driven governance goes live. Token holders vote on protocol upgrades, treasury allocation, and ecosystem grants — fully on-chain.",                                                           status: "upcoming",  order: 5, icon: "Vote"           },
  { id: "rm-6", quarter: "Q2 2026", title: "Mobile & Mesh",        description: "Full mobile node support with Meshtastic integration. Run Liberty Chain on mesh radio networks — no internet connection required.",                                                                       status: "upcoming",  order: 6, icon: "Radio"          },
  { id: "rm-7", quarter: "Q3 2026", title: "Global Adoption",      description: "Enterprise partnerships, institutional integrations, and 10M+ active wallets mark Liberty Chain's emergence as a leading global Layer 1 blockchain.",                                                     status: "upcoming",  order: 7, icon: "Globe"          },
];

export class MemStorage implements IStorage {
  private events: Event[];
  private eventCategories: string[];
  private waitlist: WaitlistEntry[];
  private acceleratorApps: AcceleratorApplication[];
  private eventRegistrations: EventRegistration[];
  private cmsContent: Record<string, Record<string, string>>;
  private socialLinks: SocialLink[];
  private partners: Partner[];
  private pressArticles: PressArticle[];
  private campaigns: EmailCampaign[];
  private autoresponders: Autoresponder[];
  private newsletter: Newsletter[];
  private customPages: { id: string; title: string; path: string; createdAt: string }[];
  private emailTemplates: EmailTemplate[];
  private unsubscribedEmails: string[];
  private roadmapMilestones: RoadmapMilestone[];
  private sectionOrder: string[];
  private videoTutorials: VideoTutorial[];

  constructor() {
    this.events = [...libertyChainData.events];
    this.eventCategories = [...defaultEventCategories];
    this.waitlist = [];
    this.acceleratorApps = [];
    this.eventRegistrations = [];
    this.cmsContent = {};
    this.socialLinks = [...DEFAULT_SOCIAL_LINKS];
    this.partners = [];
    this.pressArticles = [...DEFAULT_PRESS];
    this.campaigns = [];
    this.autoresponders = [];
    this.newsletter = [];
    this.customPages = [];
    this.emailTemplates = [];
    this.unsubscribedEmails = [];
    this.roadmapMilestones = [...DEFAULT_ROADMAP];
    this.sectionOrder = ["performance", "meshtastic", "evm", "network", "trilemma", "ecosystem", "press", "partners", "newsletter", "roadmap"];
    this.videoTutorials = [];
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(DB_PATH)) return;
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const db = JSON.parse(raw);
      if (db.events) this.events = db.events;
      if (db.eventCategories) this.eventCategories = db.eventCategories;
      if (db.waitlist) this.waitlist = db.waitlist;
      if (db.acceleratorApps) this.acceleratorApps = db.acceleratorApps;
      if (db.eventRegistrations) this.eventRegistrations = db.eventRegistrations;
      if (db.cmsContent) this.cmsContent = db.cmsContent;
      if (db.socialLinks) this.socialLinks = db.socialLinks;
      if (db.partners) this.partners = db.partners;
      if (db.pressArticles) this.pressArticles = db.pressArticles;
      if (db.campaigns) this.campaigns = db.campaigns;
      if (db.autoresponders) this.autoresponders = db.autoresponders;
      if (db.newsletter) this.newsletter = db.newsletter;
      if (db.customPages) this.customPages = db.customPages;
      if (db.emailTemplates) this.emailTemplates = db.emailTemplates;
      if (db.unsubscribedEmails) this.unsubscribedEmails = db.unsubscribedEmails;
      if (db.roadmapMilestones) this.roadmapMilestones = db.roadmapMilestones;
      if (db.sectionOrder) this.sectionOrder = db.sectionOrder;
      if (db.videoTutorials) this.videoTutorials = db.videoTutorials;
    } catch (e) {
      console.error("[storage] Failed to load db.json:", e);
    }
  }

  private save(): void {
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify({
        events: this.events,
        eventCategories: this.eventCategories,
        waitlist: this.waitlist,
        acceleratorApps: this.acceleratorApps,
        eventRegistrations: this.eventRegistrations,
        cmsContent: this.cmsContent,
        socialLinks: this.socialLinks,
        partners: this.partners,
        pressArticles: this.pressArticles,
        campaigns: this.campaigns,
        autoresponders: this.autoresponders,
        newsletter: this.newsletter,
        customPages: this.customPages,
        emailTemplates: this.emailTemplates,
        unsubscribedEmails: this.unsubscribedEmails,
        roadmapMilestones: this.roadmapMilestones,
        sectionOrder: this.sectionOrder,
        videoTutorials: this.videoTutorials,
      }, null, 2), "utf-8");
    } catch (e) {
      console.error("[storage] Failed to save db.json:", e);
    }
  }

  getChainData() { return libertyChainData; }
  getMetrics() { return libertyChainData.metrics; }
  getFeatures() { return libertyChainData.features; }

  // ── CMS Content ─────────────────────────────────────
  getCMSContent(pageId: string): Record<string, string> {
    return { ...(this.cmsContent[pageId] || {}) };
  }

  updateCMSContent(pageId: string, fields: Record<string, string>): void {
    this.cmsContent[pageId] = { ...(this.cmsContent[pageId] || {}), ...fields };
    this.save();
  }

  resetCMSContent(pageId: string): void {
    delete this.cmsContent[pageId];
    this.save();
  }

  // ── Event Categories ─────────────────────────────────
  getEventCategories(): string[] {
    return [...this.eventCategories];
  }

  createEventCategory(name: string): string[] {
    const trimmed = name.trim();
    if (!trimmed || this.eventCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return [...this.eventCategories];
    }
    this.eventCategories.push(trimmed);
    this.save();
    return [...this.eventCategories];
  }

  deleteEventCategory(name: string): string[] {
    this.eventCategories = this.eventCategories.filter((c) => c !== name);
    this.save();
    return [...this.eventCategories];
  }

  // ── Events ──────────────────────────────────────────
  getEvents(): Event[] {
    return [...this.events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getEvent(id: string): Event | undefined {
    return this.events.find((e) => e.id === id);
  }

  createEvent(event: InsertEvent): Event {
    const newEvent: Event = { ...event, id: nanoid() };
    this.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<InsertEvent>): Event | undefined {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    this.events[index] = { ...this.events[index], ...updates };
    this.save();
    return this.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.events.splice(index, 1);
    this.save();
    return true;
  }

  // ── Event Registrations ──────────────────────────────
  getEventRegistrations(eventId?: string): EventRegistration[] {
    const list = eventId
      ? this.eventRegistrations.filter((r) => r.eventId === eventId)
      : [...this.eventRegistrations];
    return list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }

  createEventRegistration(eventId: string, eventTitle: string, data: InsertEventRegistration): EventRegistration {
    const reg: EventRegistration = {
      ...data,
      id: nanoid(),
      eventId,
      eventTitle,
      registeredAt: new Date().toISOString(),
    };
    this.eventRegistrations.push(reg);
    this.save();
    return reg;
  }

  isEmailRegisteredForEvent(eventId: string, email: string): boolean {
    return this.eventRegistrations.some(
      (r) => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase()
    );
  }

  // ── Waitlist ─────────────────────────────────────────
  getWaitlist(): WaitlistEntry[] {
    return [...this.waitlist].sort(
      (a, b) => new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime()
    );
  }

  getWaitlistEntry(id: string): WaitlistEntry | undefined {
    return this.waitlist.find((e) => e.id === id);
  }

  isEmailOnWaitlist(email: string): boolean {
    return this.waitlist.some(
      (e) => e.email.toLowerCase() === email.toLowerCase()
    );
  }

  createWaitlistEntry(entry: InsertWaitlist): WaitlistEntry {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: nanoid(),
      signedUpAt: new Date().toISOString(),
    };
    this.waitlist.push(newEntry);
    this.save();
    return newEntry;
  }

  deleteWaitlistEntry(id: string): boolean {
    const index = this.waitlist.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.waitlist.splice(index, 1);
    this.save();
    return true;
  }

  // ── Accelerator Applications ──────────────────────────
  getAcceleratorApplications(): AcceleratorApplication[] {
    return [...this.acceleratorApps].sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  }

  getAcceleratorApplication(id: string): AcceleratorApplication | undefined {
    return this.acceleratorApps.find((a) => a.id === id);
  }

  isEmailInAccelerator(email: string): boolean {
    return this.acceleratorApps.some(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
  }

  createAcceleratorApplication(app: InsertAcceleratorApplication): AcceleratorApplication {
    const newApp: AcceleratorApplication = {
      ...app,
      id: nanoid(),
      pipelineStage: 'applied',
      appliedAt: new Date().toISOString(),
    };
    this.acceleratorApps.push(newApp);
    this.save();
    return newApp;
  }

  updateAcceleratorStage(id: string, stage: AcceleratorStage): AcceleratorApplication | undefined {
    const index = this.acceleratorApps.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.acceleratorApps[index] = { ...this.acceleratorApps[index], pipelineStage: stage };
    this.save();
    return this.acceleratorApps[index];
  }

  deleteAcceleratorApplication(id: string): boolean {
    const index = this.acceleratorApps.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.acceleratorApps.splice(index, 1);
    this.save();
    return true;
  }

  // ── Social Links ──────────────────────────────────────
  getSocialLinks(): SocialLink[] {
    return [...this.socialLinks].sort((a, b) => a.order - b.order);
  }

  createSocialLink(data: InsertSocialLink): SocialLink {
    const link: SocialLink = { ...data, id: nanoid() };
    this.socialLinks.push(link);
    this.save();
    return link;
  }

  updateSocialLink(id: string, data: Partial<InsertSocialLink>): SocialLink | undefined {
    const index = this.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.socialLinks[index] = { ...this.socialLinks[index], ...data };
    this.save();
    return this.socialLinks[index];
  }

  deleteSocialLink(id: string): boolean {
    const index = this.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.socialLinks.splice(index, 1);
    this.save();
    return true;
  }

  // ── Partners ──────────────────────────────────────────
  getPartners(): Partner[] {
    return [...this.partners].sort((a, b) => a.order - b.order);
  }

  createPartner(data: InsertPartner): Partner {
    const partner: Partner = { ...data, id: nanoid() };
    this.partners.push(partner);
    this.save();
    return partner;
  }

  updatePartner(id: string, data: Partial<InsertPartner>): Partner | undefined {
    const index = this.partners.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    this.partners[index] = { ...this.partners[index], ...data };
    this.save();
    return this.partners[index];
  }

  deletePartner(id: string): boolean {
    const index = this.partners.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.partners.splice(index, 1);
    this.save();
    return true;
  }

  // ── Press Articles ────────────────────────────────────
  getPressArticles(): PressArticle[] {
    return [...this.pressArticles].sort((a, b) => a.order - b.order);
  }

  createPressArticle(data: InsertPressArticle): PressArticle {
    const article: PressArticle = { ...data, id: nanoid() };
    this.pressArticles.push(article);
    this.save();
    return article;
  }

  updatePressArticle(id: string, data: Partial<InsertPressArticle>): PressArticle | undefined {
    const index = this.pressArticles.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    this.pressArticles[index] = { ...this.pressArticles[index], ...data };
    this.save();
    return this.pressArticles[index];
  }

  deletePressArticle(id: string): boolean {
    const index = this.pressArticles.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.pressArticles.splice(index, 1);
    this.save();
    return true;
  }

  // ── Email Campaigns ───────────────────────────────────
  getCampaigns(): EmailCampaign[] {
    return [...this.campaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getCampaign(id: string): EmailCampaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  createCampaign(data: InsertCampaign): EmailCampaign {
    const now = new Date().toISOString();
    const campaign: EmailCampaign = {
      id: nanoid(),
      name: data.name,
      subject: data.subject || "",
      previewText: data.previewText || "",
      blocks: (data.blocks as any) || [],
      status: "draft",
      audienceType: data.audienceType || "all",
      customEmails: data.customEmails || "",
      csvRecipients: (data.csvRecipients as any) || [],
      createdAt: now,
      updatedAt: now,
      sentCount: 0,
      openCount: 0,
      openedIds: [],
      clickCount: 0,
      clickedIds: [],
      clickedLinks: {},
    };
    this.campaigns.push(campaign);
    this.save();
    return campaign;
  }

  updateCampaign(id: string, data: Partial<EmailCampaign>): EmailCampaign | undefined {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.campaigns[index] = { ...this.campaigns[index], ...data, updatedAt: new Date().toISOString() };
    this.save();
    return this.campaigns[index];
  }

  deleteCampaign(id: string): boolean {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.campaigns.splice(index, 1);
    this.save();
    return true;
  }

  cloneCampaign(id: string): EmailCampaign | undefined {
    const original = this.campaigns.find((c) => c.id === id);
    if (!original) return undefined;
    const now = new Date().toISOString();
    const clone: EmailCampaign = {
      ...original,
      id: nanoid(),
      name: `${original.name} (Copy)`,
      status: "draft",
      sentCount: 0,
      openCount: 0,
      openedIds: [],
      clickCount: 0,
      clickedIds: [],
      clickedLinks: {},
      createdAt: now,
      updatedAt: now,
      sentAt: undefined,
    };
    this.campaigns.push(clone);
    this.save();
    return clone;
  }

  trackOpen(campaignId: string, recipientId: string): void {
    const index = this.campaigns.findIndex((c) => c.id === campaignId);
    if (index === -1) return;
    const c = this.campaigns[index];
    c.openCount++;
    if (!c.openedIds.includes(recipientId)) {
      c.openedIds.push(recipientId);
    }
    this.save();
  }

  trackClick(campaignId: string, recipientId: string, url: string): void {
    const index = this.campaigns.findIndex((c) => c.id === campaignId);
    if (index === -1) return;
    const c = this.campaigns[index];
    c.clickCount++;
    if (!c.clickedIds.includes(recipientId)) {
      c.clickedIds.push(recipientId);
    }
    c.clickedLinks[url] = (c.clickedLinks[url] || 0) + 1;
    this.save();
  }

  // ── Autoresponders ────────────────────────────────────
  getAutoresponders(): Autoresponder[] {
    return [...this.autoresponders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  getAutoresponder(id: string): Autoresponder | undefined {
    return this.autoresponders.find((a) => a.id === id);
  }

  createAutoresponder(data: InsertAutoresponder): Autoresponder {
    const ar: Autoresponder = {
      id: nanoid(),
      name: data.name,
      trigger: data.trigger,
      delayHours: data.delayHours ?? 0,
      subject: data.subject || "",
      previewText: data.previewText || "",
      blocks: (data.blocks as any) || [],
      active: data.active ?? true,
      createdAt: new Date().toISOString(),
      sentCount: 0,
      sourceType: data.sourceType ?? "custom",
      sourceId: data.sourceId ?? "",
      broadcastLists: data.broadcastLists ?? [],
    };
    this.autoresponders.push(ar);
    this.save();
    return ar;
  }

  updateAutoresponder(id: string, data: Partial<Autoresponder>): Autoresponder | undefined {
    const index = this.autoresponders.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.autoresponders[index] = { ...this.autoresponders[index], ...data };
    this.save();
    return this.autoresponders[index];
  }

  deleteAutoresponder(id: string): boolean {
    const index = this.autoresponders.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.autoresponders.splice(index, 1);
    this.save();
    return true;
  }

  // ── Newsletter ────────────────────────────────────────
  getNewsletterSignups(): Newsletter[] {
    return [...this.newsletter].sort((a, b) => new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime());
  }

  createNewsletterSignup(data: InsertNewsletter): Newsletter {
    const entry: Newsletter = { id: nanoid(), name: data.name, email: data.email, signedUpAt: new Date().toISOString() };
    this.newsletter.push(entry);
    this.save();
    return entry;
  }

  isEmailSubscribed(email: string): boolean {
    return this.newsletter.some((n) => n.email.toLowerCase() === email.toLowerCase());
  }

  incrementAutoresponderSent(id: string): void {
    const index = this.autoresponders.findIndex((a) => a.id === id);
    if (index === -1) return;
    this.autoresponders[index].sentCount++;
    this.save();
  }

  // ── Custom Pages ─────────────────────────────────────
  getCustomPages() {
    return [...this.customPages];
  }

  createCustomPage(data: { title: string; path: string }) {
    const page = {
      id: `custom-${nanoid()}`,
      title: data.title,
      path: data.path,
      createdAt: new Date().toISOString(),
    };
    this.customPages.push(page);
    this.save();
    return page;
  }

  deleteCustomPage(id: string): boolean {
    const index = this.customPages.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.customPages.splice(index, 1);
    delete this.cmsContent[id];
    this.save();
    return true;
  }

  // ── Email Templates ───────────────────────────────────
  getEmailTemplates(): EmailTemplate[] {
    return [...PREMIUM_TEMPLATES, ...this.emailTemplates].sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  getEmailTemplate(id: string): EmailTemplate | undefined {
    return PREMIUM_TEMPLATES.find((t) => t.id === id) || this.emailTemplates.find((t) => t.id === id);
  }

  createEmailTemplate(data: InsertEmailTemplate): EmailTemplate {
    const template: EmailTemplate = {
      id: nanoid(),
      name: data.name,
      description: data.description || "",
      category: data.category || "custom",
      blocks: (data.blocks as any) || [],
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    this.emailTemplates.push(template);
    this.save();
    return template;
  }

  updateEmailTemplate(id: string, data: Partial<EmailTemplate>): EmailTemplate | undefined {
    const idx = this.emailTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.emailTemplates[idx] = { ...this.emailTemplates[idx], ...data };
    this.save();
    return this.emailTemplates[idx];
  }

  deleteEmailTemplate(id: string): boolean {
    const idx = this.emailTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.emailTemplates.splice(idx, 1);
    this.save();
    return true;
  }

  addUnsubscribe(email: string): void {
    const normalized = email.toLowerCase().trim();
    if (!this.unsubscribedEmails.includes(normalized)) {
      this.unsubscribedEmails.push(normalized);
      this.save();
    }
  }

  isUnsubscribed(email: string): boolean {
    return this.unsubscribedEmails.includes(email.toLowerCase().trim());
  }

  getUnsubscribedEmails(): string[] {
    return [...this.unsubscribedEmails];
  }

  // ── Roadmap ───────────────────────────────────────────
  getRoadmapMilestones(): RoadmapMilestone[] {
    return [...this.roadmapMilestones].sort((a, b) => a.order - b.order);
  }

  createRoadmapMilestone(data: InsertRoadmapMilestone): RoadmapMilestone {
    const maxOrder = this.roadmapMilestones.reduce((m, r) => Math.max(m, r.order), 0);
    const milestone: RoadmapMilestone = { ...data, id: nanoid(), order: data.order || maxOrder + 1 };
    this.roadmapMilestones.push(milestone);
    this.save();
    return milestone;
  }

  updateRoadmapMilestone(id: string, data: Partial<InsertRoadmapMilestone>): RoadmapMilestone | undefined {
    const idx = this.roadmapMilestones.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.roadmapMilestones[idx] = { ...this.roadmapMilestones[idx], ...data };
    this.save();
    return this.roadmapMilestones[idx];
  }

  deleteRoadmapMilestone(id: string): boolean {
    const idx = this.roadmapMilestones.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.roadmapMilestones.splice(idx, 1);
    this.save();
    return true;
  }

  // ── Section Order ────────────────────────────────────
  getSectionOrder(): string[] {
    return [...this.sectionOrder];
  }

  setSectionOrder(order: string[]): void {
    this.sectionOrder = order;
    this.save();
  }

  // ── Video Tutorials ──────────────────────────────────
  getVideoTutorials(): VideoTutorial[] {
    return [...this.videoTutorials].sort((a, b) => a.order - b.order);
  }

  createVideoTutorial(data: InsertVideoTutorial): VideoTutorial {
    const maxOrder = this.videoTutorials.reduce((m, v) => Math.max(m, v.order), 0);
    const tutorial: VideoTutorial = { ...data, id: nanoid(), order: data.order || maxOrder + 1 };
    this.videoTutorials.push(tutorial);
    this.save();
    return tutorial;
  }

  updateVideoTutorial(id: string, data: Partial<InsertVideoTutorial>): VideoTutorial | undefined {
    const idx = this.videoTutorials.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    this.videoTutorials[idx] = { ...this.videoTutorials[idx], ...data };
    this.save();
    return this.videoTutorials[idx];
  }

  deleteVideoTutorial(id: string): boolean {
    const idx = this.videoTutorials.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    this.videoTutorials.splice(idx, 1);
    this.save();
    return true;
  }
}

export const storage = new MemStorage();
