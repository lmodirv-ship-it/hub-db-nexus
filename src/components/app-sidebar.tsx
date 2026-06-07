import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  Link2,
  Archive,
  ScrollText,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/databases", label: "قواعد البيانات", icon: Database },
  { to: "/databases/add", label: "إضافة قاعدة", icon: PlusCircle },
  { to: "/connections", label: "ربط المواقع", icon: Link2 },
  { to: "/backups", label: "النسخ الاحتياطية", icon: Archive },
  { to: "/logs", label: "السجلات", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Server className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight">HN-DB</div>
          <div className="text-[11px] text-muted-foreground">مركز قواعد البيانات</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((it) => {
          const active =
            it.to === "/" ? pathname === "/" : pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <it.icon className="h-4 w-4 shrink-0" />
              <span>{it.label}</span>
              {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/60 p-3 text-xs text-muted-foreground leading-relaxed">
          متصل بـ <span className="text-primary font-semibold">TVCC</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[color:var(--success)] animate-pulse" />
            القناة آمنة
          </div>
        </div>
      </div>
    </aside>
  );
}
