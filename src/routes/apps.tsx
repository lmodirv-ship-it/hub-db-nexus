import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, type AppRelease } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Smartphone, Upload, Trash2, Loader2, Download, Package, FileArchive } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: 'APK Manager — HN-DB' },
      { name: "description", content: 'إدارة إصدارات تطبيقات الأندرويد APK و AAB المرتبطة بمواقعك من مكان واحد.' },
      { property: "og:title", content: 'APK Manager — HN-DB' },
      { property: "og:description", content: 'إدارة إصدارات تطبيقات الأندرويد APK و AAB المرتبطة بمواقعك من مكان واحد.' },
      { property: "og:url", content: 'https://hub-db-nexus.lovable.app/apps' },
      { name: "twitter:title", content: 'APK Manager — HN-DB' },
      { name: "twitter:description", content: 'إدارة إصدارات تطبيقات الأندرويد APK و AAB المرتبطة بمواقعك من مكان واحد.' },
    ],
    links: [{ rel: "canonical", href: 'https://hub-db-nexus.lovable.app/apps' }],
  }),
  component: AppsPage,
});

const fmtSize = (b: number) => {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

function AppsPage() {
  const qc = useQueryClient();
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const websites = ws.data ?? [];

  const [websiteId, setWebsiteId] = useState<string>("");
  const releases = useQuery({
    queryKey: ["releases", websiteId || "all"],
    queryFn: () => api.listReleases(websiteId || undefined),
  });
  const items = releases.data ?? [];

  const [form, setForm] = useState({
    versionName: "",
    versionCode: 1,
    fileType: "apk" as "apk" | "aab",
    notes: "",
    file: null as File | null,
  });
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const uploadMut = useMutation({
    mutationFn: async () => {
      if (!websiteId) throw new Error("اختر موقعاً");
      if (!form.file) throw new Error("اختر ملف APK/AAB");
      if (!form.versionName.trim()) throw new Error("اسم الإصدار مطلوب");
      return api.uploadRelease({
        websiteId,
        file: form.file,
        fileType: form.fileType,
        versionName: form.versionName.trim(),
        versionCode: Number(form.versionCode) || 1,
        notes: form.notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["releases"] });
      qc.invalidateQueries({ queryKey: ["logs"] });
      setForm({ versionName: "", versionCode: form.versionCode + 1, fileType: "apk", notes: "", file: null });
      toast.success("تم رفع الإصدار");
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل الرفع"),
  });

  const delMut = useMutation({
    mutationFn: api.deleteRelease,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["releases"] });
      toast.success("تم الحذف");
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });

  const download = async (r: AppRelease) => {
    if (!r.filePath) return;
    try {
      const url = await api.getReleaseDownloadUrl(r.filePath);
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر إنشاء الرابط");
    }
  };

  const latestByType = useMemo(() => {
    const by: Record<string, AppRelease> = {};
    for (const r of items) {
      if (!by[r.fileType] || r.versionCode > by[r.fileType].versionCode) by[r.fileType] = r;
    }
    return by;
  }, [items]);

  const websiteName = (id: string) => websites.find((w) => w.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader title="APK Manager" subtitle="رفع وإدارة إصدارات تطبيقات Android لكل موقع" />
      <div className="flex-1 p-6 space-y-6">
        {/* Upload card */}
        <Card className="p-6 bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            رفع إصدار جديد
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">الموقع *</Label>
              <Select value={websiteId} onValueChange={setWebsiteId}>
                <SelectTrigger><SelectValue placeholder="اختر موقعاً" /></SelectTrigger>
                <SelectContent>
                  {websites.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">أضف موقعاً أولاً من صفحة المواقع</div>
                  )}
                  {websites.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name} ({w.domain})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">نوع الملف</Label>
              <Select value={form.fileType} onValueChange={(v) => upd("fileType", v as "apk" | "aab")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apk">APK</SelectItem>
                  <SelectItem value="aab">AAB (App Bundle)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">اسم الإصدار (Version Name) *</Label>
              <Input dir="ltr" value={form.versionName} onChange={(e) => upd("versionName", e.target.value)} placeholder="1.0.0" maxLength={20} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">رقم الإصدار (Version Code) *</Label>
              <Input dir="ltr" type="number" min={1} value={form.versionCode} onChange={(e) => upd("versionCode", Number(e.target.value))} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">ملف {form.fileType.toUpperCase()} *</Label>
              <Input
                type="file"
                accept={form.fileType === "apk" ? ".apk,application/vnd.android.package-archive" : ".aab"}
                onChange={(e) => upd("file", e.target.files?.[0] ?? null)}
              />
              {form.file && (
                <p className="text-xs text-muted-foreground">{form.file.name} — {fmtSize(form.file.size)}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">ملاحظات الإصدار</Label>
              <Textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="ميزات جديدة، إصلاحات، ..." maxLength={1000} rows={3} />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => uploadMut.mutate()} disabled={uploadMut.isPending}>
              {uploadMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جارٍ الرفع...</> : <>حفظ ورفع</>}
            </Button>
          </div>
        </Card>

        {/* Latest snapshot */}
        {websiteId && (
          <div className="grid gap-4 md:grid-cols-2">
            {(["apk", "aab"] as const).map((t) => {
              const r = latestByType[t];
              return (
                <Card key={t} className="p-5 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/60 flex items-center justify-center">
                        {t === "apk" ? <Package className="h-5 w-5 text-primary" /> : <FileArchive className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">آخر إصدار {t.toUpperCase()}</div>
                        <div className="font-semibold">{r ? `v${r.versionName} (${r.versionCode})` : "لا يوجد"}</div>
                      </div>
                    </div>
                    {r && (
                      <Button size="sm" variant="outline" onClick={() => download(r)}>
                        <Download className="h-4 w-4 ml-1" />تحميل
                      </Button>
                    )}
                  </div>
                  {r && (
                    <div className="mt-3 text-xs text-muted-foreground flex gap-4">
                      <span>{fmtSize(r.fileSizeBytes)}</span>
                      <span>{formatDate(r.releasedAt)}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Releases history */}
        <Card className="bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" />سجل الإصدارات</h3>
            <Select value={websiteId || "__all"} onValueChange={(v) => setWebsiteId(v === "__all" ? "" : v)}>
              <SelectTrigger className="w-56"><SelectValue placeholder="تصفية حسب الموقع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">كل المواقع</SelectItem>
                {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">الموقع</th>
                  <th className="text-right p-3 font-medium">النوع</th>
                  <th className="text-right p-3 font-medium">الإصدار</th>
                  <th className="text-right p-3 font-medium">Code</th>
                  <th className="text-right p-3 font-medium">الحجم</th>
                  <th className="text-right p-3 font-medium">تاريخ النشر</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {releases.isLoading && (
                  <tr><td colSpan={8} className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!releases.isLoading && items.length === 0 && (
                  <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">لا توجد إصدارات بعد.</td></tr>
                )}
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-accent/30">
                    <td className="p-3">{websiteName(r.websiteId)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="uppercase">{r.fileType}</Badge>
                    </td>
                    <td className="p-3 font-mono" dir="ltr">v{r.versionName}</td>
                    <td className="p-3 font-mono text-xs" dir="ltr">{r.versionCode}</td>
                    <td className="p-3 text-xs">{fmtSize(r.fileSizeBytes)}</td>
                    <td className="p-3 text-muted-foreground text-xs">{formatDate(r.releasedAt)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30">
                        {r.status === "Published" ? "منشور" : r.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => download(r)} disabled={!r.filePath}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الإصدار</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف الإصدار <b>v{r.versionName}</b> والملف المرتبط نهائياً.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => delMut.mutate(r.id)}
                              >حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
