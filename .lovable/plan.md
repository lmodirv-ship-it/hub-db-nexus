# خطة تطوير HN-DB

الميزات الموجودة حالياً: Backup/Restore أساسي، Connections (ربط موقع-قاعدة)، Activity Log أساسي، إدارة قواعد.

## ما سيُبنى (حسب أولويتك)

### 1. Health Monitor (موسّع)
- صفحة `/health` تعرض كل قاعدة + شارة الحالة: Connected / Slow / Error / Offline.
- زر "فحص الكل" + فحص فردي.
- إظهار: آخر فحص، زمن الاستجابة (ms)، سبب الخطأ.
- عمود جديد في `databases`: `last_check_ms`, `last_error`.

### 2. Backup & Restore (تحسين)
- إضافة **Scheduled Backup**: حقل `backup_schedule` (daily/weekly/off) + `next_backup_at`.
- زر **Download Backup** (ملف JSON وهمي يمثل snapshot — بدون اتصال فعلي بـ DB خارجي).
- جدول cron عبر pg_cron يستدعي `/api/public/hooks/run-backups`.

### 3. Connections Manager (تحسين)
- صفحة `/connections` الموجودة تُحدَّث لعرض: الموقع، القاعدة، حالة الربط، آخر اتصال، زر فحص.

### 4. Import / Export
- في صفحة قاعدة: زر **Export JSON** (metadata + آخر backups) و **Export SQL** (DDL وهمي).
- زر **Import SQL**: رفع ملف `.sql`، يُخزَّن في bucket `db-imports` ويُسجَّل في `logs`.

### 5. Alerts
- جدول `alerts` (type, severity, database_id, message, read).
- توليد تلقائي عند: Backup failed، Health check failed، نمو حجم > 50% خلال 7 أيام.
- جرس في الـ Header يعرض غير المقروءة + صفحة `/alerts`.

### 6. Activity Log (تحسين)
- صفحة `/logs` موجودة. إضافة فلاتر: حسب النوع، النتيجة، المدى الزمني، البحث.
- ربط `actor_email` من `profiles` للعرض.

### تأجيل (ميزات منخفضة الأولوية حالياً)
- Database Size Tracking مع رسم 7/30 يوم (يحتاج جدول `db_size_snapshots` + cron) — أقترح المرحلة الثانية.
- Query Logs (يتطلب اتصال فعلي بقواعد خارجية — غير ممكن من Worker).
- Secrets Protection: لا توجد كلمات مرور حالياً مخزَّنة (الجدول لا يحوي password) — لا حاجة لتعديل.
- Database Templates: مرحلة لاحقة.

## تغييرات تقنية

**Migrations:**
- `databases`: + `last_check_ms int`, `last_error text`, `backup_schedule text default 'off'`, `next_backup_at timestamptz`.
- جدول جديد `alerts` (RLS owner-based + grants).
- جدول جديد `db_size_snapshots` (للمرحلة الثانية — مؤجَّل).
- bucket `db-imports` (private، RLS owner).

**ملفات:**
- `src/routes/health.tsx` جديد.
- `src/routes/alerts.tsx` جديد.
- `src/routes/connections.tsx` تحديث.
- `src/routes/logs.tsx` فلاتر.
- `src/routes/databases.index.tsx` أزرار Export/Import + Schedule.
- `src/components/app-sidebar.tsx` روابط جديدة + جرس Alerts.
- `src/lib/api.ts` دوال: `checkHealth`, `checkAllHealth`, `setSchedule`, `exportDb`, `importSql`, `listAlerts`, `markAlertRead`.
- `src/routes/api/public/hooks/run-backups.ts` + `health-check.ts` + pg_cron.

## ترتيب التنفيذ
1. Migrations (alerts + أعمدة databases + bucket).
2. API helpers + hooks routes + cron.
3. صفحات Health, Alerts + sidebar/bell.
4. تحديث Connections, Logs, Databases (Export/Import/Schedule).

هل أبدأ التنفيذ بهذا الترتيب؟
