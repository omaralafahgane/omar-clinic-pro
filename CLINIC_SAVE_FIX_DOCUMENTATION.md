# توثيق إصلاح خطأ حفظ العيادة وتكامل Stripe

**التاريخ:** 18 يونيو 2026
**المؤلف:** Manus AI

## 1. المشكلة الأصلية

عند محاولة حفظ بيانات العيادة الجديدة، كان يظهر خطأ "خطأ في الاتصال" دون توفير معلومات تفصيلية عن السبب. كان المستخدم يتوقع التحويل التلقائي لصفحة شراء الاشتراك بعد حفظ البيانات بنجاح.

## 2. الإصلاحات المطبقة

### 2.1. تحسين معالجة الأخطاء في API (`/app/api/clinic-v2/route.ts`)

تم تطبيق التحسينات التالية على نقطة نهاية API:

#### أ. التحقق من صحة البيانات المدخلة
```typescript
// التحقق من صيغة JSON
let body;
try {
  body = await request.json();
} catch (parseError) {
  return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
}

// التحقق من الحقول المطلوبة
if (!name || !email || !phone || !address || !city) {
  return NextResponse.json(
    { error: "Missing required fields: name, email, phone, address, city" },
    { status: 400 }
  );
}
```

#### ب. معالجة أفضل للأخطاء من قاعدة البيانات
- إضافة معالجة صريحة للأخطاء عند جلب بيانات المستخدم
- إضافة معالجة صريحة للأخطاء عند إنشاء أو تحديث العيادة
- إضافة معالجة صريحة للأخطاء عند ربط العيادة بالمستخدم
- رسائل خطأ واضحة تساعد في تشخيص المشكلة

#### ج. معالجة حالات الفشل المختلفة
```typescript
if (userError) {
  console.error("Error fetching user:", userError);
  return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
}

if (error) {
  console.error("Error creating clinic:", error);
  return NextResponse.json({ error: "Failed to create clinic: " + error.message }, { status: 500 });
}
```

### 2.2. تحسين معالجة الأخطاء في الواجهة الأمامية (`/app/dashboard/clinic/settings/page.tsx`)

تم تطبيق التحسينات التالية على صفحة الإعدادات:

#### أ. التحقق من صحة النموذج قبل الإرسال
```typescript
// التحقق من الحقول المطلوبة
if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
  toast.error('يرجى ملء جميع الحقول المطلوبة');
  return;
}

// التحقق من صيغة البريد الإلكتروني
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(formData.email)) {
  toast.error('يرجى إدخال بريد إلكتروني صحيح');
  return;
}
```

#### ب. معالجة أفضل للاستجابات من الخادم
```typescript
if (!response.ok && response.status !== 402) {
  console.error('Server error:', responseData);
  toast.error(responseData.error || 'فشل حفظ البيانات. يرجى المحاولة مرة أخرى');
  return;
}
```

#### ج. رسائل خطأ أكثر وضوحاً
- "خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى"
- "يرجى ملء جميع الحقول المطلوبة"
- "يرجى إدخال بريد إلكتروني صحيح"

## 3. دمج Stripe للاشتراكات

تم إنشاء نظام دفع متكامل باستخدام Stripe يتضمن:

### 3.1. نقطة نهاية إنشاء جلسة Checkout (`/app/api/subscription/create-checkout/route.ts`)

هذه النقطة تتعامل مع:

#### أ. الخطط المتاحة
```typescript
const PLANS = {
  basic: {
    name: 'الخطة الأساسية',
    price: 9900, // 99 SAR
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات الصغيرة',
    features: ['حتى 50 مريض', 'حتى 5 أطباء', 'إدارة المواعيد الأساسية'],
  },
  professional: {
    name: 'الخطة الاحترافية',
    price: 29900, // 299 SAR
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات المتوسطة',
    features: ['حتى 500 مريض', 'حتى 20 طبيب', 'إدارة متقدمة للمواعيد', 'التقارير المتقدمة'],
  },
  enterprise: {
    name: 'الخطة المؤسسية',
    price: 99900, // 999 SAR
    currency: 'sar',
    interval: 'month',
    description: 'مناسبة للعيادات الكبيرة والشبكات',
    features: ['عدد غير محدود من المرضى', 'عدد غير محدود من الأطباء', 'جميع الميزات', 'دعم فني 24/7'],
  },
};
```

#### ب. إنشاء أو استرجاع عميل Stripe
```typescript
// البحث عن عميل موجود أو إنشاء واحد جديد
let customerId: string;
const { data: existingCustomer } = await supabase
  .from('stripe_customers')
  .select('stripe_customer_id')
  .eq('clinic_id', user.clinic_id)
  .maybeSingle();

if (existingCustomer?.stripe_customer_id) {
  customerId = existingCustomer.stripe_customer_id;
} else {
  const customer = await stripe.customers.create({...});
  customerId = customer.id;
  // حفظ معرف العميل في قاعدة البيانات
}
```

#### ج. إنشاء جلسة Checkout
```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [...],
  mode: 'subscription',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clinic/subscription?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clinic/subscription?canceled=true`,
  metadata: {
    clinic_id: user.clinic_id,
    user_id: userId,
    plan_id: planId,
  },
});
```

### 3.2. معالج Webhook من Stripe (`/app/api/webhooks/stripe/route.ts`)

يتعامل مع الأحداث التالية:

| الحدث | الإجراء |
|---|---|
| `checkout.session.completed` | حفظ بيانات الاشتراك في قاعدة البيانات |
| `customer.subscription.created` | تسجيل الاشتراك الجديد |
| `customer.subscription.updated` | تحديث حالة الاشتراك |
| `customer.subscription.deleted` | إلغاء الاشتراك |
| `invoice.payment_succeeded` | تسجيل الدفع الناجح |
| `invoice.payment_failed` | تسجيل الدفع الفاشل |

#### أ. التحقق من توقيع Webhook
```typescript
let event: Stripe.Event;
try {
  event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
} catch (err: any) {
  console.error('Webhook signature verification failed:', err.message);
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
}
```

#### ب. معالجة الأحداث
```typescript
switch (event.type) {
  case 'checkout.session.completed':
    await handleCheckoutSessionCompleted(event.data.object);
    break;
  // ... المزيد من الحالات
}
```

## 4. تدفق العملية الكامل

### الخطوة 1: ملء بيانات العيادة
المستخدم يملأ نموذج إعدادات العيادة ويضغط على "حفظ البيانات واختيار الاشتراك"

### الخطوة 2: التحقق من الصحة
- التحقق من الحقول المطلوبة
- التحقق من صيغة البريد الإلكتروني
- عرض رسائل خطأ واضحة إذا فشل التحقق

### الخطوة 3: إرسال البيانات
- إرسال طلب PATCH إلى `/api/clinic-v2`
- عرض رسالة "جاري حفظ البيانات..."

### الخطوة 4: معالجة الخادم
- التحقق من صحة البيانات
- إنشاء العيادة أو تحديثها
- ربط العيادة بالمستخدم
- التحقق من وجود اشتراك

### الخطوة 5: التحويل للاشتراك
- إذا لم يكن هناك اشتراك، يتم إرجاع `status: 402` مع `requiresPayment: true`
- يتم عرض رسالة نجاح وتحويل المستخدم لصفحة الاشتراك

### الخطوة 6: اختيار الخطة والدفع
- عرض الخطط المتاحة
- اختيار الخطة المناسبة
- الضغط على "ابدأ الاشتراك"
- إعادة التوجيه إلى Stripe Checkout

### الخطوة 7: معالجة الدفع
- المستخدم يدخل بيانات بطاقته
- Stripe يعالج الدفع
- إرسال Webhook إلى `/api/webhooks/stripe`
- حفظ بيانات الاشتراك في قاعدة البيانات
- تحويل المستخدم للصفحة الرئيسية

## 5. متغيرات البيئة المطلوبة

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_... أو sk_test_...
STRIPE_PUBLIC_KEY=pk_live_... أو pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 6. جداول قاعدة البيانات المطلوبة

### جدول `stripe_customers`
```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### جدول `subscriptions` (تحديثات)
```sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
```

## 7. الاختبار

### اختبار محلي
```bash
# تثبيت Stripe CLI
brew install stripe/stripe-cli/stripe

# تسجيل الدخول
stripe login

# الاستماع للـ webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# الحصول على رمز التوقيع
stripe listen --print-secret
```

### اختبار الدفع
- استخدام بطاقة اختبار: `4242 4242 4242 4242`
- تاريخ انتهاء: أي تاريخ مستقبلي (مثل `12/25`)
- CVC: أي رقم (مثل `123`)

## 8. الخطوات التالية

1. **اختبار شامل:** تجربة العملية الكاملة من البداية للنهاية
2. **معالجة الأخطاء المتقدمة:** إضافة معالجة لحالات الفشل المختلفة
3. **إشعارات البريد الإلكتروني:** إرسال إشعارات عند تفعيل الاشتراك
4. **لوحة تحكم الاشتراك:** عرض تفاصيل الاشتراك والفواتير
5. **إدارة الاشتراك:** السماح بتغيير الخطة أو إلغاء الاشتراك

## 9. الملاحظات المهمة

- تأكد من تفعيل Stripe webhooks في لوحة تحكم Stripe
- استخدم متغيرات البيئة الآمنة ولا تضع المفاتيح السرية في الكود
- اختبر جميع سيناريوهات الفشل (فشل الدفع، انقطاع الإنترنت، إلخ)
- راقب سجلات الأخطاء للتأكد من عدم وجود مشاكل غير متوقعة
