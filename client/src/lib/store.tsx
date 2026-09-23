import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultMedia, defaultProducts, defaultSettings } from "@/data/catalog";
import type { InboundMessage, MessageStatus, Order, OrderStatus, Product, Review, StoreMedia, StoreSettings } from "@/lib/types";
import { deleteRemoteReview, loadRemoteMessages, loadRemoteOrders, loadRemoteReviews, syncMessage, syncOrder, syncReview } from "@/lib/integrations";
import { colorName } from "@/lib/colors";

const PRODUCTS_KEY = "wafaa_products_v1";
const SETTINGS_KEY = "wafaa_settings_v1";
const MEDIA_KEY = "wafaa_media_v1";
const ORDERS_KEY = "wafaa_orders_v1";
const MESSAGES_KEY = "wafaa_messages_v1";
const REVIEWS_KEY = "wafaa_reviews_v1";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function loadProducts() {
  const value = readLocal<Product[]>(PRODUCTS_KEY, defaultProducts);
  if (!Array.isArray(value) || !value.length) return defaultProducts;
  return value.map((product) => ({ ...product, colors: product.colors.map(colorName) }));
}
function loadSettings() { return { ...defaultSettings, ...readLocal<Partial<StoreSettings>>(SETTINGS_KEY, {}) }; }
function loadMedia() { return { ...defaultMedia, ...readLocal<Partial<StoreMedia>>(MEDIA_KEY, {}) }; }
function loadOrders() { return readLocal<Order[]>(ORDERS_KEY, []); }
function loadMessages() { return readLocal<InboundMessage[]>(MESSAGES_KEY, []); }
function loadReviews() { return readLocal<Review[]>(REVIEWS_KEY, []); }

 type StoreContextValue = {
  products: Product[]; settings: StoreSettings; media: StoreMedia; orders: Order[]; messages: InboundMessage[]; reviews: Review[];
  addProduct: (product: Product) => void; updateProduct: (id: string, patch: Omit<Product, "id">) => void; deleteProduct: (id: string) => void;
  updateSettings: (patch: Partial<StoreSettings>) => void; resetProducts: () => void; resetSettings: () => void; updateMedia: (patch: Partial<StoreMedia>) => void; resetMedia: () => void;
  createOrder: (order: Order) => void; updateOrderStatus: (id: string, status: OrderStatus) => void; deleteOrder: (id: string) => void; resetOrders: () => void;
  createMessage: (message: InboundMessage) => void; updateMessageStatus: (id: string, status: MessageStatus) => void; deleteMessage: (id: string) => void; resetMessages: () => void;
  createReview: (review: Review) => void; updateReview: (id: string, patch: Omit<Review, "id" | "createdAt">) => void; deleteReview: (id: string) => void; resetReviews: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());
  const [media, setMedia] = useState<StoreMedia>(() => loadMedia());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [messages, setMessages] = useState<InboundMessage[]>(() => loadMessages());
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews());

  useEffect(() => { window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { window.localStorage.setItem(MEDIA_KEY, JSON.stringify(media)); }, [media]);
  useEffect(() => { window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => {
    let active = true;
    Promise.all([loadRemoteOrders(), loadRemoteMessages(), loadRemoteReviews()]).then(([remoteOrders, remoteMessages, remoteReviews]) => {
      if (!active) return;
      if (remoteOrders.length) setOrders((current) => [...remoteOrders, ...current.filter((local) => !remoteOrders.some((remote) => remote.id === local.id))]);
      if (remoteMessages.length) setMessages((current) => [...remoteMessages, ...current.filter((local) => !remoteMessages.some((remote) => remote.id === local.id))]);
      if (remoteReviews.length) setReviews((current) => [...remoteReviews, ...current.filter((local) => !remoteReviews.some((remote) => remote.id === local.id))]);
    });
    return () => { active = false; };
  }, []);

  const addProduct = (product: Product) => setProducts((current) => [product, ...current]);
  const updateProduct = (id: string, patch: Omit<Product, "id">) => setProducts((current) => current.map((item) => item.id === id ? { ...patch, id } : item));
  const deleteProduct = (id: string) => setProducts((current) => current.filter((item) => item.id !== id));
  const updateSettings = (patch: Partial<StoreSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const resetProducts = () => setProducts(defaultProducts);
  const resetSettings = () => setSettings(defaultSettings);
  const updateMedia = (patch: Partial<StoreMedia>) => setMedia((current) => ({ ...current, ...patch }));
  const resetMedia = () => setMedia(defaultMedia);
  const createOrder = (order: Order) => { setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]); void syncOrder(order); };
  const updateOrderStatus = (id: string, status: OrderStatus) => { setOrders((current) => { const next = current.map((order) => order.id === id ? { ...order, status } : order); const updated = next.find((order) => order.id === id); if (updated) void syncOrder(updated); return next; }); };
  const deleteOrder = (id: string) => setOrders((current) => current.filter((order) => order.id !== id));
  const resetOrders = () => setOrders([]);
  const createMessage = (message: InboundMessage) => { setMessages((current) => [message, ...current.filter((item) => item.id !== message.id)]); void syncMessage(message); };
  const updateMessageStatus = (id: string, status: MessageStatus) => { setMessages((current) => { const next = current.map((message) => message.id === id ? { ...message, status } : message); const updated = next.find((message) => message.id === id); if (updated) void syncMessage(updated); return next; }); };
  const deleteMessage = (id: string) => setMessages((current) => current.filter((message) => message.id !== id));
  const resetMessages = () => setMessages([]);
  const createReview = (review: Review) => { setReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]); void syncReview(review); };
  const updateReview = (id: string, patch: Omit<Review, "id" | "createdAt">) => { setReviews((current) => { const next = current.map((review) => review.id === id ? { ...review, ...patch } : review); const updated = next.find((review) => review.id === id); if (updated) void syncReview(updated); return next; }); };
  const deleteReview = (id: string) => { setReviews((current) => current.filter((review) => review.id !== id)); void deleteRemoteReview(id); };
  const resetReviews = () => setReviews([]);

  return <StoreContext.Provider value={{ products, settings, media, orders, messages, reviews, addProduct, updateProduct, deleteProduct, updateSettings, resetProducts, resetSettings, updateMedia, resetMedia, createOrder, updateOrderStatus, deleteOrder, resetOrders, createMessage, updateMessageStatus, deleteMessage, resetMessages, createReview, updateReview, deleteReview, resetReviews }}>{children}</StoreContext.Provider>;
}

export function generateProductId(existing: Product[]): string {
  let id = "";
  do { id = `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; } while (existing.some((item) => item.id === id));
  return id;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore يجب أن تُستخدم داخل StoreProvider");
  return ctx;
}
