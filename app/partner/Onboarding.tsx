"use client";

import { useState } from "react";
import { createVenue } from "@/app/actions";
import { signOut } from "@/app/actions";

export default function Onboarding() {
  const [color, setColor] = useState("#16a34a");
  const [busy, setBusy] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Ustvari svoj lokal</h1>
      <p className="mt-1 text-sm text-neutral-500">
        V minuti postavi program zvestobe. Privzete nagrade dodamo samodejno (lahko jih kasneje
        spremeniš).
      </p>

      <form action={createVenue} onSubmit={() => setBusy(true)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Ime lokala</label>
          <input
            name="name"
            required
            placeholder="npr. Kavarna Central"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Barva blagovne znamke</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="brand_color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-16 rounded-lg border border-neutral-300"
            />
            <span className="text-sm text-neutral-500">{color}</span>
          </div>
        </div>

        <button
          disabled={busy}
          className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {busy ? "Ustvarjam…" : "Ustvari lokal →"}
        </button>
      </form>

      <form action={signOut} className="mt-4 text-center">
        <button className="text-sm text-neutral-400 underline">Odjava</button>
      </form>
    </main>
  );
}
