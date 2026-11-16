import { ContactlessPayment, QrCode, Star, TrendUp, Users } from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "./Logo";

/** Ponazoritev nadzorne plošče (statičen prikaz z izmišljenimi podatki). */
export function DashboardMock() {
  const bars = [38, 52, 44, 61, 57, 72, 66, 49, 58, 77, 69, 84];
  const guests = [
    { name: "maja.k", visits: 14, note: "še 1 obisk do nagrade" },
    { name: "tomaz.p", visits: 9, note: "zadnjič včeraj" },
    { name: "nika.z", visits: 6, note: "zadnjič pred 3 dnevi" },
  ];
  return (
    <div className="flex w-full flex-col gap-3 rounded-3xl border border-line bg-s1 p-4" aria-hidden="true">
      <div className="flex items-center justify-between px-2 pt-2">
        <p className="text-sm font-semibold text-fg">Pregled</p>
        <p className="font-mono text-xs text-dim">primer prikaza</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Gostje", value: "247" },
          { icon: TrendUp, label: "Obiski", value: "1.318" },
          { icon: Star, label: "Ocene", value: "63" },
        ].map((k) => (
          <div key={k.label} className="flex flex-col gap-2 rounded-2xl bg-s2 p-4">
            <k.icon size={16} weight="bold" className="text-brand-ink" />
            <p className="font-mono text-2xl font-semibold text-fg">{k.value}</p>
            <p className="text-xs text-mute">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex h-32 items-end gap-2 rounded-2xl bg-s2 p-4">
        {bars.map((h, i) => (
          <span key={i} className={`flex-1 rounded-sm ${i === bars.length - 1 ? "bg-brand" : "bg-s3"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {guests.map((g) => (
          <li key={g.name} className="flex items-center gap-3 rounded-2xl bg-s2 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-s3 text-xs font-semibold uppercase text-fg">{g.name[0]}</span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-fg">{g.name}</span>
              <span className="block text-xs text-mute">{g.note}</span>
            </span>
            <span className="font-mono text-sm text-fg">{g.visits}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ponazoritev stojala na pultu: koda QR in oznaka NFC. */
export function StandMock({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-3xl border border-line bg-base p-4 text-fg ${className}`} aria-hidden="true">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-lg bg-tint">
          <LogoMark size={16} />
        </span>
        <p className="text-sm font-semibold tracking-tight">loyavi</p>
      </div>
      <span className="flex size-24 items-center justify-center rounded-2xl bg-brand text-on-brand">
        <QrCode size={64} weight="bold" />
      </span>
      <p className="flex items-center gap-1 text-xs font-semibold">
        <ContactlessPayment size={16} weight="bold" />
        Približaj ali skeniraj
      </p>
    </div>
  );
}
