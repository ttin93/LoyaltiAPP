<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Kontekstni handoff (razvoj na večih PC-jih)

Ta projekt razvijam na večih računalnikih; Claude seje in spomin se NE prenašajo med njimi.

- **Na ZAČETKU vsake seje preberi [`DEVLOG.md`](DEVLOG.md)** — tam je trenutno stanje appa, arhitektura, ključne odločitve in dnevnik sprememb.
- **PRED vsakim `git commit` dopiši nov vnos na vrh dnevnika v `DEVLOG.md`** (datum + kaj si naredil + trenutno stanje), da naslednja seja (na drugem PC-ju, po `git pull`) takoj ve, kje smo.
