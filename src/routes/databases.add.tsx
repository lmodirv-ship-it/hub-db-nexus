import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { storeActions, useStore } from "@/lib/store";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/databases/add")({
  head: () => ({ meta: [{ title: "إضافة قاعدة بيانات — HN-DB" }] }),
  component: AddDb,
});

function AddDb() {
  const navigate = useNavigate();
  const { websites } = useStore();
  const [form, setForm] = useState({
    name: "", type: "MySQL" as const, host: "", port: 3306,
    username: "", password: "", websiteId: "none", notes: "",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.host || !form.username || !form.password) {
      toast.error("يرجى تعبئة كل الحقول المطلوبة");
      return;
    }
    storeActions.addDatabase({
      name: form.name,
      type: form.type,
      host: form.host,
      port: Number(form.port),
      username: form.username,
      websiteId: form.websiteId === "none" ? null : form.websiteId,
      notes: form.notes,
    });
    toast.success("تمت إضافة القاعدة وتشفير كلمة المرور");
    navigate({ to: "/databases" });
  };

  return (
    <>
      <PageHeader title="إضافة قاعدة بيانات" subtitle="ستُحفظ بيانات الاتصال بشكل مشفر ولن تُعرض مرة أخرى" />
      <div className="flex-1 p-6">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 bg-card lg:col-span-2 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم القاعدة *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="my_database" />
              </div>
              <div className="space-y-2">
                <Label>النوع *</Label>
                <Select value={form.type} onValueChange={(v) => {
                  update("type", v);
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
                <p className="text-xs text-muted-foreground">تُشفّر فورًا ولن تكون قابلة للعرض بعد الحفظ.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>الموقع المرتبط</Label>
                <Select value={form.websiteId} onValueChange={(v) => update("websiteId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— بدون ربط —</SelectItem>
                    {websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} ({w.url})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>ملاحظات</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/databases" })}>إلغاء</Button>
              <Button type="submit">حفظ القاعدة</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card h-fit space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-semibold">معايير الأمان</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2.5 leading-relaxed">
              <li>• تُشفَّر كلمات المرور قبل التخزين.</li>
              <li>• لا تُعرض بيانات الاتصال الحساسة في الجداول.</li>
              <li>• يصدر HN-DB معرّف اتصال آمن (<code className="text-primary font-mono text-xs">HNDB_CONN_*</code>) لاستعماله من TVCC.</li>
              <li>• كل العمليات تُسجَّل في صفحة السجلات.</li>
              <li>• المواقع لا تتصل بالقاعدة مباشرة — تمر عبر HN-DB فقط.</li>
            </ul>
          </Card>
        </form>
      </div>
    </>
  );
}
