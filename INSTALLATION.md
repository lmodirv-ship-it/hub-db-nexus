# دليل التركيب — HN-DB

## المتطلبات

- نظام: Windows / macOS / Linux
- **Bun 1.1+** (موصى به) من [bun.sh](https://bun.sh) — أو **Node.js 20+** كبديل
- Git (اختياري)
- مشروع Supabase (URL + Publishable Key + Service Role Key)

> **مهم:** المشروع يستخدم Bun كمدير حزم رسمي (يوجد `bun.lock` و `bunfig.toml`). استخدام npm قد يفشل بسبب تعارض peer dependency بين `nitro` و `@lovable.dev/vite-tanstack-config`. إذا اضطررت لاستخدام npm، استعمل `npm install --legacy-peer-deps`.

## 1. فك الضغط

```bash
unzip hn-db.zip -d hn-db
cd hn-db
```

## 2. تثبيت الحزم

```bash
bun install
```

أو بـ npm (بديل):

```bash
npm install --legacy-peer-deps
```

## 3. إعداد متغيرات البيئة

```bash
cp .env.example .env
```

ثم افتح `.env` واملأ القيم:

| المتغير | المصدر |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | نفس الصفحة → anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | معرّف المشروع |
| `SUPABASE_URL` | نفس الرابط |
| `SUPABASE_PUBLISHABLE_KEY` | نفس المفتاح |
| `SUPABASE_SERVICE_ROLE_KEY` | API → service_role (سرّي، server-only) |
| `HN_CLOUD_*` / `TVCC_WEBHOOK_SECRET` | محجوزة لتكاملات مستقبلية — اتركها فارغة الآن |
| `AUTH_SECRET` | سلسلة عشوائية قوية (يولّدها `openssl rand -hex 32`) |

## 4. تطبيق Migrations على قاعدة البيانات

```bash
bunx supabase link --project-ref <PROJECT_ID>
bunx supabase db push
```

> Migrations تنشئ تلقائياً bucket `db-backups` و bucket `app-releases` المطلوبَين.

## 5. التشغيل المحلي

```bash
bun run dev
```

افتح: http://localhost:3000

## 6. اختبار قبل النشر

```bash
bun run typecheck    # 0 أخطاء
bun run build        # يجب أن ينتهي بدون أخطاء
bun run preview      # معاينة نسخة الإنتاج محلياً
bun run lint
```

## 7. إنشاء أول مستخدم

- افتح `/auth` → سجّل عبر البريد.
- بعد التحقق، سجّل الدخول وستصبح أنت المالك (`owner_id`) لكل الموارد التي تنشئها.

## مشاكل شائعة

| الخطأ | الحل |
|---|---|
| `ERESOLVE could not resolve` (npm) | استعمل `bun install` أو أضف `--legacy-peer-deps` |
| `Unauthorized` عند فتح صفحة | سجّل الدخول من `/auth` |
| أخطاء RLS أو جداول فارغة | لم تُطبَّق Migrations — راجع الخطوة 4 |
| `process.env.X is undefined` | املأ `.env` ثم أعد التشغيل |
| Health Check يعود "Offline" دائماً | طبيعي للبورتات الخاصة بقواعد البيانات (5432, 3306) — Worker لا يفتح TCP خام؛ هذا فحص HTTPS reachability فقط |
