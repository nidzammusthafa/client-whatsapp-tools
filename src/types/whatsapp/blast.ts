/**
 * Definisi tipe terkait fitur WA Blast (pesan massal).
 */

import { ExcelRow } from "../common";

/**
 * BARU: Tipe untuk konten pesan WA Blast (teks, media).
 */
export type WABlastMessageType = "text" | "media";

/**
 * BARU: Interface untuk opsi pesan acak dalam blok pesan WA Blast.
 */
export interface RandomMessageOption {
  content: string;
  selected: boolean; // Apakah pesan ini akan dipertimbangkan untuk   storedMessageId?: string;
  storedMessageId?: string;
}

/**
 * BARU: Interface untuk setiap blok pesan dalam WA Blast.
 */
export interface WABlastMessageBlock {
  id: string; // Unique ID for the block
  type: WABlastMessageType;
  textMessage?: string; // Content for text message (used if randomize is false)
  mediaData?: ArrayBuffer;
  mediaName?: string;
  mediaType?: string; // Mime type of the media (e.g., 'image/jpeg', 'video/mp4')
  randomize?: boolean; // Jika true, pilih pesan acak dari randomMessageOptions
  randomMessageOptions?: RandomMessageOption[]; // Daftar pesan jika randomize true
  listMessages?: string[]; // Daftar pesan jika randomize true (redundant with randomMessageOptions, but kept for now)
  storedMessageId?: string; // ID pesan yang disimpan
}

/**
 * Status pekerjaan WA Blast.
 */
export type WABlastJobStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

/**
 * Definisi tipe untuk model Prisma `BlastMessage`.
 */
export interface Message {
  id: string;
  blastJobId: string;
  recipientPhoneNumber: string;
  messageContent: string;
  senderAccountId: string;
  timestamp: Date;
  status: "PENDING" | "SENT" | "FAILED" | "READ" | "DELIVERED";
  error?: string;
  messageBlockId?: string;
  mediaSent?: boolean;
  originalData: ExcelRow; // Json di Prisma, ExcelRow di TypeScript
}

/**
 * BARU: Interface untuk update progress pekerjaan WA Blast.
 */
export interface WABlastProgressUpdate {
  jobId: string;
  currentRecipients: number;
  totalRecipients: number;
  status: WABlastJobStatus;
  message: string;
  senderAccountIds?: string[]; // Akun pengirim yang digunakan
  minDelayMs?: number;
  maxDelayMs?: number;
  delayAfterNRecipients?: number;
  delayAfterNRecipientsMs?: number;
  enableWhatsappWarmer?: boolean;
  whatsappWarmerMinMessages?: number;
  whatsappWarmerMaxMessages?: number;
  whatsappWarmerDelayMs?: number;
  whatsappWarmerMinDelayMs?: number;
  whatsappWarmerMaxDelayMs?: number;
  whatsappWarmerLanguage?: "en" | "id";
  excelData?: ExcelRow[];
  excelColumns?: string[];
  phoneNumberColumn?: string;
  fileName?: string;
  scheduledAt?: string; // ISO string
  messageBlocks?: WABlastMessageBlock[];
  messages?: WABlastMessageLogEntry[]; // Log pesan yang sudah terkirim
}

/**
 * BARU: Interface untuk entri log pesan yang dikirim oleh WA Blast.
 */
export interface WABlastMessageLogEntry {
  blastJobId: string;
  recipientPhoneNumber: string;
  messageContent: string; // Konten pesan yang benar-benar terkirim
  senderAccountIds: string[];
  timestamp: string; // ISO string
  status: "SENT" | "FAILED";
  error?: string; // Jika gagal
  messageBlockId?: string; // ID blok pesan yang digunakan
  mediaSent?: boolean; // Apakah ada media yang dikirim
  originalData?: ExcelRow;
}
