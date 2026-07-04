import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/external-schemas/mirror")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sigHeader = request.headers.get("x-signature") ?? "";
        const raw = await request.text();
        const secret = process.env.HN_DB_MIRROR_SECRET;
        if (!secret) return new Response("Server misconfigured", { status: 500 });

        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const a = Buffer.from(sigHeader);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response(JSON.stringify({ ok: false, error: "invalid signature" }),
            { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const payload = JSON.parse(raw) as {
          source: string; target: string; tables: any[]; mirrored_at?: string;
        };
        const payloadHash = createHmac("sha256", "hash").update(raw).digest("hex");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("external_schema_mirrors")
          .upsert({
            source_name: payload.source,
            target_name: payload.target,
            schema_name: "public",
            tables_count: payload.tables?.length ?? 0,
            tables_snapshot: payload.tables,
            payload_hash: payloadHash,
            received_at: new Date().toISOString(),
            last_sync_at: new Date().toISOString(),
            status: "success",
          }, { onConflict: "source_name,target_name" });

        if (error) return new Response(JSON.stringify({ ok: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } });

        return new Response(JSON.stringify({
          ok: true, source: payload.source, target: payload.target,
          tables: payload.tables?.length ?? 0, payloadHash,
        }), { headers: { "Content-Type": "application/json" } });
      },
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
