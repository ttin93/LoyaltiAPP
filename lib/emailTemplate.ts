// Predloge elektronskih sporočil (HTML z vgrajenimi slogi, primerno za poštne odjemalce).
// Svetla podoba znamke: bela kartica, modra za poudarke, rdeč gumb. Brez izmišljenih kod:
// kupon je vedno resničen zapis v gostovi denarnici, sporočilo nanj samo pokaže.
import { BRAND, BRAND_CITY, BRAND_EMAIL, siteOrigin } from "@/lib/brand";
import { onColor, safeHex } from "@/lib/color";
import { DEMO } from "@/lib/demo";

const FONT = "'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO = "'Geist Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace";
const C = { bg: "#F3F6FA", card: "#FFFFFF", s2: "#F3F6FA", s3: "#E9EEF4", line: "#D7DFE9", fg: "#0B1826", mute: "#4F5D70", dim: "#6B7889", brand: "#1F8BF5", brandInk: "#0B6BD0", accent: "#E63F26", white: "#FFFFFF" };

export function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Besedilo → odstavki: prazna vrstica loči odstavek, enojen prelom ostane prelom. */
export function textToHtml(text: string, color = C.fg): string {
  return String(text)
    .split(/\n{2,}/)
    .filter((x) => x.trim())
    .map((x) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:${color}">${esc(x.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// ── gradniki ────────────────────────────────────────────────────────────────
const h1 = (t: string) => `<h1 style="margin:0 0 12px;font-size:30px;line-height:36px;font-weight:600;letter-spacing:-0.02em;color:${C.fg}">${esc(t)}</h1>`;
const lead = (t: string) => `<p style="margin:0 0 24px;font-size:16px;line-height:24px;color:${C.mute}">${esc(t)}</p>`;
const small = (t: string) => `<p style="margin:16px 0 0;font-size:14px;line-height:20px;color:${C.mute}">${esc(t)}</p>`;
const eyebrow = (t: string) => `<p style="margin:0 0 12px;font-family:${MONO};font-size:12px;line-height:16px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${C.brandInk}">${esc(t)}</p>`;

function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0"><tr><td style="border-radius:12px;background:${C.accent}"><a href="${esc(href)}" style="display:inline-block;padding:12px 20px;font-size:16px;line-height:24px;font-weight:600;color:${C.white};text-decoration:none;border-radius:12px">${esc(text)}</a></td></tr></table>`;
}

/** Kupon: limetna ploščica z imenom nagrade. */
function coupon(name: string, note: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr><td style="background:${C.brand};border-radius:16px;padding:24px">
    <p style="margin:0 0 8px;font-family:${MONO};font-size:12px;line-height:16px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${C.white};opacity:0.8">Kupon</p>
    <p style="margin:0;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.02em;color:${C.white}">${esc(name)}</p>
    <p style="margin:8px 0 0;font-size:14px;line-height:20px;color:${C.white};opacity:0.9">${esc(note)}</p>
  </td></tr></table>`;
}

/** Kartica zvestobe v barvi lokala (kot v aplikaciji). */
function card(o: { venueName: string; color?: string | null; goal: number; filled: number; reward: string }): string {
  const bg = safeHex(o.color);
  const fg = onColor(bg);
  const total = Math.min(12, Math.max(1, o.goal));
  const perRow = total > 6 ? Math.ceil(total / 2) : total;
  const dot = (i: number) => {
    const on = i < o.filled;
    return `<td style="padding:0 8px 8px 0"><div style="width:20px;height:20px;border-radius:50%;border:2px solid ${fg};${on ? `background:${fg};` : "opacity:0.35;"}font-size:0;line-height:0">&nbsp;</div></td>`;
  };
  let rows = "";
  for (let r = 0; r * perRow < total; r++) {
    let cells = "";
    for (let i = r * perRow; i < Math.min(total, (r + 1) * perRow); i++) cells += dot(i);
    rows += `<tr>${cells}</tr>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr><td style="background:${bg};border-radius:20px;padding:24px;color:${fg}">
    <p style="margin:0 0 32px;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.02em;color:${fg}">${esc(o.venueName)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr>
      <td style="font-size:14px;line-height:20px;font-weight:500;color:${fg}">${esc(o.reward)}</td>
      <td align="right" style="font-family:${MONO};font-size:14px;line-height:20px;font-weight:500;color:${fg}">${Math.min(o.filled, total)}/${total}</td>
    </tr></table>
  </td></tr></table>`;
}

function steps(items: { title: string; text: string }[]): string {
  const rows = items
    .map(
      (s, i) => `<tr><td valign="top" style="width:32px;padding:0 16px 16px 0"><div style="width:32px;height:32px;border-radius:50%;background:${C.fg};color:${C.white};text-align:center;font-family:${MONO};font-size:14px;line-height:32px;font-weight:600">${i + 1}</div></td>
      <td valign="top" style="padding:0 0 16px"><p style="margin:0;font-size:16px;line-height:24px;font-weight:600;color:${C.fg}">${esc(s.title)}</p><p style="margin:0;font-size:14px;line-height:20px;color:${C.mute}">${esc(s.text)}</p></td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0">${rows}</table>`;
}

function facts(items: [string, string][]): string {
  const rows = items
    .map(([k, v]) => `<tr><td style="padding:12px 16px;font-size:14px;line-height:20px;color:${C.mute}">${esc(k)}</td><td align="right" style="padding:12px 16px;font-size:14px;line-height:20px;font-weight:600;color:${C.fg}">${esc(v)}</td></tr>`)
    .join(`<tr><td colspan="2" style="height:1px;background:${C.line};font-size:0;line-height:0">&nbsp;</td></tr>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;background:${C.s2};border-radius:16px">${rows}</table>`;
}

// ── ovoj ────────────────────────────────────────────────────────────────────
function shell(o: { preheader: string; header: string; body: string; footer: string }): string {
  return `<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(BRAND)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 8px 24px">${o.header}</td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:24px;padding:32px">${o.body}</td></tr>
    <tr><td style="padding:24px 8px 0;font-size:12px;line-height:16px;color:${C.dim}">${o.footer}</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const mark = () => `<img src="${siteOrigin()}/brand/mark.png" width="32" height="32" alt="${esc(BRAND)}" style="display:block;border:0;border-radius:8px">`;
const link = (text: string, href: string) => `<a href="${esc(href)}" style="color:${C.mute};text-decoration:underline">${esc(text)}</a>`;

export type GuestBase = {
  venueName: string;
  brandColor?: string | null;
  /** Povezava do kartice lokala v aplikaciji. */
  ctaUrl: string;
  /** Samo pri marketinških sporočilih. */
  unsubUrl?: string;
};

function guestShell(b: GuestBase, preheader: string, body: string): string {
  const header = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:20px;line-height:28px;font-weight:600;letter-spacing:-0.02em;color:${C.fg}">${esc(b.venueName)}</td>
    <td align="right" width="40">${mark()}</td>
  </tr></table>`;
  // Podpis Loyavi je del vsakega sporočila gostom. Lokal ga ne more odstraniti, ker predloge ne ureja.
  const footer = `To sporočilo prejemaš, ker imaš kartico lokala ${esc(b.venueName)} v aplikaciji ${esc(BRAND)}.${b.unsubUrl ? ` ${link("Odjava od sporočil tega lokala", b.unsubUrl)}.` : ""}<br><br>Kartica zvestobe prek ${link(BRAND, siteOrigin())}, ${esc(BRAND_CITY)}`;
  return shell({ preheader, header, body, footer });
}

function adminShell(preheader: string, body: string): string {
  const header = `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td width="40">${mark()}</td>
    <td style="padding-left:12px;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-0.02em;color:${C.fg}">loyavi</td>
  </tr></table>`;
  const footer = `To sporočilo prejemaš, ker imaš račun lokala v aplikaciji ${esc(BRAND)}. Vprašanja? Piši nam na ${link(BRAND_EMAIL, `mailto:${BRAND_EMAIL}`)}.<br><br>${esc(BRAND)}, ${esc(BRAND_CITY)}`;
  return shell({ preheader, header, body, footer });
}

const COUPON_NOTE = "Shranjen je v tvoji denarnici. Pokaži ga osebju ob naslednjem obisku. Velja 30 dni.";

// ── GOST ────────────────────────────────────────────────────────────────────
export function emailWelcome(b: GuestBase, d: { goal: number; reward: string; checkin: "receipt" | "stand" | "both" }): string {
  const how =
    d.checkin === "receipt"
      ? { title: "Ob nakupu skeniraj račun", text: "Koda QR je na dnu vsakega računa. En račun, en žig." }
      : d.checkin === "stand"
        ? { title: "Ob obisku skeniraj kodo na pultu", text: "Ali približaj telefon nalepki ob blagajni. En žig na dan." }
        : { title: "Ob obisku zabeleži žig", text: "Skeniraj kodo QR na računu ali kodo na pultu ob blagajni." };
  return guestShell(
    b,
    `Zberi ${d.goal} žigov in prevzemi nagrado: ${d.reward}.`,
    eyebrow("Kartica je dodana") +
      h1("Tvoja kartica je pripravljena") +
      lead(`Kartica lokala ${b.venueName} je v tvoji denarnici. Po ${d.goal} obiskih te čaka nagrada.`) +
      card({ venueName: b.venueName, color: b.brandColor, goal: d.goal, filled: 0, reward: d.reward }) +
      `<div style="height:24px;font-size:0;line-height:0">&nbsp;</div>` +
      steps([how, { title: "Spremljaj kartico", text: "Vsak potrjen obisk doda žig. Stanje vidiš kadar koli." }, { title: "Prevzemi nagrado", text: `Ko je kartica polna, dobiš kupon: ${d.reward}.` }]) +
      button("Odpri kartico", b.ctaUrl),
  );
}

export function emailCouponEarned(b: GuestBase, d: { goal: number; reward: string }): string {
  return guestShell(
    b,
    `Vseh ${d.goal} žigov je zbranih. Čaka te: ${d.reward}.`,
    eyebrow("Kartica je polna") +
      h1("Nagrada te čaka") +
      lead(`Pri lokalu ${b.venueName} imaš zbranih vseh ${d.goal} žigov. Nova kartica se je že začela.`) +
      coupon(d.reward, "Shranjen je v tvoji denarnici. Ob naslednjem obisku ga odpri in pokaži osebju.") +
      button("Odpri kupon", b.ctaUrl),
  );
}

export type MarketingKind = "we_miss_you" | "birthday_guest" | "anniversary" | "birthday_venue";

const MARKETING: Record<MarketingKind, { eyebrow: string; heading: (v: string) => string; cta: string }> = {
  we_miss_you: { eyebrow: "Dolgo se nismo videli", heading: () => "Pogrešamo te", cta: "Odpri kartico" },
  birthday_guest: { eyebrow: "Tvoj dan", heading: () => "Vse najboljše", cta: "Odpri darilo" },
  anniversary: { eyebrow: "Eno leto skupaj", heading: () => "Hvala, da se vračaš", cta: "Odpri kartico" },
  birthday_venue: { eyebrow: "Praznujemo", heading: (v) => `${v} praznuje`, cta: "Odpri kartico" },
};

/** Samodejna sporočila lokala (besedilo napiše lastnik, kupon je neobvezen). */
export function emailMarketing(b: GuestBase, kind: MarketingKind, d: { message: string; couponName?: string }): string {
  const m = MARKETING[kind];
  return guestShell(
    b,
    d.message.slice(0, 120),
    eyebrow(m.eyebrow) + h1(m.heading(b.venueName)) + textToHtml(d.message) + (d.couponName ? coupon(d.couponName, COUPON_NOTE) : "") + button(d.couponName ? "Odpri kupon" : m.cta, b.ctaUrl),
  );
}

/** Enkratno sporočilo lokala gostom. */
export function emailCampaign(b: GuestBase, d: { heading: string; message: string; couponName?: string }): string {
  return guestShell(b, d.message.slice(0, 120), h1(d.heading) + textToHtml(d.message) + (d.couponName ? coupon(d.couponName, COUPON_NOTE) : "") + button(d.couponName ? "Odpri kupon" : "Odpri kartico", b.ctaUrl));
}

// ── LASTNIK (Loyavi → lokal) ────────────────────────────────────────────────
export type AdminBase = { ctaUrl: string };

export function emailOwnerWelcome(d: AdminBase & { venueName: string }): string {
  return adminShell(
    "Trije koraki do prvega žiga.",
    eyebrow("Lokal je ustvarjen") +
      h1(`${d.venueName} je pripravljen`) +
      lead(
        DEMO
          ? "Loyavi je v demo obdobju: vse funkcije so brezplačne in kartice ni treba vpisati. Do prvega žiga te ločijo trije koraki."
          : "Brezplačni preizkus traja 30 dni, kartice ni treba vpisati. Do prvega žiga te ločijo trije koraki.",
      ) +
      steps([
        { title: "Vklopi beleženje obiskov", text: "Skeniraj en svoj račun ali natisni kodo QR za pult." },
        { title: "Preizkusi kot gost", text: "Odpri svojo kartico v telefonu in zabeleži prvi obisk." },
        { title: "Povabi goste", text: "Kodo postavi ob blagajno in osebju povej, naj jo omeni ob plačilu." },
      ]) +
      button("Odpri nadzorno ploščo", d.ctaUrl) +
      small(
        DEMO
          ? "Preden se demo konča, te obvestimo po elektronski pošti. Brez tvoje potrditve se nič ne zaračuna. Če se kje zatakne, odgovori na to sporočilo. Bere ga človek."
          : "Če se kje zatakne, odgovori na to sporočilo. Bere ga človek.",
      ),
  );
}

/** Obvestilo ekipi Loyavi o novem povpraševanju (kontaktni obrazec ali prošnja za več lokalov). */
export function emailLead(d: AdminBase & { heading: string; rows: [string, string][]; message: string }): string {
  return adminShell(
    d.message.slice(0, 120) || d.heading,
    eyebrow("Novo povpraševanje") + h1(d.heading) + facts(d.rows) + `<div style="height:24px;font-size:0;line-height:0">&nbsp;</div>` + textToHtml(d.message || "Brez sporočila.") + button("Odpri superadmin", d.ctaUrl),
  );
}

export function emailAdminPurchase(d: AdminBase & { venueName: string; plan: string; amount: string; date: string; nextRenewal: string }): string {
  return adminShell(
    `Paket ${d.plan} je aktiven.`,
    eyebrow("Naročnina je aktivna") +
      h1("Hvala za zaupanje") +
      lead(`Naročnina za lokal ${d.venueName} je aktivna. Račun ti pošlje naš plačilni partner Polar.`) +
      facts([
        ["Paket", d.plan],
        ["Znesek", d.amount],
        ["Datum", d.date],
        ["Naslednji obračun", d.nextRenewal],
      ]) +
      button("Odpri nadzorno ploščo", d.ctaUrl),
  );
}

export function emailAdminExpiring(d: AdminBase & { venueName: string; plan: string; expiresOn: string; trial: boolean }): string {
  return adminShell(
    d.trial ? `Preizkus se izteče ${d.expiresOn}.` : `Naročnina se izteče ${d.expiresOn}.`,
    eyebrow(d.trial ? "Preizkus se izteka" : "Naročnina se izteka") +
      h1(d.trial ? "Še nekaj dni preizkusa" : "Naročnina se kmalu izteče") +
      lead(
        d.trial
          ? `Brezplačni preizkus za lokal ${d.venueName} se izteče ${d.expiresOn}. Izberi paket, da gostje zbirajo žige brez prekinitve.`
          : `Naročnina za lokal ${d.venueName} se izteče ${d.expiresOn}. Po tem datumu gostje ne morejo več zbirati žigov, podatki pa ostanejo shranjeni.`,
      ) +
      facts([
        ["Lokal", d.venueName],
        [d.trial ? "Konec preizkusa" : "Velja do", d.expiresOn],
        ...(d.trial ? [] : ([["Paket", d.plan]] as [string, string][])),
      ]) +
      button(d.trial ? "Izberi paket" : "Uredi naročnino", d.ctaUrl),
  );
}

/** Sporočilo ekipe Loyavi lastnikom (superadmin). */
export function emailOwnerMessage(d: AdminBase & { heading: string; message: string; ctaText?: string }): string {
  return adminShell(d.message.slice(0, 120), h1(d.heading) + textToHtml(d.message) + button(d.ctaText || "Odpri nadzorno ploščo", d.ctaUrl));
}
