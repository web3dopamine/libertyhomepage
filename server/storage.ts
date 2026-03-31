import { libertyChainData } from "@shared/schema";
import type { Event, InsertEvent } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getChainData(): typeof libertyChainData;
  getMetrics(): typeof libertyChainData.metrics;
  getFeatures(): typeof libertyChainData.features;
  getEvents(): Event[];
  getEvent(id: string): Event | undefined;
  createEvent(event: InsertEvent): Event;
  updateEvent(id: string, event: Partial<InsertEvent>): Event | undefined;
  deleteEvent(id: string): boolean;
}

export class MemStorage implements IStorage {
  private events: Event[];

  constructor() {
    this.events = [...libertyChainData.events];
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
}

export const storage = new MemStorage();
