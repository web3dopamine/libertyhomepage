import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertWaitlistSchema, insertAcceleratorSchema, acceleratorStageValues } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ── Liberty Chain data ─────────────────────────────────
  app.get("/api/chain-data", (_req, res) => {
    res.json(storage.getChainData());
  });

  app.get("/api/metrics", (_req, res) => {
    res.json(storage.getMetrics());
  });

  app.get("/api/features", (_req, res) => {
    res.json(storage.getFeatures());
  });

  // ── Events CRUD ────────────────────────────────────────
  app.get("/api/events", (_req, res) => {
    res.json(storage.getEvents());
  });

  app.post("/api/events", (req, res) => {
    const result = insertEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    res.status(201).json(storage.createEvent(result.data));
  });

  app.put("/api/events/:id", (req, res) => {
    const result = insertEventSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const updated = storage.updateEvent(req.params.id, result.data);
    if (!updated) return res.status(404).json({ error: "Event not found" });
    res.json(updated);
  });

  app.delete("/api/events/:id", (req, res) => {
    const deleted = storage.deleteEvent(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true });
  });

  // ── Waitlist ───────────────────────────────────────────
  app.get("/api/waitlist", (_req, res) => {
    res.json(storage.getWaitlist());
  });

  app.post("/api/waitlist", (req, res) => {
    const result = insertWaitlistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    if (storage.isEmailOnWaitlist(result.data.email)) {
      return res.status(409).json({ error: "This email is already on the waitlist." });
    }
    res.status(201).json(storage.createWaitlistEntry(result.data));
  });

  app.delete("/api/waitlist/:id", (req, res) => {
    const deleted = storage.deleteWaitlistEntry(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true });
  });

  // ── Accelerator Applications ───────────────────────────
  app.get("/api/accelerator", (_req, res) => {
    res.json(storage.getAcceleratorApplications());
  });

  app.post("/api/accelerator", (req, res) => {
    const result = insertAcceleratorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    if (storage.isEmailInAccelerator(result.data.email)) {
      return res.status(409).json({ error: "An application with this email already exists." });
    }
    res.status(201).json(storage.createAcceleratorApplication(result.data));
  });

  app.patch("/api/accelerator/:id/stage", (req, res) => {
    const schema = z.object({ stage: z.enum(acceleratorStageValues) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const updated = storage.updateAcceleratorStage(req.params.id, result.data.stage);
    if (!updated) return res.status(404).json({ error: "Application not found" });
    res.json(updated);
  });

  app.delete("/api/accelerator/:id", (req, res) => {
    const deleted = storage.deleteAcceleratorApplication(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Application not found" });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
