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

/**
 * Mengubah string tanggal ke format "DD-MM-YYYY, HH.mm".
 * @param dateString String tanggal yang akan diformat.
 * @returns String tanggal yang sudah diformat, atau null jika input tidak valid.
 */
export function formatTimeAgo(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });

  const past = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  let unit;
  let value;
  type RelativeTimeFormatUnit =
    | "second"
    | "minute"
    | "hour"
    | "day"
    | "week"
    | "month"
    | "quarter"
    | "year";
  if (seconds < 60) {
    return "baru saja";
  } else if (seconds < 3600) {
    unit = "minute" as RelativeTimeFormatUnit;
    value = Math.floor(seconds / 60);
  } else if (seconds < 86400) {
    unit = "hour" as RelativeTimeFormatUnit;
    value = Math.floor(seconds / 3600);
  } else {
    unit = "day" as RelativeTimeFormatUnit;
    value = Math.floor(seconds / 86400);
  }

  // 5. Format hasilnya menggunakan rtf
  // Parameter pertama adalah nilai negatif karena waktunya sudah berlalu
  return rtf.format(-value, unit);
}

/**
 * Mengubah string menjadi format string wa.
 * @param string String yang akan diubah menjadi bold, italic, dll.
 * @returns html.
 */
export const convertToHtml = (text: string) => {
  // Ganti newline (\n) dengan tag <br>
  let htmlText = text.replace(/\n/g, "<br/>");
  // Tebal: **teks**
  htmlText = htmlText.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  // Miring: _teks_
  htmlText = htmlText.replace(/_(.*?)_/g, "<em>$1</em>");
  // Coret: ~teks~
  htmlText = htmlText.replace(/~(.*?)~/g, "<s>$1</s>");
  // Monospace/Code Block: ```teks```
  htmlText = htmlText.replace(/```(.*?)```/g, "<code>$1</code>");
  return htmlText;
};
