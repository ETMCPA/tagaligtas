# TagaSuri — public funnel (v1)

Static, self-contained landing + free triage for **ETM-Tax Agent Office [ETM-TAO], Inc.**
No build step, no backend, no client data. This folder is deliberately isolated from the
case documents in the parent folder so those are never deployed or pushed anywhere.

## Files
- `index.html` — the whole site (inline CSS + JS). Trilingual EN / TL / 中.
- `favicon.svg` — browser-tab icon (magnifier = "the examiner").
- `og-image.svg` — Facebook / Messenger share card.

## What it does (and deliberately does NOT do)
- **Does:** hero + trust, a free 2-minute triage that shows a *non-authoritative* deadline
  estimate, and a "Book a Case Appraisal" CTA that opens Facebook Messenger
  (`m.me/327345850608888`).
- **Does NOT:** read documents, detect nullity grounds, generate any instrument, or take
  payment. Those are later phases, gated by a UPL/venue legal opinion. This page only
  *informs*; it files nothing and practices no law.

## Deploy (pick one, ~2 minutes)
- **Netlify Drop:** drag this folder onto https://app.netlify.com/drop
- **GitHub Pages:** push this folder to a repo → Settings → Pages → deploy from branch
- **Vercel / Cloudflare Pages:** "import project", framework preset = "Other" (static)

## After you have a domain (do this once)
1. In `index.html`, set the two share URLs to absolute paths:
   - `og:image` / `twitter:image` → `https://YOUR-DOMAIN/og-image.svg`
   - add `<meta property="og:url" content="https://YOUR-DOMAIN/">`
2. For the crispest Facebook card, export `og-image.svg` to **`og-image.png` (1200×630)**
   and point the tags at the PNG — some FB scrapers skip SVG.
3. Re-scrape at https://developers.facebook.com/tools/debug/ so Messenger shows the new card.

## Payments (deferred, by design)
Collect the ₱5,000 manually over Messenger during the pilot. Only after the pilot proves
willingness-to-pay, add a hosted PH gateway (PayMongo / Xendit / Maya). Keep only a payment
reference on the operator record — never card data (zero-retention).
