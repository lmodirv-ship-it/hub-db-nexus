import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Database, PlusCircle, Link2, Archive, ScrollText,
  Globe, Smartphone, Activity, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BrandLogo } from "@/components/brand-logo";

const items = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/health", label: "مراقب الحالة", icon: Activity },
  { to: "/alerts", label: "التنبيهات", icon: Bell, badge: true as const },
  { to: "/databases", label: "قواعد البيانات", icon: Database },
  { to: "/databases/add", label: "إضافة قاعدة", icon: PlusCircle },
  { to: "/websites", label: "المواقع", icon: Globe },
  { to: "/apps", label: "APK Manager", icon: Smartphone },
  { to: "/connections", label: "ربط المواقع", icon: Link2 },
  { to: "/backups", label: "النسخ الاحتياطية", icon: Archive },
  { to: "/logs", label: "السجلات", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useQuery({
    queryKey: ["alerts-unread"],
    queryFn: api.unreadAlertCount,
    refetchInterval: 30_000,
  });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <BrandLogo size={40} subtitle="مركز قواعد البيانات" />
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((it) => {
          const active =
            it.to === "/" ? pathname === "/" : pathname === it.to || pathname.startsWith(it.to + "/");
          const count = it.badge ? (unread.data ?? 0) : 0;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-[inset_3px_0_0_0_var(--primary),0_0_24px_-10px_var(--primary)]"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <it.icon className={cn("h-4 w-4 shrink-0", active && "text-[color:var(--primary-glow)]")} />
              <span>{it.label}</span>
              {count > 0 && (
                <span className="mr-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold shadow-[0_0_12px_-2px_var(--destructive)]">
                  {count}
                </span>
              )}
              {active && count === 0 && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary" />}
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
