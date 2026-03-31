import { Resend } from "resend";

// ── Email connection settings ─────────────────────────────
export interface EmailSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

let settings: EmailSettings = {
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@libertychain.org",
  fromName: process.env.RESEND_FROM_NAME || "Liberty Chain",
};

export function getEmailSettings(): Omit<EmailSettings, "apiKey"> & { hasApiKey: boolean } {
  return {
    hasApiKey: !!settings.apiKey,
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
  };
}

export function updateEmailSettings(updates: Partial<EmailSettings>): void {
  settings = { ...settings, ...updates };
}

function getClient(): Resend | null {
  if (!settings.apiKey) return null;
  return new Resend(settings.apiKey);
}

// ── Email branding (header / footer) ─────────────────────
export interface EmailBranding {
  logoText: string;
  tagline: string;
  twitterUrl: string;
  discordUrl: string;
  githubUrl: string;
  footerText: string;
}

let branding: EmailBranding = {
  logoText: "LIBERTY CHAIN",
  tagline: "Built for Freedom · Zero Gas · 10,000+ TPS",
  twitterUrl: "https://twitter.com/libertychain",
  discordUrl: "https://discord.gg/libertychain",
  githubUrl: "https://github.com/liberty-chain",
  footerText: "You received this email because you signed up for Liberty Chain updates.",
};

export function getEmailBranding(): EmailBranding {
  return { ...branding };
}

export function updateEmailBranding(updates: Partial<EmailBranding>): void {
  branding = { ...branding, ...updates };
}

// ── Base layout (header + footer) ────────────────────────
function baseLayout(content: string): string {
  const b = branding;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Liberty Chain</title>
</head>
<body style="margin:0;padding:0;background:#080f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#080f0f;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;border-radius:14px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5);">

        <!-- ═══ HEADER ═══ -->
        <tr><td style="padding:0;">
          <!-- Teal accent bar -->
          <div style="height:4px;background:linear-gradient(90deg,#1a8888 0%,#2EB8B8 40%,#38d4d4 70%,#2EB8B8 100%);"></div>
          <!-- Logo area -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(160deg,#0a1f1f 0%,#071515 50%,#050e0e 100%);padding:28px 40px 24px;">
            <tr>
              <td>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:12px;">
                      <!-- Diamond icon shape -->
                      <div style="width:32px;height:32px;background:linear-gradient(135deg,#2EB8B8,#1a8888);border-radius:6px;transform:rotate(45deg);margin:4px;"></div>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="color:#2EB8B8;font-size:18px;font-weight:900;letter-spacing:0.06em;">${b.logoText}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;color:#3a7070;font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;">${b.tagline}</p>
              </td>
            </tr>
          </table>
          <!-- Subtle divider -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a3a3a 30%,#2EB8B820 60%,transparent);"></div>
        </td></tr>

        <!-- ═══ BODY ═══ -->
        <tr><td style="background:#0b1818;padding:44px 40px;">${content}</td></tr>

        <!-- ═══ FOOTER ═══ -->
        <tr><td style="padding:0;">
          <!-- Subtle divider -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a3a3a 30%,#1a3a3a 70%,transparent);"></div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#060c0c;padding:24px 40px 28px;">
            <tr>
              <td>
                <!-- Social links -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                  <tr>
                    <td style="padding-right:16px;">
                      <a href="${b.twitterUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">Twitter / X</a>
                    </td>
                    <td style="padding-right:16px;color:#1a3a3a;font-size:12px;">|</td>
                    <td style="padding-right:16px;">
                      <a href="${b.discordUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">Discord</a>
                    </td>
                    <td style="padding-right:16px;color:#1a3a3a;font-size:12px;">|</td>
                    <td>
                      <a href="${b.githubUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">GitHub</a>
                    </td>
                  </tr>
                </table>
                <!-- Copyright -->
                <p style="margin:0 0 4px;color:#3a5a5a;font-size:11px;line-height:1.6;">
                  © ${new Date().getFullYear()} Liberty Chain &nbsp;·&nbsp;
                  <a href="https://libertychain.org" style="color:#2EB8B8;text-decoration:none;">libertychain.org</a>
                </p>
                <p style="margin:0;color:#2a4040;font-size:11px;line-height:1.6;">${b.footerText}</p>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Template bodies (separated for preview support) ───────

function tplWaitlistBody(name: string): string {
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">You're on the list.</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, welcome to the Liberty Chain waitlist. You'll be among the first to gain access when we open the next wave.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">What's coming</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${["Zero gas fee transactions", "10,000+ TPS performance", "Full EVM compatibility", "Instant finality", "Meshtastic off-grid resilience"].map(item => `
          <tr>
            <td style="padding:5px 0;vertical-align:top;width:20px;">
              <span style="color:#2EB8B8;font-size:14px;font-weight:700;">✓</span>
            </td>
            <td style="padding:5px 0 5px 10px;">
              <span style="color:#8ab0b0;font-size:14px;line-height:1.5;">${item}</span>
            </td>
          </tr>`).join("")}
        </table>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="${branding.twitterUrl}" style="display:inline-block;background:#2EB8B8;color:#000;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:8px;letter-spacing:0.02em;">Follow on X</a>
        </td>
        <td>
          <a href="${branding.discordUrl}" style="display:inline-block;background:#0a2020;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;border:1px solid #2EB8B840;">Join Discord</a>
        </td>
      </tr>
    </table>`;
}

function tplAcceleratorReceivedBody(name: string, projectName: string): string {
  const steps = ["Application Review (5–7 days)", "Initial Interview", "Cohort Selection", "Programme Kickoff"];
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">Application Received</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, we've received your Liberty Chain Accelerator application for <strong style="color:#ffffff;">${projectName}</strong>. Our team will review it within 5–7 business days.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 18px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">What happens next</p>
        ${steps.map((step, i) => `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
          <tr>
            <td style="width:30px;vertical-align:top;padding-top:1px;">
              <span style="display:inline-block;width:24px;height:24px;background:#2EB8B815;border:1px solid #2EB8B840;border-radius:50%;text-align:center;line-height:24px;color:#2EB8B8;font-size:11px;font-weight:800;">${i + 1}</span>
            </td>
            <td style="color:#8ab0b0;font-size:14px;line-height:1.6;padding-left:10px;">${step}</td>
          </tr>
        </table>`).join("")}
      </td></tr>
    </table>
    <p style="margin:0;color:#4a7070;font-size:14px;line-height:1.6;">Have questions? Reach us on <a href="${branding.discordUrl}" style="color:#2EB8B8;text-decoration:none;font-weight:600;">Discord</a>.</p>`;
}

function tplAcceleratorStageBody(name: string, projectName: string, stage: string): string {
  const stageLabels: Record<string, { label: string; desc: string; color: string }> = {
    review: { label: "Under Review", desc: "Your application is now being reviewed by our team. We'll be in touch shortly.", color: "#f59e0b" },
    interview: { label: "Interview Stage", desc: "Congratulations! We'd like to schedule an interview. Our team will reach out with details.", color: "#8b5cf6" },
    accepted: { label: "Accepted!", desc: "You've been accepted into the Liberty Chain Accelerator! Welcome to the cohort. We'll send next steps shortly.", color: "#2EB8B8" },
    rejected: { label: "Application Closed", desc: "After careful review, we're unable to proceed at this time. We encourage you to apply again in a future cohort.", color: "#6a9090" },
  };
  const info = stageLabels[stage] || { label: stage, desc: "Your application status has been updated.", color: "#2EB8B8" };
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">Application Update</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, there's an update on your application for <strong style="color:#ffffff;">${projectName}</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid ${info.color}40;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:28px;">
        <p style="margin:0 0 8px;color:${info.color};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Status Update</p>
        <p style="margin:0 0 14px;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.3px;">${info.label}</p>
        <p style="margin:0;color:#8ab0b0;font-size:15px;line-height:1.7;">${info.desc}</p>
      </td></tr>
    </table>
    <p style="margin:0;color:#4a7070;font-size:14px;line-height:1.6;">Questions? Reach us on <a href="${branding.discordUrl}" style="color:#2EB8B8;text-decoration:none;font-weight:600;">Discord</a>.</p>`;
}

function tplTestnetInviteBody(name: string): string {
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">Your Testnet Access is Ready</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, you've been selected for early access to the Liberty Chain Testnet. Start building on the fastest EVM chain — zero gas, 10,000+ TPS, instant finality.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:28px;">
        <p style="margin:0 0 16px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Your Testnet Details</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${[
            ["Network", "Liberty Chain Testnet"],
            ["RPC URL", "https://testnet-rpc.libertychain.org"],
            ["Chain ID", "1338"],
            ["Currency", "LBTC (test)"],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:6px 0;color:#4a8080;font-size:13px;font-weight:600;width:100px;">${label}</td>
            <td style="padding:6px 0;color:#ffffff;font-size:13px;font-family:monospace;">${value}</td>
          </tr>`).join("")}
        </table>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="https://libertychain.org/build" style="display:inline-block;background:#2EB8B8;color:#000;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:8px;">Start Building</a>
        </td>
        <td>
          <a href="https://libertychain.org/documentation" style="display:inline-block;background:#0a2020;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;border:1px solid #2EB8B840;">Read the Docs</a>
        </td>
      </tr>
    </table>`;
}

function tplEventConfirmationBody(name: string, eventName: string, eventDate: string): string {
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">You're registered!</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, your spot is confirmed for <strong style="color:#ffffff;">${eventName}</strong>. We look forward to seeing you there.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:28px;">
        <p style="margin:0 0 16px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Event Details</p>
        <p style="margin:0 0 6px;color:#ffffff;font-size:20px;font-weight:900;">${eventName}</p>
        <p style="margin:0 0 16px;color:#4a8080;font-size:14px;">${eventDate}</p>
        <p style="margin:0;color:#7aacac;font-size:14px;line-height:1.6;">More details and the event link will be sent closer to the date. Add this to your calendar so you don't miss it.</p>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="${branding.discordUrl}" style="display:inline-block;background:#2EB8B8;color:#000;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:8px;">Join the Community</a>
        </td>
        <td>
          <a href="https://libertychain.org/events" style="display:inline-block;background:#0a2020;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;border:1px solid #2EB8B840;">View All Events</a>
        </td>
      </tr>
    </table>`;
}

function tplAnnouncementBody(headline: string, body: string): string {
  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">${headline}</h1>
    <div style="color:#7aacac;font-size:16px;line-height:1.8;margin-bottom:32px;">${body}</div>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="https://libertychain.org" style="display:inline-block;background:#2EB8B8;color:#000;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:8px;">Learn More</a>
        </td>
        <td>
          <a href="${branding.discordUrl}" style="display:inline-block;background:#0a2020;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;border:1px solid #2EB8B840;">Join Discord</a>
        </td>
      </tr>
    </table>`;
}

// ── Preview generator ─────────────────────────────────────
export function getEmailPreviewHtml(templateId: string): string | null {
  switch (templateId) {
    case "waitlist":
      return baseLayout(tplWaitlistBody("Jane Smith"));
    case "accelerator-received":
      return baseLayout(tplAcceleratorReceivedBody("Jane Smith", "DeFi Protocol X"));
    case "accelerator-update":
      return baseLayout(tplAcceleratorStageBody("Jane Smith", "DeFi Protocol X", "accepted"));
    case "testnet-invite":
      return baseLayout(tplTestnetInviteBody("Jane Smith"));
    case "event-confirmation":
      return baseLayout(tplEventConfirmationBody("Jane Smith", "Liberty Chain Global Hackathon", "April 15, 2026"));
    case "announcement":
      return baseLayout(tplAnnouncementBody(
        "Liberty Chain Mainnet is Live",
        "<p style='margin:0 0 16px;'>After months of rigorous testnet activity, we are proud to announce that Liberty Chain Mainnet is now live and open to the public.</p><p style='margin:0;'>With 10,000+ TPS, zero gas fees, and full EVM compatibility, Liberty Chain is ready to power the next generation of decentralized applications.</p>"
      ));
    case "test":
      return baseLayout(`
        <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;">Email Connection Test</h1>
        <p style="margin:0 0 24px;color:#7aacac;font-size:16px;line-height:1.7;">Your Resend integration with Liberty Chain is working correctly.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0a2020;border:1px solid #2EB8B830;border-radius:10px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;color:#2EB8B8;font-size:14px;font-weight:700;">✓ API key is valid</p>
            <p style="margin:0;color:#2EB8B8;font-size:14px;font-weight:700;">✓ Email delivery is working</p>
          </td></tr>
        </table>
      `);
    default:
      return null;
  }
}

// ── Send functions ────────────────────────────────────────
export async function testEmailConnection(toEmail: string): Promise<{ success: boolean; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: "No API key configured. Add your Resend API key first." };
  try {
    const result = await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: toEmail,
      subject: "Liberty Chain — Email Connection Test",
      html: getEmailPreviewHtml("test")!,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function sendWaitlistConfirmation(to: { name: string; email: string }): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: "You're on the Liberty Chain Waitlist",
      html: baseLayout(tplWaitlistBody(to.name)),
    });
  } catch (_) {}
}

export async function sendAcceleratorConfirmation(to: { name: string; email: string; projectName: string }): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: "Liberty Chain Accelerator — Application Received",
      html: baseLayout(tplAcceleratorReceivedBody(to.name, to.projectName)),
    });
  } catch (_) {}
}

export async function sendAcceleratorStageUpdate(
  to: { name: string; email: string; projectName: string },
  stage: string
): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: "Liberty Chain Accelerator — Application Update",
      html: baseLayout(tplAcceleratorStageBody(to.name, to.projectName, stage)),
    });
  } catch (_) {}
}

export async function sendTestnetInvite(to: { name: string; email: string }): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: "Your Liberty Chain Testnet Access is Ready",
      html: baseLayout(tplTestnetInviteBody(to.name)),
    });
  } catch (_) {}
}

export async function sendEventConfirmation(
  to: { name: string; email: string },
  event: { name: string; date: string }
): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: `Event Registration Confirmed — ${event.name}`,
      html: baseLayout(tplEventConfirmationBody(to.name, event.name, event.date)),
    });
  } catch (_) {}
}
