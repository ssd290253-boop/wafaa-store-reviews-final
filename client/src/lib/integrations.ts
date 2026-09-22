import emailjs from "@emailjs/browser";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { InboundMessage, Order, Review } from "@/lib/types";

const env = import.meta.env as Record<string, string | undefined>;
const configuredWhatsApp = env.VITE_WHATSAPP_NUMBER || "201026674042";

export const integrationConfig = {
  whatsappNumber: configuredWhatsApp.replace(/\D/g, ""),
  hasSupabase: Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
  hasEmailJS: Boolean(env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY),
};

export const supabase: SupabaseClient | null = integrationConfig.hasSupabase
  ? createClient(env.VITE_SUPABASE_URL as string, env.VITE_SUPABASE_ANON_KEY as string)
  : null;

export function whatsappUrl(message: string) {
  return `https://wa.me/${integrationConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  const url = whatsappUrl(message);
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  return url;
}

export function orderWhatsAppMessage(order: Order) {
  const lines = order.items.map((item) => `- ${item.name} | مقاس: ${item.size} | لون: ${item.color} | الكمية: ${item.quantity} | ${item.price * item.quantity} ج.م`);
  return [`مرحباً وفاء، أريد تأكيد هذا الطلب:`, `رقم الطلب: ${order.id}`, `الاسم: ${order.customerName}`, `الهاتف: ${order.phone}`, `العنوان: ${order.address}`, "", "المنتجات:", ...lines, "", `المجموع: ${order.subtotal} ج.م`, `الشحن: ${order.shipping === 0 ? "مجاني" : `${order.shipping} ج.م`}`, `الإجمالي: ${order.total} ج.م`].join("\n");
}

export function contactWhatsAppMessage(message: InboundMessage) {
  return [`مرحباً وفاء، لدي رسالة من المتجر:`, `الاسم: ${message.name}`, `البريد: ${message.email}`, "", message.message].join("\n");
}

export async function syncOrder(order: Order) {
  if (!supabase) return { ok: false, configured: false };
  const { error } = await supabase.from("orders").upsert({ id: order.id, created_at: order.createdAt, customer_name: order.customerName, phone: order.phone, address: order.address, items: order.items, subtotal: order.subtotal, shipping: order.shipping, total: order.total, status: order.status });
  return { ok: !error, configured: true, error: error?.message };
}

export async function syncMessage(message: InboundMessage) {
  if (!supabase) return { ok: false, configured: false };
  const { error } = await supabase.from("messages").upsert({ id: message.id, created_at: message.createdAt, name: message.name, email: message.email, message: message.message, status: message.status });
  return { ok: !error, configured: true, error: error?.message };
}

export async function loadRemoteOrders(): Promise<Order[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({ id: row.id, createdAt: row.created_at, customerName: row.customer_name, phone: row.phone, address: row.address, items: row.items, subtotal: Number(row.subtotal), shipping: Number(row.shipping), total: Number(row.total), status: row.status } as Order));
}

export async function loadRemoteMessages(): Promise<InboundMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({ id: row.id, createdAt: row.created_at, name: row.name, email: row.email, message: row.message, status: row.status } as InboundMessage));
}

export async function syncReview(review: Review) {
  if (!supabase) return { ok: false, configured: false };
  const { error } = await supabase.from("reviews").upsert({ id: review.id, created_at: review.createdAt, name: review.name, rating: review.rating, comment: review.comment, status: review.status });
  return { ok: !error, configured: true, error: error?.message };
}

export async function loadRemoteReviews(): Promise<Review[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({ id: row.id, createdAt: row.created_at, name: row.name, rating: Number(row.rating), comment: row.comment, status: row.status } as Review));
}

export async function deleteRemoteReview(id: string) {
  if (!supabase) return { ok: false, configured: false };
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return { ok: !error, configured: true, error: error?.message };
}

export async function sendEmailNotification(params: Record<string, string>) {
  if (!integrationConfig.hasEmailJS) return { ok: false, configured: false };
  try {
    await emailjs.send(env.VITE_EMAILJS_SERVICE_ID as string, env.VITE_EMAILJS_TEMPLATE_ID as string, params, { publicKey: env.VITE_EMAILJS_PUBLIC_KEY as string });
    return { ok: true, configured: true };
  } catch (error) {
    return { ok: false, configured: true, error: error instanceof Error ? error.message : "EmailJS error" };
  }
}
