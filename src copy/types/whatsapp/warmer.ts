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

export interface WarmerJob {
  jobId: string;
  selectedAccountIds: string[]; // Json di Prisma, string[] di TypeScript
  totalMessages: number;
  messages: string[]; // Json di Prisma, string[] di TypeScript
  minDelayMs: number;
  maxDelayMs: number;
  delayAfterNMessages: number;
  delayAfterNMessagesMs: number;
  status: WarmerJobStatus;
  currentMessages: number;
  currentMessageIndex: number; // Properti baru untuk melacak indeks pesan saat ini
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  currentSenderIndex: number;
  currentRecipientIndex: number;
  sentMessagesLog: WarmerMessageLogEntry[]; // Json di Prisma, WarmerMessageLogEntry[] di TypeScript
}
