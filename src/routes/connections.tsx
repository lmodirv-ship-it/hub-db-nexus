import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { storeActions, useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Link2, Plug, Globe, Database as DbIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/connections")({
  head: () => ({ meta: [{ title: "ربط المواقع — HN-DB" }] }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const { databases, websites } = useStore();
  const [siteId, setSiteId] = useState<string>("");
  const [dbId, setDbId] = useState<string>("");

  const link = () => {
    if (!dbId || !siteId) { toast.error("اختر الموقع والقاعدة"); return; }
    storeActions.linkWebsite(dbId, siteId);
    toast.success("تم الربط بنجاح");
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
                {databases.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.type})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={link}>ربط</Button>
          </div>
        </Card>

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
                      <div className="text-xs text-muted-foreground">{d.type}</div>
                    </div>
                  </div>

                  <div className="text-muted-foreground">←</div>

                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="h-10 w-10 rounded-lg bg-accent/60 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-[color:var(--success)]" />
                    </div>
                    <div>
                      <div className="font-semibold">{site?.name ?? <span className="text-muted-foreground">غير مرتبط</span>}</div>
                      <div className="text-xs text-muted-foreground">{site?.url ?? "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {ok ? (
                      <><CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" /><span>متصل</span></>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-destructive" /><span>خلل</span></>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    آخر فحص: {formatDate(d.lastConnection)}
                  </div>

                  <div className="mr-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      const r = storeActions.testConnection(d.id);
                      r ? toast.success("الاتصال ناجح") : toast.error("فشل الاتصال");
                    }}>
                      <Plug className="h-4 w-4 ml-1" /> اختبار
                    </Button>
                    {site && (
                      <Button size="sm" variant="ghost" onClick={() => {
                        storeActions.linkWebsite(d.id, null);
                        toast.success("تم فصل الربط");
                      }}>فصل</Button>
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
