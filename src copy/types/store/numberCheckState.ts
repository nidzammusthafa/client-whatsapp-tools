import {
  NumberCheckProgressUpdate,
  WhatsAppNumberCheckResult,
} from "../whatsapp/number-check";
import { ExcelRow } from "../common";

export interface NumberCheckState {
  numberCheckResults: WhatsAppNumberCheckResult[];
  numberCheckJobStatus: NumberCheckProgressUpdate | null;
  uploadedExcelData: ExcelRow[] | null;
  excelColumns: string[];
  selectedPhoneNumberColumn: string;
  minDelay: number;
  maxDelay: number;
  delayAfterNNumbers: number;
  currentNumberCheckJobId: string;
  availableNumberCheckJobs: NumberCheckProgressUpdate[];
}

export interface NumberCheckActions {
  setOriginalData: (data: ExcelRow[] | null) => void;
  setExcelColumns: (columns: string[]) => void;
  setSelectedPhoneNumberColumn: (column: string) => void;
  setMinDelay: (delay: number) => void;
  setMaxDelay: (delay: number) => void;
  setDelayAfterNNumbers: (num: number) => void;
  resetNumberCheckConfig: () => void;
  addNumberCheckResult: (payload: {
    jobId: string;
    result: WhatsAppNumberCheckResult;
  }) => void;
  setNumberCheckJobStatus: (status: NumberCheckProgressUpdate | null) => void;
  resetNumberCheckResults: () => void;
  generateNewNumberCheckJobId: () => void;
  setAvailableNumberCheckJobs: (jobs: NumberCheckProgressUpdate[]) => void;
  loadAvailableNumberCheckJobs: () => void;

  startNumberCheck: (
    jobId: string,
    initiatingAccountId: string,
    excelData: ExcelRow[],
    phoneNumberColumn: string,
    delayConfig: {
      minDelayMs: number;
      maxDelayMs: number;
      delayAfterNNumbers: number;
    },
    availableClientIds: string[]
  ) => void;
  pauseNumberChecking: (jobId: string) => void;
  resumeNumberChecking: (jobId: string) => void;
  stopNumberChecking: (jobId: string) => void;
}
