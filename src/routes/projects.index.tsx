import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FolderKanban, Plus, Trash2, Pencil, Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, type Project } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "المشاريع — HN-DB" },
      { name: "description", content: "إدارة مشاريعك: إنشاء، تعديل، حذف، وربط بالمواقع." },
    ],
  }),
  component: ProjectsPage,
});

const STATUSES = [
  { value: "active", label: "نشط" },
  { value: "paused", label: "متوقّف" },
  { value: "archived", label: "مؤرشف" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    paused: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    archived: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<string, string> = { active: "نشط", paused: "متوقّف", archived: "مؤرشف" };
  return <Badge variant="outline" className={map[status] ?? ""}>{labels[status] ?? status}</Badge>;
}

function ProjectsPage() {
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ["projects"], queryFn: api.listProjects });
  const websites = useQuery({ queryKey: ["websites"], queryFn: api.listWebsites });
  const list = projects.data ?? [];
  const sites = websites.data ?? [];

  const [openCreate, setOpenCreate] = useState(false);
  const [editProj, setEditProj] = useState<Project | null>(null);

  return (
    <>
      <PageHeader
        title="المشاريع"
        subtitle={`${list.length} مشروع — إدارة كاملة CRUD وربط بالمواقع`}
        actions={
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mx-1" />مشروع جديد</Button>
            </DialogTrigger>
            <ProjectFormDialog
              mode="create"
              websites={sites}
              onDone={() => { setOpenCreate(false); qc.invalidateQueries({ queryKey: ["projects"] }); }}
            />
          </Dialog>
        }
      />

      <div className="flex-1 p-6">
        {projects.isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin inline text-primary" /></div>
        ) : list.length === 0 ? (
          <Card className="p-12 text-center bg-card border-dashed">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">لا توجد مشاريع بعد. ابدأ بإنشاء مشروعك الأول.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => {
              const site = sites.find((s) => s.id === p.websiteId);
              return (
                <Card key={p.id} className="p-5 bg-card hover:border-primary/40 transition group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: p.id }}
                        className="font-bold text-lg hover:text-primary transition truncate block"
                      >
                        {p.name}
                      </Link>
                      {site && (
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono" dir="ltr">{site.domain}</div>
                      )}
                    </div>
                    {statusBadge(p.status)}
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(p.createdAt)}</span>
                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditProj(p)} aria-label="تعديل">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteProjectBtn id={p.id} name={p.name} />
                      <Button asChild size="sm" variant="ghost" className="h-8">
                        <Link to="/projects/$projectId" params={{ projectId: p.id }}>
                          فتح <ArrowLeft className="h-3.5 w-3.5 mx-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editProj && (
        <Dialog open onOpenChange={(o) => !o && setEditProj(null)}>
          <ProjectFormDialog
            mode="edit"
            project={editProj}
            websites={sites}
            onDone={() => { setEditProj(null); qc.invalidateQueries({ queryKey: ["projects"] }); }}
          />
        </Dialog>
      )}
    </>
  );
}

function DeleteProjectBtn({ id, name }: { id: string; name: string }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => api.deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("تم حذف المشروع"); },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحذف"),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="حذف">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف <b>{name}</b> وكل المقاطع والمهام المرتبطة به نهائيًا.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => m.mutate()}
          >حذف نهائي</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProjectFormDialog({
  mode, project, websites, onDone,
}: {
  mode: "create" | "edit";
  project?: Project;
  websites: { id: string; name: string; domain: string }[];
  onDone: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "active");
  const [websiteId, setWebsiteId] = useState(project?.websiteId ?? "__none__");

  const m = useMutation({
    mutationFn: async () => {
      const wid = websiteId === "__none__" ? null : websiteId;
      if (mode === "create") {
        return api.createProject({ name: name.trim(), description: description.trim() || null, websiteId: wid });
      }
      return api.updateProject(project!.id, {
        name: name.trim(), description: description.trim() || null, status, websiteId: wid,
      });
    },
    onSuccess: () => { toast.success(mode === "create" ? "تم إنشاء المشروع" : "تم تحديث المشروع"); onDone(); },
    onError: (e: any) => toast.error(e?.message ?? "فشل"),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "مشروع جديد" : "تعديل المشروع"}</DialogTitle>
        <DialogDescription>املأ الحقول التالية. الاسم مطلوب.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs">الاسم *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="حملة الصيف 2026" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الوصف</Label>
          <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">الموقع المرتبط</Label>
            <Select value={websiteId ?? "__none__"} onValueChange={setWebsiteId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">بدون ربط</SelectItem>
                {websites.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {mode === "edit" && (
            <div className="space-y-1.5">
              <Label className="text-xs">الحالة</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            if (!name.trim()) { toast.error("الاسم مطلوب"); return; }
            m.mutate();
          }}
          disabled={m.isPending}
        >
          {m.isPending && <Loader2 className="h-4 w-4 animate-spin mx-1" />}
          {mode === "create" ? "إنشاء" : "حفظ"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
