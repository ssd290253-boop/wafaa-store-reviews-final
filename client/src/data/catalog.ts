import type { CategoryId, Product, StoreMedia, StoreSettings } from "@/lib/types";

export const image = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=88`;

/** Used when a product is saved from the admin dashboard without a photo. */
export const FALLBACK_PRODUCT_IMAGE = image("photo-1445205170230-053b83016050", 900);

export const categoryLabels: Record<Exclude<CategoryId, "all">, string> = {
  outerwear: "ملابس خارجية",
  underwear: "أساسيات",
  women: "حريمي / بنات",
  shoes: "أحذية",
};

export const categoryItems: { id: CategoryId; label: string; note: string }[] = [
  { id: "all", label: "كل القطع", note: "48 قطعة" },
  { id: "outerwear", label: "خارجية", note: "طبقات هادئة" },
  { id: "underwear", label: "أساسيات", note: "كل يوم" },
  { id: "women", label: "حريمي / بنات", note: "تفاصيل ناعمة" },
  { id: "shoes", label: "أحذية", note: "خطوات مريحة" },
];

/** Seed catalog. The live catalog lives in localStorage once the owner makes any change — see lib/store.tsx. */
export const defaultProducts: Product[] = [
  {
    id: "linen-overshirt",
    name: "قميص لينن سحابي",
    subtitle: "قصّة مريحة · كتّان طبيعي",
    category: "outerwear",
    categoryLabel: "ملابس خارجية",
    price: 289,
    oldPrice: 360,
    badge: "الأكثر مبيعاً",
    rating: 4.9,
    reviews: 86,
    colors: ["بيج فاتح", "أسود فحمي", "بني وردي"],
    sizes: ["S", "M", "L", "XL"],
    image: image("photo-1525507119028-ed4c629a60a3", 900),
    description: "قميص يومي من الكتّان الطبيعي، مصمم بطبقات خفيفة وقصّة تنساب بسهولة من الوفاءح إلى المساء.",
    isNew: true,
  },
  {
    id: "soft-knit-set",
    name: "طقم ناعم بلون الرمل",
    subtitle: "راحة ممتدة · ملمس دافئ",
    category: "women",
    categoryLabel: "حريمي / بنات",
    price: 329,
    oldPrice: 410,
    badge: "خصم 20%",
    rating: 4.8,
    reviews: 54,
    colors: ["بيج رملي", "بني رمادي", "وردي باهت"],
    sizes: ["S", "M", "L"],
    image: image("photo-1490481651871-ab68de25d43d", 900),
    description: "طقم من قطعتين بخامة ناعمة وانسيابية، يرافق إطلالتك بهدوء ويمنحك راحة لا تنتهي.",
  },
  {
    id: "everyday-mules",
    name: "شبشب إيفا اليومي",
    subtitle: "جلد ناعم · نعل مريح",
    category: "shoes",
    categoryLabel: "أحذية",
    price: 199,
    badge: "وصل حديثاً",
    rating: 4.7,
    reviews: 31,
    colors: ["بني عسلي", "عاجي"],
    sizes: ["36", "37", "38", "39", "40"],
    image: image("photo-1543163521-1bf539c55dd2", 900),
    description: "تصميم بسيط يرفع كل إطلالة، بجلد ناعم ونعل خفيف لخطوات أكثر راحة طوال اليوم.",
    isNew: true,
  },
  {
    id: "silk-scarf",
    name: "وشاح حرير ندى",
    subtitle: "حرير مطبوع · لمسة أخيرة",
    category: "women",
    categoryLabel: "حريمي / بنات",
    price: 149,
    oldPrice: 185,
    badge: "خصم 19%",
    rating: 4.9,
    reviews: 42,
    colors: ["وردي ترابي", "أخضر زيتي", "ذهبي هادئ"],
    sizes: ["مقاس واحد"],
    image: image("photo-1551488831-00ddcb6c6bd3", 900),
    description: "وشاح حريري خفيف برسمة هادئة، يضيف لمسة لون محسوبة إلى أبسط إطلالاتك.",
  },
  {
    id: "cotton-tee",
    name: "تيشيرت قطن يومي",
    subtitle: "قطن عضوي · قصّة مستقيمة",
    category: "underwear",
    categoryLabel: "أساسيات",
    price: 99,
    badge: "أساسي لا غنى عنه",
    rating: 4.8,
    reviews: 122,
    colors: ["أوف وايت", "فحمي", "تاوب", "طوبي"],
    sizes: ["S", "M", "L", "XL"],
    image: image("photo-1529139574466-a303027c1d8b", 900),
    description: "قطعة أساسية من القطن العضوي، بقصّة مستقيمة وحواف نظيفة لتناسب كل يوم وكل طبقة.",
  },
  {
    id: "relaxed-trouser",
    name: "بنطال واسع هادئ",
    subtitle: "تطريز ناعم · خصر مريح",
    category: "outerwear",
    categoryLabel: "ملابس خارجية",
    price: 249,
    oldPrice: 295,
    badge: "خصم 15%",
    rating: 4.6,
    reviews: 28,
    colors: ["رمادي بيج", "فحمي أخضر", "بيج وردي"],
    sizes: ["S", "M", "L", "XL"],
    image: image("photo-1525507119028-ed4c629a60a3", 900),
    description: "بنطال واسع بانسيابية محسوبة، يمنح الحركة شكلها الجميل وراحة تناسب إيقاعك اليومي.",
  },
  {
    id: "home-robe",
    name: "روب وفاءحي من وفاء",
    subtitle: "قطن مغسول · إحساس خفيف",
    category: "underwear",
    categoryLabel: "أساسيات",
    price: 219,
    badge: "وفاء هوم",
    rating: 4.9,
    reviews: 37,
    colors: ["عاجي", "ساج"],
    sizes: ["S", "M", "L"],
    image: image("photo-1551488831-00ddcb6c6bd3", 900),
    description: "روب وفاءحي خفيف للبيت واللحظات البطيئة، بخامة قطنية مغسولة تزيد نعومتها مع الوقت.",
  },
  {
    id: "leather-sandal",
    name: "صندل رِواق الجلدي",
    subtitle: "جلد طبيعي · تصميم صيفي",
    category: "shoes",
    categoryLabel: "أحذية",
    price: 239,
    oldPrice: 275,
    badge: "خصم 13%",
    rating: 4.7,
    reviews: 19,
    colors: ["بني عسلي", "عاجي دافئ"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    image: image("photo-1562273138-f46be4ebdf33", 900),
    description: "صندل جلدي خفيف يوازن بين البساطة والراحة، بتفاصيل صُنعت لتبقى في خزانة الصيف.",
  },
];

export const defaultSettings: StoreSettings = {
  returnPolicyDays: 14,
  returnPolicyText:
    "يمكنكِ طلب الإرجاع خلال 14 يوماً من استلام الطلب، بشرط أن تكون القطعة بحالتها الأصلية، لم تُستخدم أو تُغسل، ومعها بطاقاتها وتغليفها الأصلي. للبدء، تواصلي معنا عبر واتساب مع رقم الطلب وسنرشدكِ لباقي الخطوات.",
  freeShippingThreshold: 350,
  shippingFee: 25,
  termsText:
    "باستخدامكِ لمتجر وفاء فإنكِ توافقين على شروط الشراء التالية: الأسعار المعروضة تشمل الضريبة حيثما ينطبق ذلك، ويتم تأكيد كل طلب عبر رسالة واتساب أو بريد إلكتروني قبل الشحن. تحتفظ وفاء بحق تعديل الأسعار وتوفر المنتجات دون إشعار مسبق. لأي استفسار حول طلبك يمكنك التواصل معنا في أي وقت.",
};

export const defaultMedia: StoreMedia = {
  logo: "",
  heroBanners: [image("photo-1483985988355-763728e1935b", 1200)],
  aboutImage: image("photo-1496747611176-843222e1e57c", 1100),
};
