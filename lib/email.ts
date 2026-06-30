// Resend pošiljatelj. Privzeto platformni ključ (RESEND_API_KEY + RESEND_FROM);
// pri Scale paketu lahko lokal poda SVOJ ključ + from (maili iz njegove domene).
// Deliverability (da ne gre v spam) = verificirana domena + SPF/DKIM/DMARC v Resend.

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const DEFAULT_FROM = process.env.RESEND_FROM || "Loyavi <onboarding@resend.dev>";

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  apiKey?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = args.apiKey || process.env.RESEND_API_KEY;
  const from = args.from || DEFAULT_FROM;
  // Odgovori gostov/lastnikov pristanejo tu (npr. tvoj Gmail), ker from-domena nima inboxa.
  const replyTo = args.replyTo || process.env.RESEND_REPLY_TO;
  if (!key) return { ok: false, error: "E-pošta ni nastavljena (manjka RESEND_API_KEY)." };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: args.to, subject: args.subject, html: args.html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("[resend] non-2xx", r.status, t);
      return { ok: false, error: "Pošiljanje ni uspelo." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[resend] fetch failed", e);
    return { ok: false, error: "Napaka povezave z e-pošto." };
  }
}

/** Zaporedno pošiljanje (varno za manjše sezname). Vrne število uspelih/neuspelih. */
export async function sendBatch(
  items: { to: string; subject: string; html: string }[],
  opts?: { from?: string; apiKey?: string; replyTo?: string },
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const it of items) {
    const r = await sendEmail({ ...it, from: opts?.from, apiKey: opts?.apiKey, replyTo: opts?.replyTo });
    if (r.ok) sent++;
    else failed++;
  }
  return { sent, failed };
}
