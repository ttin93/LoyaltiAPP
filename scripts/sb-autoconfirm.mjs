// Izklopi email-confirm (auto-confirm signupov) prek Management API. Bere .env.local.
import fs from "fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
);
const tok = env.SUPABASE_ACCESS_TOKEN;
const ref = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)\.supabase/)?.[1];
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mailer_autoconfirm: true }),
});
console.log("status", res.status, "— email-confirm izklopljen (autoconfirm=true)");
