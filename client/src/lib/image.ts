/**
 * Reads an image file selected by the store owner and re-encodes it as a
 * compressed JPEG data URL, capped at `maxWidth`. Keeping uploaded product
 * photos small matters here because they are stored directly in the
 * browser's localStorage (see lib/store.tsx), which has a limited quota.
 */
export function resizeImageToDataUrl(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("الملف المختار ليس صورة"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذّرت قراءة الصورة"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("تعذّر تحميل الصورة"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذّرت معالجة الصورة"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
