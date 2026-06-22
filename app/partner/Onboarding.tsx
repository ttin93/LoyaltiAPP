"use client";

import { useState } from "react";
import { createVenue, signOut } from "@/app/actions";
import { BRAND } from "@/lib/brand";

const JAK = "var(--font-jakarta), sans-serif";
const INK = "#2A241D";
const PAPER = "#FBF3E6";
const CREAM = "#FBF7F0";
const AMBER = "#E2A04A";
const MUTED = "#6E6253";
const COLORS = ["#E2A04A", "#C4623D", "#5E7F52", "#3D5A80", "#8E5BA6"];

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}
function Cup({ stroke, size }: { stroke: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", fill: "none", stroke, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d="M5 9h10v5.5A4.5 4.5 0 0 1 10.5 19h-1A4.5 4.5 0 0 1 5 14.5V9Z" />
      <path d="M15 10.5h1.6a2.4 2.4 0 0 1 0 4.8H15" />
    </svg>
  );
}

function PreviewCard({ name, color, goal }: { name: string; color: string; goal: number }) {
  const initial = (name.trim()[0] || "M").toUpperCase();
  const filled = Math.min(7, goal);
  const cols = goal <= 10 ? 5 : 6;
  return (
    <div style={{ width: 280, borderRadius: 30, overflow: "hidden", background: "#fff", boxShadow: "0 20px 44px rgba(42,36,29,0.16)", fontFamily: JAK }}>
      <div className="flex items-center" style={{ background: hexA(color, 0.16), padding: "22px 20px", gap: 11 }}>
        <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 14, background: INK, color: PAPER, fontWeight: 800, fontSize: 20 }}>{initial}</div>
        <div><div style={{ fontWeight: 800, fontSize: 17, color: INK }}>{name || "Tvoj lokal"}</div><div style={{ fontSize: 12, color: "#9A8F80" }}>zbiraj žige</div></div>
      </div>
      <div style={{ padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9A8F80" }}>Tvoja kartica</span>
          <span style={{ fontSize: 12, fontWeight: 800, color }}>{filled} / {goal}</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gap: 9 }}>
          {Array.from({ length: goal }).map((_, i) => {
            const on = i < filled;
            return <div key={i} className="flex items-center justify-center" style={{ aspectRatio: "1", borderRadius: "50%", border: on ? `2px solid ${color}` : "2px solid #EFE4D2", background: on ? hexA(color, 0.1) : CREAM }}>{on && <Cup stroke={color} size={13} />}</div>;
          })}
        </div>
        <button type="button" style={{ marginTop: 16, width: "100%", height: 46, border: "none", borderRadius: 14, background: INK, color: PAPER, fontFamily: JAK, fontSize: 14, fontWeight: 700 }}>Skeniraj račun</button>
      </div>
    </div>
  );
}

const STEPS = [
  { k: "Korak 1 / 4 · znamka", t: "Ustvari svojo stran", s: "Logo, ime in barva — vse spremeniš tudi pozneje." },
  { k: "Korak 2 / 4 · pravila", t: "Nastavi zvestobo", s: "Koliko žigov za nagrado in koliko točk prinese obisk." },
  { k: "Korak 3 / 4 · nagrade", t: "Dodaj nagrade", s: "Glavna nagrada in poljubne dodatne — vse urejaš sam." },
  { k: "Korak 4 / 4 · objava", t: "Še zadnji pogled", s: "Preveri in objavi stran za goste." },
];

const inp: React.CSSProperties = { height: 54, border: "1.5px solid #E4D9C7", borderRadius: 14, background: "#fff", padding: "0 16px", fontFamily: JAK, fontSize: 16, fontWeight: 700, color: INK, outline: "none", boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: MUTED };

function Stepper({ value, onMinus, onPlus }: { value: React.ReactNode; onMinus: () => void; onPlus: () => void }) {
  const btn: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, border: "1px solid #E4D9C7", background: CREAM, fontSize: 20, color: INK, cursor: "pointer", fontFamily: JAK };
  return (
    <div className="flex items-center" style={{ gap: 14 }}>
      <button type="button" onClick={onMinus} style={btn}>−</button>
      <span style={{ fontWeight: 800, fontSize: 20, minWidth: 34, textAlign: "center" }}>{value}</span>
      <button type="button" onClick={onPlus} style={btn}>+</button>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("#E2A04A");
  const [stampGoal, setStampGoal] = useState(10);
  const [ptsPerVisit, setPtsPerVisit] = useState(15);
  const [rewardName, setRewardName] = useState("Brezplačna kava");
  const [pointRewards, setPointRewards] = useState<{ name: string; points: number }[]>([
    { name: "Domač rogljiček", points: 250 },
    { name: "Kos torte", points: 350 },
  ]);
  const [busy, setBusy] = useState(false);
  const sd = STEPS[step - 1];

  return (
    <main style={{ background: "#E9E2D6", fontFamily: JAK, color: INK, minHeight: "100dvh", overflowX: "hidden" }}>
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1000, height: 64, padding: "0 24px" }}>
        <div className="flex items-center" style={{ gap: 9 }}><div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 11, background: INK, color: PAPER, fontWeight: 800, fontSize: 17 }}>{BRAND.charAt(0)}</div><span style={{ fontWeight: 800, fontSize: 20 }}>{BRAND}</span></div>
        <form action={signOut}><button style={{ fontSize: 13.5, fontWeight: 600, color: "#9A8F80", background: "none", border: "none", cursor: "pointer", fontFamily: JAK }}>Odjava</button></form>
      </div>

      <div className="mx-auto" style={{ maxWidth: 1000, padding: "8px 16px 48px" }}>
        <div className="overflow-hidden lg:grid lg:rounded-[20px] lg:border lg:border-[#E4D9C7] lg:shadow-[0_26px_60px_rgba(34,28,22,0.16)]" style={{ gridTemplateColumns: "1.1fr 400px", background: CREAM }}>
          {/* wizard */}
          <form action={createVenue} onSubmit={() => setBusy(true)} className="flex flex-col" style={{ padding: "clamp(28px,4vw,44px)" }}>
            <input type="hidden" name="name" value={brandName} />
            <input type="hidden" name="brand_color" value={color} />
            <input type="hidden" name="points_model" value="per_visit" />
            <input type="hidden" name="points_per_visit" value={ptsPerVisit} />
            <input type="hidden" name="stamp_goal" value={stampGoal} />
            <input type="hidden" name="reward_name" value={rewardName} />
            <input type="hidden" name="point_rewards" value={JSON.stringify(pointRewards)} />

            <div className="flex items-center" style={{ gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4].map((n) => <div key={n} style={{ flex: 1, height: 5, borderRadius: 99, background: n <= step ? AMBER : "#EDE2CF" }} />)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B4862F", marginBottom: 6 }}>{sd.k}</div>
            <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: "-0.01em", marginBottom: 6 }}>{sd.t}</div>
            <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.5, marginBottom: 24, maxWidth: 420 }}>{sd.s}</div>

            <div style={{ flex: 1, minHeight: 230 }}>
              {step === 1 && (
                <div className="flex flex-col" style={{ gap: 20, maxWidth: 440 }}>
                  <div className="flex flex-col" style={{ gap: 8 }}><label style={lbl}>Ime znamke</label><input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="npr. Mora" style={inp} /></div>
                  <div className="flex flex-col" style={{ gap: 8 }}><label style={lbl}>Logo</label><div className="flex items-center" style={{ gap: 14 }}><div className="flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 17, background: INK, color: PAPER, fontWeight: 800, fontSize: 26, flexShrink: 0 }}>{(brandName.trim()[0] || "M").toUpperCase()}</div><div className="flex flex-1 items-center justify-center" style={{ height: 60, border: "2px dashed #E0D2BC", borderRadius: 14, fontSize: 13.5, color: "#9A8F80", fontWeight: 600 }}>Logo dodaš kasneje</div></div></div>
                  <div className="flex flex-col" style={{ gap: 10 }}>
                    <label style={lbl}>Barva znamke</label>
                    <div className="flex items-center" style={{ gap: 12, flexWrap: "wrap" }}>
                      {COLORS.map((c) => <button type="button" key={c} onClick={() => setColor(c)} aria-label="barva" style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: c, cursor: "pointer", boxShadow: c === color ? "0 0 0 2.5px #FBF7F0, 0 0 0 5px #2A241D" : "none" }} />)}
                      <label className="flex items-center justify-center" aria-label="izberi svojo barvo" style={{ width: 42, height: 42, borderRadius: "50%", cursor: "pointer", position: "relative", overflow: "hidden", border: COLORS.includes(color) ? "2px dashed #D8C9B2" : "none", background: COLORS.includes(color) ? "#fff" : color, boxShadow: COLORS.includes(color) ? "none" : "0 0 0 2.5px #FBF7F0, 0 0 0 5px #2A241D" }}>
                        {COLORS.includes(color) && <span style={{ fontSize: 22, color: "#B5AB9C", lineHeight: 1 }}>+</span>}
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ position: "absolute", inset: 0, width: "150%", height: "150%", opacity: 0, cursor: "pointer", border: "none" }} />
                      </label>
                      <div className="flex items-center" style={{ gap: 8, border: "1.5px solid #E4D9C7", borderRadius: 12, height: 42, padding: "0 12px", background: "#fff" }}>
                        <span style={{ width: 18, height: 18, borderRadius: 5, background: color, flexShrink: 0 }} />
                        <input value={color.toUpperCase()} onChange={(e) => { let v = e.target.value.replace(/[^#0-9a-fA-F]/g, ""); if (!v.startsWith("#")) v = "#" + v; setColor(v.slice(0, 7)); }} style={{ width: 76, border: "none", outline: "none", fontFamily: JAK, fontSize: 14, fontWeight: 700, color: INK, background: "transparent" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="flex flex-col" style={{ gap: 18, maxWidth: 440 }}>
                  <div className="flex flex-col" style={{ background: "#fff", border: "1px solid #EFE4D2", borderRadius: 16, padding: 18, gap: 14 }}>
                    <div className="flex items-center justify-between"><span style={{ fontSize: 14.5, fontWeight: 700 }}>Žigov do nagrade</span><Stepper value={stampGoal} onMinus={() => setStampGoal((s) => Math.max(4, s - 1))} onPlus={() => setStampGoal((s) => Math.min(12, s + 1))} /></div>
                    <div style={{ height: 1, background: "#F1E8D9" }} />
                    <div className="flex items-center justify-between"><span style={{ fontSize: 14.5, fontWeight: 700 }}>Točk na obisk</span><Stepper value={ptsPerVisit} onMinus={() => setPtsPerVisit((s) => Math.max(0, s - 5))} onPlus={() => setPtsPerVisit((s) => Math.min(50, s + 5))} /></div>
                    {ptsPerVisit === 0 && <div style={{ fontSize: 12.5, color: MUTED, marginTop: -4 }}>Brez točk — gostje zbirajo <strong>samo žige</strong>.</div>}
                  </div>
                  <div className="flex items-start" style={{ background: "#FCEFD8", borderRadius: 14, padding: "14px 16px", gap: 10 }}><svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1, fill: "none", stroke: "#B4862F", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="9" /><path d="M12 8.2v0.01M12 11v5" /></svg><span style={{ fontSize: 13, lineHeight: 1.45, color: "#7A5E1E" }}>Gost zbere <strong>{stampGoal} žigov</strong> za {rewardName.toLowerCase()}. Pravila lahko kadarkoli spremeniš.</span></div>
                </div>
              )}
              {step === 3 && (
                <div className="flex flex-col" style={{ gap: 18, maxWidth: 440 }}>
                  {/* nagrada za žige */}
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    <span style={lbl}>Nagrada za žige (kartonček)</span>
                    <div className="flex items-center" style={{ background: "#fff", border: `2px solid ${AMBER}`, borderRadius: 16, padding: 14, gap: 12 }}>
                      <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: "#FCEFD8", flexShrink: 0 }}><Cup stroke={AMBER} size={21} /></div>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <input value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder="npr. Brezplačna kava" style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: JAK, fontSize: 15, fontWeight: 700, color: INK }} />
                        <div style={{ fontSize: 12.5, color: "#9A8F80" }}>pri {stampGoal} žigih · glavna nagrada</div>
                      </div>
                    </div>
                  </div>
                  {/* nagrade za točke */}
                  {ptsPerVisit > 0 && (
                    <div className="flex flex-col" style={{ gap: 8 }}>
                      <span style={lbl}>Nagrade za točke</span>
                      {pointRewards.map((r, i) => (
                        <div key={i} className="flex items-center" style={{ background: "#fff", border: "1px solid #EFE4D2", borderRadius: 14, padding: 10, gap: 8 }}>
                          <input value={r.name} onChange={(e) => setPointRewards((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="ime nagrade" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: JAK, fontSize: 14.5, fontWeight: 700, color: INK }} />
                          <input value={r.points} onChange={(e) => setPointRewards((a) => a.map((x, j) => (j === i ? { ...x, points: Math.max(0, Number(e.target.value) || 0) } : x)))} type="number" style={{ width: 68, border: "1px solid #E4D9C7", borderRadius: 9, height: 36, padding: "0 8px", fontFamily: JAK, fontSize: 13.5, fontWeight: 700, color: INK, textAlign: "right", outline: "none" }} />
                          <span style={{ fontSize: 12, color: "#9A8F80" }}>t</span>
                          <button type="button" onClick={() => setPointRewards((a) => a.filter((_, j) => j !== i))} aria-label="odstrani" style={{ width: 32, height: 32, border: "1px solid #E4D9C7", borderRadius: 9, background: "#fff", color: "#C4623D", cursor: "pointer", fontFamily: JAK, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setPointRewards((a) => [...a, { name: "", points: 100 }])} className="flex items-center justify-center" style={{ height: 46, border: "1.5px dashed #E0D2BC", borderRadius: 14, color: "#9A8F80", fontSize: 14, fontWeight: 700, gap: 8, background: "transparent", cursor: "pointer", fontFamily: JAK }}><svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#9A8F80", strokeWidth: 2, strokeLinecap: "round" }}><path d="M12 6v12M6 12h12" /></svg>Dodaj nagrado</button>
                    </div>
                  )}
                </div>
              )}
              {step === 4 && (
                <div className="flex flex-col" style={{ gap: 16, maxWidth: 440 }}>
                  <div style={{ background: "#fff", border: "1px solid #EFE4D2", borderRadius: 16, padding: "6px 18px" }}>
                    {[["Znamka", brandName || "Tvoj lokal"], ["Nagrada", `${rewardName} pri ${stampGoal} žigih`], ["Točk na obisk", `${ptsPerVisit}`]].map(([k, v], i) => (
                      <div key={k} className="flex items-center justify-between" style={{ padding: "14px 0", borderBottom: i < 2 ? "1px solid #F1E8D9" : "none" }}><span style={{ fontSize: 14, color: MUTED }}>{k}</span><span style={{ fontWeight: 700, fontSize: 14.5 }}>{v}</span></div>
                    ))}
                  </div>
                  <div style={{ background: "#FCEFD8", borderRadius: 14, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.5, color: "#7A5E1E" }}>Po objavi natisni QR (zavihek Sistem) in ga postavi na mize. Skeniranje računov aktiviraš z vzorčnim računom.</div>
                </div>
              )}
            </div>

            <div className="flex" style={{ gap: 12, marginTop: 26 }}>
              {step > 1 && <button type="button" onClick={() => setStep((s) => s - 1)} style={{ height: 52, padding: "0 22px", border: "1.5px solid #E4D9C7", borderRadius: 16, background: "transparent", color: MUTED, fontFamily: JAK, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Nazaj</button>}
              {step < 4 ? (
                <button type="button" onClick={() => { if (step === 1 && !brandName.trim()) return; setStep((s) => s + 1); }} style={{ flex: 1, height: 52, border: "none", borderRadius: 16, background: INK, color: PAPER, fontFamily: JAK, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Naprej</button>
              ) : (
                <button type="submit" disabled={busy} style={{ flex: 1, height: 52, border: "none", borderRadius: 16, background: INK, color: PAPER, fontFamily: JAK, fontSize: 15.5, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Objavljam…" : "Objavi stran"}</button>
              )}
            </div>
          </form>

          {/* live preview */}
          <div className="hidden flex-col items-center justify-center lg:flex" style={{ background: "#E9E2D6", gap: 14, padding: "36px 28px", borderLeft: "1px solid #E0D5C2" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89B88" }}>Predogled gostove strani</div>
            <PreviewCard name={brandName} color={color} goal={stampGoal} />
          </div>
        </div>
      </div>
    </main>
  );
}
