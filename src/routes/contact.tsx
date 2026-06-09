import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Github, type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { useSiteContent } from "@/hooks/use-site-content";

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

const ICONS: Record<string, LucideIcon> = {
  mail: Mail, chat: MessageCircle, github: Github,
};

function ContactPage() {
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
          <div className="text-xs uppercase tracking-widest text-primary mb-3">{c.contact.eyebrow}</div>
          <h1 className="text-4xl md:text-5xl font-bold">{c.contact.title}</h1>
          <p className="mt-4 text-muted-foreground">{c.contact.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {c.contact.channels.map((ch) => {
            const Icon = ICONS[ch.icon] ?? Mail;
            return (
              <a
                key={ch.t}
                href={ch.href}
                className="rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)] transition"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">{ch.t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{ch.d}</p>
              </a>
            );
          })}
        </div>
      </main>
    </PublicLayout>
  );
}
