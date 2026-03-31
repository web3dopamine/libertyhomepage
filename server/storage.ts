import { libertyChainData } from "@shared/schema";
import type {
  Event, InsertEvent,
  WaitlistEntry, InsertWaitlist,
  AcceleratorApplication, InsertAcceleratorApplication, AcceleratorStage,
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getChainData(): typeof libertyChainData;
  getMetrics(): typeof libertyChainData.metrics;
  getFeatures(): typeof libertyChainData.features;
  // Events
  getEvents(): Event[];
  getEvent(id: string): Event | undefined;
  createEvent(event: InsertEvent): Event;
  updateEvent(id: string, event: Partial<InsertEvent>): Event | undefined;
  deleteEvent(id: string): boolean;
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
}

export class MemStorage implements IStorage {
  private events: Event[];
  private waitlist: WaitlistEntry[];
  private acceleratorApps: AcceleratorApplication[];

  constructor() {
    this.events = [...libertyChainData.events];
    this.waitlist = [];
    this.acceleratorApps = [];
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
}

export const storage = new MemStorage();
