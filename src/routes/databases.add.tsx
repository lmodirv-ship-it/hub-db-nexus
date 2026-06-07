import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api, type DbEngine } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/databases/add")({
  head: () => ({ meta: [{ title: "إضافة قاعدة بيانات — HN-DB" }] }),
  component: AddDb,
});

function AddDb() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const ws = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const websites = ws.data ?? [];

  const [form, setForm] = useState({
    name: "", engine: "MySQL" as DbEngine, host: "", port: 3306,
    username: "", password: "", websiteId: "none",
  });
  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => api.createDatabase({
      name: form.name.trim(),
      engine: form.engine,
      host: form.host.trim(),
      port: Number(form.port),
      username: form.username.trim(),
      websiteId: form.websiteId === "none" ? null : form.websiteId,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["databases"] });
      qc.invalidateQueries({ queryKey: ["logs"] });
      toast.success("تمت إضافة القاعدة بنجاح");
      navigate({ to: "/databases" });
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحفظ"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.host || !form.username || !form.password) {
      toast.error("يرجى تعبئة كل الحقول المطلوبة");
      return;
    }
    if (form.password.length < 6) { toast.error("كلمة المرور 6 أحرف على الأقل"); return; }
    if (Number(form.port) < 1 || Number(form.port) > 65535) { toast.error("منفذ غير صالح"); return; }
    mut.mutate();
  };

  return (
    <>
      <PageHeader title="إضافة قاعدة بيانات" subtitle="بيانات الاتصال محمية ولا تظهر للمواقع المستهلكة" />
      <div className="flex-1 p-6">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 bg-card lg:col-span-2 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم القاعدة *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="my_database" maxLength={64} />
              </div>
              <div className="space-y-2">
                <Label>النوع *</Label>
                <Select value={form.engine} onValueChange={(v) => {
                  update("engine", v);
                  update("port", v === "PostgreSQL" ? 5432 : v === "MongoDB" ? 27017 : 3306);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MySQL">MySQL</SelectItem>
                    <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>المضيف (Host) *</Label>
                <Input value={form.host} onChange={(e) => update("host", e.target.value)} placeholder="db.hn-db.internal" />
              </div>
              <div className="space-y-2">
                <Label>المنفذ (Port)</Label>
                <Input type="number" value={form.port} onChange={(e) => update("port", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>اسم المستخدم *</Label>
                <Input value={form.username} onChange={(e) => update("username", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  كلمة المرور * <Lock className="h-3.5 w-3.5 text-primary" />
                </Label>
                <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
                <p className="text-xs text-muted-foreground">تُحفظ في خزينة مشفّرة ولا تُعرض في الجداول.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>الموقع المرتبط</Label>
                <Select value={form.websiteId} onValueChange={(v) => update("websiteId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— بدون ربط —</SelectItem>
                    {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} ({w.domain})</SelectItem>)}
                  </SelectContent>
                </Select>
                {websites.length === 0 && (
                  <p className="text-xs text-muted-foreground">لا توجد مواقع بعد. يمكنك إضافة من صفحة المواقع.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/databases" })}>إلغاء</Button>
              <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "جارٍ الحفظ..." : "حفظ القاعدة"}</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card h-fit space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-semibold">معايير الأمان</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2.5 leading-relaxed">
              <li>• كلمات المرور محفوظة بشكل آمن.</li>
              <li>• لا تُعرض بيانات الاتصال الحساسة في الجداول.</li>
              <li>• يصدر HN-DB معرّف اتصال (<code className="text-primary font-mono text-xs">HNDB_CONN_*</code>) ليستهلكه TVCC.</li>
              <li>• كل العمليات تُسجَّل في صفحة السجلات.</li>
              <li>• المواقع لا تتصل بالقاعدة مباشرة — تمر عبر HN-DB فقط.</li>
            </ul>
          </Card>
        </form>
      </div>
    </>
  );
}
