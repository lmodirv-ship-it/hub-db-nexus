# دليل التركيب — HN-DB

## المتطلبات

- نظام: Windows / macOS / Linux
- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **npm** (يأتي مع Node) أو **bun**
- Git (اختياري)
- مشروع Supabase (URL + Publishable Key + Service Role Key)

## 1. فك الضغط

```bash
unzip hn-db.zip -d hn-db
cd hn-db
```

## 2. تثبيت الحزم

```bash
npm install
# أو
bun install
```

## 3. إعداد متغيرات البيئة

```bash
cp .env.example .env
```

ثم افتح `.env` واملأ القيم:

| المتغير | المصدر |
|---|---|
| `VITE_SUPABASE_URL` | لوحة Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | نفس الصفحة → anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | معرّف المشروع |
| `SUPABASE_URL` | نفس الرابط |
| `SUPABASE_PUBLISHABLE_KEY` | نفس المفتاح |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (سرّي) |
| `HN_CLOUD_API_URL` / `HN_CLOUD_TOKEN` | إعدادات HN-Cloud |
| `TVCC_WEBHOOK_SECRET` | سرّ مشترك مع TVCC |
| `AUTH_SECRET` | سلسلة عشوائية قوية |

## 4. تطبيق Migrations على قاعدة البيانات

ملفات SQL موجودة في `supabase/migrations/`. طبّقها عبر:

- **Supabase CLI** (مفضّل):
  ```bash
  supabase link --project-ref <PROJECT_ID>
  supabase db push
  ```
- أو **يدوياً**: افتح Supabase Dashboard → SQL Editor → الصق كل ملف بالترتيب الزمني ونفّذه.

## 5. التشغيل المحلي

```bash
npm run dev
```

افتح: http://localhost:3000

## 6. اختبار قبل النشر

```bash
npm run build       # يجب أن ينتهي بدون أخطاء
npm run preview     # معاينة نسخة الإنتاج محلياً
npm run lint        # فحص الكود
```

## 7. إنشاء أول مستخدم

- افتح `/auth` → سجّل عبر البريد.
- بعد التحقق، سجّل الدخول وستصبح أنت المالك (`owner_id`) لكل الموارد التي تنشئها.

## مشاكل شائعة

| الخطأ | الحل |
|---|---|
| `Failed to resolve import` | `npm install` |
| `Unauthorized` عند فتح صفحة | سجّل الدخول من `/auth` |
| جداول فارغة وأخطاء RLS | لم تُطبَّق Migrations — راجع الخطوة 4 |
| `process.env.X is undefined` | املأ `.env` ثم أعد التشغيل |
