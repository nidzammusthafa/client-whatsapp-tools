import {
  WarmerProgressUpdate,
  WarmerMessageLogEntry,
  WarmerJob,
} from "../whatsapp/warmer";

export interface WaWarmerState {
  waWarmerJobs: Record<string, WarmerJob>;
  warmerJobStatus: WarmerProgressUpdate | null;
  warmerMessagesLog: WarmerMessageLogEntry[];
  currentWarmerJobId: string;
}

export interface WaWarmerActions {
  setWaWarmerJobs: (jobs: Record<string, WarmerJob>) => void;
  setWarmerJobStatus: (status: WarmerProgressUpdate | null) => void;
  addWarmerMessageLogEntry: (entry: WarmerMessageLogEntry) => void;
  resetWarmerMessagesLog: () => void;
  setCurrentWarmerJobId: (jobId: string) => void;
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
  removeWarmerJob: (jobId: string) => void;
  getWarmerJob: (jobId: string) => void;
  getAllWarmerJobs: () => void;
}
