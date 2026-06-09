import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Database, LogIn, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, type Lang } from "@/hooks/use-language";
import { useSiteContent } from "@/hooks/use-site-content";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="hidden sm:flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground mx-1.5" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-full transition",
            lang === l.code
              ? "bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--primary)]"
              : "text-foreground/60 hover:text-foreground",
          )}
          aria-label={`Switch to ${l.code}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function PublicNav() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: c } = useSiteContent();
  const { dir } = useLanguage();

  const nav = c
    ? [
        { to: "/", label: c.nav.home },
        { to: "/features", label: c.nav.features },
        { to: "/pricing", label: c.nav.pricing },
        { to: "/docs", label: c.nav.docs },
        { to: "/contact", label: c.nav.contact },
      ]
    : [];

  // In RTL, login sits on the left; in LTR, on the right.
  const LoginBtn = user ? (
    <Button asChild size="sm">
      <Link to="/dashboard">{c?.nav.dashboard ?? "Dashboard"}</Link>
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm">
      <Link to="/auth">
        <LogIn className="h-4 w-4 mx-1.5" />
        {c?.nav.login ?? "Sign in"}
      </Link>
    </Button>
  );

  const Brand = (
    <Link to="/" className="flex items-center gap-3">
      <div className="font-bold tracking-tight text-lg">{c?.brand ?? "HN-DB"}</div>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Database className="h-5 w-5" />
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {LoginBtn}
          <LanguageSwitcher />
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  active
                    ? "text-primary font-semibold neon-text"
                    : "text-foreground/70 hover:text-foreground transition"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {Brand}
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const { data: c } = useSiteContent();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.74 0.17 235 / 0.35) 1px, transparent 1px), linear-gradient(90deg, oklch(0.74 0.17 235 / 0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 600px at 50% 20%, oklch(0.74 0.17 235 / 0.18), transparent 60%)",
        }}
      />
      <PublicNav />
      {children}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HN-DB · {c?.footer ?? "All rights reserved"}
      </footer>
    </div>
  );
}
