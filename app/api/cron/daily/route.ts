import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { emailConfigured } from "@/lib/email";
import { bestOwnerPlan, PLANS } from "@/lib/plans";
import { notifyMarketing, notifyAdminExpiring } from "@/lib/notify";
import type { MarketingKind } from "@/lib/emailTemplate";
import { grantCoupon, type CouponSource } from "@/lib/coupons";
import { unsubscribedIds } from "@/lib/unsub";
import { venueHasAccess } from "@/lib/venues";
import { ownerAccess } from "@/lib/access";
import { localDay } from "@/lib/guest";
import { dateShort } from "@/lib/sl";
import type { Venue, Automation, Automations } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 864e5;
const PAGE = 1000; // PostgREST vrne največ 1000 vrstic na zahtevek
const CAP = 1000; // največ sporočil na en zagon

type Cust = { id: string; email: string; created_at: string };

// Dnevni cron: samodejna sporočila lokalov (pogrešamo te, rojstni dan gosta, obletnica,
// praznik lokala) in opomnik lastniku pred iztekom preizkusa ali naročnine.
// Vercel cron pošlje Authorization: Bearer <CRON_SECRET>.
export async function GET(req: Request) {
  // Brez nastavljenega CRON_SECRET je pot vedno zavrnjena.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) return NextResponse.json({ ok: true, skipped: "email not configured" });

  const db = getServiceClient();
  const now = Date.now();
  const todayMMDD = localDay().slice(5); // datum v Sloveniji

  const { data: venueRows } = await db.from("venues").select("*");
  const venues = (venueRows ?? []) as Venue[];
  let sent = 0;

  async function sentRecently(kind: string, venueId: string, customerId: string | null, withinDays: number) {
    let q = db.from("email_log").select("id").eq("kind", kind).eq("venue_id", venueId).gte("created_at", new Date(now - withinDays * DAY).toISOString()).limit(1);
    q = customerId ? q.eq("customer_id", customerId) : q.is("customer_id", null);
    const { data } = await q;
    return (data ?? []).length > 0;
  }
  const logSent = (kind: string, venueId: string, customerId: string | null) => db.from("email_log").insert({ kind, venue_id: venueId, customer_id: customerId });

  async function customersOf(venueId: string, filter?: { birthday: string }): Promise<Cust[]> {
    const out: Cust[] = [];
    for (let from = 0; from < 10000; from += PAGE) {
      let q = db.from("customers").select("id, email, created_at").eq("venue_id", venueId).not("email", "is", null);
      if (filter) q = q.eq("birthday", filter.birthday);
      const { data } = await q.order("created_at", { ascending: true }).range(from, from + PAGE - 1);
      const rows = (data ?? []) as Cust[];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out;
  }

  /** Pošlje eno samodejno sporočilo; ob uspehu doda resničen kupon v gostovo denarnico. */
  async function deliver(v: Venue, c: Cust, kind: MarketingKind, a: Automation, fallback: string, source: CouponSource) {
    const couponName = a.coupon && a.couponName?.trim() ? a.couponName.trim() : undefined;
    const ok = await notifyMarketing(v, c, kind, { message: a.message?.trim() || fallback, couponName });
    if (!ok) return false;
    if (couponName) {
      try {
        await grantCoupon(db, { venueId: v.id, customerId: c.id, name: couponName, source, status: "ready", validDays: 30 });
      } catch (e) {
        console.error("[cron coupon]", e);
      }
    }
    sent++;
    return true;
  }

  // ── LASTNIK: preizkus ali preklicana naročnina se izteče čez približno 3 dni ──
  // Naročnina je na ravni lastnika (živi na njegovem prvem lokalu), zato gledamo lastnika, ne lokala.
  const byOwner = new Map<string, Venue[]>();
  for (const v of venues) if (v.owner_user_id) byOwner.set(v.owner_user_id, [...(byOwner.get(v.owner_user_id) ?? []), v]);
  for (const [ownerId, list] of byOwner) {
    if (sent >= CAP) break;
    const bill = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
    const plan = bestOwnerPlan(list);
    const access = ownerAccess(plan, bill, now);
    const trial = access.state === "trial";
    const ending = trial || (access.state === "active" && !!bill.cancel_at_period_end);
    if (!ending || !access.until) continue;
    const days = Math.ceil((new Date(access.until).getTime() - now) / DAY);
    if (days < 2 || days > 4 || (await sentRecently("admin_expiring", bill.id, null, 10))) continue;
    const { data: owner } = await db.auth.admin.getUserById(ownerId);
    await notifyAdminExpiring(owner?.user?.email, { venueName: bill.name, plan: PLANS[plan]?.label ?? "", expiresOn: dateShort(access.until), trial });
    await logSent("admin_expiring", bill.id, null);
    sent++;
  }

  for (const v of venues) {
    if (sent >= CAP) break;

    const autos = (v.automations ?? null) as Automations | null;
    const on = (k: string) => (autos?.[k]?.enabled ? autos[k] : null);
    const bday = on("guest_birthday");
    const feast = on("venue_birthday");
    const miss = on("inactive");
    const anniv = on("anniversary");
    if (!bday && !feast && !miss && !anniv) continue;
    // lokal brez veljavnega dostopa (iztekel preizkus) ne pošilja
    if (!(await venueHasAccess(db, v))) continue;

    const off = await unsubscribedIds(db, v.id);

    // ── ROJSTNI DAN GOSTA ──
    if (bday) {
      for (const c of await customersOf(v.id, { birthday: todayMMDD })) {
        if (sent >= CAP) break;
        if (off.has(c.id) || (await sentRecently("birthday_guest", v.id, c.id, 300))) continue;
        if (await deliver(v, c, "birthday_guest", bday, "Vse najboljše. Ob prazniku te pri nas čaka darilo.", "birthday")) await logSent("birthday_guest", v.id, c.id);
      }
    }

    if (!feast && !miss && !anniv) continue;
    const custs = await customersOf(v.id);

    // ── PRAZNIK LOKALA (datum MM-DD) ──
    if (feast && feast.date && feast.date.slice(-5) === todayMMDD && !(await sentRecently("birthday_venue", v.id, null, 300))) {
      await logSent("birthday_venue", v.id, null); // najprej zapis, da ponovni zagon ne podvoji pošiljanja
      for (const c of custs) {
        if (sent >= CAP) break;
        if (off.has(c.id)) continue;
        await deliver(v, c, "birthday_venue", feast, "Danes praznujemo in to želimo deliti s tabo.", "campaign");
      }
    }

    // ── POGREŠAMO TE + OBLETNICA ──
    if (miss || anniv) {
      const lastScan = new Map<string, string>();
      if (miss) {
        for (let from = 0; from < 20000; from += PAGE) {
          const { data } = await db.from("scans").select("customer_id, created_at").eq("venue_id", v.id).order("created_at", { ascending: false }).range(from, from + PAGE - 1);
          const rows = (data ?? []) as { customer_id: string; created_at: string }[];
          for (const s of rows) if (!lastScan.has(s.customer_id)) lastScan.set(s.customer_id, s.created_at);
          if (rows.length < PAGE) break;
        }
      }
      const missDays = Math.min(365, Math.max(7, miss?.days || 30));
      for (const c of custs) {
        if (sent >= CAP) break;
        if (off.has(c.id)) continue;
        // pogrešamo te: zadnji obisk točno N dni nazaj (enodnevno okno, da pošljemo enkrat)
        const ls = miss ? lastScan.get(c.id) : undefined;
        if (miss && ls && Math.floor((now - new Date(ls).getTime()) / DAY) === missDays && !(await sentRecently("we_miss_you", v.id, c.id, 30))) {
          if (await deliver(v, c, "we_miss_you", miss, "Nekaj časa te ni bilo pri nas. Pridi spet, veseli te bomo.", "campaign")) await logSent("we_miss_you", v.id, c.id);
        }
        // obletnica: eno leto od dneva, ko je gost dodal kartico
        if (anniv) {
          const d = Math.floor((now - new Date(c.created_at).getTime()) / DAY);
          if (d >= 365 && d <= 366 && !(await sentRecently("anniversary", v.id, c.id, 300))) {
            if (await deliver(v, c, "anniversary", anniv, "Minilo je eno leto, odkar zbiraš žige pri nas. Hvala, da se vračaš.", "campaign")) await logSent("anniversary", v.id, c.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, venues: venues.length, sent });
}
