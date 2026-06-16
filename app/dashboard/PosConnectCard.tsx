"use client";

import { useEffect, useState } from "react";

type Status = { connected: boolean; provider?: string; bu_uid?: string; last_check_at?: string | null };

export default function PosConnectCard({ venueCode, accent }: { venueCode: string; accent: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ bu_uid: "", client_id: "", client_secret: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/pos?venueCode=${encodeURIComponent(venueCode)}`);
      const j = await r.json();
      setStatus(j.ok ? { connected: !!j.connected, provider: j.provider, bu_uid: j.bu_uid, last_check_at: j.last_check_at } : { connected: false });
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const r = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode, provider: "eblagajna", ...form }),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error || "Napaka.");
      else {
        setMsg("Blagajna povezana ✅");
        setForm({ bu_uid: "", client_id: "", client_secret: "" });
        await load();
      }
    } catch {
      setErr("Napaka pri povezavi.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Prekliniti povezavo z blagajno?")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await fetch("/api/pos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueCode }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg("Povezava preklicana.");
        await load();
      } else setErr(j.error || "Napaka.");
    } catch {
      setErr("Napaka.");
    } finally {
      setBusy(false);
    }
  }

  const inp = "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-1 font-semibold">Poveži blagajno (POS)</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Preverjanje računov pri viru (proti ponaredbam) + unovčenje kuponov v transakciji. Trenutno: <b>eBlagajna</b>.
      </p>

      {loading ? (
        <p className="text-sm text-neutral-400">Nalagam …</p>
      ) : status?.connected ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            ✅ Povezano — <b>{status.provider}</b> · enota {status.bu_uid}
            {status.last_check_at && (
              <span className="block text-xs text-green-700/70">
                preverjeno {new Date(status.last_check_at).toLocaleString("sl-SI")}
              </span>
            )}
          </div>
          <button
            onClick={disconnect}
            disabled={busy}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
          >
            Prekliči povezavo
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-600">Business Unit UID (bu_uid)</span>
            <input className={inp} value={form.bu_uid} onChange={(e) => setForm({ ...form, bu_uid: e.target.value })} placeholder="00000000-0000-4000-8000-…" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-600">Client ID</span>
            <input className={inp} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-600">Client Secret</span>
            <input className={inp} type="password" value={form.client_secret} onChange={(e) => setForm({ ...form, client_secret: e.target.value })} />
          </label>
          <button
            onClick={connect}
            disabled={busy || !form.bu_uid || !form.client_id || !form.client_secret}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {busy ? "Preverjam …" : "Poveži"}
          </button>
          <p className="text-xs text-neutral-400">Poverilnice dobiš pri eBlagajni (svojem POS ponudniku).</p>
        </div>
      )}

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}

      <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
        🔒 Skrivni ključ hranimo <b>šifriran</b> (nikoli v navadnem besedilu), uporablja se samo na strežniku, vezan je na tvojo enoto in ga lahko <b>kadarkoli prekličeš</b>. Priporočamo, da pri eBlagajni zahtevaš <b>read-only</b> dostop.
      </p>
    </div>
  );
}
