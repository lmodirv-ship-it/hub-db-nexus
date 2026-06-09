import { createFileRoute } from "@tanstack/react-router";
import { Database, Shield, Cloud, Activity, Zap, Lock } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";

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

const FEATURES = [
  { icon: Database, t: "قواعد بيانات مركزية", d: "أدِر كل قواعد بياناتك من واجهة واحدة موحدة، مهما تعدّدت المواقع." },
  { icon: Shield, t: "تشفير AES-256", d: "حماية كاملة لبياناتك أثناء النقل والتخزين بأحدث المعايير." },
  { icon: Cloud, t: "تخزين سحابي مرن", d: "تخزين ملفاتك ونسخك الاحتياطية بسعة قابلة للتوسع." },
  { icon: Activity, t: "مراقبة لحظية", d: "تتبّع الأداء والحالة الصحية على مدار الساعة." },
  { icon: Zap, t: "أداء عالي", d: "بنية محسّنة لاستجابة سريعة وتوسّع تلقائي عند الحاجة." },
  { icon: Lock, t: "صلاحيات دقيقة", d: "تحكم كامل في من يصل إلى ماذا، ومتى." },
];

function FeaturesPage() {
  return (
    <PublicLayout>
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">الميزات</div>
          <h1 className="text-4xl md:text-5xl font-bold">كل ما تحتاجه لإدارة بنيتك التحتية</h1>
          <p className="mt-4 text-muted-foreground">
            أدوات مصممة للمحترفين، بواجهة بسيطة وأمان على مستوى المؤسسات.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="group relative rounded-2xl border border-border bg-card p-6 text-right transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4 mr-auto">
                <f.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-lg">{f.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
