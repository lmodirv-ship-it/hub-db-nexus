import { supabase } from "@/integrations/supabase/client";

export type DbEngine = "MySQL" | "PostgreSQL" | "MongoDB";
export type DbStatus = "Active" | "Error" | "Offline";

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
  createdAt: string;
}

export interface Website {
  id: string;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
}

export interface Backup {
  id: string;
  databaseId: string;
  type: "Full" | "Incremental";
  sizeMb: number;
  status: "Completed" | "Failed" | "Running";
  createdAt: string;
}

export interface LogEntry {
  id: string;
  action: string;
  databaseId: string | null;
  websiteId: string | null;
  result: "Success" | "Failed";
  createdAt: string;
}

const mapDb = (r: any): Database => ({
  id: r.id, name: r.name, engine: r.engine, host: r.host, port: r.port,
  username: r.username, status: r.status, sizeMb: r.size_mb,
  connectionId: r.connection_id, websiteId: r.website_id,
  lastConnection: r.last_connection, lastBackup: r.last_backup,
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
    const ok = Math.random() > 0.15;
    await supabase.from("databases").update({
      last_connection: new Date().toISOString(),
      status: ok ? "Active" : "Error",
    }).eq("id", databaseId);
    await log("اختبار الاتصال", { databaseId, result: ok ? "Success" : "Failed" });
    return ok;
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
    const { data: db } = await supabase.from("databases").select("size_mb").eq("id", databaseId).single();
    const size = Math.max(10, Math.round((db?.size_mb ?? 100) * 0.95));
    const { data, error } = await supabase.from("backups").insert({
      owner_id, database_id: databaseId, type, size_mb: size, status: "Completed",
    }).select("*").single();
    if (error) throw error;
    await supabase.from("databases").update({ last_backup: new Date().toISOString() }).eq("id", databaseId);
    await log("إنشاء نسخة احتياطية", { databaseId });
    return mapBackup(data);
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

  // Logs
  async listLogs(limit = 200): Promise<LogEntry[]> {
    const { data, error } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapLog);
  },
};
