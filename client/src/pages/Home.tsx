import { useState } from "react";
import { Link } from "wouter";
import { 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

import { categoryItems, FALLBACK_PRODUCT_IMAGE } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { CategoryId } from "@/lib/types";

export default function Home() {
  const store = useStore() as any;
  const { products = [], settings = {}, media = {} } = store;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p: any) => p.category === selectedCategory);

  // البانرات: تدعم عدد لا محدود (لو مفيش صور مضافة بتجيب الصورة الافتراضية)
  const heroBanners: string[] = Array.isArray(media?.heroBanners) && media.heroBanners.length > 0 
    ? media.heroBanners 
    : [FALLBACK_PRODUCT_IMAGE];

  const aboutImage: string = media?.aboutImage || FALLBACK_PRODUCT_IMAGE;

  // الفيديوهات: تدعم أي عدد بدون قيود (تصفية الفاضي فقط وعرض الكل)
  const rawVideos = media?.videos;
  const videos: string[] = Array.isArray(rawVideos) 
    ? rawVideos.filter((v: string) => Boolean(v && v.trim() !== ""))
    : typeof rawVideos === "string" && rawVideos.trim() !== "" 
      ? [rawVideos] 
      : [];

  const nextBanner = () => {
    setCurrentBannerIndex((prev: number) => (prev + 1) % heroBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev: number) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  return (
    <div className="home-page">
      {/* 1. قسم البانر الرئيسي (عدد لا محدود من البانرات) */}
      <section className="hero-banner relative overflow-hidden bg-stone-100 rounded-2xl mb-12">
        <div className="relative h-[420px] md:h-[500px] w-full">
          {heroBanners.map((imgUrl: string, idx: number) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentBannerIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={imgUrl}
                alt={`Hero Banner ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8 md:p-12">
                <div className="text-white max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
                    <Sparkles size={14} /> تشكيلة جديدة
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    أناقة وفاء تتحدث عنكِ
                  </h1>
                  <p className="text-stone-200 text-sm md:text-base mb-6">
                    اكتشفي أحدث صيحات الموضة المصممة بعنايةلتناسب أسلوبكِ الفريد.
                  </p>
                  <a href="#catalog" className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-stone-100 transition-all">
                    تسوقي الآن <ArrowLeft size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {heroBanners.length > 1 && (
            <div className="absolute inset-0 z-20 flex items-center justify-between p-4 pointer-events-none">
              <button
                type="button"
                onClick={prevBanner}
                className="pointer-events-auto p-2 rounded-full bg-white/80 text-stone-800 hover:bg-white transition shadow"
              >
                <ChevronRight size={22} />
              </button>
              <button
                type="button"
                onClick={nextBanner}
                className="pointer-events-auto p-2 rounded-full bg-white/80 text-stone-800 hover:bg-white transition shadow"
              >
                <ChevronLeft size={22} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. مميزات المتجر */}
      <section className="container mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200/80">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">شحن مجاني</h4>
              <p className="text-xs text-stone-600">للطلبات فوق {settings?.freeShippingThreshold || 1000} ج.م</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">سياسة الإرجاع</h4>
              <p className="text-xs text-stone-600">مرونة في الإرجاع خلال {settings?.returnPolicyDays || 14} يومًا</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">جودة مضمونة</h4>
              <p className="text-xs text-stone-600">خامات ممتازة وتصاميم أصلية</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. معرض الفيديوهات (يدعم عدد لا محدود تلقائياً) */}
      {videos.length > 0 && (
        <section className="container mb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">عروض حية</span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">معرض الفيديوهات</h2>
          </div>
          {/* شبكة مرنة تعرض أي عدد من الفيديوهات بأي حجم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((videoUrl: string, i: number) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-black shadow-md aspect-[9/16] relative">
                <video src={videoUrl} controls className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. المنتجات */}
      <section id="catalog" className="container mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">كتالوج المنتجات</span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">تسوقي أحدث القطع</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryItems.map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="group relative bg-white rounded-2xl border border-stone-200/70 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                  <img
                    src={product.image || FALLBACK_PRODUCT_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                      {product.badge}
                    </span>
                  )}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-stone-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      جديد
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-stone-500">{product.categoryLabel}</span>
                    <h3 className="font-bold text-stone-900 mt-1 text-base line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">{product.subtitle}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{formatPrice(product.price)} ج.م</span>
                        {product.oldPrice && (
                          <span className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)} ج.م</span>
                        )}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                          <Star size={12} fill="currentColor" />
                          <span>{product.rating}</span>
                          <span className="text-stone-400">({product.reviews})</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/product/${product.id}`}
                      className="p-2.5 rounded-xl bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white transition"
                    >
                      <ShoppingBag size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <p className="text-stone-500">لا توجد منتجات متوفرة في هذا التصنيف حالياً.</p>
          </div>
        )}
      </section>

      {/* 5. عن وفاء */}
      <section className="container mb-16">
        <div className="bg-stone-900 text-white rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-8 md:p-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 block">قصتنا</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">عن متجر وفاء</h2>
            <p className="text-stone-300 leading-relaxed mb-6">
              نسعى لتقديم تجربة تسوق فريدة تدمج بين الأصالة والأناقة العصرية. اخترنا لكم أفضل الخامات والتصاميم بعناية فائقة لتضمن لكِ إطلالة متألقة في كل مناسبة.
            </p>
          </div>
          <div className="h-80 md:h-full min-h-[320px]">
            <img src={aboutImage} alt="عن وفاء" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}