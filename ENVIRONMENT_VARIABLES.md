# متغيرات البيئة المطلوبة

أضيفي هذه المتغيرات في Vercel من: **Project Settings → Environment Variables**، أو في ملف `.env.local` محلياً. لا تضعي مفاتيح حقيقية داخل GitHub.

```env
# رقم واتساب مع رمز الدولة، بدون + أو مسافات
VITE_WHATSAPP_NUMBER=201026674042

# Supabase: Project Settings → API
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# اختياري: EmailJS
VITE_EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID=YOUR_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

**مهم:** استخدمي `anon/public key` الخاصة بـ Supabase في الواجهة فقط، ولا تضعي `service_role key` في المشروع أو Vercel Frontend.

إذا تركتِ Supabase وEmailJS فارغين، سيعمل واتساب، وستستمر الطلبات والرسائل داخل المتصفح الحالي عبر Local Storage.
