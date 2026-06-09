# دليل النشر - Omar Clinic Pro

دليل شامل لنشر تطبيق Omar Clinic Pro على خوادم الإنتاج.

## المتطلبات

- **Docker** و **Docker Compose** (للنشر عبر Docker)
- **Linux Server** (Ubuntu 20.04 أو أحدث)
- **Domain Name** (اختياري)
- **SSL Certificate** (لـ HTTPS)

## النشر عبر Docker Compose

### 1. تحضير الخادم

```bash
# تحديث النظام
sudo apt-get update && sudo apt-get upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# التحقق من التثبيت
docker --version
docker-compose --version
```

### 2. استنساخ المستودع

```bash
cd /opt
sudo git clone https://github.com/omaralafahgane/omar-clinic-pro.git
cd omar-clinic-pro
```

### 3. إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة
cp .env.docker .env

# تحديث البيانات الحساسة
sudo nano .env

# تأكد من تغيير:
# - SECRET_KEY
# - DB_PASSWORD
# - FLASK_ENV=production
```

### 4. بدء التطبيق

```bash
# بناء وتشغيل الحاويات
sudo docker-compose up -d

# التحقق من حالة الخدمات
sudo docker-compose ps

# عرض السجلات
sudo docker-compose logs -f
```

### 5. التحقق من التشغيل

```bash
# فحص صحة الخادم الخلفي
curl http://localhost:5000/api/health

# فحص الواجهة الأمامية
curl http://localhost:5173
```

## النشر على Heroku

### 1. إعداد Heroku

```bash
# تثبيت Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create omar-clinic-pro
```

### 2. إضافة قاعدة البيانات

```bash
# إضافة MySQL
heroku addons:create cleardb:ignite

# الحصول على رابط قاعدة البيانات
heroku config:get CLEARDB_DATABASE_URL
```

### 3. النشر

```bash
# إضافة remote
git remote add heroku https://git.heroku.com/omar-clinic-pro.git

# النشر
git push heroku main

# تطبيق الترحيلات
heroku run flask db upgrade
```

## النشر على AWS

### 1. إعداد EC2

```bash
# إنشاء instance
# - اختر Ubuntu 20.04 LTS
# - حجم: t3.small أو أكبر
# - Security Group: افتح المنافذ 22, 80, 443

# الاتصال بـ Instance
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 2. تثبيت البرامج المطلوبة

```bash
# تحديث النظام
sudo apt-get update && sudo apt-get upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. نشر التطبيق

```bash
# استنساخ المستودع
git clone https://github.com/omaralafahgane/omar-clinic-pro.git
cd omar-clinic-pro

# إعداد البيئة
cp .env.docker .env
nano .env  # تحديث البيانات الحساسة

# بدء التطبيق
docker-compose up -d
```

### 4. إعداد Nginx و SSL

```bash
# تثبيت Nginx
sudo apt-get install nginx -y

# إنشاء ملف الإعدادات
sudo nano /etc/nginx/sites-available/clinic

# إضافة الإعدادات:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/clinic /etc/nginx/sites-enabled/

# اختبار الإعدادات
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# تثبيت SSL (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## النشر على DigitalOcean

### 1. إنشاء Droplet

```bash
# اختر Ubuntu 20.04 LTS
# الحد الأدنى: 2GB RAM, 1 vCPU
```

### 2. الإعداد الأولي

```bash
# الاتصال بـ SSH
ssh root@your-droplet-ip

# إنشاء مستخدم جديد
adduser clinic
usermod -aG sudo clinic

# تبديل المستخدم
su - clinic
```

### 3. تثبيت البرامج

```bash
# تحديث النظام
sudo apt-get update && sudo apt-get upgrade -y

# تثبيت Docker و Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 4. النشر

```bash
# اتبع نفس خطوات AWS أعلاه
```

## المراقبة والصيانة

### عرض السجلات

```bash
# سجلات جميع الخدمات
docker-compose logs

# سجلات خدمة محددة
docker-compose logs backend
docker-compose logs frontend

# سجلات مباشرة
docker-compose logs -f backend
```

### النسخ الاحتياطي

```bash
# نسخ احتياطية لقاعدة البيانات
docker-compose exec mysql mysqldump -u clinic_user -p clinic_db > backup.sql

# استعادة من نسخة احتياطية
docker-compose exec -T mysql mysql -u clinic_user -p clinic_db < backup.sql
```

### التحديثات

```bash
# سحب أحدث التغييرات
git pull origin main

# إعادة بناء الحاويات
docker-compose build

# إعادة تشغيل الخدمات
docker-compose up -d
```

## استكشاف الأخطاء

### الخادم لا يستجيب

```bash
# التحقق من حالة الحاويات
docker-compose ps

# إعادة تشغيل الخدمة
docker-compose restart backend

# عرض السجلات
docker-compose logs backend
```

### مشاكل قاعدة البيانات

```bash
# التحقق من الاتصال
docker-compose exec mysql mysql -u clinic_user -p -e "SELECT 1;"

# إعادة تشغيل MySQL
docker-compose restart mysql
```

### مشاكل الذاكرة

```bash
# عرض استخدام الموارد
docker stats

# تنظيف الحاويات القديمة
docker-compose down
docker system prune -a
```

## الأمان

1. **تغيير كلمات المرور الافتراضية**
2. **استخدام HTTPS**
3. **تفعيل جدران الحماية**
4. **تحديث البرامج بانتظام**
5. **إنشاء نسخ احتياطية منتظمة**
6. **مراقبة السجلات**

---

**آخر تحديث**: يونيو 2026
