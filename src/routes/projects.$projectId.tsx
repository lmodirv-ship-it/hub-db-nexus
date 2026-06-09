import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight, Plus, Trash2, Loader2, Film, Activity, ExternalLink, Play,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({ meta: [{ title: "تفاصيل المشروع — HN-DB" }] }),
  component: ProjectDetailPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">المشروع غير موجود</div>,
});

function statusColor(s: string) {
  if (s === "completed" || s === "active" || s === "ready") return "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30";
  if (s === "failed" || s === "error") return "bg-destructive/15 text-destructive border-destructive/30";
  if (s === "running" || s === "processing") return "bg-primary/15 text-primary border-primary/30";
  if (s === "queued" || s === "draft" || s === "paused") return "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30";
  return "bg-muted text-muted-foreground border-border";
}

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const project = useQuery({ queryKey: ["project", projectId], queryFn: () => api.getProject(projectId) });
  const websites = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const clips = useQuery({ queryKey: ["clips", projectId], queryFn: () => api.listClips(projectId) });
  const jobs = useQuery({ queryKey: ["jobs", projectId], queryFn: () => api.listJobs({ projectId }) });

  const updMut = useMutation({
    mutationFn: (patch: { status?: string; websiteId?: string | null }) => api.updateProject(projectId, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project", projectId] }); qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("تم التحديث"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });
  const delMut = useMutation({
    mutationFn: () => api.deleteProject(projectId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("تم الحذف"); navigate({ to: "/projects" }); },
  });

  if (project.isLoading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin inline text-primary" /></div>;
  if (!project.data) return <div className="p-12 text-center text-muted-foreground">المشروع غير موجود</div>;

  const p = project.data;
  const site = websites.data?.find((w) => w.id === p.websiteId) ?? null;

  return (
    <>
      <PageHeader
        title={p.name}
        subtitle={p.description ?? "تفاصيل المشروع والمقاطع والمهام"}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/projects"><ArrowRight className="h-4 w-4 mx-1" />العودة</Link>
            </Button>
            <Button
              variant="outline" size="sm"
              className="text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => { if (confirm(`حذف المشروع "${p.name}"؟`)) delMut.mutate(); }}
            >
              <Trash2 className="h-4 w-4 mx-1" />حذف
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Meta card */}
        <Card className="p-5 bg-card grid md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">الحالة</Label>
            <Select value={p.status} onValueChange={(v) => updMut.mutate({ status: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paused">متوقّف</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">الموقع المرتبط</Label>
            <Select
              value={p.websiteId ?? "__none__"}
              onValueChange={(v) => updMut.mutate({ websiteId: v === "__none__" ? null : v })}
            >
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">بدون ربط</SelectItem>
                {(websites.data ?? []).map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">تاريخ الإنشاء</Label>
            <div className="mt-2 text-sm">{formatDate(p.createdAt)}</div>
            {site && (
              <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1" dir="ltr">
                {site.domain} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </Card>

        {/* Tabs: Clips / Jobs */}
        <Tabs defaultValue="clips">
          <TabsList>
            <TabsTrigger value="clips"><Film className="h-4 w-4 mx-1" />المقاطع ({clips.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="jobs"><Activity className="h-4 w-4 mx-1" />المهام ({jobs.data?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="clips" className="mt-4">
            <ClipsTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <JobsTab projectId={projectId} clips={clips.data ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function ClipsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const clips = useQuery({ queryKey: ["clips", projectId], queryFn: () => api.listClips(projectId) });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState("");

  const addMut = useMutation({
    mutationFn: () => api.createClip({
      projectId, title: title.trim(),
      sourceUrl: sourceUrl.trim() || null,
      durationSec: Number(duration) || 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clips", projectId] });
      setOpen(false); setTitle(""); setSourceUrl(""); setDuration("");
      toast.success("تمت إضافة المقطع");
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.deleteClip(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clips", projectId] }); toast.success("تم الحذف"); },
  });
  const updStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateClip(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clips", projectId] }),
  });

  const list = clips.data ?? [];

  return (
    <Card className="bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">قائمة المقاطع</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mx-1" />مقطع جديد</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة مقطع</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">العنوان *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">رابط المصدر</Label>
                <Input dir="ltr" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">المدة (ثانية)</Label>
                <Input type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => { if (!title.trim()) return toast.error("العنوان مطلوب"); addMut.mutate(); }} disabled={addMut.isPending}>
                {addMut.isPending && <Loader2 className="h-4 w-4 animate-spin mx-1" />}إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clips.isLoading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">لا توجد مقاطع بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-right p-3 font-medium">#</th>
                <th className="text-right p-3 font-medium">العنوان</th>
                <th className="text-right p-3 font-medium">المدة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">المصدر</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-semibold">{c.title}</td>
                  <td className="p-3 text-muted-foreground">{c.durationSec ? `${c.durationSec}s` : "—"}</td>
                  <td className="p-3">
                    <Select value={c.status} onValueChange={(v) => updStatusMut.mutate({ id: c.id, status: v })}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="processing">قيد المعالجة</SelectItem>
                        <SelectItem value="ready">جاهز</SelectItem>
                        <SelectItem value="failed">فشل</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    {c.sourceUrl ? (
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 text-xs" dir="ltr">
                        فتح <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("حذف المقطع؟")) delMut.mutate(c.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function JobsTab({ projectId, clips }: { projectId: string; clips: { id: string; title: string }[] }) {
  const qc = useQueryClient();
  const jobs = useQuery({
    queryKey: ["jobs", projectId],
    queryFn: () => api.listJobs({ projectId }),
    refetchInterval: 5000,
  });
  const [type, setType] = useState("render");
  const [clipId, setClipId] = useState("__none__");

  const addMut = useMutation({
    mutationFn: () => api.createJob({
      type, projectId,
      clipId: clipId === "__none__" ? null : clipId,
      payload: { triggeredAt: new Date().toISOString() },
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs", projectId] }); toast.success("تم إنشاء المهمة"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });
  const cancelMut = useMutation({
    mutationFn: (id: string) => api.cancelJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs", projectId] }); toast.success("تم إلغاء المهمة"); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs", projectId] }),
  });

  const list = jobs.data ?? [];

  return (
    <Card className="bg-card">
      <div className="p-4 border-b border-border flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">نوع المهمة</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="render">معالجة (Render)</SelectItem>
              <SelectItem value="transcode">تحويل (Transcode)</SelectItem>
              <SelectItem value="thumbnail">صورة مصغّرة</SelectItem>
              <SelectItem value="publish">نشر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">مقطع (اختياري)</Label>
          <Select value={clipId} onValueChange={setClipId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="بدون" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">بدون مقطع</SelectItem>
              {clips.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}>
          <Play className="h-4 w-4 mx-1" />تشغيل المهمة
        </Button>
      </div>

      {jobs.isLoading ? (
        <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">لا توجد مهام بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-right p-3 font-medium">النوع</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">التقدّم</th>
                <th className="text-right p-3 font-medium">أُنشئت</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((j) => (
                <tr key={j.id} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3 font-mono text-xs">{j.type}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={statusColor(j.status)}>{j.status}</Badge>
                  </td>
                  <td className="p-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${j.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-end">{j.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(j.createdAt)}</td>
                  <td className="p-3 flex gap-1">
                    {(j.status === "queued" || j.status === "running") && (
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => cancelMut.mutate(j.id)}>إلغاء</Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => delMut.mutate(j.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
