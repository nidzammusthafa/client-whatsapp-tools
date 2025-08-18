import { toast } from "sonner";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { WABlastMessageBlock } from "@/types";

/**
 * Custom hook to encapsulate the logic for controlling WA Blast jobs.
 * (Custom hook untuk mengemas logika untuk mengontrol pekerjaan WA Blast.)
 */
export const useWABlastActions = () => {
  const {
    isSocketConnected,
    uploadedExcelData,
    selectedPhoneNumberColumn,
    startWABlast,
    pauseWABlast,
    resumeWABlast,
    stopWABlast,
    enableWhatsappWarmer,
    whatsappWarmerMinMessages,
    whatsappWarmerMaxMessages,
    whatsappWarmerDelayMs,
    whatsappWarmerLanguage,
    setCurrentSelectedWABlastJobId,
  } = useWhatsAppStore();

  const handleStartBlast = (
    newJobId: string,
    selectedSenderAccountIds: string[],
    messageBlocks: WABlastMessageBlock[],
    delayConfig: {
      minDelayMs: number;
      maxDelayMs: number;
      delayAfterNRecipients: number;
      delayAfterNRecipientsMs: number;
      enableWhatsappWarmer: boolean;
      whatsappWarmerMinMessages: number;
      whatsappWarmerMaxMessages: number;
      whatsappWarmerDelayMs: number;
      whatsappWarmerLanguage: "en" | "id";
      scheduledAt: string | undefined;
    },
    uploadedFileName: string | undefined,
    scheduledAt: Date | undefined
  ) => {
    if (selectedSenderAccountIds.length === 0) {
      toast.error("Pilih setidaknya satu akun pengirim pesan massal.");
      return;
    }
    if (enableWhatsappWarmer && selectedSenderAccountIds.length < 2) {
      toast.error(
        "Untuk obrolan antar akun, pilih setidaknya dua akun pengirim."
      );
      return;
    }
    if (
      enableWhatsappWarmer &&
      (whatsappWarmerMinMessages < 0 ||
        whatsappWarmerMaxMessages < 0 ||
        whatsappWarmerDelayMs < 0)
    ) {
      toast.error("Nilai jeda obrolan antar akun tidak boleh negatif.");
      return;
    }
    if (
      enableWhatsappWarmer &&
      whatsappWarmerMinMessages > whatsappWarmerMaxMessages
    ) {
      toast.error(
        "Jeda minimal obrolan antar akun tidak boleh lebih besar dari jeda maksimal."
      );
      return;
    }

    if (!uploadedExcelData || !selectedPhoneNumberColumn) {
      toast.error("Mohon unggah file Excel dan pilih kolom nomor telepon.");
      return;
    }
    if (messageBlocks.length === 0) {
      toast.error("Tambahkan setidaknya satu blok pesan untuk dikirim.");
      return;
    }
    const hasEmptyMessage = messageBlocks.some((block) => {
      if (block.type === "text") {
        if (block.randomize) {
          const selectedRandomMessages = (
            block.randomMessageOptions || []
          ).filter((opt) => opt.selected && opt.content.trim() !== "");
          return selectedRandomMessages.length === 0;
        } else {
          return !block.textMessage?.trim();
        }
      }
      return !block.mediaData;
    });

    if (hasEmptyMessage) {
      toast.error("Beberapa blok pesan kosong atau tidak lengkap.");
      return;
    }

    if (
      delayConfig.minDelayMs < 0 ||
      delayConfig.maxDelayMs < 0 ||
      delayConfig.delayAfterNRecipients < 0 ||
      delayConfig.delayAfterNRecipientsMs < 0
    ) {
      toast.error("Nilai jeda tidak boleh negatif.");
      return;
    }
    if (delayConfig.minDelayMs > delayConfig.maxDelayMs) {
      toast.error("Jeda minimal tidak boleh lebih besar dari jeda maksimal.");
      return;
    }

    startWABlast(
      newJobId,
      selectedSenderAccountIds,
      uploadedExcelData,
      selectedPhoneNumberColumn,
      messageBlocks,
      delayConfig,
      uploadedFileName,
      scheduledAt
    );
    setCurrentSelectedWABlastJobId(newJobId);
  };

  const handlePauseResumeStop = (
    action: "pause" | "resume" | "stop",
    currentSelectedWABlastJobId: string | null
  ) => {
    if (!currentSelectedWABlastJobId) {
      toast.error("Tidak ada pekerjaan WA Blast yang sedang dipilih.");
      return;
    }
    const jobId = currentSelectedWABlastJobId;
    if (action === "pause") pauseWABlast(jobId);
    if (action === "resume") resumeWABlast(jobId);
    if (action === "stop") stopWABlast(jobId);
  };

  return {
    handleStartBlast,
    handlePauseResumeStop,
    isSocketConnected,
    uploadedExcelData,
    selectedPhoneNumberColumn,
    enableWhatsappWarmer,
    whatsappWarmerMinMessages,
    whatsappWarmerMaxMessages,
    whatsappWarmerDelayMs,
    whatsappWarmerLanguage,
  };
};
