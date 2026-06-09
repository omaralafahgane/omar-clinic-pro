# Omar Clinic Pro - API Documentation

## نظرة عامة

API متكامل لنظام إدارة العيادة الطبية يوفر جميع العمليات الأساسية لإدارة المرضى والأطباء والمواعيد.

## Base URL

```
http://localhost:5000/api
```

## Authentication

جميع الطلبات تتطلب رمز JWT في رأس الطلب:

```
Authorization: Bearer <token>
```

## Endpoints

### المرضى (Patients)

#### الحصول على جميع المرضى
```http
GET /patients
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "أحمد",
      "last_name": "محمد",
      "email": "ahmad@example.com",
      "phone": "+966501234567",
      "date_of_birth": "1990-01-15",
      "gender": "M",
      "address": "شارع النيل",
      "city": "الرياض",
      "country": "السعودية",
      "created_at": "2026-06-09T10:00:00",
      "updated_at": "2026-06-09T10:00:00"
    }
  ],
  "count": 1
}
```

#### الحصول على مريض محدد
```http
GET /patients/{id}
```

#### إنشاء مريض جديد
```http
POST /patients
Content-Type: application/json

{
  "first_name": "أحمد",
  "last_name": "محمد",
  "email": "ahmad@example.com",
  "phone": "+966501234567",
  "date_of_birth": "1990-01-15",
  "gender": "M",
  "address": "شارع النيل",
  "city": "الرياض",
  "country": "السعودية"
}
```

#### تحديث مريض
```http
PUT /patients/{id}
Content-Type: application/json

{
  "first_name": "أحمد",
  "phone": "+966509876543"
}
```

#### حذف مريض
```http
DELETE /patients/{id}
```

### الأطباء (Doctors)

#### الحصول على جميع الأطباء
```http
GET /doctors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "محمد",
      "last_name": "حسن",
      "email": "dr.hassan@example.com",
      "phone": "+966555555555",
      "specialization": "طب عام",
      "license_number": "LIC001",
      "is_active": true,
      "created_at": "2026-06-09T10:00:00",
      "updated_at": "2026-06-09T10:00:00"
    }
  ],
  "count": 1
}
```

#### الحصول على طبيب محدد
```http
GET /doctors/{id}
```

#### إنشاء طبيب جديد
```http
POST /doctors
Content-Type: application/json

{
  "first_name": "محمد",
  "last_name": "حسن",
  "email": "dr.hassan@example.com",
  "phone": "+966555555555",
  "specialization": "طب عام",
  "license_number": "LIC001"
}
```

#### تحديث طبيب
```http
PUT /doctors/{id}
Content-Type: application/json

{
  "specialization": "جراحة"
}
```

#### حذف طبيب
```http
DELETE /doctors/{id}
```

### المواعيد (Appointments)

#### الحصول على جميع المواعيد
```http
GET /appointments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "doctor_id": 1,
      "appointment_date": "2026-06-10T09:00:00",
      "reason": "فحص عام",
      "status": "scheduled",
      "notes": "ملاحظات",
      "created_at": "2026-06-09T10:00:00",
      "updated_at": "2026-06-09T10:00:00"
    }
  ],
  "count": 1
}
```

#### الحصول على موعد محدد
```http
GET /appointments/{id}
```

#### إنشاء موعد جديد
```http
POST /appointments
Content-Type: application/json

{
  "patient_id": 1,
  "doctor_id": 1,
  "appointment_date": "2026-06-10T09:00:00",
  "reason": "فحص عام",
  "notes": "ملاحظات"
}
```

#### تحديث موعد
```http
PUT /appointments/{id}
Content-Type: application/json

{
  "status": "completed",
  "notes": "تم الفحص بنجاح"
}
```

#### حذف موعد
```http
DELETE /appointments/{id}
```

### فحص الصحة (Health Check)

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Omar Clinic Pro API",
  "version": "1.0.0",
  "timestamp": "2026-06-09T10:00:00"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- الحد الأقصى: 1000 طلب/ساعة
- سيتم إرجاع رمز 429 عند تجاوز الحد

## Pagination

استخدم معاملات الاستعلام للترقيم:

```
GET /patients?page=1&limit=20
```

## Sorting

استخدم معاملات الاستعلام للترتيب:

```
GET /patients?sort=created_at&order=desc
```

## Filtering

استخدم معاملات الاستعلام للتصفية:

```
GET /appointments?status=scheduled&doctor_id=1
```

---

**آخر تحديث**: يونيو 2026
