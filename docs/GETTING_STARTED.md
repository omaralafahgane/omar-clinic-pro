# البدء السريع - Omar Clinic Pro

دليل شامل للبدء مع نظام إدارة العيادة الطبية.

## المتطلبات

### النظام
- **Node.js**: 16.0 أو أحدث
- **Python**: 3.8 أو أحدث
- **npm** أو **yarn**: لإدارة الحزم
- **Git**: لإدارة الإصدارات

### قاعدة البيانات
- **MySQL**: 5.7 أو أحدث
- **PostgreSQL**: 12 أو أحدث (اختياري)

## التثبيت

### 1. استنساخ المستودع

```bash
git clone https://github.com/omaralafahgane/omar-clinic-pro.git
cd omar-clinic-pro
```

### 2. إعداد الخادم الخلفي (Backend)

```bash
# الانتقال إلى مجلد الخادم
cd backend

# إنشاء بيئة افتراضية (اختياري)
python -m venv venv
source venv/bin/activate  # على Linux/Mac
# أو
venv\Scripts\activate  # على Windows

# تثبيت الاعتماديات
pip install -r requirements.txt

# نسخ ملف البيئة
cp .env.example .env

# تحديث ملف .env بإعدادات قاعدة البيانات الخاصة بك
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/clinic_db
```

### 3. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
mysql -u root -p -e "CREATE DATABASE clinic_db;"

# تطبيق Schema
mysql -u root -p clinic_db < ../database/schema.sql

# إدراج البيانات التجريبية (اختياري)
mysql -u root -p clinic_db < ../database/seed.sql
```

### 4. تشغيل الخادم الخلفي

```bash
# من مجلد backend
python app.py
```

سيكون الخادم متاحاً على: `http://localhost:5000`

### 5. إعداد الواجهة الأمامية (Frontend)

```bash
# الانتقال إلى مجلد الواجهة
cd frontend

# تثبيت الاعتماديات
npm install
# أو
yarn install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل خادم التطوير
npm run dev
# أو
yarn dev
```

ستكون الواجهة متاحة على: `http://localhost:5173`

## الاستخدام

### الوصول إلى التطبيق

1. افتح المتصفح
2. اذهب إلى `http://localhost:5173`
3. ستجد لوحة التحكم الرئيسية

### الميزات الأساسية

#### إدارة المرضى
- عرض جميع المرضى
- إضافة مريض جديد
- تحديث بيانات المريض
- حذف المريض
- البحث والتصفية

#### إدارة الأطباء
- عرض جميع الأطباء
- إضافة طبيب جديد
- تحديث بيانات الطبيب
- حذف الطبيب
- البحث حسب التخصص

#### إدارة المواعيد
- عرض جميع المواعيد
- حجز موعد جديد
- تحديث حالة الموعد
- حذف الموعد
- تصفية حسب الحالة

## الأوامر المفيدة

### الخادم الخلفي

```bash
# تهيئة قاعدة البيانات
flask db init

# إنشاء جداول جديدة
flask db migrate

# تطبيق التغييرات
flask db upgrade

# ملء البيانات التجريبية
flask seed-db

# تشغيل الاختبارات
pytest

# فحص جودة الكود
flake8 app.py
```

### الواجهة الأمامية

```bash
# بناء للإنتاج
npm run build

# معاينة الإصدار المبني
npm run preview

# فحص الأخطاء
npm run lint

# التحقق من الأنواع
npm run type-check
```

## استكشاف الأخطاء

### الخادم لا يعمل

```bash
# تحقق من أن المنفذ 5000 غير مستخدم
lsof -i :5000

# إذا كان مستخدماً، اقتل العملية
kill -9 <PID>
```

### الواجهة لا تتصل بالخادم

1. تأكد من أن الخادم يعمل على `http://localhost:5000`
2. تحقق من ملف `.env` في مجلد frontend
3. تأكد من أن `VITE_API_URL` صحيح

### مشاكل قاعدة البيانات

```bash
# تحقق من اتصال MySQL
mysql -u root -p -e "SELECT 1;"

# تحقق من وجود قاعدة البيانات
mysql -u root -p -e "SHOW DATABASES;"

# أعد تعيين قاعدة البيانات
mysql -u root -p -e "DROP DATABASE clinic_db; CREATE DATABASE clinic_db;"
```

## الخطوات التالية

1. **التخصيص**: عدّل الألوان والشعار والإعدادات
2. **الأمان**: غيّر مفاتيح السر والرموز
3. **الاختبار**: أضف اختبارات شاملة
4. **النشر**: انشر على خادم الإنتاج

## الموارد الإضافية

- [توثيق API](./API.md)
- [معمارية النظام](./ARCHITECTURE.md)
- [دليل المساهمة](../CONTRIBUTING.md)

## الدعم

للحصول على الدعم، يرجى:
1. فتح Issue في المستودع
2. التواصل عبر البريد الإلكتروني
3. مراجعة التوثيق

---

**آخر تحديث**: يونيو 2026
