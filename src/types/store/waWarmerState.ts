import {
  WarmerProgressUpdate,
  WarmerMessageLogEntry,
} from "../whatsapp/warmer";

export interface WaWarmerState {
  waWarmerJobs: Record<string, WarmerProgressUpdate>;
  warmerJobStatus: WarmerProgressUpdate | null;
  warmerMessagesLog: WarmerMessageLogEntry[];
  currentWarmerJobId: string;
}

export interface WaWarmerActions {
  setWaWarmerJobs: (jobs: Record<string, WarmerProgressUpdate>) => void;
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
