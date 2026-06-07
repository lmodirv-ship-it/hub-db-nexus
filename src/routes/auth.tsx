import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Server, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — HN-DB" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("البريد وكلمة المرور مطلوبان"); return; }
    if (form.password.length < 6) { toast.error("كلمة المرور 6 أحرف على الأقل"); return; }
    setBusy(true);
    try {
      if (tab === "signin") {
        await signIn(form.email, form.password);
        toast.success("تم تسجيل الدخول");
        navigate({ to: "/" });
      } else {
        if (!form.fullName) { toast.error("الاسم مطلوب"); setBusy(false); return; }
        await signUp(form.email, form.password, form.fullName);
        toast.success("تم إنشاء الحساب — تحقق من بريدك");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div
            className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Server className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">HN-DB</h1>
            <p className="text-sm text-muted-foreground">مركز قواعد البيانات الآمن</p>
          </div>
        </div>

        <Card className="p-6 bg-card">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full mb-5">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="space-y-4">
              <TabsContent value="signup" className="m-0 space-y-4">
                <div className="space-y-2">
                  <Label>الاسم الكامل</Label>
                  <Input value={form.fullName} onChange={(e) => upd("fullName", e.target.value)} placeholder="أحمد عبدالله" />
                </div>
              </TabsContent>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" dir="ltr" value={form.email} onChange={(e) => upd("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input type="password" dir="ltr" value={form.password} onChange={(e) => upd("password", e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "جارٍ..." : tab === "signin" ? "دخول" : "إنشاء الحساب"}
              </Button>
            </form>
          </Tabs>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--success)]" />
          اتصال مشفّر — لا تُخزَّن كلمات المرور بصيغة قابلة للقراءة
        </div>
      </div>
    </div>
  );
}
