# بنية المشروع — HN-DB

## النظرة العامة

HN-DB هو لوحة إدارة قواعد البيانات ضمن منظومة:

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  TVCC   │────▶│  HN-DB  │     │ HN-Cloud │
│ (Orch.) │     │  (DBs)  │     │ (Files)  │
└─────────┘     └─────────┘     └──────────┘
     ▲               ▲                ▲
     └───────────────┴────────────────┘
              Site Config API
```

## المكدّس التقني

- **Framework:** TanStack Start v1 (React 19 + Vite 7)
- **Runtime:** Nitro (Cloudflare Workers / Node)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **State:** TanStack Query
- **Language:** TypeScript (strict)

## بنية المجلدات

```
hn-db/
├── src/
│   ├── routes/                     # File-based routing
│   │   ├── __root.tsx              # Root layout + shell
│   │   ├── index.tsx               # Dashboard /
│   │   ├── auth.tsx                # /auth
│   │   ├── databases.index.tsx     # /databases
│   │   ├── databases.add.tsx       # /databases/add
│   │   ├── websites.tsx
│   │   ├── connections.tsx
│   │   ├── backups.tsx
│   │   ├── apps.tsx                # APK manager
│   │   ├── health.tsx              # Health monitor
│   │   ├── alerts.tsx
│   │   ├── logs.tsx
│   │   └── api/public/
│   │       └── site-config.ts      # GET /api/public/site-config
│   ├── components/
│   │   ├── app-sidebar.tsx
│   │   ├── auth-gate.tsx
│   │   ├── page-header.tsx
│   │   └── ui/                     # shadcn primitives
│   ├── hooks/
│   │   └── use-auth.tsx
│   ├── lib/
│   │   ├── api.ts                  # كل استدعاءات Supabase
│   │   ├── format.ts
│   │   └── utils.ts
│   ├── integrations/supabase/      # auto-generated, لا تعدّله
│   ├── styles.css                  # Theme tokens (Neon Enterprise)
│   ├── router.tsx
│   └── start.ts
├── supabase/
│   ├── config.toml
│   └── migrations/                 # 5 ملفات SQL
├── public/
├── .env.example
├── README.md
├── INSTALLATION.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── FINAL_REPORT.md
├── package.json
└── vite.config.ts
```

## مخطط قاعدة البيانات

| الجدول | الأعمدة الرئيسية | RLS |
|---|---|---|
| `profiles` | id, email, display_name | owner |
| `user_roles` | user_id, role (admin/user) | has_role() |
| `websites` | id, owner_id, name, domain, status | `owner_id = auth.uid()` |
| `databases` | id, owner_id, name, engine, host, port, status, size_mb, backup_schedule, last_check_ms, last_error, website_id | owner |
| `backups` | id, owner_id, database_id, type, size_mb, status | owner |
| `app_releases` | id, owner_id, website_id, version_name, version_code, file_type, file_path, file_size_bytes | owner |
| `alerts` | id, owner_id, type, severity, message, read | owner |
| `logs` | id, owner_id, action, database_id, website_id, result | owner |

كل الجداول تحت **Row Level Security** بسياسة `auth.uid() = owner_id`.

### Storage Buckets

- `app-releases` — ملفات APK / AAB / SQL imports (خاص، signed URLs لمدة ساعة)

## تدفق البيانات

```
المتصفّح
  │
  ▼
TanStack Router  ──▶  React Component
                          │
                          ▼
                    api.* (src/lib/api.ts)
                          │
                          ▼
                    Supabase Client (RLS مفعّل)
                          │
                          ▼
                    Postgres / Storage
```

## API العام

### `GET /api/public/site-config?domain=<domain>`

يُستخدَم من TVCC لجلب إعدادات موقع حسب دومينه. يرجع:

```json
{
  "site": { "id", "name", "domain" },
  "database": { "status", "engine", "size_mb" },
  "storage": { "bucket": "app-releases" },
  "android": { "latestApk": { "version", "url" } }
}
```

## الأمان

- مصادقة Supabase (Email/Password)
- RLS على كل جدول
- Service Role Key يُستخدَم فقط من Server (لا يُسرَّب للعميل)
- توقيع HMAC على Webhooks
- Signed URLs مؤقّتة لتنزيل APK

## التوسعة المستقبلية

البنية تدعم إضافة:
- Lovable Integration (مصدر مشاريع)
- GitHub Integration
- ZIP Deployments
- Local Uploads

بدون إعادة بناء النظام (انظر `mem://features/lovable-integration`).
