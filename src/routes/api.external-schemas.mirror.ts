import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Signature, X-HN-Signature",
  "Access-Control-Max-Age": "86400",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const provided = header.replace(/^sha256=/, "").trim();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/external-schemas/mirror")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const secret = process.env.HN_DB_MIRROR_SECRET;
          if (!secret) return json({ error: "Server misconfigured" }, 500);

          const raw = await request.text();
          const sig =
            request.headers.get("x-signature") ??
            request.headers.get("x-hn-signature");
          if (!verifySignature(raw, sig, secret)) {
            return json({ error: "Invalid signature" }, 401);
          }

          let body: any;
          try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400); }

          const source_name = String(body.source_name ?? "").trim();
          const target_name = String(body.target_name ?? source_name).trim();
          const schema_name = String(body.schema_name ?? "public").trim();
          const tables = Array.isArray(body.tables) ? body.tables : [];
          if (!source_name) return json({ error: "source_name required" }, 400);

          const payload_hash = createHash("sha256").update(JSON.stringify(tables)).digest("hex");
          const now = new Date().toISOString();

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("external_schema_mirrors")
            .upsert(
              {
                source_name,
                target_name,
                schema_name,
                tables_count: tables.length,
                payload_hash,
                tables_snapshot: tables,
                received_at: now,
                last_sync_at: now,
                status: "synced",
              },
              { onConflict: "source_name,target_name" }
            )
            .select()
            .single();

          if (error) return json({ error: error.message }, 500);
          return json({ ok: true, id: data.id, tables_count: tables.length, payload_hash });
        } catch (e: any) {
          return json({ error: "Internal error", detail: String(e?.message ?? e) }, 500);
        }
      },
    },
  },
});
