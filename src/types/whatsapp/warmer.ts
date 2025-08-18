/**
 * Definisi tipe terkait fitur Warmer (obrolan otomatis).
 */

/**
 * BARU: Status pekerjaan obrolan otomatis (warmer).
 */
export type WarmerJobStatus =
  | "IDLE"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "ERROR";

/**
 * BARU: Interface untuk update progress pekerjaan warmer.
 */
export interface WarmerProgressUpdate {
  jobId: string;
  currentMessages: number;
  totalMessages: number;
  status: WarmerJobStatus;
  message: string;
  // Tambahan untuk frontend tabel
  sentMessagesLog?: WarmerMessageLogEntry[]; // Log pesan yang sudah terkirim
}

/**
 * BARU: Interface untuk entri log pesan yang dikirim oleh warmer.
 */
export interface WarmerMessageLogEntry {
  senderAccountIds: string[];
  recipientAccountId: string;
  messageContent: string;
  timestamp: string; // ISO string
  status: "sent" | "failed";
  error?: string; // Jika gagal
}
