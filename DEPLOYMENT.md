# دليل النشر — HN-DB على VPS

## 1. تجهيز السيرفر (Ubuntu 22.04+)

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

## 2. رفع المشروع

```bash
# من جهازك المحلي
scp hn-db.zip user@your-vps:/var/www/
ssh user@your-vps
cd /var/www
unzip hn-db.zip -d hn-db
cd hn-db
```

## 3. تثبيت الحزم

```bash
npm ci
```

## 4. إعداد Environment Variables

```bash
cp .env.example .env
nano .env       # املأ القيم الحقيقية (راجع INSTALLATION.md)
```

> **مهم:** لا ترفع `.env` إلى Git مطلقاً.

## 5. تطبيق Migrations

```bash
npx supabase link --project-ref <PROJECT_ID>
npx supabase db push
```

## 6. البناء

```bash
npm run build
```

النتيجة في `dist/`:
- `dist/client/` — الأصول الثابتة
- `dist/server/` — تطبيق Nitro

## 7. تشغيل دائم عبر PM2

```bash
pm2 start "node dist/server/index.mjs" --name hn-db --cwd /var/www/hn-db
pm2 save
pm2 startup            # نفّذ السطر المطبوع لتفعيل البدء التلقائي
pm2 logs hn-db         # متابعة السجلات
```

التطبيق يستمع على `http://127.0.0.1:3000`.

## 8. ربط الدومين عبر Nginx

أنشئ `/etc/nginx/sites-available/hn-db`:

```nginx
server {
  listen 80;
  server_name hndb.example.com;

  client_max_body_size 200M;   # رفع APK كبير

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

فعّله:

```bash
sudo ln -s /etc/nginx/sites-available/hn-db /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 9. SSL تلقائي عبر Let's Encrypt

```bash
sudo certbot --nginx -d hndb.example.com
sudo systemctl enable certbot.timer   # تجديد تلقائي
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
# ارفع النسخة الجديدة (scp أو git pull)
npm ci
npm run build
pm2 restart hn-db
```

## 12. النسخ الاحتياطي

- **قاعدة البيانات:** Supabase تأخذ نسخاً تلقائية. يمكن أيضاً تصدير يدوي من `Backups` داخل HN-DB.
- **ملفات APK:** مخزّنة في Supabase Storage (bucket: `app-releases`).
- **ENV:** احتفظ بنسخة آمنة من `.env` خارج السيرفر.

## التحقق بعد النشر

- ✅ `https://hndb.example.com` يفتح
- ✅ شهادة SSL صالحة
- ✅ تسجيل الدخول يعمل
- ✅ `pm2 list` يُظهر `hn-db` بحالة `online`
- ✅ `GET /api/public/site-config?domain=...` يستجيب
