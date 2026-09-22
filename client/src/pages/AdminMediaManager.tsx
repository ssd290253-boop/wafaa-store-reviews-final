import { useState } from "react";
import { Check, ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { FALLBACK_PRODUCT_IMAGE } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

function readImage(file: File, onDone: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="media-field">
      <div className="media-field-heading"><strong>{label}</strong><span>رابط مباشر أو رفع من الجهاز</span></div>
      <div className="media-preview-row">
        <img src={value || FALLBACK_PRODUCT_IMAGE} alt={label} className="media-preview" />
        <div className="media-field-controls">
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://... أو ارفعي صورة" />
          <label className="admin-upload-button"><Upload size={14} /> {busy ? "جارٍ التحميل..." : "رفع صورة"}<input hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); readImage(file, (url) => { onChange(url); setBusy(false); }); }} /></label>
        </div>
      </div>
    </div>
  );
}

function ProductMediaCard({ product }: { product: Product }) {
  const { updateProduct } = useStore();
  const replace = (url: string) => {
    const { id, ...patch } = product;
    updateProduct(id, { ...patch, image: url });
  };
  return (
    <article className="media-product-card">
      <img src={product.image || FALLBACK_PRODUCT_IMAGE} alt={product.name} />
      <div><strong>{product.name}</strong><span>{product.categoryLabel}</span></div>
      <label className="admin-upload-button"><Upload size={14} /> استبدال الصورة<input hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, replace); }} /></label>
    </article>
  );
}

export function AdminMediaManager() {
  const { media, products, updateMedia, resetMedia } = useStore();
  const [saved, setSaved] = useState(false);
  const [newBanner, setNewBanner] = useState("");

  const save = (patch: Partial<typeof media>) => {
    updateMedia(patch);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const addBanner = () => {
    if (!newBanner.trim()) return;
    save({ heroBanners: [...media.heroBanners, newBanner.trim()] });
    setNewBanner("");
  };

  return (
    <section className="admin-section media-manager">
      <div className="admin-section-head"><div><p>بدّلي الصور الأساسية للمتجر، وستظهر التعديلات فوراً في هذه الجلسة.</p><span className="admin-hint">تُحفظ الصور في المتصفح الحالي. استخدمي روابط صور محسّنة للإنتاج، أو ارفعي صورة صغيرة للمعاينة.</span></div><div className="admin-actions">{saved && <span className="admin-saved-note"><Check size={14} /> تم الحفظ</span>}<button type="button" className="outline-button" onClick={resetMedia}><RotateCcw size={15} /> استعادة الصور الافتراضية</button></div></div>
      <div className="media-brand-grid">
        <ImageField label="شعار / صورة البروفايل" value={media.logo} onChange={(logo) => save({ logo })} />
        <ImageField label="صورة قسم عن وفاء" value={media.aboutImage} onChange={(aboutImage) => save({ aboutImage })} />
      </div>
      <div className="media-panel">
        <div className="media-panel-heading"><div><span className="eyebrow eyebrow-dark">واجهة المتجر</span><h3>البانرات الترويجية</h3></div><span>{media.heroBanners.length} صور</span></div>
        <div className="media-banner-grid">{media.heroBanners.map((banner, index) => <article className="media-banner-card" key={`${banner}-${index}`}><img src={banner} alt={`بانر ${index + 1}`} /><button type="button" className="media-delete" onClick={() => save({ heroBanners: media.heroBanners.filter((_, itemIndex) => itemIndex !== index) })} aria-label="حذف البانر"><Trash2 size={15} /></button><small>بانر {String(index + 1).padStart(2, "0")}</small></article>)}</div>
        <div className="media-add-row"><input value={newBanner} onChange={(event) => setNewBanner(event.target.value)} placeholder="الصقي رابط بانر جديد" /><button type="button" className="primary-button" onClick={addBanner}><ImagePlus size={16} /> إضافة بانر</button></div>
      </div>
      <div className="media-panel"><div className="media-panel-heading"><div><span className="eyebrow eyebrow-dark">كتالوج المنتجات</span><h3>كل صور المنتجات</h3></div><span>{products.length} منتجات</span></div><div className="media-product-grid">{products.map((product) => <ProductMediaCard key={product.id} product={product} />)}</div></div>
    </section>
  );
}

export default AdminMediaManager;
