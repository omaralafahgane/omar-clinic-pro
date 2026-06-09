# معمارية النظام - Omar Clinic Pro

## نظرة عامة

Omar Clinic Pro هو نظام متكامل لإدارة العيادات الطبية مبني على معمارية حديثة وقابلة للتوسع.

## الهيكل العام

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Tailwind CSS                   │   │
│  │  - Dashboard                                         │   │
│  │  - Patient Management                               │   │
│  │  - Doctor Management                                │   │
│  │  - Appointment Scheduling                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  REST API with JWT Authentication                   │   │
│  │  - CORS Configuration                               │   │
│  │  - Error Handling                                   │   │
│  │  - Request Validation                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Flask + SQLAlchemy                                 │   │
│  │  - Business Logic                                   │   │
│  │  - Data Validation                                  │   │
│  │  - Authentication & Authorization                  │   │
│  │  - File Management                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MySQL Database                                     │   │
│  │  - Patients Table                                   │   │
│  │  - Doctors Table                                    │   │
│  │  - Appointments Table                              │   │
│  │  - Medical Records Table                           │   │
│  │  - Invoices Table                                  │   │
│  │  - Users Table                                     │   │
│  │  - Audit Logs Table                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## المكونات الرئيسية

### 1. Frontend (الواجهة الأمامية)

**التقنيات:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Axios
- React Router

**المميزات:**
- واجهة مستخدم حديثة وسريعة الاستجابة
- تصميم متجاوب (Responsive)
- إدارة الحالة مع Zustand
- معالجة الأخطاء والإخطارات
- دعم اللغة العربية (RTL)

**المجلدات:**
```
frontend/
├── src/
│   ├── components/     # مكونات React
│   ├── pages/         # الصفحات الرئيسية
│   ├── services/      # خدمات API
│   ├── hooks/         # Hooks مخصصة
│   ├── types/         # أنواع TypeScript
│   ├── utils/         # دوال مساعدة
│   └── styles/        # أنماط CSS
├── index.html
├── package.json
└── vite.config.ts
```

### 2. Backend (الخادم الخلفي)

**التقنيات:**
- Flask
- SQLAlchemy ORM
- PyJWT للمصادقة
- Marshmallow للتحقق
- MySQL

**المميزات:**
- REST API متكامل
- مصادقة آمنة بـ JWT
- معالجة الأخطاء الشاملة
- تسجيل العمليات (Logging)
- دعم CORS

**المجلدات:**
```
backend/
├── app.py             # التطبيق الرئيسي
├── models/            # نماذج قاعدة البيانات
├── routes/            # مسارات API
├── services/          # خدمات الأعمال
├── utils/             # دوال مساعدة
├── requirements.txt   # الاعتماديات
└── Dockerfile
```

### 3. Database (قاعدة البيانات)

**الجداول الرئيسية:**

#### Patients
```sql
- id (PK)
- first_name, last_name
- email (UNIQUE)
- phone
- date_of_birth
- gender
- address, city, country
- timestamps
```

#### Doctors
```sql
- id (PK)
- first_name, last_name
- email (UNIQUE)
- phone
- specialization
- license_number (UNIQUE)
- is_active
- timestamps
```

#### Appointments
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- appointment_date
- reason
- status (scheduled/completed/cancelled)
- notes
- timestamps
```

#### Medical Records
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- appointment_id (FK)
- diagnosis
- treatment
- prescription
- notes
- timestamps
```

#### Invoices
```sql
- id (PK)
- patient_id (FK)
- appointment_id (FK)
- invoice_number (UNIQUE)
- amount, tax_amount, total_amount
- status (pending/paid)
- payment_date, payment_method
- timestamps
```

#### Users
```sql
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- role (admin/doctor/staff)
- is_active
- timestamps
```

## تدفق البيانات

### 1. تسجيل مريض جديد

```
User Input (Frontend)
    ↓
Form Validation (Frontend)
    ↓
POST /api/patients (Axios)
    ↓
Request Validation (Backend)
    ↓
Business Logic
    ↓
Database Insert
    ↓
Response with Patient ID
    ↓
Update UI (Frontend)
```

### 2. حجز موعد

```
Select Patient & Doctor (Frontend)
    ↓
Choose Date & Time
    ↓
POST /api/appointments (Axios)
    ↓
Check Doctor Availability
    ↓
Create Appointment
    ↓
Generate Invoice
    ↓
Send Notification
    ↓
Update Calendar (Frontend)
```

## معايير الأمان

### Authentication
- JWT Tokens
- Token Expiration
- Refresh Tokens

### Authorization
- Role-Based Access Control (RBAC)
- Permission Checking
- Resource Ownership Verification

### Data Protection
- Password Hashing (bcrypt)
- SQL Injection Prevention
- XSS Protection
- CSRF Protection

### API Security
- Rate Limiting
- Input Validation
- Output Encoding
- HTTPS/TLS

## الأداء والتوسعية

### Caching
- Browser Caching
- Server-Side Caching
- Database Query Optimization

### Database Optimization
- Indexed Columns
- Query Optimization
- Connection Pooling

### Frontend Optimization
- Code Splitting
- Lazy Loading
- Image Optimization
- Minification

## المراقبة والتسجيل

### Logging Levels
- DEBUG: معلومات تفصيلية
- INFO: معلومات عامة
- WARNING: تحذيرات
- ERROR: أخطاء
- CRITICAL: أخطاء حرجة

### Metrics
- API Response Time
- Database Query Time
- Error Rate
- User Activity

## النشر والإنتاج

### Docker Containers
- Frontend Container
- Backend Container
- MySQL Container
- Nginx Container (Optional)

### Environment Separation
- Development
- Staging
- Production

### CI/CD Pipeline
- Automated Testing
- Code Quality Checks
- Security Scanning
- Automated Deployment

## التوسعات المستقبلية

1. **Mobile App**: تطبيق جوال iOS و Android
2. **Advanced Analytics**: تحليلات متقدمة وتقارير
3. **Telemedicine**: استشارات عن بعد
4. **Prescription Management**: إدارة الوصفات الطبية
5. **Inventory Management**: إدارة المخزون
6. **Billing Integration**: تكامل مع بوابات الدفع
7. **Multi-language Support**: دعم لغات متعددة
8. **Advanced Notifications**: إخطارات متقدمة (SMS, Email, Push)

---

**آخر تحديث**: يونيو 2026
