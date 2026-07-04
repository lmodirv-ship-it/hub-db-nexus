import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

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

type Row = { table_name: string; row_pk: string | number; payload: Record<string, unknown> };

export const Route = createFileRoute("/api/external-data/sync")({
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
          const rows: Row[] = Array.isArray(body.rows) ? body.rows : [];
          if (!source_name) return json({ error: "source_name required" }, 400);
          if (rows.length === 0) return json({ ok: true, upserted: 0 });

          const now = new Date().toISOString();
          const records = rows
            .filter((r) => r && r.table_name && r.row_pk != null)
            .map((r) => ({
              source_name,
              table_name: String(r.table_name),
              row_pk: String(r.row_pk),
              payload: r.payload ?? {},
              received_at: now,
            }));

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Chunk to avoid oversized requests
          const chunkSize = 500;
          let upserted = 0;
          for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            const { error } = await supabaseAdmin
              .from("external_data_rows")
              .upsert(chunk, { onConflict: "source_name,table_name,row_pk" });
            if (error) return json({ error: error.message, upserted }, 500);
            upserted += chunk.length;
          }

          // Touch mirror last_sync_at if exists
          await supabaseAdmin
            .from("external_schema_mirrors")
            .update({ last_sync_at: now, status: "synced" })
            .eq("source_name", source_name);

          return json({ ok: true, upserted });
        } catch (e: any) {
          return json({ error: "Internal error", detail: String(e?.message ?? e) }, 500);
        }
      },
    },
  },
});
