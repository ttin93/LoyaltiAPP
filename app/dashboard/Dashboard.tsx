"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Venue, Reward, Customer, ScanRow, RedemptionRow } from "@/lib/types";
import {
  updateVenueSettings,
  activateScanning,
  saveReward,
  deleteReward,
  addManualPoints,
  signOut,
} from "@/app/actions";
import Scanner from "@/app/components/Scanner";
import QrCode from "./QrCode";

const TABS = ["Sistem", "Analitika", "Zgodovina", "Marketing", "Nastavitve"] as const;
type Tab = (typeof TABS)[number];

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard({
  venue,
  rewards,
  customers,
  scans,
  redemptions,
  ownerEmail,
}: {
  venue: Venue;
  rewards: Reward[];
  customers: Customer[];
  scans: ScanRow[];
  redemptions: RedemptionRow[];
  ownerEmail: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Sistem");
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const accent = venue.brand_color || "#16a34a";

  const stats = useMemo(() => {
    const pointsAwarded = scans.reduce((a, s) => a + s.points_awarded, 0);
    const pointsRedeemed = redemptions.reduce((a, r) => a + r.points_spent, 0);
    const visitsByCustomer = new Map<string, { visits: number; last: string }>();
    for (const s of scans) {
      const cur = visitsByCustomer.get(s.customer_id) ?? { visits: 0, last: s.created_at };
      cur.visits += 1;
      if (s.created_at > cur.last) cur.last = s.created_at;
      visitsByCustomer.set(s.customer_id, cur);
    }
    // skeniranja po dnevih (zadnjih 14)
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = scans.filter((s) => s.created_at.slice(0, 10) === key).length;
      days.push({ label: key.slice(5), count });
    }
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    return {
      pointsAwarded,
      pointsRedeemed,
      avgVisits: customers.length ? (scans.length / customers.length).toFixed(1) : "0",
      visitsByCustomer,
      days,
      maxDay,
    };
  }, [scans, redemptions, customers]);

  async function run(fn: () => Promise<unknown>, ok?: string) {
    try {
      await fn();
      if (ok) flash(ok);
      router.refresh();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Napaka.");
    }
  }
  function flash(t: string) {
    setMsg(t);
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleActivate(payload: string) {
    setScanning(false);
    await run(async () => {
      const davcna = await activateScanning(payload);
      flash(`Skeniranje aktivno — davčna ${davcna}.`);
    });
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {venue.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold leading-tight">{venue.name}</h1>
              <p className="text-xs text-neutral-400">{ownerEmail}</p>
            </div>
          </div>
          <form action={signOut}>
            <button className="text-sm text-neutral-500 underline">Odjava</button>
          </form>
        </div>
        {/* Tabs */}
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6">
        {/* Aktivacijsko opozorilo */}
        {!venue.davcna_stevilka && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ Skeniranje še ni aktivno. Pojdi na <b>Nastavitve → Aktiviraj skeniranje</b> in naloži
            vzorčni račun.
          </div>
        )}

        {/* === SISTEM === */}
        {tab === "Sistem" && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-1 font-semibold">QR koda lokala</h2>
              <p className="mb-5 text-sm text-neutral-500">
                Natisni in postavi na pult. Gostje skenirajo → odpre se njihova stran zvestobe.
              </p>
              <QrCode path={`/p/${venue.public_code}`} accent={accent} />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-1 font-semibold">Status skeniranja</h2>
              {venue.davcna_stevilka ? (
                <p className="text-sm text-green-700">
                  ✅ Aktivno — sprejemamo račune z davčno <b>{venue.davcna_stevilka}</b>.
                </p>
              ) : (
                <p className="text-sm text-neutral-500">Še ni aktivirano (glej Nastavitve).</p>
              )}
            </div>
          </section>
        )}

        {/* === ANALITIKA === */}
        {tab === "Analitika" && (
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Skeniranja" value={scans.length} />
              <Stat label="Stranke" value={customers.length} />
              <Stat label="Povp. obiski" value={stats.avgVisits} />
              <Stat label="Podarjene točke" value={stats.pointsAwarded} />
              <Stat label="Unovčene točke" value={stats.pointsRedeemed} />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-4 font-semibold">Skeniranja (zadnjih 14 dni)</h2>
              <div className="flex h-32 items-end gap-1">
                {stats.days.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(d.count / stats.maxDay) * 100}%`,
                        backgroundColor: accent,
                        minHeight: d.count ? 4 : 0,
                      }}
                    />
                    <span className="text-[9px] text-neutral-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === ZGODOVINA === */}
        {tab === "Zgodovina" && (
          <section className="space-y-5">
            <Panel title="Podarjene točke (skeniranja)">
              {scans.length === 0 && <Empty />}
              {scans.map((s) => (
                <Row
                  key={s.id}
                  left={s.customers?.phone ?? "—"}
                  right={`+${s.points_awarded}`}
                  sub={fmt(s.created_at)}
                  accent={accent}
                />
              ))}
            </Panel>
            <Panel title="Unovčene nagrade">
              {redemptions.length === 0 && <Empty />}
              {redemptions.map((r) => (
                <Row
                  key={r.id}
                  left={`${r.customers?.phone ?? "—"} · ${r.rewards?.name ?? "nagrada"}`}
                  right={`−${r.points_spent}`}
                  sub={fmt(r.created_at)}
                  negative
                />
              ))}
            </Panel>
          </section>
        )}

        {/* === MARKETING === */}
        {tab === "Marketing" && (
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Stranke ({customers.length})</h2>
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                <input
                  type="checkbox"
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                />
                ročno dodajanje točk
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-neutral-400">
                  <tr>
                    <th className="py-2">Telefon</th>
                    <th>Točke</th>
                    <th>Obiski</th>
                    <th>Zadnji</th>
                    {manualMode && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const v = stats.visitsByCustomer.get(c.id);
                    return (
                      <tr key={c.id} className="border-t border-neutral-100">
                        <td className="py-2.5">{c.phone ?? c.email ?? "—"}</td>
                        <td className="font-semibold tabular-nums">{c.points}</td>
                        <td className="tabular-nums">{v?.visits ?? 0}</td>
                        <td className="text-xs text-neutral-400">{v ? fmt(v.last) : "—"}</td>
                        {manualMode && (
                          <td className="text-right">
                            <button
                              onClick={() => {
                                const n = Number(window.prompt(`Dodaj točke za ${c.phone ?? "stranko"}:`, "10"));
                                if (n) run(() => addManualPoints(c.id, n), "Točke dodane.");
                              }}
                              className="rounded-lg border border-neutral-300 px-2 py-1 text-xs"
                            >
                              + točke
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-neutral-400">
                        Še ni strank.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* === NASTAVITVE === */}
        {tab === "Nastavitve" && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-1 font-semibold">Aktiviraj skeniranje</h2>
              <p className="mb-4 text-sm text-neutral-500">
                Skeniraj (ali prilepi) QR z vzorčnega računa tvojega lokala. Iz njega preberemo
                davčno številko izdajatelja — od tedaj se štejejo samo računi tvojega lokala.
              </p>
              <button
                onClick={() => setScanning(true)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: accent }}
              >
                {venue.davcna_stevilka ? "Ponovno aktiviraj" : "Aktiviraj skeniranje"}
              </button>
            </div>

            <RewardEditor rewards={rewards} onChanged={() => router.refresh()} onFlash={flash} />

            <form
              action={updateVenueSettings}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h2 className="mb-4 font-semibold">Lokal in točke</h2>
              <Field label="Ime lokala" name="name" defaultValue={venue.name} />
              <Field label="Barva (hex)" name="brand_color" defaultValue={venue.brand_color} />
              <Field
                label="Točke na obisk"
                name="points_per_visit"
                type="number"
                defaultValue={String(venue.points_per_visit)}
              />
              <Field
                label="Časovno okno računa (ure)"
                name="scan_window_hours"
                type="number"
                defaultValue={String(venue.scan_window_hours)}
              />
              <button className="mt-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
                Shrani
              </button>
            </form>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-1 font-semibold">Profil</h2>
              <p className="text-sm text-neutral-500">{ownerEmail}</p>
              <form action={signOut} className="mt-3">
                <button className="text-sm text-red-600 underline">Odjava</button>
              </form>
            </div>
          </section>
        )}
      </main>

      {scanning && (
        <Scanner
          onResult={handleActivate}
          onClose={() => setScanning(false)}
          title="Skeniraj vzorčni račun"
        />
      )}
      {msg && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-[90%] max-w-sm rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function Row({
  left,
  right,
  sub,
  accent,
  negative,
}: {
  left: string;
  right: string;
  sub: string;
  accent?: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-100 py-2.5 text-sm first:border-0">
      <div>
        <p className="font-medium">{left}</p>
        <p className="text-xs text-neutral-400">{sub}</p>
      </div>
      <span
        className="font-semibold tabular-nums"
        style={{ color: negative ? "#dc2626" : accent ?? "#16a34a" }}
      >
        {right}
      </span>
    </div>
  );
}

function Empty() {
  return <p className="py-4 text-center text-sm text-neutral-400">Ni zapisov.</p>;
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm text-neutral-600">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
      />
    </label>
  );
}

function RewardEditor({
  rewards,
  onChanged,
  onFlash,
}: {
  rewards: Reward[];
  onChanged: () => void;
  onFlash: (s: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-3 font-semibold">Nagrade</h2>
      <div className="space-y-2">
        {rewards.map((r) => (
          <form
            key={r.id}
            action={async (fd) => {
              await saveReward(fd);
              onChanged();
              onFlash("Nagrada shranjena.");
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={r.id} />
            <input
              name="name"
              defaultValue={r.name}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
            />
            <input
              name="points_required"
              type="number"
              defaultValue={String(r.points_required)}
              className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
              Shrani
            </button>
            <button
              type="button"
              onClick={async () => {
                await deleteReward(r.id);
                onChanged();
                onFlash("Nagrada izbrisana.");
              }}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs text-red-600"
            >
              ✕
            </button>
          </form>
        ))}
      </div>

      <form
        action={async (fd) => {
          await saveReward(fd);
          onChanged();
          onFlash("Nagrada dodana.");
        }}
        className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4"
      >
        <input
          name="name"
          placeholder="Nova nagrada"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
        />
        <input
          name="points_required"
          type="number"
          placeholder="točke"
          className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>
          Dodaj
        </button>
      </form>
    </div>
  );
}
