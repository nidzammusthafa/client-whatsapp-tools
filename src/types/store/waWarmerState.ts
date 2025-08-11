import {
  WarmerProgressUpdate,
  WarmerMessageLogEntry,
} from "../whatsapp/warmer";

export interface WaWarmerState {
  warmerJobStatus: WarmerProgressUpdate | null;
  warmerMessagesLog: WarmerMessageLogEntry[];
  currentWarmerJobId: string;
}

export interface WaWarmerActions {
  setWarmerJobStatus: (status: WarmerProgressUpdate | null) => void;
  addWarmerMessageLogEntry: (entry: WarmerMessageLogEntry) => void;
  resetWarmerMessagesLog: () => void;
  generateNewWarmerJobId: () => void;
  startWarmer: (
    selectedAccountIds: string[],
    totalMessages: number,
    messages: string[],
    delayConfig: {
      minDelayMs: number;
      maxDelayMs: number;
      delayAfterNMessages: number;
      delayAfterNMessagesMs: number;
    }
  ) => void;
  pauseWarmer: (jobId: string) => void;
  resumeWarmer: (jobId: string) => void;
  stopWarmer: (jobId: string) => void;
}
