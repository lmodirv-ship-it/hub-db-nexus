import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Github } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — HN-DB" },
      { name: "description", content: "تواصل مع فريق HN-DB للاستفسارات والدعم الفني." },
      { property: "og:title", content: "تواصل مع HN-DB" },
      { property: "og:description", content: "فريقنا جاهز للإجابة على أسئلتك." },
      { property: "og:url", content: "https://hub-db-nexus.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://hub-db-nexus.lovable.app/contact" }],
  }),
  component: ContactPage,
});

const CHANNELS = [
  { icon: Mail, t: "البريد الإلكتروني", d: "support@hn-db.app", href: "mailto:support@hn-db.app" },
  { icon: MessageCircle, t: "الدردشة المباشرة", d: "متاحة من 9 صباحاً إلى 6 مساءً", href: "#" },
  { icon: Github, t: "GitHub", d: "بلّغ عن مشكلة أو اقترح ميزة", href: "#" },
];

function ContactPage() {
  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-3">تواصل معنا</div>
          <h1 className="text-4xl md:text-5xl font-bold">نحن هنا لمساعدتك</h1>
          <p className="mt-4 text-muted-foreground">اختر الطريقة الأنسب لك للتواصل مع فريقنا.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {CHANNELS.map((c) => (
            <a
              key={c.t}
              href={c.href}
              className="rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)] transition"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4">
                <c.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{c.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </a>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
