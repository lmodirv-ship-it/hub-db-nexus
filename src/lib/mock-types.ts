export type DbType = "MySQL" | "PostgreSQL" | "MongoDB";
export type DbStatus = "Active" | "Error" | "Offline";

export interface Database {
  id: string;
  name: string;
  type: DbType;
  host: string;
  port: number;
  username: string;
  websiteId: string | null;
  status: DbStatus;
  sizeMB: number;
  lastConnection: string;
  lastBackup: string | null;
  notes?: string;
  connectionId: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
}

export interface Backup {
  id: string;
  databaseId: string;
  type: "Full" | "Incremental";
  date: string;
  sizeMB: number;
  status: "Completed" | "Failed" | "Running";
}

export interface LogEntry {
  id: string;
  action: string;
  user: string;
  databaseId: string | null;
  websiteId: string | null;
  result: "Success" | "Failed";
  date: string;
}

export const websites: Website[] = [
  { id: "w1", name: "متجر النور", url: "alnour-shop.com" },
  { id: "w2", name: "مدونة التقنية", url: "tech-blog.dev" },
  { id: "w3", name: "بوابة الأخبار", url: "news-portal.net" },
  { id: "w4", name: "منصة التعليم", url: "edu-platform.io" },
];

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000).toISOString();

export const initialDatabases: Database[] = [
  { id: "db1", name: "alnour_main", type: "MySQL", host: "db1.hn-db.internal", port: 3306, username: "admin", websiteId: "w1", status: "Active", sizeMB: 1240, lastConnection: ago(0.2), lastBackup: ago(6), connectionId: "HNDB_CONN_8F2A91", notes: "قاعدة بيانات المنتجات والطلبات" },
  { id: "db2", name: "tech_blog_pg", type: "PostgreSQL", host: "db2.hn-db.internal", port: 5432, username: "blog_user", websiteId: "w2", status: "Active", sizeMB: 320, lastConnection: ago(1), lastBackup: ago(12), connectionId: "HNDB_CONN_3C7E10" },
  { id: "db3", name: "news_mongo", type: "MongoDB", host: "db3.hn-db.internal", port: 27017, username: "news_admin", websiteId: "w3", status: "Error", sizeMB: 4820, lastConnection: ago(8), lastBackup: ago(24), connectionId: "HNDB_CONN_B5A209" },
  { id: "db4", name: "edu_main", type: "MySQL", host: "db4.hn-db.internal", port: 3306, username: "edu", websiteId: "w4", status: "Active", sizeMB: 980, lastConnection: ago(0.5), lastBackup: ago(3), connectionId: "HNDB_CONN_19DDA4" },
  { id: "db5", name: "analytics_raw", type: "PostgreSQL", host: "db5.hn-db.internal", port: 5432, username: "analytics", websiteId: null, status: "Offline", sizeMB: 7200, lastConnection: ago(72), lastBackup: ago(48), connectionId: "HNDB_CONN_44BB67" },
  { id: "db6", name: "sandbox_db", type: "MongoDB", host: "db6.hn-db.internal", port: 27017, username: "dev", websiteId: null, status: "Active", sizeMB: 120, lastConnection: ago(2), lastBackup: null, connectionId: "HNDB_CONN_77EE21" },
];

export const initialBackups: Backup[] = [
  { id: "b1", databaseId: "db1", type: "Full", date: ago(6), sizeMB: 1180, status: "Completed" },
  { id: "b2", databaseId: "db2", type: "Incremental", date: ago(12), sizeMB: 45, status: "Completed" },
  { id: "b3", databaseId: "db3", type: "Full", date: ago(24), sizeMB: 4600, status: "Failed" },
  { id: "b4", databaseId: "db4", type: "Full", date: ago(3), sizeMB: 940, status: "Completed" },
  { id: "b5", databaseId: "db5", type: "Incremental", date: ago(48), sizeMB: 210, status: "Completed" },
  { id: "b6", databaseId: "db1", type: "Incremental", date: ago(2), sizeMB: 60, status: "Running" },
];

export const initialLogs: LogEntry[] = [
  { id: "l1", action: "إنشاء قاعدة بيانات", user: "admin", databaseId: "db6", websiteId: null, result: "Success", date: ago(2) },
  { id: "l2", action: "نسخة احتياطية", user: "admin", databaseId: "db1", websiteId: "w1", result: "Success", date: ago(6) },
  { id: "l3", action: "اختبار الاتصال", user: "editor", databaseId: "db3", websiteId: "w3", result: "Failed", date: ago(8) },
  { id: "l4", action: "ربط موقع", user: "admin", databaseId: "db4", websiteId: "w4", result: "Success", date: ago(20) },
  { id: "l5", action: "استعادة نسخة", user: "admin", databaseId: "db2", websiteId: "w2", result: "Success", date: ago(30) },
  { id: "l6", action: "حذف نسخة احتياطية", user: "editor", databaseId: "db5", websiteId: null, result: "Success", date: ago(40) },
];
