import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate, formatSize } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import {
  Database, CheckCircle2, AlertTriangle, PowerOff,
  Link2, Unlink, HardDrive, Archive,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: 'لوحة التحكم — HN-DB' },
      { name: "description", content: 'لوحة تحكم HN-DB لإدارة جميع قواعد بياناتك ومواقعك من واجهة واحدة آمنة.' },
      { property: "og:title", content: 'لوحة التحكم — HN-DB' },
      { property: "og:description", content: 'لوحة تحكم HN-DB لإدارة جميع قواعد بياناتك ومواقعك.' },
      { property: "og:url", content: 'https://hub-db-nexus.lovable.app/dashboard' },
      { name: "twitter:title", content: 'لوحة التحكم — HN-DB' },
      { name: "twitter:description", content: 'لوحة تحكم HN-DB لإدارة جميع قواعد بياناتك ومواقعك.' },
    ],
    links: [{ rel: "canonical", href: 'https://hub-db-nexus.lovable.app/dashboard' }],
  }),
  component: Dashboard,
});

function StatCard({ label, value, icon: Icon, tone = "default", hint }: {
  label: string; value: string | number; icon: any;
  tone?: "default" | "success" | "warning" | "destructive" | "primary"; hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    success: "text-[color:var(--success)]",
    warning: "text-[color:var(--warning)]",
    destructive: "text-destructive",
    primary: "text-primary",
  };
  return (
    <Card className="p-5 bg-card border-border hover:border-primary/50 hover:shadow-[0_0_24px_-10px_var(--primary)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className={`mt-2 text-3xl font-bold tabular-nums ${tones[tone]}`}>{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg bg-accent/40 ring-1 ring-border flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const databases = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const websites = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const backups = useQuery({ queryKey: ["backups"], queryFn: api.listBackups });
  const logs = useQuery({ queryKey: ["logs"], queryFn: () => api.listLogs(20) });

  const dbs = databases.data ?? [];
  const ws = websites.data ?? [];
  const bs = backups.data ?? [];
  const ls = logs.data ?? [];

  const active = dbs.filter((d) => d.status === "Active").length;
  const errors = dbs.filter((d) => d.status === "Error").length;
  const offline = dbs.filter((d) => d.status === "Offline").length;
  const linked = dbs.filter((d) => d.websiteId).length;
  const unlinked = dbs.length - linked;
  const totalSize = dbs.reduce((a, b) => a + b.sizeMb, 0);
  const recentBackups = bs.slice(0, 5);
  const recentErrors = ls.filter((l) => l.result === "Failed").slice(0, 5);

  return (
    <>
      <PageHeader title="لوحة التحكم" subtitle="نظرة شاملة على قواعد البيانات الموصولة بـ TVCC" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي القواعد" value={dbs.length} icon={Database} tone="primary" />
          <StatCard label="نشطة" value={active} icon={CheckCircle2} tone="success" />
          <StatCard label="بها أخطاء" value={errors} icon={AlertTriangle} tone="destructive" />
          <StatCard label="متوقفة" value={offline} icon={PowerOff} tone="warning" />
          <StatCard label="مرتبطة بمواقع" value={linked} icon={Link2} tone="success" hint={`${ws.length} موقع متاح`} />
          <StatCard label="غير مرتبطة" value={unlinked} icon={Unlink} tone="warning" />
          <StatCard label="الحجم الإجمالي" value={formatSize(totalSize)} icon={HardDrive} />
          <StatCard label="نسخ احتياطية" value={bs.length} icon={Archive} tone="primary" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">آخر النسخ الاحتياطية</h2>
              <Link to="/backups" className="text-xs text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-3">
              {recentBackups.length === 0 && (
                <div className="text-sm text-muted-foreground py-6 text-center">لا توجد نسخ احتياطية بعد</div>
              )}
              {recentBackups.map((b) => {
                const db = dbs.find((d) => d.id === b.databaseId);
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{db?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{b.type} · {formatSize(b.sizeMb)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">آخر الأخطاء</h2>
              <Link to="/logs" className="text-xs text-primary hover:underline">عرض السجل</Link>
            </div>
            <div className="space-y-3">
              {recentErrors.length === 0 && (
                <div className="text-sm text-muted-foreground py-6 text-center">لا توجد أخطاء حديثة</div>
              )}
              {recentErrors.map((l) => {
                const db = dbs.find((d) => d.id === l.databaseId);
                return (
                  <div key={l.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{l.action}</div>
                      <div className="text-xs text-muted-foreground">{db?.name ?? "—"}</div>
                    </div>
                    <div className="text-xs text-destructive">{formatDate(l.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
