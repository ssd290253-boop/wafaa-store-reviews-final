import React, { useState, useEffect, useRef } from 'react';

// 🔑 كلمة المرور والبريد الافتراضيان
const DEFAULT_PASSCODE = "Wafaa@Admin2026!";
const DEFAULT_EMAIL = "owner@store.com";

interface Product {
  id: string;
  name: string;
  description: string;
  priceBefore: string;
  priceAfter: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  sizes: string[];
  colors: string[];
  returnPolicy: string;
  inStock: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
}

export const OwnerAdminModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'addProduct' | 'policies' | 'subscribers' | 'password'>('gallery');

  // بيانات الاعتماد
  const [currentPasscode, setCurrentPasscode] = useState(() => {
    return localStorage.getItem('wafaa_owner_passcode') || DEFAULT_PASSCODE;
  });
  const [ownerEmail, setOwnerEmail] = useState(() => {
    return localStorage.getItem('wafaa_owner_email') || DEFAULT_EMAIL;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_store_owner') === 'true';
  });

  const [inputPasscode, setInputPasscode] = useState('');
  const [error, setError] = useState('');

  // 1️⃣ معرض الوسائط
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('store_media_gallery');
    return saved ? JSON.parse(saved) : [
      { id: '1', url: 'https://via.placeholder.com/600x400/5c3a21/ffffff?text=صورة+افتراضية+1', type: 'image', title: 'صورة المعرض 1' },
      { id: '2', url: 'https://via.placeholder.com/600x400/3d2516/ffffff?text=صورة+افتراضية+2', type: 'image', title: 'صورة المعرض 2' }
    ];
  });
  
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // مراجع رفع الملفات المباشرة من الموبايل/اللابتوب
  const addMediaFileInputRef = useRef<HTMLInputElement>(null);
  const replaceMediaFileInputRef = useRef<HTMLInputElement>(null);
  const productMediaInputRef = useRef<HTMLInputElement>(null);

  // 2️⃣ إعدادات إضافة منتج
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [priceBefore, setPriceBefore] = useState('');
  const [priceAfter, setPriceAfter] = useState('');
  const [productMedia, setProductMedia] = useState('');
  const [productMediaType, setProductMediaType] = useState<'image' | 'video'>('image');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColorPicker, setCustomColorPicker] = useState('#8B4513');
  const [itemReturnPolicy, setItemReturnPolicy] = useState('قابل للإرجاع خلال 14 يوماً من الاستلام');
  const [inStock, setInStock] = useState(true);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // 3️⃣ كلمة المرور والملكية
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [newEmailInput, setNewEmailInput] = useState(ownerEmail);
  const [passMessage, setPassMessage] = useState('');

  // 4️⃣ السياسات والمشتركين
  const [returnPolicy, setReturnPolicy] = useState(() => localStorage.getItem('store_return_policy') || 'سياسة الاسترجاع خلال 14 يوماً.');
  const [shippingPolicy, setShippingPolicy] = useState(() => localStorage.getItem('store_shipping_policy') || 'الشحن والتوصيل خلال 2 - 5 أيام عمل.');
  const [policyMsg, setPolicyMsg] = useState('');
  const [newsletterEmails, setNewsletterEmails] = useState<string[]>([]);

  // الحفظ التلقائي
  useEffect(() => {
    localStorage.setItem('store_media_gallery', JSON.stringify(mediaList));
  }, [mediaList]);

  useEffect(() => {
    localStorage.setItem('store_products_list', JSON.stringify(products));
  }, [products]);

  // اختصار الفتح (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const savedEmails = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      setNewsletterEmails(savedEmails);
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode === currentPasscode) {
      setIsAuthenticated(true);
      localStorage.setItem('is_store_owner', 'true');
      setError('');
      setInputPasscode('');
    } else {
      setError('❌ كلمة المرور غير صحيحة!');
    }
  };

  // 📁 التعامل مع رفع الملفات المباشرة من الموبايل/اللابتوب للمعرض
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newItem: MediaItem = {
        id: Date.now().toString(),
        url: base64Url,
        type: isVideo ? 'video' : 'image',
        title: newMediaTitle.trim() || file.name
      };
      setMediaList([newItem, ...mediaList]);
      setNewMediaTitle('');
      if (addMediaFileInputRef.current) addMediaFileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  // 🔄 التعامل مع استبدال ملف من الجهاز مباشرة
  const handleReplaceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setMediaList(mediaList.map(item => item.id === replacingId ? {
        ...item,
        url: base64Url,
        type: isVideo ? 'video' : 'image'
      } : item));
      setReplacingId(null);
      if (replaceMediaFileInputRef.current) replaceMediaFileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const triggerReplace = (id: string) => {
    setReplacingId(id);
    replaceMediaFileInputRef.current?.click();
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('هل أنتِ متأكدة من حذف هذا الملف من المعرض؟')) {
      setMediaList(mediaList.filter(item => item.id !== id));
    }
  };

  // 📦 رفع صورة أو فيديو المنتج من الجهاز مباشرة
  const handleProductMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductMedia(event.target?.result as string);
      setProductMediaType(isVideo ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleAddColor = () => {
    if (!selectedColors.includes(customColorPicker)) {
      setSelectedColors([...selectedColors, customColorPicker]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    if (customSizeInput.trim() && !selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes([...selectedSizes, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !priceAfter || !productMedia) {
      alert('يرجى اختيار صورة أو فيديو للمنتج، وإدخال الاسم والسعر بعد الخصم!');
      return;
    }

    const newProd: Product = {
      id: Date.now().toString(),
      name: productName,
      description: productDesc,
      priceBefore,
      priceAfter,
      mediaUrl: productMedia,
      mediaType: productMediaType,
      sizes: selectedSizes,
      colors: selectedColors,
      returnPolicy: itemReturnPolicy,
      inStock
    };

    setProducts([newProd, ...products]);
    setProductSuccessMsg('✅ تم حفظ ونشر كارد المنتج الجديد تلقائياً في المتجر!');
    setProductName('');
    setProductDesc('');
    setPriceBefore('');
    setPriceAfter('');
    setProductMedia('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setTimeout(() => setProductSuccessMsg(''), 4000);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل أنتِ متأكدة من حذف كارد هذا المنتج من المتجر؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPassInput !== currentPasscode) {
      setPassMessage('❌ كلمة المرور القديمة التي أدخلتها غير صحيحة!');
      return;
    }
    if (newPassInput.length < 6) {
      setPassMessage('❌ يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل!');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassMessage('❌ كلمة المرور الجديدة وتأكيدها غير متطابقين!');
      return;
    }

    setCurrentPasscode(newPassInput);
    localStorage.setItem('wafaa_owner_passcode', newPassInput);

    if (newEmailInput.trim()) {
      setOwnerEmail(newEmailInput.trim());
      localStorage.setItem('wafaa_owner_email', newEmailInput.trim());
    }

    setPassMessage('✅ تم تغيير كلمة المرور وبيانات الملكية بنجاح!');
    setOldPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('store_return_policy', returnPolicy);
    localStorage.setItem('store_shipping_policy', shippingPolicy);
    setPolicyMsg('✅ تم حفظ السياسات بنجاح!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_store_owner');
    setIsOpen(false);
  };

  return (
    <>
      {/* عناصر رفع الملفات المخفية للاستدعاء البرمجي */}
      <input
        type="file"
        ref={replaceMediaFileInputRef}
        onChange={handleReplaceFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* الفوتر: النقر مرتين لفتح اللوحة */}
      <div className="w-full text-center py-4 bg-[#1e130a] text-[#d4c3b3] text-xs flex justify-center items-center gap-4 dir-rtl select-none border-t border-[#3d2716]">
        <span 
          onDoubleClick={() => setIsOpen(true)}
          className="cursor-pointer hover:text-[#f3e5d8] transition-colors font-medium"
          title="اضغط مرتين لفتح لوحة التحكم"
        >
          © جميع الحقوق محفوظة لمتجر وفاء
        </span>
      </div>

      {/* 🤎 لوحة التحكم باللون البني والبيج ملء الشاشة */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#1e130a] text-[#f5ebe0] w-full h-full overflow-y-auto dir-rtl font-sans">
          
          {/* الشريط العلوي الفاخر */}
          <header className="sticky top-0 z-10 bg-[#2a1a0e]/95 backdrop-blur-md border-b border-[#4a311c] px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <h1 className="text-xl font-bold text-[#e6ccb2]">
                  لوحة إدارة المالك الاحترافية
                </h1>
                <p className="text-xs text-[#b08ebb]">تحكم كامل في المنتجات والمعرض بألوان المتجر الهادئة</p>
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[#3d2716] text-[#e6ccb2] px-3 py-1.5 rounded-full border border-[#5c3a21]">
                  👤 {ownerEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-900/30 hover:bg-red-800/50 text-red-200 border border-red-700/40 px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  خروج
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-[#3d2716] hover:bg-[#4a311c] text-[#e6ccb2] px-4 py-2 rounded-xl text-xs font-semibold border border-[#5c3a21] transition"
                >
                  إغلاق ✖
                </button>
              </div>
            )}
          </header>

          <main className="p-6 max-w-7xl mx-auto">
            {!isAuthenticated ? (
              /* شاشة تسجيل الدخول بالتصميم البني الداكن والبيج */
              <div className="max-w-md mx-auto my-20 bg-[#2a1a0e] border border-[#4a311c] p-8 rounded-3xl shadow-2xl text-center">
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-[#e6ccb2] mb-2">تسجيل دخول المالك</h2>
                <p className="text-[#c5a880] text-sm mb-6">أدخل كلمة المرور للتحكم في كافة إعدادات متجرك</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="password"
                    placeholder="أدخل كلمة المرور..."
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value)}
                    className="w-full p-3.5 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-center text-lg text-[#f5ebe0] focus:ring-2 focus:ring-[#b08ebb] outline-none"
                    autoFocus
                  />
                  {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
                  <button
                    type="submit"
                    className="w-full bg-[#7f4f24] hover:bg-[#936639] text-[#f5ebe0] font-bold py-3.5 rounded-xl transition shadow-lg"
                  >
                    دخول لوحة التحكم
                  </button>
                </form>
              </div>
            ) : (
              /* محتوى اللوحة */
              <div>
                {/* 📊 ملخص سريع للمتجر */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#2a1a0e] border border-[#4a311c] p-4 rounded-2xl flex items-center gap-4">
                    <span className="text-3xl bg-[#3d2716] p-3 rounded-xl">🛍️</span>
                    <div>
                      <p className="text-xs text-[#c5a880]">إجمالي المنتجات</p>
                      <p className="text-xl font-bold text-[#e6ccb2]">{products.length} منتج</p>
                    </div>
                  </div>
                  <div className="bg-[#2a1a0e] border border-[#4a311c] p-4 rounded-2xl flex items-center gap-4">
                    <span className="text-3xl bg-[#3d2716] p-3 rounded-xl">📸</span>
                    <div>
                      <p className="text-xs text-[#c5a880]">وسائط المعرض</p>
                      <p className="text-xl font-bold text-[#e6ccb2]">{mediaList.length} ملف</p>
                    </div>
                  </div>
                  <div className="bg-[#2a1a0e] border border-[#4a311c] p-4 rounded-2xl flex items-center gap-4">
                    <span className="text-3xl bg-[#3d2716] p-3 rounded-xl">📬</span>
                    <div>
                      <p className="text-xs text-[#c5a880]">مشتركي النشرة</p>
                      <p className="text-xl font-bold text-[#e6ccb2]">{newsletterEmails.length} مشترك</p>
                    </div>
                  </div>
                </div>

                {/* شريط التبويبات بالبيج والبني */}
                <div className="flex bg-[#2a1a0e] p-2 rounded-2xl border border-[#4a311c] mb-8 overflow-x-auto gap-2">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'gallery' ? 'bg-[#7f4f24] text-[#f5ebe0] shadow-md' : 'text-[#c5a880] hover:bg-[#3d2716]'}`}
                  >
                    🖼️ معرض الوسائط ({mediaList.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('addProduct')}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'addProduct' ? 'bg-[#7f4f24] text-[#f5ebe0] shadow-md' : 'text-[#c5a880] hover:bg-[#3d2716]'}`}
                  >
                    ➕ إضافة منتج جديد ({products.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('policies')}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'policies' ? 'bg-[#7f4f24] text-[#f5ebe0] shadow-md' : 'text-[#c5a880] hover:bg-[#3d2716]'}`}
                  >
                    📜 سياسات المتجر
                  </button>
                  <button
                    onClick={() => setActiveTab('subscribers')}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'subscribers' ? 'bg-[#7f4f24] text-[#f5ebe0] shadow-md' : 'text-[#c5a880] hover:bg-[#3d2716]'}`}
                  >
                    📬 المشتركين
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'password' ? 'bg-[#7f4f24] text-[#f5ebe0] shadow-md' : 'text-[#c5a880] hover:bg-[#3d2716]'}`}
                  >
                    🔑 كلمة المرور والملكية
                  </button>
                </div>

                {/* 1️⃣ معرض الوسائط - اختيار رفع مباشر من الهاتف أو الكمبيوتر */}
                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <div className="bg-[#2a1a0e] border border-[#4a311c] p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-[#e6ccb2] mb-4 flex items-center gap-2">
                        <span>📱</span> رفع صورة أو فيديو جديد من أجهزة الجوال أو اللابتوب
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <input
                          type="text"
                          placeholder="عنوان أو اسم اختياري..."
                          value={newMediaTitle}
                          onChange={(e) => setNewMediaTitle(e.target.value)}
                          className="p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7f4f24]"
                        />

                        {/* زر اختيار الملفات المباشر */}
                        <div className="md:col-span-2 flex gap-3">
                          <input
                            type="file"
                            ref={addMediaFileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*,video/*"
                            className="hidden"
                            id="galleryFileInput"
                          />
                          <label
                            htmlFor="galleryFileInput"
                            className="flex-1 bg-[#7f4f24] hover:bg-[#936639] text-[#f5ebe0] font-bold py-3 px-4 rounded-xl cursor-pointer text-center text-sm transition flex items-center justify-center gap-2 border border-[#a68a64]"
                          >
                            <span>📁</span> اختيار ملف من الموبايل / الجهاز
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* عرض المعرض */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {mediaList.map((item) => (
                        <div key={item.id} className="bg-[#2a1a0e] border border-[#4a311c] rounded-2xl overflow-hidden shadow-xl flex flex-col">
                          <div className="h-56 bg-[#1e130a] overflow-hidden relative flex items-center justify-center">
                            {item.type === 'image' ? (
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <video src={item.url} controls className="w-full h-full object-cover" />
                            )}
                            <span className="absolute top-2 right-2 bg-[#1e130a]/90 text-xs px-2.5 py-1 rounded-full text-[#e6ccb2] border border-[#5c3a21]">
                              {item.type === 'image' ? '🖼️ صورة' : '🎥 فيديو'}
                            </span>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <p className="font-semibold text-sm text-[#e6ccb2] mb-3 truncate">{item.title || 'بدون عنوان'}</p>
                            
                            {/* أزرار الاستبدال المباشر والحذف */}
                            <div className="flex gap-2 pt-2 border-t border-[#3d2716]">
                              <button
                                onClick={() => triggerReplace(item.id)}
                                className="flex-1 bg-[#936639]/30 hover:bg-[#936639]/50 text-[#e6ccb2] border border-[#a68a64]/40 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                              >
                                🔄 استبدال من الجهاز
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(item.id)}
                                className="bg-red-900/30 hover:bg-red-800/50 text-red-200 border border-red-700/40 px-3 py-2 rounded-xl text-xs font-semibold transition"
                              >
                                🗑️ حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2️⃣ إضافة منتج جديد + معاينة Card كبيرة تلقائية */}
                {activeTab === 'addProduct' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* النموذج الخانات */}
                      <div className="lg:col-span-7 bg-[#2a1a0e] border border-[#4a311c] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
                        <div className="border-b border-[#3d2716] pb-4">
                          <h3 className="text-2xl font-bold text-[#e6ccb2]">✨ إضافة منتج جديد</h3>
                          <p className="text-xs text-[#c5a880] mt-1">أدخلي تفاصيل المنتج وتلقائياً تتشكل Card كبيرة احترافية بالجانب المقابل</p>
                        </div>

                        {productSuccessMsg && (
                          <div className="p-4 bg-emerald-900/40 border border-emerald-600/40 text-emerald-200 rounded-2xl text-sm font-semibold text-center">
                            {productSuccessMsg}
                          </div>
                        )}

                        <form onSubmit={handleCreateProduct} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-[#c5a880] mb-2">اسم المنتج:*</label>
                              <input
                                type="text"
                                placeholder="مثال: فستان سهرة مخمل بني"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7f4f24]"
                                required
                              />
                            </div>

                            {/* رفع صورة أو فيديو المنتج المباشر */}
                            <div>
                              <label className="block text-xs font-semibold text-[#c5a880] mb-2">صورة أو فيديو المنتج:*</label>
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  ref={productMediaInputRef}
                                  onChange={handleProductMediaUpload}
                                  accept="image/*,video/*"
                                  className="hidden"
                                  id="productMediaFileInput"
                                />
                                <label
                                  htmlFor="productMediaFileInput"
                                  className="flex-1 bg-[#3d2716] hover:bg-[#4a311c] text-[#e6ccb2] border border-[#5c3a21] p-3 rounded-xl text-xs font-bold text-center cursor-pointer transition flex items-center justify-center gap-2"
                                >
                                  🎬 {productMedia ? 'تغيير الملف المحدد' : 'رفع صورة/فيديو من الجهاز'}
                                </label>
                              </div>
                              {productMedia && (
                                <p className="text-xs text-emerald-400 mt-2 font-medium">✓ تم رفع ({productMediaType === 'image' ? 'صورة' : 'فيديو'}) للبطاقة</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#c5a880] mb-2">السعر قبل الخصم (اختياري):</label>
                              <input
                                type="text"
                                placeholder="مثال: 1500 ج.م"
                                value={priceBefore}
                                onChange={(e) => setPriceBefore(e.target.value)}
                                className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#c5a880] mb-2">السعر بعد الخصم (السعر النهائي):*</label>
                              <input
                                type="text"
                                placeholder="مثال: 1100 ج.م"
                                value={priceAfter}
                                onChange={(e) => setPriceAfter(e.target.value)}
                                className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                                required
                              />
                            </div>
                          </div>

                          {/* المقاسات */}
                          <div>
                            <label className="block text-xs font-semibold text-[#c5a880] mb-2">المقاسات المتوفرة:</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {['S', 'M', 'L', 'XL', 'XXL', '3XL', 'مقاس موحد'].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => toggleSize(size)}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${selectedSizes.includes(size) ? 'bg-[#7f4f24] text-[#f5ebe0] border-[#a68a64]' : 'bg-[#1e130a] text-[#c5a880] border-[#3d2716]'}`}
                                >
                                  {size} {selectedSizes.includes(size) && '✓'}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 max-w-sm">
                              <input
                                type="text"
                                placeholder="مقاس آخر (مثال: 38)..."
                                value={customSizeInput}
                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                className="flex-1 p-2.5 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-xs outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomSize}
                                className="bg-[#3d2716] hover:bg-[#4a311c] text-[#e6ccb2] px-4 py-2 rounded-xl text-xs font-bold"
                              >
                                إضافة
                              </button>
                            </div>
                          </div>

                          {/* الألوان */}
                          <div>
                            <label className="block text-xs font-semibold text-[#c5a880] mb-2">ألوان المنتج المتاحة:</label>
                            <div className="flex items-center gap-3 mb-3">
                              <input
                                type="color"
                                value={customColorPicker}
                                onChange={(e) => setCustomColorPicker(e.target.value)}
                                className="w-10 h-10 rounded-xl cursor-pointer bg-[#1e130a] border border-[#5c3a21] p-1"
                              />
                              <button
                                type="button"
                                onClick={handleAddColor}
                                className="bg-[#3d2716] border border-[#5c3a21] text-[#e6ccb2] px-4 py-2 rounded-xl text-xs font-bold"
                              >
                                إضافة هذا اللون 🎨
                              </button>
                            </div>
                            {selectedColors.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-3 bg-[#1e130a] rounded-xl border border-[#3d2716]">
                                {selectedColors.map((color, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 bg-[#2a1a0e] border border-[#5c3a21] px-3 py-1 rounded-full text-xs">
                                    <span className="w-4 h-4 rounded-full border border-[#a68a64]" style={{ backgroundColor: color }}></span>
                                    <span>{color}</span>
                                    <button type="button" onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))} className="text-red-400 font-bold ml-1">✕</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-[#c5a880] mb-2">سياسة الاسترجاع للمنتج:</label>
                              <input
                                type="text"
                                value={itemReturnPolicy}
                                onChange={(e) => setItemReturnPolicy(e.target.value)}
                                className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                              <input
                                type="checkbox"
                                id="inStockCheck"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                                className="w-5 h-5 accent-[#7f4f24] rounded cursor-pointer"
                              />
                              <label htmlFor="inStockCheck" className="text-sm font-semibold text-[#e6ccb2] cursor-pointer">
                                المنتج متوفر جاهز في المخزن
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#c5a880] mb-2">وصف تفصيلي للمنتج:</label>
                            <textarea
                              rows={3}
                              placeholder="اكتبي التفاصيل القماش، التصميم، والعناية بالقطعة..."
                              value={productDesc}
                              onChange={(e) => setProductDesc(e.target.value)}
                              className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#7f4f24] hover:bg-[#936639] text-[#f5ebe0] font-bold py-4 rounded-2xl transition shadow-xl text-base"
                          >
                            حفظ ونشر المنتج الجديد 🎉
                          </button>
                        </form>
                      </div>

                      {/* 🃏 معاينة Card الكبيرة التلقائية */}
                      <div className="lg:col-span-5 sticky top-24">
                        <div className="text-xs font-bold text-[#c5a880] mb-3 flex items-center justify-between">
                          <span>👁️ معاينة شكل الـ Card بالمتجر:</span>
                          <span className="bg-[#3d2716] text-[#e6ccb2] px-2.5 py-1 rounded-full border border-[#5c3a21]">تحديث تلقائي</span>
                        </div>

                        <div className="bg-[#2a1a0e] border border-[#a68a64]/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all">
                          {/* صورة/فيديو المنتج */}
                          <div className="h-72 bg-[#1e130a] relative flex items-center justify-center overflow-hidden border-b border-[#3d2716]">
                            {productMedia ? (
                              productMediaType === 'image' ? (
                                <img src={productMedia} alt="معاينة" className="w-full h-full object-cover" />
                              ) : (
                                <video src={productMedia} controls className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="text-center p-6 text-[#c5a880]">
                                <span className="text-5xl block mb-2">🖼️</span>
                                <p className="text-xs">قومي برفع صورة أو فيديو لمشاهدة المعاينة مباشرة</p>
                              </div>
                            )}

                            {/* شارة التوفر */}
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md ${inStock ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/40' : 'bg-red-900/90 text-red-200 border border-red-500/40'}`}>
                              {inStock ? 'متوفر بالمخزن ✓' : 'غير متوفر حالياً ✕'}
                            </span>
                          </div>

                          {/* تفاصيل الكارد */}
                          <div className="p-6 space-y-4">
                            <div>
                              <h4 className="text-xl font-bold text-[#e6ccb2] truncate">{productName || 'اسم المنتج هنا'}</h4>
                              <p className="text-xs text-[#c5a880] mt-1 line-clamp-2">{productDesc || 'الوصف الخاص بالمنتج سيظهر في هذا المكان...'}</p>
                            </div>

                            {/* الأسعار */}
                            <div className="flex items-center gap-3 bg-[#1e130a] p-3 rounded-2xl border border-[#3d2716]">
                              <span className="text-lg font-extrabold text-[#f5ebe0]">{priceAfter || '0'} ج.م</span>
                              {priceBefore && (
                                <span className="text-xs text-[#a68a64] line-through font-medium">{priceBefore} ج.م</span>
                              )}
                            </div>

                            {/* المقاسات */}
                            {selectedSizes.length > 0 && (
                              <div>
                                <span className="text-xs text-[#c5a880] block mb-1.5 font-semibold">المقاسات:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedSizes.map((s, idx) => (
                                    <span key={idx} className="bg-[#3d2716] text-[#e6ccb2] border border-[#5c3a21] px-2.5 py-1 rounded-lg text-xs font-bold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* الألوان */}
                            {selectedColors.length > 0 && (
                              <div>
                                <span className="text-xs text-[#c5a880] block mb-1.5 font-semibold">الألوان المتاحة:</span>
                                <div className="flex gap-2">
                                  {selectedColors.map((c, idx) => (
                                    <span key={idx} className="w-5 h-5 rounded-full border border-[#a68a64] shadow-sm" style={{ backgroundColor: c }}></span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* سياسة الاسترجاع */}
                            <div className="pt-2 border-t border-[#3d2716] text-xs text-[#c5a880] flex items-center gap-1">
                              <span>🔄</span> {itemReturnPolicy}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🛒 قائمة الكاردات المنشورة في المتجر فعلياً */}
                    <div className="bg-[#2a1a0e] border border-[#4a311c] p-6 sm:p-8 rounded-3xl space-y-6">
                      <div className="flex justify-between items-center border-b border-[#3d2716] pb-4">
                        <h3 className="text-xl font-bold text-[#e6ccb2]">🛍️ كاردات المنتجات المنشورة على المتجر ({products.length})</h3>
                      </div>

                      {products.length === 0 ? (
                        <p className="text-center text-[#c5a880] text-sm py-8">لا يوجد منتجات منشورة حالياً.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {products.map((prod) => (
                            <div key={prod.id} className="bg-[#1e130a] border border-[#4a311c] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                              <div>
                                <div className="h-48 bg-[#2a1a0e] relative overflow-hidden">
                                  {prod.mediaType === 'image' ? (
                                    <img src={prod.mediaUrl} alt={prod.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <video src={prod.mediaUrl} controls className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="p-4 space-y-2">
                                  <h5 className="font-bold text-sm text-[#e6ccb2] truncate">{prod.name}</h5>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#f5ebe0]">{prod.priceAfter} ج.م</span>
                                    {prod.priceBefore && <span className="text-xs text-[#a68a64] line-through">{prod.priceBefore} ج.م</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 pt-0">
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="w-full bg-red-900/30 hover:bg-red-800/50 text-red-200 border border-red-700/40 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                  🗑️ حذف المنتج
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3️⃣ السياسات */}
                {activeTab === 'policies' && (
                  <div className="max-w-2xl mx-auto bg-[#2a1a0e] border border-[#4a311c] p-8 rounded-3xl space-y-6">
                    <h3 className="text-xl font-bold text-[#e6ccb2] border-b border-[#3d2716] pb-3">إدارة سياسات المتجر</h3>
                    <form onSubmit={handleSavePolicies} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-2">سياسة الاسترجاع والاستبدال:</label>
                        <textarea
                          rows={4}
                          value={returnPolicy}
                          onChange={(e) => setReturnPolicy(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-2">سياسة الشحن والتوصيل:</label>
                        <textarea
                          rows={4}
                          value={shippingPolicy}
                          onChange={(e) => setShippingPolicy(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                        />
                      </div>
                      {policyMsg && <p className="text-xs text-emerald-400 font-semibold">{policyMsg}</p>}
                      <button
                        type="submit"
                        className="w-full bg-[#7f4f24] hover:bg-[#936639] text-[#f5ebe0] font-bold py-3 rounded-xl transition"
                      >
                        حفظ التعديلات
                      </button>
                    </form>
                  </div>
                )}

                {/* 4️⃣ النشرة البريدية */}
                {activeTab === 'subscribers' && (
                  <div className="max-w-2xl mx-auto bg-[#2a1a0e] border border-[#4a311c] p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-[#e6ccb2] border-b border-[#3d2716] pb-3 mb-4">قائمة مشتركي النشرة البريدية</h3>
                    {newsletterEmails.length === 0 ? (
                      <p className="text-center text-[#c5a880] text-sm py-8">لا يوجد مشتركون حتي الآن.</p>
                    ) : (
                      <ul className="divide-y divide-[#3d2716] bg-[#1e130a] rounded-2xl border border-[#3d2716] max-h-80 overflow-y-auto">
                        {newsletterEmails.map((email, idx) => (
                          <li key={idx} className="p-4 text-sm text-[#e6ccb2] flex justify-between items-center">
                            <span>📧 {email}</span>
                            <span className="text-xs text-[#c5a880]"># {idx + 1}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 5️⃣ تغيير كلمة المرور والملكية */}
                {activeTab === 'password' && (
                  <div className="max-w-md mx-auto bg-[#2a1a0e] border border-[#4a311c] p-8 rounded-3xl space-y-6">
                    <div className="text-center border-b border-[#3d2716] pb-4">
                      <h3 className="text-xl font-bold text-[#e6ccb2]">تغيير كلمة المرور والملكية</h3>
                      <p className="text-xs text-[#c5a880] mt-1">يجب إدخال كلمة المرور القديمة أولاً لنقل الملكية أو تعديل كلمة المرور</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-1">البريد الإلكتروني للمالك:</label>
                        <input
                          type="email"
                          value={newEmailInput}
                          onChange={(e) => setNewEmailInput(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-1">كلمة المرور القديمة (الحالية):</label>
                        <input
                          type="password"
                          placeholder="كلمة المرور القديمة"
                          value={oldPassInput}
                          onChange={(e) => setOldPassInput(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-1">كلمة المرور الجديدة:</label>
                        <input
                          type="password"
                          placeholder="كلمة المرور الجديدة"
                          value={newPassInput}
                          onChange={(e) => setNewPassInput(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#c5a880] mb-1">تأكيد كلمة المرور الجديدة:</label>
                        <input
                          type="password"
                          placeholder="تأكيد كلمة المرور الجديدة"
                          value={confirmPassInput}
                          onChange={(e) => setConfirmPassInput(e.target.value)}
                          className="w-full p-3 bg-[#1e130a] border border-[#5c3a21] rounded-xl text-sm outline-none"
                          required
                        />
                      </div>

                      {passMessage && (
                        <p className={`text-xs font-semibold p-3 rounded-xl ${passMessage.includes('✅') ? 'bg-emerald-950/80 text-emerald-200' : 'bg-red-950/80 text-red-200'}`}>
                          {passMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#7f4f24] hover:bg-[#936639] text-[#f5ebe0] font-bold py-3.5 rounded-xl transition shadow-lg"
                      >
                        حفظ البيانات الجديدة
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
};