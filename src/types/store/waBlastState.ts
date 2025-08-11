import {
  WABlastProgressUpdate,
  WABlastMessageLogEntry,
  WABlastMessageBlock,
} from "../whatsapp/blast";
import { ExcelRow } from "../common";

export interface WaBlastState {
  waBlastJobs: Record<string, WABlastProgressUpdate>;
  currentSelectedWABlastJobId: string | null;
  enableWhatsappWarmer: boolean;
  whatsappWarmerMinMessages: number;
  whatsappWarmerMaxMessages: number;
  whatsappWarmerDelayMs: number;
  whatsappWarmerLanguage: "en" | "id";
}

export interface WaBlastActions {
  setWaBlastJobs: (jobs: Record<string, WABlastProgressUpdate>) => void;
  updateWaBlastJobStatus: (status: WABlastProgressUpdate) => void;
  addWABlastMessageLogEntry: (
    jobId: string,
    entry: WABlastMessageLogEntry
  ) => void;
  setCurrentSelectedWABlastJobId: (jobId: string | null) => void;
  startWABlast: (
    jobId: string,
    senderAccountIds: string[],
    excelData: ExcelRow[],
    phoneNumberColumn: string,
    messageBlocks: WABlastMessageBlock[],
    delayConfig: {
      minDelayMs: number;
      maxDelayMs: number;
      delayAfterNRecipients: number;
      delayAfterNRecipientsMs: number;
      enableWhatsappWarmer: boolean;
      whatsappWarmerMinMessages: number; // Minimal pesan terkirim sebelum obrolan
      whatsappWarmerMaxMessages: number; // Maksimal pesan terkirim sebelum obrolan
      whatsappWarmerDelayMs: number; // Durasi jeda obrolan antar akun
      whatsappWarmerLanguage: "en" | "id";
    },
    fileName?: string,
    scheduledAt?: Date
  ) => void;
  pauseWABlast: (jobId: string) => void;
  resumeWABlast: (jobId: string) => void;
  stopWABlast: (jobId: string) => void;
  removeWaBlastJob: (jobId: string) => void;
  editWaBlastJob: (jobId: string) => void;
  getWaBlastJob: (jobId: string) => void;
  loadWaBlastJobs: () => void;
  setEnableWhatsappWarmer: (value: boolean) => void;
  setWhatsappWarmerMinMessages: (value: number) => void;
  setWhatsappWarmerMaxMessages: (value: number) => void;
  setWhatsappWarmerDelayMs: (value: number) => void;
  setWhatsappWarmerLanguage: (value: "en" | "id") => void;
}
