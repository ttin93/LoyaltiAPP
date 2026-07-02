import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { emailConfigured } from "@/lib/email";
import { bestOwnerPlan, PLANS } from "@/lib/plans";
import { notifyWeMissYou, notifyAnniversary, notifyBirthdayVenue, notifyAdminExpiring } from "@/lib/notify";
import type { Venue, Automations } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 864e5;
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });

// Dnevni cron: avtomatizacije (pogrešamo te / obletnica / rojstni dan lokala) + opomnik za potek naročnine.
// Varovalo: če RESEND ni nastavljen, ne naredi nič (da ne piše lažnih dedup zapisov).
// Vercel cron pošlje Authorization: Bearer <CRON_SECRET>, če je env nastavljen.
export async function GET(req: Request) {
  // Fail-closed: brez nastavljenega CRON_SECRET je ruta vedno zavrnjena (da je ne more sprožiti kdorkoli).
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) return NextResponse.json({ ok: true, skipped: "email not configured" });

  const db = getServiceClient();
  const now = Date.now();
  const todayMMDD = new Date().toISOString().slice(5, 10);

  const [{ data: venues }, usersRes] = await Promise.all([
    db.from("venues").select("*"),
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const emailById = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? null]));

  // dedup: je bil tak mail že poslan v zadnjih X dneh?
  async function sentRecently(kind: string, venueId: string, customerId: string | null, withinDays: number) {
    let q = db.from("email_log").select("id").eq("kind", kind).eq("venue_id", venueId).gte("created_at", new Date(now - withinDays * DAY).toISOString()).limit(1);
    q = customerId ? q.eq("customer_id", customerId) : q.is("customer_id", null);
    const { data } = await q.maybeSingle();
    return !!data;
  }
  async function logSent(kind: string, venueId: string, customerId: string | null) {
    await db.from("email_log").insert({ kind, venue_id: venueId, customer_id: customerId });
  }

  let sent = 0;
  const cap = 1000; // varovalo proti runaway

  for (const vrow of (venues ?? []) as Venue[]) {
    if (sent >= cap) break;
    const v = vrow;

    // ── ADMIN: naročnina/trial poteče čez ~3 dni ──
    const paying = (v.plan ?? "free") !== "free" && v.subscription_status !== "canceled";
    const until = paying ? v.current_period_end : v.trial_ends_at;
    if (until) {
      const days = Math.ceil((new Date(until).getTime() - now) / DAY);
      if (days >= 2 && days <= 4 && !(await sentRecently("admin_expiring", v.id, null, 10))) {
        const plan = bestOwnerPlan([v]);
        await notifyAdminExpiring(emailById.get(v.owner_user_id || "") || null, { venueName: v.name, plan: PLANS[plan]?.label ?? "—", expiresOn: fmtDay(until) });
        await logSent("admin_expiring", v.id, null);
        sent++;
      }
    }

    const autos = (v.automations ?? null) as Automations | null;
    if (!autos) continue;

    // ── ROJSTNI DAN LOKALA (datum MM-DD) ──
    const bv = autos.venue_birthday;
    if (bv?.enabled && bv.date && bv.date.slice(-5) === todayMMDD && !(await sentRecently("birthday_venue", v.id, null, 300))) {
      const { data: custs } = await db.from("customers").select("email").eq("venue_id", v.id).not("email", "is", null).limit(2000);
      const years = "";
      for (const c of custs ?? []) {
        if (sent >= cap) break;
        await notifyBirthdayVenue(v, c.email as string, { years, offer: bv.couponName || "Posebna ponudba", offerDesc: bv.message || "" });
        sent++;
      }
      await logSent("birthday_venue", v.id, null);
    }

    // ── POGREŠAMO TE + OBLETNICA (per stranka) ──
    const miss = autos.inactive;
    const anniv = autos.anniversary;
    if ((miss?.enabled && (miss.days || 0) > 0) || anniv?.enabled) {
      const { data: custs } = await db.from("customers").select("id, email, created_at").eq("venue_id", v.id).not("email", "is", null).limit(2000);
      // zadnji sken na stranko
      const { data: scans } = await db.from("scans").select("customer_id, created_at").eq("venue_id", v.id).order("created_at", { ascending: false }).limit(8000);
      const lastScan = new Map<string, string>();
      for (const s of scans ?? []) if (!lastScan.has(s.customer_id)) lastScan.set(s.customer_id, s.created_at);

      for (const c of custs ?? []) {
        if (sent >= cap) break;
        // pogrešamo te: zadnji sken točno N dni nazaj (okno 1 dan, da pošljemo enkrat)
        if (miss?.enabled && (miss.days || 0) > 0) {
          const ls = lastScan.get(c.id);
          if (ls) {
            const d = Math.floor((now - new Date(ls).getTime()) / DAY);
            if (d === (miss.days || 0) && !(await sentRecently("we_miss_you", v.id, c.id, 30))) {
              await notifyWeMissYou(v, c.email as string, { days: d, lastVisit: fmtDay(ls) });
              await logSent("we_miss_you", v.id, c.id);
              sent++;
            }
          }
        }
        // obletnica: ~1 leto od registracije
        if (anniv?.enabled && c.created_at) {
          const d = Math.floor((now - new Date(c.created_at).getTime()) / DAY);
          if (d >= 365 && d <= 366 && !(await sentRecently("anniversary", v.id, c.id, 300))) {
            await notifyAnniversary(v, c.email as string, { visits: "—", totalPoints: "—", rewards: "—", giftName: anniv.couponName || "Obletniško darilo" });
            await logSent("anniversary", v.id, c.id);
            sent++;
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, venues: (venues ?? []).length, sent });
}
