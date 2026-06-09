# دليل المساهمة - Omar Clinic Pro

شكراً لاهتمامك بالمساهمة في مشروع Omar Clinic Pro! هذا الدليل سيساعدك على البدء.

## قواعد السلوك

نحن ملتزمون بتوفير بيئة ترحيبية وآمنة للجميع. يرجى:
- احترام جميع المساهمين
- عدم التسامح مع التحرش أو التمييز
- التركيز على ما هو أفضل للمجتمع

## كيفية المساهمة

### الإبلاغ عن الأخطاء

1. تحقق من أن الخطأ لم يتم الإبلاغ عنه بالفعل
2. افتح Issue جديد
3. صف الخطأ بوضوح مع خطوات إعادة الإنتاج
4. أضف لقطات شاشة إن أمكن

### اقتراح ميزات جديدة

1. افتح Issue جديد بعنوان واضح
2. صف الميزة المقترحة بالتفصيل
3. اشرح الفائدة والحالات الاستخدام
4. ناقش الحل الممكن

### إرسال Pull Requests

1. **Fork المستودع**
   ```bash
   git clone https://github.com/your-username/omar-clinic-pro.git
   ```

2. **أنشئ فرعاً للميزة**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **قم بالتغييرات**
   - اتبع معايير الكود الموجودة
   - أضف تعليقات واضحة
   - اختبر التغييرات

4. **Commit التغييرات**
   ```bash
   git commit -m "feat: Add new feature description"
   ```

5. **Push إلى الفرع**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **افتح Pull Request**
   - اشرح التغييرات بوضوح
   - أرفق أي Issues ذات صلة
   - انتظر المراجعة

## معايير الكود

### Python (Backend)

```python
# استخدم PEP 8
def function_name(parameter):
    """وصف الدالة"""
    return result

# استخدم type hints
def add_numbers(a: int, b: int) -> int:
    return a + b
```

### TypeScript/React (Frontend)

```typescript
// استخدم const بدلاً من let
const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>
}

// استخدم interfaces للأنواع
interface User {
  id: number
  name: string
}
```

## رسائل Commit

استخدم الصيغة التالية:

```
<type>: <subject>

<body>

<footer>
```

### الأنواع
- **feat**: ميزة جديدة
- **fix**: إصلاح خطأ
- **docs**: تحديثات التوثيق
- **style**: تنسيق الكود
- **refactor**: إعادة هيكلة الكود
- **test**: إضافة اختبارات
- **chore**: مهام صيانة

### أمثلة

```
feat: Add patient search functionality

Add search bar to patients page with real-time filtering
by name, email, and phone number.

Closes #123
```

```
fix: Correct appointment date validation

Fix bug where past dates were allowed when booking
new appointments.

Fixes #456
```

## الاختبار

### Backend

```bash
cd backend
pytest
pytest --cov=app  # مع تغطية الكود
```

### Frontend

```bash
cd frontend
npm test
npm run lint
npm run type-check
```

## التوثيق

- حدّث `README.md` إذا كانت هناك تغييرات في الإعداد
- أضف تعليقات للكود المعقد
- حدّث التوثيق في مجلد `docs/`

## عملية المراجعة

1. يقوم المحافظ بمراجعة PR
2. قد يطلب تغييرات
3. بعد الموافقة، يتم دمج PR
4. شكراً لمساهمتك!

## الترخيص

بالمساهمة، فإنك توافق على أن تكون مساهماتك مرخصة تحت MIT License.

## الأسئلة؟

- افتح Issue للأسئلة
- تواصل مع المحافظين
- راجع التوثيق الموجودة

---

شكراً مرة أخرى على مساهمتك! 🎉

**آخر تحديث**: يونيو 2026
