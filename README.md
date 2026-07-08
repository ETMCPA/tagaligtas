# TagaLigtas — public funnel

Static, trilingual (English / Pilipino / 中文) funnel for **ETM-Tax Agent Office [ETM-TAO], Inc.**
For anyone who received a BIR letter (LoA/eLA, Notice, NOD, PAN, FLD/FAN, FDDA, FD). It runs a
free deadline check, then guides the taxpayer toward a paid **Executive Summary** (₱5,600 =
₱5,000 + 12% VAT) of their Letter of Authority.

> This page is public education, not tax or legal advice. It does not read documents itself.

## Pages
- `index.html` — landing + free triage (deadline estimate) + share step. Trilingual, inline CSS/JS.
- `order-slip.html` — intake: contact details + Google Drive folder link → captured to Supabase.
- `settlement.html` — provider-neutral checkout (PayMongo gateway; GCash/bank manual rails).
- `privacy.html` / `terms.html` / `refund.html` — policy pages.
- `favicon.svg`, `og-image.svg`, `founder.png` (background-removed portrait) — assets.

## Backend (Supabase project `aodkheohhbzcgvzhjekx`)
Source of truth for the edge functions lives in **`supabase/functions/`**:
- `create-order` — captures Order Slip intake into the `orders` table (honeypot + input validation).
- `create-checkout` — creates a PayMongo Checkout Session for ₱5,600, keyed by Order No.
- `paymongo-webhook` — verifies the PayMongo signature, records the payment, marks the order paid.

Tables: `orders`, `payments`. Secrets (service role, PayMongo keys, webhook secret) live in Supabase
env only — never in this repo or the static HTML.

## Language persistence
The chosen language is stored in `localStorage` (`tl_lang`) and carried across pages via `&lang=`,
so a Pilipino/中文 visitor stays in their language through the whole funnel.

## Deploy (GitHub Pages)
This repo's root is served at **https://etmcpa.github.io/tagaligtas/**. Deploy = push to `main`:
```
git add -A && git commit -m "…" && git push origin main
```
Pages rebuilds in ~1–2 min. `.gitignore` keeps internal docs (`BUILD_SPEC.md`, `TRIAGE_SPEC.md`,
`UX_STATE_MAP.md`, `CLAUDE.md`), secrets, and client documents (`*.pdf/*.docx/*.pages/…`) out of
the public deploy.

## Pilot status
Payment runs in **TEST mode** (a "you will NOT be charged" banner shows on order-slip + settlement);
`create-order` intake is live. Document reading and the Executive Summary are done by a human
practitioner. The Statutory Demand / Statutory Request instrument is parked pending a UPL + venue
legal opinion.
