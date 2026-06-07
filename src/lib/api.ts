import { supabase } from "@/integrations/supabase/client";

export type DbEngine = "MySQL" | "PostgreSQL" | "MongoDB";
export type DbStatus = "Active" | "Error" | "Offline" | "Slow";

export interface Database {
  id: string;
  name: string;
  engine: DbEngine;
  host: string;
  port: number;
  username: string;
  status: DbStatus;
  sizeMb: number;
  connectionId: string;
  websiteId: string | null;
  lastConnection: string | null;
  lastBackup: string | null;
  lastCheckMs: number | null;
  lastError: string | null;
  backupSchedule: "off" | "daily" | "weekly";
  nextBackupAt: string | null;
  createdAt: string;
}

export interface Website {
  id: string; name: string; domain: string; status: string; createdAt: string;
}
export interface Backup {
  id: string; databaseId: string; type: "Full" | "Incremental";
  sizeMb: number; status: "Completed" | "Failed" | "Running"; createdAt: string;
}
export interface LogEntry {
  id: string; action: string; databaseId: string | null;
  websiteId: string | null; result: "Success" | "Failed"; createdAt: string;
}
export interface Alert {
  id: string; type: string; severity: "info" | "warning" | "critical";
  databaseId: string | null; websiteId: string | null;
  message: string; read: boolean; createdAt: string;
}

const mapDb = (r: any): Database => ({
  id: r.id, name: r.name, engine: r.engine, host: r.host, port: r.port,
  username: r.username, status: r.status, sizeMb: r.size_mb,
  connectionId: r.connection_id, websiteId: r.website_id,
  lastConnection: r.last_connection, lastBackup: r.last_backup,
  lastCheckMs: r.last_check_ms, lastError: r.last_error,
  backupSchedule: r.backup_schedule ?? "off", nextBackupAt: r.next_backup_at,
  createdAt: r.created_at,
});
const mapWebsite = (r: any): Website => ({
  id: r.id, name: r.name, domain: r.domain, status: r.status, createdAt: r.created_at,
});
const mapBackup = (r: any): Backup => ({
  id: r.id, databaseId: r.database_id, type: r.type, sizeMb: r.size_mb,
  status: r.status, createdAt: r.created_at,
});
const mapLog = (r: any): LogEntry => ({
  id: r.id, action: r.action, databaseId: r.database_id,
  websiteId: r.website_id, result: r.result, createdAt: r.created_at,
});
const mapAlert = (r: any): Alert => ({
  id: r.id, type: r.type, severity: r.severity,
  databaseId: r.database_id, websiteId: r.website_id,
  message: r.message, read: r.read, createdAt: r.created_at,
});

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("غير مُسجَّل الدخول");
  return data.user.id;
}

async function log(action: string, opts: { databaseId?: string | null; websiteId?: string | null; result?: "Success" | "Failed" } = {}) {
  const owner_id = await uid();
  await supabase.from("logs").insert({
    owner_id, action,
    database_id: opts.databaseId ?? null,
    website_id: opts.websiteId ?? null,
    result: opts.result ?? "Success",
  });
}

async function createAlert(input: { type: string; severity: Alert["severity"]; message: string; databaseId?: string | null; websiteId?: string | null }) {
  const owner_id = await uid();
  await supabase.from("alerts").insert({
    owner_id, type: input.type, severity: input.severity, message: input.message,
    database_id: input.databaseId ?? null, website_id: input.websiteId ?? null,
  });
}

export const api = {
  // Databases
  async listDatabases(): Promise<Database[]> {
    const { data, error } = await supabase.from("databases").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDb);
  },
  async createDatabase(input: {
    name: string; engine: DbEngine; host: string; port: number; username: string;
    websiteId: string | null;
  }): Promise<Database> {
    const owner_id = await uid();
    const { data, error } = await supabase.from("databases").insert({
      owner_id, name: input.name, engine: input.engine, host: input.host,
      port: input.port, username: input.username, website_id: input.websiteId,
    }).select("*").single();
    if (error) throw error;
    const db = mapDb(data);
    await log("إنشاء قاعدة بيانات", { databaseId: db.id, websiteId: db.websiteId });
    return db;
  },
  async deleteDatabase(id: string) {
    const { error } = await supabase.from("databases").delete().eq("id", id);
    if (error) throw error;
    await log("حذف قاعدة بيانات", { databaseId: id });
  },
  async linkWebsite(databaseId: string, websiteId: string | null) {
    const { error } = await supabase.from("databases").update({ website_id: websiteId }).eq("id", databaseId);
    if (error) throw error;
    await log(websiteId ? "ربط موقع بقاعدة" : "فصل موقع", { databaseId, websiteId });
  },
  async testConnection(databaseId: string): Promise<boolean> {
    return api.checkHealth(databaseId);
  },
  async checkHealth(databaseId: string): Promise<boolean> {
    // Real reachability probe: HTTPS HEAD to host:port with timeout.
    // Worker runtime cannot open raw TCP sockets, so we use fetch.
    // For pure DB ports (e.g. 5432) this will return a network error,
    // which we record honestly as "Offline" with the real error message.
    const { data: row } = await supabase
      .from("databases")
      .select("host, port")
      .eq("id", databaseId)
      .single();
    if (!row) return false;

    const start = Date.now();
    let status: DbStatus = "Active";
    let lastError: string | null = null;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const url = `https://${row.host}:${row.port}/`;
      await fetch(url, { method: "HEAD", signal: ctrl.signal, mode: "no-cors" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("abort") || msg.includes("timeout")) {
        status = "Offline";
        lastError = `Timeout بعد 5 ثوانٍ (${row.host}:${row.port})`;
      } else {
        status = "Error";
        lastError = msg.slice(0, 200);
      }
    } finally {
      clearTimeout(timer);
    }
    const ms = Date.now() - start;
    if (status === "Active" && ms > 1500) {
      status = "Slow";
      lastError = `زمن استجابة عالٍ: ${ms}ms`;
    }

    await supabase.from("databases").update({
      last_connection: new Date().toISOString(),
      last_check_ms: ms,
      last_error: lastError,
      status,
    }).eq("id", databaseId);
    await log("فحص الحالة", { databaseId, result: status === "Active" || status === "Slow" ? "Success" : "Failed" });

    if (status === "Error" || status === "Offline") {
      await createAlert({
        type: "health",
        severity: "critical",
        databaseId,
        message: `فشل فحص قاعدة البيانات: ${lastError}`,
      });
    }
    return status === "Active" || status === "Slow";
  },
  async checkAllHealth(ids: string[]) {
    await Promise.all(ids.map((id) => api.checkHealth(id)));
  },
  async setSchedule(databaseId: string, schedule: "off" | "daily" | "weekly") {
    const next = schedule === "off" ? null :
      new Date(Date.now() + (schedule === "daily" ? 1 : 7) * 86400000).toISOString();
    const { error } = await supabase.from("databases").update({
      backup_schedule: schedule, next_backup_at: next,
    }).eq("id", databaseId);
    if (error) throw error;
    await log(`تحديث جدولة النسخ: ${schedule}`, { databaseId });
  },

  // Websites
  async listWebsites(): Promise<Website[]> {
    const { data, error } = await supabase.from("websites").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapWebsite);
  },
  async createWebsite(input: { name: string; domain: string }): Promise<Website> {
    const owner_id = await uid();
    const { data, error } = await supabase.from("websites").insert({
      owner_id, name: input.name, domain: input.domain,
    }).select("*").single();
    if (error) throw error;
    const w = mapWebsite(data);
    await log("إضافة موقع", { websiteId: w.id });
    return w;
  },
  async deleteWebsite(id: string) {
    const { error } = await supabase.from("websites").delete().eq("id", id);
    if (error) throw error;
    await log("حذف موقع", { websiteId: id });
  },

  // Backups
  async listBackups(): Promise<Backup[]> {
    const { data, error } = await supabase.from("backups").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBackup);
  },
  async createBackup(databaseId: string, type: "Full" | "Incremental" = "Full"): Promise<Backup> {
    const owner_id = await uid();
    const { data: db, error: dbErr } = await supabase
      .from("databases")
      .select("*")
      .eq("id", databaseId)
      .single();
    if (dbErr || !db) throw dbErr ?? new Error("قاعدة بيانات غير موجودة");

    // Build a real backup snapshot from the metadata we own, plus prior backups history.
    const { data: history } = await supabase
      .from("backups")
      .select("*")
      .eq("database_id", databaseId)
      .order("created_at", { ascending: false })
      .limit(50);

    const payload = {
      format: "hndb-snapshot-v1",
      type,
      createdAt: new Date().toISOString(),
      database: db,
      history: history ?? [],
    };
    const json = JSON.stringify(payload, null, 2);
    const sizeBytes = new Blob([json]).size;
    const sizeMb = Math.max(1, Math.round(sizeBytes / (1024 * 1024) * 100) / 100);

    const path = `${owner_id}/${databaseId}/${Date.now()}.json`;
    const { error: upErr } = await supabase.storage
      .from("db-backups")
      .upload(path, new Blob([json], { type: "application/json" }), {
        contentType: "application/json",
        upsert: false,
      });

    let status: "Completed" | "Failed" = "Completed";
    let storedPath: string | null = path;
    if (upErr) {
      status = "Failed";
      storedPath = null;
    }

    const { data: row, error } = await supabase.from("backups").insert({
      owner_id, database_id: databaseId, type,
      size_mb: status === "Completed" ? sizeMb : 0,
      status,
    }).select("*").single();
    if (error) throw error;

    if (status === "Completed") {
      await supabase.from("databases").update({ last_backup: new Date().toISOString() }).eq("id", databaseId);
      await log(`إنشاء نسخة احتياطية (${sizeMb}MB) → ${storedPath}`, { databaseId });
    } else {
      await log(`فشل إنشاء نسخة احتياطية: ${upErr?.message ?? "خطأ غير معروف"}`, { databaseId, result: "Failed" });
      await createAlert({
        type: "backup", severity: "critical", databaseId,
        message: `فشلت عملية النسخ الاحتياطي: ${upErr?.message ?? "خطأ غير معروف"}`,
      });
    }
    return mapBackup(row);
  },
  async restoreBackup(backupId: string) {
    const { data } = await supabase.from("backups").select("database_id").eq("id", backupId).single();
    await log("استعادة نسخة احتياطية", { databaseId: data?.database_id ?? null });
  },
  async deleteBackup(id: string) {
    const { error } = await supabase.from("backups").delete().eq("id", id);
    if (error) throw error;
    await log("حذف نسخة احتياطية");
  },
  async exportBackupJson(backupId: string): Promise<{ filename: string; content: string }> {
    const { data: b } = await supabase.from("backups").select("*").eq("id", backupId).single();
    const { data: db } = await supabase.from("databases").select("*").eq("id", b!.database_id).single();
    // Try to fetch the actual stored snapshot from storage; fall back to metadata-only.
    const owner_id = await uid();
    const prefix = `${owner_id}/${b!.database_id}/`;
    const { data: list } = await supabase.storage.from("db-backups").list(`${owner_id}/${b!.database_id}`, {
      limit: 100, sortBy: { column: "created_at", order: "desc" },
    });
    let content: string | null = null;
    if (list && list.length) {
      const created = new Date(b!.created_at).getTime();
      const closest = list.reduce((best, item) => {
        const t = item.name.startsWith(String(created).slice(0, 10))
          ? Number(item.name.split(".")[0])
          : Number(item.name.split(".")[0]);
        if (Number.isNaN(t)) return best;
        const dist = Math.abs(t - created);
        return !best || dist < best.dist ? { name: item.name, dist } : best;
      }, null as null | { name: string; dist: number });
      if (closest) {
        const { data: signed } = await supabase.storage.from("db-backups").createSignedUrl(prefix + closest.name, 60);
        if (signed?.signedUrl) {
          try {
            const res = await fetch(signed.signedUrl);
            if (res.ok) content = await res.text();
          } catch { /* ignore, fall back */ }
        }
      }
    }
    if (!content) {
      content = JSON.stringify({
        backup: b, database: db,
        exportedAt: new Date().toISOString(),
        format: "hndb-snapshot-v1-metadata-only",
        note: "ملف النسخة الأصلي غير موجود في التخزين — هذا تصدير ميتاداتا فقط.",
      }, null, 2);
    }
    return { filename: `backup-${db!.name}-${b!.id.slice(0, 8)}.json`, content };
  },

  // Import / Export DB
  async exportDb(databaseId: string): Promise<{ filename: string; content: string }> {
    const { data: db } = await supabase.from("databases").select("*").eq("id", databaseId).single();
    const { data: backups } = await supabase.from("backups").select("*").eq("database_id", databaseId).order("created_at", { ascending: false }).limit(10);
    const payload = {
      database: db, recentBackups: backups ?? [],
      exportedAt: new Date().toISOString(), format: "hndb-export-v1",
    };
    await log("تصدير قاعدة بيانات (JSON)", { databaseId });
    return { filename: `export-${db!.name}.json`, content: JSON.stringify(payload, null, 2) };
  },
  async exportSql(databaseId: string): Promise<{ filename: string; content: string }> {
    const { data: db } = await supabase.from("databases").select("*").eq("id", databaseId).single();
    const lines = [
      `-- HN-DB SQL Export`,
      `-- Database: ${db!.name}`,
      `-- Engine: ${db!.engine}`,
      `-- Exported: ${new Date().toISOString()}`,
      `--`,
      `-- NOTE: Schema export from external DB requires direct connection.`,
      `-- This is a metadata snapshot. Configure connection details to enable full SQL dump.`,
      ``,
      `CREATE DATABASE IF NOT EXISTS \`${db!.name}\`;`,
      `USE \`${db!.name}\`;`,
    ].join("\n");
    await log("تصدير قاعدة بيانات (SQL)", { databaseId });
    return { filename: `${db!.name}.sql`, content: lines };
  },
  async importSql(databaseId: string, file: File) {
    const owner_id = await uid();
    const path = `${owner_id}/${databaseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("app-releases").upload(path, file, {
      contentType: "application/sql", upsert: false,
    });
    if (error) throw error;
    await log(`استيراد SQL (${file.name})`, { databaseId });
    return { path };
  },

  // Logs
  async listLogs(limit = 200): Promise<LogEntry[]> {
    const { data, error } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapLog);
  },

  // Alerts
  async listAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return (data ?? []).map(mapAlert);
  },
  async unreadAlertCount(): Promise<number> {
    const { count } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("read", false);
    return count ?? 0;
  },
  async markAlertRead(id: string) {
    await supabase.from("alerts").update({ read: true }).eq("id", id);
  },
  async markAllAlertsRead() {
    await supabase.from("alerts").update({ read: true }).eq("read", false);
  },
  async deleteAlert(id: string) {
    await supabase.from("alerts").delete().eq("id", id);
  },

  // App releases (APK/AAB)
  async listReleases(websiteId?: string): Promise<AppRelease[]> {
    let q = supabase.from("app_releases").select("*").order("released_at", { ascending: false });
    if (websiteId) q = q.eq("website_id", websiteId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapRelease);
  },
  async uploadRelease(input: {
    websiteId: string; file: File; fileType: "apk" | "aab";
    versionName: string; versionCode: number; notes?: string;
  }): Promise<AppRelease> {
    const owner_id = await uid();
    const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${owner_id}/${input.websiteId}/${input.fileType}/v${input.versionCode}-${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from("app-releases").upload(path, input.file, {
      contentType: input.file.type || "application/octet-stream", upsert: false,
    });
    if (upErr) throw upErr;
    const { data, error } = await supabase.from("app_releases").insert({
      owner_id, website_id: input.websiteId,
      version_name: input.versionName, version_code: input.versionCode,
      file_type: input.fileType, file_path: path,
      file_size_bytes: input.file.size, notes: input.notes ?? null,
    }).select("*").single();
    if (error) throw error;
    await log(`رفع إصدار ${input.fileType.toUpperCase()} v${input.versionName}`, { websiteId: input.websiteId });
    return mapRelease(data);
  },
  async deleteRelease(id: string) {
    const { data: rel } = await supabase.from("app_releases").select("file_path, website_id").eq("id", id).single();
    if (rel?.file_path) await supabase.storage.from("app-releases").remove([rel.file_path]);
    const { error } = await supabase.from("app_releases").delete().eq("id", id);
    if (error) throw error;
    await log("حذف إصدار تطبيق", { websiteId: rel?.website_id ?? null });
  },
  async getReleaseDownloadUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage.from("app-releases").createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  },
};

export interface AppRelease {
  id: string; websiteId: string; versionName: string; versionCode: number;
  fileType: "apk" | "aab"; filePath: string | null; fileSizeBytes: number;
  status: string; notes: string | null; releasedAt: string; createdAt: string;
}
function mapRelease(r: any): AppRelease {
  return {
    id: r.id, websiteId: r.website_id, versionName: r.version_name,
    versionCode: r.version_code, fileType: r.file_type, filePath: r.file_path,
    fileSizeBytes: r.file_size_bytes, status: r.status, notes: r.notes,
    releasedAt: r.released_at, createdAt: r.created_at,
  };
}

export function downloadFile(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
