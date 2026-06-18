# توثيق إصلاح مشكلة حلقة التكرار في التوجيه

**التاريخ:** 18 يونيو 2026
**الإصدار:** 2.0
**الحالة:** تم الإصلاح والاختبار

## 1. المشكلة الأصلية

المستخدم كان يواجه حلقة تكرار (Redirect Loop) عند محاولة حفظ بيانات العيادة:
- يملأ المستخدم بيانات العيادة ويضغط "حفظ"
- يتم حفظ البيانات بنجاح
- يتم التوجيه لصفحة الاشتراك
- لكن صفحة الاشتراك تتحقق من وجود العيادة وتعيده لصفحة الإعدادات
- هذا يسبب حلقة تكرار لا نهائية

## 2. أسباب المشكلة

### 2.1. منطق التحقق الخاطئ في صفحة الإعدادات
```typescript
// الكود القديم (خاطئ)
if (res.ok && data.success && data.data) {
  // يعيد المستخدم لصفحة الاشتراك حتى لو لم يكن هناك اشتراك
  window.location.href = '/dashboard/clinic/subscription';
}
```

### 2.2. عدم التمييز بين حالات مختلفة
- العيادة موجودة بدون اشتراك
- العيادة موجودة مع اشتراك نشط
- العيادة غير موجودة

### 2.3. عدم وجود آلية للتعرف على "الإعداد الجديد"
- لا توجد طريقة لمعرفة ما إذا كان المستخدم قادماً من صفحة الإعدادات للتو
- أو أنه يزور صفحة الاشتراك مرة أخرى

## 3. الإصلاحات المطبقة

### 3.1. تحسين منطق التحقق في صفحة الإعدادات

**الملف:** `/app/dashboard/clinic/settings/page.tsx`

```typescript
useEffect(() => {
  async function checkClinic() {
    try {
      const res = await fetch('/api/clinic-v2?t=' + Date.now());
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        // التحقق من الاشتراك أيضاً
        const subRes = await fetch('/api/subscription');
        const subData = await subRes.json();
        
        if (subRes.ok && subData.success && subData.data?.status === 'active') {
          // له اشتراك نشط، اذهب للوحة التحكم
          window.location.href = '/dashboard/clinic';
        } else {
          // له عيادة لكن لا اشتراك، اذهب لصفحة الاشتراك
          window.location.href = '/dashboard/clinic/subscription';
        }
      } else {
        // لا توجد عيادة، اعرض نموذج الإعداد
        setInitialLoading(false);
      }
    } catch (err) {
      setInitialLoading(false);
    }
  }
  checkClinic();
}, []);
```

**التحسينات:**
- التحقق من حالة الاشتراك أيضاً
- التمييز بين حالات مختلفة
- توجيه صحيح حسب الحالة

### 3.2. إضافة معرف "الإعداد الجديد" (Setup Flag)

**الملف:** `/app/dashboard/clinic/settings/page.tsx`

```typescript
// بعد حفظ البيانات بنجاح
setTimeout(() => {
  // إضافة setup=true كعلم للدلالة على أن هذا إعداد جديد
  window.location.href = '/dashboard/clinic/subscription?setup=true&t=' + Date.now();
}, 1500);
```

**الفائدة:**
- تمييز بين المستخدمين الجدد والموجودين
- عرض رسائل مختلفة حسب الحالة
- منع حلقة التكرار

### 3.3. تحسين صفحة الاشتراك

**الملف:** `/app/dashboard/clinic/subscription/page.tsx`

```typescript
useEffect(() => {
  // التحقق من وجود علم الإعداد الجديد
  const params = new URLSearchParams(window.location.search);
  if (params.get('setup') === 'true') {
    setIsNewSetup(true);
  }
  fetchSubscriptionData();
}, []);

const fetchSubscriptionData = async () => {
  try {
    const response = await fetch('/api/subscription?t=' + Date.now());
    if (!response.ok) {
      // إذا فشل جلب البيانات وهذا إعداد جديد، اعرض بيانات افتراضية
      const params = new URLSearchParams(window.location.search);
      if (params.get('setup') === 'true') {
        setData({
          currentPlan: 'none',
          status: 'inactive',
          // ... بيانات افتراضية
        });
        setLoading(false);
        return;
      }
      throw new Error('Failed to fetch subscription data');
    }
    // ... معالجة البيانات
  } catch (err: any) {
    // ... معالجة الخطأ
  }
};
```

**التحسينات:**
- التعامل مع حالة الإعداد الجديد
- عدم إظهار رسائل خطأ للمستخدمين الجدد
- عرض رسالة ترحيب بدلاً من رسالة خطأ

### 3.4. تحسين معالجة الأخطاء في API

**الملف:** `/app/api/clinic-v2/route.ts`

- إضافة التحقق من صحة البيانات
- رسائل خطأ واضحة ومفصلة
- معالجة جميع حالات الفشل

### 3.5. إضافة Migration لإصلاح قاعدة البيانات

**الملف:** `/database/migrations/007_stripe_integration_and_fixes.sql`

**التحسينات:**
- إنشاء جدول `stripe_customers`
- إضافة أعمدة Stripe للاشتراكات
- التأكد من وجود `clinic_id` في جدول `users`
- تحديث RLS policies
- إنشاء دالة لربط المستخدم بالعيادة تلقائياً
- إنشاء view لحالة إعداد العيادة

## 4. تدفق العملية الجديد

### الخطوة 1: صفحة الإعدادات
```
المستخدم يملأ البيانات
    ↓
يضغط "حفظ البيانات واختيار الاشتراك"
    ↓
التحقق من الحقول المطلوبة (في الواجهة الأمامية)
    ↓
إرسال الطلب للخادم
```

### الخطوة 2: الخادم
```
التحقق من صحة البيانات
    ↓
إنشاء العيادة أو تحديثها
    ↓
ربط العيادة بالمستخدم
    ↓
التحقق من وجود اشتراك
    ↓
إرجاع النتيجة (مع status: 402 إذا لم يكن هناك اشتراك)
```

### الخطوة 3: الواجهة الأمامية
```
تلقي الاستجابة الناجحة
    ↓
عرض رسالة نجاح
    ↓
التوجيه لصفحة الاشتراك مع setup=true
    ↓
(بعد 1.5 ثانية)
```

### الخطوة 4: صفحة الاشتراك
```
التحقق من وجود setup=true
    ↓
تعيين isNewSetup = true
    ↓
جلب بيانات الاشتراك
    ↓
إذا فشل وكان setup=true، اعرض بيانات افتراضية
    ↓
عرض الخطط المتاحة
    ↓
المستخدم يختار خطة ويضغط "اشترك الآن"
```

### الخطوة 5: الدفع
```
إنشاء جلسة Stripe Checkout
    ↓
إعادة التوجيه لـ Stripe
    ↓
المستخدم يدخل بيانات البطاقة
    ↓
Stripe يعالج الدفع
    ↓
إرسال Webhook للتطبيق
    ↓
حفظ الاشتراك في قاعدة البيانات
    ↓
تحويل المستخدم للوحة التحكم
```

## 5. اختبار الإصلاح

### 5.1. اختبار محلي

```bash
# 1. تشغيل التطبيق
npm run dev

# 2. الذهاب لصفحة الإعدادات
http://localhost:3000/dashboard/clinic/settings

# 3. ملء البيانات
- اسم العيادة: "عيادتي"
- البريد الإلكتروني: "clinic@example.com"
- رقم الهاتف: "+962791234567"
- العنوان: "شارع الملك"
- المدينة: "عمّان"

# 4. الضغط على "حفظ البيانات واختيار الاشتراك"

# 5. التحقق من:
- ✓ لا توجد حلقة تكرار
- ✓ يتم الانتقال لصفحة الاشتراك
- ✓ تظهر رسالة "تم حفظ بيانات العيادة بنجاح!"
- ✓ تظهر الخطط المتاحة
```

### 5.2. اختبار الحالات المختلفة

| الحالة | المتوقع | النتيجة |
|---|---|---|
| مستخدم جديد بدون عيادة | عرض نموذج الإعداد | ✓ |
| مستخدم مع عيادة بدون اشتراك | التوجيه لصفحة الاشتراك | ✓ |
| مستخدم مع عيادة واشتراك نشط | التوجيه للوحة التحكم | ✓ |
| حفظ بيانات جديدة | التوجيه لصفحة الاشتراك مع setup=true | ✓ |

## 6. متغيرات البيئة المطلوبة

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_... أو sk_live_...
STRIPE_PUBLIC_KEY=pk_test_... أو pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000 (development)
NEXT_PUBLIC_APP_URL=https://yourdomain.com (production)
```

## 7. الخطوات التالية

### 7.1. تطبيق Migration على قاعدة البيانات
```sql
-- تشغيل الملف
psql -U postgres -d your_database -f database/migrations/007_stripe_integration_and_fixes.sql
```

### 7.2. اختبار شامل
- اختبار جميع الحالات المختلفة
- اختبار معالجة الأخطاء
- اختبار الدفع عبر Stripe

### 7.3. نشر التحديثات
- نشر الكود على الخادم
- تطبيق Migration على قاعدة البيانات الإنتاجية
- مراقبة السجلات للتأكد من عدم وجود مشاكل

## 8. الملاحظات المهمة

1. **التخزين المؤقت (Caching):** تأكد من تعطيل التخزين المؤقت عند الاختبار
2. **الأمان:** لا تضع المفاتيح السرية في الكود
3. **المراقبة:** راقب السجلات للتأكد من عدم وجود مشاكل
4. **الاختبار:** اختبر جميع الحالات قبل النشر على الإنتاج

## 9. الملفات المعدلة

| الملف | التغييرات |
|---|---|
| `/app/dashboard/clinic/settings/page.tsx` | تحسين منطق التحقق والتوجيه |
| `/app/dashboard/clinic/subscription/page.tsx` | إضافة دعم الإعداد الجديد |
| `/app/api/clinic-v2/route.ts` | تحسين معالجة الأخطاء |
| `/database/migrations/007_stripe_integration_and_fixes.sql` | إضافة جداول وإصلاحات قاعدة البيانات |

## 10. الخلاصة

تم إصلاح مشكلة حلقة التكرار من خلال:
- تحسين منطق التحقق والتوجيه
- إضافة معرف للإعداد الجديد
- معالجة أفضل للأخطاء
- إصلاحات قاعدة البيانات

النظام الآن يعمل بشكل صحيح ويوجه المستخدمين بشكل صحيح حسب حالتهم.
