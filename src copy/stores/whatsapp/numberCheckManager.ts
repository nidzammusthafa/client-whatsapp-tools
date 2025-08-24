import { StateCreator } from "zustand";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  NumberCheckState,
  NumberCheckActions,
  WhatsAppState,
  WhatsAppActions,
} from "@/types/store/whatsappState";
import {
  CheckNumbersPayload,
  NumberCheckJobControlPayload,
  NumberCheckProgressUpdate,
  WhatsAppNumberCheckResult,
} from "@/types";
import { useWhatsAppStore } from ".";

export const createNumberCheckManagerSlice: StateCreator<
  WhatsAppState & WhatsAppActions,
  [],
  [],
  NumberCheckState & NumberCheckActions
> = (set, get) => ({
  // Initial State for Number Check Manager
  numberCheckResults: [],
  numberCheckJobStatus: null,
  uploadedExcelData: null,
  excelColumns: [],
  selectedPhoneNumberColumn: "",
  minDelay: 2,
  maxDelay: 4,
  delayAfterNNumbers: 10,
  currentNumberCheckJobId: uuidv4(),
  availableNumberCheckJobs: [],

  // Actions for Number Check Manager
  setOriginalData: (data) => set({ uploadedExcelData: data }),
  setExcelColumns: (columns) => set({ excelColumns: columns }),
  setSelectedPhoneNumberColumn: (column) =>
    set({ selectedPhoneNumberColumn: column }),
  setMinDelay: (delay) => set({ minDelay: delay }),
  setMaxDelay: (delay) => set({ maxDelay: delay }),
  setDelayAfterNNumbers: (num) => set({ delayAfterNNumbers: num }),
  resetNumberCheckConfig: () =>
    set({
      uploadedExcelData: null,
      excelColumns: [],
      selectedPhoneNumberColumn: "",
      minDelay: 2,
      maxDelay: 4,
      delayAfterNNumbers: 10,
    }),

  addNumberCheckResult: (payload) =>
    set((state) => ({
      numberCheckResults: [...state.numberCheckResults, payload.result],
    })),
  setNumberCheckJobStatus: (status) => set({ numberCheckJobStatus: status }),
  resetNumberCheckResults: () => set({ numberCheckResults: [] }),
  generateNewNumberCheckJobId: () => set({ currentNumberCheckJobId: uuidv4() }),
  setAvailableNumberCheckJobs: (jobs: NumberCheckProgressUpdate[]) =>
    set({ availableNumberCheckJobs: jobs }), // BARU

  startNumberCheck: (
    jobId, // Gunakan jobId yang diterima dari frontend
    initiatingAccountId,
    excelData,
    phoneNumberColumn,
    delayConfig,
    availableClientIds
  ) => {
    const socket = getWhatsappSocket();
    const state = get();
    if (!state.isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    if (!initiatingAccountId) {
      toast.error("Pilih akun WhatsApp untuk memulai pengecekan.");
      return;
    }
    if (excelData.length === 0 || !phoneNumberColumn) {
      toast.error("Mohon unggah data Excel dan pilih kolom nomor telepon.");
      return;
    }
    if (availableClientIds.length === 0) {
      toast.error(
        "Tidak ada klien WhatsApp aktif yang tersedia untuk melakukan pengecekan."
      );
      return;
    }

    state.resetNumberCheckResults(); // Bersihkan hasil sebelumnya
    // Tidak perlu generateNewNumberCheckJobId di sini, karena jobId sudah diterima
    set({ currentNumberCheckJobId: jobId }); // Pastikan store tahu job ID yang sedang aktif

    const payload: CheckNumbersPayload = {
      jobId: jobId, // Gunakan ID job yang diterima
      accountId: initiatingAccountId,
      excelData,
      phoneNumberColumn,
      ...delayConfig,
      availableClientIds,
    };
    socket.emit("whatsapp-check-numbers", payload);
    state.resetGlobalError();
    state.setNumberCheckJobStatus({
      jobId: jobId,
      current: 0,
      total: excelData.length,
      status: "RUNNING",
      message: "Memulai pengecekan...",
    });
  },

  pauseNumberChecking: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: NumberCheckJobControlPayload = { jobId };
    socket.emit("whatsapp-pause-number-check", payload);
    get().resetGlobalError();
  },

  resumeNumberChecking: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: NumberCheckJobControlPayload = { jobId };
    socket.emit("whatsapp-resume-number-check", payload);
    get().resetGlobalError();
  },

  stopNumberChecking: (jobId) => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      toast.error("Socket tidak terhubung. Coba lagi.");
      return;
    }
    const payload: NumberCheckJobControlPayload = { jobId };
    socket.emit("whatsapp-stop-number-check", payload);
    get().resetGlobalError();
    get().setNumberCheckJobStatus(null); // Reset status job di frontend
    get().resetNumberCheckResults(); // Bersihkan hasil
    get().generateNewNumberCheckJobId(); // Generate ID baru untuk job berikutnya
  },

  loadAvailableNumberCheckJobs: () => {
    const socket = getWhatsappSocket();
    if (!get().isSocketConnected) {
      console.warn(
        "Socket not connected, cannot load available number check jobs yet."
      );
      return;
    }
    socket.emit("whatsapp-get-all-number-check-jobs");
  },
});

// Listener Socket.IO untuk memperbarui daftar pekerjaan yang tersedia
getWhatsappSocket().on(
  "whatsapp-all-number-check-jobs",
  (jobs: NumberCheckProgressUpdate[]) => {
    useWhatsAppStore.setState({ availableNumberCheckJobs: jobs });
    toast.info(
      `Memuat ${jobs.length} pekerjaan pengecekan nomor yang tersedia.`
    );
  }
);

// Listener Socket.IO untuk menghapus pekerjaan dari daftar saat dihapus di backend
getWhatsappSocket().on(
  "whatsapp-number-check-job-removed",
  (payload: { jobId: string }) => {
    useWhatsAppStore.setState((state) => ({
      availableNumberCheckJobs: state.availableNumberCheckJobs.filter(
        (job) => job.jobId !== payload.jobId
      ),
    }));
    toast.success(`Pekerjaan '${payload.jobId}' telah dihapus dari daftar.`);
    // Jika pekerjaan yang dihapus adalah yang sedang dilihat, reset current job
    if (useWhatsAppStore.getState().currentNumberCheckJobId === payload.jobId) {
      useWhatsAppStore.getState().generateNewNumberCheckJobId();
      useWhatsAppStore.getState().resetNumberCheckResults();
      useWhatsAppStore.getState().setNumberCheckJobStatus(null);
    }
  }
);

// Listener Socket.IO untuk menerima hasil pengecekan nomor tunggal
getWhatsappSocket().on(
  "whatsapp-number-check-result-single",
  (payload: { jobId: string; result: WhatsAppNumberCheckResult }) => {
    if (useWhatsAppStore.getState().currentNumberCheckJobId === payload.jobId) {
      // Check if the result belongs to the currently active job
      useWhatsAppStore.getState().addNumberCheckResult(payload); // Pass the entire payload object
    }
  }
);
