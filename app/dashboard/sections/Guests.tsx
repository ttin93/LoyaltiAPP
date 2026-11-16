"use client";

import { useMemo, useState } from "react";
import { CircleNotch, DownloadSimple, Gift, MagnifyingGlass, Stamp, Users } from "@phosphor-icons/react/dist/ssr";
import { addManualStamp, giftCoupon } from "@/app/actions";
import { Button } from "@/app/ui/Button";
import { Field, Input } from "@/app/ui/Field";
import Sheet from "@/app/ui/Sheet";
import { agoLabel, birthdayLabel, count, dateShort, daysAgo } from "@/lib/sl";
import type { CouponRow, DashData, GuestRow } from "../data";
import { Badge, Chip, Empty, Panel, SectionHead, useAct } from "../parts";

type Filter = "all" | "active" | "inactive" | "close";

export const COUPON_STATUS: Record<CouponRow["status"], { label: string; tone: "brand" | "mute" | "warn" }> = {
  pending: { label: "Čaka na prvi obisk", tone: "warn" },
  ready: { label: "Veljaven", tone: "brand" },
  active: { label: "V prevzemu", tone: "brand" },
  redeemed: { label: "Prevzet", tone: "mute" },
  expired: { label: "Potekel", tone: "mute" },
};
export const COUPON_SOURCE: Record<CouponRow["source"], string> = {
  card: "Polna kartica",
  welcome: "Kolo dobrodošlice",
  birthday: "Rojstni dan",
  campaign: "Sporočilo",
  manual: "Podarjen",
};

const isActive = (g: GuestRow) => !!g.lastVisit && daysAgo(g.lastVisit) <= 30;

function GuestSheet({ guest, goal, venueId, coupons, onClose }: { guest: GuestRow; goal: number; venueId: string; coupons: CouponRow[]; onClose: () => void }) {
  const [gift, setGift] = useState("");
  const stamp = useAct();
  const give = useAct();
  return (
    <Sheet open onClose={onClose} title={guest.email}>
      <div className="flex flex-col gap-6">
        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Žigi", `${Math.min(guest.stamps, goal)}/${goal}`],
            ["Obiski", String(guest.visits)],
            ["Zadnji obisk", guest.lastVisit ? agoLabel(guest.lastVisit) : "Še ni obiska"],
            ["Član od", dateShort(guest.joined)],
            ...(guest.birthday ? [["Rojstni dan", birthdayLabel(guest.birthday)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 rounded-2xl bg-s2 p-4">
              <dt className="text-xs font-medium text-mute">{k}</dt>
              <dd className="text-base font-semibold text-fg">{v}</dd>
            </div>
          ))}
        </dl>

        {!guest.marketing && <p className="rounded-2xl bg-s2 p-4 text-sm text-mute">Gost se je odjavil od tvojih sporočil. Kartico še naprej uporablja kot prej.</p>}

        <div className="flex flex-col gap-3">
          <Button type="button" variant="secondary" size="lg" full disabled={stamp.pending} onClick={() => stamp.run(() => addManualStamp(venueId, guest.id), "Žig je dodan.")}>
            {stamp.pending ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Stamp size={20} weight="bold" aria-hidden="true" />}
            Dodaj žig ročno
          </Button>
          <p className="text-sm text-dim">Uporabi, kadar gost ni mogel zabeležiti obiska. Polna kartica se sama spremeni v kupon.</p>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            give.run(() => giftCoupon(venueId, guest.id, gift), "Kupon je podarjen.", () => setGift(""));
          }}
        >
          <Field label="Podari kupon" hint="Gost ga vidi v svoji denarnici in prevzame ob naslednjem obisku.">
            <Input value={gift} onChange={(e) => setGift(e.target.value)} placeholder="Brezplačna kava" maxLength={60} />
          </Field>
          <Button type="submit" size="lg" full disabled={!gift.trim() || give.pending}>
            {give.pending ? <CircleNotch size={20} weight="bold" className="animate-spin" aria-hidden="true" /> : <Gift size={20} weight="bold" aria-hidden="true" />}
            Podari
          </Button>
        </form>

        {coupons.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-mute">Kuponi tega gosta</h3>
            <ul className="flex flex-col gap-2">
              {coupons.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-s2 p-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-fg">{c.name}</span>
                    <span className="block text-xs text-dim">
                      {COUPON_SOURCE[c.source]}, {dateShort(c.createdAt)}
                    </span>
                  </span>
                  <Badge tone={COUPON_STATUS[c.status].tone}>{COUPON_STATUS[c.status].label}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export default function Guests({ data }: { data: DashData }) {
  const { venue, guests } = data;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(50);
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: guests.length,
      active: guests.filter(isActive).length,
      inactive: guests.filter((g) => !isActive(g)).length,
      close: guests.filter((g) => venue.goal - g.stamps <= 2).length,
    }),
    [guests, venue.goal],
  );

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (needle && !g.email.toLowerCase().includes(needle)) return false;
      if (filter === "active") return isActive(g);
      if (filter === "inactive") return !isActive(g);
      if (filter === "close") return venue.goal - g.stamps <= 2;
      return true;
    });
  }, [guests, q, filter, venue.goal]);

  const open = openId ? guests.find((g) => g.id === openId) : null;

  function exportCsv() {
    const rows = [["Elektronski naslov", "Žigi", "Obiski", "Zadnji obisk", "Član od"], ...list.map((g) => [g.email, String(g.stamps), String(g.visits), g.lastVisit ? dateShort(g.lastVisit) : "", dateShort(g.joined)])];
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `gostje-${venue.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: `Vsi ${counts.all}` },
    { key: "active", label: `Aktivni ${counts.active}` },
    { key: "inactive", label: `Neaktivni ${counts.inactive}` },
    { key: "close", label: `Blizu nagrade ${counts.close}` },
  ];

  return (
    <>
      <SectionHead
        title="Gostje"
        text="Vsi, ki so dodali tvojo kartico. Aktiven je gost z obiskom v zadnjih 30 dneh."
        action={
          guests.length > 0 ? (
            <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              Izvozi CSV
            </Button>
          ) : undefined
        }
      />

      {guests.length === 0 ? (
        <Empty icon={<Users size={24} aria-hidden="true" />} title="Še ni gostov" text="Ko prvi gost doda tvojo kartico, se pojavi tukaj. Kodo QR najdeš v razdelku Obiski in koda QR." />
      ) : (
        <Panel>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
              <Input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShown(50);
                }}
                placeholder="Išči po elektronskem naslovu"
                aria-label="Išči goste"
                className="pl-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter gostov">
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  active={filter === f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setShown(50);
                  }}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <Empty icon={<MagnifyingGlass size={24} aria-hidden="true" />} title="Ni zadetkov" text="Poskusi z drugim iskanjem ali filtrom." />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="hidden grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-4 px-4 text-xs font-medium text-dim lg:grid" aria-hidden="true">
                <span>Gost</span>
                <span>Žigi</span>
                <span>Obiski</span>
                <span>Zadnji obisk</span>
                <span>Član od</span>
              </div>
              <ul className="flex flex-col gap-2">
                {list.slice(0, shown).map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(g.id)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-2xl bg-s2 p-4 text-left transition-all duration-700 ease-spring hover:bg-s3 active:scale-[0.98] lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]"
                    >
                      <span className="truncate text-sm font-semibold text-fg">{g.email}</span>
                      <span className="font-mono text-sm text-fg">
                        {Math.min(g.stamps, venue.goal)}/{venue.goal}
                      </span>
                      <span className="text-sm text-mute lg:text-fg">{count(g.visits, "obisk")}</span>
                      <span className="text-right text-sm text-mute lg:text-left">{g.lastVisit ? agoLabel(g.lastVisit) : "Še ni obiska"}</span>
                      <span className="hidden text-sm text-mute lg:block">{dateShort(g.joined)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {list.length > shown && (
                <Button type="button" variant="secondary" size="lg" full onClick={() => setShown((n) => n + 50)}>
                  Pokaži več ({list.length - shown})
                </Button>
              )}
              {data.guestsTruncated && <p className="text-sm text-dim">Prikazan je del seznama. Za celoten izvoz nam piši na info@loyavi.app.</p>}
            </div>
          )}
        </Panel>
      )}

      {open && <GuestSheet guest={open} goal={venue.goal} venueId={venue.id} coupons={data.coupons.filter((c) => c.customerId === open.id)} onClose={() => setOpenId(null)} />}
    </>
  );
}
