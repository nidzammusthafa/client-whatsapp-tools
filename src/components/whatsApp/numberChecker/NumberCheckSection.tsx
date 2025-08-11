import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pause,
  Play,
  StopCircle,
  Trash2,
  RefreshCcw,
  PlusCircle,
} from "lucide-react"; // Import ikon baru
import { UploadZone } from "@/components/UploadZone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "./data-table"; // Impor komponen DataTable
import { toast } from "sonner";
import { ExcelRow } from "@/types";
import { useWhatsAppStore } from "@/stores/whatsapp";
import { v4 as uuidv4 } from "uuid"; // Untuk menghasilkan ID unik

// Deklarasi global untuk library XLSX yang dimuat dari CDN
declare const XLSX: typeof import("xlsx");

const NumberCheckSection: React.FC = () => {
  const {
    clients,
    uploadedExcelData,
    setOriginalData,
    excelColumns,
    setExcelColumns,
    selectedPhoneNumberColumn,
    setSelectedPhoneNumberColumn,
    minDelay,
    setMinDelay,
    maxDelay,
    setMaxDelay,
    delayAfterNNumbers,
    setDelayAfterNNumbers,
    numberCheckResults,
    numberCheckJobStatus,
    startNumberCheck,
    pauseNumberChecking,
    resumeNumberChecking,
    stopNumberChecking,
    isSocketConnected,
    availableNumberCheckJobs, // Daftar pekerjaan dari server
    loadAvailableNumberCheckJobs, // Action untuk memuat pekerjaan
    currentNumberCheckJobId, // Job ID yang sedang aktif di store
    generateNewNumberCheckJobId, // Action untuk generate ID baru
    setNumberCheckJobStatus, // Untuk mengatur status job saat memuat
  } = useWhatsAppStore();

  // State lokal untuk input Job ID yang diisi user
  const [jobIdInput, setJobIdInput] = useState<string>(currentNumberCheckJobId);
  // State lokal untuk job ID yang dipilih dari dropdown
  const [selectedJobIdFromDropdown, setSelectedJobIdFromDropdown] =
    useState<string>("");

  // Efek untuk memuat pustaka XLSX saat komponen di-mount
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

  // Efek untuk memuat daftar pekerjaan saat socket terhubung
  useEffect(() => {
    if (isSocketConnected) {
      loadAvailableNumberCheckJobs();
    }
  }, [isSocketConnected, loadAvailableNumberCheckJobs]);

  // Efek untuk menyinkronkan jobIdInput dengan currentNumberCheckJobId dari store
  // Ini penting agar input menampilkan ID job yang sedang aktif (baik baru digenerate atau dimuat)
  useEffect(() => {
    setJobIdInput(currentNumberCheckJobId);
    // Reset dropdown pilihan saat job ID aktif berubah (misal, job baru dimulai)
    setSelectedJobIdFromDropdown("");
  }, [currentNumberCheckJobId]);

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
          setSelectedPhoneNumberColumn(""); // Reset pilihan kolom
          toast.success(
            `File Excel '${file.name}' berhasil diunggah. Pilih kolom nomor telepon.`
          );
        } catch (error) {
          console.error("Error reading Excel file:", error);
          toast.error("Gagal membaca file Excel. Pastikan formatnya benar.");
          setOriginalData(null);
          setExcelColumns([]);
          setSelectedPhoneNumberColumn("");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [setOriginalData, setExcelColumns, setSelectedPhoneNumberColumn]
  );

  const handleStartCheckNumbers = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobIdInput.trim()) {
      toast.error("ID Pekerjaan tidak boleh kosong.");
      return;
    }

    if (!uploadedExcelData || !selectedPhoneNumberColumn) {
      toast.error("Mohon unggah file Excel dan pilih kolom nomor telepon.");
      return;
    }

    const numbersInColumn = uploadedExcelData
      .map((row) => String(row[selectedPhoneNumberColumn]).trim())
      .filter((num) => num.length > 0);

    if (numbersInColumn.length === 0) {
      toast.error(
        "Tidak ada nomor telepon yang ditemukan di kolom yang dipilih."
      );
      return;
    }

    if (minDelay > maxDelay) {
      toast.error("Jeda minimal tidak boleh lebih besar dari jeda maksimal.");
      return;
    }
    if (minDelay < 0 || maxDelay < 0 || delayAfterNNumbers < 0) {
      toast.error("Nilai jeda tidak boleh negatif.");
      return;
    }

    const mainClient = clients.find(
      (c) =>
        c.isMainClient && (c.status === "ready" || c.status === "authenticated")
    );

    if (!mainClient) {
      toast.error(
        "Tidak ada klien utama yang aktif/siap untuk memulai pengecekan nomor. Mohon atur klien utama yang aktif."
      );
      return;
    }

    const availableClientIds = clients
      .filter((c) => c.status === "ready" || c.status === "authenticated")
      .map((c) => c.accountId);

    if (availableClientIds.length === 0) {
      toast.error(
        "Tidak ada klien WhatsApp yang aktif/siap untuk melakukan pengecekan nomor."
      );
      return;
    }

    const delayConfig = {
      minDelayMs: minDelay * 1000,
      maxDelayMs: maxDelay * 1000,
      delayAfterNNumbers: delayAfterNNumbers,
    };

    // Gunakan jobIdInput sebagai jobId untuk memulai pekerjaan
    startNumberCheck(
      jobIdInput, // Gunakan Job ID dari input
      mainClient.accountId,
      uploadedExcelData,
      selectedPhoneNumberColumn,
      delayConfig,
      availableClientIds
    );
  };

  const handlePauseResumeStopCheck = (action: "pause" | "resume" | "stop") => {
    const jobIdToControl = numberCheckJobStatus?.jobId || jobIdInput; // Prioritaskan status job, fallback ke input
    if (!jobIdToControl) {
      toast.error(
        "Tidak ada pekerjaan pengecekan nomor yang sedang berjalan atau dijeda."
      );
      return;
    }

    if (action === "pause") {
      pauseNumberChecking(jobIdToControl);
    } else if (action === "resume") {
      resumeNumberChecking(jobIdToControl);
    } else if (action === "stop") {
      stopNumberChecking(jobIdToControl); // Ini akan memicu penghapusan dari DB dan update frontend
    }
  };

  const handleLoadJob = () => {
    const jobToLoad = availableNumberCheckJobs.find(
      (job) => job.jobId === selectedJobIdFromDropdown
    );
    if (jobToLoad) {
      // Set status job di frontend
      setNumberCheckJobStatus({
        jobId: jobToLoad.jobId,
        current: jobToLoad.current,
        total: jobToLoad.total,
        status: jobToLoad.status,
        message: `Pekerjaan dimuat: ${jobToLoad.status}`,
      });
      // Set currentNumberCheckJobId di store agar UI sinkron
      useWhatsAppStore.setState({
        currentNumberCheckJobId: jobToLoad.jobId,
        uploadedExcelData: null, // Data Excel tidak disimpan di NumberCheckProgressUpdate, jadi reset
        excelColumns: [],
        selectedPhoneNumberColumn: "",
        minDelay: 2, // Reset ke default atau muat dari jobToLoad jika ada di sana
        maxDelay: 4,
        delayAfterNNumbers: 10,
        numberCheckResults: [], // Hasil akan diisi ulang dari backend jika diperlukan, atau dimulai dari kosong
      });
      toast.success(`Pekerjaan '${jobToLoad.jobId}' berhasil dimuat.`);
    } else {
      toast.error("Pekerjaan tidak ditemukan.");
    }
  };

  const handleDeleteJob = () => {
    if (!selectedJobIdFromDropdown) {
      toast.error("Pilih pekerjaan yang ingin dihapus.");
      return;
    }
    // Konfirmasi penghapusan (opsional, bisa diganti dengan dialog kustom)
    if (
      window.confirm(
        `Anda yakin ingin menghapus pekerjaan '${selectedJobIdFromDropdown}'?`
      )
    ) {
      // Panggil stopNumberChecking, yang di backend akan menghapus dari DB dan emit event 'job-removed'
      stopNumberChecking(selectedJobIdFromDropdown);
      // UI akan diupdate melalui listener 'whatsapp-number-check-job-removed' di slice
      toast.success(
        `Permintaan penghapusan pekerjaan '${selectedJobIdFromDropdown}' dikirim.`
      );
      setSelectedJobIdFromDropdown(""); // Reset pilihan
      // generateNewNumberCheckJobId(); // Ini akan dipicu oleh listener 'job-removed' jika job aktif dihapus
    }
  };

  const isCheckingNumbers =
    numberCheckJobStatus?.status === "running" ||
    numberCheckJobStatus?.status === "paused";

  const hasActiveMainClient = clients.some(
    (c) =>
      c.isMainClient && (c.status === "ready" || c.status === "authenticated")
  );

  return (
    <Card className="w-full max-w-[75vw] mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-4">
        {!hasActiveMainClient && (
          <p className="text-sm text-destructive">
            Tidak ada klien utama yang aktif/siap. Mohon login klien dan atur
            salah satu sebagai klien utama.
          </p>
        )}

        {/* Pemilihan Job ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job-id-input">ID Pekerjaan Baru / Aktif</Label>
            <Input
              id="job-id-input"
              type="text"
              value={jobIdInput}
              onChange={(e) => setJobIdInput(e.target.value)}
              placeholder="Masukkan ID pekerjaan unik"
              disabled={isCheckingNumbers}
            />
            <Button
              onClick={() => {
                const newId = uuidv4();
                setJobIdInput(newId);
                generateNewNumberCheckJobId(); // Update store dengan ID baru
                toast.info(`ID Pekerjaan baru dibuat: ${newId}`);
              }}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isCheckingNumbers}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Generate ID Baru
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="load-job-select">Muat Pekerjaan Tersimpan</Label>
            <div className="flex gap-2">
              <Select
                onValueChange={setSelectedJobIdFromDropdown}
                value={selectedJobIdFromDropdown}
                disabled={
                  isCheckingNumbers || availableNumberCheckJobs.length === 0
                }
              >
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Pilih pekerjaan..." />
                </SelectTrigger>
                <SelectContent>
                  {availableNumberCheckJobs.map((job) => (
                    <SelectItem key={job.jobId} value={job.jobId}>
                      {job.jobId} ({job.status}) - {job.current}/{job.total}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleLoadJob}
                disabled={!selectedJobIdFromDropdown || isCheckingNumbers}
                variant="outline"
                size="icon"
                title="Muat Pekerjaan"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDeleteJob}
                disabled={!selectedJobIdFromDropdown || isCheckingNumbers}
                variant="destructive"
                size="icon"
                title="Hapus Pekerjaan"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {uploadedExcelData && excelColumns.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="column-select" className="text-foreground">
              Pilih Kolom Nomor Telepon
            </Label>
            <Select
              onValueChange={setSelectedPhoneNumberColumn}
              value={selectedPhoneNumberColumn}
              disabled={isCheckingNumbers}
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
        ) : (
          <UploadZone
            onFilesSelected={handleFileUpload}
            accept=".xlsx,.xls"
            label="Seret atau klik untuk mengunggah file Excel (.xlsx, .xls)"
            disabled={isCheckingNumbers}
          />
        )}

        {/* Konfigurasi Jeda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted">
          <div className="space-y-2">
            <Label htmlFor="min-delay" className="text-foreground">
              Jeda Minimal (detik)
            </Label>
            <Input
              id="min-delay"
              type="number"
              value={minDelay}
              onChange={(e) => setMinDelay(Number(e.target.value))}
              min={0}
              disabled={isCheckingNumbers}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-delay" className="text-foreground">
              Jeda Maksimal (detik)
            </Label>
            <Input
              id="max-delay"
              type="number"
              value={maxDelay}
              onChange={(e) => setMaxDelay(Number(e.target.value))}
              min={0}
              disabled={isCheckingNumbers}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay-after-n" className="text-foreground">
              Jeda Setelah N Nomor
            </Label>
            <Input
              id="delay-after-n"
              type="number"
              value={delayAfterNNumbers}
              onChange={(e) => setDelayAfterNNumbers(Number(e.target.value))}
              min={1}
              disabled={isCheckingNumbers}
              className="w-full"
            />
          </div>
          <p className="md:col-span-3 text-sm text-muted-foreground">
            Proses akan menjeda secara acak antara {minDelay}-{maxDelay} detik
            setelah memeriksa setiap {delayAfterNNumbers} nomor.
          </p>
        </div>

        {/* Tombol Kontrol Pengecekan Nomor */}
        <div className="flex gap-2 w-full">
          {numberCheckJobStatus?.status === "running" ? (
            <Button
              variant="secondary"
              onClick={() => handlePauseResumeStopCheck("pause")}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !numberCheckJobStatus?.jobId}
            >
              <Pause className="mr-2 h-4 w-4" /> Jeda Pengecekan (
              {numberCheckJobStatus.current}/{numberCheckJobStatus.total})
            </Button>
          ) : numberCheckJobStatus?.status === "paused" ? (
            <Button
              variant="default"
              onClick={() => handlePauseResumeStopCheck("resume")}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !numberCheckJobStatus?.jobId}
            >
              <Play className="mr-2 h-4 w-4" /> Lanjutkan Pengecekan (
              {numberCheckJobStatus.current}/{numberCheckJobStatus.total})
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleStartCheckNumbers}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={
                !isSocketConnected ||
                !uploadedExcelData ||
                !selectedPhoneNumberColumn ||
                !hasActiveMainClient ||
                isCheckingNumbers // Disable jika ada job lain sedang berjalan
              }
            >
              {"Mulai Pengecekan Nomor dari Excel"}
            </Button>
          )}
          {(numberCheckJobStatus?.status === "running" ||
            numberCheckJobStatus?.status === "paused" ||
            numberCheckJobStatus?.status === "error") && (
            <Button
              onClick={() => handlePauseResumeStopCheck("stop")}
              variant="destructive"
              className="w-auto"
              disabled={!isSocketConnected || !numberCheckJobStatus?.jobId}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {numberCheckJobStatus && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Status Pekerjaan: {numberCheckJobStatus.message}
          </p>
        )}

        {numberCheckResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Hasil Pengecekan:
            </h3>
            <DataTable data={numberCheckResults} excelColumns={excelColumns} />
            <p className="text-sm text-muted-foreground mt-2">
              Catatan: &quot;Aktif&quot; berarti nomor terdaftar di WhatsApp.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NumberCheckSection;
