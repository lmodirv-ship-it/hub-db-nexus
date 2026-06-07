import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, downloadFile } from "@/lib/api";
import { formatDate, formatSize, dbTypeColor } from "@/lib/format";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Plug, Archive, Trash2, Plus, Search, Database as DbIcon, Loader2,
  Download, Upload, MoreVertical, CalendarClock,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRef } from "react";

export const Route = createFileRoute("/databases/")({
  head: () => ({ meta: [{ title: "قواعد البيانات — HN-DB" }] }),
  component: DatabasesPage,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    Error: "bg-destructive/15 text-destructive border-destructive/30",
    Offline: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
  };
  const labels: Record<string, string> = { Active: "نشطة", Error: "خطأ", Offline: "متوقفة" };
  return (
    <Badge variant="outline" className={`${map[status]} font-medium`}>
      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </Badge>
  );
}

function DatabasesPage() {
  const qc = useQueryClient();
  const dbs = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["databases"] });
    qc.invalidateQueries({ queryKey: ["logs"] });
  };

  const delMut = useMutation({
    mutationFn: api.deleteDatabase,
    onSuccess: () => { invalidate(); toast.success("تم الحذف"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحذف"),
  });
  const testMut = useMutation({
    mutationFn: api.testConnection,
    onSuccess: (ok) => { invalidate(); ok ? toast.success("الاتصال ناجح") : toast.error("فشل الاتصال"); },
  });
  const backupMut = useMutation({
    mutationFn: (id: string) => api.createBackup(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["backups"] }); invalidate(); toast.success("تم إنشاء نسخة احتياطية"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });

  const databases = dbs.data ?? [];
  const websites = ws.data ?? [];

  const filtered = useMemo(
    () => databases.filter((d) =>
      (type === "all" || d.engine === type) &&
      (status === "all" || d.status === status) &&
      (q === "" || d.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [databases, q, type, status]
  );

  return (
    <>
      <PageHeader
        title="قواعد البيانات"
        subtitle={`${databases.length} قاعدة بيانات مسجلة`}
        actions={
          <Button asChild>
            <Link to="/databases/add"><Plus className="h-4 w-4 ml-1" />إضافة قاعدة</Link>
          </Button>
        }
      />
      <div className="flex-1 p-6 space-y-4">
        <Card className="p-4 bg-card">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث باسم القاعدة..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-9" />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="MySQL">MySQL</SelectItem>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="Active">نشطة</SelectItem>
                <SelectItem value="Error">خطأ</SelectItem>
                <SelectItem value="Offline">متوقفة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">القاعدة</th>
                  <th className="text-right p-3 font-medium">الموقع</th>
                  <th className="text-right p-3 font-medium">النوع</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">الحجم</th>
                  <th className="text-right p-3 font-medium">آخر اتصال</th>
                  <th className="text-right p-3 font-medium">آخر نسخة</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {dbs.isLoading && (
                  <tr><td colSpan={8} className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!dbs.isLoading && filtered.map((d) => {
                  const site = websites.find((w) => w.id === d.websiteId);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-md bg-accent/60 flex items-center justify-center">
                            <DbIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{d.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{d.connectionId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {site ? <span className="text-foreground">{site.name}</span> : <span className="text-muted-foreground">— غير مرتبطة</span>}
                      </td>
                      <td className={`p-3 font-semibold ${dbTypeColor[d.engine]}`}>{d.engine}</td>
                      <td className="p-3"><StatusBadge status={d.status} /></td>
                      <td className="p-3 font-mono text-xs">{formatSize(d.sizeMb)}</td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDate(d.lastConnection)}</td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDate(d.lastBackup)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" title="اختبار الاتصال" onClick={() => testMut.mutate(d.id)}>
                            <Plug className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="نسخة احتياطية" onClick={() => backupMut.mutate(d.id)}>
                            <Archive className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" title="حذف">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف القاعدة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف <b>{d.name}</b> وكل نسخها الاحتياطية نهائيًا.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => delMut.mutate(d.id)}
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!dbs.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">
                    {databases.length === 0 ? "لم تقم بإنشاء أي قاعدة بعد. ابدأ بإضافة واحدة." : "لا توجد نتائج"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
