import Link from "next/link";

// ── PRAVA pričevanja gredo sem (po prvih pilotih). Ne izmišljuj — v malem SLO
// trgu te lažni citati razkrijejo. Ko dobiš prave, dodaj v TESTIMONIALS in se
// samodejno prikažejo namesto garancijske sekcije.
type Testimonial = { quote: string; name: string; venue: string; photo?: string };
const TESTIMONIALS: Testimonial[] = [
  // { quote: "Vrnitve gostov opazno gor v prvih tednih.", name: "Ime Priimek", venue: "Kavarna X, Mesto", photo: "/…" },
];

const INK = "#2A241D";
const AMBER = "#E2A04A";
const CORAL = "#C4623D";
const GREEN = "#5E7F52";
const MUTED = "#6E6253";
const BORDER = "#EFE6D6";

const GUARANTEES: { t: string; d: string; c: string }[] = [
  { t: "Brez kartice", d: "Prijava in preizkus brez vnosa kartice.", c: GREEN },
  { t: "Postavljeno v 5 min", d: "Ime, barva, nagrada, QR — pa teče.", c: AMBER },
  { t: "Prekličeš kadarkoli", d: "Brez vezave, brez skritih pogojev.", c: CORAL },
  { t: "Tvoji podatki ostanejo tvoji", d: "Baza gostov je tvoja, izvoz kadarkoli.", c: INK },
];

export default function Testimonials() {
  const has = TESTIMONIALS.length > 0;
  return (
    <div className="mx-auto" style={{ maxWidth: 1200, padding: "56px 24px" }}>
      <div className="flex flex-col items-center text-center" style={{ gap: 10, marginBottom: 34 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL }}>{has ? "Kaj pravijo lokali" : "Naša obljuba"}</div>
        <h2 className="font-display" style={{ margin: 0, fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>{has ? "Lokali, ki gradijo stalne goste" : "Poštena, brez tveganja"}</h2>
        {!has && <p style={{ margin: 0, fontSize: 16.5, color: MUTED, maxWidth: 560, lineHeight: 1.5 }}>Smo nova slovenska platforma in jo gradimo s prvimi lokali. Pridruži se — brez tveganja.</p>}
      </div>

      {has ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.venue} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 16, lineHeight: 1.55, color: INK }}>“{t.quote}”</div>
              <div className="flex items-center" style={{ gap: 11, marginTop: "auto" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "#F1E7D2", flexShrink: 0 }}>{t.photo && <img src={t.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
                <div style={{ lineHeight: 1.25 }}><div style={{ fontWeight: 800, fontSize: 14.5 }}>{t.name}</div><div style={{ fontSize: 13, color: MUTED }}>{t.venue}</div></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {GUARANTEES.map((g) => (
            <div key={g.t} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${g.c}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "none", stroke: g.c, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12.5l4.2 4.2L19 7" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16.5, color: INK }}>{g.t}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>{g.d}</div>
            </div>
          ))}
        </div>
      )}

      {!has && (
        <div className="flex justify-center" style={{ marginTop: 28 }}>
          <Link href="/partner" style={{ height: 52, padding: "0 26px", borderRadius: 14, background: INK, color: "#FBF3E6", fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            Postani eden prvih lokalov
            <svg width="17" height="17" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FBF3E6", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}
