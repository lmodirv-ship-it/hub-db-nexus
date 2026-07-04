import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Database, Loader2 } from "lucide-react";

export const Route = createFileRoute("/external-data")({
  head: () => ({
    meta: [
      { title: "البيانات الخارجية — HN-DB" },
      { name: "description", content: "الصفوف المستلمة من HN Service Hub مجمّعة حسب الجدول." },
    ],
  }),
  component: ExternalDataPage,
});

type Row = {
  id: string;
  source_name: string;
  table_name: string;
  row_pk: string;
  payload: Record<string, any>;
  received_at: string;
};

async function listRows(): Promise<Row[]> {
  const { data, error } = await supabase
    .from("external_data_rows")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as Row[];
}

function ExternalDataPage() {
  const [filter, setFilter] = useState("");
  const q = useQuery({ queryKey: ["external-rows"], queryFn: listRows, refetchInterval: 30_000 });
  const rows = q.data ?? [];

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) {
      const key = `${r.source_name} · ${r.table_name}`;
      if (filter && !key.toLowerCase().includes(filter.toLowerCase())) continue;
      const arr = m.get(key) ?? [];
      arr.push(r);
      m.set(key, arr);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows, filter]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="البيانات الخارجية"
        subtitle="الصفوف المُستلمة من HN Service Hub — مجمّعة حسب الجدول"
      />
      <div className="p-6 space-y-4">
        <Card className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <code className="text-xs">POST /api/external-data/sync</code>
          </div>
          <div className="mr-auto" />
          <Input
            placeholder="بحث بالمصدر أو اسم الجدول..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
          <Badge variant="outline">{rows.length} صف</Badge>
        </Card>

        {q.isLoading ? (
          <Card className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></Card>
        ) : groups.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground text-sm">لا توجد صفوف مستلمة.</Card>
        ) : (
          <Card>
            <Accordion type="multiple" className="w-full">
              {groups.map(([key, items]) => {
                const columns = Array.from(
                  items.slice(0, 10).reduce((s, it) => {
                    Object.keys(it.payload ?? {}).forEach((k) => s.add(k));
                    return s;
                  }, new Set<string>())
                ).slice(0, 8);
                return (
                  <AccordionItem key={key} value={key} className="px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-semibold">{key}</span>
                        <Badge variant="secondary">{items.length}</Badge>
                        <span className="text-xs text-muted-foreground mr-auto">
                          آخر استلام: {formatDate(items[0].received_at)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-auto max-h-[420px] border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>PK</TableHead>
                              {columns.map((c) => <TableHead key={c}>{c}</TableHead>)}
                              <TableHead>استُلم</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.slice(0, 200).map((r) => (
                              <TableRow key={r.id}>
                                <TableCell className="font-mono text-xs">{r.row_pk}</TableCell>
                                {columns.map((c) => (
                                  <TableCell key={c} className="text-xs max-w-[200px] truncate">
                                    {formatCell(r.payload?.[c])}
                                  </TableCell>
                                ))}
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatDate(r.received_at)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {items.length > 200 && (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                          يعرض 200 من {items.length}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatCell(v: any): string {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
