import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft, Layers } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
      { name: "twitter:title", content: "HN-DB — منصة متكاملة لإدارة قواعد البيانات" },
      { name: "twitter:description", content: "إدارة قواعد البيانات والتخزين السحابي لكل مواقعك من مركز واحد." },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();
  return (
    <PublicLayout>
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Illustration on the LEFT (visual) */}
          <div className="order-1 relative">
            <div
              className="absolute inset-0 rounded-[2rem] blur-3xl opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            />
            <img
              src={heroImage}
              alt="منصة HN-DB لإدارة قواعد البيانات"
              width={1536}
              height={1024}
              className="relative rounded-[2rem] ring-1 ring-primary/20 shadow-[0_30px_80px_-20px_oklch(0.74_0.17_235/0.45)]"
            />
          </div>

          {/* Text on the RIGHT */}
          <div className="order-2 text-right">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              منصة متكاملة
              <br />
              لإدارة <span className="neon-text">قواعد</span>
              <br />
              <span className="neon-text">البيانات</span>
              <br />
              والتخزين <span className="neon-text">السحابي</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-xl mr-0 ml-auto leading-relaxed">
              حلول قوية وآمنة لإدارة بياناتك وتخزين ملفاتك
              <br />
              بأعلى مستويات الأداء والموثوقية
            </p>

            <div className="mt-10 flex flex-wrap gap-3 justify-end">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base h-12 px-6 rounded-full"
              >
                <Link to="/features">
                  <Layers className="h-4 w-4 ml-2" />
                  استكشف الميزات
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="text-base h-12 px-6 rounded-full shadow-[0_0_40px_-8px_var(--primary)]"
              >
                <Link to={user ? "/dashboard" : "/auth"}>
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  ابدأ الآن
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground flex flex-col items-center gap-2 opacity-70">
          <span>اسحب للأسفل للاستكشاف</span>
          <div className="h-6 w-px bg-primary/50 animate-pulse" />
        </div>
      </section>

      {/* Quick stat strip below the fold (matches reference's lower cards) */}
      <section className="border-t border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "أمان متقدم", d: "حماية بياناتك بأحدث تقنيات التشفير AES-256" },
            { t: "تخزين سحابي", d: "الوصول إلى ملفاتك من أي مكان بأمان تام" },
            { t: "قواعد بيانات قوية", d: "أداء عالي وقابلية توسع لا محدودة" },
            { t: "أداء عالي", d: "استجابة فورية وسرعة فائقة" },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-border bg-card/60 p-5 text-right hover:border-primary/50 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/30 mb-3 mr-auto">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
