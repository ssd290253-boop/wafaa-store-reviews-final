# تشغيل التكاملات الحقيقية لمتجر وفاء

## 1. واتساب المباشر

غيّري `VITE_WHATSAPP_NUMBER` إلى رقمك مع رمز الدولة، بدون علامة `+` أو مسافات. مثال مصر:

```env
VITE_WHATSAPP_NUMBER=201012345678
```

عند إرسال نموذج التواصل يفتح المتجر محادثة واتساب برسالة الاسم والبريد ونص الرسالة. وعند تسجيل الطلب يفتح رسالة تحتوي رقم الطلب والعميل والعنوان والمنتجات والمقاسات والكميات والإجمالي.

## 2. قاعدة Supabase

1. أنشئي مشروعاً على Supabase.
2. افتحي SQL Editor.
3. شغّلي الملف `supabase/schema.sql` بالكامل.
4. من Project Settings ثم API انسخي Project URL وAnon public key.
5. أضيفي القيم إلى Vercel بالاسمين:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

بعد إعادة النشر، ستُحفظ الطلبات والرسائل والتقييمات في Supabase وتظهر للمالك من الأجهزة المختلفة. سيظهر تبويب «إدارة التقييمات» في لوحة التحكم، كما يمكن فلترة الطلبات حسب «جديد» و«قيد التنفيذ» و«مكتمل».

> ملف SQL يضع سياسات قراءة وتعديل مفتوحة مؤقتاً لتسهيل الاختبار. قبل استقبال بيانات حساسة في الإنتاج، فعّلي Supabase Auth واستبدلي السياسات بسياسات owner-only.

## 3. تنبيهات البريد الاختيارية عبر EmailJS

1. أنشئي حساباً في EmailJS.
2. أضيفي خدمة البريد وقالباً.
3. اجعلي القالب يستخدم المتغيرات مثل `type`, `order_id`, `customer_name`, `phone`, `address`, `order_details`, `total`, `name`, `email`, و`message`.
4. أضيفي في Vercel:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxxx
```

EmailJS اختياري؛ لا يمنع واتساب أو Supabase من العمل إذا لم تضعيه.

## 4. التقييمات

تظهر نافذة تقييم تلقائياً بعد دقيقتين من تصفح المتجر، وتحتوي على اختيار من نجمة إلى خمس نجوم واسم وتعليق. يمكن للمالك تعديل أو حذف أو إخفاء التقييمات من تبويب «إدارة التقييمات»، بينما تظهر التقييمات المنشورة في قسم آراء العملاء بالصفحة الرئيسية.

## 5. النشر على Vercel

- Framework Preset: Vite أو Other.
- Build Command: `npm run build`.
- Output Directory: `dist/public`.
- Node.js: 20 أو أحدث.
- أضيفي متغيرات البيئة الثلاثة أو الستة من Vercel Project Settings.
- نفّذي Redeploy بعد حفظ المتغيرات.

ملف `vercel.json` موجود داخل المشروع ويحتوي إعداد إعادة توجيه لمسارات React.

## 6. تشغيل محلي في Visual Studio Code

```bash
npm install
# أنشئي ملفاً باسم .env.local اعتماداً على ENVIRONMENT_VARIABLES.md ثم ضعي بياناتك داخله
npm run dev
```

إذا لم يكن `.env.example` موجوداً في نسخة Windows، استخدمي `ENVIRONMENT_VARIABLES.md` كقالب وأنشئي `.env.local` يدوياً. لا ترفعي `.env.local` إلى GitHub.
