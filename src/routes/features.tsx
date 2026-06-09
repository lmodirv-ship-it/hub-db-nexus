import { createFileRoute } from "@tanstack/react-router";
import { Database, Shield, Cloud, Activity, Zap, Lock, type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "الميزات — HN-DB" },
      { name: "description", content: "اكتشف ميزات HN-DB: قواعد بيانات مركزية، تشفير AES-256، تخزين سحابي، ومراقبة لحظية." },
      { property: "og:title", content: "ميزات منصة HN-DB" },
      { property: "og:description", content: "أدوات احترافية لإدارة قواعد البيانات والتخزين السحابي بأمان عالي." },
      { property: "og:url", content: "https://hub-db-nexus.lovable.app/features" },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/features" }],
  }),
  component: FeaturesPage,
});

const ICONS: Record<string, LucideIcon> = {
  database: Database, shield: Shield, cloud: Cloud,
  activity: Activity, zap: Zap, lock: Lock,
};

function FeaturesPage() {
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
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">{c.features.eyebrow}</div>
          <h1 className="text-4xl md:text-5xl font-bold">{c.features.title}</h1>
          <p className="mt-4 text-muted-foreground">{c.features.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {c.features.items.map((f) => {
            const Icon = ICONS[f.icon] ?? Database;
            return (
              <div
                key={f.t}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-lg">{f.t}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            );
          })}
        </div>
      </main>
    </PublicLayout>
  );
}
