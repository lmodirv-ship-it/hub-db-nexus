import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Database, Shield, Cloud, Activity, ArrowLeft, Layers } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/hooks/use-language";
import heroImage from "@/assets/hero-database.jpg";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HN-DB — منصة متكاملة لإدارة قواعد البيانات والتخزين السحابي" },
      { name: "description", content: "حلول قوية وآمنة لإدارة بياناتك وتخزين ملفاتك بأعلى مستويات الأداء والموثوقية." },
      { property: "og:title", content: "HN-DB — منصة متكاملة لإدارة قواعد البيانات" },
      { property: "og:description", content: "إدارة قواعد البيانات والتخزين السحابي لكل مواقعك من مركز واحد آمن وسريع." },
      { property: "og:url", content: "https://hub-db-nexus.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/" }],
  }),
  component: LandingPage,
});

const STAT_ICONS = [Shield, Cloud, Database, Activity];

function LandingPage() {
  const { user } = useAuth();
  const { dir } = useLanguage();
  const { data: c, isLoading } = useSiteContent();

  if (isLoading || !c) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  const isRtl = dir === "rtl";

  return (
    <PublicLayout>
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Illustration */}
          <div className="relative order-2 lg:order-1">
            <div
              className="absolute inset-0 rounded-[2rem] blur-3xl opacity-40"
              style={{ background: "var(--gradient-primary)" }}
            />
            <img
              src={heroImage}
              alt={c.brand}
              width={1536}
              height={1024}
              className="relative rounded-[2rem] ring-1 ring-primary/20 shadow-[0_30px_80px_-20px_oklch(0.74_0.17_235/0.45)] w-full"
            />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 text-center lg:text-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">
              {c.hero.titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line.map((part, j) =>
                    part.emph ? (
                      <span key={j} className="neon-text">{part.text}</span>
                    ) : (
                      <span key={j}>{part.text}</span>
                    ),
                  )}
                </span>
              ))}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl lg:mx-0 mx-auto leading-relaxed">
              {c.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="text-base h-12 px-7 rounded-full shadow-[0_0_40px_-8px_var(--primary)]"
              >
                <Link to={user ? "/dashboard" : "/auth"}>
                  {c.hero.ctaStart}
                  <ArrowLeft className={isRtl ? "h-4 w-4 mr-2" : "h-4 w-4 ml-2 rotate-180"} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base h-12 px-7 rounded-full"
              >
                <Link to="/features">
                  <Layers className="h-4 w-4 mx-2" />
                  {c.hero.ctaFeatures}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="border-t border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.stats.map((s, i) => {
            const Icon = STAT_ICONS[i] ?? Database;
            return (
              <div
                key={s.t}
                className="rounded-2xl border border-border bg-card/70 p-6 text-center hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)] transition"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">{s.t}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
