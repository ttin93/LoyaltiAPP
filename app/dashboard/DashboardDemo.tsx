"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, FakeQr } from "@/app/components/icons";
import HelpDot from "@/app/components/HelpDot";
import {
  DEMO_VENUE,
  DEMO_REWARDS,
  DEMO_STATS,
  DEMO_HOURS,
  DEMO_CUSTOMERS,
  DEMO_HISTORY,
  DEMO_MARKETING,
  DEMO_REVIEW,
  DEMO_BIRTHDAYS,
  DEMO_CHURN,
  DEMO_REDEMPTIONS,
  DEMO_SEGMENTS,
  DEMO_TEMPLATES,
  DEMO_CAMPAIGNS,
  DEMO_AUTOMATIONS,
  DEMO_PROFILE,
  SMS_RATE,
} from "@/lib/demo";

const TABS = [
  { key: "Zgodovina", icon: "clock" },
  { key: "Analitika", icon: "chart" },
  { key: "Sistem", icon: "qr" },
  { key: "Marketing", icon: "mega" },
  { key: "Nastavitve", icon: "sliders" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const TIMEFRAMES = [
  { key: "1", label: "1 dan" },
  { key: "7", label: "7 dni" },
  { key: "30", label: "30 dni" },
  { key: "all", label: "Vse" },
];

export default function DashboardDemo({ initialTab = "Sistem" }: { initialTab?: Tab } = {}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [toast, setToast] = useState<string | null>(null);
  const [rewards, setRewards] = useState(DEMO_REWARDS.map((r) => ({ id: r.id, name: r.name, pts: r.points_required })));
  const [model, setModel] = useState<"per_visit" | "per_euro">("per_visit");
  const [perEuro, setPerEuro] = useState(50);
  const [perVisit, setPerVisit] = useState(15);
  const [minutes, setMinutes] = useState(5);
  const [manual, setManual] = useState(false);
  const [seg, setSeg] = useState(0);
  const [sms, setSms] = useState(DEMO_TEMPLATES[0].text);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [autos, setAutos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DEMO_AUTOMATIONS.map((a) => [a.key, a.on])),
  );
  const [autoEdit, setAutoEdit] = useState<string | null>(null);
  const [autoCfg, setAutoCfg] = useState<Record<string, { days: number; reward: string; validity: number; reminder: number; msg: string; channel: string }>>(() =>
    Object.fromEntries(DEMO_AUTOMATIONS.map((a) => [a.key, { days: a.days, reward: a.reward, validity: a.validity, reminder: a.reminder, msg: a.msg, channel: a.key === "review" ? "app" : "sms" }])),
  );
  const [campaigns, setCampaigns] = useState(() => DEMO_TEMPLATES.map((t) => ({ id: t.key, name: t.label, text: t.text, reward: "", validity: 7 })));
  const [campName, setCampName] = useState("");
  const [campReward, setCampReward] = useState("");
  const [campValidity, setCampValidity] = useState(7);
  const [gReview, setGReview] = useState("");
  const [hist, setHist] = useState<"given" | "redeemed">("given");
  const [tf, setTf] = useState("30");
  const [copied, setCopied] = useState(false);
  const [vName, setVName] = useState(DEMO_VENUE.name);
  const [vColor, setVColor] = useState("#2B1D17");
  const [vTagline, setVTagline] = useState("Zbiraj žige, prejmi nagrade");
  const [vLogo, setVLogo] = useState<string | null>(null);
  const [vWelcome, setVWelcome] = useState("Dobrodošel! Zberi 10 žigov in kava je na nas ☕");
  const [showWheel, setShowWheel] = useState(true);
  const [profileCust, setProfileCust] = useState<string | null>(null);
  const [slots, setSlots] = useState(["Brezplačna kava", "−10 %", "+30 točk", "Piškot gratis", "−15 %", "Sirup gratis"]);

  const accent = "#2B1D17";
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2500); };

  const embedCode = `<script src="https://zig.app/widget.js" data-venue="demo" defer></script>`;
  const maxBar = Math.max(...DEMO_HOURS.map((h) => h[1]));
  const rewardNames = Array.from(new Set(["Brezplačna kava", ...rewards.map((r) => r.name)]));

  return (
    <div className="min-h-dvh bg-[#F5EFE6] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E6DCC9] bg-[#F5EFE6]/95 px-5 pt-12 pb-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="font-display text-[26px] font-extrabold">{tab}</div>
          <div className="flex h-8 items-center gap-2 rounded-full border border-[#E6DCC9] bg-[#FFFCF6] px-3 text-[13px] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#5E7F52]" />
            {DEMO_VENUE.name}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-5">
        {/* === SISTEM === */}
        {tab === "Sistem" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] p-6 shadow-[0_2px_10px_rgba(43,29,23,0.05)]">
              <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.09em] text-[#8A7A66]">Tvoja stran za goste <HelpDot text="Natisni ta QR in ga postavi na mizo. Gost ga skenira → odpre se njegova stran zvestobe. En QR za cel lokal." /></div>
              <div className="rounded-2xl border border-[#EFE6D4] bg-white p-4"><FakeQr px={180} seed={7} /></div>
              <Link href="/p/demo" className="flex h-10 items-center gap-2 rounded-full bg-[#F1E7D2] px-4 text-[14.5px] font-semibold text-[#5C4C3E]">
                zig.app/p/demo <Icon name="link" color="#8A7A66" size={15} />
              </Link>
              <div className="flex w-full gap-2.5">
                <button onClick={() => flash("Prenos PNG (demo)")} className="flex-1 rounded-full border-[1.5px] border-[#2B1D17] py-3 text-[14px] font-semibold">Prenesi PNG</button>
                <button onClick={() => flash("Prenos PDF (demo)")} className="flex-1 rounded-full border-[1.5px] border-[#2B1D17] py-3 text-[14px] font-semibold">Prenesi PDF</button>
              </div>
            </div>

            {/* Embed widget */}
            <div className="rounded-3xl border-2 border-[#E8A23D] bg-[#FFFCF6] p-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎡</span>
                <div className="font-display text-[18px] font-extrabold">Wheel na tvojem websiteu</div>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#5C4C3E]">Prilepi to kodo na svojo spletno stran — obiskovalci zavrtijo kolo, osvojijo kavo in se registrirajo.</p>
              <div className="mt-3 overflow-x-auto rounded-xl bg-[#2B1D17] p-3.5">
                <code className="whitespace-nowrap text-[12px] text-[#E8A23D]">{embedCode}</code>
              </div>
              <div className="mt-3 flex gap-2.5">
                <button
                  onClick={() => { navigator.clipboard?.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="flex-1 rounded-full bg-[#2B1D17] py-3 text-[14px] font-semibold text-[#F5EFE6]"
                >
                  {copied ? "Kopirano ✓" : "Kopiraj kodo"}
                </button>
                <Link href="/embed/demo" target="_blank" className="flex-1 rounded-full border-[1.5px] border-[#2B1D17] py-3 text-center text-[14px] font-semibold">Predogled</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-[#E8A23D] bg-[rgba(232,162,61,0.14)] p-4 text-[13.5px] leading-relaxed text-[#6E4F14]">
              Natisni QR in ga postavi na vsako mizo — gostje stran odprejo brez aplikacije.
            </div>
          </div>
        )}

        {/* === ANALITIKA === */}
        {tab === "Analitika" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <HelpDot text="Izberi obdobje, za katero se prikažejo številke." />
              {TIMEFRAMES.map((f) => (
                <button key={f.key} onClick={() => setTf(f.key)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${tf === f.key ? "bg-[#2B1D17] text-[#F5EFE6]" : "bg-[#F1E7D2] text-[#5C4C3E]"}`}>{f.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_STATS.map((s, i) => (
                <div key={i} className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-3.5">
                  <div className="text-[12px] font-semibold text-[#8A7A66]">{s.l}</div>
                  <div className="font-display text-[24px] font-extrabold">{s.v}</div>
                  <div className="text-[11.5px] text-[#A6967F]">{s.s}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-4 text-[13px] font-bold">Obiski po urah</div>
              <div className="flex h-[120px] items-end gap-1.5">
                {DEMO_HOURS.map(([h, v, lbl], i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height: "100%" }}>
                    <div className="w-full rounded-t" style={{ height: `${(v / maxBar) * 100}%`, background: v === maxBar ? "#2B1D17" : "#E8A23D" }} />
                    <span className="text-[9px] text-[#A6967F]">{lbl}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[12.5px] text-[#8A7A66]">Vrh: <strong className="text-[#2B1D17]">ob 9h</strong> — jutranja kava.</div>
            </div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-2.5 text-[13px] font-bold">Najboljše stranke</div>
              {DEMO_CUSTOMERS.map((c) => (
                <div key={c.r} className="flex items-center gap-3 border-t border-[#F1E7D2] py-2.5 first:border-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1E7D2] font-display text-[12.5px] font-bold text-[#8A5B14]">{c.r}</div>
                  <div className="flex-1 text-[14px] font-semibold">{c.n}</div>
                  <div className="text-[13px] text-[#8A7A66]">{c.v}</div>
                  <div className="text-[13px] font-bold text-[#B97F1F]">{c.p}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-1 flex items-center gap-2 text-[13px] font-bold">Kdo pada stran <span className="rounded-full bg-[rgba(200,81,43,0.12)] px-2 py-0.5 text-[11px] font-bold text-[#A33E1D]">{DEMO_CHURN.length}</span></div>
              <div className="mb-2.5 text-[12px] text-[#A6967F]">Redni, ki dolgo niso bili — pošlji jim win-back.</div>
              {DEMO_CHURN.map((c, i) => (
                <div key={i} className="flex items-center gap-3 border-t border-[#F1E7D2] py-2.5 first:border-0">
                  <div className="flex-1 text-[14px] font-semibold">{c.n}</div>
                  <div className="text-[13px] text-[#8A7A66]">{c.v}</div>
                  <div className="text-[13px] font-bold text-[#A33E1D]">−{c.last}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-1 flex items-center gap-1.5 text-[13px] font-bold">Uspešnost kampanj <HelpDot text="Koliko gostov se je vrnilo po posamezni kampanji (vrnitve / poslano)." /></div>
              <div className="mb-2.5 text-[12px] text-[#A6967F]">Stopnja vrnitve po kampanji</div>
              {DEMO_CAMPAIGNS.map((c, i) => {
                const pct = Math.round((c.back / c.sent) * 100);
                return (
                  <div key={i} className="border-t border-[#F1E7D2] py-2.5 first:border-0">
                    <div className="flex items-center justify-between text-[13.5px]">
                      <div className="font-semibold">{c.seg} <span className="text-[11px] font-normal text-[#A6967F]">· {c.ch} · {c.d}</span></div>
                      <div className="font-bold text-[#5E7F52]">{pct}%</div>
                    </div>
                    <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-[#EFE6D4]">
                      <div className="h-full rounded-full bg-[#5E7F52]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
                      <div><div className="text-[14px] font-bold">{c.sent}</div><div className="text-[10.5px] text-[#A6967F]">poslano</div></div>
                      <div><div className="text-[14px] font-bold text-[#5E7F52]">{c.back}</div><div className="text-[10.5px] text-[#A6967F]">vrnili</div></div>
                      <div><div className="text-[14px] font-bold text-[#B97F1F]">{c.used}</div><div className="text-[10.5px] text-[#A6967F]">kupon · {c.avgDays}d</div></div>
                      <div><div className="text-[14px] font-bold text-[#A33E1D]">{c.expired}</div><div className="text-[10.5px] text-[#A6967F]">poteklo</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === ZGODOVINA === */}
        {tab === "Zgodovina" && (
          <div className="space-y-4">
            <div className="flex rounded-full bg-[#EDE3D0] p-1">
              <button onClick={() => setHist("given")} className={`flex-1 rounded-full py-2 text-center text-[14px] font-bold ${hist === "given" ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>Podarjene</button>
              <button onClick={() => setHist("redeemed")} className={`flex-1 rounded-full py-2 text-center text-[14px] font-bold ${hist === "redeemed" ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>Unovčene</button>
            </div>
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] px-4">
              {hist === "given"
                ? DEMO_HISTORY.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 border-t border-[#F1E7D2] py-3 first:border-0">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8512B]" style={{ background: "rgba(200,81,43,0.07)", transform: "rotate(-4deg)" }}>
                        <Icon name="cup" color="#C8512B" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14.5px] font-semibold">{h.n}</div>
                        <div className="text-[12.5px] text-[#A6967F]">{h.t}</div>
                      </div>
                      <div className="text-[14.5px] font-bold text-[#5E7F52]">{h.d}</div>
                    </div>
                  ))
                : DEMO_REDEMPTIONS.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 border-t border-[#F1E7D2] py-3 first:border-0">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#5E7F52]" style={{ background: "rgba(94,127,82,0.1)" }}>
                        <Icon name="gift" color="#5E7F52" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14.5px] font-semibold">{r.d}</div>
                        <div className="text-[12.5px] text-[#A6967F]">{r.n} · {r.t}</div>
                      </div>
                      <div className="text-[13px] font-bold text-[#8A7A66]">unovčeno</div>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* === MARKETING === */}
        {tab === "Marketing" && (
          <div className="space-y-4">
            {/* Google ocene autopilot */}
            <div className="rounded-3xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div className="font-display text-[18px] font-extrabold">Google ocene — autopilot</div>
                </div>
                <span className="flex h-6 items-center rounded-full bg-[rgba(94,127,82,0.14)] px-2.5 text-[11px] font-bold text-[#3E5536]">Vklopljeno</span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5C4C3E]">Ko gost dobi žig (zadovoljen!), ga prosimo za Google oceno. Slabe izkušnje prestrežemo zasebno.</p>
              <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-[#F5EFE6] p-2.5"><div className="font-display text-[20px] font-extrabold">{DEMO_REVIEW.requested}</div><div className="text-[11px] text-[#8A7A66]">zaprošenih</div></div>
                <div className="rounded-xl bg-[#F5EFE6] p-2.5"><div className="font-display text-[20px] font-extrabold text-[#5E7F52]">+{DEMO_REVIEW.left}</div><div className="text-[11px] text-[#8A7A66]">novih ocen</div></div>
                <div className="rounded-xl bg-[#F5EFE6] p-2.5"><div className="font-display text-[20px] font-extrabold text-[#B97F1F]">{DEMO_REVIEW.rating}★</div><div className="text-[11px] text-[#8A7A66]">prej {DEMO_REVIEW.before}</div></div>
              </div>
            </div>

            {/* Rojstni dnevi */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎂</span>
                <div className="font-display text-[16px] font-extrabold">Rojstni dnevi</div>
                <span className="ml-auto text-[12px] text-[#8A7A66]">avtomatska ponudba</span>
              </div>
              <div className="mt-2.5">
                {DEMO_BIRTHDAYS.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 border-t border-[#F1E7D2] py-2.5 first:border-0">
                    <div className="flex-1 text-[14px] font-semibold">{b.n}</div>
                    <div className="text-[13px] font-semibold" style={{ color: b.soon ? "#B97F1F" : "#8A7A66" }}>{b.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avtomatizacije */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-1 flex items-center gap-1.5 text-[14px] font-bold">Avtomatizacije <HelpDot text="Sporočila, ki se pošljejo sama ob dogodku — brez tvojega dela." /></div>
              {DEMO_AUTOMATIONS.map((a) => {
                const cfg = autoCfg[a.key];
                const open = autoEdit === a.key;
                return (
                  <div key={a.key} className="border-t border-[#F1E7D2] py-3 first:border-0">
                    <div className="flex items-center justify-between">
                      <div className="pr-3">
                        <div className="text-[14px] font-semibold">{a.label}</div>
                        <div className="text-[12.5px] text-[#A6967F]">{a.desc}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAutoEdit(open ? null : a.key)} className="text-[12.5px] font-semibold text-[#5C4C3E] underline">{open ? "Zapri" : "Uredi"}</button>
                        <button onClick={() => setAutos((p) => ({ ...p, [a.key]: !p[a.key] }))} aria-label={a.label} className="relative h-[30px] w-[50px] flex-shrink-0 rounded-full transition" style={{ background: autos[a.key] ? "#5E7F52" : "#D9CDBA" }}>
                          <span className="absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: autos[a.key] ? 23 : 3 }} />
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-3 space-y-2.5 rounded-xl bg-[#F5EFE6] p-3.5">
                        {a.key !== "review" && (
                          <Row label={a.key === "birthday" ? "Pošlji X dni pred rojstnim dnem" : "Po X dneh neaktivnosti"}>
                            <Num value={cfg.days} onChange={(n) => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], days: n } }))} />
                          </Row>
                        )}
                        {a.key !== "review" && (
                          <Row label="Pošlji prek">
                            <div className="flex rounded-full bg-[#EDE3D0] p-0.5">
                              {(["sms", "email"] as const).map((c) => (
                                <button key={c} onClick={() => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], channel: c } }))} className={`rounded-full px-3 py-1 text-[12px] font-bold ${cfg.channel === c ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>{c === "sms" ? "SMS" : "Email"}</button>
                              ))}
                            </div>
                          </Row>
                        )}
                        <label className="block">
                          <span className="mb-1 block text-[12px] text-[#8A7A66]">Sporočilo</span>
                          <textarea value={cfg.msg} onChange={(e) => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], msg: e.target.value } }))} rows={2} className="w-full rounded-lg border border-[#D9CDBA] bg-white p-2.5 text-[13.5px] outline-none focus:border-[#2B1D17]" />
                        </label>
                        {a.key !== "review" && (
                          <>
                            <Row label="Priloži kupon">
                              <select value={cfg.reward} onChange={(e) => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], reward: e.target.value } }))} className="w-44 rounded-lg border border-[#D9CDBA] bg-white px-2 py-1.5 text-[13.5px]">
                                <option value="">— brez —</option>
                                {rewardNames.map((n) => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </Row>
                            <Row label="Veljavnost kupona (dni)"><Num value={cfg.validity} onChange={(n) => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], validity: n } }))} /></Row>
                            <Row label="Opomnik pred potekom (dni)"><Num value={cfg.reminder} onChange={(n) => setAutoCfg((p) => ({ ...p, [a.key]: { ...p[a.key], reminder: n } }))} /></Row>
                          </>
                        )}
                        <button onClick={() => { setAutoEdit(null); flash(a.label + " posodobljen (demo)"); }} className="h-10 w-full rounded-full bg-[#2B1D17] text-[13.5px] font-semibold text-[#F5EFE6]">Shrani avtomatizacijo</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nova kampanja (SMS / Email) */}
            <div className="rounded-3xl border-2 border-[#E8A23D] bg-[#FFFCF6] p-5">
              <div className="flex items-center gap-1.5">
                <Icon name="mega" color="#B97F1F" size={20} />
                <div className="font-display text-[18px] font-extrabold">Nova kampanja</div>
                <HelpDot text="Pošlji ciljano sporočilo segmentu gostov. SMS stane ~0,07 €/kos, email je zastonj." />
              </div>

              <div className="mt-3 flex rounded-full bg-[#EDE3D0] p-1">
                {(["sms", "email"] as const).map((c) => (
                  <button key={c} onClick={() => setChannel(c)} className={`flex-1 rounded-full py-2 text-[13.5px] font-bold ${channel === c ? "bg-[#2B1D17] text-[#F5EFE6]" : "text-[#5C4C3E]"}`}>
                    {c === "sms" ? "SMS" : "Email"}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-[12.5px] font-bold uppercase tracking-wide text-[#A6967F]">Komu</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {DEMO_SEGMENTS.map((s, i) => (
                  <button key={s.key} onClick={() => setSeg(i)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${seg === i ? "bg-[#2B1D17] text-[#F5EFE6]" : "bg-[#F1E7D2] text-[#5C4C3E]"}`}>
                    {s.label} ({channel === "sms" ? s.sms : s.email})
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-[#A6967F]">Shranjene kampanje <HelpDot text="Klikni ime, da naložiš kampanjo. Spodaj poimenuj in shrani trenutno kot novo — ali posodobi obstoječo z istim imenom." /></div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {campaigns.map((c) => (
                  <span key={c.id} className="flex items-center gap-1.5 rounded-full bg-[#F1E7D2] py-1.5 pl-3 pr-1.5 text-[12.5px] font-semibold text-[#5C4C3E]">
                    <button onClick={() => { setSms(c.text); setCampName(c.name); setCampReward(c.reward || ""); setCampValidity(c.validity || 7); }}>{c.name}</button>
                    <button onClick={() => setCampaigns((p) => p.filter((x) => x.id !== c.id))} aria-label={`Izbriši ${c.name}`} className="flex h-4 w-4 items-center justify-center rounded-full text-[13px] text-[#A33E1D]">×</button>
                  </span>
                ))}
              </div>

              <textarea value={sms} onChange={(e) => setSms(e.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-[#D9CDBA] bg-[#FFFCF6] p-3 text-[14px] outline-none focus:border-[#2B1D17]" />

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-[#F5EFE6] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5C4C3E]">Priloži kupon <HelpDot text="Prejemnik ob prejemu dobi ta kupon v denarnico, z veljavnostjo. (Pravo pripenjanje se aktivira s SMS/email providerjem.)" /></div>
                <select value={campReward} onChange={(e) => setCampReward(e.target.value)} className="rounded-lg border border-[#D9CDBA] bg-white px-2 py-1.5 text-[13px]">
                  <option value="">— brez —</option>
                  {rewardNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {campReward && (
                  <label className="flex items-center gap-1.5 text-[13px] text-[#5C4C3E]">veljavnost
                    <input type="number" value={campValidity} onChange={(e) => setCampValidity(+e.target.value)} className="w-14 rounded-lg border border-[#D9CDBA] bg-white px-2 py-1 text-right text-[13px]" /> dni
                  </label>
                )}
              </div>

              <div className="mt-2.5 flex gap-2">
                <input value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="Ime kampanje (npr. Rojstni dan)" className="min-w-0 flex-1 rounded-lg border border-[#D9CDBA] bg-white px-3 py-2 text-[13.5px]" />
                <button
                  onClick={() => {
                    const name = campName.trim();
                    if (!name) return flash("Vpiši ime kampanje");
                    setCampaigns((p) => {
                      const i = p.findIndex((x) => x.name.toLowerCase() === name.toLowerCase());
                      if (i >= 0) { const n = [...p]; n[i] = { ...n[i], text: sms, reward: campReward, validity: campValidity }; return n; }
                      return [...p, { id: "c" + p.length + name, name, text: sms, reward: campReward, validity: campValidity }];
                    });
                    flash("Kampanja shranjena");
                  }}
                  className="flex-shrink-0 rounded-lg bg-[#5E7F52] px-4 py-2 text-[13.5px] font-semibold text-white"
                >
                  Shrani
                </button>
              </div>

              {(() => {
                const recip = channel === "sms" ? DEMO_SEGMENTS[seg].sms : DEMO_SEGMENTS[seg].email;
                const cost = channel === "sms" ? recip * SMS_RATE : 0;
                return (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F5EFE6] px-3.5 py-3 text-[13.5px]">
                    <span className="text-[#5C4C3E]">{recip} prejemnikov{channel === "sms" ? ` × ${SMS_RATE.toFixed(2).replace(".", ",")} €` : " · email"}</span>
                    <span className="font-display text-[16px] font-extrabold" style={{ color: cost > 0 ? "#A33E1D" : "#3E5536" }}>{cost > 0 ? `${cost.toFixed(2).replace(".", ",")} €` : "0 € (zastonj)"}</span>
                  </div>
                );
              })()}

              <button onClick={() => flash(channel === "sms" ? "SMS poslan (demo)" : "Email poslan (demo)")} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2B1D17] text-[15px] font-semibold text-[#F5EFE6]">
                <Icon name="send" color="#F5EFE6" size={18} /> Pošlji {channel === "sms" ? "SMS" : "email"}
              </button>
            </div>

            {/* Zgodovina kampanj */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-2 text-[14px] font-bold">Pretekle kampanje</div>
              <div className="flex items-center gap-3 pb-1 text-[11.5px] font-bold uppercase tracking-wide text-[#A6967F]">
                <div className="w-12">Datum</div><div className="flex-1">Segment</div><div className="w-14 text-right">Poslano</div><div className="w-14 text-right">Vrnili</div>
              </div>
              {DEMO_CAMPAIGNS.map((c, i) => (
                <div key={i} className="flex items-center gap-3 border-t border-[#F1E7D2] py-2.5 text-[13px]">
                  <div className="w-12 text-[#8A7A66]">{c.d}</div>
                  <div className="flex-1 font-semibold">{c.seg} <span className="text-[11px] font-normal text-[#A6967F]">· {c.ch}</span></div>
                  <div className="w-14 text-right">{c.sent}</div>
                  <div className="w-14 text-right font-bold text-[#5E7F52]">+{c.back}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] px-4 py-1">
              <div className="flex items-center gap-1.5 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[#A6967F]">Stranke <HelpDot text="Klikni stranko za njen profil: vsi obiski, unovčenja, poraba, vzorec — in pošlji ji osebno sporočilo." /></div>
              <div className="flex items-center gap-3 pb-2 text-[11.5px] font-bold uppercase tracking-wide text-[#A6967F]">
                <div className="flex-1">Stranka</div><div className="w-12 text-right">Obiski</div><div className="w-14 text-right">Točke</div><div className="w-16 text-right">Zadnji</div>
              </div>
              {DEMO_MARKETING.map((m, i) => (
                <button key={i} onClick={() => setProfileCust(m.n)} className="flex w-full items-center gap-3 border-t border-[#F1E7D2] py-3 text-left text-[13.5px] hover:bg-[#F9F4EA]">
                  <div className="flex-1 truncate font-semibold">{m.n}</div>
                  <div className="w-12 text-right text-[#5C4C3E]">{m.v}</div>
                  <div className="w-14 text-right font-bold text-[#B97F1F]">{m.p}</div>
                  <div className="w-16 text-right text-[12.5px] font-semibold" style={{ color: m.ac }}>{m.a}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === NASTAVITVE === */}
        {tab === "Nastavitve" && (
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-[#E8A23D] bg-[#FFFCF6] p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-display text-[17px] font-bold leading-tight">Aktiviraj skeniranje računov <HelpDot text="Enkrat fotografiraš vzorčni račun lokala → preberemo davčno številko. Od tedaj točke prinesejo SAMO računi tvojega lokala. Lahko kadarkoli ponovno aktiviraš." /></div>
                <div className="flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold" style={{ background: "rgba(200,81,43,0.12)", color: "#A33E1D" }}>Ni aktivirano</div>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#41332A]">Fotografiraj vzorčni račun → preberemo davčno → od takrat točke prinesejo samo tvoji računi.</p>
              <button onClick={() => flash("Skeniranje aktivirano (demo)")} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2B1D17] text-[15px] font-semibold text-[#F5EFE6]">
                <Icon name="camera" color="#F5EFE6" size={18} /> Fotografiraj račun
              </button>
            </div>

            {/* Gostova stran */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold">Gostova stran <HelpDot text="Stran, ki jo gost vidi, ko skenira tvoj QR. Tu urejaš videz." /></div>

              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#A6967F]">Predogled</div>
              <div className="mb-3 flex items-center gap-3 rounded-xl p-3" style={{ background: vColor }}>
                {vLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vLogo} alt="logo" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[18px] font-bold" style={{ color: vColor }}>{vName.charAt(0)}</div>
                )}
                <div className="min-w-0">
                  <div className="font-display truncate text-[15px] font-bold text-white">{vName}</div>
                  <div className="truncate text-[12px] text-white/80">{vTagline}</div>
                </div>
              </div>
              <label className="mb-2.5 flex items-center justify-between">
                <span className="text-[14px] text-[#5C4C3E]">Logotip</span>
                <span className="cursor-pointer rounded-lg border border-[#D9CDBA] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#5C4C3E]">
                  {vLogo ? "Zamenjaj" : "Naloži"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const rd = new FileReader(); rd.onload = () => setVLogo(rd.result as string); rd.readAsDataURL(f); } }} />
                </span>
              </label>
              <label className="mb-2.5 block">
                <span className="mb-1 block text-[12px] text-[#8A7A66]">Ime lokala</span>
                <input value={vName} onChange={(e) => setVName(e.target.value)} className="w-full rounded-lg border border-[#D9CDBA] px-3 py-2 text-[14px]" />
              </label>
              <label className="mb-2.5 block">
                <span className="mb-1 block text-[12px] text-[#8A7A66]">Podnapis</span>
                <input value={vTagline} onChange={(e) => setVTagline(e.target.value)} className="w-full rounded-lg border border-[#D9CDBA] px-3 py-2 text-[14px]" />
              </label>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[14px] text-[#5C4C3E]">Barva znamke</span>
                <input type="color" value={vColor} onChange={(e) => setVColor(e.target.value)} className="h-9 w-14 rounded-lg border border-[#D9CDBA]" />
              </div>
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-[12px] text-[#8A7A66]">Google review link <HelpDot text="Iz Google Business Profile → 'Prejmi več ocen' dobiš kratko povezavo (g.page/r/…). Gumb 'Oceni na Googlu' jo odpre naravnost v okencu za oceno. Brez nje gumb odpre iskanje po imenu lokala." /></span>
                <input value={gReview} onChange={(e) => setGReview(e.target.value)} placeholder="https://g.page/r/…" className="w-full rounded-lg border border-[#D9CDBA] px-3 py-2 text-[13px]" />
              </label>
              <label className="mt-2.5 block">
                <span className="mb-1 block text-[12px] text-[#8A7A66]">Pozdravno sporočilo</span>
                <input value={vWelcome} onChange={(e) => setVWelcome(e.target.value)} className="w-full rounded-lg border border-[#D9CDBA] px-3 py-2 text-[13px]" />
              </label>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[14px] text-[#5C4C3E]">Prikaži srečno kolo novim gostom</span>
                <button onClick={() => setShowWheel(!showWheel)} aria-label="Kolo" className="relative h-[28px] w-[46px] flex-shrink-0 rounded-full" style={{ background: showWheel ? "#5E7F52" : "#D9CDBA" }}>
                  <span className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all" style={{ left: showWheel ? 21 : 3 }} />
                </button>
              </div>
              <button onClick={() => flash("Gostova stran shranjena (demo)")} className="mt-4 h-11 w-full rounded-full bg-[#2B1D17] text-[14px] font-semibold text-[#F5EFE6]">Shrani</button>
            </div>

            {/* Srečno kolo (wheel editor) */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-1 flex items-center gap-1.5 text-[14px] font-bold">Srečno kolo <HelpDot text="Polja kolesa, ki ga zavrtijo novi gostje (na spletni strani / ob prvem obisku)." /></div>
              <div className="mb-3 text-[12.5px] text-[#A6967F]">6 polj — uredi nagrade.</div>
              <div className="space-y-2">
                {slots.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#F1E7D2] text-[12px] font-bold text-[#8A5B14]">{i + 1}</span>
                    <input value={s} onChange={(e) => setSlots((p) => p.map((x, j) => (j === i ? e.target.value : x)))} className="flex-1 rounded-lg border border-[#D9CDBA] px-3 py-1.5 text-[13.5px]" />
                  </div>
                ))}
              </div>
              <button onClick={() => flash("Kolo shranjeno (demo)")} className="mt-4 h-11 w-full rounded-full bg-[#2B1D17] text-[14px] font-semibold text-[#F5EFE6]">Shrani kolo</button>
            </div>

            {/* Model točk */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold">Model nagrajevanja <HelpDot text="Žigi: vsak 10. obisk → 1 nagrada (kartonček se resetira). Točke: gost nabira točke in jih zapravi na meniju nagrad. Gost vidi SAMO izbrani model." /></div>
              <div className="flex gap-2">
                <button onClick={() => setModel("per_visit")} className={`flex-1 rounded-xl border-2 p-3 text-left ${model === "per_visit" ? "border-[#2B1D17] bg-[#F1E7D2]" : "border-[#E6DCC9]"}`}>
                  <div className="text-[14px] font-bold">Žigi (obisk)</div>
                  <div className="text-[12px] text-[#8A7A66]">Osnovni paket</div>
                </button>
                <button onClick={() => setModel("per_euro")} className={`flex-1 rounded-xl border-2 p-3 text-left ${model === "per_euro" ? "border-[#2B1D17] bg-[#F1E7D2]" : "border-[#E6DCC9]"}`}>
                  <div className="text-[14px] font-bold">Točke (€)</div>
                  <div className="text-[12px] text-[#8A7A66]">Pro paket</div>
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {model === "per_visit" ? (
                  <Row label="Točke na obisk"><Num value={perVisit} onChange={setPerVisit} /></Row>
                ) : (
                  <Row label="1 € = X točk"><Num value={perEuro} onChange={setPerEuro} /></Row>
                )}
                <Row label="Čas unovčenja (min)"><Num value={minutes} onChange={setMinutes} /></Row>
              </div>
              <button onClick={() => flash("Nastavitve shranjene (demo)")} className="mt-4 h-11 w-full rounded-full bg-[#2B1D17] text-[14px] font-semibold text-[#F5EFE6]">Shrani</button>
            </div>

            {/* Nagrade */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] p-5">
              <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold">Nagrade <HelpDot text="Kaj gost dobi. Pri žigih: kaj prinese poln kartonček. Pri točkah: meni nagrad s ceno v točkah." /></div>
              <div className="space-y-2">
                {rewards.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <input value={r.name} onChange={(e) => setRewards((p) => p.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))} className="flex-1 rounded-lg border border-[#D9CDBA] px-3 py-1.5 text-[13.5px]" />
                    <input type="number" value={r.pts} onChange={(e) => setRewards((p) => p.map((x) => (x.id === r.id ? { ...x, pts: +e.target.value } : x)))} className="w-20 rounded-lg border border-[#D9CDBA] px-2 py-1.5 text-[13.5px]" />
                    <button onClick={() => setRewards((p) => p.filter((x) => x.id !== r.id))} className="text-[#C8512B]"><Icon name="trash" color="#C8512B" size={18} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setRewards((p) => [...p, { id: "n" + p.length, name: "Nova nagrada", pts: 100 }])} className="mt-3 flex items-center gap-1.5 text-[13.5px] font-semibold text-[#5E7F52]"><Icon name="plus" color="#5E7F52" size={16} /> Dodaj nagrado</button>
            </div>

            {/* Toggli + vrstice */}
            <div className="rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] px-5">
              <div className="flex items-center justify-between border-b border-[#F1E7D2] py-4">
                <div>
                  <div className="text-[14.5px] font-semibold">Ročno dodajanje točk</div>
                  <div className="text-[12.5px] text-[#A6967F]">Osebje lahko točke vpiše brez QR</div>
                </div>
                <button onClick={() => setManual(!manual)} className="relative h-[30px] w-[50px] rounded-full transition" style={{ background: manual ? "#5E7F52" : "#D9CDBA" }}>
                  <span className="absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: manual ? 23 : 3 }} />
                </button>
              </div>
              <SettingRow label="Profil" />
              <SettingRow label="Plačila" sub="Paket: Pro · 39€/mes" />
            </div>
          </div>
        )}
      </main>

      {/* Spodnja navigacija */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E6DCC9] bg-[#FFFCF6]">
        <div className="mx-auto flex max-w-md px-2 pb-7 pt-2.5">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="flex flex-1 flex-col items-center gap-1">
                <Icon name={t.icon} color={on ? "#2B1D17" : "#A6967F"} size={22} />
                <span className="text-[10.5px]" style={{ color: on ? "#2B1D17" : "#A6967F", fontWeight: on ? 700 : 500 }}>{t.key}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {profileCust && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setProfileCust(null)}>
          <div className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F5EFE6] px-5 pb-8 pt-5" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D9CDBA]" />
            <div className="flex items-center gap-3">
              <div className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-[#2B1D17] text-[20px] font-bold text-[#F5EFE6]">{/^[A-Za-zČŠŽ]/.test(profileCust) ? profileCust.charAt(0).toUpperCase() : "G"}</div>
              <div className="min-w-0 flex-1">
                <div className="font-display truncate text-[18px] font-extrabold">{profileCust}</div>
                <div className="text-[12.5px] text-[#8A7A66]">Član od {DEMO_PROFILE.joined}</div>
              </div>
              <button onClick={() => setProfileCust(null)} aria-label="Zapri" className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(43,29,23,0.06)]"><Icon name="x" color="#2B1D17" size={18} strokeWidth={2} /></button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <Mini l="Obiski" v={String(DEMO_PROFILE.visits)} />
              <Mini l="Točke" v={String(DEMO_PROFILE.points)} />
              <Mini l="Poraba" v={DEMO_PROFILE.spent} />
              <Mini l="Povp. razmik" v={DEMO_PROFILE.avgGap} />
              <Mini l="Najraje" v={DEMO_PROFILE.best} />
              <Mini l="Zadnji" v="danes" />
            </div>

            <div className="mt-4 text-[13px] font-bold">Skeniranja</div>
            <div className="mt-1.5 rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] px-4">
              {DEMO_PROFILE.scans.map((s, i) => (
                <div key={i} className="flex items-center justify-between border-t border-[#F1E7D2] py-2.5 text-[13.5px] first:border-0">
                  <span className="text-[#5C4C3E]">{s.t}</span><span className="font-bold text-[#5E7F52]">{s.d}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-[13px] font-bold">Unovčene nagrade</div>
            <div className="mt-1.5 rounded-2xl border border-[#EFE6D4] bg-[#FFFCF6] px-4">
              {DEMO_PROFILE.redemptions.map((r, i) => (
                <div key={i} className="flex items-center justify-between border-t border-[#F1E7D2] py-2.5 text-[13.5px] first:border-0">
                  <span className="font-semibold">{r.d}</span><span className="text-[#8A7A66]">{r.t}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { setProfileCust(null); flash("Osebno sporočilo poslano (demo)"); }} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2B1D17] text-[15px] font-semibold text-[#F5EFE6]">
              <Icon name="send" color="#F5EFE6" size={18} /> Pošlji osebno sporočilo
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-[88%] max-w-sm rounded-xl bg-[#2B1D17] px-4 py-3 text-center text-[14px] font-medium text-[#F5EFE6] shadow-lg">{toast}</div>
      )}
    </div>
  );
}

function Mini({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-[#EFE6D4] bg-[#FFFCF6] p-2.5 text-center">
      <div className="font-display text-[16px] font-extrabold">{v}</div>
      <div className="text-[11px] text-[#8A7A66]">{l}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#5C4C3E]">{label}</span>
      {children}
    </div>
  );
}
function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return <input type="number" value={value} onChange={(e) => onChange(+e.target.value)} className="w-24 rounded-lg border border-[#D9CDBA] px-3 py-1.5 text-right text-[14px]" />;
}
function SettingRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-4 last:border-0" style={{ borderTop: "1px solid #F1E7D2" }}>
      <div>
        <div className="text-[14.5px] font-semibold">{label}</div>
        {sub && <div className="text-[12.5px] text-[#A6967F]">{sub}</div>}
      </div>
      <Icon name="chevronR" color="#A6967F" size={16} strokeWidth={2} />
    </div>
  );
}
