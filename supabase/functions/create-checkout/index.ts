import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE = Deno.env.get("SITE_URL") ?? "https://etmcpa.github.io/tagaligtas";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  const PAYMONGO_SECRET = Deno.env.get("PAYMONGO_SECRET_KEY") ?? "";
  if (!PAYMONGO_SECRET) return json({ error: "server not configured (PAYMONGO_SECRET_KEY missing)" }, 500);
  try {
    const { order_no } = await req.json();
    if (!order_no) return json({ error: "order_no required" }, 400);
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
    // Ensure the order row exists WITHOUT overwriting intake captured by create-order.
    await supa.from("orders").upsert({ order_no }, { onConflict: "order_no", ignoreDuplicates: true });
    const payload = { data: { attributes: {
      line_items: [{ name: "TagaLigtas — Executive Summary", amount: 560000, currency: "PHP", quantity: 1 }],
      payment_method_types: ["gcash", "card", "paymaya"],
      description: `Executive Summary — ${order_no}`,
      reference_number: order_no,
      metadata: { order_no },
      success_url: `${SITE}/settlement.html?paid=1&order=${encodeURIComponent(order_no)}`,
      cancel_url: `${SITE}/settlement.html?order=${encodeURIComponent(order_no)}`,
    }}};
    const res = await fetch("https://api.paymongo.com/v1/checkout_sessions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Basic ${btoa(`${PAYMONGO_SECRET}:`)}` }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return json({ error: "paymongo_error", detail: data }, 502);
    const cs = data.data;
    await supa.from("orders").update({ checkout_session_id: cs.id }).eq("order_no", order_no);
    return json({ checkout_url: cs.attributes.checkout_url, id: cs.id });
  } catch (e) { return json({ error: String(e) }, 500); }
});
