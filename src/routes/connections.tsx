import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Link2, Plug, Globe, Database as DbIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/connections")({
  head: () => ({ meta: [{ title: "ربط المواقع — HN-DB" }] }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const qc = useQueryClient();
  const dbs = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const databases = dbs.data ?? [];
  const websites = ws.data ?? [];

  const [siteId, setSiteId] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["databases"] });
    qc.invalidateQueries({ queryKey: ["logs"] });
  };

  const linkMut = useMutation({
    mutationFn: ({ dbId, siteId }: { dbId: string; siteId: string | null }) => api.linkWebsite(dbId, siteId),
    onSuccess: () => { invalidate(); toast.success("تم الحفظ"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });
  const testMut = useMutation({
    mutationFn: api.testConnection,
    onSuccess: (ok) => { invalidate(); ok ? toast.success("الاتصال ناجح") : toast.error("فشل الاتصال"); },
  });

  const link = () => {
    if (!dbId || !siteId) { toast.error("اختر الموقع والقاعدة"); return; }
    linkMut.mutate({ dbId, siteId });
  };

  return (
    <>
      <PageHeader title="ربط المواقع" subtitle="اربط مواقع TVCC بقواعد البيانات الخاصة بها" />
      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6 bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" />ربط جديد</h3>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger><SelectValue placeholder="اختر الموقع" /></SelectTrigger>
              <SelectContent>
                {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={dbId} onValueChange={setDbId}>
              <SelectTrigger><SelectValue placeholder="اختر القاعدة" /></SelectTrigger>
              <SelectContent>
                {databases.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.engine})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={link} disabled={linkMut.isPending}>ربط</Button>
          </div>
          {(websites.length === 0 || databases.length === 0) && (
            <p className="mt-3 text-xs text-muted-foreground">تحتاج لإنشاء موقع وقاعدة بيانات أولًا.</p>
          )}
        </Card>

        {dbs.isLoading && <div className="text-center p-10"><Loader2 className="h-6 w-6 animate-spin inline" /></div>}

        {!dbs.isLoading && databases.length === 0 && (
          <Card className="p-10 text-center bg-card text-muted-foreground">لا توجد قواعد بيانات لعرضها.</Card>
        )}

        <div className="grid gap-4">
          {databases.map((d) => {
            const site = websites.find((w) => w.id === d.websiteId);
            const ok = d.status === "Active";
            return (
              <Card key={d.id} className="p-5 bg-card">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <div className="h-10 w-10 rounded-lg bg-accent/60 flex items-center justify-center">
                      <DbIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.engine}</div>
                    </div>
                  </div>

                  <div className="text-muted-foreground">←</div>

                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="h-10 w-10 rounded-lg bg-accent/60 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-[color:var(--success)]" />
                    </div>
                    <div>
                      <div className="font-semibold">{site?.name ?? <span className="text-muted-foreground">غير مرتبط</span>}</div>
                      <div className="text-xs text-muted-foreground">{site?.domain ?? "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {ok ? (
                      <><CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" /><span>متصل</span></>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-destructive" /><span>تنبيه</span></>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    آخر فحص: {formatDate(d.lastConnection)}
                  </div>

                  <div className="mr-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => testMut.mutate(d.id)}>
                      <Plug className="h-4 w-4 ml-1" /> اختبار
                    </Button>
                    {site && (
                      <Button size="sm" variant="ghost" onClick={() => linkMut.mutate({ dbId: d.id, siteId: null })}>فصل</Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <span>معرّف الاتصال الآمن:</span>
                  <code className="font-mono text-primary bg-accent/50 px-2 py-1 rounded">{d.connectionId}</code>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
