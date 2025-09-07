import { connectWhatsappSocket, getWhatsappSocket } from "@/lib/whatsappSocket";
import { useWhatsAppStore } from "@/stores/whatsapp";
import {
  WhatsAppClientStatusUpdate,
  NumberCheckProgressUpdate,
  WarmerProgressUpdate,
  WarmerMessageLogEntry,
  WABlastProgressUpdate,
  WABlastMessageLogEntry,
  StoredMessage,
  InitialSettingsPayload,
  StartWABlastPayload,
  WarmerJob,
} from "@/types";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner"; // Import toast for messages
import { v4 as uuidv4 } from "uuid";

/**
 * Custom hook untuk mengelola koneksi dan event Socket.IO,
 * serta memperbarui state aplikasi melalui store Zustand.
 */
export const useWhatsAppManager = () => {
  // Ambil actions dari store Zustand
  const {
    setSocketConnected,
    setGlobalError,
    updateClientStatus,
    setExistingClients,
    setNumberCheckJobStatus,
    resetNumberCheckResults,
    generateNewNumberCheckJobId,
    setWaWarmerJobs,
    setWarmerJobStatus,
    addWarmerMessageLogEntry,
    resetWarmerMessagesLog,
    setCurrentWarmerJobId,
    setWaBlastJobs,
    updateWaBlastJobStatus,
    addWABlastMessageLogEntry,
    removeWaBlastJob,
    setCurrentSelectedWABlastJobId,
    setStoredMessages,
    loadStoredMessages,
    setWhitelistNumbers,
    setInitialSettings,
  } = useWhatsAppStore();

  // Dapatkan instance socket
  const socket: Socket = getWhatsappSocket();

  useEffect(() => {
    connectWhatsappSocket();

    // Event listener untuk koneksi socket
    const onConnect = () => {
      console.log("Socket.IO connected.");
      setSocketConnected(true);
      setGlobalError(null); // Hapus error jika berhasil terhubung

      loadStoredMessages();
      socket.emit("whatsapp-get-initial-settings"); // Minta pengaturan awal, termasuk whitelist
      socket.emit("whatsapp-get-all-blast-jobs");
      socket.emit("whatsapp-get-all-warmer-jobs");
    };

    // Event listener untuk pemutusan koneksi socket
    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.warn(`Socket.IO disconnected: ${reason}`);
      setSocketConnected(false);
      setGlobalError(`Koneksi terputus: ${reason}.`);
      setNumberCheckJobStatus(null); // Reset status job jika terputus
      resetNumberCheckResults(); // Bersihkan hasil pengecekan
      generateNewNumberCheckJobId(); // Generate ID baru untuk job berikutnya
      setWarmerJobStatus(null); // Reset status job warmer
      resetWarmerMessagesLog(); // Bersihkan log pesan warmer
      setCurrentWarmerJobId(uuidv4()); // Generate ID baru untuk job warmer berikutnya
      setWaBlastJobs({}); // BARU: Reset semua job WA Blast saat terputus
      setCurrentSelectedWABlastJobId(null); // BARU: Reset pilihan job
    };

    // Event listener untuk kesalahan koneksi socket
    const onConnectError = (error: Error) => {
      console.error("Socket.IO connection error:", error.message);
      setGlobalError(`Kesalahan koneksi: ${error.message}.`);
      setNumberCheckJobStatus(null);
      resetNumberCheckResults();
      generateNewNumberCheckJobId();
      setWarmerJobStatus(null);
      resetWarmerMessagesLog();
      setWarmerJobStatus(null);
      setCurrentWarmerJobId(uuidv4());
      setWaBlastJobs({}); // BARU: Reset semua job WA Blast saat error koneksi
      setCurrentSelectedWABlastJobId(null); // BARU: Reset pilihan job
    };

    // Event listener untuk pembaruan status klien WhatsApp dari backend
    const onWhatsAppStatus = (update: WhatsAppClientStatusUpdate) => {
      updateClientStatus(update);
    };

    // Event listener untuk daftar klien WhatsApp yang sudah ada saat koneksi awal
    const onExistingClients = (
      existingClients: WhatsAppClientStatusUpdate[]
    ) => {
      setExistingClients(existingClients);
    };

    // Event listener untuk kesalahan spesifik WhatsApp dari backend
    const onWhatsAppError = (error: { message: string }) => {
      console.error("Kesalahan WhatsApp dari backend:", error.message);
      setGlobalError(`Kesalahan WhatsApp: ${error.message}`);
      const currentNumberCheckJobStatus =
        useWhatsAppStore.getState().numberCheckJobStatus;
      if (
        currentNumberCheckJobStatus?.status === "RUNNING" ||
        currentNumberCheckJobStatus?.status === "PAUSED"
      ) {
        setNumberCheckJobStatus({
          ...currentNumberCheckJobStatus,
          status: "ERROR",
          message: error.message,
        });
      }
      const currentWarmerJobStatus =
        useWhatsAppStore.getState().warmerJobStatus;
      if (
        currentWarmerJobStatus?.status === "RUNNING" ||
        currentWarmerJobStatus?.status === "PAUSED"
      ) {
        setWarmerJobStatus({
          ...currentWarmerJobStatus,
          status: "ERROR",
          message: error.message,
        });
      }
      // BARU: Tangani error untuk WA Blast
      const currentWaBlastJobs = useWhatsAppStore.getState().waBlastJobs;
      if (Object.keys(currentWaBlastJobs).length > 0) {
        // Asumsi error ini mungkin spesifik untuk job yang sedang aktif di UI,
        // atau kita bisa menandai semua job sebagai error jika errornya global.
        // Untuk saat ini, kita bisa menandai job yang sedang dipilih sebagai error jika ada.
        const selectedJobId =
          useWhatsAppStore.getState().currentSelectedWABlastJobId;
        if (selectedJobId && currentWaBlastJobs[selectedJobId]) {
          updateWaBlastJobStatus({
            ...currentWaBlastJobs[selectedJobId],
            status: "FAILED",
            message: error.message,
          });
        }
      }
    };

    // Event listener untuk update progress pekerjaan pengecekan nomor
    const onNumberCheckProgress = (update: NumberCheckProgressUpdate) => {
      setNumberCheckJobStatus(update);
    };

    // Event listener untuk mendapatkan semua pekerjaan waWarmer yang aktif
    const onWarmerJobs = (jobs: WarmerJob[]) => {
      const jobsMap: Record<string, WarmerJob> = {};
      jobs.forEach((job) => {
        jobsMap[job.jobId] = job;
      });

      setWaWarmerJobs(jobsMap);
    };

    // Event listener untuk update progress pekerjaan warmer
    const onWarmerProgress = (update: WarmerProgressUpdate) => {
      setWarmerJobStatus(update);
    };

    // Event listener untuk single job warmer
    const onSingleWarmerJob = (job: WarmerProgressUpdate) => {
      setWarmerJobStatus(job);
    };

    // Event listener untuk semua pekerjaan warmer
    const onAllWarmerJobs = (jobs: WarmerJob[]) => {
      const jobsMap: Record<string, WarmerJob> = {};
      jobs.forEach((job) => {
        jobsMap[job.jobId] = job;
      });
      setWaWarmerJobs(jobsMap);
    };

    // Event listener untuk setiap pesan yang dikirim oleh warmer
    const onWarmerMessageSent = (entry: WarmerMessageLogEntry) => {
      addWarmerMessageLogEntry(entry);
    };

    // BARU: Event listener untuk update progress pekerjaan WA Blast (per job)
    const onWABlastProgress = (update: WABlastProgressUpdate) => {
      updateWaBlastJobStatus(update); // Memperbarui status job spesifik
    };

    // BARU: Event listener untuk setiap pesan yang dikirim oleh WA Blast (per job)
    const onWABlastMessageSent = (entry: WABlastMessageLogEntry) => {
      addWABlastMessageLogEntry(entry.blastJobId!, entry); // Meneruskan jobId
    };

    // Event listener untuk daftar pesan tersimpan
    const onStoredMessages = (messages: StoredMessage[]) => {
      setStoredMessages(messages);
    };

    // Event listener saat pesan tersimpan berhasil disimpan
    const onStoredMessageSaved = (message: StoredMessage) => {
      toast.success(`Pesan '${message.name}' berhasil disimpan.`);
      loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
    };

    // Event listener saat pesan tersimpan berhasil dihapus
    const onStoredMessageDeleted = () => {
      toast.success(`Pesan berhasil dihapus.`);
      loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
    };

    // Event listener saat pesan tersimpan berhasil diperbarui
    const onStoredMessageUpdated = (message: StoredMessage) => {
      toast.success(`Pesan '${message.name}' berhasil diperbarui.`);
      loadStoredMessages(); // Muat ulang daftar pesan untuk update UI
    };

    // Event listener untuk pengaturan awal (termasuk whitelist)
    const onInitialSettings = (payload: InitialSettingsPayload) => {
      setInitialSettings(payload); // Memperbarui state whitelist dan mainClientAccountId
    };

    // Event listener saat whitelist diperbarui dari backend
    const onWhitelistUpdated = (payload: { numbers: string[] }) => {
      setWhitelistNumbers(payload.numbers); // Memperbarui state whitelist di store
      toast.info("Daftar whitelist diperbarui dari server.");
    };

    const onAllBlastJobs = (jobs: WABlastProgressUpdate[]) => {
      const jobsMap: Record<string, WABlastProgressUpdate> = {};
      jobs.forEach((job) => {
        jobsMap[job.jobId] = job;
      });
      setWaBlastJobs(jobsMap); // Mengisi ulang semua job
      // Jika ada job yang sedang berjalan/dijeda, pilih yang pertama sebagai default
      if (jobs.length > 0) {
        // Pilih job yang statusnya running/paused sebagai yang pertama ditampilkan
        const firstActiveJob = jobs.find(
          (j) => j.status === "IN_PROGRESS" || j.status === "PAUSED"
        );
        setCurrentSelectedWABlastJobId(
          firstActiveJob ? firstActiveJob.jobId : jobs[0].jobId
        );
      } else {
        setCurrentSelectedWABlastJobId(null);
      }
    };
    // BARU: Event listener saat semua job WA Blast yang aktif dimuat dari backend

    // BARU: Event listener saat sebuah job WA Blast dihapus dari backend
    const onWABlastJobRemoved = (payload: { jobId: string }) => {
      console.log(`Job WA Blast '${payload.jobId}' dihapus dari backend.`);
      removeWaBlastJob(payload.jobId);
      toast.info(
        `Pekerjaan WA Blast '${payload.jobId}' telah selesai atau dihentikan.`
      );
    };

    const onEditWABlastJob = (payload: StartWABlastPayload) => {
      console.log("WABLAST PAYLOAD: ", payload);
    };

    // Daftarkan event listener
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("whatsapp-status", onWhatsAppStatus);
    socket.on("existing-whatsapp-clients", onExistingClients);
    socket.on("whatsapp-error", onWhatsAppError);
    socket.on("whatsapp-number-check-progress", onNumberCheckProgress);
    socket.on("whatsapp-get-warmer-job", onSingleWarmerJob);
    socket.on("whatsapp-all-warmer-jobs", onAllWarmerJobs);
    socket.on("whatsapp-get-all-warmer-jobs", onWarmerProgress);
    socket.on("whatsapp-warmer-progress", onWarmerProgress);
    socket.on("whatsapp-warmer-message-sent", onWarmerMessageSent);
    socket.on("whatsapp-blast-progress", onWABlastProgress);
    socket.on("whatsapp-blast-message-sent", onWABlastMessageSent);
    socket.on("whatsapp-stored-messages", onStoredMessages);
    socket.on("whatsapp-stored-message-saved", onStoredMessageSaved);
    socket.on("whatsapp-stored-message-deleted", onStoredMessageDeleted);
    socket.on("whatsapp-stored-message-updated", onStoredMessageUpdated);
    socket.on("whatsapp-initial-settings", onInitialSettings);
    socket.on("whatsapp-whitelist-updated", onWhitelistUpdated);
    socket.on("whatsapp-blast-all-jobs", onAllBlastJobs);
    socket.on("whatsapp-blast-job-removed", onWABlastJobRemoved);
    socket.on("whatsapp-blast-job-for-edit", onEditWABlastJob);

    // Cleanup: Hapus event listener saat komponen dilepas
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("whatsapp-status", onWhatsAppStatus);
      socket.off("existing-whatsapp-clients", onExistingClients);
      socket.off("whatsapp-error", onWhatsAppError);
      socket.off("whatsapp-number-check-progress", onNumberCheckProgress);
      socket.off("whatsapp-all-active-warmer-jobs", onWarmerJobs);
      socket.off("whatsapp-get-warmer-job", onSingleWarmerJob);
      socket.off("whatsapp-all-warmer-jobs", onAllWarmerJobs);
      socket.off("whatsapp-warmer-progress", onWarmerProgress);
      socket.off("whatsapp-warmer-message-sent", onWarmerMessageSent);
      socket.off("whatsapp-blast-progress", onWABlastProgress);
      socket.off("whatsapp-blast-message-sent", onWABlastMessageSent);
      socket.off("whatsapp-stored-messages", onStoredMessages);
      socket.off("whatsapp-stored-message-saved", onStoredMessageSaved);
      socket.off("whatsapp-stored-message-deleted", onStoredMessageDeleted);
      socket.off("whatsapp-stored-message-updated", onStoredMessageUpdated);
      socket.off("whatsapp-initial-settings", onInitialSettings);
      socket.off("whatsapp-whitelist-updated", onWhitelistUpdated);
      socket.off("whatsapp-blast-all-jobs", onAllBlastJobs);
      socket.off("whatsapp-blast-job-removed", onWABlastJobRemoved);
      socket.off("whatsapp-blast-job-for-edit", onEditWABlastJob);
    };
  }, [
    socket,
    setSocketConnected,
    setGlobalError,
    updateClientStatus,
    setExistingClients,
    setNumberCheckJobStatus,
    resetNumberCheckResults,
    generateNewNumberCheckJobId,
    setWaWarmerJobs,
    setWarmerJobStatus,
    addWarmerMessageLogEntry,
    resetWarmerMessagesLog,
    setCurrentWarmerJobId,
    addWABlastMessageLogEntry,
    setStoredMessages,
    loadStoredMessages,
    setWhitelistNumbers,
    setInitialSettings,
    setWaBlastJobs,
    setCurrentSelectedWABlastJobId,
    updateWaBlastJobStatus,
    removeWaBlastJob,
  ]);

  // Hook ini sekarang hanya bertanggung jawab untuk inisialisasi socket dan event listeners.
  // State dan actions lainnya diakses langsung dari useWhatsAppStore di komponen.
};
