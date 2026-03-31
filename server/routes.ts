import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertWaitlistSchema, insertAcceleratorSchema, acceleratorStageValues } from "@shared/schema";
import { z } from "zod";
import {
  getEmailSettings,
  updateEmailSettings,
  testEmailConnection,
  sendWaitlistConfirmation,
  sendAcceleratorConfirmation,
  sendAcceleratorStageUpdate,
} from "./email";

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

  app.post("/api/waitlist", async (req, res) => {
    const result = insertWaitlistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    if (storage.isEmailOnWaitlist(result.data.email)) {
      return res.status(409).json({ error: "This email is already on the waitlist." });
    }
    const entry = storage.createWaitlistEntry(result.data);
    sendWaitlistConfirmation({ name: entry.name, email: entry.email }).catch(() => {});
    res.status(201).json(entry);
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

  app.post("/api/accelerator", async (req, res) => {
    const result = insertAcceleratorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    if (storage.isEmailInAccelerator(result.data.email)) {
      return res.status(409).json({ error: "An application with this email already exists." });
    }
    const app_ = storage.createAcceleratorApplication(result.data);
    sendAcceleratorConfirmation({ name: app_.name, email: app_.email, projectName: app_.projectName }).catch(() => {});
    res.status(201).json(app_);
  });

  app.patch("/api/accelerator/:id/stage", async (req, res) => {
    const schema = z.object({ stage: z.enum(acceleratorStageValues) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const updated = storage.updateAcceleratorStage(req.params.id, result.data.stage);
    if (!updated) return res.status(404).json({ error: "Application not found" });
    sendAcceleratorStageUpdate(
      { name: updated.name, email: updated.email, projectName: updated.projectName },
      result.data.stage
    ).catch(() => {});
    res.json(updated);
  });

  app.delete("/api/accelerator/:id", (req, res) => {
    const deleted = storage.deleteAcceleratorApplication(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Application not found" });
    res.json({ success: true });
  });

  // ── Email Settings ─────────────────────────────────────
  app.get("/api/admin/email-settings", (_req, res) => {
    res.json(getEmailSettings());
  });

  app.post("/api/admin/email-settings", (req, res) => {
    const schema = z.object({
      apiKey: z.string().optional(),
      fromEmail: z.string().email().optional(),
      fromName: z.string().min(1).optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    updateEmailSettings(result.data as any);
    res.json({ success: true, settings: getEmailSettings() });
  });

  app.post("/api/admin/test-email", async (req, res) => {
    const schema = z.object({ toEmail: z.string().email() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    const testResult = await testEmailConnection(result.data.toEmail);
    res.json(testResult);
  });

  // ── Contacts (aggregated) ──────────────────────────────
  app.get("/api/admin/contacts", (_req, res) => {
    const waitlist = storage.getWaitlist().map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      source: "waitlist" as const,
      tag: e.intendedUse || "",
      date: e.signedUpAt,
    }));
    const accelerator = storage.getAcceleratorApplications().map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      source: "accelerator" as const,
      tag: a.pipelineStage,
      date: a.appliedAt,
    }));
    const all = [...waitlist, ...accelerator].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    res.json(all);
  });

  // ── CMS Content ────────────────────────────────────────
  app.get("/api/cms/content/:pageId", (req, res) => {
    res.json(storage.getCMSContent(req.params.pageId));
  });

  app.put("/api/cms/content/:pageId", (req, res) => {
    const fields = req.body as Record<string, string>;
    if (typeof fields !== "object" || Array.isArray(fields)) {
      return res.status(400).json({ error: "Invalid content format" });
    }
    storage.updateCMSContent(req.params.pageId, fields);
    res.json({ success: true });
  });

  app.delete("/api/cms/content/:pageId", (req, res) => {
    storage.resetCMSContent(req.params.pageId);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
