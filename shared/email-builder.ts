import type { EmailBlock, BlockType } from "./schema";

export type { EmailBlock, BlockType };

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineToHtml(s: string): string {
  return s.split("\n").map(escHtml).join("<br>");
}

function blockToHtml(block: EmailBlock): string {
  const p = block.props;
  switch (block.type) {
    case "heading": {
      const tag = p.tag || "h1";
      const size = tag === "h1" ? "28px" : tag === "h2" ? "22px" : "18px";
      const weight = tag === "h1" ? "900" : "800";
      return `<${tag} style="margin:0 0 16px;color:${p.color || "#ffffff"};font-size:${size};font-weight:${weight};text-align:${p.align || "left"};letter-spacing:-0.5px;line-height:1.1;">${inlineToHtml(p.text || "Heading")}</${tag}>`;
    }
    case "text": {
      const content = inlineToHtml(p.content || "");
      return `<p style="margin:0 0 20px;color:${p.color || "#7aacac"};font-size:16px;line-height:1.7;text-align:${p.align || "left"};">${content}</p>`;
    }
    case "image": {
      if (!p.src) return "";
      const marginStyle = p.align === "center" ? "margin:0 auto 20px;" : "margin-bottom:20px;";
      const imgStyle = `max-width:${p.width || "100%"};height:auto;display:block;${marginStyle}border-radius:8px;`;
      const imgTag = `<img src="${p.src}" alt="${escHtml(p.alt || "")}" style="${imgStyle}" />`;
      return p.link
        ? `<a href="${p.link}" style="display:block;">${imgTag}</a>`
        : imgTag;
    }
    case "button": {
      const align = p.align || "left";
      const tableStyle =
        align === "center"
          ? "margin:0 auto 24px;"
          : align === "right"
          ? "margin:0 0 24px auto;"
          : "margin-bottom:24px;";
      const bg = p.bgColor || "#2EB8B8";
      const fg = p.textColor || "#000000";
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="${tableStyle}"><tr><td style="border-radius:8px;background:${bg};"><a href="${p.url || "#"}" style="display:inline-block;background:${bg};color:${fg};font-size:14px;font-weight:800;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.02em;">${escHtml(p.label || "Click Here")}</a></td></tr></table>`;
    }
    case "divider": {
      return `<div style="height:1px;background:${p.color || "#1a3a3a"};margin:${p.spacing || "24"}px 0;"></div>`;
    }
    case "spacer": {
      return `<div style="height:${p.height || "32"}px;"></div>`;
    }
    default:
      return "";
  }
}

export function blocksToBodyHtml(blocks: EmailBlock[]): string {
  return blocks.map(blockToHtml).join("\n");
}

export function injectTracking(
  html: string,
  campaignId: string,
  recipientId: string,
  baseUrl: string
): string {
  const pixelUrl = `${baseUrl}/api/track/open?c=${encodeURIComponent(campaignId)}&r=${encodeURIComponent(recipientId)}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;" />`;

  const tracked = html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_match, url) => {
      const redirectUrl = `${baseUrl}/api/track/click?c=${encodeURIComponent(campaignId)}&r=${encodeURIComponent(recipientId)}&u=${encodeURIComponent(url)}`;
      return `href="${redirectUrl}"`;
    }
  );

  return tracked.replace("</body>", `${pixel}</body>`);
}
