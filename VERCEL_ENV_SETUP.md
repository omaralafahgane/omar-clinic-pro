# إعداد متغيرات البيئة في Vercel

## خطوات إضافة المتغيرات في Vercel

### 1. الوصول إلى إعدادات المشروع
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع **omar-clinic-pro**
3. اضغط على **Settings** (الإعدادات)
4. اختر **Environment Variables** من القائمة الجانبية

### 2. إضافة متغيرات PayPal

أضف المتغيرات التالية:

| المتغير | القيمة | الملاحظات |
|---------|--------|----------|
| `PAYPAL_CLIENT_ID` | `[أدخل معرف العميل من PayPal]` | معرف العميل من PayPal |
| `PAYPAL_CLIENT_SECRET` | `[أدخل السر الخاص بك هنا]` | السر الخاص بـ PayPal (من Dashboard) |
| `PAYPAL_API_BASE` | `https://api-m.sandbox.paypal.com` | للاختبار - استخدم `https://api-m.paypal.com` للإنتاج |

### 3. إضافة متغيرات Shopify

أضف المتغيرات التالية:

| المتغير | القيمة | الملاحظات |
|---------|--------|----------|
| `SHOPIFY_STORE_NAME` | `my-store-name` | اسم متجرك على Shopify |
| `SHOPIFY_ACCESS_TOKEN` | `[أدخل مفتاح الوصول من Shopify]` | مفتاح الوصول للـ Admin API |
| `SHOPIFY_BASIC_PLAN_ID` | `gid://shopify/ProductVariant/47924753727653` | معرف الخطة الأساسية |
| `SHOPIFY_PROFESSIONAL_PLAN_ID` | `gid://shopify/ProductVariant/47924756742309` | معرف الخطة الاحترافية |
| `SHOPIFY_ENTERPRISE_PLAN_ID` | `gid://shopify/ProductVariant/47924757528741` | معرف الخطة المؤسسية |

### 4. خطوات الإضافة في Vercel

لكل متغير:
1. اضغط على **Add New**
2. أدخل اسم المتغير في حقل **Name**
3. أدخل القيمة في حقل **Value**
4. اختر الـ **Environments** (Production, Preview, Development) أو اتركها على الافتراضي
5. اضغط **Save**

## التحقق من الإعدادات

بعد إضافة جميع المتغيرات:

1. قم بـ **Redeploy** المشروع:
   - اذهب إلى **Deployments**
   - اختر آخر deployment
   - اضغط على **Redeploy**

2. تحقق من السجلات:
   - اذهب إلى **Logs** (السجلات)
   - تأكد من عدم وجود أخطاء متعلقة بـ PayPal أو Shopify

## اختبار نظام الدفع

### اختبار PayPal:
1. اذهب إلى صفحة الاشتراك
2. اختر خطة
3. اضغط على **Pay with PayPal**
4. استخدم حساب PayPal اختبار (Sandbox)

### اختبار Shopify:
1. اذهب إلى صفحة الاشتراك
2. اختر خطة
3. اضغط على **Pay with Shopify**
4. ستنتقل إلى متجرك على Shopify

## استكشاف الأخطاء

### خطأ: "PayPal configuration missing"
- تأكد من إضافة `PAYPAL_CLIENT_ID` و `PAYPAL_CLIENT_SECRET` في Vercel
- تأكد من تفعيل المتغيرات للبيئة الحالية

### خطأ: "Shopify configuration missing"
- تأكد من إضافة `SHOPIFY_STORE_NAME` و `SHOPIFY_ACCESS_TOKEN` في Vercel
- تأكد من صحة اسم المتجر (بدون `myshopify.com`)

### خطأ: "Invalid plan"
- تأكد من أن معرفات الخطط صحيحة في Vercel
- تأكد من أن المنتجات موجودة في متجرك على Shopify

## الروابط المهمة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [PayPal Developer](https://developer.paypal.com/dashboard)
- [Shopify Admin](https://my-store-name.myshopify.com/admin)
- [المستودع](https://github.com/omaralafahgane/omar-clinic-pro)

## ملاحظات أمنية

⚠️ **تحذير:** لا تضع المفاتيح السرية في الكود أو في ملفات `.env` المحلية التي يتم رفعها إلى GitHub. استخدم فقط متغيرات البيئة في Vercel.

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من السجلات في Vercel
2. تأكد من صحة المفاتيح
3. تأكد من أن الحسابات نشطة (PayPal و Shopify)
