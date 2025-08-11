import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Menghitung jumlah item dalam string JSON yang merupakan array.
 * @param jsonString String JSON untuk dihitung.
 * @returns Jumlah item, atau 0 jika tidak valid.
 */
export const getJsonItemCount = (jsonString: string): number => {
  if (!jsonString || !jsonString.trim()) {
    return 0;
  }

  try {
    const data = JSON.parse(jsonString);
    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return 0;
  }
};

/**
 * Memuat skrip eksternal secara dinamis.
 * @param src URL dari skrip.
 * @returns Promise yang resolve saat skrip dimuat.
 */
export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};
