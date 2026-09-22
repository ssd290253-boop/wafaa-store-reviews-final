import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, ChevronDown, MapPin, Send, Sparkles, Truck } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export function AboutPage() {
  return <main className="editorial-page container"><section className="editorial-hero"><div><span className="eyebrow eyebrow-dark">حكاية وفاء · Wafaa</span><h1>نصنع مساحة<br /><em>لتكوني أنتِ.</em></h1><p>وفاء ليست مجرد ملابس. هي طريقة أهدأ لاختيار ما يرافقكِ؛ قطع ناعمة، تفاصيل محسوبة، وخامات تعيش معكِ أكثر من موسم.</p><Link href="/shop" className="primary-button">اكتشفي القطع <ArrowLeft size={17} /></Link></div><div className="editorial-hero-image"><img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=88" alt="تفاصيل من عالم وفاء" /><span>01 / هدوء مقصود</span></div></section><section className="manifesto-grid"><div><span className="eyebrow eyebrow-dark">ما نؤمن به</span><h2>الأناقة ليست<br />صوتاً عالياً.</h2></div><div className="manifesto-copy"><p>نختار الألوان التي تترك مجالاً للضوء، والخامات التي تشعرين بها قبل أن يراها أحد. كل قطعة في وفاء تمرّ بسؤال واحد: هل ستعودين إليها غداً؟</p><div className="signature">وفاء <span>×</span> لكِ</div></div></section><section className="values-grid"><div className="value-card"><span>01</span><strong>خامة تشبه الإحساس</strong><p>نبحث عن ملمس يدوم وقطع تتحسن مع الوقت.</p></div><div className="value-card"><span>02</span><strong>اختيار بلا استعجال</strong><p>تشكيلة صغيرة حتى يكون لكل قطعة سبب.</p></div><div className="value-card"><span>03</span><strong>تفاصيل لها معنى</strong><p>من التغليف إلى آخر غرزة، كل شيء محسوب.</p></div></section></main>;
}

export function HelpPage() {
  const [open, setOpen] = useState(0);
  const { settings } = useStore();
  const faqs = [
    ["كم يستغرق التوصيل؟", "تصل الطلبات خلال ٢–٤ أيام عمل داخل المدن الرئيسية، وقد تحتاج المدن الأخرى يوماً إضافياً."],
    ["هل يمكنني إرجاع القطعة؟", settings.returnPolicyText],
    ["كيف أعرف المقاس المناسب؟", "ستجدين دليل المقاسات داخل صفحة كل منتج. وإذا كنتِ بين مقاسين، نوصي بالمقاس الأكبر للقصّات المريحة."],
    ["هل المنتجات متوفرة دائماً؟", "نحن ننتج بكميات محدودة حتى نحافظ على جودة الاختيار. سجّلي بريدك ليصلك إشعار التوفر."],
  ];
  return <main className="help-page container"><div className="help-intro"><span className="eyebrow eyebrow-dark">نساعدكِ بهدوء</span><h1>كل ما تحتاجينه<br /><em>قبل أن تختاري.</em></h1><p>إجابات واضحة عن الشحن، الإرجاع، والمقاسات. وإذا لم تجدي ما تبحثين عنه، نحن على بُعد رسالة.</p></div><div className="help-content"><div className="help-side"><div className="help-side-item"><Truck size={20} /><strong>توصيل موثوق</strong><span>٢–٤ أيام عمل</span></div><div className="help-side-item"><Check size={20} /><strong>إرجاع سهل</strong><span>خلال {settings.returnPolicyDays} يوماً</span></div><div className="help-side-item"><Sparkles size={20} /><strong>اختيار مطمئن</strong><span>دعم قبل الشراء</span></div></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${open === index ? "open" : ""}`} key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><ChevronDown size={18} /></button>{open === index && <p>{answer}</p>}</div>)}<Link href="/contact" className="outline-button help-cta">لم تجدي إجابتك؟ تواصلي معنا <ArrowLeft size={16} /></Link></div></div></main>;
}

export function ContactPage({ onSubmitMessage }: { onSubmitMessage: (message: { name: string; email: string; message: string }) => void }) {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmitMessage({ name: String(data.get("name") || ""), email: String(data.get("email") || ""), message: String(data.get("message") || "") }); setSent(true); };
  return <main className="contact-page container"><section className="contact-intro"><span className="eyebrow eyebrow-dark">نحن هنا لكِ</span><h1>لديكِ سؤال؟<br /><em>اكتبيه لنا.</em></h1><p>للاستفسارات عن المنتجات، المقاسات، أو أي شيء آخر، املئي النموذج وسنعود إليكِ خلال يوم عمل.</p><div className="contact-details"><span><MapPin size={18} /> مصر · الشحن لجميع المحافظات</span></div></section><section className="contact-card">{sent ? <div className="contact-success"><span><Check size={25} /></span><h2>وصلت رسالتكِ.</h2><p>تم حفظ الرسالة وفتح واتساب لإرسالها مباشرة إلى المتجر.</p><Link href="/shop" className="primary-button">العودة للمتجر <ArrowLeft size={16} /></Link></div> : <form onSubmit={submit}><label>الاسم<input required name="name" placeholder="كيف نناديكِ؟" /></label><label>البريد الإلكتروني<input required type="email" name="email" placeholder="you@example.com" /></label><label>كيف نساعدكِ؟<textarea required name="message" rows={5} placeholder="اكتبي رسالتك هنا..." /></label><button type="submit" className="primary-button">إرسال الرسالة عبر واتساب <Send size={16} /></button></form>}</section></main>;
}

export function TermsPage() {
  const { settings } = useStore();
  return <main className="help-page container terms-page"><div className="help-intro"><span className="eyebrow eyebrow-dark">وضوح دائم</span><h1>الشروط<br /><em>والأحكام.</em></h1><p>آخر تحديث لسياسات المتجر. لأي استفسار حول طلبك يمكنك دائماً التواصل معنا مباشرة.</p></div><div className="terms-content"><section><h2>الشروط العامة</h2><p>{settings.termsText}</p></section><section><h2>سياسة الإرجاع</h2><p>{settings.returnPolicyText}</p></section><section><h2>الشحن</h2><p>شحن مجاني للطلبات فوق {formatPrice(settings.freeShippingThreshold)} ج.م، وخلاف ذلك تُضاف رسوم شحن قدرها {formatPrice(settings.shippingFee)} ج.م.</p></section></div><Link href="/contact" className="outline-button help-cta">لديكِ سؤال عن الشروط؟ تواصلي معنا <ArrowLeft size={16} /></Link></main>;
}
