import { StateCreator } from "zustand";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { toast } from "sonner";
import {
  WaBlastState,
  WaBlastActions,
  WhatsAppState,
  WhatsAppActions,
} from "@/types/store/whatsappState";
import { StartWABlastPayload } from "@/types";

export const createWaBlastManagerSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  WaBlastState & WaBlastActions
> = (set, get) => ({
  // Initial State for WhatsApp Blast (Multi-Job / Workspace)
  waBlastJobs: {},
  currentSelectedWABlastJobId: null,
  enableWhatsappWarmer: false,
  whatsappWarmerMinMessages: 5,
  whatsappWarmerMaxMessages: 10,
  whatsappWarmerDelayMs: 10000,
  whatsappWarmerLanguage: "en",

  setEnableWhatsappWarmer: (value) => set({ enableWhatsappWarmer: value }),
  setWhatsappWarmerMinMessages: (value) =>
    set({ whatsappWarmerMinMessages: value }),
  setWhatsappWarmerMaxMessages: (value) =>
    set({ whatsappWarmerMaxMessages: value }),
  setWhatsappWarmerDelayMs: (value) => set({ whatsappWarmerDelayMs: value }),
  setWhatsappWarmerLanguage: (value) => set({ whatsappWarmerLanguage: value }),

  // Actions for WA Blast
  setWaBlastJobs: (jobs) => set({ waBlastJobs: jobs }),
  updateWaBlastJobStatus: (statusUpdate) =>
    set((state) => {
      const updatedJobs = { ...state.waBlastJobs };
      const jobId = statusUpdate.jobId;
      const existingJob = updatedJobs[jobId];

      if (existingJob) {
        // Ambil sisa properti dari pembaruan status, abaikan `messages`
        const { ...restOfUpdate } = statusUpdate;

        updatedJobs[jobId] = {
          ...existingJob,
          ...restOfUpdate, // Timpa hanya dengan data progres, bukan log pesan
        };
      } else {
        // Jika pekerjaan belum ada di state, buat dari data pembaruan
        updatedJobs[jobId] = statusUpdate;
      }
      return { waBlastJobs: updatedJobs };
    }),
  addWABlastMessageLogEntry: (jobId, entry) =>
    set((state) => {
      const updatedJobs = { ...state.waBlastJobs };
      if (updatedJobs[jobId]) {
        updatedJobs[jobId] = {
          ...updatedJobs[jobId],
          messages: [...(updatedJobs[jobId].messages || []), entry],
        };
      }
      return { waBlastJobs: updatedJobs };
    }),
  setCurrentSelectedWABlastJobId: (jobId) =>
    set({ currentSelectedWABlastJobId: jobId }),

  startWABlast: (
    jobId,
    senderAccountIds,
    excelData,
    phoneNumberColumn,
    messageBlocks,
    delayConfig,
    fileName,
    scheduledAt
  ) => {
    const socket = getWhatsappSocket();
    const state = get();
    if (!state.isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (!senderAccountIds || senderAccountIds.length === 0) {
      toast.error("Pilih setidaknya satu akun pengirim untuk WA Blast.");
      return;
    }
    if (!excelData || excelData.length === 0 || !phoneNumberColumn) {
      toast.error("Mohon unggah file Excel dan pilih kolom nomor telepon.");
      return;
    }
    if (messageBlocks.length === 0) {
      toast.error("Tambahkan setidaknya satu blok pesan untuk dikirim.");
      return;
    }

    set((state) => ({
      waBlastJobs: {
        ...state.waBlastJobs,
        [jobId]: {
          jobId: jobId,
          currentRecipients: 0,
          totalRecipients: excelData.length,
          status: scheduledAt ? "SCHEDULED" : "IN_PROGRESS",
          message: scheduledAt
            ? `Dijadwalkan untuk ${scheduledAt.toLocaleString()}`
            : "Memulai pengiriman WA Blast...",
          messages: [],
          senderAccountIds: senderAccountIds,
          minDelayMs: delayConfig.minDelayMs,
          maxDelayMs: delayConfig.maxDelayMs,
          delayAfterNRecipients: delayConfig.delayAfterNRecipients,
          delayAfterNRecipientsMs: delayConfig.delayAfterNRecipientsMs,
          enableWhatsappWarmer: delayConfig.enableWhatsappWarmer,
          whatsappWarmerMinMessages: delayConfig.whatsappWarmerMinMessages,
          whatsappWarmerMaxMessages: delayConfig.whatsappWarmerMaxMessages,
          whastappWarmerDelayMs: delayConfig.whatsappWarmerDelayMs,
          whatsappWarmerLanguage: delayConfig.whatsappWarmerLanguage,
          excelData: excelData,
          phoneNumberColumn: phoneNumberColumn,
          fileName: fileName,
          scheduledAt: scheduledAt as unknown as string,
          messageBlocks: messageBlocks,
        },
      },
      currentSelectedWABlastJobId: jobId,
    }));

    const payload: StartWABlastPayload = {
      jobId: jobId,
      senderAccountIds,
      excelData,
      phoneNumberColumn,
      messageBlocks,
      ...delayConfig,
      fileName,
      scheduledAt,
    };
    socket.emit("whatsapp-start-blast", payload);
    state.resetGlobalError();
  },
  pauseWABlast: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-pause-blast", { jobId });
    get().resetGlobalError();
  },
  resumeWABlast: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-resume-blast", { jobId });
    get().resetGlobalError();
  },
  stopWABlast: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-stop-blast", { jobId });
    socket.emit("whatsapp-get-client-status-all");
    get().removeWaBlastJob(jobId); // Optimistically remove from frontend
    setTimeout(() => {
      get().loadWaBlastJobs();
    }, 500); // Beri sedikit waktu agar backend memproses sebelum menghapus dari UI
    get().resetGlobalError();
  },
  loadWaBlastJobs: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      console.warn("Socket not connected, cannot load WA Blast jobs yet.");
      return;
    }
    socket.emit("whatsapp-get-all-blast-jobs");
  },
  removeWaBlastJob: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-remove-blast", { jobId });
    get().resetGlobalError();
  },
  editWaBlastJob: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-edit-blast", { jobId });
    get().resetGlobalError();
  },
  getWaBlastJob: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    socket.emit("whatsapp-get-blast-job", { jobId });
    get().resetGlobalError();
  },
  setSelectedSenderAccountIds(ids) {
    set({
      waBlastJobs: {
        ...get().waBlastJobs,
        [get().currentSelectedWABlastJobId!]: {
          ...get().waBlastJobs[get().currentSelectedWABlastJobId!],
          senderAccountIds: ids,
        },
      },
    });
  },
});
