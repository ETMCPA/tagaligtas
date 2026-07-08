import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
// Trim + cap a free-text field; empty -> null so we never store whitespace.
const clip = (v: unknown, max: number): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
};

// Captures Order Slip intake into the orders table (name, email, mobile, Drive link, Order No.)
// so the operator reliably receives every order regardless of the email hand-off.
// Hardened for public exposure (no CAPTCHA key needed): honeypot + order_no validation +
// length caps. Deliberately does NOT reject on a user's typo'd email/link — the operator fixes
// those; we only block bot-shaped noise, never a real person's intake.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const { order_no, name, email, mobile, drive_link, branch, hp } = body ?? {};

    // Honeypot: real users never fill `hp` (it's a hidden field). Bots that auto-fill
    // every input do. Return a fake success so they don't learn they were filtered.
    if (hp !== undefined && hp !== null && String(hp).trim() !== "") {
      return json({ ok: true, order_no: order_no ?? null });
    }

    // order_no is server-referenced everywhere (payments FK, webhook match) — validate it.
    const on = clip(order_no, 64);
    if (!on) return json({ error: "order_no required" }, 400);
    if (!/^[A-Za-z0-9._-]{4,64}$/.test(on)) return json({ error: "invalid order_no" }, 400);

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error } = await supa.from("orders").upsert(
      {
        order_no: on,
        name: clip(name, 200),
        email: clip(email, 200),
        mobile: clip(mobile, 40),
        drive_link: clip(drive_link, 400),
        branch: clip(branch, 200),
        status: "awaiting_payment",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "order_no" },
    );
    if (error) return json({ error: String(error.message ?? error) }, 500);
    return json({ ok: true, order_no: on });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
