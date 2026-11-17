import { NextResponse } from "next/server";
import * as T from "@/lib/emailTemplate";
import { getCurrentUser } from "@/lib/supabase/ssrServer";
import { isSuperadmin } from "@/lib/superadmin";

// Predogled predlog v brskalniku, brez pošiljanja. Na produkciji samo za superadmina.
// Primer: /api/email-preview?type=welcome&venue=Kavarna%20Lipa&color=%23FF7A3D
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentUser();
    if (!isSuperadmin(user?.email)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") || "welcome";
  const venueName = sp.get("venue") || "Kavarna Lipa";
  const b: T.GuestBase = { venueName, brandColor: sp.get("color") || "#FF7A3D", ctaUrl: "#" };
  const m: T.GuestBase = { ...b, unsubUrl: "#" };
  const a = { ctaUrl: "#" };

  let html: string;
  switch (type) {
    case "coupon_earned": html = T.emailCouponEarned(b, { goal: 8, reward: "Brezplačna kava" }); break;
    case "we_miss_you": html = T.emailMarketing(m, "we_miss_you", { message: "Nekaj časa te ni bilo pri nas. Pridi spet, ob naslednjem obisku te čaka presenečenje.", couponName: "Popust 10 %" }); break;
    case "birthday_guest": html = T.emailMarketing(m, "birthday_guest", { message: "Vse najboljše. Ob prazniku te pri nas čaka darilo.", couponName: "Kos torte po izbiri" }); break;
    case "anniversary": html = T.emailMarketing(m, "anniversary", { message: "Minilo je eno leto, odkar zbiraš žige pri nas. Hvala, da se vračaš." }); break;
    case "birthday_venue": html = T.emailMarketing(m, "birthday_venue", { message: "Danes praznujemo pet let.\n\nPridi na kavo, prvo častimo mi.", couponName: "Brezplačna kava" }); break;
    case "campaign": html = T.emailCampaign(m, { heading: "V soboto odpiramo teraso", message: "Od sobote naprej nas najdeš tudi zunaj.\n\nPrvi dan vse limonade postrežemo s popustom.", couponName: "Limonada s popustom 20 %" }); break;
    case "owner_welcome": html = T.emailOwnerWelcome({ ...a, venueName }); break;
    case "admin_purchase": html = T.emailAdminPurchase({ ...a, venueName, plan: "Lokal", amount: "49,99 €", date: "16. 11. 2026", nextRenewal: "16. 12. 2026" }); break;
    case "admin_expiring": html = T.emailAdminExpiring({ ...a, venueName, plan: "Lokal", expiresOn: "19. 11. 2026", trial: sp.get("trial") !== "0" }); break;
    case "lead": html = T.emailLead({ ...a, heading: "Povpraševanje za več lokalov", rows: [["Lokal", venueName], ["Račun", "lastnik@primer.si"], ["Kraj", "Ljubljana"], ["Število lokalov", "3"]], message: "Imamo tri kavarne v Ljubljani. Začeli bi radi v vseh hkrati." }); break;
    case "owner_message": html = T.emailOwnerMessage({ ...a, heading: "Novo v Loyavi", message: "Dodali smo samodejna sporočila za rojstne dneve gostov.\n\nVklopiš jih v razdelku Marketing." }); break;
    default: html = T.emailWelcome(b, { goal: 8, reward: "Brezplačna kava", checkin: "both" });
  }
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
