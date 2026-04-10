import { Resend } from "resend";
import { readFileSync } from "fs";
import { createHmac } from "crypto";

let LOGO_DATA_URL = "";
try {
  const b64 = readFileSync("attached_assets/Asset 6_1763440187916.png").toString("base64");
  LOGO_DATA_URL = `data:image/png;base64,${b64}`;
} catch (_) {}

// ── Unsubscribe token ─────────────────────────────────────
const UNSUB_SECRET = process.env.SESSION_SECRET || "liberty-chain-unsub-key-2026";

export function generateUnsubscribeToken(email: string): string {
  return createHmac("sha256", UNSUB_SECRET)
    .update(email.toLowerCase().trim())
    .digest("hex")
    .slice(0, 20);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  return generateUnsubscribeToken(email) === token;
}

export function buildUnsubscribeUrl(email: string, baseUrl: string): string {
  return `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${generateUnsubscribeToken(email)}`;
}

// ── Email connection settings ─────────────────────────────
export interface EmailSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
}

let settings: EmailSettings = {
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@libertychain.org",
  fromName: process.env.RESEND_FROM_NAME || "Liberty Chain",
  adminEmail: "",
};

export function getEmailSettings(): Omit<EmailSettings, "apiKey"> & { hasApiKey: boolean } {
  return {
    hasApiKey: !!settings.apiKey,
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
    adminEmail: settings.adminEmail,
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
function baseLayout(content: string, unsubscribeUrl?: string): string {
  const b = branding;
  const logoHtml = LOGO_DATA_URL
    ? `<img src="${LOGO_DATA_URL}" alt="Liberty Chain" style="height:44px;width:auto;display:block;max-width:220px;" />`
    : `<span style="color:#2EB8B8;font-size:18px;font-weight:900;letter-spacing:0.06em;">${b.logoText}</span>`;
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
                ${logoHtml}
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
                    <td style="padding-right:14px;">
                      <a href="${b.twitterUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">X / Twitter</a>
                    </td>
                    <td style="padding-right:14px;color:#1a3a3a;font-size:12px;">|</td>
                    <td style="padding-right:14px;">
                      <a href="${b.discordUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">Discord</a>
                    </td>
                    <td style="padding-right:14px;color:#1a3a3a;font-size:12px;">|</td>
                    <td style="padding-right:14px;">
                      <a href="${b.githubUrl}" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">GitHub</a>
                    </td>
                    <td style="padding-right:14px;color:#1a3a3a;font-size:12px;">|</td>
                    <td style="padding-right:14px;">
                      <a href="https://t.me/libertychain" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">Telegram</a>
                    </td>
                    <td style="padding-right:14px;color:#1a3a3a;font-size:12px;">|</td>
                    <td>
                      <a href="https://youtube.com/@libertychain" style="color:#2EB8B8;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">YouTube</a>
                    </td>
                  </tr>
                </table>
                <!-- Copyright -->
                <p style="margin:0 0 4px;color:#3a5a5a;font-size:11px;line-height:1.6;">
                  © ${new Date().getFullYear()} Liberty Chain &nbsp;·&nbsp;
                  <a href="https://libertychain.org" style="color:#2EB8B8;text-decoration:none;">libertychain.org</a>
                </p>
                <p style="margin:0;color:#2a4040;font-size:11px;line-height:1.6;">${b.footerText}</p>
                ${unsubscribeUrl ? `
                <p style="margin:8px 0 0;font-size:10px;line-height:1.6;">
                  <a href="${unsubscribeUrl}" style="color:#2a5050;text-decoration:underline;font-size:10px;">Unsubscribe</a>
                  <span style="color:#1a3a3a;"> &nbsp;·&nbsp; </span>
                  <span style="color:#1e3838;font-size:10px;">You can unsubscribe at any time.</span>
                </p>` : ""}
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

function tplDeviceOrderBody(opts: {
  name: string;
  deviceLabel: string;
  devicePrice: number;
  shipping: number;
  total: number;
  txHash?: string;
  senderWallet?: string;
  postalAddress?: string;
  hasPricing: boolean;
}): string {
  const { name, deviceLabel, devicePrice, shipping, total, txHash, senderWallet, postalAddress, hasPricing } = opts;
  const paymentSection = hasPricing ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 14px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Order Summary</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:5px 0;color:#8ab0b0;font-size:14px;">${deviceLabel}</td>
            <td style="padding:5px 0;color:#ffffff;font-size:14px;text-align:right;font-weight:700;">$${devicePrice.toFixed(2)} USDT</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#8ab0b0;font-size:14px;">Worldwide Shipping</td>
            <td style="padding:5px 0;color:#ffffff;font-size:14px;text-align:right;font-weight:700;">$${shipping.toFixed(2)} USDT</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0 0;border-top:1px solid #2EB8B820;">
              &nbsp;
            </td>
          </tr>
          <tr>
            <td style="color:#ffffff;font-size:15px;font-weight:900;">Total</td>
            <td style="color:#2EB8B8;font-size:15px;font-weight:900;text-align:right;">$${total.toFixed(2)} USDT</td>
          </tr>
        </table>
        ${txHash ? `
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #2EB8B820;">
          <p style="margin:0 0 4px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">Payment Transaction</p>
          <p style="margin:0;color:#8ab0b0;font-size:11px;font-family:monospace;word-break:break-all;">${txHash}</p>
        </div>` : `
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #2EB8B820;">
          <p style="margin:0 0 4px;color:#f59e0b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">Payment Pending</p>
          <p style="margin:0;color:#8ab0b0;font-size:13px;line-height:1.5;">Send USDT (BSC or TRC20) to secure your reservation and get priority shipping.</p>
        </div>`}
        ${postalAddress ? `
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #2EB8B820;">
          <p style="margin:0 0 4px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">Shipping Address</p>
          <p style="margin:0;color:#8ab0b0;font-size:13px;line-height:1.6;white-space:pre-line;">${postalAddress}</p>
        </div>` : ""}
      </td></tr>
    </table>` : "";

  return `
    <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">Device Reservation Confirmed</h1>
    <p style="margin:0 0 28px;color:#7aacac;font-size:16px;line-height:1.7;">Hi ${name}, your reservation for the <strong style="color:#ffffff;">${deviceLabel}</strong> is confirmed. Here's a summary of your order.</p>
    ${paymentSection}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0c1c1c;border:1px solid #2EB8B820;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 14px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Important — Timeline</p>
        <p style="margin:0 0 10px;color:#ffffff;font-size:16px;font-weight:800;">Estimated Delivery: 6–12 Months</p>
        <p style="margin:0;color:#8ab0b0;font-size:14px;line-height:1.6;">Your Liberty Mesh Device is currently in <strong style="color:#ffffff;">design and production</strong>. We are working hard to deliver the best possible hardware. We will keep you updated at every milestone — from prototype to shipping.</p>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0a2424,#0d1e1e);border:1px solid #2EB8B830;border-radius:12px;margin-bottom:32px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 14px;color:#2EB8B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">What Happens Next</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${["Your reservation is locked in the queue", "We will email you at every production milestone", "Priority shipping for confirmed payments", "You will receive tracking details before dispatch", "Join our Telegram or Discord for real-time updates"].map(item => `
          <tr>
            <td style="padding:5px 0;vertical-align:top;width:20px;">
              <span style="color:#2EB8B8;font-size:14px;font-weight:700;">&#10003;</span>
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
          <a href="${branding.telegramUrl || branding.discordUrl}" style="display:inline-block;background:#0a2020;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;border:1px solid #2EB8B840;">Join Community</a>
        </td>
      </tr>
    </table>`;
}

export async function sendDeviceOrderConfirmation(opts: {
  name: string;
  email: string;
  deviceLabel: string;
  devicePrice: number;
  shipping: number;
  total: number;
  txHash?: string;
  senderWallet?: string;
  postalAddress?: string;
  hasPricing: boolean;
}): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: opts.email,
      subject: `Your Liberty Mesh Device Reservation — ${opts.deviceLabel}`,
      html: baseLayout(tplDeviceOrderBody(opts)),
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

export async function sendEventVerificationEmail(
  to: { name: string; email: string },
  event: { name: string; date: string },
  verifyUrl: string
): Promise<void> {
  const client = getClient();
  if (!client) return;
  const body = `
    <h2 style="font-size:22px;font-weight:800;color:#e2e8f0;margin:0 0 8px">Verify your registration</h2>
    <p style="color:#94a3b8;margin:0 0 20px">Hi ${to.name},</p>
    <p style="color:#94a3b8;margin:0 0 20px">
      Thanks for registering for <strong style="color:#e2e8f0">${event.name}</strong> on ${event.date}.
      Please confirm your spot by clicking the button below. This link expires in 48 hours.
    </p>
    <a href="${verifyUrl}"
       style="display:inline-block;background:#2EB8B8;color:#0a1a1a;font-weight:700;font-size:15px;
              padding:14px 32px;border-radius:8px;text-decoration:none;margin:0 0 24px">
      Confirm My Registration
    </a>
    <p style="color:#64748b;font-size:13px;margin:0">
      Or copy this link into your browser:<br/>
      <span style="color:#2EB8B8;word-break:break-all">${verifyUrl}</span>
    </p>
    <p style="color:#64748b;font-size:12px;margin:20px 0 0">
      If you did not register for this event, you can safely ignore this email.
    </p>
  `;
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: `Confirm your registration — ${event.name}`,
      html: baseLayout(body),
    });
  } catch (_) {}
}

// ── Campaign sender ───────────────────────────────────────
export async function sendCampaignToRecipients(
  subject: string,
  bodyHtml: string,
  recipients: Array<{ name: string; email: string; id: string }>,
  campaignId: string,
  baseUrl: string
): Promise<{ sent: number; failed: number }> {
  const { injectTracking } = await import("../shared/email-builder.js");
  const client = getClient();
  if (!client) throw new Error("No API key configured. Add your Resend API key in Admin → Settings.");
  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    try {
      const unsubscribeUrl = buildUnsubscribeUrl(recipient.email, baseUrl);
      const fullHtml = baseLayout(bodyHtml, unsubscribeUrl);
      const personalised = injectTracking(fullHtml, campaignId, recipient.id, baseUrl);
      await client.emails.send({
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: recipient.email,
        subject,
        html: personalised,
      });
      sent++;
      // Small delay to avoid rate limits
      if (recipients.length > 1) await new Promise((r) => setTimeout(r, 50));
    } catch (_) {
      failed++;
    }
  }
  return { sent, failed };
}

// ── Autoresponder sender ──────────────────────────────────
export async function sendAutoresponderEmail(
  to: { name: string; email: string },
  autoresponder: { subject: string; previewText: string; bodyHtml: string },
  baseUrl?: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    const unsubscribeUrl = baseUrl ? buildUnsubscribeUrl(to.email, baseUrl) : undefined;
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: autoresponder.subject,
      html: baseLayout(autoresponder.bodyHtml, unsubscribeUrl),
    });
  } catch (_) {}
}

// ── Roadmap deadline reminder ─────────────────────────────
export interface MilestoneAlert {
  id: string;
  title: string;
  quarter: string;
  status: string;
  daysLeft: number;  // negative = overdue
}

export async function sendRoadmapReminderEmail(
  adminEmail: string,
  alerts: MilestoneAlert[],
): Promise<{ sent: boolean; error?: string }> {
  const client = getClient();
  if (!client) return { sent: false, error: "No API key configured" };
  if (!adminEmail) return { sent: false, error: "No admin email configured" };

  const overdue  = alerts.filter(a => a.daysLeft < 0);
  const dueSoon  = alerts.filter(a => a.daysLeft >= 0);

  const milestoneRow = (a: MilestoneAlert) => {
    const urgency = a.daysLeft < 0
      ? `<span style="color:#ef4444;font-weight:700;">Overdue by ${Math.abs(a.daysLeft)} day${Math.abs(a.daysLeft) !== 1 ? "s" : ""}</span>`
      : a.daysLeft === 0
        ? `<span style="color:#f97316;font-weight:700;">Due today</span>`
        : `<span style="color:#f59e0b;font-weight:700;">${a.daysLeft} day${a.daysLeft !== 1 ? "s" : ""} left</span>`;

    const statusColor = a.status === "active" ? "#2eb8b8" : "#6b7280";

    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1f2937;">
          <strong style="color:#f9fafb;font-size:14px;">${a.title}</strong>
          <div style="font-size:12px;color:#9ca3af;margin-top:2px;">${a.quarter}</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1f2937;text-align:center;">
          <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;">
            ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1f2937;text-align:right;font-size:13px;">
          ${urgency}
        </td>
      </tr>`;
  };

  const body = `
    <div style="margin-bottom:24px;">
      <div style="font-size:13px;color:#9ca3af;margin-bottom:20px;">
        This is an automated reminder about Liberty Chain roadmap milestones that require your attention.
      </div>

      ${overdue.length > 0 ? `
      <div style="background:#ef444415;border:1px solid #ef444440;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#ef4444;">
          ⚠ ${overdue.length} overdue milestone${overdue.length !== 1 ? "s" : ""} — quarter has ended
        </p>
      </div>` : ""}

      ${dueSoon.length > 0 ? `
      <div style="background:#f59e0b15;border:1px solid #f59e0b40;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#f59e0b;">
          ⏱ ${dueSoon.length} milestone${dueSoon.length !== 1 ? "s" : ""} due within 30 days
        </p>
      </div>` : ""}

      <table style="width:100%;border-collapse:collapse;background:#111827;border-radius:8px;overflow:hidden;border:1px solid #1f2937;">
        <thead>
          <tr style="background:#1f2937;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Milestone</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Status</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Deadline</th>
          </tr>
        </thead>
        <tbody>
          ${alerts.map(milestoneRow).join("")}
        </tbody>
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="/admin/roadmap" style="display:inline-block;padding:10px 24px;background:#2eb8b8;color:#000;font-weight:700;font-size:13px;border-radius:8px;text-decoration:none;">
          Update Milestones in Admin
        </a>
      </div>
    </div>`;

  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: adminEmail,
      subject: `[Liberty Chain] ${overdue.length > 0 ? "⚠ " : "⏱ "}${alerts.length} Roadmap Milestone${alerts.length !== 1 ? "s" : ""} Need Attention`,
      html: baseLayout(body),
    });
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err?.message || "Send failed" };
  }
}
