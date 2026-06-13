# دليل عملية الاشتراك والتفعيل الكامل
## Omar Clinic Pro - Subscription & Activation Flow

---

## 📋 نظرة عامة

هذا الدليل يشرح العملية الكاملة من زيارة الموقع إلى تفعيل الاشتراك وفتح الميزات.

### الدورة الكاملة:
```
زائر → صفحة التسعير → Shopify Checkout → الدفع → Webhook → تفعيل الاشتراك → البريد الإلكتروني → لوحة التحكم
```

---

## 🔐 الإصلاحات الأمنية المطبقة

### 1. **Super Admin Security (الأمان المحسّن)**

#### المشكلة السابقة:
- الـ middleware كان يستخدم `"super_admin"` لكن قاعدة البيانات تتوقع `"admin"`
- عدم التحقق من صحة قيمة الدور (Role Validation)

#### الحل المطبق:
```typescript
// middleware.ts - السطر 64-68
const validRoles = ["patient", "doctor", "clinic_owner", "admin"];
if (!validRoles.includes(userRole)) {
  console.warn(`Invalid role detected: ${userRole} for user ${userId}`);
  return NextResponse.redirect(new URL("/login", req.url));
}

// السطر 73-83: فحص الدور "admin" بدلاً من "super_admin"
if (PROTECTED_ROUTES.admin.test(pathname)) {
  if (userRole !== "admin") {
    console.warn(`Unauthorized admin access attempt...`);
    return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
  }
  return NextResponse.next();
}
```

**الفوائد:**
- منع محاولات تصعيد الامتيازات
- توافق كامل مع نموذج قاعدة البيانات
- تسجيل محاولات الوصول غير المصرح

---

### 2. **Subscription Enforcement (فرض الاشتراك)**

#### المشكلة السابقة:
- عدم فرض حقيقي لحالة الاشتراك
- السماح بالوصول إلى الميزات بدون اشتراك فعال

#### الحل المطبق:
```typescript
// middleware.ts - السطر 100-128
const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trial";
const isSubscriptionExpired = subscriptionStatus === "expired" || subscriptionStatus === "inactive" || !subscriptionStatus;

// السماح بالوصول إلى صفحات إدارة الاشتراك حتى لو انتهى
const isSubscriptionExemptRoute = SUBSCRIPTION_EXEMPT_ROUTES.some(route => 
  pathname === route || pathname.startsWith(route)
);

if (isSubscriptionExpired && !isSubscriptionExemptRoute) {
  return NextResponse.redirect(new URL("/subscription-expired", req.url));
}

if (!isSubscriptionActive && !isSubscriptionExemptRoute) {
  return NextResponse.redirect(new URL("/dashboard/clinic/subscription", req.url));
}
```

**الفوائد:**
- منع الوصول إلى الميزات بدون اشتراك
- السماح بإدارة الاشتراك حتى عند الانتهاء
- رسائل واضحة للمستخدمين

---

## 🛒 عملية الشراء من Shopify

### الخطوات:

1. **المستخدم يزور صفحة التسعير:**
   ```
   GET /pricing
   ```

2. **المستخدم يختار خطة ويضغط "ابدأ الآن":**
   - يتم إعادة التوجيه إلى Shopify Checkout
   - يتم تمرير معلومات الخطة عبر `note_attributes`:
     ```json
     {
       "clinic_id": "uuid-from-session",
       "plan": "basic|advanced|enterprise"
     }
     ```

3. **المستخدم يكمل الدفع:**
   - يدخل بيانات بطاقته
   - Shopify يعالج الدفع

4. **Shopify يرسل Webhook:**
   ```
   POST /api/webhooks/shopify
   Event: orders/paid
   ```

---

## 🔗 معالج Shopify Webhook

### الملف:
```
app/api/webhooks/shopify/route.ts
```

### الأحداث المدعومة:

#### 1. `orders/paid` - تفعيل الاشتراك
```typescript
async function handleOrderPaid(event: any) {
  // 1. استخراج بيانات الطلب من Shopify
  // 2. البحث عن clinic_id من metadata
  // 3. إنشاء/تحديث الاشتراك في قاعدة البيانات
  // 4. إرسال بريد التفعيل
  // 5. تسجيل النشاط
}
```

#### 2. `orders/created` - تسجيل الطلب
```typescript
async function handleOrderCreated(event: any) {
  // تسجيل الطلب في activity_logs
}
```

#### 3. `subscription_billing_attempts/success` - تجديد الاشتراك
```typescript
async function handleSubscriptionBillingSuccess(event: any) {
  // تحديث تاريخ التجديد
  // تحديث حالة الاشتراك إلى "active"
}
```

### التحقق من التوقيع:
```typescript
function verifyShopifyWebhook(request, body, hmacHeader) {
  const hmac = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");
  
  return hmac === hmacHeader;
}
```

---

## 📧 إشعارات البريد الإلكتروني

### الملف:
```
lib/resend.ts
```

### قالب التفعيل الجديد:
```typescript
subscriptionActivated: (clinicName, plan, amount, startDate, endDate) => ({
  subject: "تم تفعيل اشتراكك بنجاح - Omar Clinic Pro",
  html: `...` // HTML محترف مع تفاصيل الاشتراك
})
```

### الاستخدام:
```typescript
await emailService.sendSubscriptionActivationEmail({
  clinicName: "عيادة الأمل",
  clinicEmail: "clinic@example.com",
  ownerEmail: "owner@example.com",
  ownerName: "أحمد",
  plan: "advanced",
  amount: "299",
  startDate: "2026-06-13",
  endDate: "2026-07-13"
});
```

---

## 🧪 اختبار الدورة الكاملة

### المتطلبات:
- حساب Shopify للاختبار
- مفتاح Resend API
- متغيرات البيئة المطلوبة

### خطوات الاختبار:

#### 1. إعداد متغيرات البيئة:
```bash
# .env.local
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. تشغيل المشروع:
```bash
pnpm dev
```

#### 3. اختبار الوصول بدون اشتراك:
```bash
# 1. تسجيل دخول كمستخدم عادي
# 2. محاولة الوصول إلى /dashboard/clinic
# ✓ يجب أن يتم التوجيه إلى /subscription-expired أو /dashboard/clinic/subscription
```

#### 4. محاكاة webhook من Shopify:
```bash
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "x-shopify-hmac-sha256: $(echo -n '{payload}' | openssl dgst -sha256 -hmac 'secret' -binary | base64)" \
  -d '{
    "type": "orders/paid",
    "data": {
      "object": {
        "id": "12345",
        "total_price": "299.00",
        "currency": "USD",
        "note_attributes": [
          {"name": "clinic_id", "value": "uuid-here"},
          {"name": "plan", "value": "advanced"}
        ],
        "line_items": [
          {"title": "Omar Clinic Pro - Advanced Plan"}
        ]
      }
    }
  }'
```

#### 5. التحقق من النتائج:
```sql
-- التحقق من الاشتراك
SELECT * FROM subscriptions WHERE clinic_id = 'uuid-here';

-- التحقق من السجل
SELECT * FROM activity_logs WHERE clinic_id = 'uuid-here' ORDER BY created_at DESC;
```

#### 6. اختبار الوصول بعد التفعيل:
```bash
# 1. تسجيل دخول بنفس المستخدم
# 2. الوصول إلى /dashboard/clinic
# ✓ يجب أن يكون الوصول مسموحاً
# ✓ يجب أن تكون الميزات متاحة
```

---

## 🔍 التحقق من الأمان

### اختبارات الأمان:

#### 1. منع تصعيد الامتيازات:
```bash
# محاولة الوصول إلى /dashboard/admin بدون دور admin
curl -H "Authorization: Bearer user_token" \
  http://localhost:3000/dashboard/admin
# ✓ يجب أن يتم التوجيه إلى /dashboard/clinic
```

#### 2. منع الوصول بدون اشتراك:
```bash
# محاولة الوصول إلى /dashboard/clinic بدون اشتراك
curl -H "Authorization: Bearer user_token" \
  http://localhost:3000/dashboard/clinic
# ✓ يجب أن يتم التوجيه إلى /subscription-expired
```

#### 3. التحقق من توقيع Webhook:
```bash
# محاولة إرسال webhook بتوقيع خاطئ
curl -X POST http://localhost:3000/api/webhooks/shopify \
  -H "x-shopify-hmac-sha256: invalid_signature" \
  -d '{...}'
# ✓ يجب أن يتم الرفض مع 401
```

---

## 📊 جداول قاعدة البيانات المتعلقة

### جدول `subscriptions`:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  plan VARCHAR(50), -- basic, advanced, enterprise
  status VARCHAR(50), -- active, expired, inactive, trial
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  renewal_date TIMESTAMP,
  auto_renew BOOLEAN,
  price DECIMAL,
  currency VARCHAR(10),
  billing_cycle VARCHAR(50),
  shopify_order_id VARCHAR(255),
  shopify_subscription_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### جدول `activity_logs`:
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID,
  user_id UUID,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP
);
```

---

## 🚀 نشر على الإنتاج

### قبل النشر:

1. **تحديث متغيرات البيئة:**
   ```bash
   SHOPIFY_WEBHOOK_SECRET=prod_secret
   RESEND_API_KEY=prod_key
   ```

2. **تسجيل Webhook في Shopify:**
   - اذهب إلى Shopify Admin
   - Settings → Webhooks
   - أضف webhook جديد:
     - URL: `https://yourdomain.com/api/webhooks/shopify`
     - Events: `orders/paid`, `orders/created`, `subscription_billing_attempts/success`

3. **اختبار في بيئة الإنتاج:**
   ```bash
   # تشغيل اختبار كامل
   pnpm build
   pnpm start
   ```

4. **نشر على Vercel:**
   ```bash
   git push origin main
   # Vercel سيقوم بالنشر تلقائياً
   ```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الاشتراك لم يتم تفعيله

**الحل:**
1. تحقق من logs في Vercel
2. تأكد من أن `SHOPIFY_WEBHOOK_SECRET` صحيح
3. تحقق من أن `clinic_id` موجود في قاعدة البيانات

### المشكلة: البريد الإلكتروني لم يتم إرساله

**الحل:**
1. تأكد من أن `RESEND_API_KEY` صحيح
2. تحقق من أن بريد المالك موجود في قاعدة البيانات
3. تحقق من logs في Resend Dashboard

### المشكلة: المستخدم لا يستطيع الوصول إلى لوحة التحكم

**الحل:**
1. تحقق من أن `subscription_status` في Clerk metadata هو `"active"`
2. تأكد من أن `clinic_id` موجود في Clerk metadata
3. تحقق من أن الاشتراك في قاعدة البيانات

---

## 📝 ملاحظات مهمة

1. **الأمان أولاً:** جميع الـ webhooks يتم التحقق من توقيعها
2. **التسجيل:** جميع العمليات يتم تسجيلها في `activity_logs`
3. **الأتمتة:** الاشتراكات يتم تجديدها تلقائياً
4. **الشفافية:** المستخدمون يتلقون إشعارات واضحة

---

## 📞 الدعم

للمزيد من المعلومات أو الدعم، يرجى التواصل عبر:
- البريد الإلكتروني: support@omarclinicp.com
- الموقع: https://omarclinicp.com

---

**آخر تحديث:** 2026-06-13
**الإصدار:** 2.0.0
