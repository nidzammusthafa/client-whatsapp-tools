/**
 * Definisi tipe untuk payload permintaan yang dikirim ke backend.
 */

import { ExcelRow } from "../common";
import { WABlastMessageBlock } from "./blast";

/**
 * Interface untuk payload permintaan login WhatsApp dari frontend.
 */
export interface LoginRequestPayload {
  accountId: string; // ID unik untuk akun yang ingin di-login
  method: "qr"; // Metode login: QR Code saja
  headless?: boolean; // Opsi untuk menjalankan Puppeteer dalam mode headless
}

/**
 * Payload untuk menginisialisasi banyak klien.
 */
export interface InitializeMultipleClientsPayload {
  accountIds: string[];
  headless: boolean;
}

/**
 * Interface untuk payload permintaan logout.
 */
export interface LogoutRequestPayload {
  accountId: string;
}

/**
 * Interface untuk payload permintaan pengecekan banyak nomor WhatsApp dari frontend.
 */
export interface CheckNumbersPayload {
  jobId: string; // ID unik untuk pekerjaan pengecekan
  accountId: string; // Ini akan menjadi accountId yang memulai pekerjaan, bukan yang digunakan untuk pengecekan
  excelData: ExcelRow[];
  phoneNumberColumn: string;
  minDelayMs: number;
  maxDelayMs: number;
  delayAfterNNumbers: number;
  availableClientIds: string[]; // Daftar ID klien yang tersedia untuk rotasi
}

/**
 * Interface untuk payload kontrol pekerjaan pengecekan nomor (jeda/lanjutkan/hentikan).
 */
export interface NumberCheckJobControlPayload {
  jobId: string;
}

/**
 * Interface untuk payload permintaan penggantian nama klien.
 */
export interface RenameClientPayload {
  oldAccountId: string;
  newAccountId: string;
}

/**
 * Interface untuk payload permintaan penghapusan klien.
 */
export interface DeleteClientPayload {
  accountId: string;
}

/**
 * Interface untuk payload permintaan penghentian klien (putuskan koneksi).
 */
export interface DisconnectClientPayload {
  accountId: string;
}

/**
 * Interface untuk payload memutuskan semua klien.
 */
export type DisconnectAllClientsPayload = object;

/**
 * Interface untuk payload permintaan pengaturan klien utama.
 */
export interface SetMainClientPayload {
  accountId: string;
}

/**
 * BARU: Interface untuk payload pengaturan akun pengirim notifikasi.
 */
export interface SetNotificationSenderPayload {
  accountId: string | null;
}

/**
 * BARU: Interface untuk payload pengaturan whitelist.
 */
export interface SetWhitelistPayload {
  numbers: string[];
}

/**
 * BARU: Interface untuk payload penghapusan nomor dari whitelist.
 */
export interface RemoveWhitelistNumberPayload {
  number: string;
}

/**
 * BARU: Interface untuk payload permintaan memulai pekerjaan warmer.
 */
export interface StartWarmerPayload {
  jobId: string;
  selectedAccountIds: string[]; // Akun yang akan terlibat dalam obrolan
  totalMessages: number; // Jumlah total pesan yang akan dikirim
  messages: string[]; // Daftar pesan yang akan digunakan
  minDelayMs: number;
  maxDelayMs: number;
  delayAfterNMessages: number; // Jeda setelah N pesan
  delayAfterNMessagesMs: number; // Durasi jeda setelah N pesan
}

/**
 * BARU: Interface untuk payload permintaan memulai pekerjaan WA Blast.
 */
export interface StartWABlastPayload {
  jobId: string;
  senderAccountIds: string[]; // Akun pengirim pesan massal
  excelData: ExcelRow[];
  phoneNumberColumn: string;
  messageBlocks: WABlastMessageBlock[]; // Array dari blok pesan
  minDelayMs: number;
  maxDelayMs: number;
  delayAfterNRecipients: number; // Jeda setelah N penerima
  delayAfterNRecipientsMs: number; // Durasi jeda setelah N penerima
  skipRecipientsInAddress: boolean; // Lewati nomor yang sudah ada di Address
  enableWhatsappWarmer?: boolean; // Apakah fitur inter-account chat diaktifkan
  whatsappWarmerMinMessages?: number; // Minimum pesan untuk inter-account chat
  whatsappWarmerMaxMessages?: number; // Maksimum pesan untuk inter-account chat
  whatsappWarmerDelayMs?: number; // Jeda antar pesan dalam inter-account chat (d
  whatsappWarmerMinDelayMs?: number; // Minimum jeda antar pesan dalam inter-account chat
  whatsappWarmerMaxDelayMs?: number; // Maksimum jeda antar pesan dalam inter-account chat
  fileName?: string;
  scheduledAt?: Date;
}

/**
 * Payload untuk menyimpan pesan.
 */
export interface SaveStoredMessagePayload {
  name: string;
  content: string;
}

/**
 * Payload untuk menghapus pesan.
 */
export interface DeleteStoredMessagePayload {
  id: string;
}

/**
 * Payload untuk memperbarui pesan.
 */
export interface UpdateStoredMessagePayload {
  id: string;
  name: string;
  content: string;
}
