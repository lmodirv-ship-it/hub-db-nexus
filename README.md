# HN-DB — لوحة إدارة قواعد البيانات

تطبيق إدارة قواعد البيانات والمواقع (HN-DB) ضمن منظومة **TVCC / HN-Cloud / HN-DB**.
مبني على **TanStack Start (React 19 + Vite 7)** و **Supabase (Lovable Cloud)**.

---

## المزايا الرئيسية

- **Databases**: إضافة / تعديل / حذف، اختبار اتصال، تصدير JSON و SQL، استيراد SQL، جدولة نسخ احتياطي (off / daily / weekly).
- **Backups**: نسخ يدوية ومجدولة، عرض السجل والحجم.
- **Websites**: ربط المواقع بقواعدها والتخزين.
- **Connections Manager**: من يربط بأي قاعدة + آخر اتصال.
- **Health Monitor**: حالة كل قاعدة (Active / Slow / Error / Offline) + زمن الفحص + سبب الخطأ.
- **Alerts**: تنبيهات تلقائية عند فشل النسخ أو فشل الفحص (شارة غير مقروء في الشريط الجانبي).
- **Activity Log**: تسجيل كل عملية مع فلاتر (الوقت، النتيجة، البحث).
- **APK Manager (Apps)**: رفع APK / AAB، إدارة الإصدارات، تنزيل آخر إصدار عبر رابط موقّع.
- **Public Site Config API**: `GET /api/public/site-config?domain=...` يعيد إعدادات الموقع وحالة قاعدة البيانات وروابط APK.
- **مصادقة كاملة**: تسجيل دخول/تسجيل عبر البريد، RLS مفعّل على كل الجداول.

---

## المتطلبات

- **Node.js 20+**
- **bun** أو **npm**
- مشروع **Supabase** (URL + Publishable Key + Service Role Key).

---

## التثبيت المحلي

```bash
# 1. تثبيت الحزم
npm install
# أو
bun install

# 2. إعداد متغيرات البيئة
cp .env.example .env
# ثم عدّل القيم في .env

# 3. تشغيل وضع التطوير
npm run dev
# الواجهة على http://localhost:3000
```

---

## البناء للإنتاج

```bash
npm run build         # بناء كامل (client + server)
npm run preview       # معاينة محلية للبناء
```

ملفات الإنتاج تُولَّد داخل `dist/`:
- `dist/client/` — الأصول الثابتة.
- `dist/server/` — تطبيق Nitro (يعمل على Node أو Cloudflare Workers).

---

## متغيرات البيئة

انظر `.env.example`. القيم المطلوبة فعلياً:

| المتغير | الوصف |
|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | المفتاح العام (anon) |
| `VITE_SUPABASE_PROJECT_ID` | معرّف المشروع |
| `SUPABASE_URL` | نفس الرابط (server-side) |
| `SUPABASE_PUBLISHABLE_KEY` | نفس المفتاح (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخدمة (سرّي — لا يُكشف للعميل) |
| `HN_CLOUD_API_URL` | عنوان HN-Cloud |
| `HN_CLOUD_TOKEN` | توكن HN-Cloud |
| `HN_CLOUD_WEBHOOK_SECRET` | سرّ HMAC لتوقيع الـ webhooks |
| `TVCC_WEBHOOK_SECRET` | سرّ HMAC المشترك مع TVCC |

---

## النشر على VPS

### 1. تجهيز السيرفر (Ubuntu 22.04+)

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. رفع المشروع

```bash
# على جهازك المحلي
scp -r ./hn-db user@your-vps:/var/www/hn-db
# أو git clone من ريبو خاص
```

### 3. التثبيت والبناء

```bash
cd /var/www/hn-db
npm ci
cp .env.example .env
nano .env            # ضع القيم الحقيقية
npm run build
```

### 4. التشغيل الدائم عبر PM2

```bash
pm2 start "node dist/server/index.mjs" --name hn-db
pm2 save
pm2 startup           # نفّذ السطر الذي يطبعه ليفعّل التشغيل عند الإقلاع
```

التطبيق يستمع افتراضياً على المنفذ `3000`.

### 5. Nginx + Domain + SSL

```nginx
# /etc/nginx/sites-available/hn-db
server {
  server_name your-domain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hn-db /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com   # SSL تلقائي
```

---

## بنية المشروع

```
src/
├── routes/                    # صفحات + Server Routes
│   ├── __root.tsx
│   ├── index.tsx              # لوحة التحكم
│   ├── auth.tsx
│   ├── databases.index.tsx
│   ├── databases.add.tsx
│   ├── websites.tsx
│   ├── connections.tsx
│   ├── backups.tsx
│   ├── apps.tsx               # APK Manager
│   ├── health.tsx
│   ├── alerts.tsx
│   ├── logs.tsx
│   └── api/public/site-config.ts
├── components/                # مكوّنات الواجهة + shadcn/ui
├── lib/                       # api, format, utils
├── integrations/supabase/     # العميل (يُولَّد تلقائياً)
└── styles.css                 # تصميم ثيمي
supabase/migrations/            # مخطط قاعدة البيانات
```

---

## الجداول

| الجدول | الوصف |
|---|---|
| `profiles` | بيانات المستخدمين |
| `user_roles` | الأدوار (`admin` / `user`) |
| `websites` | المواقع المُدارة |
| `databases` | قواعد البيانات (مع `backup_schedule`, `last_check_ms`, `last_error`) |
| `backups` | النسخ الاحتياطية |
| `app_releases` | إصدارات APK / AAB |
| `alerts` | التنبيهات |
| `logs` | سجل النشاط |

كل الجداول تحت **Row Level Security** مع سياسة `auth.uid() = owner_id`.

---

## السكربتات

| الأمر | الوصف |
|---|---|
| `npm run dev` | تطوير محلي |
| `npm run build` | بناء إنتاج |
| `npm run preview` | معاينة البناء |
| `npm run lint` | فحص الكود |
| `npm run format` | تنسيق |

---

## API عام

```
GET /api/public/site-config?domain=example.com
```

يعيد:
```json
{
  "site": { "id": "...", "name": "...", "domain": "..." },
  "database": { "status": "Active", "engine": "PostgreSQL" },
  "storage": { "bucket": "app-assets" },
  "android": { "latestApk": { "version": "1.0.0", "url": "https://..." } }
}
```
