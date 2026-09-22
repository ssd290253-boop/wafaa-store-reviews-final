import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a price the same way across the storefront and the admin dashboard. */
export const formatPrice = (value: number) => new Intl.NumberFormat("ar-SA").format(value);

/** Normalizes Arabic text (removes diacritics, unifies alef forms) for forgiving search matches. */
export const normalizeSearchText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .toLowerCase()
    .trim();
