import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "الوثائق — HN-DB" },
      { name: "description", content: "دليل البدء السريع، أمثلة الاتصال، ومرجع API لمنصة HN-DB." },
      { property: "og:title", content: "وثائق HN-DB" },
      { property: "og:description", content: "دليل واضح لكل ميزة مع أمثلة عملية وروابط API." },
      { property: "og:url", content: "https://hub-db-nexus.lovable.app/docs" },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/docs" }],
  }),
  component: DocsPage,
});

function DocsPage() {
  const { data: c, isLoading } = useSiteContent();
  if (isLoading || !c) {
    return (
      <PublicLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">{c.docs.eyebrow}</div>
          <h1 className="text-4xl md:text-5xl font-bold">{c.docs.title}</h1>
          <p className="mt-4 text-muted-foreground">{c.docs.subtitle}</p>
        </div>

        <div className="space-y-4">
          {c.docs.sections.map((s) => (
            <article
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition"
            >
              <h2 className="text-lg font-semibold">{s.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>

        <div
          className="mt-10 rounded-2xl border border-border bg-card p-6 font-mono text-sm text-left"
          style={{ direction: "ltr" }}
        >
          <div className="text-muted-foreground">// connect to HN-DB</div>
          <div>
            <span className="text-primary">const</span> res ={" "}
            <span className="text-primary">await</span> fetch(
            <span className="text-[color:var(--success,theme(colors.green.400))]">
              "/api/public/site-config?domain=example.com"
            </span>
            );
          </div>
          <div>
            <span className="text-primary">const</span> data ={" "}
            <span className="text-primary">await</span> res.json();
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
