import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ExcelRow, WABlastMessageBlock, WABlastMessageType } from "@/types";
import { useWhatsAppStore } from "@/stores/whatsapp";

declare const XLSX: typeof import("xlsx");

/**
 * Custom hook to manage all local state for the WA Blast configuration form.
 * (Custom hook untuk mengelola semua state lokal untuk formulir konfigurasi WA Blast.)
 */
export const useWABlastForm = () => {
  const {
    setOriginalData,
    setExcelColumns,
    setSelectedPhoneNumberColumn,
    uploadedExcelData,
    excelColumns,
    selectedPhoneNumberColumn,
    storedMessages,
    setEnableWhatsappWarmer,
    setWhatsappWarmerMinMessages,
    setWhatsappWarmerMaxMessages,
    setWhatsappWarmerDelayMs,
    setWhatsappWarmerLanguage,
    waBlastJobs,
    currentSelectedWABlastJobId,
    isSocketConnected,
  } = useWhatsAppStore();

  const [newJobId, setNewJobId] = useState(uuidv4());
  const [selectedSenderAccountIds, setSelectedSenderAccountIds] = useState<
    string[]
  >([]);
  const [minDelay, setMinDelay] = useState<number>(2);
  const [maxDelay, setMaxDelay] = useState<number>(5);
  const [delayAfterNRecipients, setDelayAfterNRecipients] =
    useState<number>(100);
  const [delayAfterNRecipientsSeconds, setDelayAfterNRecipientsSeconds] =
    useState<number>(60);
  const [messageBlocks, setMessageBlocks] = useState<WABlastMessageBlock[]>([]);
  const [activeTab, setActiveTab] = useState<string>("message-0");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(
    undefined
  );
  const [skipRecipientsInAddress, setSkipRecipientsInAddress] =
    useState<boolean>(true);

  const handleFileUpload = useCallback(
    (files: File[] | File) => {
      const file = Array.isArray(files) ? files[0] : files;
      if (!file) return;

      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Mohon unggah file Excel (.xlsx atau .xls) yang valid.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          if (typeof XLSX === "undefined") {
            toast.error("Pustaka XLSX tidak dimuat. Coba muat ulang halaman.");
            return;
          }
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

          if (json.length === 0) {
            toast.warning("File Excel kosong atau tidak memiliki data.");
            setOriginalData(null);
            setExcelColumns([]);
            setSelectedPhoneNumberColumn("");
            return;
          }

          setOriginalData(json);
          const columns = Object.keys(json[0]);
          setExcelColumns(columns);
          setSelectedPhoneNumberColumn("");
          setUploadedFileName(file.name);
          toast.success(
            `File Excel '${file.name}' berhasil diunggah. Pilih kolom nomor telepon.`
          );
        } catch (error) {
          console.error("Error reading Excel file:", error);
          toast.error("Gagal membaca file Excel. Pastikan formatnya benar.");
          setOriginalData(null);
          setExcelColumns([]);
          setSelectedPhoneNumberColumn("");
          setUploadedFileName(undefined);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [setOriginalData, setExcelColumns, setSelectedPhoneNumberColumn]
  );

  const handleAddMessageBlock = () => {
    const newBlockId = uuidv4();
    setMessageBlocks((prev) => {
      const newBlocks = [
        ...prev,
        {
          id: newBlockId,
          type: "text" as WABlastMessageType,
          textMessage: "",
          randomize: false,
          randomMessageOptions: [],
        },
      ];
      return newBlocks;
    });
    setActiveTab(`message-${messageBlocks.length}`);
  };

  const handleUpdateMessageBlock = (
    index: number,
    updatedBlock: WABlastMessageBlock
  ) => {
    setMessageBlocks((prev) =>
      prev.map((block, i) => (i === index ? updatedBlock : block))
    );
  };

  const handleRemoveMessageBlock = (index: number) => {
    setMessageBlocks((prev) => {
      const updatedBlocks = prev.filter((_, i) => i !== index);
      if (activeTab === `message-${index}`) {
        if (updatedBlocks.length > 0) {
          const newActiveIndex = Math.max(0, index - 1);
          setActiveTab(`message-${newActiveIndex}`);
        } else {
          setActiveTab("message-0");
        }
      }
      return updatedBlocks;
    });
  };

  const handleSenderAccountSelection = (
    accountId: string,
    checked: boolean
  ) => {
    setSelectedSenderAccountIds((prev) =>
      checked ? [...prev, accountId] : prev.filter((id) => id !== accountId)
    );
  };

  const handleEditButton = () => {
    if (!currentSelectedWABlastJobId) {
      toast.error("Tidak ada pekerjaan WA Blast yang sedang dipilih.");
      return;
    }

    const jobToEdit = waBlastJobs[currentSelectedWABlastJobId];
    if (!jobToEdit) {
      toast.error("Pekerjaan tidak ditemukan.");
      return;
    }

    // Reset all form state with data from the job to be edited
    // (Setel ulang semua state form dengan data dari pekerjaan yang akan diedit)
    setSelectedSenderAccountIds(jobToEdit.senderAccountIds || []);
    setMinDelay(jobToEdit.minDelayMs!);
    setMaxDelay(jobToEdit.maxDelayMs!);
    setDelayAfterNRecipients(jobToEdit.delayAfterNRecipients!);
    setDelayAfterNRecipientsSeconds(jobToEdit.delayAfterNRecipientsMs!);
    setMessageBlocks(jobToEdit.messageBlocks || []);
    setScheduledAt(
      jobToEdit.scheduledAt ? new Date(jobToEdit.scheduledAt) : undefined
    );
    setUploadedFileName(jobToEdit.fileName);
    setOriginalData(jobToEdit.excelData || null);
    setExcelColumns(jobToEdit.excelColumns || []);
    setSelectedPhoneNumberColumn(jobToEdit.phoneNumberColumn || "");
    setEnableWhatsappWarmer(jobToEdit.enableWhatsappWarmer || false);
    setWhatsappWarmerMinMessages(jobToEdit.whatsappWarmerMinMessages || 0);
    setWhatsappWarmerMaxMessages(jobToEdit.whatsappWarmerMaxMessages || 0);
    setWhatsappWarmerDelayMs(jobToEdit.whatsappWarmerDelayMs! || 0);
    setWhatsappWarmerLanguage(jobToEdit.whatsappWarmerLanguage || "en");
    setSkipRecipientsInAddress(jobToEdit.skipRecipientsInAddress ?? true);

    setNewJobId(jobToEdit.jobId);
    // setCurrentSelectedWABlastJobId(null); // Return to "create" mode
    toast.success("Konfigurasi pekerjaan berhasil dimuat ke formulir.");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return {
    // State
    newJobId,
    selectedSenderAccountIds,
    minDelay,
    maxDelay,
    delayAfterNRecipients,
    delayAfterNRecipientsSeconds,
    messageBlocks,
    activeTab,
    scheduledAt,
    uploadedFileName,
    uploadedExcelData,
    excelColumns,
    selectedPhoneNumberColumn,
    storedMessages,
    waBlastJobs,
    currentSelectedWABlastJobId,
    isSocketConnected,
    skipRecipientsInAddress,
    // Setters
    setNewJobId,
    setSelectedSenderAccountIds,
    setSelectedPhoneNumberColumn,
    setMinDelay,
    setMaxDelay,
    setDelayAfterNRecipients,
    setDelayAfterNRecipientsSeconds,
    setOriginalData,
    setMessageBlocks,
    setActiveTab,
    setScheduledAt,
    setUploadedFileName,
    setSkipRecipientsInAddress,

    // Handlers
    handleFileUpload,
    handleAddMessageBlock,
    handleUpdateMessageBlock,
    handleRemoveMessageBlock,
    handleSenderAccountSelection,
    handleEditButton,
  };
};
