"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Venue, Reward, Customer, ScanRow, RedemptionRow } from "@/lib/types";
import { updateVenueSettings, activateScanning, saveReward, deleteReward, addManualPoints, signOut } from "@/app/actions";
import Scanner from "@/app/components/Scanner";
import QrCode from "./QrCode";

const JAK = "var(--font-jakarta), sans-serif";
const INK = "#2A241D";
const PAPER = "#FBF3E6";
const CREAM = "#FBF7F0";
const AMBER = "#E2A04A";
const CORAL = "#C4623D";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORD = "#EFE6D6";

type IcName = "grid" | "chart" | "clock" | "users" | "mega" | "qr" | "sliders";
function Ic({ name, color = INK, size = 20 }: { name: IcName; color?: string; size?: number }) {
  const st = { fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const p: Record<IcName, React.ReactNode> = {
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" style={st} />,
    chart: <path d="M5 19v-7M12 19V5M19 19v-10" style={st} />,
    clock: <><circle cx={12} cy={12} r={8.5} style={st} /><path d="M12 8v4.4l2.8 2" style={st} /></>,
    users: <><circle cx={9} cy={8} r={3.2} style={st} /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" style={st} /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3" style={st} /></>,
    mega: <><path d="M18 6 7 9.8H4.5v4.4H7L18 18V6Z" style={st} /><path d="M8.5 14.8 9.6 19h2" style={st} /></>,
    qr: <><path d="M4.5 4.5h5.5V10H4.5zM14 4.5h5.5V10H14zM4.5 14h5.5v5.5H4.5z" style={st} /><path d="M14 14h2.3v2.3H14zM17.4 17.4h2.1v2.1h-2.1z" style={st} /></>,
    sliders: <><path d="M4 7.5h16M4 12h16M4 16.5h16" style={st} /><circle cx={15} cy={7.5} r={2.1} style={st} /><circle cx={8.5} cy={12} r={2.1} style={st} /><circle cx={16} cy={16.5} r={2.1} style={st} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{p[name]}</svg>;
}

const NAV: [string, string, IcName][] = [["pregled", "Pregled", "grid"], ["zgodovina", "Zgodovina", "clock"], ["stranke", "Stranke", "users"], ["sistem", "Sistem", "qr"], ["nastavitve", "Nastavitve", "sliders"]];
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${BORD}`, borderRadius: 18, padding: 22 };
const inp: React.CSSProperties = { height: 46, width: "100%", border: "1.5px solid #E4D9C7", borderRadius: 12, background: "#fff", padding: "0 14px", fontFamily: JAK, fontSize: 14.5, color: INK, outline: "none", boxSizing: "border-box" };
function fmt(ts: string) { return new Date(ts).toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }

export default function Dashboard({ venue, rewards, customers, scans, redemptions, ownerEmail }: { venue: Venue; rewards: Reward[]; customers: Customer[]; scans: ScanRow[]; redemptions: RedemptionRow[]; ownerEmail: string }) {
  const router = useRouter();
  const [sec, setSec] = useState("pregled");
  const [scanning, setScanning] = useState(false);
  const [histTab, setHistTab] = useState<"given" | "redeemed">("given");
  const [msg, setMsg] = useState<string | null>(null);
  const title = NAV.find((n) => n[0] === sec)?.[1] || "Pregled";

  const stats = useMemo(() => {
    const pointsAwarded = scans.reduce((a, s) => a + s.points_awarded, 0);
    const pointsRedeemed = redemptions.reduce((a, r) => a + r.points_spent, 0);
    const visits = new Map<string, { visits: number; last: string }>();
    for (const s of scans) { const cur = visits.get(s.customer_id) ?? { visits: 0, last: s.created_at }; cur.visits += 1; if (s.created_at > cur.last) cur.last = s.created_at; visits.set(s.customer_id, cur); }
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); days.push({ label: key.slice(5), count: scans.filter((s) => s.created_at.slice(0, 10) === key).length }); }
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    return { pointsAwarded, pointsRedeemed, avgVisits: customers.length ? (scans.length / customers.length).toFixed(1) : "0", visits, days, maxDay };
  }, [scans, redemptions, customers]);

  const topCustomers = useMemo(() => [...customers].sort((a, b) => b.points - a.points).slice(0, 4), [customers]);

  function flash(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000); }
  async function run(fn: () => Promise<unknown>, ok?: string) { try { await fn(); if (ok) flash(ok); router.refresh(); } catch (e) { flash(e instanceof Error ? e.message : "Napaka."); } }
  async function handleActivate(payload: string) { setScanning(false); await run(async () => { const d = await activateScanning(payload); flash(`Skeniranje aktivno — davčna ${d}.`); }); }

  const Kpi = ({ l, v, d, dc }: { l: string; v: React.ReactNode; d?: string; dc?: string }) => <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#9A8F80" }}>{l}</span><span style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.01em" }}>{v}</span>{d && <span style={{ fontSize: 12, fontWeight: 700, color: dc || "#9A8F80" }}>{d}</span>}</div>;

  return (
    <main style={{ background: "#E9E2D6", fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto" style={{ maxWidth: 1180, padding: "0 0 40px" }}>
        <div className="lg:my-6 lg:overflow-hidden lg:rounded-[18px] lg:border lg:border-[#D9CDBA] lg:shadow-[0_30px_70px_rgba(34,28,22,0.18)]" style={{ background: "#fff" }}>
          <div className="flex" style={{ minHeight: "100dvh" }}>
            {/* SIDEBAR */}
            <div className="hidden flex-col lg:flex" style={{ width: 248, flexShrink: 0, background: "#fff", borderRight: `1px solid ${BORD}`, padding: "22px 16px" }}>
              <div className="flex items-center" style={{ gap: 10, padding: "0 8px 18px", borderBottom: "1px solid #F1E8D9", marginBottom: 16 }}>
                <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 13, background: INK, color: PAPER, fontWeight: 800, fontSize: 18 }}>{venue.name.charAt(0).toUpperCase()}</div>
                <div className="flex flex-col" style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}><span className="truncate" style={{ fontWeight: 800, fontSize: 15 }}>{venue.name}</span><span className="truncate" style={{ fontSize: 12, color: "#9A8F80" }}>{(venue as { city?: string }).city || "tally.app"}</span></div>
              </div>
              <div className="flex flex-col" style={{ gap: 3 }}>{NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex items-center" style={{ gap: 12, height: 44, padding: "0 12px", border: "none", borderRadius: 12, background: on ? "#FCEFD8" : "transparent", color: on ? INK : MUTED, fontFamily: JAK, fontSize: 14.5, fontWeight: on ? 700 : 600, cursor: "pointer", textAlign: "left" }}><Ic name={icon} color={on ? INK : "#A89B88"} size={20} /><span>{label}</span></button>; })}</div>
              <form action={signOut} className="flex items-center" style={{ marginTop: "auto", gap: 10, padding: "12px 8px 0", borderTop: "1px solid #F1E8D9" }}><button style={{ fontSize: 13, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>Odjava · {ownerEmail}</button></form>
            </div>

            {/* MAIN */}
            <div className="flex flex-1 flex-col" style={{ minWidth: 0, background: CREAM }}>
              <div className="flex items-center justify-between" style={{ minHeight: 64, flexShrink: 0, borderBottom: `1px solid ${BORD}`, padding: "12px 20px" }}>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>{title}</div>
                <form action={signOut} className="lg:hidden"><button style={{ fontSize: 13, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", fontFamily: JAK }}>Odjava</button></form>
              </div>
              <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden" style={{ borderBottom: `1px solid ${BORD}` }}>{NAV.map(([id, label, icon]) => { const on = id === sec; return <button key={id} onClick={() => setSec(id)} className="flex flex-shrink-0 items-center gap-1.5" style={{ height: 34, padding: "0 12px", borderRadius: 10, border: "none", background: on ? INK : "#fff", color: on ? PAPER : MUTED, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Ic name={icon} color={on ? PAPER : "#A89B88"} size={15} />{label}</button>; })}</div>

              <div style={{ flex: 1, padding: "20px clamp(16px,2.5vw,28px)" }}>
                {!venue.davcna_stevilka && <div style={{ marginBottom: 18, borderRadius: 14, background: "#FCEFD8", border: "1px solid #F0D9A8", padding: "14px 16px", fontSize: 13.5, color: "#7A5E1E", lineHeight: 1.5 }}>⚠️ Skeniranje še ni aktivno. V <b>Sistem</b> aktiviraj z vzorčnim računom.</div>}

                {sec === "pregled" && (
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                      <Kpi l="Skeniranja" v={scans.length} d={`${stats.pointsAwarded} podarjenih točk`} dc={GREEN} />
                      <Kpi l="Stranke" v={customers.length} />
                      <Kpi l="Povp. obiski / stranko" v={stats.avgVisits} />
                      <Kpi l="Unovčene točke" v={stats.pointsRedeemed} dc={CORAL} />
                    </div>
                    <div className="grid gap-3.5 lg:grid-cols-[1.6fr_1fr]">
                      <div style={card}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Skeniranja (zadnjih 14 dni)</div><div className="flex items-end" style={{ gap: 5, height: 150 }}>{stats.days.map((d) => <div key={d.label} className="flex flex-1 flex-col items-center justify-end" style={{ gap: 5, height: "100%" }}><div style={{ width: "100%", height: `${Math.round((d.count / stats.maxDay) * 130)}px`, minHeight: d.count ? 4 : 0, borderRadius: "5px 5px 2px 2px", background: AMBER }} /><span style={{ fontSize: 9, color: "#B5AB9C" }}>{d.label}</span></div>)}</div></div>
                      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><span style={{ fontWeight: 700, fontSize: 15 }}>Najboljše stranke</span>{topCustomers.length === 0 && <span style={{ fontSize: 13.5, color: "#9A8F80" }}>Še ni strank.</span>}{topCustomers.map((c, i) => <div key={c.id} className="flex items-center" style={{ gap: 11 }}><div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: "50%", background: "#FCEFD8", color: "#B4781E", fontWeight: 800, fontSize: 12 }}>{i + 1}</div><span className="flex-1 truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{c.email || c.phone || "—"}</span><span style={{ fontSize: 13, fontWeight: 700, color: "#B4862F" }}>{c.points} t</span></div>)}</div>
                    </div>
                  </div>
                )}

                {sec === "zgodovina" && (
                  <div className="flex flex-col" style={{ gap: 16 }}>
                    <div className="flex" style={{ background: "#F1E8D9", borderRadius: 12, padding: 4, width: 280 }}>{(["given", "redeemed"] as const).map((t) => <button key={t} onClick={() => setHistTab(t)} style={{ flex: 1, height: 36, border: "none", borderRadius: 9, background: histTab === t ? "#fff" : "transparent", color: histTab === t ? INK : "#9A8F80", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t === "given" ? "Podarjene" : "Unovčene"}</button>)}</div>
                    <div style={{ ...card, padding: "6px 22px" }}>
                      {histTab === "given" ? (scans.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>Ni zapisov.</div> : scans.map((s, i) => <div key={s.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div style={{ minWidth: 0 }}><div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{s.customers?.phone ?? "—"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{fmt(s.created_at)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>+{s.points_awarded}</span></div>))
                        : (redemptions.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13.5, color: "#9A8F80" }}>Ni zapisov.</div> : redemptions.map((r, i) => <div key={r.id} className="flex items-center justify-between" style={{ padding: "14px 0", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div style={{ minWidth: 0 }}><div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>{r.customers?.phone ?? "—"} · {r.rewards?.name ?? "nagrada"}</div><div style={{ fontSize: 12.5, color: "#9A8F80" }}>{fmt(r.created_at)}</div></div><span style={{ fontSize: 14, fontWeight: 700, color: CORAL, whiteSpace: "nowrap" }}>−{r.points_spent}</span></div>))}
                    </div>
                  </div>
                )}

                {sec === "stranke" && (
                  <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                    <div className="hidden items-center sm:flex" style={{ gap: 14, padding: "14px 22px", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A89B88", background: "#FBF6EC" }}><div style={{ flex: 1 }}>Stranka</div><div style={{ width: 70, textAlign: "right" }}>Točke</div><div style={{ width: 70, textAlign: "right" }}>Obiski</div><div style={{ width: 120, textAlign: "right" }}>Zadnji</div><div style={{ width: 90, textAlign: "right" }}>Ročno</div></div>
                    {customers.length === 0 && <div style={{ padding: "28px 0", textAlign: "center", fontSize: 14, color: "#9A8F80" }}>Še ni strank.</div>}
                    {customers.map((c, i) => { const v = stats.visits.get(c.id); return <div key={c.id} className="flex items-center" style={{ gap: 14, padding: "13px 22px", borderTop: i ? "1px solid #F4ECDF" : "none" }}><div className="flex flex-1 items-center truncate" style={{ fontSize: 14, fontWeight: 600, minWidth: 0 }}>{c.email ?? c.phone ?? "—"}</div><div style={{ width: 70, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "#B4862F" }}>{c.points}</div><div className="hidden sm:block" style={{ width: 70, textAlign: "right", fontSize: 13.5, color: MUTED }}>{v?.visits ?? 0}</div><div className="hidden sm:block" style={{ width: 120, textAlign: "right", fontSize: 13, color: "#9A8F80" }}>{v ? fmt(v.last) : "—"}</div><div style={{ width: 90, textAlign: "right" }}><button onClick={() => { const n = Number(window.prompt(`Dodaj točke za ${c.email ?? c.phone ?? "stranko"}:`, "10")); if (n) run(() => addManualPoints(c.id, n), "Točke dodane."); }} style={{ border: "1px solid #E4D9C7", borderRadius: 9, padding: "5px 9px", fontSize: 12, fontWeight: 700, background: "#fff", cursor: "pointer", fontFamily: JAK }}>+ točke</button></div></div>; })}
                  </div>
                )}

                {sec === "sistem" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}><span style={{ fontWeight: 700, fontSize: 15 }}>QR koda lokala</span><span style={{ fontSize: 13, color: "#9A8F80", lineHeight: 1.5 }}>Natisni in postavi na pult. Gostje skenirajo → odpre se njihova stran zvestobe.</span><QrCode path={`/p/${venue.public_code}`} accent={AMBER} /></div>
                    <div className="flex flex-col" style={{ gap: 16 }}>
                      <div style={{ background: "#fff", border: `2px solid ${venue.davcna_stevilka ? GREEN : AMBER}`, borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="flex items-center justify-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Skeniranje računov</span><span style={{ height: 26, padding: "0 11px", borderRadius: 999, background: venue.davcna_stevilka ? "rgba(94,127,82,0.16)" : "#FCEFD8", color: venue.davcna_stevilka ? "#3E5536" : "#B4781E", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center" }}>{venue.davcna_stevilka ? "Aktivno" : "Ni aktivno"}</span></div>
                        {venue.davcna_stevilka ? <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Sprejemamo račune z davčno <b>{venue.davcna_stevilka}</b>. Točke prinesejo samo tvoji računi.</span> : <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Skeniraj vzorčni račun, da preberemo davčno številko izdajatelja.</span>}
                        <button onClick={() => setScanning(true)} style={{ height: 44, border: "none", borderRadius: 12, background: AMBER, color: INK, fontFamily: JAK, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{venue.davcna_stevilka ? "Ponovno aktiviraj" : "Aktiviraj skeniranje"}</button>
                      </div>
                    </div>
                  </div>
                )}

                {sec === "nastavitve" && (
                  <div className="flex flex-col" style={{ gap: 16, maxWidth: 560 }}>
                    {/* nagrade */}
                    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Nagrade</span>
                      {rewards.map((r) => (
                        <form key={r.id} action={async (fd) => { await saveReward(fd); router.refresh(); flash("Nagrada shranjena."); }} className="flex items-center" style={{ gap: 8 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input name="name" defaultValue={r.name} style={{ ...inp, flex: 1 }} />
                          <input name="points_required" type="number" defaultValue={String(r.points_required)} style={{ ...inp, width: 80 }} />
                          <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shrani</button>
                          <button type="button" onClick={async () => { await deleteReward(r.id); router.refresh(); flash("Nagrada izbrisana."); }} style={{ height: 46, width: 40, border: "1px solid #E4D9C7", borderRadius: 12, background: "#fff", color: CORAL, cursor: "pointer", fontFamily: JAK }}>✕</button>
                        </form>
                      ))}
                      <form action={async (fd) => { await saveReward(fd); router.refresh(); flash("Nagrada dodana."); }} className="flex items-center" style={{ gap: 8, borderTop: "1px solid #F1E8D9", paddingTop: 12, marginTop: 4 }}>
                        <input name="name" placeholder="Nova nagrada" style={{ ...inp, flex: 1 }} />
                        <input name="points_required" type="number" placeholder="točke" style={{ ...inp, width: 80 }} />
                        <button style={{ height: 46, padding: "0 14px", border: "none", borderRadius: 12, background: AMBER, color: INK, fontFamily: JAK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Dodaj</button>
                      </form>
                    </div>
                    {/* lokal in točke */}
                    <form action={updateVenueSettings} style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Lokal in točke</span>
                      {([["Ime lokala", "name", venue.name, "text"], ["Barva (hex)", "brand_color", venue.brand_color, "text"], ["Točke na obisk", "points_per_visit", String(venue.points_per_visit), "number"], ["Časovno okno računa (ure)", "scan_window_hours", String(venue.scan_window_hours), "number"]] as const).map(([l, n, dv, t]) => (
                        <label key={n} className="flex flex-col" style={{ gap: 5 }}><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{l}</span><input name={n} type={t} defaultValue={dv} style={inp} /></label>
                      ))}
                      <button style={{ marginTop: 4, height: 48, border: "none", borderRadius: 12, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14.5, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", padding: "0 22px" }}>Shrani</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {scanning && <Scanner onResult={handleActivate} onClose={() => setScanning(false)} title="Skeniraj vzorčni račun" />}
      {msg && <div className="fixed inset-x-0 z-50 mx-auto text-center" style={{ bottom: 24, width: "90%", maxWidth: 380, borderRadius: 14, background: INK, color: PAPER, padding: "12px 16px", fontSize: 14, fontWeight: 600, fontFamily: JAK, boxShadow: "0 12px 30px rgba(42,36,29,0.3)" }}>{msg}</div>}
    </main>
  );
}
