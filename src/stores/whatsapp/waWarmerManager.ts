import { StateCreator } from "zustand";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  WaWarmerState,
  WaWarmerActions,
  WhatsAppState,
  WhatsAppActions,
} from "@/types/store/whatsappState";
import { StartWarmerPayload } from "@/types";

export const createWaWarmerManagerSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  WaWarmerState & WaWarmerActions
> = (set, get) => ({
  waWarmerJobs: {},
  warmerJobStatus: null,
  warmerMessagesLog: [],
  currentWarmerJobId: uuidv4(),

  setWaWarmerJobs: (jobs) => set({ waWarmerJobs: jobs }),
  setWarmerJobStatus: (status) => set({ warmerJobStatus: status }),
  addWarmerMessageLogEntry: (entry) =>
    set((state) => ({
      warmerMessagesLog: [...state.warmerMessagesLog, entry],
    })),
  resetWarmerMessagesLog: () => set({ warmerMessagesLog: [] }),
  setCurrentWarmerJobId: (jobId) => set({ currentWarmerJobId: jobId }),

  startWarmer: (selectedAccountIds, totalMessages, messages, delayConfig) => {
    const socket = getWhatsappSocket();
    const state = get();
    if (!state.isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (selectedAccountIds.length < 2) {
      toast.error("Pilih setidaknya dua akun untuk pemanasan.");
      return;
    }
    if (totalMessages <= 0) {
      toast.error("Jumlah total pesan harus lebih dari 0.");
      return;
    }
    if (messages.length === 0) {
      toast.error("Daftar pesan tidak boleh kosong.");
      return;
    }

    state.resetWarmerMessagesLog(); // Bersihkan log sebelumnya
    state.setCurrentWarmerJobId(uuidv4()); // Generate ID job baru
    const payload: StartWarmerPayload = {
      jobId: state.currentWarmerJobId,
      selectedAccountIds,
      totalMessages,
      messages,
      ...delayConfig,
    };
    socket.emit("whatsapp-start-warmer", payload);
    state.resetGlobalError();
    state.setWarmerJobStatus({
      jobId: state.currentWarmerJobId,
      currentMessages: 0,
      totalMessages: totalMessages,
      status: "RUNNING",
      message: "Memulai pemanasan akun...",
      sentMessagesLog: [], // Inisialisasi kosong di frontend
    });
  },
  pauseWarmer: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-pause-warmer", { jobId });
    get().resetGlobalError();
  },
  resumeWarmer: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-resume-warmer", { jobId });
    get().resetGlobalError();
  },
  stopWarmer: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-stop-warmer", { jobId });
    get().resetGlobalError();
    get().setWarmerJobStatus(null);
    get().resetWarmerMessagesLog();
    get().setCurrentWarmerJobId(uuidv4());
  },
  removeWarmerJob: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-remove-warmer", { jobId });
    get().resetGlobalError();
    set((state) => {
      const newJobs = { ...state.waWarmerJobs };
      delete newJobs[jobId];
      return { waWarmerJobs: newJobs };
    });
  },
  getWarmerJob: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-get-warmer-job", { jobId });
    get().resetGlobalError();
  },
  getAllWarmerJobs: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-get-all-warmer-jobs");
    get().resetGlobalError();
  },
});
