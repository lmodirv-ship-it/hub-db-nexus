# خطة إصلاح HN-DB بناءً على تقرير الفحص

التقرير يغطي المنظومة الثلاثية، لكن هذا المشروع هو **HN-DB** فقط. الخطة تعالج النقاط الخاصة به فقط — أي إصلاحات لـ TVCC أو HN-Cloud يجب أن تنفّذ داخل مشاريعها.

## 1) إصلاحات الحزم والبناء (أولوية عالية)

- **توحيد اسم المشروع**: تغيير `name` في `package.json` من `tanstack_start_ts` إلى `hn-db`.
- **حل تعارض peer dependency** بين `nitro` و `@lovable.dev/vite-tanstack-config`:
  - تثبيت `@lovable.dev/vite-tanstack-config` على نسخة دقيقة (إزالة `^`) متوافقة مع `nitro 3.0.260429-beta` الموجود.
- **اعتماد Bun كمدير حزم وحيد** (يتماشى مع `bunfig.toml` و `bun.lock` الموجودين). توثيق ذلك في README + INSTALLATION.
- **إضافة scripts ناقصة** في `package.json`:
  - `"typecheck": "tsc --noEmit"`
  - `"start": "node .output/server/index.mjs"` (بعد التحقق من المسار الفعلي بعد build)
- **التحقق الفعلي من مسار build output** عبر تشغيل `bun run build` ومعرفة أين يولّد Nitro ملف الخادم، ثم تحديث `start` و `DEPLOYMENT.md` بالمسار الصحيح.

## 2) إصلاحات الأمان (أولوية عالية)

- **إضافة `.env` إلى `.gitignore`** (مفقود حالياً حسب التقرير).
- **مراجعة سياسة RLS على `profiles`**: حالياً `USING (true)` تسمح لأي مستخدم مصادَق بقراءة كل البروفايلات. لأن هذا مشروع شخصي owner-only، تقييد السياسة إلى `auth.uid() = id` فقط.

## 3) استبدال المحاكاة بوظائف حقيقية (أولوية عالية)

التقرير يشير أن `health check` و `backups` في HN-DB محاكاة (`Math.random()` ونحوه). نضيف server functions حقيقية:

- **Health Check حقيقي** عبر `createServerFn` + `pg` client:
  - يفتح اتصال TCP/Postgres فعلي لـ `host:port` المخزّن.
  - يقيس latency حقيقي، يخزّن `last_check_ms` و `last_error`.
  - يتعامل مع timeout قصير (5s) ويُسجّل في `logs` + ينشئ `alert` عند الفشل.
- **Backup حقيقي** عبر server function:
  - تنفيذ `pg_dump` غير ممكن داخل Worker، لذلك البديل العملي: استخدام Supabase JS لتفريغ جداول `public.*` إلى JSON ورفعها إلى bucket `app-releases` (أو bucket مخصص `db-backups`)، مع حساب حجم فعلي وتخزينه في `backups.size_mb`.
  - `Download Backup`: signed URL من Storage.
  - `Restore`: قراءة JSON من Storage وإعادة إدخاله (مع تحذير واضح).
- إزالة أي قيم وهمية متبقية في `lib/api.ts`.

## 4) إنشاء Storage Buckets في migration

- إضافة migration ينشئ bucket `app-releases` (وربما `db-backups`) إن لم يكن موجوداً، مع سياسات RLS مناسبة على `storage.objects` (owner-only).
- توثيق أن البكت ينشأ تلقائياً عند `db push`.

## 5) تنظيف الحزمة المصدرية

- حذف من الأرشيف القادم: `.tanstack/`، `.wrangler/`، `hn-db.zip` الداخلي.
- التأكد أن سكربت ZIP في النهاية يستثني هذه المجلدات.

## 6) تنظيف `.env.example` والمتغيرات غير المستخدمة

التقرير يلاحظ أن متغيرات `HN_CLOUD_*` و `TVCC_WEBHOOK_SECRET` و `AUTH_SECRET` موجودة في `.env.example` لكنها غير مستخدمة. خياران:
- **الإبقاء** عليها مع تعليق `# reserved for future integration` (يتوافق مع memory: البنية مفتوحة لـ Lovable/GitHub/ZIP integrations).
- **الحذف** الآن وإعادتها لاحقاً.

التوصية: الإبقاء مع تعليق واضح، لأنه يخدم منظومة TVCC + HN-Cloud.

## 7) ضبط TypeScript

- إضافة `"node"` إلى `compilerOptions.types` في `tsconfig.json` ليصبح `["vite/client", "node"]` لأن الكود يستخدم `process.env`, `Buffer`, `crypto`.
- تشغيل `bun run typecheck` والتأكد من 0 أخطاء.

## 8) تحديث التوثيق

- **INSTALLATION.md**: استبدال `npm install` بـ `bun install` كمسار افتراضي، مع ذكر npm كبديل اختياري + ملاحظة استخدام `--legacy-peer-deps`.
- **DEPLOYMENT.md**: تصحيح مسار `node dist/server/index.mjs` إلى المسار الفعلي بعد التحقق + إضافة قسم لإنشاء buckets يدوياً كاحتياط.
- **FINAL_REPORT.md**: تحديث قسم "ما تم إنجازه" ليعكس أن health/backup أصبحا فعليين.

## 9) إعادة بناء ZIP

بعد كل ما سبق:
- `bun install` ← `bun run typecheck` ← `bun run build` ← تأكيد نجاح البناء.
- توليد `hn-db.zip` نظيف (بدون `.tanstack`, `.wrangler`, `node_modules`, `dist`, `.output`, `.env`, ZIP داخلي).

## التفاصيل التقنية

```text
ملفات سيتم تعديلها:
- package.json                          (name, scripts, lovable config version pin)
- .gitignore                            (إضافة .env)
- tsconfig.json                         (إضافة "node" إلى types)
- .env.example                          (تعليقات توضيحية)
- src/lib/api.ts                        (وظائف حقيقية)
- INSTALLATION.md, DEPLOYMENT.md, FINAL_REPORT.md

ملفات سيتم إنشاؤها:
- src/lib/health.functions.ts           (Health Check حقيقي)
- src/lib/backups.functions.ts          (Backup/Restore حقيقي)
- supabase/migrations/<ts>_buckets_and_rls_fixes.sql
  - إنشاء bucket db-backups (وapp-releases إن لم يكن)
  - سياسات storage.objects (owner-only)
  - تعديل سياسة profiles_select_own إلى auth.uid() = id

تبعيات قد تُضاف:
- pg (للاتصال الفعلي بـ Postgres خارجية في health check)
  ملاحظة: pg يعمل على Node لكنه ثقيل على Worker.
  البديل: استخدام fetch مباشر إلى Supabase REST لاختبار قواعد Supabase،
  أو استخدام postgres.js (أخف ومتوافق edge).
  القرار: postgres.js لأنه edge-friendly.
```

## ما هو خارج النطاق

- إصلاحات TVCC (`ssl_certificates`, lockfile, schema): يجب تنفيذها في مشروع TVCC.
- إصلاحات HN-Cloud (`backup_type enum`, buckets, runner): في مشروع HN-Cloud.
- إنشاء Dockerfile / PM2 ecosystem (التقرير يصنّفها أولوية منخفضة، والتوثيق الحالي يكفي للنشر اليدوي).
