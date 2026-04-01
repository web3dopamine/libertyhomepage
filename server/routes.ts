import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertWaitlistSchema, insertAcceleratorSchema, insertEventRegistrationSchema, acceleratorStageValues, insertSocialLinkSchema, insertPartnerSchema, insertPressArticleSchema, insertCampaignSchema, insertAutoresponderSchema } from "@shared/schema";
import { blocksToBodyHtml } from "../shared/email-builder.js";
import { z } from "zod";
import {
  getEmailSettings,
  updateEmailSettings,
  testEmailConnection,
  sendWaitlistConfirmation,
  sendAcceleratorConfirmation,
  sendAcceleratorStageUpdate,
  getEmailBranding,
  updateEmailBranding,
  getEmailPreviewHtml,
  sendEventConfirmation,
  sendAutoresponderEmail,
} from "./email";
import type { AutoresponderTrigger } from "@shared/schema";

async function fireAutoresponders(
  trigger: AutoresponderTrigger,
  to: { name: string; email: string }
): Promise<void> {
  const active = storage.getAutoresponders().filter((a) => a.active && a.trigger === trigger);
  for (const ar of active) {
    const send = async () => {
      const bodyHtml = blocksToBodyHtml(ar.blocks);
      await sendAutoresponderEmail(to, { subject: ar.subject, previewText: ar.previewText, bodyHtml });
      storage.incrementAutoresponderSent(ar.id);
    };
    if (ar.delayHours > 0) {
      setTimeout(() => send().catch(() => {}), ar.delayHours * 60 * 60 * 1000);
    } else {
      send().catch(() => {});
    }
  }
}

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

  // ── Event Registrations ────────────────────────────────
  app.post("/api/events/:id/register", async (req, res) => {
    const event = storage.getEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const result = insertEventRegistrationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    if (storage.isEmailRegisteredForEvent(req.params.id, result.data.email)) {
      return res.status(409).json({ error: "You are already registered for this event." });
    }
    const reg = storage.createEventRegistration(req.params.id, event.title as string, result.data);
    sendEventConfirmation(
      { name: reg.name, email: reg.email },
      { name: event.title as string, date: new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }
    ).catch(() => {});
    fireAutoresponders("event_register", { name: reg.name, email: reg.email });
    res.status(201).json(reg);
  });

  app.get("/api/events/:id/registrations", (req, res) => {
    res.json(storage.getEventRegistrations(req.params.id));
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
    fireAutoresponders("waitlist_signup", { name: entry.name, email: entry.email });
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
    fireAutoresponders("accelerator_apply", { name: app_.name, email: app_.email });
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

  // ── Email Branding ─────────────────────────────────────
  app.get("/api/admin/email-branding", (_req, res) => {
    res.json(getEmailBranding());
  });

  app.post("/api/admin/email-branding", (req, res) => {
    const schema = z.object({
      logoText: z.string().min(1).optional(),
      tagline: z.string().optional(),
      twitterUrl: z.string().url().optional(),
      discordUrl: z.string().url().optional(),
      githubUrl: z.string().url().optional(),
      footerText: z.string().optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    updateEmailBranding(result.data as any);
    res.json({ success: true, branding: getEmailBranding() });
  });

  // ── Email Preview ───────────────────────────────────────
  app.get("/api/admin/email-preview/:templateId", (req, res) => {
    const html = getEmailPreviewHtml(req.params.templateId);
    if (!html) return res.status(404).json({ error: "Template not found" });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.send(html);
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
      twitter: e.twitter || "",
      telegram: e.telegram || "",
      signupPage: "Waitlist",
    }));
    const accelerator = storage.getAcceleratorApplications().map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      source: "accelerator" as const,
      tag: a.pipelineStage,
      date: a.appliedAt,
      twitter: a.twitter || "",
      telegram: "",
      signupPage: "Liberty Accelerator",
    }));
    const eventRegs = storage.getEventRegistrations().map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      source: "event-registration" as const,
      tag: r.eventTitle,
      date: r.registeredAt,
      twitter: r.twitter || "",
      telegram: r.telegram || "",
      signupPage: `Event: ${r.eventTitle}`,
    }));
    const all = [...waitlist, ...accelerator, ...eventRegs].sort(
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

  // ── Custom Pages ────────────────────────────────────────
  app.get("/api/cms/pages", (_req, res) => {
    res.json(storage.getCustomPages());
  });

  app.post("/api/cms/pages", (req, res) => {
    const { title, path, cloneFromId, cloneContent } = req.body;
    if (!title || typeof title !== "string" || !path || typeof path !== "string") {
      return res.status(400).json({ error: "title and path are required" });
    }
    const page = storage.createCustomPage({ title, path });
    if (cloneFromId && cloneContent && typeof cloneContent === "object") {
      storage.updateCMSContent(page.id, cloneContent as Record<string, string>);
    }
    res.status(201).json(page);
  });

  app.delete("/api/cms/pages/:id", (req, res) => {
    const deleted = storage.deleteCustomPage(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Page not found" });
    res.json({ success: true });
  });

  // ── Social Links ────────────────────────────────────────
  app.get("/api/socials", (_req, res) => {
    res.json(storage.getSocialLinks());
  });

  app.post("/api/socials", (req, res) => {
    const result = insertSocialLinkSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createSocialLink(result.data));
  });

  app.put("/api/socials/:id", (req, res) => {
    const result = insertSocialLinkSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const updated = storage.updateSocialLink(req.params.id, result.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/socials/:id", (req, res) => {
    const ok = storage.deleteSocialLink(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // ── Partners ────────────────────────────────────────────
  app.get("/api/partners", (_req, res) => {
    res.json(storage.getPartners());
  });

  app.post("/api/partners", (req, res) => {
    const result = insertPartnerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createPartner(result.data));
  });

  app.put("/api/partners/:id", (req, res) => {
    const result = insertPartnerSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const updated = storage.updatePartner(req.params.id, result.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/partners/:id", (req, res) => {
    const ok = storage.deletePartner(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // ── Press Articles ──────────────────────────────────────
  app.get("/api/press", (_req, res) => {
    res.json(storage.getPressArticles());
  });

  app.post("/api/press", (req, res) => {
    const result = insertPressArticleSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createPressArticle(result.data));
  });

  app.put("/api/press/:id", (req, res) => {
    const result = insertPressArticleSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const updated = storage.updatePressArticle(req.params.id, result.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/press/:id", (req, res) => {
    const ok = storage.deletePressArticle(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // ── Tracking (open pixel + click redirect) ─────────────
  const PIXEL = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  app.get("/api/track/open", (req, res) => {
    const { c, r } = req.query as { c?: string; r?: string };
    if (c && r) {
      try { storage.trackOpen(c, r); } catch (_) {}
    }
    res.set({
      "Content-Type": "image/gif",
      "Content-Length": PIXEL.length,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    });
    res.send(PIXEL);
  });

  app.get("/api/track/click", (req, res) => {
    const { c, r, u } = req.query as { c?: string; r?: string; u?: string };
    if (c && r && u) {
      try { storage.trackClick(c, r, decodeURIComponent(u)); } catch (_) {}
    }
    const dest = u ? decodeURIComponent(u) : "https://libertychain.org";
    res.redirect(dest);
  });

  // ── Email Campaigns ────────────────────────────────────
  app.get("/api/campaigns", (_req, res) => {
    res.json(storage.getCampaigns());
  });

  app.get("/api/campaigns/:id", (req, res) => {
    const c = storage.getCampaign(req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  });

  app.post("/api/campaigns", (req, res) => {
    const result = insertCampaignSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createCampaign(result.data));
  });

  app.put("/api/campaigns/:id", (req, res) => {
    const campaign = storage.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const updated = storage.updateCampaign(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/campaigns/:id", (req, res) => {
    const ok = storage.deleteCampaign(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.post("/api/campaigns/:id/clone", (req, res) => {
    const cloned = storage.cloneCampaign(req.params.id);
    if (!cloned) return res.status(404).json({ error: "Not found" });
    res.status(201).json(cloned);
  });

  app.post("/api/campaigns/:id/send", async (req, res) => {
    const campaign = storage.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Build recipient list
    const seen = new Set<string>();
    const recipients: Array<{ id: string; name: string; email: string }> = [];
    const add = (name: string, email: string) => {
      const key = email.toLowerCase();
      if (!seen.has(key)) { seen.add(key); recipients.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, email }); }
    };

    const type = campaign.audienceType;
    if (type === "all" || type === "waitlist") {
      storage.getWaitlist().forEach((w) => add(w.name, w.email));
    }
    if (type === "all" || type === "accelerator") {
      storage.getAcceleratorApplications().forEach((a) => add(a.name, a.email));
    }
    if (type === "all" || type === "events") {
      storage.getEventRegistrations().forEach((r) => add(r.name, r.email));
    }
    if (type === "csv") {
      campaign.csvRecipients.forEach((r) => add(r.name, r.email));
    }
    if (type === "custom") {
      campaign.customEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean).forEach((email) => add("", email));
      campaign.csvRecipients.forEach((r) => add(r.name, r.email));
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No recipients found for this audience segment." });
    }

    // Mark as sending
    storage.updateCampaign(campaign.id, { status: "sending" });

    try {
      const { sendCampaignToRecipients } = await import("./email.js");
      const bodyHtml = blocksToBodyHtml(campaign.blocks);
      const { sent, failed } = await sendCampaignToRecipients(
        campaign.subject,
        bodyHtml,
        recipients,
        campaign.id,
        baseUrl
      );
      storage.updateCampaign(campaign.id, {
        status: "sent",
        sentAt: new Date().toISOString(),
        sentCount: (campaign.sentCount || 0) + sent,
      });
      res.json({ success: true, sent, failed, total: recipients.length });
    } catch (err: any) {
      storage.updateCampaign(campaign.id, { status: "draft" });
      res.status(500).json({ error: err.message || "Failed to send campaign" });
    }
  });

  // ── Autoresponders ─────────────────────────────────────
  app.get("/api/autoresponders", (_req, res) => {
    res.json(storage.getAutoresponders());
  });

  app.get("/api/autoresponders/:id", (req, res) => {
    const ar = storage.getAutoresponder(req.params.id);
    if (!ar) return res.status(404).json({ error: "Not found" });
    res.json(ar);
  });

  app.post("/api/autoresponders", (req, res) => {
    const result = insertAutoresponderSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createAutoresponder(result.data));
  });

  app.put("/api/autoresponders/:id", (req, res) => {
    const ar = storage.getAutoresponder(req.params.id);
    if (!ar) return res.status(404).json({ error: "Not found" });
    const updated = storage.updateAutoresponder(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/autoresponders/:id", (req, res) => {
    const ok = storage.deleteAutoresponder(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
