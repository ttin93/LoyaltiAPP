"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SAVenue, SAOwner, SATotals, SADay, SARevenue } from "./page";
import { adminUpdateVenue, adminExtendTrial, sendOwnerCampaign, adminVenueLog } from "./actions";
import type { LogEntry } from "@/lib/types";
import type { PlanKey, SubStatus } from "@/lib/types";
import { PLANS, PLAN_ORDER, STATUS_LABEL, fmtEur, chargedAmount, monthlyEquivalent, isPaying } from "@/lib/plans";

const INK = "#2A241D";
const CREAM = "#FBF7F0";
const PAPER = "#FBF3E6";
const CORAL = "#C4623D";
const AMBER = "#E2A04A";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BG = "#E9E2D6";
const BORD = "#E4D8C4";
const JAK = "var(--font-jakarta), sans-serif";

const LANGS = [
  { v: "sl", l: "Slovenščina" },
  { v: "en", l: "English" },
  { v: "hr", l: "Hrvaški" },
  { v: "sr", l: "Srbski" },
  { v: "bs", l: "Bosanski" },
  { v: "de", l: "Nemški" },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function relTime(iso: string | null): string {
  if (!iso) return "nikoli";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "pravkar";
  if (h < 24) return `pred ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `pred ${d} dni`;
  return fmtDate(iso);
}

export default function Superadmin({
  venues,
  owners,
  totals,
  series,
  revenue,
  adminEmail,
}: {
  venues: SAVenue[];
  owners: SAOwner[];
  totals: SATotals;
  series: SADay[];
  revenue: SARevenue;
  adminEmail: string;
}) {
  const [tab, setTab] = useState<"pregled" | "lokali" | "narocnine" | "lastniki" | "sporocila">("pregled");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SAVenue | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.ownerEmail || "").toLowerCase().includes(q) ||
        v.public_code.toLowerCase().includes(q),
    );
  }, [venues, query]);

  const topVenues = useMemo(() => [...venues].sort((a, b) => b.cScans - a.cScans).slice(0, 6), [venues]);
  const newestVenues = useMemo(() => [...venues].slice(0, 6), [venues]);

  return (
    <main style={{ minHeight: "100dvh", background: BG, fontFamily: JAK, color: INK }}>
      {/* TOP BAR — temni "god panel" header */}
      <div style={{ background: INK, color: CREAM }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: AMBER, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Loyavi</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, marginLeft: 2 }}>Super Admin</span>
          </div>
          <div className="flex items-center" style={{ gap: 14 }}>
            <span style={{ fontSize: 12.5, color: "rgba(251,247,240,0.6)" }} className="hidden sm:inline">{adminEmail}</span>
            <a href="/dashboard" style={{ fontSize: 13, fontWeight: 700, color: CREAM, textDecoration: "none", padding: "7px 13px", borderRadius: 10, border: "1px solid rgba(251,247,240,0.2)" }}>Nadzorna plošča →</a>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: CREAM, borderBottom: `1px solid ${BORD}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4 }}>
          {([["pregled", "Pregled"], ["lokali", `Lokali · ${venues.length}`], ["narocnine", "Naročnine"], ["sporocila", "Sporočila"], ["lastniki", `Lastniki · ${totals.owners}`]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: "15px 14px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: JAK,
                fontSize: 14,
                fontWeight: 700,
                color: tab === k ? INK : MUTED,
                borderBottom: `2.5px solid ${tab === k ? CORAL : "transparent"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 60px" }}>
        {tab === "pregled" && (
          <Pregled totals={totals} series={series} topVenues={topVenues} newestVenues={newestVenues} onOpen={setSelected} />
        )}
        {tab === "lokali" && (
          <Lokali venues={filtered} query={query} setQuery={setQuery} onOpen={setSelected} total={venues.length} />
        )}
        {tab === "narocnine" && <Narocnine revenue={revenue} venues={venues} onOpen={setSelected} onTrial={totals.onTrial} />}
        {tab === "sporocila" && <Sporocila />}
        {tab === "lastniki" && <Lastniki owners={owners} />}
      </div>

      {selected && <VenueModal venue={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

/* ---------------- PREGLED ---------------- */

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 18, padding: 18 }}>{children}</div>;
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 16, padding: "16px 16px 14px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6, color: accent || INK }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Pregled({
  totals,
  series,
  topVenues,
  newestVenues,
  onOpen,
}: {
  totals: SATotals;
  series: SADay[];
  topVenues: SAVenue[];
  newestVenues: SAVenue[];
  onOpen: (v: SAVenue) => void;
}) {
  const max = Math.max(1, ...series.map((d) => d.count));
  const maxTop = Math.max(1, ...topVenues.map((v) => v.cScans));
  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Kpi label="Lokali" value={String(totals.venues)} sub="vsi v sistemu" />
        <Kpi label="Aktivni lastniki" value={String(totals.owners)} />
        <Kpi label="Stranke" value={totals.customers.toLocaleString("sl")} sub={`+${totals.newCustomers7} ta teden`} accent={GREEN} />
        <Kpi label="Skeni (skupaj)" value={totals.scans.toLocaleString("sl")} />
        <Kpi label="Skeni · 30 dni" value={totals.scans30.toLocaleString("sl")} accent={CORAL} />
        <Kpi label="Unovčenja" value={totals.redemptions.toLocaleString("sl")} />
        <Kpi label="Povpr. ocena" value={totals.reviewAvg != null ? `${totals.reviewAvg} ★` : "—"} sub={`${totals.reviewCount} ocen`} accent={AMBER} />
      </div>

      {/* CHART */}
      <Card>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Skeni — zadnjih 30 dni</div>
          <div style={{ fontSize: 12.5, color: MUTED }}>skupaj {totals.scans30}</div>
        </div>
        <div className="flex" style={{ gap: 10 }}>
          {/* y-os */}
          <div className="flex flex-col justify-between" style={{ height: 150, fontSize: 11, color: MUTED, textAlign: "right", width: 26 }}>
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
          <div className="flex flex-1 items-end" style={{ height: 150, gap: 2, borderLeft: `1px solid ${BORD}`, borderBottom: `1px solid ${BORD}`, paddingLeft: 6 }}>
            {series.map((d) => (
              <div key={d.date} className="group relative flex flex-1 items-end justify-center" style={{ height: "100%" }}>
                <div style={{ width: "100%", maxWidth: 16, height: `${Math.max(2, (d.count / max) * 100)}%`, background: d.count ? CORAL : BORD, borderRadius: "3px 3px 0 0", transition: "background 0.15s" }} />
                <div className="pointer-events-none absolute opacity-0 group-hover:opacity-100" style={{ bottom: "calc(100% + 6px)", background: INK, color: CREAM, fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 8, whiteSpace: "nowrap", transition: "opacity 0.12s", zIndex: 5 }}>
                  {d.label} · {d.count} {d.count === 1 ? "sken" : "skenov"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* TOP + NAJNOVEJŠI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <Card>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Najboljši lokali</div>
          {topVenues.length === 0 && <Empty>Ni še lokalov.</Empty>}
          <div className="flex flex-col" style={{ gap: 12 }}>
            {topVenues.map((v) => (
              <button key={v.id} onClick={() => onOpen(v)} className="flex items-center" style={{ gap: 12, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%" }}>
                <Avatar name={v.name} color={v.brand_color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: CORAL }}>{v.cScans}</span>
                  </div>
                  <div style={{ height: 6, background: BG, borderRadius: 99, marginTop: 5, overflow: "hidden" }}>
                    <div style={{ width: `${(v.cScans / maxTop) * 100}%`, height: "100%", background: CORAL, borderRadius: 99 }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Najnovejši lokali</div>
          {newestVenues.length === 0 && <Empty>Ni še lokalov.</Empty>}
          <div className="flex flex-col" style={{ gap: 2 }}>
            {newestVenues.map((v) => (
              <button key={v.id} onClick={() => onOpen(v)} className="flex items-center" style={{ gap: 12, background: "none", border: "none", padding: "8px 0", cursor: "pointer", textAlign: "left", width: "100%", borderBottom: `1px solid ${BORD}` }}>
                <Avatar name={v.name} color={v.brand_color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.ownerEmail || "brez lastnika"}</div>
                </div>
                <span style={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(v.created_at)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- LOKALI ---------------- */

function Lokali({
  venues,
  query,
  setQuery,
  onOpen,
  total,
}: {
  venues: SAVenue[];
  query: string;
  setQuery: (s: string) => void;
  onOpen: (v: SAVenue) => void;
  total: number;
}) {
  const [fPlan, setFPlan] = useState<"all" | PlanKey>("all");
  const [fLang, setFLang] = useState<"all" | string>("all");
  const [sortKey, setSortKey] = useState<"new" | "old" | "customers" | "scans" | "rating" | "name">("new");
  const [activeOnly, setActiveOnly] = useState(false);
  const [noScans, setNoScans] = useState(false);

  const list = useMemo(() => {
    const l = venues.filter((v) => {
      if (fPlan !== "all" && (v.plan ?? "free") !== fPlan) return false;
      if (fLang !== "all" && (v.language || "sl") !== fLang) return false;
      if (activeOnly && !(v.cScans30 > 0)) return false;
      if (noScans && v.cScans !== 0) return false;
      return true;
    });
    l.sort((a, b) => {
      switch (sortKey) {
        case "old": return (a.created_at || "").localeCompare(b.created_at || "");
        case "customers": return b.cCustomers - a.cCustomers;
        case "scans": return b.cScans30 - a.cScans30;
        case "rating": return (b.reviewAvg ?? -1) - (a.reviewAvg ?? -1);
        case "name": return a.name.localeCompare(b.name, "sl");
        default: return (b.created_at || "").localeCompare(a.created_at || "");
      }
    });
    return l;
  }, [venues, fPlan, fLang, sortKey, activeOnly, noScans]);

  const anyFilter = query.trim() !== "" || fPlan !== "all" || fLang !== "all" || activeOnly || noScans;
  function clearFilters() { setQuery(""); setFPlan("all"); setFLang("all"); setActiveOnly(false); setNoScans(false); }

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {/* FILTRI */}
      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 14, padding: 12 }}>
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Išči lokal, lastnika ali kodo…"
            style={{ flex: "1 1 200px", minWidth: 150, height: 38, border: `1px solid ${BORD}`, borderRadius: 10, background: BG, padding: "0 12px", fontFamily: JAK, fontSize: 13.5, color: INK, outline: "none" }}
          />
          <select value={fPlan} onChange={(e) => setFPlan(e.target.value as "all" | PlanKey)} style={fsel}>
            <option value="all">Vsi paketi</option>
            {PLAN_ORDER.map((p) => <option key={p} value={p}>{PLANS[p].label}</option>)}
          </select>
          <select value={fLang} onChange={(e) => setFLang(e.target.value)} style={fsel}>
            <option value="all">Vsi jeziki</option>
            {LANGS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} style={fsel}>
            <option value="new">Najnovejši</option>
            <option value="old">Najstarejši</option>
            <option value="customers">Največ strank</option>
            <option value="scans">Največ skenov 30d</option>
            <option value="rating">Najboljša ocena</option>
            <option value="name">Ime A–Ž</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 10 }}>
          <Chip active={activeOnly} onClick={() => { setActiveOnly((v) => !v); setNoScans(false); }}>Aktivni (sken v 30d)</Chip>
          <Chip active={noScans} onClick={() => { setNoScans((v) => !v); setActiveOnly(false); }}>Brez skenov</Chip>
          {anyFilter && <button onClick={clearFilters} style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: "none", color: CORAL, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>✕ Počisti filtre</button>}
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: MUTED }}>{list.length} {list.length === 1 ? "lokal" : "lokalov"}{anyFilter ? ` od ${total}` : ""}</div>

      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        {/* header */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: "2.2fr 2fr 0.8fr 0.9fr 0.8fr 1fr 40px", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${BORD}`, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED }}>
          <span>Lokal</span><span>Lastnik</span><span>Stranke</span><span>Skeni 30d</span><span>Ocena</span><span>Ustvarjen</span><span />
        </div>
        {list.length === 0 && <div style={{ padding: 28 }}><Empty>Ni zadetkov za te filtre.</Empty></div>}
        {list.map((v) => (
          <button
            key={v.id}
            onClick={() => onOpen(v)}
            className="grid w-full items-center hover:bg-[#F3EADB]"
            style={{ gridTemplateColumns: "2.2fr 2fr 0.8fr 0.9fr 0.8fr 1fr 40px", gap: 10, padding: "13px 16px", borderBottom: `1px solid ${BORD}`, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: JAK, transition: "background 0.12s" }}
          >
            <span className="flex items-center" style={{ gap: 10, minWidth: 0 }}>
              <Avatar name={v.name} color={v.brand_color} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 14, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</span>
                <span style={{ display: "block", fontSize: 11.5, color: MUTED }}>/{v.public_code}</span>
              </span>
            </span>
            <span style={{ fontSize: 13, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.ownerEmail || "—"}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{v.cCustomers}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: CORAL }}>{v.cScans30}</span>
            <span style={{ fontSize: 13.5 }}>{v.reviewAvg != null ? `${v.reviewAvg}★` : "—"}</span>
            <span style={{ fontSize: 13, color: MUTED }}>{fmtDate(v.created_at)}</span>
            <span style={{ color: MUTED, fontSize: 18, textAlign: "right" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- NAROČNINE ---------------- */

const PLAN_COLOR: Record<PlanKey, string> = { free: "#B4A892", espresso: AMBER, doppio: CORAL, palaca: GREEN };

function PlanBadge({ plan }: { plan: PlanKey }) {
  const c = PLAN_COLOR[plan] || MUTED;
  return (
    <span className="inline-flex items-center" style={{ gap: 6, height: 24, padding: "0 10px", borderRadius: 999, background: `${c}22`, color: plan === "free" ? MUTED : c, fontSize: 12, fontWeight: 800 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
      {PLANS[plan]?.label || plan}
    </span>
  );
}

function Narocnine({ revenue: r, venues, onOpen, onTrial }: { revenue: SARevenue; venues: SAVenue[]; onOpen: (v: SAVenue) => void; onTrial: number }) {
  const maxPlanMrr = Math.max(1, ...r.byPlan.map((p) => p.mrr));
  // primer letnega popusta na Doppio
  const dMonthly = PLANS.doppio.monthly || 0;

  // ---- filtri ----
  const [q, setQ] = useState("");
  const [fPlan, setFPlan] = useState<"all" | PlanKey>("all");
  const [fCycle, setFCycle] = useState<"all" | "monthly" | "yearly">("all");
  const [fStatus, setFStatus] = useState<"all" | SubStatus>("all");
  const [payingOnly, setPayingOnly] = useState(false);
  const [committedOnly, setCommittedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<"mrr_desc" | "mrr_asc" | "name" | "new" | "commit_desc">("mrr_desc");

  const me = (v: SAVenue) => monthlyEquivalent(v.plan, v.billing_cycle, v.custom_price_eur);
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const list = venues.filter((v) => {
      const plan = (v.plan ?? "free") as PlanKey;
      const cyc = v.billing_cycle ?? "monthly";
      const st = v.subscription_status ?? "active";
      if (qq && !(v.name.toLowerCase().includes(qq) || (v.ownerEmail || "").toLowerCase().includes(qq) || v.public_code.toLowerCase().includes(qq))) return false;
      if (fPlan !== "all" && plan !== fPlan) return false;
      if (fCycle !== "all" && (plan === "free" || cyc !== fCycle)) return false;
      if (fStatus !== "all" && st !== fStatus) return false;
      if (payingOnly && !isPaying(plan, st)) return false;
      if (committedOnly && !((v.commitment_months ?? 0) > 0)) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "sl");
      if (sortKey === "mrr_asc") return me(a) - me(b);
      if (sortKey === "new") return (b.subscribed_at || "").localeCompare(a.subscribed_at || "");
      if (sortKey === "commit_desc") return (b.commitment_months ?? 0) - (a.commitment_months ?? 0);
      const rank = (v: SAVenue) => (((v.plan ?? "free") !== "free") ? 1 : 0);
      return rank(b) - rank(a) || me(b) - me(a);
    });
    return list;
  }, [venues, q, fPlan, fCycle, fStatus, payingOnly, committedOnly, sortKey]);

  const filteredMrr = useMemo(
    () => Math.round(filtered.reduce((a, v) => a + (isPaying(v.plan, v.subscription_status) ? me(v) : 0), 0) * 100) / 100,
    [filtered], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const anyFilter = q.trim() !== "" || fPlan !== "all" || fCycle !== "all" || fStatus !== "all" || payingOnly || committedOnly;
  function clearFilters() {
    setQ(""); setFPlan("all"); setFCycle("all"); setFStatus("all"); setPayingOnly(false); setCommittedOnly(false);
  }

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <div style={{ background: "#FBF1DD", border: `1px solid #F0DDB4`, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: "#8A6A1E" }}>
        Predviden prihodek iz <strong>aktivnih naročnin</strong>. Pravi plačilni sistem (Stripe) še ni vključen — pakete za zdaj dodeljuješ ročno v urejevalniku lokala.
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Kpi label="MRR (mesečno)" value={fmtEur(r.mrr)} sub="ponavljajoči prihodek" accent={GREEN} />
        <Kpi label="ARR (letno)" value={fmtEur(r.arr)} accent={INK} />
        <Kpi label="Plačujoči lokali" value={String(r.paying)} sub={`${r.free} brezplačnih`} accent={CORAL} />
        <Kpi label="Povpr. / lokal" value={fmtEur(r.avgPerPaying)} sub="med plačujočimi" />
        <Kpi label="Mesečno / letno" value={`${r.monthlyCount} / ${r.yearlyCount}`} sub={`${r.committed} z vezavo`} />
        <Kpi label="Na trialu" value={String(onTrial)} sub="brezplačni preizkus" accent={AMBER} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {/* plani */}
        <Card>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Prihodek po paketih</div>
          <div className="flex flex-col" style={{ gap: 14 }}>
            {r.byPlan.map((p) => (
              <div key={p.plan} className="flex items-center" style={{ gap: 12 }}>
                <span style={{ width: 86, flexShrink: 0 }}><PlanBadge plan={p.plan} /></span>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: MUTED }}>{p.count} {p.count === 1 ? "lokal" : "lokalov"}</span>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>{fmtEur(p.mrr)}</span>
                  </div>
                  <div style={{ height: 7, background: BG, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${(p.mrr / maxPlanMrr) * 100}%`, height: "100%", background: PLAN_COLOR[p.plan], borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
            {r.paying === 0 && <Empty>Še nihče ne plačuje — dodeli paket lokalu.</Empty>}
          </div>
        </Card>

        {/* letni popust razlaga */}
        <Card>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Letni paketi</div>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
            Letno = <strong style={{ color: INK }}>2 meseca gratis</strong> (plačaš 10, dobiš 12 — nastaviš v <span style={{ fontFamily: "monospace", fontSize: 12 }}>lib/plans.ts</span>). Lokal plača vnaprej za leto, ti dobiš boljši cash-flow + manj odpovedi.
          </div>
          {PLAN_ORDER.filter((p) => PLANS[p].monthly).map((p) => {
            const m = PLANS[p].monthly || 0;
            const yearly = chargedAmount(p, "yearly");
            return (
              <div key={p} className="flex items-center justify-between" style={{ padding: "9px 0", borderTop: `1px solid ${BORD}` }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{PLANS[p].label}</span>
                <span style={{ fontSize: 13, color: MUTED }}>
                  {fmtEur(m)}/mes · <strong style={{ color: GREEN }}>{fmtEur(yearly)}/leto</strong>
                </span>
              </div>
            );
          })}
          <div style={{ fontSize: 11.5, color: "#A89B88", marginTop: 10 }}>Primer: Doppio letno prihrani {fmtEur(dMonthly * 2)} na leto (2 meseca).</div>
        </Card>
      </div>

      {/* FILTRI */}
      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 14, padding: 12 }}>
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Išči lokal, lastnika ali kodo…" style={{ flex: "1 1 200px", minWidth: 150, height: 38, border: `1px solid ${BORD}`, borderRadius: 10, background: BG, padding: "0 12px", fontFamily: JAK, fontSize: 13.5, color: INK, outline: "none" }} />
          <select value={fPlan} onChange={(e) => setFPlan(e.target.value as "all" | PlanKey)} style={fsel}>
            <option value="all">Vsi paketi</option>
            {PLAN_ORDER.map((p) => <option key={p} value={p}>{PLANS[p].label}</option>)}
          </select>
          <select value={fCycle} onChange={(e) => setFCycle(e.target.value as "all" | "monthly" | "yearly")} style={fsel}>
            <option value="all">Vsi cikli</option>
            <option value="monthly">Mesečno</option>
            <option value="yearly">Letno</option>
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value as "all" | SubStatus)} style={fsel}>
            <option value="all">Vsi statusi</option>
            {Object.keys(STATUS_LABEL).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} style={fsel}>
            <option value="mrr_desc">Cena ↓</option>
            <option value="mrr_asc">Cena ↑</option>
            <option value="name">Ime A–Ž</option>
            <option value="new">Najnovejša naročnina</option>
            <option value="commit_desc">Vezava ↓</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 10 }}>
          <Chip active={payingOnly} onClick={() => setPayingOnly((v) => !v)}>Samo plačujoči</Chip>
          <Chip active={committedOnly} onClick={() => setCommittedOnly((v) => !v)}>Z vezavo</Chip>
          {anyFilter && <button onClick={clearFilters} style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: "none", color: CORAL, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>✕ Počisti filtre</button>}
        </div>
      </div>

      {/* podseštevek */}
      <div className="flex items-center justify-between" style={{ padding: "0 2px" }}>
        <span style={{ fontSize: 12.5, color: MUTED }}>{filtered.length} {filtered.length === 1 ? "lokal" : "lokalov"}{anyFilter ? ` od ${venues.length}` : ""}</span>
        <span style={{ fontSize: 12.5, color: MUTED }}>MRR prikazanih: <strong style={{ color: GREEN }}>{fmtEur(filteredMrr)}</strong></span>
      </div>

      {/* tabela naročnin */}
      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        <div className="hidden md:grid" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr 1fr 0.9fr", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${BORD}`, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED }}>
          <span>Lokal</span><span>Paket</span><span>Cikel</span><span>Cena</span><span>Status</span><span>Vezava</span>
        </div>
        {filtered.length === 0 && <div style={{ padding: 28 }}><Empty>Ni zadetkov za te filtre.</Empty></div>}
        {filtered.map((v) => {
          const plan = (v.plan ?? "free") as PlanKey;
          const me = monthlyEquivalent(plan, v.billing_cycle, v.custom_price_eur);
          const yearly = v.billing_cycle === "yearly";
          return (
            <button
              key={v.id}
              onClick={() => onOpen(v)}
              className="grid w-full items-center hover:bg-[#F3EADB]"
              style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr 1fr 0.9fr", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${BORD}`, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: JAK }}
            >
              <span className="flex items-center" style={{ gap: 10, minWidth: 0 }}>
                <Avatar name={v.name} color={v.brand_color} />
                <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</span>
              </span>
              <span><PlanBadge plan={plan} /></span>
              <span style={{ fontSize: 13, color: MUTED }}>{plan === "free" ? "—" : yearly ? "letno" : "mesečno"}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                {plan === "free" ? <span style={{ color: "#B4A892", fontWeight: 600 }}>0 €</span> : (
                  <>{fmtEur(me)}<span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>/mes</span></>
                )}
              </span>
              <span style={{ fontSize: 12.5, color: v.subscription_status === "canceled" ? CORAL : v.subscription_status === "past_due" ? "#B4781E" : MUTED }}>{STATUS_LABEL[v.subscription_status ?? "active"] || "—"}</span>
              <span style={{ fontSize: 12.5, color: MUTED }}>{(v.commitment_months ?? 0) > 0 ? `${v.commitment_months} mes` : "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- LASTNIKI ---------------- */

function Lastniki({ owners }: { owners: SAOwner[] }) {
  const [q, setQ] = useState("");
  const [vf, setVf] = useState<"all" | "with" | "without">("all");
  const [sortKey, setSortKey] = useState<"venues" | "new" | "signin" | "email">("venues");

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const l = owners.filter((o) => {
      if (qq && !((o.email || "").toLowerCase().includes(qq) || o.venueNames.some((n) => n.toLowerCase().includes(qq)))) return false;
      if (vf === "with" && o.venueNames.length === 0) return false;
      if (vf === "without" && o.venueNames.length > 0) return false;
      return true;
    });
    l.sort((a, b) => {
      switch (sortKey) {
        case "new": return (b.created_at || "").localeCompare(a.created_at || "");
        case "signin": return (b.last_sign_in_at || "").localeCompare(a.last_sign_in_at || "");
        case "email": return (a.email || "").localeCompare(b.email || "");
        default: return b.venueNames.length - a.venueNames.length;
      }
    });
    return l;
  }, [owners, q, vf, sortKey]);
  const anyFilter = q.trim() !== "" || vf !== "all";

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {/* FILTRI */}
      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 14, padding: 12 }}>
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Išči po emailu ali lokalu…"
            style={{ flex: "1 1 200px", minWidth: 150, height: 38, border: `1px solid ${BORD}`, borderRadius: 10, background: BG, padding: "0 12px", fontFamily: JAK, fontSize: 13.5, color: INK, outline: "none" }}
          />
          <select value={vf} onChange={(e) => setVf(e.target.value as "all" | "with" | "without")} style={fsel}>
            <option value="all">Vsi uporabniki</option>
            <option value="with">Samo z lokalom</option>
            <option value="without">Brez lokala</option>
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} style={fsel}>
            <option value="venues">Največ lokalov</option>
            <option value="new">Najnovejši</option>
            <option value="signin">Zadnja prijava</option>
            <option value="email">Email A–Ž</option>
          </select>
          {anyFilter && <button onClick={() => { setQ(""); setVf("all"); }} style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: "none", color: CORAL, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>✕ Počisti</button>}
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: MUTED }}>{list.length} {list.length === 1 ? "uporabnik" : "uporabnikov"}{anyFilter ? ` od ${owners.length}` : ""}</div>

      <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        <div className="hidden md:grid" style={{ gridTemplateColumns: "2fr 2.4fr 1fr 1fr", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${BORD}`, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED }}>
          <span>Email</span><span>Lokali</span><span>Ustvarjen</span><span>Zadnja prijava</span>
        </div>
        {list.length === 0 && <div style={{ padding: 28 }}><Empty>Ni zadetkov.</Empty></div>}
        {list.map((o) => (
        <div key={o.id} className="grid items-center" style={{ gridTemplateColumns: "2fr 2.4fr 1fr 1fr", gap: 10, padding: "13px 16px", borderBottom: `1px solid ${BORD}` }}>
          <span style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.email || "—"}</span>
          <span style={{ fontSize: 13, color: MUTED }}>
            {o.venueNames.length ? (
              <span><strong style={{ color: INK }}>{o.venueNames.length}</strong> · {o.venueNames.join(", ")}</span>
            ) : (
              <span style={{ color: "#B4A892" }}>brez lokala</span>
            )}
          </span>
          <span style={{ fontSize: 12.5, color: MUTED }}>{fmtDate(o.created_at)}</span>
          <span style={{ fontSize: 12.5, color: MUTED }}>{relTime(o.last_sign_in_at)}</span>
        </div>
      ))}
      </div>
    </div>
  );
}

/* ---------------- SPOROČILA (super-admin → lastniki) ---------------- */

function Sporocila() {
  const [pending, start] = useTransition();
  const [segment, setSegment] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  function send() {
    setResult("");
    const fd = new FormData();
    fd.set("segment", segment);
    fd.set("subject", subject);
    fd.set("message", message);
    start(async () => {
      try {
        const r = await sendOwnerCampaign(fd);
        if (r.error) setResult("⚠ " + r.error);
        else setResult(`Poslano: ${r.sent}/${r.total}${r.failed ? ` · ${r.failed} ni uspelo` : ""}.`);
      } catch (e) {
        setResult("⚠ " + (e instanceof Error ? e.message : "Napaka."));
      }
    });
  }
  return (
    <div className="flex flex-col" style={{ gap: 16, maxWidth: 620 }}>
      <div style={{ background: "#FBF1DD", border: "1px solid #F0DDB4", borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: "#8A6A1E" }}>
        Pošlji ponudbo / novico <strong>lastnikom lokalov</strong> (ne gostom). Maili gredo prek Resend iz Loyavi domene — rabi <span style={{ fontFamily: "monospace", fontSize: 12 }}>RESEND_API_KEY</span> + verificirano domeno (SPF/DKIM/DMARC).
      </div>
      <Card>
        <div className="flex flex-col" style={{ gap: 12 }}>
          <label className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED }}>Komu</span>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              <option value="all">Vsi lastniki</option>
              <option value="paying">Plačujoči</option>
              <option value="trial">Na trialu</option>
              <option value="free">Brezplačni / potekli</option>
            </select>
          </label>
          <label className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED }}>Zadeva</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="npr. Nova funkcija: avtomatizacije" style={inp} />
          </label>
          <label className="flex flex-col" style={{ gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED }}>Sporočilo</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} placeholder="Pozdravljeni, …" style={{ ...inp, height: "auto", padding: "12px 13px", resize: "vertical", lineHeight: 1.5 }} />
          </label>
          <div className="flex items-center" style={{ gap: 12 }}>
            <button onClick={send} disabled={pending} style={{ height: 46, padding: "0 24px", border: "none", borderRadius: 13, background: INK, color: CREAM, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>{pending ? "Pošiljam…" : "Pošlji lastnikom"}</button>
            {result && <span style={{ fontSize: 13, fontWeight: 700, color: result.startsWith("⚠") ? CORAL : GREEN }}>{result}</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- VENUE MODAL (uredi katerikoli lokal) ---------------- */

function VenueModal({ venue, onClose }: { venue: SAVenue; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState(venue.name);
  const [color, setColor] = useState(venue.brand_color || "#C4623D");
  const [pts, setPts] = useState(String(venue.points_per_visit ?? 0));
  const [goal, setGoal] = useState(String(venue.stamp_goal ?? 10));
  const [windowH, setWindowH] = useState(String(venue.scan_window_hours ?? 24));
  const [cooldown, setCooldown] = useState(String(venue.scan_cooldown_minutes ?? 0));
  const [lang, setLang] = useState(venue.language || "sl");
  const [google, setGoogle] = useState(venue.google_review_url || "");
  const [davcna, setDavcna] = useState(venue.davcna_stevilka || "");
  const [plan, setPlan] = useState<PlanKey>((venue.plan ?? "free") as PlanKey);
  const [cycle, setCycle] = useState<"monthly" | "yearly">(venue.billing_cycle === "yearly" ? "yearly" : "monthly");
  const [subStatus, setSubStatus] = useState(venue.subscription_status || "active");
  const [commit, setCommit] = useState(String(venue.commitment_months ?? 0));
  const [customPrice, setCustomPrice] = useState(venue.custom_price_eur != null ? String(venue.custom_price_eur) : "");

  const cp = customPrice.trim() ? Number(customPrice.replace(",", ".")) : null;
  const meNow = monthlyEquivalent(plan, cycle, cp);
  const yearlyNow = chargedAmount(plan, "yearly", cp);

  const [trialDays, setTrialDays] = useState("14");
  const [trialMsg, setTrialMsg] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  useEffect(() => {
    let on = true;
    adminVenueLog(venue.id).then((l) => { if (on) { setLog(l); setLogLoading(false); } }).catch(() => { if (on) setLogLoading(false); });
    return () => { on = false; };
  }, [venue.id]);
  function extendTrial() {
    setTrialMsg("");
    const fd = new FormData();
    fd.set("venue_id", venue.id);
    fd.set("days", trialDays);
    startTransition(async () => {
      try {
        await adminExtendTrial(fd);
        setTrialMsg("✓ Trial podaljšan");
        router.refresh();
        setTimeout(() => setTrialMsg(""), 2200);
      } catch (e) {
        setTrialMsg(e instanceof Error ? e.message : "Napaka.");
      }
    });
  }

  function save() {
    setErr("");
    setSaved(false);
    const fd = new FormData();
    fd.set("venue_id", venue.id);
    fd.set("name", name);
    fd.set("brand_color", color);
    fd.set("points_per_visit", pts);
    fd.set("stamp_goal", goal);
    fd.set("scan_window_hours", windowH);
    fd.set("scan_cooldown_minutes", cooldown);
    fd.set("language", lang);
    fd.set("google_review_url", google);
    fd.set("davcna_stevilka", davcna);
    fd.set("plan", plan);
    fd.set("billing_cycle", cycle);
    fd.set("subscription_status", subStatus);
    fd.set("commitment_months", commit);
    fd.set("custom_price_eur", customPrice);
    startTransition(async () => {
      try {
        await adminUpdateVenue(fd);
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2200);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Napaka pri shranjevanju.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(26,18,13,0.5)", fontFamily: JAK }} onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[480px] flex-col"
        style={{ background: BG, boxShadow: "-20px 0 50px rgba(0,0,0,0.2)", animation: "slideInRight 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between" style={{ padding: "18px 20px", borderBottom: `1px solid ${BORD}`, background: CREAM }}>
          <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
            <Avatar name={venue.name} color={venue.brand_color} big />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{venue.name}</div>
              <div style={{ fontSize: 12.5, color: MUTED }}>/{venue.public_code} · {venue.ownerEmail || "brez lastnika"}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Zapri" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${BORD}`, background: CREAM, cursor: "pointer", fontSize: 18, color: MUTED, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {/* mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
            <Stat label="Stranke" value={venue.cCustomers} />
            <Stat label="Skeni" value={venue.cScans} />
            <Stat label="30 dni" value={venue.cScans30} accent={CORAL} />
            <Stat label="Ocena" value={venue.reviewAvg != null ? `${venue.reviewAvg}★` : "—"} accent={AMBER} />
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18 }}>
            Zadnji sken: <strong style={{ color: INK }}>{relTime(venue.lastScan)}</strong> · Unovčenj: <strong style={{ color: INK }}>{venue.cRedemptions}</strong>
          </div>

          {/* links */}
          <div className="flex" style={{ gap: 8, marginBottom: 16 }}>
            <a href={`/p/${venue.public_code}`} target="_blank" rel="noreferrer" style={linkBtn}>Gostova stran ↗</a>
            <a href={`/p/${venue.public_code}/spin`} target="_blank" rel="noreferrer" style={linkBtn}>Kolo ↗</a>
          </div>

          {/* TRIAL */}
          <div style={{ marginBottom: 20, background: PAPER, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 8 }}>Trial do: <strong style={{ color: INK }}>{venue.trial_ends_at ? fmtDate(venue.trial_ends_at) : "—"}</strong></div>
            <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
              <input value={trialDays} onChange={(e) => setTrialDays(e.target.value)} type="number" style={{ ...inp, width: 76, height: 38 }} />
              <span style={{ fontSize: 13, color: MUTED }}>dni</span>
              <button onClick={extendTrial} disabled={pending} style={{ height: 38, padding: "0 14px", border: "none", borderRadius: 10, background: GREEN, color: "#F4F0E4", fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>+ Podaljšaj trial</button>
              {trialMsg && <span style={{ fontSize: 12.5, color: GREEN, fontWeight: 700 }}>{trialMsg}</span>}
            </div>
          </div>

          {/* DNEVNIK */}
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Dnevnik</div>
          <div style={{ background: PAPER, borderRadius: 12, maxHeight: 220, overflowY: "auto", marginBottom: 20 }}>
            {logLoading ? (
              <div style={{ padding: 14, fontSize: 13, color: MUTED, textAlign: "center" }}>Nalagam…</div>
            ) : log.length === 0 ? (
              <div style={{ padding: 14, fontSize: 13, color: MUTED, textAlign: "center" }}>Ni dogodkov.</div>
            ) : (
              log.map((e, i) => {
                const lc = e.type === "sken" ? GREEN : e.type === "unovčenje" ? CORAL : e.type === "ročno" ? AMBER : INK;
                return (
                  <div key={i} className="flex items-center justify-between" style={{ padding: "9px 13px", borderTop: i ? `1px solid ${BORD}` : "none", gap: 10 }}>
                    <span style={{ fontSize: 12.5, minWidth: 0 }}><span style={{ fontWeight: 700, color: lc }}>{e.type}</span> <span style={{ color: MUTED }}>· {e.detail}</span></span>
                    <span style={{ fontSize: 11.5, color: "#A89B88", whiteSpace: "nowrap", flexShrink: 0 }}>{relTime(e.when)}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* EDIT */}
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 10 }}>Uredi nastavitve</div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            <Field label="Ime lokala"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
            <Field label="Barva znamke">
              <div className="flex items-center" style={{ gap: 10 }}>
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#C4623D"} onChange={(e) => setColor(e.target.value)} style={{ width: 46, height: 40, border: `1px solid ${BORD}`, borderRadius: 10, background: CREAM, cursor: "pointer", padding: 2 }} />
                <input value={color} onChange={(e) => setColor(e.target.value)} style={{ ...inp, flex: 1 }} />
              </div>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Točke / obisk"><input type="number" value={pts} onChange={(e) => setPts(e.target.value)} style={inp} /></Field>
              <Field label="Žig-cilj (4–12)"><input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} style={inp} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Časovno okno (h)"><input type="number" value={windowH} onChange={(e) => setWindowH(e.target.value)} style={inp} /></Field>
              <Field label="Cooldown (min)"><input type="number" value={cooldown} onChange={(e) => setCooldown(e.target.value)} style={inp} /></Field>
            </div>
            <Field label="Jezik gostovega vmesnika">
              <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {LANGS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
              </select>
            </Field>
            <Field label="Google-ocene URL"><input value={google} onChange={(e) => setGoogle(e.target.value)} placeholder="https://g.page/r/…" style={inp} /></Field>
            <Field label="Davčna številka (8 mest)"><input value={davcna} onChange={(e) => setDavcna(e.target.value)} placeholder="npr. 12345678" style={inp} /></Field>
          </div>

          {/* NAROČNINA */}
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, margin: "22px 0 10px" }}>Naročnina</div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Paket">
                <select value={plan} onChange={(e) => setPlan(e.target.value as PlanKey)} style={{ ...inp, cursor: "pointer" }}>
                  {PLAN_ORDER.map((p) => <option key={p} value={p}>{PLANS[p].label}</option>)}
                </select>
              </Field>
              <Field label="Obračun">
                <select value={cycle} onChange={(e) => setCycle(e.target.value as "monthly" | "yearly")} style={{ ...inp, cursor: "pointer" }}>
                  <option value="monthly">Mesečno</option>
                  <option value="yearly">Letno (2 mes. gratis)</option>
                </select>
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Status">
                <select value={subStatus} onChange={(e) => setSubStatus(e.target.value as SubStatus)} style={{ ...inp, cursor: "pointer" }}>
                  {Object.keys(STATUS_LABEL).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </Field>
              <Field label="Vezava (mesecev)"><input type="number" value={commit} onChange={(e) => setCommit(e.target.value)} style={inp} /></Field>
            </div>
            <Field label="Cena po meri (€/mes — povozi paket)"><input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder={plan === "palaca" ? "npr. 149,99" : "prazno = paketna cena"} style={inp} /></Field>
            {plan !== "free" && (
              <div style={{ background: PAPER, borderRadius: 11, padding: "10px 13px", fontSize: 12.5, color: MUTED }}>
                Prispevek k MRR: <strong style={{ color: GREEN }}>{fmtEur(meNow)}/mes</strong>
                {cycle === "yearly" && <> · letni obračun <strong style={{ color: INK }}>{fmtEur(yearlyNow)}</strong></>}
              </div>
            )}
          </div>

          {err && <div style={{ fontSize: 13, color: CORAL, fontWeight: 600, marginTop: 12 }}>{err}</div>}
        </div>

        {/* footer save */}
        <div className="flex items-center justify-between" style={{ padding: "14px 20px", borderTop: `1px solid ${BORD}`, background: CREAM, gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, opacity: saved ? 1 : 0, transition: "opacity 0.2s" }}>✓ Shranjeno</span>
          <button onClick={save} disabled={pending} style={{ height: 46, padding: "0 26px", borderRadius: 13, border: "none", background: INK, color: CREAM, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
            {pending ? "Shranjujem…" : "Shrani spremembe"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

const inp: React.CSSProperties = { height: 44, width: "100%", border: `1px solid ${BORD}`, borderRadius: 11, background: CREAM, padding: "0 13px", fontFamily: JAK, fontSize: 14.5, color: INK, outline: "none" };
const fsel: React.CSSProperties = { height: 38, border: `1px solid ${BORD}`, borderRadius: 10, background: BG, padding: "0 10px", fontFamily: JAK, fontSize: 13, fontWeight: 600, color: INK, cursor: "pointer", outline: "none" };
const linkBtn: React.CSSProperties = { flex: 1, textAlign: "center", height: 42, lineHeight: "42px", borderRadius: 11, border: `1px solid ${BORD}`, background: CREAM, color: INK, fontSize: 13.5, fontWeight: 700, textDecoration: "none" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED }}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: CREAM, border: `1px solid ${BORD}`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent || INK }}>{value}</div>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function Avatar({ name, color, big }: { name: string; color?: string; big?: boolean }) {
  const s = big ? 44 : 34;
  return (
    <span style={{ width: s, height: s, borderRadius: big ? 13 : 10, background: color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : CORAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: big ? 19 : 15, flexShrink: 0 }}>
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13.5, color: MUTED, textAlign: "center", padding: "8px 0" }}>{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ height: 30, padding: "0 13px", borderRadius: 999, border: `1px solid ${active ? INK : BORD}`, background: active ? INK : "transparent", color: active ? CREAM : MUTED, fontFamily: JAK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
