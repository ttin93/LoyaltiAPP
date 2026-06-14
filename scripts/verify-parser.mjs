// Hitra kontrola parserja na pravem računu Meso Meso.
const payload = "331249375574061481977389643882881383163973849332605221503404";
const zoiDec = payload.slice(0, 39);
const davcna = payload.slice(39, 47);
const dt = payload.slice(47, 59);
const control = payload.slice(59);
const zoiHex = BigInt(zoiDec).toString(16).padStart(32, "0");
const sum = payload.slice(0, 59).split("").reduce((a, c) => a + Number(c), 0);
const issuedAt = new Date(
  `20${dt.slice(0, 2)}-${dt.slice(2, 4)}-${dt.slice(4, 6)}T${dt.slice(6, 8)}:${dt.slice(8, 10)}:${dt.slice(10, 12)}`,
);
console.log("zoiHex      :", zoiHex);
console.log("expected    : f9344f244ed819973dd8253278507afb");
console.log("ZOI match   :", zoiHex === "f9344f244ed819973dd8253278507afb");
console.log("davcna      :", davcna, "(=97384933)");
console.log("issuedAt    :", issuedAt.toISOString());
console.log("controlValid:", sum % 10 === Number(control));
