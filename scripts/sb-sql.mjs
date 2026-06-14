// Poženi SQL datoteko proti Supabase prek Management API.
// Uporaba: node scripts/sb-sql.mjs [pot/do/file.sql]   (privzeto: supabase/schema.sql)
// Token in projekt bere iz .env.local (gitignored) — nič ni hardkodirano.
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const tok = env.SUPABASE_ACCESS_TOKEN;
const ref = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)\.supabase/)?.[1];
if (!tok || !ref) {
  console.error("Manjka SUPABASE_ACCESS_TOKEN ali NEXT_PUBLIC_SUPABASE_URL v .env.local");
  process.exit(1);
}

const file = process.argv[2] || "supabase/schema.sql";
const sql = fs.readFileSync(file, "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

console.log(`ref=${ref} file=${file} status=${res.status}`);
const text = await res.text();
console.log(text.slice(0, 2000));
