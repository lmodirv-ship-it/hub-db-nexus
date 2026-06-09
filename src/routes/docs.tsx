import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

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

const SECTIONS = [
  {
    t: "كيف يعمل؟",
    body: "HN-DB يعمل كوسيط آمن بين مواقعك وقواعد البيانات. اربط موقعك مرة واحدة، وأدر كل شيء من لوحة واحدة.",
  },
  {
    t: "ربط موقع PHP / Node / Python",
    body: "استخدم مفتاح API الخاص بمشروعك لإجراء طلبات HTTPS مباشرة إلى /api/public/site-config مع تمرير الدومين.",
  },
  {
    t: "المصادقة الموحدة (SSO)",
    body: "كل مستخدم في HN-DB يحصل على جلسة موحدة. استخدم Bearer token لاستدعاء وظائف الخادم المحمية.",
  },
  {
    t: "رفع ملفات للتخزين",
    body: "ارفع APK / AAB أو نسخك الاحتياطية إلى bucket app-releases. يتم توليد روابط موقّعة لمدة ساعة.",
  },
  {
    t: "نشر على VPS",
    body: "راجع ملف DEPLOYMENT.md داخل المشروع للحصول على دليل البناء والتشغيل على سيرفر محلي أو VPS.",
  },
];

function DocsPage() {
  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">الوثائق</div>
          <h1 className="text-4xl md:text-5xl font-bold">ابدأ بسرعة مع HN-DB</h1>
          <p className="mt-4 text-muted-foreground">دليل مفصّل لكل ميزة، مع أمثلة جاهزة.</p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <article
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 text-right hover:border-primary/50 transition"
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
