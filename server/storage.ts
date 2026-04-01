import { libertyChainData } from "@shared/schema";
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
  getCustomPages(): { id: string; title: string; path: string; createdAt: string }[];
  createCustomPage(data: { title: string; path: string }): { id: string; title: string; path: string; createdAt: string };
  deleteCustomPage(id: string): boolean;
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

export class MemStorage implements IStorage {
  private events: Event[];
  private waitlist: WaitlistEntry[];
  private acceleratorApps: AcceleratorApplication[];
  private eventRegistrations: EventRegistration[];
  private cmsContent: Record<string, Record<string, string>>;
  private socialLinks: SocialLink[];
  private partners: Partner[];
  private pressArticles: PressArticle[];
  private campaigns: EmailCampaign[];
  private autoresponders: Autoresponder[];
  private customPages: { id: string; title: string; path: string; createdAt: string }[];

  constructor() {
    this.events = [...libertyChainData.events];
    this.waitlist = [];
    this.acceleratorApps = [];
    this.eventRegistrations = [];
    this.cmsContent = {};
    this.socialLinks = [...DEFAULT_SOCIAL_LINKS];
    this.partners = [];
    this.pressArticles = [...DEFAULT_PRESS];
    this.campaigns = [];
    this.autoresponders = [];
    this.customPages = [];
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(DB_PATH)) return;
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const db = JSON.parse(raw);
      if (db.events) this.events = db.events;
      if (db.waitlist) this.waitlist = db.waitlist;
      if (db.acceleratorApps) this.acceleratorApps = db.acceleratorApps;
      if (db.eventRegistrations) this.eventRegistrations = db.eventRegistrations;
      if (db.cmsContent) this.cmsContent = db.cmsContent;
      if (db.socialLinks) this.socialLinks = db.socialLinks;
      if (db.partners) this.partners = db.partners;
      if (db.pressArticles) this.pressArticles = db.pressArticles;
      if (db.campaigns) this.campaigns = db.campaigns;
      if (db.autoresponders) this.autoresponders = db.autoresponders;
      if (db.customPages) this.customPages = db.customPages;
    } catch (e) {
      console.error("[storage] Failed to load db.json:", e);
    }
  }

  private save(): void {
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify({
        events: this.events,
        waitlist: this.waitlist,
        acceleratorApps: this.acceleratorApps,
        eventRegistrations: this.eventRegistrations,
        cmsContent: this.cmsContent,
        socialLinks: this.socialLinks,
        partners: this.partners,
        pressArticles: this.pressArticles,
        campaigns: this.campaigns,
        autoresponders: this.autoresponders,
        customPages: this.customPages,
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
}

export const storage = new MemStorage();
