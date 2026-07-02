// Email predloge (HTML, inline stili — email-safe). Prenešeno iz Claude Design
// "Email Šablone": gostov ovoj (barvna glava) + admin ovoj (Loyavi glava) + 16 predlog.
// Vsi vrnejo cel HTML string za Resend.

const FONT = "'Plus Jakarta Sans',-apple-system,'Segoe UI',Arial,sans-serif";
const INK = "#1C1007";
const MUTED = "#7A6855";

export function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Besedilo → HTML: dvojni newline = odstavek, enojni = <br>. */
export function textToHtml(text: string): string {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;color:#5A4E43;line-height:1.65">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// ── gradniki ────────────────────────────────────────────────────────────────
const h1 = (html: string) => `<h1 style="margin:0 0 10px;font-weight:800;font-size:26px;line-height:1.18;color:${INK};letter-spacing:-0.02em">${html}</h1>`;
const h2 = (html: string) => `<h2 style="margin:0 0 8px;font-weight:700;font-size:18px;color:${INK};letter-spacing:-0.01em">${html}</h2>`;
const p = (html: string) => `<p style="margin:0 0 16px;font-size:15px;color:#5A4E43;line-height:1.65">${html}</p>`;
const hline = () => `<div style="height:1px;background:#F0E8DC;margin:26px 0;font-size:0;line-height:0">&nbsp;</div>`;
const big = (html: string) => `<div style="font-size:48px;line-height:1;margin-bottom:10px">${html}</div>`;

function btn(text: string, href: string, color = INK): string {
  return `<a href="${esc(href || "#")}" style="display:inline-block;background:${color};color:#FFFFFF;padding:13px 28px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:-0.01em">${esc(text)}</a>`;
}
function ctaCenter(text: string, href: string, color = INK): string {
  return `<div style="text-align:center;margin-top:30px">${btn(text, href, color)}</div>`;
}
function notice(html: string, type: "green" | "amber" | "red" | "neutral" = "neutral"): string {
  const bg = { green: "#EEF4EE", amber: "#FDF8EE", red: "#FEF2F2", neutral: "#F5EFE8" }[type];
  const col = { green: "#2A5527", amber: "#7A5500", red: "#8B2020", neutral: "#4A3E33" }[type];
  return `<div style="background:${bg};padding:14px 18px;border-radius:10px;font-size:13.5px;color:${col};line-height:1.55;margin:16px 0">${html}</div>`;
}
function statBox(stats: { value: string; label: string }[]): string {
  const cells = stats
    .map((s, i) => `<td style="text-align:center;padding:18px 12px;${i < stats.length - 1 ? "border-right:1px solid #EDE5D5;" : ""}"><div style="font-weight:800;font-size:26px;color:${INK};line-height:1.1">${esc(s.value)}</div><div style="font-size:12px;color:#9A8F80;margin-top:4px">${esc(s.label)}</div></td>`)
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2EA;border-radius:14px;margin:20px 0"><tr>${cells}</tr></table>`;
}
function stepList(steps: { title: string; sub: string }[]): string {
  const rows = steps
    .map((s, i) => `<tr><td valign="top" style="width:44px;padding:0 14px 13px 0"><div style="width:30px;height:30px;border-radius:50%;background:${INK};color:#fff;text-align:center;line-height:30px;font-weight:800;font-size:13px">${i + 1}</div></td><td valign="top" style="padding:0 0 13px"><div style="font-weight:700;font-size:15px;color:${INK}">${esc(s.title)}</div><div style="font-size:13.5px;color:${MUTED};margin-top:3px;line-height:1.5">${esc(s.sub)}</div></td></tr>`)
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">${rows}</table>`;
}
function featureList(features: { icon: string; title: string; sub: string }[]): string {
  return features
    .map((f) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2EA;border-radius:12px;margin-bottom:12px"><tr><td valign="top" style="width:46px;padding:15px 0 15px 16px;font-size:22px">${f.icon}</td><td style="padding:15px 16px 15px 14px"><div style="font-weight:700;font-size:15px;color:${INK}">${esc(f.title)}</div><div style="font-size:13px;color:${MUTED};margin-top:3px;line-height:1.5">${esc(f.sub)}</div></td></tr></table>`)
    .join("");
}
function stamps(filled: number, total: number, color: string): string {
  let cells = "";
  for (let i = 0; i < total; i++) {
    const on = i < filled;
    cells += `<td style="padding:0 9px 0 0"><div style="width:40px;height:40px;border-radius:50%;background:${on ? color : "#EDE5D8"};${on ? "" : "border:2px solid #D5C8B5;"}text-align:center;line-height:40px;color:#fff;font-size:17px">${on ? "☕" : "<span style='color:#C5B89A'>○</span>"}</div></td>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px 0"><tr>${cells}</tr></table>`;
}
function couponBlock(title: string, sub: string, code: string, color: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed ${color};border-radius:16px;background:#FDFAF5;margin:16px 0"><tr>
    <td valign="middle" style="width:54px;padding:20px 0 20px 22px"><div style="width:54px;height:54px;border-radius:13px;background:${color};text-align:center;line-height:54px;font-size:26px">☕</div></td>
    <td valign="middle" style="padding:20px 22px"><div style="font-weight:800;font-size:17px;color:${INK}">${esc(title)}</div><div style="color:${MUTED};font-size:13px;margin-top:3px">${esc(sub)}</div><div style="margin-top:10px;display:inline-block;background:#F0E8DC;border-radius:7px;padding:4px 11px;font-family:monospace;font-size:12.5px;color:${MUTED};letter-spacing:0.08em">KODA: ${esc(code)}</div></td>
  </tr></table>`;
}
function kvRows(title: string, rows: [string, string, string?][]): string {
  const body = rows
    .map(([l, v, vc]) => `<tr><td style="font-size:14px;color:${MUTED};padding:5px 0">${esc(l)}</td><td style="font-size:14px;font-weight:700;color:${vc || INK};text-align:right;padding:5px 0">${esc(v)}</td></tr>`)
    .join("");
  return `<div style="background:#F8F2EA;border-radius:14px;padding:18px 22px;margin:20px 0"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:8px">${esc(title)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table></div>`;
}

// ── ovoja ─────────────────────────────────────────────────────────────────
function shell(headerHtml: string, body: string, footer: string, unsubUrl?: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#E9E1D3;font-family:${FONT}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9E1D3"><tr><td align="center" style="padding:28px 14px">
    <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(42,36,29,0.1)">
      <tr><td>${headerHtml}</td></tr>
      <tr><td style="padding:40px">${body}</td></tr>
      <tr><td style="border-top:1px solid #F0E8DC;padding:20px 40px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:11.5px;color:#B5A890;line-height:1.5">${esc(footer)}</td>
          <td style="text-align:right"><a href="${unsubUrl || "#"}" style="font-size:11.5px;color:#C5B89A;text-decoration:none">Odjava</a></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export type GuestBase = { venueName: string; brandColor?: string | null; ctaUrl?: string; unsubUrl?: string };

function color(brand?: string | null): string {
  return brand && /^#[0-9a-fA-F]{6}$/.test(brand) ? brand : "#2E5528";
}

function guestShell(base: GuestBase, subject: string, body: string): string {
  const c = color(base.brandColor);
  const ini = (base.venueName.trim()[0] || "L").toUpperCase();
  const header = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c}"><tr><td style="padding:26px 40px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:46px"><div style="width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,0.18);text-align:center;line-height:46px;color:#fff;font-weight:800;font-size:20px">${esc(ini)}</div></td>
      <td style="padding-left:14px"><div style="color:#fff;font-weight:700;font-size:16px;line-height:1.2">${esc(base.venueName)}</div><div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:2px">Kartica zvestobe · Loyavi</div></td>
    </tr></table>
  </td></tr></table>`;
  return shell(header, body, `${base.venueName} · Kartica zvestobe · Powered by Loyavi`, base.unsubUrl) + `<!--${esc(subject)}-->`;
}

function adminShell(subject: string, body: string, unsubUrl?: string): string {
  const header = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK}"><tr><td style="padding:26px 40px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:46px"><div style="width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,0.15);text-align:center;line-height:46px;color:#fff;font-weight:800;font-size:22px">T</div></td>
      <td style="padding-left:14px"><div style="color:#fff;font-weight:800;font-size:18px">Loyavi</div><div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:2px">Kartica zvestobe · SaaS platforma</div></td>
    </tr></table>
  </td></tr></table>`;
  return shell(header, body, "© Loyavi · Kartica zvestobe platforma", unsubUrl) + `<!--${esc(subject)}-->`;
}

// ─────────────────────────── GOSTJE · TRANSAKCIJSKI ───────────────────────────
export function emailPoints(b: GuestBase, d: { points: number | string; totalPoints: number | string; toReward: number | string; stampsFilled: number; stampsTotal: number; rewardName: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, "Dobil si točke za obisk! ⭐",
    `<div style="text-align:center;margin-bottom:24px">${big("☕")}${h1("Hvala za obisk!")}${p(`Zabeležili smo tvoj obisk pri <b>${esc(b.venueName)}</b> in dodali točke na tvojo kartico.`)}</div>` +
    `<div style="background:#F8F2EA;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:8px">DODANE TOČKE</div><div style="font-size:56px;font-weight:800;color:${c};line-height:1">+${esc(String(d.points))}</div>${hline()}<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="text-align:center;padding:0 18px"><div style="font-weight:800;font-size:22px;color:${INK}">${esc(String(d.totalPoints))}</div><div style="font-size:12px;color:#9A8F80;margin-top:3px">skupaj točk</div></td><td style="text-align:center;padding:0 18px"><div style="font-weight:800;font-size:22px;color:${INK}">${esc(String(d.toReward))}</div><div style="font-size:12px;color:#9A8F80;margin-top:3px">do nagrade</div></td></tr></table></div>` +
    `<div style="background:#FDFAF5;border-radius:12px;padding:18px 20px"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:6px">NAPREDEK KARTICE</div>${stamps(d.stampsFilled, d.stampsTotal, c)}<p style="margin:8px 0 0;font-size:13px;color:${MUTED}">Še <b>${esc(String(Math.max(0, d.stampsTotal - d.stampsFilled)))}</b> žigov do: <b>${esc(d.rewardName)}</b></p></div>` +
    ctaCenter("Poglej svojo kartico →", b.ctaUrl || "#", INK),
  );
}

export function emailCouponEarned(b: GuestBase, d: { guestName?: string; rewardName: string; couponCode: string; stampsTotal: number; expires?: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, `🎉 Čestitke! Zaslužil si ${d.rewardName}!`,
    `<div style="text-align:center;margin-bottom:20px">${big("🎉")}${h1("Kartica je polna!")}${p(`Čestitke${d.guestName ? ", " + esc(d.guestName) : ""}! Zbral si vseh ${esc(String(d.stampsTotal))} žigov in zaslužil brezplačno nagrado.`)}</div>` +
    `<div style="text-align:center">${stamps(d.stampsTotal, d.stampsTotal, c)}</div>` +
    notice("Tvoja nagrada je aktivna in čaka na unovčitev. Pokaži jo pri blagajni.", "green") +
    couponBlock(d.rewardName, "Nagrada za polno kartico", d.couponCode, c) +
    (d.expires ? `<p style="font-size:12.5px;color:#9A8F80;margin:0 0 4px;text-align:center">Kupon velja do: <b style="color:#5A4E43">${esc(d.expires)}</b></p>` : "") +
    ctaCenter("Unovči kupon →", b.ctaUrl || "#", c),
  );
}

export function emailCouponRedeem(b: GuestBase, d: { guestName?: string; rewardName: string; couponCode: string; sub?: string; expires?: string; daysLeft?: number | string }): string {
  const c = color(b.brandColor);
  return guestShell(b, "☕ Tvoj kupon čaka — ne pozabi ga unovčiti!",
    h1("Tvoja nagrada čaka") +
    p(`Hej${d.guestName ? ", " + esc(d.guestName) : ""}! Imaš neunovčen kupon pri <b>${esc(b.venueName)}</b>. Pridi ga unovčit, preden poteče.`) +
    couponBlock(d.rewardName, d.sub || "Tvoja nagrada", d.couponCode, c) +
    (d.expires ? notice(`⏰ Kupon poteče <b>${esc(d.expires)}</b>${d.daysLeft != null ? `. Ostane ti še <b>${esc(String(d.daysLeft))}</b> dni!` : "."}`, "amber") : "") +
    ctaCenter("Unovči zdaj →", b.ctaUrl || "#", c),
  );
}

export function emailWelcome(b: GuestBase, d: { guestName?: string; rewardName: string; stampsTotal: number; pointRewards?: { name: string; points: number; image?: string | null }[] }): string {
  const c = color(b.brandColor);
  const rewards = (d.pointRewards || []).slice(0, 5);
  const rewardsBlock = rewards.length
    ? `<div style="margin:18px 0 4px"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:10px">UNOVČI S TOČKAMI</div>` +
      rewards.map((r) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr><td valign="middle" style="width:46px">${r.image ? `<img src="${esc(r.image)}" width="44" height="44" alt="" style="width:44px;height:44px;border-radius:11px;object-fit:cover;display:block">` : `<div style="width:44px;height:44px;border-radius:11px;background:#F0E8DC;text-align:center;line-height:44px;font-size:22px">🎁</div>`}</td><td valign="middle" style="padding-left:12px"><div style="font-weight:700;font-size:15px;color:${INK}">${esc(r.name)}</div></td><td valign="middle" align="right" style="white-space:nowrap"><span style="display:inline-block;background:#FCEFD8;color:#B4781E;border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:800">${esc(String(r.points))} točk</span></td></tr></table>`).join("") +
      `</div>`
    : "";
  return guestShell(b, `Dobrodošel pri ${b.venueName}! 👋`,
    `${big("👋")}${h1(`Dobrodošel${d.guestName ? ", " + esc(d.guestName) : ""}!`)}${p(`Veselimo se, da si del naše skupnosti pri <b>${esc(b.venueName)}</b>. Vsak obisk zdaj prinaša žig in točke — zberi jih in unovči nagrado!`)}` +
    stepList([
      { title: "Skeniraj račun", sub: "Ob vsakem obisku skeniraj račun in pridobi žig + točke." },
      { title: "Zberi žige", sub: "Ko napolniš kartico, zasluži brezplačno nagrado." },
      { title: "Unovči nagrade", sub: "Pokaži kupon pri blagajni in si privošči zasluženo." },
    ]) +
    `<div style="background:#F8F2EA;border-radius:12px;padding:18px 20px;margin:16px 0"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:6px">TVOJA KARTICA</div>${stamps(0, d.stampsTotal, c)}<p style="margin:10px 0 0;font-size:13px;color:${MUTED}">Zberi ${esc(String(d.stampsTotal))} žigov in zasluži: <b>${esc(d.rewardName)}</b></p></div>` +
    rewardsBlock +
    ctaCenter("Odpri svojo kartico →", b.ctaUrl || "#", INK),
  );
}

// ─────────────────────────── GOSTJE · AVTOMATIZACIJE ───────────────────────────
export function emailWeMissYou(b: GuestBase, d: { guestName?: string; days: number | string; lastVisit?: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, `Pogrešamo te pri ${b.venueName} 😔`,
    `<div style="text-align:center;margin-bottom:24px">${big("😔")}${h1("Že dolgo te ni bilo...")}${p(`Hej${d.guestName ? ", " + esc(d.guestName) : ""}! Minilo je že ${esc(String(d.days))} dni od tvojega zadnjega obiska pri <b>${esc(b.venueName)}</b>. Pogrešamo te!`)}</div>` +
    (d.lastVisit ? `<div style="background:#F8F2EA;border-radius:16px;padding:24px;text-align:center;margin-bottom:20px"><div style="font-size:11px;font-weight:700;color:#9A8F80;letter-spacing:0.06em;margin-bottom:8px">ZADNJI OBISK</div><div style="font-weight:800;font-size:28px;color:${INK}">${esc(d.lastVisit)}</div></div>` : "") +
    notice("Samo za tebe: pridi ta teden in zasluži <b>dvojne točke</b> za naslednji obisk! 🎁", "amber") +
    ctaCenter("Obišči nas →", b.ctaUrl || "#", c),
  );
}

export function emailAnniversary(b: GuestBase, d: { guestName?: string; visits: number | string; totalPoints: number | string; rewards: number | string; giftName: string; couponCode: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, `🎂 Že eno leto skupaj — ${b.venueName} te razvaja!`,
    `<div style="text-align:center;margin-bottom:24px">${big("🎂")}${h1(`Že eno leto skupaj${d.guestName ? ", " + esc(d.guestName) : ""}!`)}${p(`Pred natanko enim letom si se prvič pridružil <b>${esc(b.venueName)}</b>. V tem letu je bilo lepo — hvala, da si z nami!`)}</div>` +
    statBox([{ value: String(d.visits), label: "obiskov" }, { value: String(d.totalPoints), label: "točk skupaj" }, { value: String(d.rewards), label: "nagrad" }]) +
    hline() + h2("Obletniško darilo 🎁") + p("Ker si z nami že eno leto, ti poklanjamo posebno darilo — samo za tebe.") +
    couponBlock(d.giftName, "Obletniška nagrada · velja 14 dni", d.couponCode, c) +
    ctaCenter("Unovči obletniško darilo →", b.ctaUrl || "#", c),
  );
}

export function emailBirthdayGuest(b: GuestBase, d: { guestName?: string; giftName: string; couponCode: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, "🎁 Vse najboljše! Rojstnodnevno darilo čaka tebe.",
    `<div style="text-align:center;margin-bottom:24px">${big("🎂")}${h1(`Vse najboljše${d.guestName ? ", " + esc(d.guestName) : ""}!`)}${p(`Celotna ekipa pri <b>${esc(b.venueName)}</b> ti želi srečen rojstni dan! Poklanjamo ti posebno rojstnodnevno darilo.`)}</div>` +
    couponBlock(d.giftName, "Rojstnodnevni kupon · velja 7 dni", d.couponCode, c) +
    notice("Kupon pokaži pri blagajni. Velja samo na tvoj rojstni dan in 7 dni po njem.", "green") +
    ctaCenter("Unovči darilo →", b.ctaUrl || "#", c),
  );
}

export function emailBirthdayVenue(b: GuestBase, d: { years: number | string; offer: string; offerDesc: string; date?: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, `🎊 ${b.venueName} praznuje! Posebna ponudba.`,
    `<div style="text-align:center;margin-bottom:24px">${big("🎊")}${h1(`${esc(b.venueName)} praznuje ${esc(String(d.years))} let!`)}${p(`Hvala, da ste del naše zgodbe! Ob obletnici lokala vas razvajamo s posebno ponudbo${d.date ? " — samo " + esc(d.date) : ""}.`)}</div>` +
    `<div style="background:${c};border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;color:#fff"><div style="font-size:13px;font-weight:700;opacity:0.75;margin-bottom:8px">POSEBNA PONUDBA</div><div style="font-size:48px;font-weight:800;line-height:1;margin-bottom:8px">${esc(d.offer)}</div><div style="font-size:15px;opacity:0.85">${esc(d.offerDesc)}</div></div>` +
    ctaCenter("Uveljavi ponudbo →", b.ctaUrl || "#", INK),
  );
}

// ─────────────────────────── KAMPANJE ───────────────────────────
export function emailCampaign(b: GuestBase, d: { heading: string; message: string; couponName?: string; couponCode?: string; offerNote?: string }): string {
  const c = color(b.brandColor);
  return guestShell(b, d.heading,
    `${big("🏷")}${h1(esc(d.heading))}${textToHtml(d.message)}` +
    (d.couponName ? couponBlock(d.couponName, "Kupon zate", d.couponCode || "—", c) : "") +
    (d.offerNote ? `<div style="background:#F8F2EA;border-radius:14px;padding:16px 22px;border-left:4px solid ${c};margin:18px 0;font-size:14px;color:#5A4E43;line-height:1.6">${esc(d.offerNote)}</div>` : "") +
    ctaCenter("Poglej ponudbo →", b.ctaUrl || "#", c),
  );
}

export function emailReviewThanks(b: GuestBase, d: { guestName?: string; stars: number; comment?: string; bonusPoints?: number | string }): string {
  const starRow = `<div style="text-align:center;margin:12px 0;font-size:26px">${"⭐".repeat(Math.max(1, Math.min(5, d.stars)))}</div>`;
  return guestShell(b, "⭐ Hvala za vašo oceno!",
    `<div style="text-align:center;margin-bottom:20px">${big("⭐")}${h1(`Hvala za oceno${d.guestName ? ", " + esc(d.guestName) : ""}!`)}${p("Cenimo vaš čas in mnenje. Vaša ocena nam pomaga izboljšati storitve za vse goste.")}${starRow}${d.comment ? `<div style="font-size:14px;color:${MUTED};font-style:italic;margin-top:4px">"${esc(d.comment)}"</div>` : ""}</div>` +
    (d.bonusPoints != null ? hline() + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4EE;border-radius:12px"><tr><td style="width:46px;padding:18px 0 18px 20px;font-size:28px">🎁</td><td style="padding:18px 20px"><div style="font-weight:700;font-size:15px;color:#2A5527">Nagrada za oceno</div><div style="font-size:13.5px;color:#4A7045;margin-top:3px">Dobil si <b>${esc(String(d.bonusPoints))}</b> bonus točk za poslano oceno!</div></td></tr></table>` : "") +
    ctaCenter("Poglej svojo kartico →", b.ctaUrl || "#", INK),
  );
}

// ─────────────────────────── ADMINISTRACIJA · SaaS ───────────────────────────
export type AdminBase = { ctaUrl?: string; unsubUrl?: string };

export function emailAdminPurchase(d: AdminBase & { venueName: string; plan: string; amount: string; date: string; nextRenewal: string }): string {
  return adminShell("✅ Hvala za naročnino Loyavi · Potrditev plačila",
    `<div style="text-align:center;margin-bottom:24px">${big("✅")}${h1("Hvala za nakup!")}${p(`Vaša naročnina za <b>${esc(d.venueName)}</b> je aktivna. Dostop do vseh funkcij je takoj na voljo.`)}</div>` +
    kvRows("PODROBNOSTI NAROČNINE", [["Paket", d.plan], ["Znesek", d.amount], ["Datum naročnine", d.date], ["Naslednje podaljšanje", d.nextRenewal]]) +
    ctaCenter("Odpri nadzorno ploščo →", d.ctaUrl || "#", INK),
    d.unsubUrl,
  );
}

export function emailAdminExpiring(d: AdminBase & { venueName: string; plan: string; expiresOn: string }): string {
  return adminShell("⏰ Vaša Loyavi naročnina kmalu poteče — ukrepajte",
    `${big("⏰")}${h1("Naročnina kmalu poteče")}${p(`Vaša naročnina za <b>${esc(d.venueName)}</b> poteče <b>${esc(d.expiresOn)}</b>. Da bi ohranili neprekinjen dostop, prosimo podaljšajte naročnino.`)}` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF8EE;border-radius:14px;border:1px solid #E8D9A0;margin-bottom:8px"><tr><td style="width:44px;padding:18px 0 18px 20px;font-size:22px;vertical-align:top">⚠️</td><td style="padding:18px 20px"><div style="font-weight:700;font-size:15px;color:#7A5500">Opozorilo</div><div style="font-size:13.5px;color:#7A5500;margin-top:4px;line-height:1.55">Po poteku gostje ne bodo mogli skenirati računov in kartice bodo neaktivne.</div></td></tr></table>` +
    kvRows("NAROČNINA", [["Paket", d.plan], ["Datum poteka", d.expiresOn, "#8B3030"]]) +
    ctaCenter("Podaljšaj naročnino →", d.ctaUrl || "#", INK),
    d.unsubUrl,
  );
}

export function emailAdminRenewal(d: AdminBase & { venueName: string; plan: string; amount: string; date: string; method?: string }): string {
  return adminShell("🔄 Loyavi naročnina se samodejno podaljša",
    `${big("🔄")}${h1("Samodejno podaljšanje")}${p(`Vaša naročnina za <b>${esc(d.venueName)}</b> se bo samodejno podaljšala <b>${esc(d.date)}</b>. Zaračunali bomo <b>${esc(d.amount)}</b> na shranjeno plačilno sredstvo.`)}` +
    kvRows("PODROBNOSTI PODALJŠANJA", [["Paket", d.plan], ["Znesek", d.amount], ["Datum zaračunavanja", d.date], ["Plačilno sredstvo", d.method || "kartica"]]) +
    notice("Če ne želite podaljšanja, ga preklicite vsaj 24 ur pred datumom zaračunavanja.", "neutral") +
    ctaCenter("Upravljaj naročnino →", d.ctaUrl || "#", INK),
    d.unsubUrl,
  );
}

export function emailOwnerWelcome(d: AdminBase & { ownerName?: string; venueName: string }): string {
  return adminShell("🏪 Dobrodošli v Loyavi! Začnite z nastavitvijo.",
    `<div style="text-align:center;margin-bottom:28px">${big("👋")}${h1(`Dobrodošli${d.ownerName ? ", " + esc(d.ownerName) : ""}!`)}${p(`Veseli smo, da ste izbrali Loyavi za kartico zvestobe lokala <b>${esc(d.venueName)}</b>. Vse je pripravljeno za začetek.`)}</div>` +
    stepList([
      { title: "Nastavi kartico", sub: "Določi ime lokala, barvo, logo in število žigov za nagrado." },
      { title: "Deli z gosti", sub: "Gostje skenirajo QR ali obiščejo tvojo stran in se prijavijo." },
      { title: "Sledi in nagrajuj", sub: "V nadzorni plošči vidiš vse goste, točke in kupone v realnem času." },
    ]) +
    notice("🎁 Brezplačno preizkusno obdobje je aktivno. Vse funkcije so na voljo brez omejitev.", "green") +
    ctaCenter("Začni z nastavitvijo →", d.ctaUrl || "#", INK),
    d.unsubUrl,
  );
}

export function emailOwnerUpdate(d: AdminBase & { heading: string; intro: string; features?: { icon: string; title: string; sub: string }[]; outro?: string; ctaText?: string }): string {
  return adminShell(d.heading,
    `${big("🚀")}${h1(esc(d.heading))}${textToHtml(d.intro)}` +
    (d.features && d.features.length ? featureList(d.features) : "") +
    (d.outro ? hline() + `<div style="font-size:13.5px;color:${MUTED};text-align:center;margin-bottom:20px">${esc(d.outro)}</div>` : "") +
    ctaCenter(d.ctaText || "Preizkusi novosti →", d.ctaUrl || "#", INK),
    d.unsubUrl,
  );
}

/** Generičen owner mail (super-admin → lastniki, poljubno sporočilo). */
export function emailOwnerMessage(d: AdminBase & { heading: string; message: string; ctaText?: string }): string {
  return adminShell(d.heading,
    `${big("📣")}${h1(esc(d.heading))}${textToHtml(d.message)}` +
    (d.ctaText ? ctaCenter(d.ctaText, d.ctaUrl || "#", INK) : ""),
    d.unsubUrl,
  );
}

/** Ohranjeno: preprosta branded predloga (fallback). */
export function brandedEmail(o: { brandColor?: string | null; brandName: string; heading: string; bodyHtml: string; ctaText?: string; ctaUrl?: string; footer?: string }): string {
  return guestShell({ venueName: o.brandName, brandColor: o.brandColor }, o.heading,
    h1(esc(o.heading)) + o.bodyHtml + (o.ctaText ? ctaCenter(o.ctaText, o.ctaUrl || "#", color(o.brandColor)) : ""),
  );
}
