import { useSyncExternalStore } from "react";
import {
  initialBackups,
  initialDatabases,
  initialLogs,
  websites,
  type Backup,
  type Database,
  type LogEntry,
  type Website,
} from "./mock-types";

interface State {
  databases: Database[];
  backups: Backup[];
  logs: LogEntry[];
  websites: Website[];
}

let state: State = {
  databases: initialDatabases,
  backups: initialBackups,
  logs: initialLogs,
  websites,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => state;

export const useStore = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

const setState = (updater: (s: State) => State) => {
  state = updater(state);
  notify();
};

const rnd = (n = 6) =>
  Array.from({ length: n }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");

const addLog = (entry: Omit<LogEntry, "id" | "date">) =>
  setState((s) => ({
    ...s,
    logs: [
      { ...entry, id: "l" + rnd(4), date: new Date().toISOString() },
      ...s.logs,
    ],
  }));

export const storeActions = {
  addDatabase(input: Omit<Database, "id" | "status" | "sizeMB" | "lastConnection" | "lastBackup" | "connectionId">) {
    const db: Database = {
      ...input,
      id: "db" + rnd(4),
      status: "Active",
      sizeMB: 0,
      lastConnection: new Date().toISOString(),
      lastBackup: null,
      connectionId: "HNDB_CONN_" + rnd(6),
    };
    setState((s) => ({ ...s, databases: [db, ...s.databases] }));
    addLog({ action: "إنشاء قاعدة بيانات", user: "admin", databaseId: db.id, websiteId: db.websiteId, result: "Success" });
    return db;
  },
  deleteDatabase(id: string) {
    setState((s) => ({
      ...s,
      databases: s.databases.filter((d) => d.id !== id),
      backups: s.backups.filter((b) => b.databaseId !== id),
    }));
    addLog({ action: "حذف قاعدة بيانات", user: "admin", databaseId: id, websiteId: null, result: "Success" });
  },
  linkWebsite(dbId: string, websiteId: string | null) {
    setState((s) => ({
      ...s,
      databases: s.databases.map((d) => (d.id === dbId ? { ...d, websiteId } : d)),
    }));
    addLog({ action: "ربط موقع", user: "admin", databaseId: dbId, websiteId, result: "Success" });
  },
  testConnection(dbId: string) {
    const db = state.databases.find((d) => d.id === dbId);
    const ok = db?.status !== "Error";
    setState((s) => ({
      ...s,
      databases: s.databases.map((d) =>
        d.id === dbId ? { ...d, lastConnection: new Date().toISOString() } : d
      ),
    }));
    addLog({ action: "اختبار الاتصال", user: "admin", databaseId: dbId, websiteId: db?.websiteId ?? null, result: ok ? "Success" : "Failed" });
    return ok;
  },
  createBackup(dbId: string) {
    const db = state.databases.find((d) => d.id === dbId);
    if (!db) return;
    const backup: Backup = {
      id: "b" + rnd(4),
      databaseId: dbId,
      type: "Full",
      date: new Date().toISOString(),
      sizeMB: Math.max(10, Math.round(db.sizeMB * 0.95)),
      status: "Completed",
    };
    setState((s) => ({
      ...s,
      backups: [backup, ...s.backups],
      databases: s.databases.map((d) => (d.id === dbId ? { ...d, lastBackup: backup.date } : d)),
    }));
    addLog({ action: "نسخة احتياطية", user: "admin", databaseId: dbId, websiteId: db.websiteId, result: "Success" });
  },
  restoreBackup(backupId: string) {
    const b = state.backups.find((x) => x.id === backupId);
    if (!b) return;
    addLog({ action: "استعادة نسخة", user: "admin", databaseId: b.databaseId, websiteId: null, result: "Success" });
  },
};
