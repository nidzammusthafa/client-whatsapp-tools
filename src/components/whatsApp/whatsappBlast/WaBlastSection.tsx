import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Pause,
  Play,
  StopCircle,
  MessageCircleMore,
  Plus,
  FilePlus,
  Settings,
  List,
  Terminal,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import komponen modular yang baru
import WABlastMessagesTable from "./WABlastMessagesTable";
import MessageBlockInput from "./MessageBlockInput";
import { UploadZone } from "@/components/UploadZone";
import {
  ExcelRow,
  WABlastMessageBlock,
  WABlastMessageType,
  WABlastProgressUpdate,
} from "@/types";
import StoredMessageManagement from "../message/StoredMessageManagement";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Deklarasi global untuk library XLSX yang dimuat dari CDN
declare const XLSX: typeof import("xlsx");

/**
 * Komponen utama untuk fitur WhatsApp Blast.
 * Memungkinkan pengguna untuk mengunggah daftar penerima dari Excel,
 * memilih akun pengirim, membuat dan mengelola blok pesan (teks/media),
 * mengatur penundaan pengiriman, dan memantau progres blast.
 */
const WABlastSection: React.FC = () => {
  const {
    clients,
    isSocketConnected,
    uploadedExcelData,
    setOriginalData,
    excelColumns,
    setExcelColumns,
    selectedPhoneNumberColumn,
    setSelectedPhoneNumberColumn,
    waBlastJobs, // Mengambil semua pekerjaan WA Blast
    setWaBlastJobs,
    currentSelectedWABlastJobId, // Mengambil ID pekerjaan yang sedang dipilih
    setCurrentSelectedWABlastJobId, // Untuk memilih pekerjaan
    startWABlast,
    pauseWABlast,
    resumeWABlast,
    stopWABlast,
    removeWaBlastJob,
    storedMessages,
    enableWhatsappWarmer,
    setEnableWhatsappWarmer,
    whatsappWarmerMinMessages,
    setWhatsappWarmerMinMessages,
    whatsappWarmerMaxMessages,
    setWhatsappWarmerMaxMessages,
    whatsappWarmerDelayMs,
    setWhatsappWarmerDelayMs,
    whatsappWarmerMinDelayMs,
    setWhatsappWarmerMinDelayMs,
    whatsappWarmerMaxDelayMs,
    setWhatsappWarmerMaxDelayMs,
    whatsappWarmerLanguage,
    setWhatsappWarmerLanguage,
    waWarmerJobs,
    setWarmerJobId,
    warmerJobId,
  } = useWhatsAppStore();

  // State lokal untuk konfigurasi WA Blast
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
  const [isStoredMessageDialogOpen, setIsStoredMessageDialogOpen] =
    useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(
    undefined
  );

  // BARU: State lokal untuk pekerjaan yang sedang dibuat
  const [newJobId, setNewJobId] = useState(uuidv4()); // ID unik untuk pekerjaan baru

  // Dapatkan pekerjaan WA Blast yang sedang dipilih/dilihat
  const currentJob: WABlastProgressUpdate | undefined =
    currentSelectedWABlastJobId
      ? waBlastJobs[currentSelectedWABlastJobId]
      : undefined;

  // Efek untuk memuat ulang data form jika pekerjaan yang dipilih berubah
  useEffect(() => {
    if (currentJob) {
      // Hanya isi ulang form jika ini bukan pekerjaan yang baru dibuat
      // dan jika data di `currentJob` berbeda dari state form saat ini
      // Ini mencegah form reset saat update progres
      if (
        currentJob.jobId !== newJobId &&
        JSON.stringify(currentJob.senderAccountIds) !==
          JSON.stringify(selectedSenderAccountIds)
      ) {
        setSelectedSenderAccountIds(currentJob.senderAccountIds || []);
        setMinDelay(currentJob.minDelayMs!);
        setMaxDelay(currentJob.maxDelayMs!);
        setDelayAfterNRecipients(currentJob.delayAfterNRecipients!);
        setDelayAfterNRecipientsSeconds(currentJob.delayAfterNRecipientsMs!);
        setEnableWhatsappWarmer(currentJob.enableWhatsappWarmer!);
        setWhatsappWarmerMinMessages(currentJob.whatsappWarmerMinMessages!);
        setWhatsappWarmerMaxMessages(currentJob.whatsappWarmerMaxMessages!);
        setWhatsappWarmerDelayMs(currentJob.whatsappWarmerDelayMs!);
        setWhatsappWarmerMinDelayMs(currentJob.whatsappWarmerMinDelayMs!);
        setWhatsappWarmerMaxDelayMs(currentJob.whatsappWarmerMaxDelayMs!);
        setWhatsappWarmerLanguage(currentJob.whatsappWarmerLanguage!);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentJob,
    newJobId,
    // selectedSenderAccountIds,
    setEnableWhatsappWarmer,
    setWhatsappWarmerDelayMs,
    setWhatsappWarmerMinDelayMs,
    setWhatsappWarmerMaxDelayMs,
    setWhatsappWarmerLanguage,
    setWhatsappWarmerMaxMessages,
    setWhatsappWarmerMinMessages,
  ]); // Dependensi pada currentJob

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

    // Setel ulang semua state form dengan data dari pekerjaan yang akan diedit
    setSelectedSenderAccountIds(jobToEdit.senderAccountIds || []);
    setMinDelay(jobToEdit.minDelayMs!);
    setMaxDelay(jobToEdit.maxDelayMs!);
    setDelayAfterNRecipients(jobToEdit.delayAfterNRecipients!);
    setDelayAfterNRecipientsSeconds(jobToEdit.delayAfterNRecipientsMs!);
    setMessageBlocks(jobToEdit.messageBlocks || []); // Ini penting!
    setScheduledAt(
      jobToEdit.scheduledAt ? new Date(jobToEdit.scheduledAt) : undefined
    );
    setUploadedFileName(jobToEdit.fileName);
    setOriginalData(jobToEdit.excelData || null); // Ini juga penting!
    setExcelColumns(jobToEdit.excelColumns || []);
    setSelectedPhoneNumberColumn(jobToEdit.phoneNumberColumn || "");
    setEnableWhatsappWarmer(jobToEdit.enableWhatsappWarmer || false);
    setWhatsappWarmerMinMessages(jobToEdit.whatsappWarmerMinMessages || 0);
    setWhatsappWarmerMaxMessages(jobToEdit.whatsappWarmerMaxMessages || 0);
    setWhatsappWarmerDelayMs(jobToEdit.whatsappWarmerDelayMs! || 0);
    setWhatsappWarmerMinDelayMs(jobToEdit.whatsappWarmerMinDelayMs! || 0);
    setWhatsappWarmerMaxDelayMs(jobToEdit.whatsappWarmerMaxDelayMs! || 0);
    setWhatsappWarmerLanguage(jobToEdit.whatsappWarmerLanguage || "en");

    setNewJobId(jobToEdit.jobId);
    setCurrentSelectedWABlastJobId(null); // Kembali ke mode "buat
  };

  const handleStartBlast = () => {
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
      minDelay < 0 ||
      maxDelay < 0 ||
      delayAfterNRecipients < 0 ||
      delayAfterNRecipientsSeconds < 0
    ) {
      toast.error("Nilai jeda tidak boleh negatif.");
      return;
    }
    if (minDelay > maxDelay) {
      toast.error("Jeda minimal tidak boleh lebih besar dari jeda maksimal.");
      return;
    }

    const delayConfig = {
      minDelayMs: minDelay,
      maxDelayMs: maxDelay,
      delayAfterNRecipients: delayAfterNRecipients,
      delayAfterNRecipientsMs: delayAfterNRecipientsSeconds,
      enableWhatsappWarmer: enableWhatsappWarmer,
      whatsappWarmerMinMessages: whatsappWarmerMinMessages,
      whatsappWarmerMaxMessages: whatsappWarmerMaxMessages,
      whatsappWarmerDelayMs: whatsappWarmerDelayMs,
      whatsappWarmerMinDelayMs: whatsappWarmerMinDelayMs,
      whatsappWarmerMaxDelayMs: whatsappWarmerMaxDelayMs,
      whatsappWarmerLanguage: whatsappWarmerLanguage,
      warmerJobId: warmerJobId,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
    };

    // Saat memulai pekerjaan baru, gunakan newJobId yang sudah ada
    startWABlast(
      newJobId, // Gunakan newJobId
      selectedSenderAccountIds,
      uploadedExcelData,
      selectedPhoneNumberColumn,
      messageBlocks,
      delayConfig,
      uploadedFileName,
      scheduledAt
    );

    // Setelah memulai, secara otomatis pilih job yang baru dimulai
    setCurrentSelectedWABlastJobId(newJobId);
  };

  const handlePauseResumeStop = (action: "pause" | "resume" | "stop") => {
    if (!currentSelectedWABlastJobId) {
      toast.error("Tidak ada pekerjaan WA Blast yang sedang dipilih.");
      return;
    }
    const jobId = currentSelectedWABlastJobId;
    if (action === "pause") pauseWABlast(jobId);
    if (action === "resume") resumeWABlast(jobId);
    if (action === "stop") stopWABlast(jobId);
  };

  const isBlastRunning =
    currentJob?.status === "IN_PROGRESS" || currentJob?.status === "PAUSED";

  const activeClients = clients.filter(
    (c) => c.status === "ready" || c.status === "authenticated"
  );

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-6">
        {/* Bagian Daftar Pekerjaan WA Blast yang Aktif */}
        {Object.keys(waBlastJobs).length > 0 && (
          <div className="space-y-4 border rounded-md p-4 bg-muted">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <List className="h-5 w-5" /> Pekerjaan WA Blast Aktif
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(waBlastJobs).map((job) => (
                <Card
                  key={job.jobId}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    currentSelectedWABlastJobId === job.jobId
                      ? "border-primary-foreground shadow-md bg-primary/10"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setCurrentSelectedWABlastJobId(job.jobId)}
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="truncate flex-1">{job.jobId}</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        job.status === "IN_PROGRESS"
                          ? "bg-green-500/20 text-green-600"
                          : job.status === "PAUSED"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-gray-500/20 text-gray-600"
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.currentRecipients}/{job.totalRecipients} Penerima
                  </p>
                  <p className="text-xs text-muted-foreground max-h-1">
                    Status:{" "}
                    {job.status === "CANCELED"
                      ? "Job dibatalkan karena server restart."
                      : job.message}
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    {job.status !== "IN_PROGRESS" && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeWaBlastJob(job.jobId);
                            const newJobs = Object.values(waBlastJobs).filter(
                              (j) => j.jobId !== job.jobId
                            );
                            setWaBlastJobs(
                              Object.fromEntries(
                                newJobs.map((j) => [j.jobId, j])
                              )
                            );
                          }}
                        >
                          Hapus
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleEditButton}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Pilih pekerjaan di atas untuk melihat detail progres dan log.
            </p>
          </div>
        )}

        {/* Form untuk memulai WA Blast baru atau melihat detail pekerjaan yang dipilih */}
        {!currentSelectedWABlastJobId ? (
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Mulai Pekerjaan WA Blast Baru
          </h3>
        ) : (
          <h3 className="text-lg font-semibold text-foreground mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSelectedWABlastJobId(null)}
            >
              <Plus className="mr-2 h-4 w-4" /> Buat Pekerjaan Baru
            </Button>
          </h3>
        )}

        {/* Form Input WA Blast (disembunyikan jika ada job terpilih yang sedang berjalan/dijeda) */}
        {!currentJob || currentJob.status === "FAILED" ? (
          <>
            {/* Bagian Unggah Excel dan Pilih Akun Pengirim */}
            {!uploadedExcelData ? (
              <UploadZone
                onFilesSelected={handleFileUpload}
                accept=".xlsx,.xls"
                label="Seret atau klik untuk mengunggah file Excel (.xlsx, .xls)"
                disabled={isBlastRunning}
              />
            ) : (
              <div className="flex flex-col md:flex-row gap-4 w-full items-center justify-between">
                <div className="flex-1 space-y-2 w-full">
                  <Label htmlFor="sender-accounts" className="text-foreground">
                    Pilih Akun Pengirim (Bisa Lebih Dari Satu)
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="select-all-senders"
                      checked={selectedSenderAccountIds.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSenderAccountIds(
                            activeClients
                              .filter((client) => !client.isBlastActive)
                              .map((client) => client.accountId)
                          );
                        } else {
                          setSelectedSenderAccountIds([]);
                        }
                      }}
                      disabled={
                        isBlastRunning ||
                        !isSocketConnected ||
                        !activeClients.length
                      }
                    />
                    <Label htmlFor="select-all-senders">Pilih Semua</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {activeClients.length === 0 ? (
                      <p className="text-muted-foreground col-span-full">
                        Tidak ada klien aktif yang tersedia.
                      </p>
                    ) : (
                      activeClients.map((client) => (
                        <div
                          key={client.accountId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`sender-client-${client.accountId}`}
                            checked={selectedSenderAccountIds.includes(
                              client.accountId
                            )}
                            onCheckedChange={(checked) =>
                              handleSenderAccountSelection(
                                client.accountId,
                                checked as boolean
                              )
                            }
                            disabled={
                              isBlastRunning ||
                              !isSocketConnected ||
                              client.isBlastActive
                            }
                          />
                          <Label
                            htmlFor={`sender-client-${client.accountId}`}
                            className="text-sm"
                          >
                            {client.accountId} ({client.phoneNumber || "N/A"})
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedSenderAccountIds.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Terpilih: {selectedSenderAccountIds.length} akun.
                    </p>
                  )}
                  {selectedSenderAccountIds.length === 0 && (
                    <p className="text-sm text-destructive">
                      Pilih setidaknya satu akun WhatsApp pengirim yang aktif.
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setOriginalData(null)}
                  className="mt-4 md:mt-0"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Ganti File
                </Button>
              </div>
            )}

            {uploadedExcelData && excelColumns.length > 0 && (
              <div className="flex gap-2 w-full">
                <div className="space-y-2">
                  <Label htmlFor="column-select" className="text-foreground">
                    Pilih Kolom Nomor Telepon
                  </Label>
                  <Select
                    onValueChange={setSelectedPhoneNumberColumn}
                    value={selectedPhoneNumberColumn}
                    disabled={isBlastRunning}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kolom..." />
                    </SelectTrigger>
                    <SelectContent>
                      {excelColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Jumlah baris data: {uploadedExcelData.length}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-id-display" className="text-foreground">
                    ID Pekerjaan
                  </Label>
                  <Input
                    id="job-id-display"
                    type="text"
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value.trim())}
                    className="w-full bg-muted-foreground/10"
                  />
                  <p className="text-sm text-muted-foreground">
                    ID unik untuk pekerjaan WA Blast ini.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-date" className="text-foreground">
                    Jadwalkan Blast (Opsional)
                  </Label>
                  <DatePicker date={scheduledAt} setDate={setScheduledAt} />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Dialog
                open={isStoredMessageDialogOpen}
                onOpenChange={setIsStoredMessageDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <Settings className="mr-2 h-4 w-4" /> Atur Pesan Tersimpan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Manajemen Pesan Tersimpan</DialogTitle>
                  </DialogHeader>
                  <StoredMessageManagement />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 border rounded-md p-4 bg-muted">
              <Label className="text-foreground">
                Konfigurasi Pesan yang Akan Dikirim
              </Label>
              {messageBlocks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Tekan &quot;Tambah Pesan&quot; untuk mulai membuat pesan.
                </p>
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full overflow-x-auto justify-start">
                    {messageBlocks.map((block, index) => (
                      <TabsTrigger key={block.id} value={`message-${index}`}>
                        Pesan {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {messageBlocks.map((block, index) => (
                    <TabsContent
                      key={block.id}
                      value={`message-${index}`}
                      className="mt-4"
                    >
                      <MessageBlockInput
                        block={block}
                        index={index}
                        onUpdate={handleUpdateMessageBlock}
                        onRemove={handleRemoveMessageBlock}
                        excelColumns={excelColumns}
                        storedMessages={storedMessages}
                        isBlastRunning={isBlastRunning}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              <Button
                onClick={handleAddMessageBlock}
                variant="outline"
                disabled={isBlastRunning}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Pesan
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Anda dapat menambahkan beberapa pesan yang akan dikirim secara
                berurutan ke setiap penerima. Gunakan opsi &quot;Pilih
                acak&quot; jika Anda ingin mengirim salah satu dari daftar pesan
                yang berbeda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted">
              <div className="space-y-2">
                <Label htmlFor="min-delay-blast" className="text-foreground">
                  Jeda Minimal Antar Pesan (detik)
                </Label>
                <Input
                  id="min-delay-blast"
                  type="number"
                  value={minDelay}
                  defaultValue={5}
                  onChange={(e) => setMinDelay(Number(e.target.value))}
                  min={0}
                  disabled={isBlastRunning || !isSocketConnected}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-delay-blast" className="text-foreground">
                  Jeda Maksimal Antar Pesan (detik)
                </Label>
                <Input
                  id="max-delay-blast"
                  type="number"
                  value={maxDelay}
                  defaultValue={10}
                  onChange={(e) => setMaxDelay(Number(e.target.value))}
                  min={0}
                  disabled={isBlastRunning || !isSocketConnected}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay-n-recipients" className="text-foreground">
                  Jeda Setelah Setiap N Penerima
                </Label>
                <Input
                  id="delay-n-recipients"
                  type="number"
                  value={delayAfterNRecipients}
                  onChange={(e) =>
                    setDelayAfterNRecipients(Number(e.target.value))
                  }
                  min={0}
                  disabled={isBlastRunning || !isSocketConnected}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="delay-n-recipients-seconds"
                  className="text-foreground"
                >
                  Durasi Jeda (detik)
                </Label>
                <Input
                  id="delay-n-recipients-seconds"
                  type="number"
                  value={delayAfterNRecipientsSeconds}
                  onChange={(e) =>
                    setDelayAfterNRecipientsSeconds(Number(e.target.value))
                  }
                  min={0}
                  disabled={isBlastRunning || !isSocketConnected}
                  className="w-full"
                />
              </div>
              <p className="md:col-span-2 text-sm text-muted-foreground">
                Proses akan menjeda secara acak antara {minDelay}-{maxDelay}{" "}
                detik setelah setiap pesan terkirim ke satu penerima. Tambahan
                jeda {delayAfterNRecipientsSeconds} detik akan diterapkan setiap{" "}
                {delayAfterNRecipients} penerima.
              </p>
            </div>

            <div className="space-y-4 p-4 border rounded-md bg-muted">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-inter-chat"
                  checked={enableWhatsappWarmer}
                  onCheckedChange={(checked) =>
                    setEnableWhatsappWarmer(checked as boolean)
                  }
                  disabled={
                    isBlastRunning ||
                    !isSocketConnected ||
                    selectedSenderAccountIds.length < 2
                  }
                />
                <Label htmlFor="enable-inter-chat" className="text-foreground">
                  Aktifkan Obrolan Antar Akun Pengirim (Setelah N Pesan
                  Terkirim)
                </Label>
              </div>
              {enableWhatsappWarmer && selectedSenderAccountIds.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-min-messages"
                      className="text-foreground"
                    >
                      Min Pesan Terkirim Sebelum Obrolan
                    </Label>
                    <Input
                      id="inter-chat-min-messages"
                      type="number"
                      value={whatsappWarmerMinMessages}
                      onChange={(e) =>
                        setWhatsappWarmerMinMessages(Number(e.target.value))
                      }
                      min={1}
                      disabled={isBlastRunning || !isSocketConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-max-messages"
                      className="text-foreground"
                    >
                      Max Pesan Terkirim Sebelum Obrolan
                    </Label>
                    <Input
                      id="inter-chat-max-messages"
                      type="number"
                      value={whatsappWarmerMaxMessages}
                      onChange={(e) =>
                        setWhatsappWarmerMaxMessages(Number(e.target.value))
                      }
                      min={1}
                      disabled={isBlastRunning || !isSocketConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-delay-seconds"
                      className="text-foreground"
                    >
                      Durasi Obrolan (detik)
                    </Label>
                    <Input
                      id="inter-chat-delay-seconds"
                      type="number"
                      value={whatsappWarmerDelayMs}
                      defaultValue={120}
                      onChange={(e) =>
                        setWhatsappWarmerDelayMs(Number(e.target.value))
                      }
                      min={0}
                      disabled={isBlastRunning || !isSocketConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-min-delay-ms"
                      className="text-foreground"
                    >
                      Jeda Minimal Antar Pesan (Detik)
                    </Label>
                    <Input
                      id="inter-chat-min-delay-ms"
                      type="number"
                      value={whatsappWarmerMinDelayMs}
                      onChange={(e) =>
                        setWhatsappWarmerMinDelayMs(Number(e.target.value))
                      }
                      min={1}
                      disabled={isBlastRunning || !isSocketConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-max-delay-ms"
                      className="text-foreground"
                    >
                      Jeda Maksimal Antar Pesan (Detik)
                    </Label>
                    <Input
                      id="inter-chat-max-delay-ms"
                      type="number"
                      value={whatsappWarmerMaxDelayMs}
                      onChange={(e) =>
                        setWhatsappWarmerMaxDelayMs(Number(e.target.value))
                      }
                      min={1}
                      disabled={isBlastRunning || !isSocketConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inter-chat-language"
                      className="text-foreground"
                    >
                      Bahasa Obrolan
                    </Label>
                    <Select
                      value={whatsappWarmerLanguage}
                      defaultValue="en"
                      onValueChange={(value: "en" | "id") =>
                        setWhatsappWarmerLanguage(value)
                      }
                      disabled={isBlastRunning || !isSocketConnected}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Bahasa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bahasa">Bahasa Indonesia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warmer-job-id" className="text-foreground">
                      Hubungkan WAWarmer
                    </Label>
                    <Select
                      value={warmerJobId}
                      onValueChange={(value: string) => setWarmerJobId(value)}
                      disabled={isBlastRunning || !isSocketConnected}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih WaWarmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(waWarmerJobs).map((job, idx) => {
                          return (
                            <SelectItem
                              key={idx}
                              value={job.jobId}
                              className=""
                            >
                              {job.jobId.substring(0, 25)}... (
                              {job.currentMessages}/{job.totalMessages})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="md:col-span-3 text-sm text-muted-foreground">
                    Setelah setiap antara {whatsappWarmerMinMessages} hingga{" "}
                    {whatsappWarmerMaxMessages} pesan terkirim ke penerima, dua
                    akun pengirim yang dipilih akan saling mengobrol selama
                    sekitar {whatsappWarmerDelayMs} detik menggunakan bahasa
                    yang dipilih. Ini membantu menjaga reputasi akun.
                  </p>
                </div>
              )}
              {enableWhatsappWarmer && selectedSenderAccountIds.length < 2 && (
                <p className="text-sm text-destructive">
                  Pilih setidaknya dua akun pengirim untuk mengaktifkan obrolan
                  antar akun.
                </p>
              )}
            </div>
          </>
        ) : null}

        {/* Tombol Kontrol WA Blast */}
        <div className="flex gap-2 w-full">
          {currentJob &&
          (currentJob.status === "IN_PROGRESS" ||
            currentJob.status === "PAUSED") ? (
            currentJob.status === "IN_PROGRESS" ? (
              <Button
                variant="secondary"
                onClick={() => handlePauseResumeStop("pause")}
                className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                disabled={!isSocketConnected || !currentSelectedWABlastJobId}
              >
                <Pause className="mr-2 h-4 w-4" /> Jeda Blast (
                {currentJob.currentRecipients}/{currentJob.totalRecipients})
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => handlePauseResumeStop("resume")}
                className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                disabled={!isSocketConnected || !currentSelectedWABlastJobId}
              >
                <Play className="mr-2 h-4 w-4" /> Lanjutkan Blast (
                {currentJob.currentRecipients}/{currentJob.totalRecipients})
              </Button>
            )
          ) : (
            <Button
              onClick={handleStartBlast}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={
                !isSocketConnected ||
                selectedSenderAccountIds.length === 0 ||
                (enableWhatsappWarmer && selectedSenderAccountIds.length < 2) ||
                !uploadedExcelData ||
                !selectedPhoneNumberColumn ||
                messageBlocks.length === 0 ||
                messageBlocks.some((block) => {
                  if (block.type === "text") {
                    if (block.randomize) {
                      const selectedRandomMessages = (
                        block.randomMessageOptions || []
                      ).filter(
                        (opt) => opt.selected && opt.content.trim() !== ""
                      );
                      return selectedRandomMessages.length === 0;
                    } else {
                      return !block.textMessage?.trim();
                    }
                  }
                  return !block.mediaData;
                })
              }
            >
              <MessageCircleMore className="mr-2 h-4 w-4" /> Mulai WA Blast
            </Button>
          )}

          {currentJob &&
            (currentJob.status === "IN_PROGRESS" ||
              currentJob.status === "PAUSED" ||
              currentJob.status === "FAILED") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handlePauseResumeStop("stop")}
                    variant="destructive"
                    className="w-auto"
                    disabled={
                      !isSocketConnected || !currentSelectedWABlastJobId
                    }
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hentikan dan Hapus Blast</p>
                </TooltipContent>
              </Tooltip>
            )}
        </div>

        {currentJob && (
          <Alert variant="default">
            <Terminal />
            <AlertTitle>Status Pekerjaan</AlertTitle>
            <AlertDescription>{currentJob.message}</AlertDescription>
          </Alert>
        )}

        {/* Komponen Tabel Log Pesan Terkirim */}
        {currentJob &&
          currentJob.messages &&
          currentJob.messages.length > 0 && (
            <WABlastMessagesTable
              data={currentJob.messages} // Tampilkan log dari pekerjaan yang dipilih
              excelColumns={excelColumns} // Teruskan excelColumns ke tabel log
            />
          )}
      </CardContent>
    </Card>
  );
};

export default WABlastSection;
