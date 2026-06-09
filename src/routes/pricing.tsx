import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-layout";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "الأسعار — HN-DB" },
      { name: "description", content: "خطط أسعار مرنة لإدارة قواعد البيانات والتخزين السحابي. ابدأ مجاناً." },
      { property: "og:title", content: "أسعار HN-DB" },
      { property: "og:description", content: "ابدأ مجاناً وتوسّع عندما تكون جاهزاً." },
      { property: "og:url", content: "https://hub-db-nexus.lovable.app/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
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
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">{c.pricing.eyebrow}</div>
          <h1 className="text-4xl md:text-5xl font-bold">{c.pricing.title}</h1>
          <p className="mt-4 text-muted-foreground">{c.pricing.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {c.pricing.plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-7 ${
                p.featured
                  ? "border-primary bg-primary/5 shadow-[0_0_40px_-10px_var(--primary)] scale-[1.02]"
                  : "border-border bg-card"
              }`}
            >
              <div className="text-sm text-muted-foreground">{p.name}</div>
              <div className="mt-2 text-4xl font-bold">{p.price}</div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full mt-7" variant={p.featured ? "default" : "outline"}>
                <Link to="/auth">{c.pricing.ctaSelect}</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
