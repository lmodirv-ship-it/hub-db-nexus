import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export const Route = createFileRoute("/api/public/site-config")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const domain = (url.searchParams.get("domain") || "").trim().toLowerCase();
          if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
            return json({ error: "Invalid or missing 'domain' query parameter" }, 400);
          }

          const { data: site, error: sErr } = await supabaseAdmin
            .from("websites")
            .select("id, name, domain, status, created_at, owner_id")
            .ilike("domain", domain)
            .maybeSingle();

          if (sErr) return json({ error: "Lookup failed" }, 500);
          if (!site) return json({ error: "Site not found" }, 404);

          const { data: dbs } = await supabaseAdmin
            .from("databases")
            .select("id, name, engine, status, connection_id, last_connection, last_backup, size_mb")
            .eq("website_id", site.id);

          const databases = (dbs ?? []).map((d) => ({
            id: d.id,
            name: d.name,
            engine: d.engine,
            status: d.status,
            connectionId: d.connection_id,
            lastConnection: d.last_connection,
            lastBackup: d.last_backup,
            sizeMb: d.size_mb,
          }));

          return json({
            site: {
              id: site.id,
              name: site.name,
              domain: site.domain,
              status: site.status,
              createdAt: site.created_at,
            },
            databases,
            databaseStatus: databases.length
              ? databases.every((d) => d.status === "Active") ? "Active" : "Degraded"
              : "None",
            // Filled by HN-Cloud once it exists:
            storage: { provider: "HN-Cloud", basePath: null, files: [] },
            android: null, // { latestApkUrl, latestAabUrl, versionName, versionCode, releasedAt }
            generatedAt: new Date().toISOString(),
          });
        } catch (e: any) {
          return json({ error: "Internal error" }, 500);
        }
      },
    },
  },
});
