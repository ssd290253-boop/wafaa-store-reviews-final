import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { Check, ImagePlus, LockKeyhole, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { categoryItems, categoryLabels, FALLBACK_PRODUCT_IMAGE } from "@/data/catalog";
import { generateProductId, useStore } from "@/lib/store";
import { resizeImageToDataUrl } from "@/lib/image";
import { formatPrice } from "@/lib/utils";
import type { CategoryId, OrderStatus, Product, Review, StoreSettings } from "@/lib/types";
import { colorName } from "@/lib/colors";
import { AdminMediaManager } from "./AdminMediaManager";

const ADMIN_PASSWORD_KEY = "wafaa_admin_password_v1";
const ADMIN_EMAIL_KEY = "wafaa_admin_email_v1";
const ADMIN_SESSION_KEY = "wafaa_admin_session_v1";
const DEFAULT_ADMIN_PASSWORD = "wafaa-admin-2025";
const DEFAULT_ADMIN_EMAIL = "owner@wafaa.store";

const getStoredPassword = () => localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
const getStoredEmail = () => localStorage.getItem(ADMIN_EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;

const productCategories = categoryItems.filter((item) => item.id !== "all") as { id: Exclude<CategoryId, "all">; label: string; note: string }[];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1");
  if (!unlocked) return <AdminLogin onSuccess={() => setUnlocked(true)} />;
  return <AdminPanel onLogout={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); setUnlocked(false); }} />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === getStoredEmail().toLowerCase() && password === getStoredPassword()) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      onSuccess();
      return;
    }
    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  };

  return (
    <main className="admin-page admin-login-page container">
      <div className="admin-login-card">
        <span className="admin-login-icon"><LockKeyhole size={22} /></span>
        <h1>لوحة تحكم وفاء</h1>
        <p>هذه المساحة خاصة بمالكة المتجر، لتعديل المنتجات وسياسات المتجر بسهولة.</p>
        <form onSubmit={submit}>
          <label>
            البريد الإلكتروني
            <input type="email" required value={email} autoFocus onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="owner@wafaa.store" dir="ltr" />
          </label>
          <label>
            كلمة المرور
            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" />
          </label>
          {error && <span className="admin-error">{error}</span>}
          <button type="submit" className="primary-button">دخول</button>
        </form>
        <p className="admin-login-hint">البريد الافتراضي: <code>{DEFAULT_ADMIN_EMAIL}</code> · كلمة المرور: <code>{DEFAULT_ADMIN_PASSWORD}</code>. يمكنكِ تغيير كلمة المرور بعد الدخول.</p>
        <Link href="/" className="text-link">العودة للمتجر</Link>
      </div>
    </main>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { products, settings, messages, reviews, addProduct, updateProduct, deleteProduct, updateSettings, resetProducts, resetSettings } = useStore();
  const [tab, setTab] = useState<"products" | "media" | "orders" | "messages" | "reviews" | "policies" | "account">("products");

  return (
    <main className="admin-page container">
      <div className="admin-head">
        <div>
          <span className="eyebrow eyebrow-dark">لوحة التحكم</span>
          <h1>تحكمي بمتجرك بسهولة</h1>
          <p>عدّلي منتجاتك وسياسات المتجر والوسائط، وستنعكس التغييرات مباشرة على الموقع في هذا المتصفح.</p>
        </div>
        <div className="admin-head-actions">
          <Link href="/" className="outline-button">مشاهدة المتجر</Link>
          <button className="outline-button" onClick={onLogout} type="button">تسجيل الخروج</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")} type="button">المنتجات ({products.length})</button>
        <button className={tab === "media" ? "active" : ""} onClick={() => setTab("media")} type="button">إدارة الصور والفيديوهات</button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")} type="button">الطلبات والمبيعات</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")} type="button">الرسائل الواردة ({messages.filter((message) => message.status === "new").length})</button>
        <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")} type="button">إدارة التقييمات ({reviews.length})</button>
        <button className={tab === "policies" ? "active" : ""} onClick={() => setTab("policies")} type="button">سياسات المتجر</button>
        <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")} type="button">كلمة المرور</button>
      </div>

      {tab === "products" && (
        <AdminProducts
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onReset={resetProducts}
        />
      )}
      {tab === "media" && <AdminMediaManager />}
      {tab === "orders" && <AdminOrders />}
      {tab === "messages" && <AdminMessages />}
      {tab === "reviews" && <AdminReviews reviews={reviews} />}
      {tab === "policies" && <AdminPolicies settings={settings} onUpdate={updateSettings} onReset={resetSettings} />}
      {tab === "account" && <AdminAccount />}
    </main>
  );
}

function AdminProducts({
  products,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (id: string, patch: Omit<Product, "id">) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <p>{products.length} منتج معروض في متجرك حالياً.</p>
        <div className="admin-actions">
          {confirmReset ? (
            <span className="admin-confirm-inline">
              استعادة كل المنتجات الافتراضية؟
              <button type="button" className="danger" onClick={() => { onReset(); setConfirmReset(false); }}>تأكيد</button>
              <button type="button" onClick={() => setConfirmReset(false)}>تراجع</button>
            </span>
          ) : (
            <button className="outline-button" type="button" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> استعادة الافتراضي</button>
          )}
          <button className="primary-button" type="button" onClick={() => { setAdding((v) => !v); setEditingId(null); }}>
            {adding ? <><X size={16} /> إلغاء</> : <><Plus size={16} /> إضافة منتج جديد</>}
          </button>
        </div>
      </div>

      {adding && (
        <ProductForm
          initial={null}
          submitLabel="حفظ المنتج"
          onCancel={() => setAdding(false)}
          onSubmit={(values) => { onAdd({ id: generateProductId(products), ...values }); setAdding(false); }}
        />
      )}

      <div className="admin-product-list">
        {products.map((product) => (
          <div className="admin-product-row" key={product.id}>
            {editingId === product.id ? (
              <ProductForm
                initial={product}
                submitLabel="حفظ التعديلات"
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => { onUpdate(product.id, values); setEditingId(null); }}
              />
            ) : (
              <>
                <img src={product.image} alt={product.name} />
                <div className="admin-product-info">
                  <strong>{product.name}</strong>
                  <span>{product.categoryLabel} · {formatPrice(product.price)} ج.م{product.isNew && " · جديد"}</span>
                </div>
                <div className="admin-product-row-actions">
                  <button type="button" onClick={() => { setEditingId(product.id); setAdding(false); setConfirmDeleteId(null); }}><Pencil size={14} /> تعديل</button>
                  {confirmDeleteId === product.id ? (
                    <span className="admin-confirm-inline">
                      متأكدة؟
                      <button type="button" className="danger" onClick={() => { onDelete(product.id); setConfirmDeleteId(null); }}>نعم، احذفي</button>
                      <button type="button" onClick={() => setConfirmDeleteId(null)}>تراجع</button>
                    </span>
                  ) : (
                    <button type="button" className="danger" onClick={() => setConfirmDeleteId(product.id)}><Trash2 size={14} /> حذف</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {products.length === 0 && <p className="admin-empty">لا توجد منتجات بعد. أضيفي أول منتج لمتجرك.</p>}
      </div>
    </section>
  );
}

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: Product | null;
  onSubmit: (values: Omit<Product, "id">) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [category, setCategory] = useState<Exclude<CategoryId, "all">>(initial?.category ?? "women");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice ? String(initial.oldPrice) : "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [rating, setRating] = useState(initial ? String(initial.rating) : "5");
  const [reviews, setReviews] = useState(initial ? String(initial.reviews) : "0");
  const [sizes, setSizes] = useState(initial?.sizes.join("، ") ?? "");
  const [colors, setColors] = useState(initial?.colors.join(", ") ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isNew, setIsNew] = useState(Boolean(initial?.isNew));
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setImageBusy(true);
    setError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحميل الصورة");
    } finally {
      setImageBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const sizeList = sizes.split(/[,،]/).map((item) => item.trim()).filter(Boolean);
    const colorList = colors.split(/[,،]/).map((item) => item.trim()).filter(Boolean);

    if (!name.trim()) { setError("يرجى كتابة اسم المنتج"); return; }
    if (!price || Number(price) <= 0) { setError("يرجى إدخال سعر صحيح"); return; }
    if (!sizeList.length) { setError("أضيفي مقاساً واحداً على الأقل، مفصولة بفاصلة"); return; }
    if (!colorList.length) { setError("أضيفي اسماً واحداً للون على الأقل، وافصلي بين الألوان بفاصلة"); return; }

    setError("");
    onSubmit({
      name: name.trim(),
      subtitle: subtitle.trim(),
      category,
      categoryLabel: categoryLabels[category],
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      badge: badge.trim() || undefined,
      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      colors: colorList,
      sizes: sizeList,
      image: image.trim() || FALLBACK_PRODUCT_IMAGE,
      description: description.trim(),
      isNew: isNew || undefined,
    });
  };

  return (
    <form className="admin-product-form" onSubmit={submit}>
      <div className="admin-form-grid">
        <label>اسم المنتج<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: قميص لينن سحابي" /></label>
        <label>الوصف المختصر<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="مثال: قصّة مريحة · كتّان طبيعي" /></label>
        <label>التصنيف
          <select value={category} onChange={(e) => setCategory(e.target.value as Exclude<CategoryId, "all">)}>
            {productCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>السعر (ج.م)<input required type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label>السعر قبل الخصم (اختياري)<input type="number" min="0" step="1" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} /></label>
        <label>شارة المنتج (اختياري)<input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="مثال: خصم 15%" /></label>
        <label>التقييم (0–5)<input type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} /></label>
        <label>عدد المراجعات<input type="number" min="0" step="1" value={reviews} onChange={(e) => setReviews(e.target.value)} /></label>
        <label className="admin-span-2">المقاسات (افصلي بفاصلة)<input required value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" /></label>
        <label className="admin-span-2">ألوان المنتج — أسماء حرة (افصلي بفاصلة)<input required value={colors} onChange={(e) => setColors(e.target.value)} placeholder="أحمر، Navy Blue، Mint Green، لون مخصص" /><small className="admin-hint">اكتبي أي اسم واضح للون. ستظهر الأسماء للعميل، وتُستخدم معاينة ذكية للأسماء القياسية أو لون افتراضي جميل للأسماء المخصصة.</small></label>
        <label className="admin-span-2">وصف المنتج<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className="admin-span-2 admin-checkbox"><input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> منتج جديد (يظهر عليه شارة "جديد")</label>
        <div className="admin-span-2 admin-image-field">
          <span>صورة المنتج</span>
          <div className="admin-image-row">
            {image ? <img src={image} alt="معاينة" className="admin-image-preview" /> : <div className="admin-image-placeholder"><ImagePlus size={20} /></div>}
            <div className="admin-image-inputs">
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="الصقي رابط صورة، أو ارفعي صورة من جهازك" />
              <label className="admin-upload-button">
                {imageBusy ? "جارٍ التحميل..." : "رفع صورة من الجهاز"}
                <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </div>
      </div>
      {error && <span className="admin-error">{error}</span>}
      <div className="admin-form-actions">
        <button type="submit" className="primary-button" disabled={imageBusy}><Check size={16} /> {submitLabel}</button>
        <button type="button" className="outline-button" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

function AdminPolicies({
  settings,
  onUpdate,
  onReset,
}: {
  settings: StoreSettings;
  onUpdate: (patch: Partial<StoreSettings>) => void;
  onReset: () => void;
}) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onUpdate(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <section className="admin-section">
      <form className="admin-policies-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label>مدة سياسة الإرجاع (بالأيام)<input type="number" min="0" step="1" value={form.returnPolicyDays} onChange={(e) => setForm((f) => ({ ...f, returnPolicyDays: Number(e.target.value) }))} /></label>
          <label>حد الشحن المجاني (ج.م)<input type="number" min="0" step="1" value={form.freeShippingThreshold} onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: Number(e.target.value) }))} /></label>
          <label>رسوم الشحن (ج.م)<input type="number" min="0" step="1" value={form.shippingFee} onChange={(e) => setForm((f) => ({ ...f, shippingFee: Number(e.target.value) }))} /></label>
          <label className="admin-span-2">نص سياسة الإرجاع الكامل<textarea rows={4} value={form.returnPolicyText} onChange={(e) => setForm((f) => ({ ...f, returnPolicyText: e.target.value }))} /></label>
          <label className="admin-span-2">نص الشروط والأحكام<textarea rows={5} value={form.termsText} onChange={(e) => setForm((f) => ({ ...f, termsText: e.target.value }))} /></label>
        </div>
        <p className="admin-hint">هذه النصوص تظهر مباشرة في صفحة "الأسئلة الشائعة"، صفحة المنتج، وصفحة "الشروط والأحكام" الجديدة.</p>
        <div className="admin-form-actions">
          <button type="submit" className="primary-button"><Check size={16} /> حفظ السياسات</button>
          <button type="button" className="outline-button" onClick={() => { onReset(); setForm(settings); }}><RotateCcw size={15} /> استعادة الافتراضي</button>
          {saved && <span className="admin-saved-note"><Check size={14} /> تم الحفظ</span>}
        </div>
      </form>
    </section>
  );
}

function AdminAccount() {
  const [email, setEmail] = useState(getStoredEmail());
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (current !== getStoredPassword()) { setError("كلمة المرور الحالية غير صحيحة"); return; }
    if (next.length < 4) { setError("اختاري كلمة مرور من 4 أحرف على الأقل"); return; }
    if (next !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    localStorage.setItem(ADMIN_PASSWORD_KEY, next);
    localStorage.setItem(ADMIN_EMAIL_KEY, email.trim().toLowerCase());
    setError("");
    setCurrent(""); setNext(""); setConfirm("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <section className="admin-section">
      <form className="admin-policies-form admin-account-form" onSubmit={submit}>
        <p className="admin-hint">هذا الحماية بسيطة داخل المتصفح لتمنع الزوار العاديين من الوصول للوحة التحكم، وليست بديلاً عن نظام دخول حقيقي بخادم منفصل.</p>
        <div className="admin-form-grid">
          <label>بريد دخول المالك<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" /></label>
          <label>كلمة المرور الحالية<input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
          <label>كلمة المرور الجديدة<input type="password" required value={next} onChange={(e) => setNext(e.target.value)} /></label>
          <label>تأكيد كلمة المرور الجديدة<input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        </div>
        {error && <span className="admin-error">{error}</span>}
        <div className="admin-form-actions">
          <button type="submit" className="primary-button"><Check size={16} /> تحديث كلمة المرور</button>
          {saved && <span className="admin-saved-note"><Check size={14} /> تم التحديث</span>}
        </div>
      </form>
    </section>
  );
}


function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, resetOrders } = useStore();
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter((order) => order.status === "pending").length;
  const completed = orders.filter((order) => order.status === "completed").length;
  const statusLabels: Record<OrderStatus, string> = { pending: "جديد", confirmed: "مؤكد", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };
  const visibleOrders = orders.filter((order) => filter === "all" || (filter === "pending" && order.status === "pending") || (filter === "in_progress" && (order.status === "confirmed" || order.status === "shipped")) || (filter === "completed" && order.status === "completed"));
  const filterLabels = { all: "كل الطلبات", pending: "جديد", in_progress: "قيد التنفيذ", completed: "مكتمل" } as const;

  return (
    <section className="admin-section orders-manager">
      <div className="admin-section-head"><div><p>تابعي الطلبات والمبيعات من مكان واحد.</p><span className="admin-hint">تظهر الطلبات من جميع الأجهزة عند إضافة بيانات Supabase، وتبقى محلياً داخل هذا المتصفح إذا لم يتم تفعيلها.</span></div><button type="button" className="outline-button" onClick={() => { if (window.confirm("حذف سجل الطلبات بالكامل؟")) resetOrders(); }}>مسح السجل</button></div>
      <div className="orders-stats"><div><span>إجمالي المبيعات</span><strong>{formatPrice(revenue)} ج.م</strong></div><div><span>كل الطلبات</span><strong>{orders.length}</strong></div><div><span>طلبات جديدة</span><strong>{pending}</strong></div><div><span>طلبات مكتملة</span><strong>{completed}</strong></div></div>
      <div className="order-filter-bar" role="group" aria-label="تصفية الطلبات">{Object.entries(filterLabels).map(([value, label]) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value as typeof filter)}>{label}<span>{value === "all" ? orders.length : value === "pending" ? pending : value === "completed" ? completed : orders.filter((order) => order.status === "confirmed" || order.status === "shipped").length}</span></button>)}</div>
      {orders.length === 0 ? <div className="orders-empty"><Check size={25} /><h2>لا توجد طلبات بعد</h2><p>عند إتمام أول طلب سيظهر هنا مع تفاصيل العميل والمنتجات والحالة.</p></div> : visibleOrders.length === 0 ? <div className="orders-empty"><Check size={25} /><h2>لا توجد طلبات بهذه الحالة</h2><p>جرّبي اختيار تصنيف آخر لمتابعة المبيعات.</p></div> : <div className="orders-list">{visibleOrders.map((order) => <article className="order-card" key={order.id}><div className="order-card-head"><div><strong>طلب #{order.id.slice(-6).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleString("ar-EG")}</span></div><strong className="order-total">{formatPrice(order.total)} ج.م</strong></div><div className="order-customer"><strong>{order.customerName}</strong><span>{order.phone || "بدون رقم"}</span><span>{order.address || "العنوان غير مضاف"}</span></div><div className="order-items">{order.items.map((item) => <span key={`${order.id}-${item.id}-${item.size}-${item.color}`}>{item.name} · اللون: {colorName(item.color)} × {item.quantity}</span>)}</div><div className="order-card-actions"><select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)} aria-label="حالة الطلب">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" className="admin-danger-button" onClick={() => { if (window.confirm("حذف هذا الطلب؟")) deleteOrder(order.id); }}><Trash2 size={14} /> حذف</button></div></article>)}</div>}
    </section>
  );
}


function AdminMessages() {
  const { messages, updateMessageStatus, deleteMessage, resetMessages } = useStore();
  const statusLabels = { new: "جديدة", read: "تمت القراءة", archived: "مؤرشفة" } as const;
  return (
    <section className="admin-section messages-manager">
      <div className="admin-section-head"><div><p>كل رسائل نموذج التواصل من جميع الأجهزة.</p><span className="admin-hint">عند تفعيل Supabase ستتزامن الرسائل بين العملاء ولوحة المالك.</span></div><button type="button" className="outline-button" onClick={() => { if (window.confirm("حذف جميع الرسائل؟")) resetMessages(); }}>مسح الرسائل</button></div>
      {messages.length === 0 ? <div className="orders-empty"><Check size={25} /><h2>لا توجد رسائل بعد</h2><p>ستظهر رسائل العملاء هنا بعد إرسال نموذج التواصل.</p></div> : <div className="messages-list">{messages.map((message) => <article className={`message-card ${message.status === "new" ? "is-new" : ""}`} key={message.id}><div className="message-card-head"><div><strong>{message.name}</strong><span>{message.email} · {new Date(message.createdAt).toLocaleString("ar-EG")}</span></div><select value={message.status} onChange={(event) => updateMessageStatus(message.id, event.target.value as keyof typeof statusLabels)} aria-label="حالة الرسالة">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><p>{message.message}</p><div className="message-card-actions"><a className="outline-button" href={`mailto:${message.email}`}>الرد بالبريد</a><button type="button" className="admin-danger-button" onClick={() => deleteMessage(message.id)}><Trash2 size={14} /> حذف</button></div></article>)}</div>}
    </section>
  );
}


function AdminReviews({ reviews }: { reviews: Review[] }) {
  const { createReview, updateReview, deleteReview, resetReviews } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Review["status"]>("published");

  const clearForm = () => { setEditingId(null); setName(""); setRating(5); setComment(""); setStatus("published"); };
  const edit = (review: Review) => { setEditingId(review.id); setName(review.name); setRating(review.rating); setComment(review.comment); setStatus(review.status); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = { name: name.trim(), rating: Math.min(5, Math.max(1, rating)), comment: comment.trim(), status };
    if (editingId) updateReview(editingId, payload);
    else createReview({ id: `REV-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), ...payload });
    clearForm();
  };

  return <section className="admin-section reviews-manager"><div className="admin-section-head"><div><p>تحكمي في آراء العملاء التي تظهر في الصفحة الرئيسية.</p><span className="admin-hint">يمكنكِ إضافة تقييم يدوي، تعديل أي تقييم، أو إخفاؤه دون حذفه.</span></div><button type="button" className="outline-button" onClick={() => { if (window.confirm("حذف جميع التقييمات؟")) resetReviews(); }}>مسح التقييمات</button></div><form className="review-admin-form" onSubmit={submit}><div className="admin-form-grid"><label>اسم العميل<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: سارة" /></label><label>التقييم<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{"★".repeat(value)} ({value}/5)</option>)}</select></label><label>الظهور<select value={status} onChange={(event) => setStatus(event.target.value as Review["status"])}><option value="published">ظاهر للزوار</option><option value="hidden">مخفي</option></select></label></div><label>التعليق<textarea required value={comment} onChange={(event) => setComment(event.target.value)} placeholder="اكتبي نص التقييم" rows={3} /></label><div className="admin-form-actions"><button type="submit" className="primary-button">{editingId ? <><Pencil size={15} /> حفظ التعديل</> : <><Plus size={15} /> إضافة تقييم</>}</button>{editingId && <button type="button" className="outline-button" onClick={clearForm}>إلغاء التعديل</button>}</div></form>{reviews.length === 0 ? <div className="orders-empty"><Check size={25} /><h2>لا توجد تقييمات مضافة</h2><p>أضيفي أول تقييم يدوياً أو انتظري تقييمات الزوار.</p></div> : <div className="reviews-admin-list">{reviews.map((review) => <article className={`review-admin-card ${review.status === "hidden" ? "is-hidden" : ""}`} key={review.id}><div><div className="review-admin-stars">{"★".repeat(review.rating)}<span>{review.status === "published" ? "ظاهر" : "مخفي"}</span></div><strong>{review.name}</strong><p>{review.comment}</p><small>{new Date(review.createdAt).toLocaleString("ar-EG")}</small></div><div className="message-card-actions"><button type="button" className="outline-button" onClick={() => edit(review)}><Pencil size={14} /> تعديل</button><button type="button" className="admin-danger-button" onClick={() => { if (window.confirm("حذف هذا التقييم؟")) deleteReview(review.id); }}><Trash2 size={14} /> حذف</button></div></article>)}</div>}</section>;
}
