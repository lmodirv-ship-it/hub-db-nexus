import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type Alert } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check, CheckCheck, Loader2, Trash2, AlertTriangle, Info, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "التنبيهات — HN-DB" }] }),
  component: AlertsPage,
});

const sevTone: Record<Alert["severity"], string> = {
  info: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
};
const sevLabel: Record<Alert["severity"], string> = { info: "معلومة", warning: "تحذير", critical: "حرج" };
const sevIcon: Record<Alert["severity"], typeof Info> = { info: Info, warning: AlertCircle, critical: AlertTriangle };

function AlertsPage() {
  const qc = useQueryClient();
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: api.listAlerts });
  const data = alerts.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["alerts"] });
    qc.invalidateQueries({ queryKey: ["alerts-unread"] });
  };
  const readMut = useMutation({ mutationFn: api.markAlertRead, onSuccess: invalidate });
  const readAllMut = useMutation({ mutationFn: api.markAllAlertsRead, onSuccess: () => { invalidate(); toast.success("تم تعليم الكل كمقروء"); } });
  const delMut = useMutation({ mutationFn: api.deleteAlert, onSuccess: invalidate });

  const unread = data.filter((a) => !a.read).length;

  return (
    <>
      <PageHeader
        title="التنبيهات"
        subtitle={`${unread} غير مقروءة من ${data.length}`}
        actions={
          <Button onClick={() => readAllMut.mutate()} disabled={unread === 0 || readAllMut.isPending} variant="outline">
            <CheckCheck className="h-4 w-4 ml-1" /> تعليم الكل كمقروء
          </Button>
        }
      />
      <div className="flex-1 p-6">
        {alerts.isLoading && <div className="text-center p-10"><Loader2 className="h-6 w-6 animate-spin inline" /></div>}
        {!alerts.isLoading && data.length === 0 && (
          <Card className="p-16 text-center bg-card">
            <BellRing className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="font-semibold">لا توجد تنبيهات</div>
            <div className="text-sm text-muted-foreground mt-1">كل شيء يعمل بشكل طبيعي.</div>
          </Card>
        )}
        <div className="space-y-2">
          {data.map((a) => {
            const Icon = sevIcon[a.severity];
            return (
              <Card key={a.id} className={`p-4 bg-card flex items-start gap-3 ${!a.read ? "border-r-2 border-r-primary" : ""}`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${sevTone[a.severity]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={sevTone[a.severity]}>{sevLabel[a.severity]}</Badge>
                    <span className="text-xs text-muted-foreground">{a.type}</span>
                    {!a.read && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">جديد</span>}
                  </div>
                  <div className="mt-1 text-sm">{a.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatDate(a.createdAt)}</div>
                </div>
                <div className="flex gap-1">
                  {!a.read && (
                    <Button size="icon" variant="ghost" onClick={() => readMut.mutate(a.id)} title="تعليم كمقروء">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => delMut.mutate(a.id)} title="حذف">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
