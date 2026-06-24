// Branded HTML e-poštna predloga (uporablja ime/barvo znamke — kot gostova stran).

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Besedilo → HTML: dvojni newline = odstavek, enojni = <br>. */
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function brandedEmail(o: {
  brandColor?: string | null;
  brandName: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  const c = o.brandColor && /^#[0-9a-fA-F]{6}$/.test(o.brandColor) ? o.brandColor : "#C4623D";
  const cta =
    o.ctaText && o.ctaUrl
      ? `<a href="${o.ctaUrl}" style="display:inline-block;margin-top:22px;background:#2A241D;color:#FBF7F0;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700;font-size:15px">${esc(o.ctaText)}</a>`
      : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#F3EEE4;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#2A241D">
  <div style="max-width:520px;margin:0 auto;padding:28px 18px">
    <div style="background:#fff;border-radius:18px;overflow:hidden;border:1px solid #EADfce">
      <div style="background:${c};height:6px;font-size:0;line-height:0">&nbsp;</div>
      <div style="padding:30px 28px">
        <div style="font-weight:800;font-size:18px;color:${c};margin-bottom:16px">${esc(o.brandName)}</div>
        <h1 style="font-size:22px;line-height:1.25;margin:0 0 14px;font-weight:800">${esc(o.heading)}</h1>
        <div style="font-size:15px;line-height:1.6;color:#4A4034">${o.bodyHtml}</div>
        ${cta}
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:#9A8F80;margin-top:16px">${o.footer ? esc(o.footer) + " · " : ""}powered by Tally</div>
  </div>
</body></html>`;
}
