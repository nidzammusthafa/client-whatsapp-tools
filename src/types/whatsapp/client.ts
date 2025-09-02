/**
 * Definisi tipe terkait status dan update klien WhatsApp.
 */

/**
 * Definisi tipe untuk status klien WhatsApp.
 */
export type WAClientStatus =
  | "loading"
  | "qr"
  | "authenticated"
  | "ready"
  | "disconnected"
  | "auth_failure"
  | "error";

/**
 * Interface untuk status update klien WhatsApp yang dikirim ke frontend.
 */
export interface WhatsAppClientStatusUpdate {
  accountId: string;
  status: WAClientStatus;
  message: string;
  rating?: number;
  outgoingMsgs24h?: number; // Jumlah pesan keluar dalam 24 jam terakhir
  firstOutgoingMsg24h?: string; // Waktu pertama pesan keluar di 24 jam
  qrCode?: string; // Data QR Code Base64
  requestedLoginMethod?: "qr"; // Metode login yang diminta oleh pengguna
  phoneNumber?: string;
  isMainClient?: boolean; // Menandakan apakah ini klien utama
  isBlastActive?: boolean;
  clientJid?: string; // JID lengkap klien (misal: 62812xxxx@c.us)
}
