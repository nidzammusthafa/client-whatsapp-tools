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

/**
 * Mengubah string tanggal ke format "DD-MM-YYYY, HH.mm".
 * @param dateString String tanggal yang akan diformat.
 * @returns String tanggal yang sudah diformat, atau null jika input tidak valid.
 */
export const formatDate = (dateString: string | Date): string | null => {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);

  // PadStart untuk memastikan angka selalu dua digit (misal: 01, 02)
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Menggabungkan semua bagian ke dalam format yang diinginkan
  return `${day}-${month}-${year}, ${hours}.${minutes}`;
};
