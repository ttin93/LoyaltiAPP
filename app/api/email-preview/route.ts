import { NextResponse } from "next/server";
import * as T from "@/lib/emailTemplate";

// Predogled email predlog v brskalniku (BREZ pošiljanja / Resend) — za screenshot v video.
// Npr.: /api/email-preview?type=we_miss_you&venue=Kavarna%20Lipa&color=%23C4623D
export const runtime = "nodejs";

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") || "we_miss_you";
  const venueName = sp.get("venue") || "Kavarna Lipa";
  const brandColor = sp.get("color") || "#C4623D";
  const name = sp.get("name") || "Ana";
  const b = { venueName, brandColor, ctaUrl: "#" };

  let html = "";
  switch (type) {
    case "welcome": html = T.emailWelcome(b, { guestName: name, rewardName: "Brezplačna kava", stampsTotal: 10, pointRewards: [{ name: "Cappuccino", points: 120 }, { name: "Kos domače torte", points: 250 }, { name: "Sendvič po izbiri", points: 300 }] }); break;
    case "points": html = T.emailPoints(b, { points: 15, totalPoints: 320, toReward: 40, stampsFilled: 7, stampsTotal: 10, rewardName: "Brezplačna kava" }); break;
    case "coupon_earned": html = T.emailCouponEarned(b, { guestName: name, rewardName: "Brezplačna kava", couponCode: "LIPA-9F3A", stampsTotal: 10, expires: "08.07.2026" }); break;
    case "coupon_redeem": html = T.emailCouponRedeem(b, { guestName: name, rewardName: "Brezplačna kava", couponCode: "LIPA-9F3A", expires: "08.07.2026", daysLeft: 5 }); break;
    case "we_miss_you": html = T.emailWeMissYou(b, { guestName: name, days: 30, lastVisit: "24.05.2026" }); break;
    case "anniversary": html = T.emailAnniversary(b, { guestName: name, visits: 24, totalPoints: 360, rewards: 3, giftName: "Brezplačna torta", couponCode: "LIPA-1Y2" }); break;
    case "birthday_guest": html = T.emailBirthdayGuest(b, { guestName: name, giftName: "Brezplačna torta", couponCode: "BDAY-7K2" }); break;
    case "birthday_venue": html = T.emailBirthdayVenue(b, { years: 5, offer: "−20 %", offerDesc: "na vse pijače, samo danes", date: "25.06." }); break;
    case "campaign": html = T.emailCampaign(b, { heading: "Vikend −20 %", message: `Ta vikend vse kave −20 %.\n\nSe vidimo pri ${venueName}!`, couponName: "−20 %", couponCode: "WKND-20" }); break;
    case "review_thanks": html = T.emailReviewThanks(b, { guestName: name, stars: 5, comment: "Super kava in vzdušje!", bonusPoints: 20 }); break;
    case "admin_purchase": html = T.emailAdminPurchase({ venueName, plan: "Grow", amount: "79,99 €", date: "25.06.2026", nextRenewal: "25.07.2026" }); break;
    case "admin_expiring": html = T.emailAdminExpiring({ venueName, plan: "Grow", expiresOn: "01.07.2026" }); break;
    case "admin_renewal": html = T.emailAdminRenewal({ venueName, plan: "Grow", amount: "79,99 €", date: "25.07.2026" }); break;
    case "owner_welcome": html = T.emailOwnerWelcome({ ownerName: "Tin", venueName }); break;
    case "owner_update": html = T.emailOwnerUpdate({ heading: "Novosti v Loyavi", intro: "Novi avtomatizirani maili, napredna analitika in več.", features: [{ icon: "📊", title: "Napredna analitika", sub: "Skeni po dnevih in urah." }, { icon: "✉️", title: "Avtomatski win-back", sub: "Kupon neaktivnim gostom." }], outro: "Preizkusi v nadzorni plošči." }); break;
    default: html = T.emailWeMissYou(b, { guestName: name, days: 30, lastVisit: "24.05.2026" });
  }
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
