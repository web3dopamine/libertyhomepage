import { libertyChainData } from "@shared/schema";
import type {
  Event, InsertEvent,
  WaitlistEntry, InsertWaitlist,
  AcceleratorApplication, InsertAcceleratorApplication, AcceleratorStage,
  EventRegistration, InsertEventRegistration,
  SocialLink, InsertSocialLink,
  Partner, InsertPartner,
  PressArticle, InsertPressArticle,
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getChainData(): typeof libertyChainData;
  getMetrics(): typeof libertyChainData.metrics;
  getFeatures(): typeof libertyChainData.features;
  // CMS Content
  getCMSContent(pageId: string): Record<string, string>;
  updateCMSContent(pageId: string, fields: Record<string, string>): void;
  resetCMSContent(pageId: string): void;
  // Events
  getEvents(): Event[];
  getEvent(id: string): Event | undefined;
  createEvent(event: InsertEvent): Event;
  updateEvent(id: string, event: Partial<InsertEvent>): Event | undefined;
  deleteEvent(id: string): boolean;
  // Event Registrations
  getEventRegistrations(eventId?: string): EventRegistration[];
  createEventRegistration(eventId: string, eventTitle: string, data: InsertEventRegistration): EventRegistration;
  isEmailRegisteredForEvent(eventId: string, email: string): boolean;
  // Waitlist
  getWaitlist(): WaitlistEntry[];
  getWaitlistEntry(id: string): WaitlistEntry | undefined;
  createWaitlistEntry(entry: InsertWaitlist): WaitlistEntry;
  deleteWaitlistEntry(id: string): boolean;
  isEmailOnWaitlist(email: string): boolean;
  // Accelerator Applications
  getAcceleratorApplications(): AcceleratorApplication[];
  getAcceleratorApplication(id: string): AcceleratorApplication | undefined;
  createAcceleratorApplication(app: InsertAcceleratorApplication): AcceleratorApplication;
  updateAcceleratorStage(id: string, stage: AcceleratorStage): AcceleratorApplication | undefined;
  deleteAcceleratorApplication(id: string): boolean;
  isEmailInAccelerator(email: string): boolean;
  // Social Links
  getSocialLinks(): SocialLink[];
  createSocialLink(data: InsertSocialLink): SocialLink;
  updateSocialLink(id: string, data: Partial<InsertSocialLink>): SocialLink | undefined;
  deleteSocialLink(id: string): boolean;
  // Partners
  getPartners(): Partner[];
  createPartner(data: InsertPartner): Partner;
  updatePartner(id: string, data: Partial<InsertPartner>): Partner | undefined;
  deletePartner(id: string): boolean;
  // Press Articles
  getPressArticles(): PressArticle[];
  createPressArticle(data: InsertPressArticle): PressArticle;
  updatePressArticle(id: string, data: Partial<InsertPressArticle>): PressArticle | undefined;
  deletePressArticle(id: string): boolean;
}

export class MemStorage implements IStorage {
  private events: Event[];
  private waitlist: WaitlistEntry[];
  private acceleratorApps: AcceleratorApplication[];
  private eventRegistrations: EventRegistration[];
  private cmsContent: Record<string, Record<string, string>> = {};
  private socialLinks: SocialLink[];
  private partners: Partner[];
  private pressArticles: PressArticle[];

  constructor() {
    this.events = [...libertyChainData.events];
    this.waitlist = [];
    this.acceleratorApps = [];
    this.eventRegistrations = [];
    this.socialLinks = [
      { id: "sl-1", name: "X / Twitter", url: "https://twitter.com/libertychain", icon: "SiX", color: "", handle: "@LibertyChain", description: "Follow us for real-time updates, community highlights, and ecosystem news.", order: 1 },
      { id: "sl-2", name: "Discord", url: "https://discord.gg/libertychain", icon: "SiDiscord", color: "#5865F2", handle: "Liberty Community", description: "Join our Discord server for community discussions, support, and collaboration.", order: 2 },
      { id: "sl-3", name: "GitHub", url: "https://github.com/liberty-chain", icon: "SiGithub", color: "", handle: "liberty-chain", description: "Explore our open-source repositories and contribute to the ecosystem.", order: 3 },
      { id: "sl-4", name: "Telegram", url: "https://t.me/libertychain", icon: "SiTelegram", color: "#0088cc", handle: "LibertyChainOfficial", description: "Join our Telegram channel for instant updates and community chat.", order: 4 },
      { id: "sl-5", name: "YouTube", url: "https://youtube.com/@libertychain", icon: "SiYoutube", color: "#FF0000", handle: "Liberty Chain", description: "Watch tutorials, technical deep dives, and community updates.", order: 5 },
      { id: "sl-6", name: "Medium", url: "https://medium.com/@libertychain", icon: "SiMedium", color: "", handle: "@libertychain", description: "Read our latest blog posts, technical articles, and ecosystem updates.", order: 6 },
    ];
    this.partners = [];
    this.pressArticles = [
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
  }

  // ── CMS Content ─────────────────────────────────────
  getCMSContent(pageId: string): Record<string, string> {
    return { ...(this.cmsContent[pageId] || {}) };
  }

  updateCMSContent(pageId: string, fields: Record<string, string>): void {
    this.cmsContent[pageId] = { ...(this.cmsContent[pageId] || {}), ...fields };
  }

  resetCMSContent(pageId: string): void {
    delete this.cmsContent[pageId];
  }

  getChainData() {
    return libertyChainData;
  }

  getMetrics() {
    return libertyChainData.metrics;
  }

  getFeatures() {
    return libertyChainData.features;
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
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<InsertEvent>): Event | undefined {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.events.splice(index, 1);
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
    return newEntry;
  }

  deleteWaitlistEntry(id: string): boolean {
    const index = this.waitlist.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.waitlist.splice(index, 1);
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
    return newApp;
  }

  updateAcceleratorStage(id: string, stage: AcceleratorStage): AcceleratorApplication | undefined {
    const index = this.acceleratorApps.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.acceleratorApps[index] = { ...this.acceleratorApps[index], pipelineStage: stage };
    return this.acceleratorApps[index];
  }

  deleteAcceleratorApplication(id: string): boolean {
    const index = this.acceleratorApps.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.acceleratorApps.splice(index, 1);
    return true;
  }

  // ── Social Links ──────────────────────────────────────
  getSocialLinks(): SocialLink[] {
    return [...this.socialLinks].sort((a, b) => a.order - b.order);
  }

  createSocialLink(data: InsertSocialLink): SocialLink {
    const link: SocialLink = { ...data, id: nanoid() };
    this.socialLinks.push(link);
    return link;
  }

  updateSocialLink(id: string, data: Partial<InsertSocialLink>): SocialLink | undefined {
    const index = this.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.socialLinks[index] = { ...this.socialLinks[index], ...data };
    return this.socialLinks[index];
  }

  deleteSocialLink(id: string): boolean {
    const index = this.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.socialLinks.splice(index, 1);
    return true;
  }

  // ── Partners ──────────────────────────────────────────
  getPartners(): Partner[] {
    return [...this.partners].sort((a, b) => a.order - b.order);
  }

  createPartner(data: InsertPartner): Partner {
    const partner: Partner = { ...data, id: nanoid() };
    this.partners.push(partner);
    return partner;
  }

  updatePartner(id: string, data: Partial<InsertPartner>): Partner | undefined {
    const index = this.partners.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    this.partners[index] = { ...this.partners[index], ...data };
    return this.partners[index];
  }

  deletePartner(id: string): boolean {
    const index = this.partners.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.partners.splice(index, 1);
    return true;
  }

  // ── Press Articles ────────────────────────────────────
  getPressArticles(): PressArticle[] {
    return [...this.pressArticles].sort((a, b) => a.order - b.order);
  }

  createPressArticle(data: InsertPressArticle): PressArticle {
    const article: PressArticle = { ...data, id: nanoid() };
    this.pressArticles.push(article);
    return article;
  }

  updatePressArticle(id: string, data: Partial<InsertPressArticle>): PressArticle | undefined {
    const index = this.pressArticles.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    this.pressArticles[index] = { ...this.pressArticles[index], ...data };
    return this.pressArticles[index];
  }

  deletePressArticle(id: string): boolean {
    const index = this.pressArticles.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.pressArticles.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();
