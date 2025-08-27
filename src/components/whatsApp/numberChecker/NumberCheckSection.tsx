import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Pause, Play, StopCircle } from "lucide-react";
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
import { JobIdManagement } from "./JobIdManagement";
import { DelayConfiguration } from "./DelayConfiguration";
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
    maxDelay,
    delayAfterNNumbers,
    numberCheckResults,
    numberCheckJobStatus,
    startNumberCheck,
    pauseNumberChecking,
    resumeNumberChecking,
    stopNumberChecking,
    isSocketConnected,
    loadAvailableNumberCheckJobs,
    currentNumberCheckJobId,
  } = useWhatsAppStore();

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

    if (!currentNumberCheckJobId.trim()) {
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

    startNumberCheck(
      currentNumberCheckJobId,
      mainClient.accountId,
      uploadedExcelData,
      selectedPhoneNumberColumn,
      delayConfig,
      availableClientIds
    );
  };

  const handlePauseResumeStopCheck = (action: "pause" | "resume" | "stop") => {
    const jobIdToControl =
      numberCheckJobStatus?.jobId || currentNumberCheckJobId;
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
      stopNumberChecking(jobIdToControl);
    }
  };

  const isCheckingNumbers =
    numberCheckJobStatus?.status === "RUNNING" ||
    numberCheckJobStatus?.status === "PAUSED";

  const hasActiveMainClient = clients.some(
    (c) =>
      c.isMainClient && (c.status === "ready" || c.status === "authenticated")
  );

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

  // Efek untuk menambahkan event listener sebelum meninggalkan halaman
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isCheckingNumbers) {
        const confirmationMessage =
          "Pekerjaan sedang berjalan. Yakin ingin keluar? Progress akan hilang!";
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isCheckingNumbers]);

  return (
    <Card className="w-full max-w-screen mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-4">
        {!hasActiveMainClient && (
          <p className="text-sm text-destructive">
            Tidak ada klien utama yang aktif/siap. Mohon login klien dan atur
            salah satu sebagai klien utama.
          </p>
        )}

        <JobIdManagement isCheckingNumbers={isCheckingNumbers} />

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

        <DelayConfiguration isCheckingNumbers={isCheckingNumbers} />

        <div className="flex gap-2 w-full">
          {numberCheckJobStatus?.status === "RUNNING" ? (
            <Button
              variant="secondary"
              onClick={() => handlePauseResumeStopCheck("pause")}
              className="flex-grow font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={!isSocketConnected || !numberCheckJobStatus?.jobId}
            >
              <Pause className="mr-2 h-4 w-4" /> Jeda Pengecekan (
              {numberCheckJobStatus.current}/{numberCheckJobStatus.total})
            </Button>
          ) : numberCheckJobStatus?.status === "PAUSED" ? (
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
                isCheckingNumbers
              }
            >
              {"Mulai Pengecekan Nomor dari Excel"}
            </Button>
          )}
          {(numberCheckJobStatus?.status === "RUNNING" ||
            numberCheckJobStatus?.status === "PAUSED" ||
            numberCheckJobStatus?.status === "ERROR") && (
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
