import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft, Shield, Cloud, Activity, Zap, Lock, Server, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import heroImage from "@/assets/hero-database.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: 'HN-DB — منصة متكاملة لإدارة قواعد البيانات والتخزين السحابي' },
      { name: "description", content: 'حلول قوية وآمنة لإدارة بياناتك وتخزين ملفاتك بأعلى مستويات الأداء والموثوقية. أدِر كل قواعد بياناتك ومواقعك من واجهة واحدة.' },
      { property: "og:title", content: 'HN-DB — منصة متكاملة لإدارة قواعد البيانات' },
      { property: "og:description", content: 'إدارة قواعد البيانات والتخزين السحابي لكل مواقعك من مركز واحد آمن وسريع.' },
      { property: "og:url", content: 'https://hub-db-nexus.lovable.app/' },
      { name: "twitter:title", content: 'HN-DB — منصة متكاملة لإدارة قواعد البيانات' },
      { name: "twitter:description", content: 'إدارة قواعد البيانات والتخزين السحابي لكل مواقعك من مركز واحد.' },
    ],
    links: [{ rel: "canonical", href: 'https://hub-db-nexus.lovable.app/' }],
  }),
  component: LandingPage,
});

function PublicNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]"
               style={{ background: "var(--gradient-primary)" }}>
            <Database className="h-5 w-5" />
          </div>
          <div className="font-bold tracking-tight text-lg">HN-DB</div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#home" className="text-primary font-semibold neon-text">الرئيسية</a>
          <a href="#features" className="text-foreground/70 hover:text-foreground transition">الميزات</a>
          <a href="#pricing" className="text-foreground/70 hover:text-foreground transition">الأسعار</a>
          <a href="#docs" className="text-foreground/70 hover:text-foreground transition">الوثائق</a>
          <a href="#contact" className="text-foreground/70 hover:text-foreground transition">تواصل معنا</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link to="/dashboard">لوحة التحكم</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth"><LogIn className="h-4 w-4 ml-1.5" />دخول</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      {/* HERO */}
      <section id="home" className="relative">
        {/* radial wave bg */}
        <div className="absolute inset-0 -z-10 opacity-60"
             style={{
               background:
                 "radial-gradient(1200px 800px at 50% 50%, oklch(0.74 0.17 235 / 0.15), transparent 60%), repeating-radial-gradient(circle at 30% 50%, oklch(0.74 0.17 235 / 0.05) 0 2px, transparent 2px 24px)",
             }} />
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              منصة الجيل الجديد لإدارة البيانات
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              منصة متكاملة
              <br />
              لإدارة <span className="neon-text">قواعد البيانات</span>
              <br />
              والتخزين <span className="neon-text">السحابي</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mr-0 ml-auto leading-relaxed">
              حلول قوية وآمنة لإدارة بياناتك وتخزين ملفاتك بأعلى مستويات الأداء والموثوقية،
              من مركز تحكم واحد لكل مواقعك.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              <Button asChild size="lg" className="text-base h-12 px-6 shadow-[0_0_40px_-8px_var(--primary)]">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  ابدأ الآن
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-12 px-6">
                <a href="#features">
                  <Database className="h-4 w-4 ml-2" />
                  استكشف الميزات
                </a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md ml-auto text-right">
              <div>
                <div className="text-2xl font-bold neon-text">99.9%</div>
                <div className="text-xs text-muted-foreground">وقت التشغيل</div>
              </div>
              <div>
                <div className="text-2xl font-bold neon-text">AES-256</div>
                <div className="text-xs text-muted-foreground">تشفير كامل</div>
              </div>
              <div>
                <div className="text-2xl font-bold neon-text">24/7</div>
                <div className="text-xs text-muted-foreground">مراقبة دائمة</div>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
                 style={{ background: "var(--gradient-primary)" }} />
            <img
              src={heroImage}
              alt="منصة HN-DB لإدارة قواعد البيانات"
              width={1536}
              height={1024}
              className="relative rounded-3xl ring-1 ring-primary/20 shadow-[0_30px_80px_-20px_oklch(0.74_0.17_235/0.35)]"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-primary mb-3">الميزات</div>
            <h2 className="text-3xl md:text-4xl font-bold">كل ما تحتاجه لإدارة بنيتك التحتية</h2>
            <p className="mt-3 text-muted-foreground">أدوات مصممة للمحترفين، بواجهة بسيطة وأمان على مستوى المؤسسات.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Database, t: "قواعد بيانات مركزية", d: "أدِر كل قواعد بياناتك من واجهة واحدة موحدة." },
              { icon: Shield, t: "تشفير AES-256", d: "حماية كاملة لبياناتك أثناء النقل والتخزين." },
              { icon: Cloud, t: "تخزين سحابي مرن", d: "تخزين ملفاتك ونسخك الاحتياطية في السحابة." },
              { icon: Activity, t: "مراقبة لحظية", d: "تتبّع الأداء والحالة الصحية على مدار الساعة." },
              { icon: Zap, t: "أداء عالي", d: "بنية محسّنة لاستجابة سريعة وتوسّع تلقائي." },
              { icon: Lock, t: "صلاحيات دقيقة", d: "تحكم كامل في من يصل إلى ماذا، ومتى." },
            ].map((f) => (
              <div key={f.t}
                   className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING teaser */}
      <section id="pricing" className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">الأسعار</div>
          <h2 className="text-3xl md:text-4xl font-bold">خطط مرنة تناسب احتياجك</h2>
          <p className="mt-3 text-muted-foreground">ابدأ مجاناً وتوسّع عندما تكون جاهزاً.</p>

          <div className="mt-10 grid md:grid-cols-3 gap-5 text-right">
            {[
              { name: "البداية", price: "مجاناً", features: ["قاعدة بيانات واحدة", "1 GB تخزين", "نسخ احتياطي يومي"] },
              { name: "احترافي", price: "$19/شهر", features: ["10 قواعد بيانات", "100 GB تخزين", "مراقبة لحظية", "دعم أولوية"], featured: true },
              { name: "المؤسسات", price: "تواصل معنا", features: ["غير محدود", "SLA مخصّص", "إدارة فِرَق", "أمان متقدم"] },
            ].map((p) => (
              <div key={p.name}
                   className={`rounded-2xl border p-6 ${p.featured ? "border-primary bg-primary/5 shadow-[0_0_40px_-10px_var(--primary)]" : "border-border bg-card"}`}>
                <div className="text-sm text-muted-foreground">{p.name}</div>
                <div className="mt-2 text-3xl font-bold">{p.price}</div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((x) => (
                    <li key={x} className="flex items-center gap-2 justify-end">
                      <span>{x}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full mt-6" variant={p.featured ? "default" : "outline"}>
                  <Link to="/auth">اختر هذه الخطة</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCS / CONTACT */}
      <section id="docs" className="border-t border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-primary mb-3">الوثائق</div>
            <h2 className="text-3xl font-bold">ابدأ بسرعة مع وثائق واضحة</h2>
            <p className="mt-3 text-muted-foreground">دليل مفصّل لكل ميزة، مع أمثلة عملية وروابط API جاهزة.</p>
            <Button asChild variant="outline" className="mt-6">
              <a href="#">تصفّح الوثائق</a>
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 font-mono text-sm text-left dir-ltr"
               style={{ direction: "ltr" }}>
            <div className="text-muted-foreground">// connect to HN-DB</div>
            <div><span className="text-primary">const</span> db = <span className="text-primary">await</span> hnDb.connect({"{"}</div>
            <div className="pl-4">project: <span className="text-[color:var(--success)]">"my-site"</span>,</div>
            <div className="pl-4">encryption: <span className="text-[color:var(--success)]">"AES-256"</span>,</div>
            <div>{"}"});</div>
            <div className="mt-3 text-muted-foreground">// query</div>
            <div><span className="text-primary">const</span> users = <span className="text-primary">await</span> db.query(<span className="text-[color:var(--success)]">"SELECT * FROM users"</span>);</div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border/40">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Server className="h-10 w-10 mx-auto text-primary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold">جاهز لتبدأ؟</h2>
          <p className="mt-3 text-muted-foreground">انضم إلى HN-DB وأدر بنيتك التحتية باحترافية.</p>
          <Button asChild size="lg" className="mt-8 h-12 px-8 shadow-[0_0_40px_-8px_var(--primary)]">
            <Link to={user ? "/dashboard" : "/auth"}>
              <ArrowLeft className="h-4 w-4 ml-2" />
              ابدأ الآن مجاناً
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HN-DB · جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
