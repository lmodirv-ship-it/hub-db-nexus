import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { formatDate, formatSize } from "@/lib/format";
import { toast } from "sonner";
import { RotateCcw, Archive, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/backups")({
  head: () => ({ meta: [{ title: "النسخ الاحتياطية — HN-DB" }] }),
  component: BackupsPage,
});

const statusTone: Record<string, string> = {
  Completed: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Failed: "bg-destructive/15 text-destructive border-destructive/30",
  Running: "bg-primary/15 text-primary border-primary/30",
};
const statusLabel: Record<string, string> = { Completed: "مكتملة", Failed: "فاشلة", Running: "قيد التنفيذ" };

function BackupsPage() {
  const qc = useQueryClient();
  const bs = useQuery({ queryKey: ["backups"], queryFn: api.listBackups });
  const dbs = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const backups = bs.data ?? [];
  const databases = dbs.data ?? [];

  const restoreMut = useMutation({
    mutationFn: api.restoreBackup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["logs"] }); toast.success("تمت الاستعادة"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });
  const delMut = useMutation({
    mutationFn: api.deleteBackup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["backups"] }); qc.invalidateQueries({ queryKey: ["logs"] }); toast.success("تم الحذف"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });

  return (
    <>
      <PageHeader title="النسخ الاحتياطية" subtitle={`${backups.length} نسخة محفوظة في HN-DB`} />
      <div className="flex-1 p-6">
        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">القاعدة</th>
                  <th className="text-right p-3 font-medium">النوع</th>
                  <th className="text-right p-3 font-medium">التاريخ</th>
                  <th className="text-right p-3 font-medium">الحجم</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bs.isLoading && (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!bs.isLoading && backups.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">لا توجد نسخ احتياطية بعد. أنشئ نسخة من صفحة قواعد البيانات.</td></tr>
                )}
                {backups.map((b) => {
                  const db = databases.find((d) => d.id === b.databaseId);
                  return (
                    <tr key={b.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{db?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="p-3">{b.type === "Full" ? "كاملة" : "تزايدية"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{formatDate(b.createdAt)}</td>
                      <td className="p-3 font-mono text-xs">{formatSize(b.sizeMb)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={statusTone[b.status]}>{statusLabel[b.status]}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" disabled={b.status !== "Completed"}>
                                <RotateCcw className="h-4 w-4 ml-1" /> استعادة
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الاستعادة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم استعادة قاعدة <b>{db?.name}</b>. لا يمكن التراجع.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => restoreMut.mutate(b.id)}>تأكيد</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 ml-1" /> حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف النسخة</AlertDialogTitle>
                                <AlertDialogDescription>سيتم حذف هذه النسخة الاحتياطية نهائيًا.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => delMut.mutate(b.id)}
                                >حذف</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
