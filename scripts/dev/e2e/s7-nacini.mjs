// Korak 7: način Samo stojalo / Samo račun in premor med žigi. Nastavitve zapišemo neposredno (UI je preizkušen v koraku 2), na koncu vrnemo.
import { open, check, note, summary, state, db, sleep, receipt, venueRow, metaOf } from "./lib.mjs";
const V = state.venueId, code = state.code, dav = state.dav;
const v0 = await venueRow();
const setMode = async (checkin) => db.from("venues").update({ automations: { ...v0.automations, __v2: { ...metaOf(v0), checkin } } }).eq("id", V);
const g = await open("guest2", { mobile: true, email: state.guest2 });
try {
  await g.go(`/p/${code}`, 1500);
  await setMode("stand");
  let r = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 3) });
  check("način Stojalo: račun je zavrnjen", !r.ok, r.error);
  await g.go(`/p/${code}`, 2500);
  check("način Stojalo: ni gumba Skeniraj račun", !(await g.has("Skeniraj račun")));
  await g.shot("h01-samo-stojalo", true);

  await setMode("receipt");
  await g.go(`/s/${code}?k=${metaOf(v0).standKey}`, 4000);
  const st = await db.from("customers").select("stamps").eq("venue_id", V).eq("email", state.guest2).single();
  note("način Račun: obisk stojala", `žigov ${st.data.stamps}, url ${g.page.url()}`);
  r = await g.post("/api/checkin", { venueCode: code });
  check("način Račun: žig s stojala zavrnjen", !r.ok, r.error);

  await db.from("venues").update({ scan_cooldown_minutes: 60 }).eq("id", V);
  const a = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 2) });
  const b = await g.post("/api/scan", { venueCode: code, payload: receipt(dav, 1) });
  check("premor 60 minut: drugi račun takoj za prvim je zavrnjen", a.ok && !b.ok, `${a.ok ? "prvi ok" : a.error} / ${b.error}`);

  // lokal brez davčne v načinu Račun: gost ne more zbirati
  await db.from("venues").update({ davcna_stevilka: null }).eq("id", V);
  await g.go(`/p/${code}`, 2500);
  check("brez davčne številke stran pove, da lokal še pripravlja zbiranje", await g.has("Lokal še pripravlja zbiranje žigov"));
} finally {
  await db.from("venues").update({ automations: v0.automations, scan_cooldown_minutes: v0.scan_cooldown_minutes, davcna_stevilka: v0.davcna_stevilka }).eq("id", V);
  const back = await venueRow();
  note("nastavitve vrnjene", JSON.stringify({ checkin: metaOf(back).checkin, cooldown: back.scan_cooldown_minutes, dav: back.davcna_stevilka }));
  await g.close();
  summary();
}
