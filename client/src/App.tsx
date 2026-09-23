import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  MessageCircle,
  Minus,
  Play,
  Plus,
  Search,
  Send,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { AboutPage, ContactPage, HelpPage, TermsPage } from "./pages/BrandPages";
import AdminPage from "./pages/AdminPage";
import { categoryItems, image } from "@/data/catalog";
import { StoreProvider, useStore } from "@/lib/store";
import { formatPrice, normalizeSearchText } from "@/lib/utils";
import { colorName, colorToCss } from "@/lib/colors";
import type { CartItem, CategoryId, Product } from "@/lib/types";
import { contactWhatsAppMessage, openWhatsApp, orderWhatsAppMessage, sendEmailNotification, whatsappUrl } from "@/lib/integrations";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

function Logo() {
  const { media } = useStore();
  return (
    <Link href="/" className="brand" aria-label="العودة إلى الصفحة الرئيسية">
      {media.logo ? <img className="brand-logo-image" src={media.logo} alt="شعار وفاء" /> : <span className="brand-mark">W</span>}
      <span>
        <strong>Wafaa</strong>
        <small>Wafaa Studio · هدوء يشبهك</small>
      </span>
    </Link>
  );
}

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}

function Header({
  cartCount,
  search,
  setSearch,
  onMenu,
}: {
  cartCount: number;
  search: string;
  setSearch: (value: string) => void;
  onMenu: () => void;
}) {
  const [location, setLocation] = useLocation();
  const { settings } = useStore();
  const { theme, toggleTheme } = useTheme();
  const active = (path: string) => location === path || (path !== "/shop" && location.startsWith(path));
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setLocation(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : "/shop");
  };
  return (
    <>
      <div className="announcement">
        <span>شحن مجاني للطلبات فوق {formatPrice(settings.freeShippingThreshold)} ج.م</span>
        <span className="announcement-dot" />
        <span>إرجاع سهل خلال {settings.returnPolicyDays} يوماً</span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-button mobile-only" onClick={onMenu} aria-label="فتح القائمة"><Menu size={21} /></button>
          <Logo />
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <Link className={`nav-pill ${active("/shop") ? "active" : ""}`} href="/shop">المتجر</Link>
            <Link className={`nav-pill ${location.includes("category=outerwear") ? "active" : ""}`} href="/shop?category=outerwear">الخارجية</Link>
            <Link className={`nav-pill ${location.includes("category=women") ? "active" : ""}`} href="/shop?category=women">حريمي / بنات</Link>
            <Link className={`nav-pill ${location.includes("category=shoes") ? "active" : ""}`} href="/shop?category=shoes">الأحذية</Link>
            <Link className={`nav-pill ${active("/about") ? "active" : ""}`} href="/about">عن وفاء</Link>
          </nav>
          <div className="header-tools">
            <form className="header-search" onSubmit={submitSearch}>
              <Search size={17} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحثي عن قطعة..." aria-label="البحث عن منتج" />
            </form>
            <button className="icon-button desktop-icon" aria-label="حسابي" onClick={() => alert("تسجيل الدخول سيُضاف عند ربط الحسابات") }><UserRound size={19} /></button>
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"} title={theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Link className="cart-button" href="/cart" aria-label={`السلة، ${cartCount} منتجات`}>
              <ShoppingBag size={19} />
              <span className="cart-label">السلة</span>
              <b>{cartCount}</b>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggleTheme } = useTheme();
  if (!open) return null;
  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <aside className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-head"><Logo /><button className="icon-button" onClick={onClose} aria-label="إغلاق القائمة"><X size={20} /></button></div>
        <div className="mobile-links">
          <Link href="/shop" onClick={onClose}>المتجر <ArrowLeft size={16} /></Link>
          <Link href="/shop?category=outerwear" onClick={onClose}>الخارجية <ArrowLeft size={16} /></Link>
          <Link href="/shop?category=women" onClick={onClose}>حريمي / بنات <ArrowLeft size={16} /></Link>
          <Link href="/shop?category=shoes" onClick={onClose}>الأحذية <ArrowLeft size={16} /></Link>
          <Link href="/about" onClick={onClose}>عن وفاء <ArrowLeft size={16} /></Link>
        </div>
        <button type="button" className="mobile-theme-toggle" onClick={toggleTheme}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} {theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}</button>
        <div className="mobile-note"><Sparkles size={17} /><span>قطع قليلة، مختارة بعناية لتعيش طويلاً.</span></div>
      </aside>
    </div>
  );
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
}: {
  product: Product;
  favorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
}) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-badges">
          {product.isNew && <span className="soft-badge">جديد</span>}
          {product.badge && <span className="discount-badge">{product.badge}</span>}
        </div>
      </Link>
      <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-label={favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
      </button>
      <div className="product-info">
        <div className="product-meta"><span>{product.categoryLabel}</span><span className="rating"><Star size={13} fill="currentColor" /> {product.rating}</span></div>
        <Link href={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <p>{product.subtitle}</p>
        <div className="product-bottom">
          <div className="price"><strong>{formatPrice(product.price)} <small>ج.م</small></strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
          <button className="add-round" onClick={onAdd} aria-label={`إضافة ${product.name} إلى السلة`}><ShoppingBasket size={17} /></button>
        </div>
      </div>
    </article>
  );
}

function HomePage({
  favorites,
  toggleFavorite,
  addProduct,
}: {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  addProduct: (product: Product) => void;
}) {
  const [, setLocation] = useLocation();
  const { products, reviews } = useStore();
  const testimonials = [{ id: "default-sara", name: "سارة العتيبي", rating: 5, comment: "الخامة أجمل على الطبيعة، والتغليف وحده تجربة لطيفة." }, { id: "default-noura", name: "نورة محمد", rating: 5, comment: "أخيراً قطع عملية ومرتبة أقدر ألبسها بأكثر من طريقة." }, { id: "default-reem", name: "ريم صالح", rating: 5, comment: "المقاس دقيق والتوصيل كان أسرع مما توقعت. سأكرر التجربة." }, ...reviews.filter((review) => review.status === "published")].slice(0, 6);
  return (
    <main>
      <section className="hero container">
        <div className="hero-copy reveal">
          <div className="eyebrow"><span /> مجموعة الخريف ٢٠٢٥ <span /></div>
          <h1>الهدوء،<br /><em>حين يصبح</em><br />أسلوباً.</h1>
          <p>قطع ناعمة، مصممة لتشبه إيقاعك. اكتشفي مجموعة وفاء الجديدة التي تعيش معك أكثر من موسم.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => setLocation("/shop")}>اكتشفي كل القطع <ArrowLeft size={17} /></button><a href="#our-story" className="text-link">لماذا وفاء؟ <ArrowUpLeft size={15} /></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>م</span><span>ن</span><span>ر</span></div><div><strong>+٢,٤٠٠</strong><small>تحب قطع وفاء كل يوم</small></div></div>
        </div>
        <div className="hero-visual reveal-delay">
          <img src="/manus-storage/saba-hero_6f8d7f01.jpg" alt="إطلالة هادئة من مجموعة وفاء" onError={(e) => { e.currentTarget.src = image("photo-1483985988355-763728e1935b", 1200); }} />
          <div className="hero-visual-overlay" />
          <div className="hero-note"><span>01</span><div><strong>طبقات الخريف</strong><small>خفة · دفء · أناقة</small></div></div>
          <div className="hero-circle"><span className="hero-brand-mark">W</span><small>Wafaa</small><ArrowUpLeft size={15} /></div>
        </div>
      </section>

      <ScrollReveal><section className="category-strip container">
        <div className="section-kicker"><span>تسوقي حسب الإحساس</span><i /></div>
        <div className="category-list">
          {categoryItems.slice(1).map((category, index) => (
            <Link key={category.id} href={`/shop?category=${category.id}`} className="category-tile">
              <span className="category-number">0{index + 1}</span><span className="category-label">{category.label}</span><small>{category.note}</small><ArrowUpLeft size={18} />
            </Link>
          ))}
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="featured-section container">
        <div className="section-heading"><div><span className="eyebrow eyebrow-dark">اختيارات وفاء</span><h2>قطع ستعيش معكِ.</h2></div><Link href="/shop" className="outline-button">شاهدي الكل <ArrowLeft size={16} /></Link></div>
        <div className="product-grid home-grid">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addProduct(product)} />)}
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section id="our-story" className="story-section container">
        <div className="story-image"><img src={image("photo-1496747611176-843222e1e57c", 1100)} alt="تفاصيل خامات وفاء" loading="lazy" /><span className="image-caption">الخامة تحكي الحكاية</span></div>
        <div className="story-copy"><div className="eyebrow eyebrow-dark">حكاية وفاء</div><h2>نؤمن أن<br /><em>الأجمل</em> هو الأبقى.</h2><p>بدأت وفاء من سؤال بسيط: كيف نصنع ملابس تمنحك شعوراً جميلاً، لا مجرد إطلالة جميلة؟ لذلك نختار خاماتنا ببطء، ونصمم كل قطعة لتمنحك مساحة أكبر لتكوني أنتِ.</p><div className="story-signature">وفاء <span>×</span> لكِ</div><Link href="/shop" className="text-link">تعرفي على قصتنا <ArrowLeft size={15} /></Link></div>
      </section></ScrollReveal>

      <ScrollReveal><section className="promise-section">
        <div className="container promise-grid">
          <div className="promise-intro"><span className="eyebrow eyebrow-dark">وفاء، ببساطة</span><h2>تفاصيل صغيرة<br />تصنع فرقاً كبيراً.</h2></div>
          <div className="promise-item"><span className="promise-icon"><Truck size={21} /></span><strong>توصيل هادئ وسريع</strong><p>تصل قطعك خلال ٢–٤ أيام، مغلفة بعناية.</p></div>
          <div className="promise-item"><span className="promise-icon"><Heart size={21} /></span><strong>مصممة لتعيش</strong><p>خامات نختبرها وقطع نعود لها كل موسم.</p></div>
          <div className="promise-item"><span className="promise-icon"><Sparkles size={21} /></span><strong>اختيار بلا استعجال</strong><p>تشكيلة صغيرة، حتى يكون كل اختيار له معنى.</p></div>
        </div>
      </section></ScrollReveal>
      <ScrollReveal><section className="promo-videos-section container">
        <div className="section-heading"><div><span className="eyebrow eyebrow-dark">من يوميات وفاء</span><h2>شاهديها كما تُلبس.</h2></div><span className="promo-note">أماكن جاهزة لفيديوهات TikTok الأصلية</span></div>
        <div className="promo-videos-grid">{[['لقطة من المجموعة','فيديو ترويجي 01'],['تفاصيل أقرب','فيديو ترويجي 02'],['نسّقيها بطريقتك','فيديو ترويجي 03']].map(([title, label], index) => <article className={`promo-video-card promo-video-${index + 1}`} key={label}><div className="promo-video-placeholder"><span className="promo-index">0{index + 1}</span><span className="play-badge"><Play size={18} fill="currentColor" /></span><small>سيتم استبداله بفيديو العميل</small></div><strong>{title}</strong><span>{label}</span></article>)}</div>
      </section></ScrollReveal>
      <ScrollReveal><section className="reviews-section container">
        <div className="section-heading"><div><span className="eyebrow eyebrow-dark">حكايات من وفاء</span><h2>أحببنَ هدوء التفاصيل.</h2></div><div className="review-summary"><Star size={15} fill="currentColor" /> <strong>4.9</strong><span>من ١٢٠+ مراجعة</span></div></div>
        <div className="reviews-grid">
          {testimonials.map((review) => <article className="review-card review-card-live" key={review.id}><div className="review-stars">{"★".repeat(review.rating)}</div><p>“{review.comment}”</p><strong>{review.name}</strong><small>{review.id.startsWith("default-") ? "عميلة وفاء" : "تقييم من زائرة"}</small></article>)}
        </div>
      </section></ScrollReveal>
    </main>
  );
}

function ShopPage({
  favorites,
  toggleFavorite,
  addProduct,
  search,
}: {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  addProduct: (product: Product) => void;
  search: string;
}) {
  const [location, setLocation] = useLocation();
  const { products } = useStore();
  const params = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const requestedCategory = (params.get("category") as CategoryId) || "all";
  const requestedSearch = params.get("search") || search;
  const [category, setCategory] = useState<CategoryId>(categoryItems.some((item) => item.id === requestedCategory) ? requestedCategory : "all");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const colorOptions = useMemo(() => Array.from(new Set(products.flatMap((product) => product.colors))), [products]);
  useEffect(() => {
    const nextCategory = categoryItems.some((item) => item.id === requestedCategory) ? requestedCategory : "all";
    setCategory(nextCategory);
  }, [requestedCategory]);

  const visibleProducts = useMemo(() => {
    const normalized = normalizeSearchText(requestedSearch);
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = !normalized || normalizeSearchText(`${product.name} ${product.subtitle} ${product.categoryLabel} ${product.description}`).includes(normalized);
      const matchesPrice = product.price <= maxPrice;
      const matchesSize = selectedSize === "all" || product.sizes.includes(selectedSize);
      const matchesColor = selectedColor === "all" || product.colors.includes(selectedColor);
      return matchesCategory && matchesSearch && matchesPrice && matchesSize && matchesColor;
    });
    if (sort === "newest") return [...filtered].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, maxPrice, products, requestedSearch, selectedColor, selectedSize, sort]);

  return (
    <main className="shop-page container">
      <div className="shop-intro"><div><div className="eyebrow eyebrow-dark">اكتشفي بهدوء</div><h1>كل القطع</h1><p>تشكيلة منتقاة لدواليب تحب المساحة والوقت.</p></div><div className="shop-count">{visibleProducts.length} من {products.length} قطع</div></div>
      <div className="shop-toolbar"><div className="category-tabs">{categoryItems.map((item) => <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => { setCategory(item.id); setLocation(item.id === "all" ? "/shop" : `/shop?category=${item.id}`); }}>{item.label}</button>)}</div><div className="toolbar-actions"><button className="filter-button" onClick={() => setFiltersOpen((value) => !value)}><ChevronDown size={16} /> فلاتر</button><label className="sort-select"><span>ترتيب:</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">الأكثر ملاءمة</option><option value="newest">الأحدث</option><option value="price-low">السعر: الأقل أولاً</option><option value="price-high">السعر: الأعلى أولاً</option></select></label></div></div>
      {filtersOpen && <div className="filter-panel"><div><strong>السعر حتى</strong><span>{formatPrice(maxPrice)} ج.م</span></div><input type="range" min="99" max="500" step="10" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /><div className="size-filter"><strong>المقاس</strong><div>{["all", "S", "M", "L", "XL"].map((size) => <button key={size} className={selectedSize === size ? "active" : ""} onClick={() => setSelectedSize(size)}>{size === "all" ? "الكل" : size}</button>)}</div></div><div className="color-filter"><strong>اللون</strong><div><button className={selectedColor === "all" ? "active" : ""} onClick={() => setSelectedColor("all")}>الكل</button>{colorOptions.slice(0, 8).map((color) => <button key={color} aria-label={`فلترة اللون ${colorName(color)}`} title={colorName(color)} className={`color-filter-choice ${selectedColor === color ? "active" : ""}`} style={{ backgroundColor: colorToCss(color) }} onClick={() => setSelectedColor(color)}><span>{colorName(color)}</span></button>)}</div></div></div>}
      {requestedSearch && <div className="search-result-note">نتائج البحث عن: <strong>“{requestedSearch}”</strong> <button onClick={() => setLocation("/shop")}>مسح <X size={14} /></button></div>}
      {visibleProducts.length ? <div className="product-grid shop-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addProduct(product)} />)}</div> : <div className="empty-state"><Sparkles size={25} /><h2>لم نجد هذه القطعة بعد</h2><p>جربي كلمة أخرى أو شاهدي المجموعة كاملة.</p><Link href="/shop" className="primary-button">العودة لكل القطع <ArrowLeft size={16} /></Link></div>}
    </main>
  );
}

function ProductPage({ product, onAdd }: { product: Product; onAdd: (product: Product, size: string, color: string) => void }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [activeImage, setActiveImage] = useState(product.image);
  const [, setLocation] = useLocation();
  const { products, settings } = useStore();
  const altImage = image(product.category === "shoes" ? "photo-1542291026-7eec264c27ff" : "photo-1485230895905-ec40ba36b9bc", 900);
  return (
    <main className="product-page container"><Link href="/shop" className="back-link"><ChevronRight size={17} /> العودة للمتجر <span>/ {product.categoryLabel}</span></Link><div className="product-detail"><div className="product-gallery"><div className="thumb-list"><button className={activeImage === product.image ? "active" : ""} onClick={() => setActiveImage(product.image)}><img src={product.image} alt="" /></button><button className={activeImage === altImage ? "active" : ""} onClick={() => setActiveImage(altImage)}><img src={altImage} alt="" /></button></div><div className="main-product-image"><img src={activeImage} alt={product.name} /><span className="gallery-label">وفاء · {product.categoryLabel}</span></div></div><div className="product-detail-copy"><div className="product-meta"><span>{product.categoryLabel}</span><span className="rating"><Star size={13} fill="currentColor" /> {product.rating} ({product.reviews})</span></div><h1>{product.name}</h1><p className="detail-subtitle">{product.subtitle}</p><div className="detail-price"><strong>{formatPrice(product.price)} <small>ج.م</small></strong>{product.oldPrice && <><del>{formatPrice(product.oldPrice)} ج.م</del><span>وفري {formatPrice(product.oldPrice - product.price)} ج.م</span></>}</div><div className="detail-divider" /><p className="description">{product.description}</p><div className="selector"><div className="selector-head"><strong>اختاري المقاس</strong><button onClick={() => alert("دليل المقاسات سيظهر هنا")}>دليل المقاسات <ArrowUpLeft size={14} /></button></div><div className="size-options">{product.sizes.map((item) => <button key={item} className={size === item ? "active" : ""} onClick={() => setSize(item)}>{item}</button>)}</div></div><div className="selector"><div className="selector-head"><strong>اللون</strong><span className="selected-color-name">{colorName(color)}</span></div><div className="color-options">{product.colors.map((item) => <button key={item} className={`color-choice ${color === item ? "active" : ""}`} onClick={() => setColor(item)} aria-label={`لون ${colorName(item)}`} title={colorName(item)}><span className="color-swatch" style={{ backgroundColor: colorToCss(item) }} /><span>{colorName(item)}</span></button>)}</div></div><button className="primary-button add-detail" onClick={() => onAdd(product, size, color)}>أضيفي إلى السلة <ShoppingBag size={17} /></button><div className="detail-benefits"><span><Truck size={17} /> شحن مجاني فوق {formatPrice(settings.freeShippingThreshold)} ج.م</span><span><Check size={17} /> إرجاع سهل خلال {settings.returnPolicyDays} يوماً</span></div></div></div><section className="related-section"><div className="section-heading"><div><span className="eyebrow eyebrow-dark">قد تحبين أيضاً</span><h2>قطع تكمل هدوءك.</h2></div><Link href="/shop" className="outline-button">شاهدي الكل <ArrowLeft size={16} /></Link></div><div className="product-grid home-grid">{products.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} favorite={false} onFavorite={() => undefined} onAdd={() => setLocation(`/product/${item.id}`)} />)}</div></section></main>
  );
}

function CartPage({ items, updateQuantity, removeItem, clearCart, onCheckout }: { items: CartItem[]; updateQuantity: (id: string, size: string, color: string, quantity: number) => void; removeItem: (id: string, size: string, color: string) => void; clearCart: () => void; onCheckout: (customer: { name: string; phone: string; address: string }) => void }) {
  const [, setLocation] = useLocation();
  const { settings } = useStore();
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= settings.freeShippingThreshold || total === 0 ? 0 : settings.shippingFee;
  const submitOrder = (event: FormEvent) => { event.preventDefault(); if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) return; onCheckout(customer); setCustomer({ name: "", phone: "", address: "" }); };
      return <main className="cart-page container"><div className="cart-head"><div><div className="eyebrow eyebrow-dark">خطوتك التالية</div><h1>سلتك</h1></div><span>{items.length} قطع مختارة</span></div>{items.length === 0 ? <div className="empty-state cart-empty"><ShoppingBag size={28} /><h2>سلتك تنتظر قطعة تحبينها</h2><p>خذي وقتك، واختاري ما يشبهك.</p><Link href="/shop" className="primary-button">ابدئي التسوق <ArrowLeft size={16} /></Link></div> : <div className="cart-layout"><div className="cart-items"><div className="cart-items-head"><span>القطعة</span><span>السعر</span><span>الكمية</span><span>الإجمالي</span><span /></div>{items.map((item) => <div className="cart-row" key={`${item.id}-${item.size}-${item.color}`}><div className="cart-product"><img src={item.image} alt={item.name} /><div><Link href={`/product/${item.id}`}>{item.name}</Link><small>{item.size} · <i style={{ backgroundColor: colorToCss(item.color) }} /> اللون: {colorName(item.color)}</small><button onClick={() => removeItem(item.id, item.size, item.color)}>إزالة</button></div></div><span className="cart-unit-price">{formatPrice(item.price)} ج.م</span><div className="quantity-control"><button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}><Minus size={14} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}><Plus size={14} /></button></div><strong className="cart-line-total">{formatPrice(item.price * item.quantity)} ج.م</strong><button className="remove-icon" onClick={() => removeItem(item.id, item.size, item.color)} aria-label="إزالة"><X size={17} /></button></div>)}<button className="clear-cart" onClick={clearCart}>إفراغ السلة</button></div><aside className="summary-card"><span className="summary-kicker">بيانات الاستلام</span><form className="checkout-form" onSubmit={submitOrder}><input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="اسم العميل" /><input required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="رقم الهاتف" dir="ltr" /><textarea required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="العنوان بالتفصيل" rows={2} /><div><span>المجموع الفرعي</span><strong>{formatPrice(total)} ج.م</strong></div><div><span>الشحن</span><strong>{shipping === 0 ? "مجاني" : `${formatPrice(shipping)} ج.م`}</strong></div>{shipping > 0 && <p className="shipping-hint">أضيفي {formatPrice(settings.freeShippingThreshold - total)} ج.م لتحصلي على شحن مجاني</p>}<div className="summary-total"><span>الإجمالي</span><strong>{formatPrice(total + shipping)} <small>ج.م</small></strong></div><button className="primary-button checkout-button" type="submit">إتمام الطلب وإرساله عبر واتساب <ArrowLeft size={16} /></button></form><button className="continue-shopping" onClick={() => setLocation("/shop")}>متابعة التسوق</button></aside></div>}</main>;
}

function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); if (email) setSent(true); };
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Logo /><p>نصمم بهدوء، لتعيشي يومكِ كما تحبينه.</p><div className="social-links"><a href="https://t.me/WafaaStoreOfficial" target="_blank" rel="noreferrer">تليجرام</a><a href="https://chat.whatsapp.com/HNESAHPK4Pp1z9IZYHdrPC" target="_blank" rel="noreferrer">واتساب</a><a href="https://www.facebook.com/share/g/19EMYuKjYJ/" target="_blank" rel="noreferrer">فيسبوك</a><a href="https://www.tiktok.com/@wafaaosmean" target="_blank" rel="noreferrer">تيك توك</a></div><a href="tel:+201026674042" className="phone-link">واتساب / تليفون: 01026674042</a></div><div><h3>تسوقي</h3><Link href="/shop">كل القطع</Link><Link href="/shop?category=outerwear">ملابس خارجية</Link><Link href="/shop?category=women">حريمي / بنات</Link><Link href="/shop?category=shoes">أحذية</Link></div><div><h3>نساعدكِ</h3><Link href="/about">عن وفاء</Link><Link href="/help">الأسئلة الشائعة والشحن</Link><Link href="/contact">تواصلي معنا</Link><Link href="/terms">الشروط والأحكام</Link></div><div className="newsletter"><h3>خذي وقتك.</h3><p>رسالة واحدة كل فترة، فيها جديد وفاء وما نحب أن نفوّته.</p>{sent ? <div className="sent-note"><Check size={17} /> وصلتنا رسالتك، أهلاً بكِ.</div> : <form onSubmit={submit}><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" aria-label="البريد الإلكتروني" /><button type="submit" aria-label="الاشتراك"><Send size={17} /></button></form>}</div></div><div className="container footer-bottom"><span className="copyright-trigger" title="للدخول إلى لوحة المالك: انقري مرتين" onDoubleClick={() => { window.location.href = "/admin" }}>© ٢٠٢٥ وفاء ستوديو. صُنع بحب.</span><span className="footer-bottom-links"><span>كل الحقوق محفوظة</span><Link href="/admin" className="admin-link">لوحة التحكم</Link></span></div></footer>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onClose, 2600); return () => window.clearTimeout(timer); }, [message, onClose]);
  return <div className="toast"><Check size={17} /><span>{message}</span><button onClick={onClose} aria-label="إغلاق"><X size={14} /></button></div>;
}

function WhatsAppFloat() {
  return <a className="whatsapp-float" href={whatsappUrl("مرحباً، أرغب في الاستفسار عن منتجات وفاء") } target="_blank" rel="noreferrer" aria-label="التواصل مع وفاء عبر واتساب"><MessageCircle size={23} /><span>تواصلي معنا</span></a>;
}

function ReviewPopup() {
  const { createReview } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("wafaa-review-prompted") === "1") return;
    const timer = window.setTimeout(() => { sessionStorage.setItem("wafaa-review-prompted", "1"); setOpen(true); }, 120000);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => setOpen(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createReview({ id: `REV-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), name: name.trim(), rating, comment: comment.trim(), status: "published" });
    setSent(true);
    window.setTimeout(close, 1800);
  };

  if (!open) return null;
  return <div className="review-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><button type="button" className="review-modal-close" onClick={close} aria-label="إغلاق"><X size={18} /></button>{sent ? <div className="review-success"><Check size={30} /><h2>شكراً لرأيكِ</h2><p>سيظهر تقييمك بعد المراجعة.</p></div> : <form onSubmit={submit}><span className="eyebrow eyebrow-dark">صوتكِ يهمنا</span><h2 id="review-modal-title">كيف كانت تجربتكِ مع وفاء؟</h2><p className="review-modal-intro">امنحينا لحظة صغيرة لنشارك رأيكِ مع عميلاتنا.</p><div className="review-star-picker" aria-label="اختاري التقييم من نجمة إلى خمس نجوم">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={value <= rating ? "selected" : ""} onClick={() => setRating(value)} aria-label={`${value} نجوم`}><Star size={25} fill="currentColor" /></button>)}</div><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="اسمكِ" aria-label="الاسم" /><textarea required value={comment} onChange={(event) => setComment(event.target.value)} placeholder="اكتبي تعليقكِ..." aria-label="التعليق" rows={4} /><button className="primary-button" type="submit">إرسال التقييم <ArrowLeft size={16} /></button></form>}</section></div>;
}

function AppShell() {
  const [location, setLocation] = useLocation();
  const { products, settings, createOrder, createMessage } = useStore();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem("wafaa-favorites") || "[]"));
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem("wafaa-cart") || "[]"));
  const [toast, setToast] = useState("");

  useEffect(() => { localStorage.setItem("wafaa-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("wafaa-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [location]);

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const addToCart = (product: Product, size = product.sizes[0], color = product.colors[0]) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id && item.size === size && item.color === color);
      return found ? current.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, size, color, quantity: 1 }];
    });
    setToast(`${product.name} أضيفت إلى سلتك`);
  };
  const updateQuantity = (id: string, size: string, color: string, quantity: number) => setCart((current) => quantity <= 0 ? current.filter((item) => !(item.id === id && item.size === size && item.color === color)) : current.map((item) => item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item));
  const removeItem = (id: string, size: string, color: string) => setCart((current) => current.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  const createCheckoutOrder = (customer: { name: string; phone: string; address: string }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const order = { id: `WF-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), customerName: customer.name, phone: customer.phone, address: customer.address, items: cart, subtotal, shipping, total: subtotal + shipping, status: "pending" as const };
    createOrder(order);
    openWhatsApp(orderWhatsAppMessage(order));
    void sendEmailNotification({ type: "order", order_id: order.id, customer_name: order.customerName, phone: order.phone, address: order.address, order_details: order.items.map((item) => `${item.name} × ${item.quantity}`).join(", "), total: `${order.total} ج.م` });
    setCart([]);
    setToast("تم تسجيل الطلب بنجاح");
    setLocation("/");
  };
  const submitContactMessage = (input: { name: string; email: string; message: string }) => {
    const message = { id: `MSG-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), ...input, status: "new" as const };
    createMessage(message);
    openWhatsApp(contactWhatsAppMessage(message));
    void sendEmailNotification({ type: "message", name: message.name, email: message.email, message: message.message });
  };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const path = location.split("?")[0];
  const productId = path.startsWith("/product/") ? path.replace("/product/", "") : "";
  const currentProduct = products.find((item) => item.id === productId);

  if (path === "/admin") return <AdminPage />;

  return (
    <div className="app-shell">
      <Header cartCount={cartCount} search={search} setSearch={setSearch} onMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="page-transition" key={path}>
      {path === "/" && <HomePage favorites={favorites} toggleFavorite={toggleFavorite} addProduct={addToCart} />}
      {path === "/shop" && <ShopPage favorites={favorites} toggleFavorite={toggleFavorite} addProduct={addToCart} search={search} />}
      {path === "/cart" && <CartPage items={cart} updateQuantity={updateQuantity} removeItem={removeItem} clearCart={() => setCart([])} onCheckout={createCheckoutOrder} />}
      {path === "/about" && <AboutPage />}
      {path === "/help" && <HelpPage />}
      {path === "/contact" && <ContactPage onSubmitMessage={submitContactMessage} />}
      {path === "/terms" && <TermsPage />}
      {path.startsWith("/product/") && currentProduct && <ProductPage product={currentProduct} onAdd={addToCart} />}
      {path.startsWith("/product/") && !currentProduct && <div className="empty-state page-empty"><h2>هذه القطعة غير موجودة</h2><Link href="/shop" className="primary-button">العودة للمتجر</Link></div>}
      </div>
      <Footer />
      <WhatsAppFloat />
      <ReviewPopup />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </ThemeProvider>
  );
}
