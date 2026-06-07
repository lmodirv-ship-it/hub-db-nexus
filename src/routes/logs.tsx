import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Search, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "السجلات — HN-DB" }] }),
  component: LogsPage,
});

function LogsPage() {
  const { logs, databases, websites } = useStore();
  const [q, setQ] = useState("");
  const [result, setResult] = useState("all");

  const filtered = useMemo(
    () => logs.filter((l) =>
      (result === "all" || l.result === result) &&
      (q === "" || l.action.includes(q) || l.user.includes(q))
    ),
    [logs, q, result]
  );

  return (
    <>
      <PageHeader title="سجل العمليات" subtitle="كل العمليات على قواعد البيانات مسجلة هنا" />
      <div className="flex-1 p-6 space-y-4">
        <Card className="p-4 bg-card">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث في العمليات..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-9" />
            </div>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل النتائج</SelectItem>
                <SelectItem value="Success">ناجحة</SelectItem>
                <SelectItem value="Failed">فاشلة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-right p-3 font-medium">العملية</th>
                  <th className="text-right p-3 font-medium">المستخدم</th>
                  <th className="text-right p-3 font-medium">القاعدة</th>
                  <th className="text-right p-3 font-medium">الموقع</th>
                  <th className="text-right p-3 font-medium">النتيجة</th>
                  <th className="text-right p-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const db = databases.find((d) => d.id === l.databaseId);
                  const site = websites.find((w) => w.id === l.websiteId);
                  return (
                    <tr key={l.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3 font-medium">{l.action}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-normal">{l.user}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{db?.name ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{site?.name ?? "—"}</td>
                      <td className="p-3">
                        {l.result === "Success" ? (
                          <span className="inline-flex items-center gap-1 text-[color:var(--success)]">
                            <CheckCircle2 className="h-4 w-4" /> ناجحة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" /> فاشلة
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{formatDate(l.date)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">لا توجد سجلات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
