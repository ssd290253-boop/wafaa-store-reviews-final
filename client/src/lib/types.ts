export type CategoryId = "all" | "outerwear" | "underwear" | "women" | "shoes";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: Exclude<CategoryId, "all">;
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  image: string;
  description: string;
  isNew?: boolean;
};

export type CartItem = Product & { size: string; color: string; quantity: number };

export type OrderStatus = "pending" | "confirmed" | "shipped" | "completed" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};

export type MessageStatus = "new" | "read" | "archived";

export type InboundMessage = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
};

export type Review = {
  id: string;
  createdAt: string;
  name: string;
  rating: number;
  comment: string;
  status: "published" | "hidden";
};

/** Store-wide policies & settings the owner can edit from /admin. */
export type StoreSettings = {
  returnPolicyDays: number;
  returnPolicyText: string;
  freeShippingThreshold: number;
  shippingFee: number;
  termsText: string;
};

export type StoreMedia = {
  logo: string;
  heroBanners: string[];
  aboutImage: string;
};
