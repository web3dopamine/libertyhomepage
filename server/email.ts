import { Resend } from "resend";

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

export async function testEmailConnection(toEmail: string): Promise<{ success: boolean; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: "No API key configured. Add your Resend API key first." };
  try {
    const result = await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: toEmail,
      subject: "Liberty Chain — Email Connection Test",
      html: baseLayout(`
        <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:800;">Email Connection Test</h1>
        <p style="margin:0 0 20px;color:#8ab0b0;font-size:16px;line-height:1.6;">Your Resend integration with Liberty Chain is working correctly.</p>
        <div style="background:#0a2a2a;border:1px solid #1a4a4a;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#2EB8B8;font-size:14px;font-weight:600;">✓ API key is valid</p>
          <p style="margin:0;color:#2EB8B8;font-size:14px;font-weight:600;">✓ Email delivery is working</p>
        </div>
        <p style="margin:0;color:#6a9090;font-size:14px;">This is an automated test from your Liberty Chain admin dashboard.</p>
      `),
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
      html: baseLayout(`
        <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:800;">You're on the list.</h1>
        <p style="margin:0 0 24px;color:#8ab0b0;font-size:16px;line-height:1.6;">Hi ${to.name}, welcome to the Liberty Chain waitlist. You'll be among the first to gain access when we open the next wave.</p>
        <div style="background:linear-gradient(135deg,#0a2a2a,#0d2020);border:1px solid #2EB8B840;border-radius:10px;padding:24px;margin-bottom:28px;">
          <p style="margin:0 0 8px;color:#2EB8B8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">What's coming</p>
          <ul style="margin:0;padding-left:18px;color:#8ab0b0;font-size:15px;line-height:2;">
            <li>Zero gas fee transactions</li>
            <li>10,000+ TPS performance</li>
            <li>Full EVM compatibility</li>
            <li>Instant finality</li>
          </ul>
        </div>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:12px;">
            <a href="https://twitter.com/libertychain" style="display:inline-block;background:#2EB8B8;color:#000;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;">Follow on X</a>
          </td>
          <td>
            <a href="https://discord.gg/libertychain" style="display:inline-block;background:#1a3a3a;color:#2EB8B8;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;border:1px solid #2EB8B840;">Join Discord</a>
          </td>
        </tr></table>
      `),
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
      html: baseLayout(`
        <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:800;">Application Received</h1>
        <p style="margin:0 0 24px;color:#8ab0b0;font-size:16px;line-height:1.6;">Hi ${to.name}, we've received your Liberty Chain Accelerator application for <strong style="color:#ffffff;">${to.projectName}</strong>. Our team will review it within 5–7 business days.</p>
        <div style="background:linear-gradient(135deg,#0a2a2a,#0d2020);border:1px solid #2EB8B840;border-radius:10px;padding:24px;margin-bottom:28px;">
          <p style="margin:0 0 16px;color:#2EB8B8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">What happens next</p>
          ${["Application Review (5–7 days)", "Initial Interview", "Cohort Selection", "Programme Kickoff"].map((step, i) => `
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:10px;"><tr>
            <td style="width:28px;vertical-align:middle;">
              <span style="display:inline-block;width:22px;height:22px;background:#2EB8B820;border:1px solid #2EB8B850;border-radius:50%;text-align:center;line-height:22px;color:#2EB8B8;font-size:11px;font-weight:700;">${i + 1}</span>
            </td>
            <td style="color:#8ab0b0;font-size:14px;padding-left:10px;">${step}</td>
          </tr></table>`).join("")}
        </div>
        <p style="margin:0;color:#6a9090;font-size:14px;line-height:1.6;">Have questions? Reach us on <a href="https://discord.gg/libertychain" style="color:#2EB8B8;text-decoration:none;">Discord</a>.</p>
      `),
    });
  } catch (_) {}
}

export async function sendAcceleratorStageUpdate(
  to: { name: string; email: string; projectName: string },
  stage: string
): Promise<void> {
  const client = getClient();
  if (!client) return;
  const stageLabels: Record<string, { label: string; desc: string; color: string }> = {
    review: { label: "Under Review", desc: "Your application is now being reviewed by our team. We'll be in touch shortly.", color: "#f59e0b" },
    interview: { label: "Interview Stage", desc: "Congratulations! We'd like to schedule an interview. Our team will reach out with details.", color: "#8b5cf6" },
    accepted: { label: "Accepted!", desc: "You've been accepted into the Liberty Chain Accelerator! Welcome to the cohort. We'll send next steps shortly.", color: "#2EB8B8" },
    rejected: { label: "Application Closed", desc: "After careful review, we're unable to proceed at this time. We encourage you to apply again in a future cohort.", color: "#6a9090" },
  };
  const info = stageLabels[stage] || { label: stage, desc: "Your application status has been updated.", color: "#2EB8B8" };
  try {
    await client.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: to.email,
      subject: "Liberty Chain Accelerator — Application Update",
      html: baseLayout(`
        <h1 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:800;">Application Update</h1>
        <p style="margin:0 0 24px;color:#8ab0b0;font-size:16px;line-height:1.6;">Hi ${to.name}, there's an update on your application for <strong style="color:#ffffff;">${to.projectName}</strong>.</p>
        <div style="background:linear-gradient(135deg,#0a2a2a,#0d2020);border:1px solid ${info.color}40;border-radius:10px;padding:24px;margin-bottom:28px;">
          <p style="margin:0 0 6px;color:${info.color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Status Update</p>
          <p style="margin:0 0 12px;color:#ffffff;font-size:22px;font-weight:800;">${info.label}</p>
          <p style="margin:0;color:#8ab0b0;font-size:15px;line-height:1.6;">${info.desc}</p>
        </div>
        <p style="margin:0;color:#6a9090;font-size:14px;line-height:1.6;">Questions? Reach us on <a href="https://discord.gg/libertychain" style="color:#2EB8B8;text-decoration:none;">Discord</a>.</p>
      `),
    });
  } catch (_) {}
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0a0f14;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0d1a1a 0%,#0a2020 100%);border-radius:12px 12px 0 0;padding:32px 40px 28px;border-bottom:1px solid #1a3a3a;">
          <span style="color:#2EB8B8;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Liberty Chain</span>
        </td></tr>
        <tr><td style="background:#0d1a1a;padding:40px;">${content}</td></tr>
        <tr><td style="background:#060e0e;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #1a3a3a;">
          <p style="margin:0;color:#4a6a6a;font-size:12px;line-height:1.5;">© ${new Date().getFullYear()} Liberty Chain · <a href="https://libertychain.org" style="color:#2EB8B8;text-decoration:none;">libertychain.org</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
