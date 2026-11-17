import { NextResponse } from "next/server";
import { after } from "next/server";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { errMsg } from "@/lib/loyalty";
import { notifyAdminLead } from "@/lib/notify";

const str = (v: unknown, max: number): string | null => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};

// POST /api/lead — zajem povpraševanja iz kontaktnega obrazca
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const lead = {
      name: str(b.name, 80),
      venue: str(b.venue, 80),
      email: str(b.email, 120),
      phone: str(b.phone, 30),
      venue_type: str(b.venueType, 40),
      city: str(b.city, 60),
      guests_est: str(b.guestsEst, 40),
      heard: str(b.heard, 80),
      message: str(b.message, 2000),
    };
    if (!lead.email && !lead.phone) {
      return NextResponse.json({ ok: false, error: "Vpiši vsaj email ali telefon." }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }
    const db = getServiceClient();
    const { error } = await db.from("leads").insert(lead);
    if (error) throw error;
    // ekipa dobi obvestilo po pošti, sicer povpraševanje obleži v bazi
    after(() =>
      notifyAdminLead({
        heading: lead.heard === "veriga" ? "Povpraševanje za več lokalov" : "Sporočilo s kontaktnega obrazca",
        rows: [
          ["Ime", lead.name ?? "ni vpisano"],
          ["Lokal", lead.venue ?? "ni vpisano"],
          ["Elektronski naslov", lead.email ?? "ni vpisano"],
          ["Telefon", lead.phone ?? "ni vpisano"],
        ],
        message: lead.message ?? "",
        replyTo: lead.email,
      }),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errMsg(e) }, { status: 500 });
  }
}
