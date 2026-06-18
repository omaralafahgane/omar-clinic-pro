# تقرير هجرة نظام الدفع (من Stripe إلى PayPal/Shopify)

**التاريخ:** 18 يونيو 2026
**الحالة:** تم الإنجاز بنجاح

## 1. الإجراءات المتخذة

بناءً على طلبك، تم تنفيذ الإجراءات التالية:

### 1.1. إزالة Stripe بالكامل
- حذف جميع نقاط نهاية API المتعلقة بـ Stripe (`create-checkout`, `webhooks`).
- إزالة جميع مراجع Stripe من واجهة المستخدم (صفحة الاشتراك).
- حذف جميع الملفات والوثائق التي كانت تشير إلى Stripe.

### 1.2. تحديث قاعدة البيانات
- تم إنشاء ملف Migration رقم `008` لإزالة جداول وأعمدة Stripe من قاعدة البيانات لضمان نظافة الهيكلية.

### 1.3. دمج البدائل (PayPal و Shopify)
- **PayPal:** تم إنشاء نقطة نهاية API جديدة لإنشاء طلبات الدفع عبر PayPal.
- **Shopify:** تم إنشاء نقطة نهاية API لإنشاء جلسات الدفع عبر Shopify GraphQL API.
- **واجهة المستخدم:** تم تحديث صفحة الاشتراك لتقديم خيارين للدفع (PayPal و Shopify) لكل خطة.

## 2. كيفية التفعيل (متغيرات البيئة)

لضمان عمل الأنظمة الجديدة، يرجى إضافة المتغيرات التالية في Vercel:

### لـ PayPal:
- `PAYPAL_CLIENT_ID`: معرف العميل من PayPal Developer Portal.
- `PAYPAL_CLIENT_SECRET`: السر الخاص بالعميل.
- `PAYPAL_API_BASE`: `https://api-m.paypal.com` (للإنتاج) أو `https://api-m.sandbox.paypal.com` (للاختبار).

### لـ Shopify:
- `SHOPIFY_STORE_NAME`: اسم متجرك على Shopify.
- `SHOPIFY_ACCESS_TOKEN`: مفتاح الوصول لـ Admin API.
- `SHOPIFY_BASIC_PLAN_ID`: معرف المنتج للخطة الأساسية.
- `SHOPIFY_PROFESSIONAL_PLAN_ID`: معرف المنتج للخطة الاحترافية.
- `SHOPIFY_ENTERPRISE_PLAN_ID`: معرف المنتج للخطة المؤسسية.

## 3. الروابط المحدثة

- **المستودع:** [https://github.com/omaralafahgane/omar-clinic-pro](https://github.com/omaralafahgane/omar-clinic-pro)
- **النشر:** [https://omar-clinic-eo9cdbecd.vercel.app](https://omar-clinic-eo9cdbecd.vercel.app)

## 4. الخلاصة

المشروع الآن خالٍ تماماً من Stripe وجاهز لاستقبال المدفوعات عبر PayPal أو Shopify. تم رفع التغييرات وهي الآن قيد النشر التلقائي على Vercel.
