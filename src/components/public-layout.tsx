import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Database, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/features", label: "الميزات" },
  { to: "/pricing", label: "الأسعار" },
  { to: "/docs", label: "الوثائق" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

function PublicNav() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => {
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

        <Link to="/" className="flex items-center gap-3">
          <div className="font-bold tracking-tight text-lg">HN-DB</div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Database className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Grid background */}
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
        © {new Date().getFullYear()} HN-DB · جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
