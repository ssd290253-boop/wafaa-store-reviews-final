const aliases: Record<string, string> = {
  أحمر: "#d94b4b",
  أزرق: "#4169e1",
  "أزرق كحلي": "#1f2a44",
  كحلي: "#1f2a44",
  نيلي: "#334a8f",
  أخضر: "#4f8a5b",
  "أخضر نعناعي": "#98d8c0",
  نعناعي: "#98d8c0",
  أبيض: "#f8f7f2",
  أسود: "#242321",
  بيج: "#d8c3a5",
  بني: "#8b5e3c",
  وردي: "#d98ca0",
  برتقالي: "#e58b45",
  أصفر: "#e3c44f",
  بنفسجي: "#8064a2",
  رمادي: "#9a9a96",
  عاجي: "#f4ecdf",
  طوبي: "#b66f5a",
  "بني عسلي": "#b77d5a",
  ساج: "#a7aa98",
  فحمي: "#28312e",
  "بيج وردي": "#d8c6b7",
};

const legacyHexNames: Record<string, string> = {
  "#e8ddd0": "بيج فاتح",
  "#20201d": "أسود فحمي",
  "#b98d72": "بني وردي",
  "#d7c5b4": "بيج رملي",
  "#75685b": "بني رمادي",
  "#e7d7c7": "وردي باهت",
  "#c08b6b": "بني عسلي",
  "#f0ebe4": "عاجي",
  "#d4a190": "وردي ترابي",
  "#3f4740": "أخضر زيتي",
  "#dec7a8": "ذهبي هادئ",
  "#fbf6ef": "أوف وايت",
  "#26312f": "فحمي",
  "#bfa894": "تاوب",
  "#ca8d7c": "طوبي",
  "#b4a79b": "رمادي بيج",
  "#28312e": "فحمي أخضر",
  "#d8c6b7": "بيج وردي",
  "#eee3d6": "عاجي",
  "#a7aa98": "ساج",
  "#b77d5a": "بني عسلي",
  "#efe2d1": "عاجي دافئ",
};

function hash(value: string) {
  return value.split("").reduce((total, character) => ((total * 31) + character.charCodeAt(0)) | 0, 7);
}

/** Returns a valid CSS color for a friendly name, hex value, or arbitrary custom text. */
export function colorToCss(value: string) {
  const input = value.trim();
  if (!input) return "#d8cec5";
  const alias = aliases[input.toLowerCase()];
  if (alias) return alias;
  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(|color\()/i.test(input)) return input;
  if (typeof globalThis.CSS !== "undefined" && globalThis.CSS.supports("color", input)) return input;
  const hue = Math.abs(hash(input)) % 360;
  return `hsl(${hue} 28% 70%)`;
}

/** User-facing Arabic label; legacy hex values never leak into storefront or order views. */
export function colorName(value: string) {
  const input = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(input)) return legacyHexNames[input.toLowerCase()] || "لون مخصص";
  return input || "لون مخصص";
}
