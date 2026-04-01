import { nanoid } from "nanoid";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertWaitlistSchema, insertAcceleratorSchema, insertEventRegistrationSchema, acceleratorStageValues, insertSocialLinkSchema, insertPartnerSchema, insertPressArticleSchema, insertCampaignSchema, insertAutoresponderSchema, insertNewsletterSchema, insertEmailTemplateSchema, insertRoadmapMilestoneSchema, insertVideoTutorialSchema } from "@shared/schema";
import { blocksToBodyHtml } from "../shared/email-builder.js";
import { z } from "zod";
import {
  getEmailSettings,
  sendRoadmapReminderEmail,
  type MilestoneAlert,
  updateEmailSettings,
  testEmailConnection,
  sendWaitlistConfirmation,
  sendAcceleratorConfirmation,
  sendAcceleratorStageUpdate,
  getEmailBranding,
  updateEmailBranding,
  getEmailPreviewHtml,
  sendEventConfirmation,
  sendEventVerificationEmail,
  sendAutoresponderEmail,
  verifyUnsubscribeToken,
} from "./email";
import type { AutoresponderTrigger } from "@shared/schema";

async function fireAutoresponders(
  trigger: AutoresponderTrigger,
  to: { name: string; email: string },
  baseUrl: string = ""
): Promise<void> {
  const active = storage.getAutoresponders().filter((a) => a.active && a.trigger === trigger);
  for (const ar of active) {
    const send = async () => {
      const bodyHtml = blocksToBodyHtml(ar.blocks);
      // Always send to the triggering individual (unless unsubscribed)
      const seen = new Set<string>([to.email.toLowerCase()]);
      if (!storage.isUnsubscribed(to.email)) {
        await sendAutoresponderEmail(to, { subject: ar.subject, previewText: ar.previewText, bodyHtml }, baseUrl);
      }

      // Also broadcast to any selected lists (skipping unsubscribed)
      const lists: string[] = ar.broadcastLists || [];
      const extras: Array<{ name: string; email: string }> = [];
      if (lists.includes("waitlist")) storage.getWaitlist().forEach((w) => extras.push({ name: w.name, email: w.email }));
      if (lists.includes("accelerator")) storage.getAcceleratorApplications().forEach((a) => extras.push({ name: a.name, email: a.email }));
      if (lists.includes("events")) storage.getEventRegistrations().forEach((r) => extras.push({ name: r.name, email: r.email }));
      if (lists.includes("newsletter")) storage.getNewsletterSignups().forEach((n) => extras.push({ name: n.name, email: n.email }));
      for (const extra of extras) {
        if (!seen.has(extra.email.toLowerCase()) && !storage.isUnsubscribed(extra.email)) {
          seen.add(extra.email.toLowerCase());
          await sendAutoresponderEmail(extra, { subject: ar.subject, previewText: ar.previewText, bodyHtml }, baseUrl).catch(() => {});
        }
      }
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

  // ── Event Categories ───────────────────────────────────
  app.get("/api/event-categories", (_req, res) => {
    res.json(storage.getEventCategories());
  });

  app.post("/api/event-categories", (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
    const categories = storage.createEventCategory(name);
    res.status(201).json(categories);
  });

  app.delete("/api/event-categories/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    const categories = storage.deleteEventCategory(name);
    res.json(categories);
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
  // ── Event registration verification ───────────────────
  app.get("/api/events/verify", (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a1a1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:40px"><h1 style="color:#f87171">Invalid Link</h1><p style="color:#94a3b8">This verification link is missing a token.</p><a href="/" style="color:#2EB8B8">Return to site</a></div></body></html>`);
    }
    const reg = storage.verifyEventRegistration(token);
    if (!reg) {
      return res.status(404).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a1a1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:40px"><h1 style="color:#f87171">Link Expired or Invalid</h1><p style="color:#94a3b8">This verification link has already been used or is no longer valid.</p><a href="/" style="color:#2EB8B8">Return to site</a></div></body></html>`);
    }
    return res.send(`<!DOCTYPE html><html><head><title>Registration Confirmed</title></head><body style="font-family:sans-serif;background:#0a1a1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:48px;max-width:500px"><div style="width:72px;height:72px;background:#2EB8B8;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:32px">✓</div><h1 style="font-size:28px;font-weight:800;margin:0 0 12px;color:#e2e8f0">You're confirmed!</h1><p style="color:#94a3b8;margin:0 0 8px">Hi ${reg.name}, your spot at <strong style="color:#e2e8f0">${reg.eventTitle}</strong> is now confirmed.</p><p style="color:#64748b;font-size:14px;margin:0 0 32px">We look forward to seeing you there.</p><a href="/events" style="display:inline-block;background:#2EB8B8;color:#0a1a1a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none">View All Events</a></div></body></html>`);
  });

  // ── Per-event registration counts (for admin table) ───
  app.get("/api/admin/events/registration-counts", (req, res) => {
    const allRegs = storage.getEventRegistrations();
    const events = storage.getEvents();
    const counts: Record<string, { total: number; verified: number; pending: number }> = {};
    for (const ev of events) {
      counts[ev.id] = { total: 0, verified: 0, pending: 0 };
    }
    for (const reg of allRegs) {
      if (!counts[reg.eventId]) counts[reg.eventId] = { total: 0, verified: 0, pending: 0 };
      counts[reg.eventId].total++;
      if (reg.verified) counts[reg.eventId].verified++;
      else counts[reg.eventId].pending++;
    }
    res.json(counts);
  });

  app.post("/api/events/:id/register", async (req, res) => {
    const event = storage.getEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const result = insertEventRegistrationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const existingReg = storage.getEventRegistrations(req.params.id)
      .find(r => r.email.toLowerCase() === result.data.email.toLowerCase());
    if (existingReg) {
      if (!existingReg.verified && event.requireEmailVerification) {
        return res.status(409).json({ error: "A verification email was already sent to this address. Please check your inbox.", requiresVerification: true });
      }
      return res.status(409).json({ error: "You are already registered for this event." });
    }

    const requireVerification = !!event.requireEmailVerification;
    const verificationToken = requireVerification ? nanoid(32) : undefined;
    const reg = storage.createEventRegistration(req.params.id, event.title as string, result.data, !requireVerification, verificationToken);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const eventDateStr = new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    if (requireVerification && verificationToken) {
      const verifyUrl = `${baseUrl}/api/events/verify?token=${verificationToken}`;
      sendEventVerificationEmail(
        { name: reg.name, email: reg.email },
        { name: event.title as string, date: eventDateStr },
        verifyUrl
      ).catch(() => {});
    } else {
      sendEventConfirmation(
        { name: reg.name, email: reg.email },
        { name: event.title as string, date: eventDateStr }
      ).catch(() => {});
      fireAutoresponders("event_register", { name: reg.name, email: reg.email }, baseUrl);
    }
    res.status(201).json({ ...reg, requiresVerification: requireVerification });
  });

  app.get("/api/events/:id/registrations", (req, res) => {
    res.json(storage.getEventRegistrations(req.params.id));
  });

  // ── Event analytics ─────────────────────────────────────────────────────
  app.get("/api/admin/event-analytics", (_req, res) => {
    const allRegs = storage.getEventRegistrations();
    const allEvents = storage.getEvents();

    // Build event lookup for verification mode
    const eventMap: Record<string, boolean> = {};
    allEvents.forEach(e => { eventMap[e.id as string] = !!e.requireEmailVerification; });

    // Per-event counts — use verified-only for events with email verification enabled
    const countsByEvent: Record<string, number> = {};
    allRegs.forEach(r => {
      const requiresVerif = eventMap[r.eventId] ?? false;
      if (requiresVerif && !r.verified) return; // skip unverified for those events
      countsByEvent[r.eventId] = (countsByEvent[r.eventId] || 0) + 1;
    });
    const perEvent = allEvents
      .map(e => ({
        eventId: e.id,
        title: (e.title as string) || "Untitled",
        date: e.date as string,
        count: countsByEvent[e.id as string] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Confirmed regs (for trend/totals): verified where required, all where not
    const confirmedRegs = allRegs.filter(r => {
      const requiresVerif = eventMap[r.eventId] ?? false;
      return !requiresVerif || r.verified;
    });

    // Monthly trend (last 18 months) — confirmed only
    const now = new Date();
    const monthly: { label: string; month: string; count: number }[] = [];
    for (let i = 17; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const count = confirmedRegs.filter(r => r.registeredAt.startsWith(key)).length;
      monthly.push({ label, month: key, count });
    }

    // This month vs last month
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
    const thisMonth = confirmedRegs.filter(r => r.registeredAt.startsWith(thisMonthKey)).length;
    const lastMonth = confirmedRegs.filter(r => r.registeredAt.startsWith(lastMonthKey)).length;
    const momentumPct = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    const mostPopular = perEvent[0] ?? null;

    res.json({
      total: confirmedRegs.length,
      thisMonth,
      lastMonth,
      momentumPct,
      mostPopular,
      perEvent,
      monthly,
    });
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
    fireAutoresponders("waitlist_signup", { name: entry.name, email: entry.email }, `${req.protocol}://${req.get("host")}`);
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
    fireAutoresponders("accelerator_apply", { name: app_.name, email: app_.email }, `${req.protocol}://${req.get("host")}`);
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
      adminEmail: z.string().email().optional().or(z.literal("")),
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

  // ── Newsletter ─────────────────────────────────────────
  app.post("/api/newsletter", (req, res) => {
    const result = insertNewsletterSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0]?.message || "Invalid input" });
    if (storage.isEmailSubscribed(result.data.email)) {
      return res.status(409).json({ error: "This email is already subscribed." });
    }
    const entry = storage.createNewsletterSignup(result.data);
    fireAutoresponders("newsletter_signup", { name: entry.name, email: entry.email }, `${req.protocol}://${req.get("host")}`);
    res.status(201).json(entry);
  });

  app.get("/api/newsletter", (_req, res) => {
    res.json(storage.getNewsletterSignups());
  });

  // ── Unsubscribe ────────────────────────────────────────
  app.get("/api/unsubscribe", (req, res) => {
    const email = typeof req.query.email === "string" ? req.query.email : "";
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const styledPage = (title: string, message: string, isError = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title} — Liberty Chain</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050e0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #0a1818; border: 1px solid #1a3a3a; border-radius: 14px; max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; }
    .icon { font-size: 40px; margin-bottom: 20px; }
    h1 { color: ${isError ? "#ef4444" : "#2EB8B8"}; font-size: 22px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.3px; }
    p { color: #6a9090; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
    a { display: inline-block; background: #2EB8B8; color: #000; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.02em; }
    .sub { font-size: 12px; color: #3a5050; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? "✕" : "✓"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://libertychain.org">Back to Liberty Chain</a>
    ${isError ? "" : '<p class="sub">You will no longer receive marketing emails from Liberty Chain.</p>'}
  </div>
</body>
</html>`;

    if (!email || !token) {
      return res.status(400).send(styledPage("Invalid Link", "This unsubscribe link is missing required information.", true));
    }
    if (!verifyUnsubscribeToken(email, token)) {
      return res.status(400).send(styledPage("Invalid Link", "This unsubscribe link is invalid or has expired.", true));
    }
    storage.addUnsubscribe(email);
    return res.send(styledPage("You've been unsubscribed", `<strong style="color:#c0d8d8;">${email}</strong> has been removed from all Liberty Chain marketing emails.`));
  });

  // ── Unsubscribe list (admin) ───────────────────────────
  app.get("/api/admin/unsubscribed", (_req, res) => {
    res.json(storage.getUnsubscribedEmails());
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
    const newsletterSubs = storage.getNewsletterSignups().map((n) => ({
      id: n.id,
      name: n.name,
      email: n.email,
      source: "newsletter" as const,
      tag: "newsletter",
      date: n.signedUpAt,
      twitter: "",
      telegram: "",
      signupPage: "Newsletter",
    }));
    const all = [...waitlist, ...accelerator, ...eventRegs, ...newsletterSubs].sort(
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
      if (!seen.has(key) && !storage.isUnsubscribed(email)) { seen.add(key); recipients.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, email }); }
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
    if (type === "all" || type === "newsletter") {
      storage.getNewsletterSignups().forEach((n) => add(n.name, n.email));
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

  // ── Test Email ─────────────────────────────────────────
  app.post("/api/campaigns/:id/test", async (req, res) => {
    const campaign = storage.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    const { email, name } = req.body;
    if (!email || typeof email !== "string") return res.status(400).json({ error: "email is required" });
    try {
      const { sendCampaignToRecipients } = await import("./email.js");
      const bodyHtml = blocksToBodyHtml(campaign.blocks);
      const recipient = [{ id: "test", name: name || "Test User", email }];
      await sendCampaignToRecipients(campaign.subject || "(Test) No Subject", bodyHtml, recipient, campaign.id, `${req.protocol}://${req.get("host")}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to send test email" });
    }
  });

  // ── Email Templates ────────────────────────────────────
  app.get("/api/email-templates", (_req, res) => {
    res.json(storage.getEmailTemplates());
  });

  app.get("/api/email-templates/:id", (req, res) => {
    const t = storage.getEmailTemplate(req.params.id);
    if (!t) return res.status(404).json({ error: "Not found" });
    res.json(t);
  });

  app.post("/api/email-templates", (req, res) => {
    const result = insertEmailTemplateSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    res.status(201).json(storage.createEmailTemplate(result.data));
  });

  app.put("/api/email-templates/:id", (req, res) => {
    const t = storage.getEmailTemplate(req.params.id);
    if (!t) return res.status(404).json({ error: "Not found" });
    if (t.isPremium) return res.status(403).json({ error: "Premium templates cannot be edited" });
    const updated = storage.updateEmailTemplate(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/email-templates/:id", (req, res) => {
    const t = storage.getEmailTemplate(req.params.id);
    if (!t) return res.status(404).json({ error: "Not found" });
    if (t.isPremium) return res.status(403).json({ error: "Premium templates cannot be deleted" });
    const ok = storage.deleteEmailTemplate(req.params.id);
    res.json({ success: ok });
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

  // ── Roadmap reminders ────────────────────────────────────
  app.post("/api/admin/roadmap-reminders", async (req, res) => {
    function parseQuarterEnd(quarter: string): Date | null {
      const m = quarter.match(/Q([1-4])\s+(\d{4})/i);
      if (!m) return null;
      const q = parseInt(m[1]);
      const year = parseInt(m[2]);
      return new Date(year, q * 3, 0); // last day of the quarter's last month
    }

    const milestones = storage.getRoadmapMilestones();
    const now = Date.now();
    const THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

    const alerts: MilestoneAlert[] = milestones
      .filter(m => m.status !== "completed")
      .flatMap(m => {
        const end = parseQuarterEnd(m.quarter);
        if (!end) return [];
        const daysLeft = Math.ceil((end.getTime() - now) / 86_400_000);
        if (daysLeft > 30) return [];
        return [{ id: m.id, title: m.title, quarter: m.quarter, status: m.status, daysLeft }];
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    if (alerts.length === 0) {
      return res.json({ sent: false, reason: "No milestones need attention right now" });
    }

    const { adminEmail } = getEmailSettings();
    const result = await sendRoadmapReminderEmail(adminEmail, alerts);
    res.json({ ...result, count: alerts.length, alerts });
  });

  // ── Roadmap ──────────────────────────────────────────────
  app.get("/api/roadmap", (_req, res) => {
    res.json(storage.getRoadmapMilestones());
  });

  app.post("/api/roadmap", (req, res) => {
    try {
      const data = insertRoadmapMilestoneSchema.parse(req.body);
      res.status(201).json(storage.createRoadmapMilestone(data));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/roadmap/:id", (req, res) => {
    const updated = storage.updateRoadmapMilestone(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/roadmap/:id", (req, res) => {
    const ok = storage.deleteRoadmapMilestone(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // ── Video Tutorials ───────────────────────────────────────────────────
  app.get("/api/video-tutorials", (_req, res) => {
    res.json(storage.getVideoTutorials());
  });

  app.post("/api/video-tutorials", (req, res) => {
    try {
      const data = insertVideoTutorialSchema.parse(req.body);
      res.status(201).json(storage.createVideoTutorial(data));
    } catch (e: any) {
      res.status(400).json({ error: e.flatten?.() ?? e.message });
    }
  });

  app.put("/api/video-tutorials/:id", (req, res) => {
    const updated = storage.updateVideoTutorial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/video-tutorials/:id", (req, res) => {
    const ok = storage.deleteVideoTutorial(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // Batch reorder
  app.put("/api/video-tutorials", (req, res) => {
    const items: { id: string; order: number }[] = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "Expected array" });
    items.forEach(({ id, order }) => storage.updateVideoTutorial(id, { order }));
    res.json({ success: true });
  });

  // ── Section Order ────────────────────────────────────
  const VALID_SECTIONS = new Set(["performance", "meshtastic", "evm", "network", "trilemma", "ecosystem", "press", "partners", "newsletter", "roadmap"]);

  app.get("/api/section-order", (_req, res) => {
    res.json(storage.getSectionOrder());
  });

  app.put("/api/section-order", (req, res) => {
    const schema = z.array(z.string());
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Expected array of section IDs" });
    const order = result.data.filter(id => VALID_SECTIONS.has(id));
    // ensure all valid sections are included (append any missing ones at end)
    const missing = [...VALID_SECTIONS].filter(id => !order.includes(id));
    storage.setSectionOrder([...order, ...missing]);
    res.json(storage.getSectionOrder());
  });

  const httpServer = createServer(app);
  return httpServer;
}
