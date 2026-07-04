import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { DatabaseZap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/external-schemas")({
  head: () => ({
    meta: [
      { title: "مرآة الجداول الخارجية — HN-DB" },
      { name: "description", content: "الجداول المستلمة من HN Service Hub وحالة آخر مزامنة." },
    ],
  }),
  component: ExternalSchemasPage,
});

type Mirror = {
  id: string;
  source_name: string;
  target_name: string;
  schema_name: string;
  tables_count: number;
  payload_hash: string | null;
  tables_snapshot: any;
  received_at: string;
  last_sync_at: string;
  status: string;
};

async function listMirrors(): Promise<Mirror[]> {
  const { data, error } = await supabase
    .from("external_schema_mirrors")
    .select("*")
    .order("last_sync_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Mirror[];
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    synced: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    received: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    error: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={map[status] ?? ""}>{status}</Badge>;
}

function ExternalSchemasPage() {
  const q = useQuery({ queryKey: ["external-mirrors"], queryFn: listMirrors, refetchInterval: 30_000 });
  const rows = q.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="مرآة الجداول الخارجية"
        subtitle="تعريفات الجداول المُستلمة من HN Service Hub"
      />
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DatabaseZap className="h-4 w-4" />
            المصدر: HN Service Hub · Endpoint: <code className="text-xs">POST /api/external-schemas/mirror</code>
          </div>
        </Card>

        <Card>
          {q.isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">لا توجد مرايا مستلمة بعد.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المصدر</TableHead>
                  <TableHead>الهدف</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>عدد الجداول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر مزامنة</TableHead>
                  <TableHead>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">{r.source_name}</TableCell>
                    <TableCell>{r.target_name}</TableCell>
                    <TableCell>{r.schema_name}</TableCell>
                    <TableCell>{r.tables_count}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(r.last_sync_at)}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {r.payload_hash ? r.payload_hash.slice(0, 12) + "…" : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
