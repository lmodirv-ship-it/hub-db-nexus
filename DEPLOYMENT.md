# دليل النشر — HN-DB على VPS

## 1. تجهيز السيرفر (Ubuntu 22.04+)

```bash
# Node.js 20 + nginx + certbot + pm2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# Bun (موصى به للتثبيت)
curl -fsSL https://bun.sh/install | bash
```

## 2. رفع المشروع

```bash
scp hn-db.zip user@your-vps:/var/www/
ssh user@your-vps
cd /var/www
unzip hn-db.zip -d hn-db
cd hn-db
```

## 3. تثبيت الحزم

```bash
bun install
```

## 4. إعداد Environment Variables

```bash
cp .env.example .env
nano .env
```

> **مهم:** `.env` مضاف إلى `.gitignore` فعلاً. لا ترفعه إلى Git.

## 5. تطبيق Migrations + إنشاء Buckets

```bash
bunx supabase link --project-ref <PROJECT_ID>
bunx supabase db push
```

Migrations تنشئ تلقائياً buckets: `app-releases` و `db-backups`.

## 6. البناء

```bash
bun run build
```

الناتج في `.output/`:
- `.output/server/index.mjs` — خادم Nitro
- `.output/public/` — الأصول الثابتة

## 7. تشغيل دائم عبر PM2

```bash
pm2 start ".output/server/index.mjs" --name hn-db --cwd /var/www/hn-db --update-env
pm2 save
pm2 startup
pm2 logs hn-db
```

التطبيق يستمع على `PORT` (افتراضي 3000).

## 8. ربط الدومين عبر Nginx

أنشئ `/etc/nginx/sites-available/hn-db`:

```nginx
server {
  listen 80;
  server_name hndb.example.com;
  client_max_body_size 200M;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hn-db /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 9. SSL تلقائي عبر Let's Encrypt

```bash
sudo certbot --nginx -d hndb.example.com
sudo systemctl enable certbot.timer
```

## 10. الجدار الناري

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 11. التحديث المستقبلي

```bash
cd /var/www/hn-db
# ارفع النسخة الجديدة
bun install
bun run build
pm2 restart hn-db
```

## 12. النسخ الاحتياطي

- **قاعدة البيانات:** Supabase تأخذ نسخاً تلقائية + يدوياً من صفحة `Backups`.
- **النسخ في Storage:** bucket `db-backups` (خاص، owner-only).
- **ENV:** احتفظ بنسخة آمنة من `.env` خارج السيرفر.

## التحقق بعد النشر

- ✅ `https://hndb.example.com` يفتح
- ✅ شهادة SSL صالحة
- ✅ تسجيل الدخول يعمل
- ✅ `pm2 list` يُظهر `hn-db` بحالة `online`
- ✅ `GET /api/public/site-config?domain=...` يستجيب
- ✅ Backups → New Backup → ملف JSON يُرفع إلى bucket `db-backups`
