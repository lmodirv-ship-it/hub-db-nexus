import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Globe, Plus, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: 'المواقع — HN-DB' },
      { name: "description", content: 'إدارة جميع المواقع التي يديرها HN-DB ومتابعة قواعد بياناتها وتطبيقاتها.' },
      { property: "og:title", content: 'المواقع — HN-DB' },
      { property: "og:description", content: 'إدارة جميع المواقع التي يديرها HN-DB ومتابعة قواعد بياناتها وتطبيقاتها.' },
      { property: "og:url", content: 'https://hub-db-nexus.lovable.app/websites' },
      { name: "twitter:title", content: 'المواقع — HN-DB' },
      { name: "twitter:description", content: 'إدارة جميع المواقع التي يديرها HN-DB ومتابعة قواعد بياناتها وتطبيقاتها.' },
    ],
    links: [{ rel: "canonical", href: 'https://hub-db-nexus.lovable.app/websites' }],
  }),
  component: WebsitesPage,
});

function WebsitesPage() {
  const qc = useQueryClient();
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const dbs = useQuery({ queryKey: ["databases"], queryFn: api.listDatabases });
  const websites = ws.data ?? [];
  const databases = dbs.data ?? [];

  const [form, setForm] = useState({ name: "", domain: "" });
  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: () => api.createWebsite({ name: form.name.trim(), domain: form.domain.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["websites"] });
      qc.invalidateQueries({ queryKey: ["logs"] });
      setForm({ name: "", domain: "" });
      toast.success("تمت إضافة الموقع");
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحفظ"),
  });
  const delMut = useMutation({
    mutationFn: api.deleteWebsite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["websites"] });
      qc.invalidateQueries({ queryKey: ["databases"] });
      qc.invalidateQueries({ queryKey: ["logs"] });
      toast.success("تم الحذف");
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.domain) { toast.error("الاسم والنطاق مطلوبان"); return; }
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.domain)) { toast.error("نطاق غير صالح"); return; }
    addMut.mutate();
  };

  return (
    <>
      <PageHeader title="المواقع" subtitle={`${websites.length} موقع مُسجَّل في HN-DB`} />
      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6 bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />إضافة موقع جديد</h3>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label className="text-xs">اسم الموقع *</Label>
              <Input value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="متجر النور" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">النطاق *</Label>
              <Input dir="ltr" value={form.domain} onChange={(e) => upd("domain", e.target.value)} placeholder="example.com" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={addMut.isPending}>إضافة</Button>
            </div>
          </form>
        </Card>

        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">الموقع</th>
                  <th className="text-right p-3 font-medium">النطاق</th>
                  <th className="text-right p-3 font-medium">قواعد مرتبطة</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">تاريخ الإنشاء</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {ws.isLoading && (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!ws.isLoading && websites.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">لا توجد مواقع بعد. أضف موقعك الأول من النموذج أعلاه.</td></tr>
                )}
                {websites.map((w) => {
                  const count = databases.filter((d) => d.websiteId === w.id).length;
                  return (
                    <tr key={w.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-accent/60 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-[color:var(--success)]" />
                          </div>
                          <span className="font-semibold">{w.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs" dir="ltr">{w.domain}</td>
                      <td className="p-3">{count}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30">
                          {w.status === "Active" ? "نشط" : w.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{formatDate(w.createdAt)}</td>
                      <td className="p-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الموقع</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف <b>{w.name}</b>. الروابط بقواعد البيانات ستُلغى.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => delMut.mutate(w.id)}
                              >حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
