import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type DbStatus } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Loader2, RefreshCw, Database as DbIcon, AlertTriangle, CheckCircle2, Clock, WifiOff } from "lucide-react";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: 'حالة القواعد — HN-DB' },
      { name: "description", content: 'فحص حالة الاتصال والأداء لجميع قواعد بياناتك في الوقت الحقيقي.' },
      { property: "og:title", content: 'حالة القواعد — HN-DB' },
      { property: "og:description", content: 'فحص حالة الاتصال والأداء لجميع قواعد بياناتك في الوقت الحقيقي.' },
      { property: "og:url", content: 'https://hub-db-nexus.lovable.app/health' },
      { name: "twitter:title", content: 'حالة القواعد — HN-DB' },
      { name: "twitter:description", content: 'فحص حالة الاتصال والأداء لجميع قواعد بياناتك في الوقت الحقيقي.' },
    ],
    links: [{ rel: "canonical", href: 'https://hub-db-nexus.lovable.app/health' }],
  }),
  component: HealthPage,
});

const tone: Record<DbStatus, string> = {
  Active: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Slow: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
  Error: "bg-destructive/15 text-destructive border-destructive/30",
  Offline: "bg-muted text-muted-foreground border-border",
};
const label: Record<DbStatus, string> = { Active: "متصلة", Slow: "بطيئة", Error: "خطأ", Offline: "متوقفة" };
const icon: Record<DbStatus, typeof CheckCircle2> = {
  Active: CheckCircle2, Slow: Clock, Error: AlertTriangle, Offline: WifiOff,
};

function HealthPage() {
  const qc = useQueryClient();
  const dbs = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const databases = dbs.data ?? [];
  const websites = ws.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["databases"] });
    qc.invalidateQueries({ queryKey: ["alerts"] });
  };

  const oneMut = useMutation({
    mutationFn: api.checkHealth,
    onSuccess: () => invalidate(),
  });
  const allMut = useMutation({
    mutationFn: () => api.checkAllHealth(databases.map((d) => d.id)),
    onSuccess: () => { invalidate(); toast.success("اكتمل فحص جميع القواعد"); },
  });

  const counts = databases.reduce(
    (a, d) => { a[d.status as DbStatus] = (a[d.status as DbStatus] ?? 0) + 1; return a; },
    {} as Record<DbStatus, number>
  );

  return (
    <>
      <PageHeader
        title="مراقب الحالة"
        subtitle={`${databases.length} قاعدة — فحص دوري لحالة الاتصال والأداء`}
        actions={
          <Button onClick={() => allMut.mutate()} disabled={allMut.isPending || databases.length === 0}>
            {allMut.isPending ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <RefreshCw className="h-4 w-4 ml-1" />}
            فحص الكل
          </Button>
        }
      />
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["Active", "Slow", "Error", "Offline"] as DbStatus[]).map((s) => {
            const Icon = icon[s];
            return (
              <Card key={s} className="p-4 bg-card flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone[s]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{counts[s] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">{label[s]}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">القاعدة</th>
                  <th className="text-right p-3 font-medium">الموقع</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">زمن الاستجابة</th>
                  <th className="text-right p-3 font-medium">السبب</th>
                  <th className="text-right p-3 font-medium">آخر فحص</th>
                  <th className="text-right p-3 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {dbs.isLoading && (
                  <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!dbs.isLoading && databases.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">لا توجد قواعد بيانات بعد.</td></tr>
                )}
                {databases.map((d) => {
                  const site = websites.find((w) => w.id === d.websiteId);
                  const Icon = icon[d.status as DbStatus] ?? Activity;
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <DbIcon className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-semibold">{d.name}</div>
                            <div className="text-xs text-muted-foreground">{d.engine}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{site?.name ?? "—"}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={tone[d.status as DbStatus]}>
                          <Icon className="h-3 w-3 ml-1" /> {label[d.status as DbStatus] ?? d.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-xs">{d.lastCheckMs != null ? `${d.lastCheckMs} ms` : "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[240px] truncate">{d.lastError ?? "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDate(d.lastConnection)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => oneMut.mutate(d.id)} disabled={oneMut.isPending}>
                          <RefreshCw className="h-3.5 w-3.5 ml-1" /> فحص
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
