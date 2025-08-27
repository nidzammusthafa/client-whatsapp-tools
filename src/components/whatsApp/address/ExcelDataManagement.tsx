import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, Save } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { Address } from "@/types/whatsapp/address";
import { Switch } from "@/components/ui/switchs";
import { useUrlStore } from "@/stores/whatsapp/socketStore";

// Deklarasi global untuk library XLSX
declare const XLSX: typeof import("xlsx");

interface ExcelRow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const NEXT_PUBLIC_WHATSAPP_SERVER_URL = `${
  useUrlStore.getState().url
}/api/whatsapp`;
interface ExcelDataManagementProps {
  onDataSubmitted: () => void;
}

/**
 * Komponen untuk mengelola proses upload dan pemetaan data Excel
 * sebelum dikirim ke database.
 */
const ExcelDataManagement: React.FC<ExcelDataManagementProps> = ({
  onDataSubmitted,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[] | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(
    {}
  );
  const [hasReceivedMessage, setHasReceivedMessage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Daftar kolom database yang wajib dan opsional
  const requiredDbColumns = ["name", "address", "phoneNumber"];
  const optionalDbColumns = [
    "rating",
    "reviews",
    "website",
    "email",
    "latitude",
    "longitude",
    "postalCode",
    "city",
    "state",
    "country",
    "url",
    "odp",
    "distance",
    "businessName",
    "businessCategory",
  ];

  useEffect(() => {
    // Memuat library XLSX dari CDN saat komponen dimuat
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileUpload = useCallback((files: File[] | File) => {
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
        const json = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any[][];

        if (json.length < 2) {
          toast.warning("File Excel kosong atau tidak memiliki data.");
          setUploadedFile(null);
          setExcelData(null);
          setExcelColumns([]);
          return;
        }

        const headers = json[0];
        const rows = json.slice(1).map((row) => {
          const obj: ExcelRow = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });

        setUploadedFile(file);
        setExcelData(rows);
        setExcelColumns(headers);
        toast.success(`File Excel '${file.name}' berhasil diunggah.`);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Gagal membaca file Excel. Pastikan formatnya benar.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleMapChange = (dbColumn: string, excelColumn: string) => {
    setColumnMappings((prev) => ({ ...prev, [dbColumn]: excelColumn }));
  };

  const handleSubmit = async () => {
    if (!excelData || excelData.length === 0) {
      toast.error("Tidak ada data untuk diunggah.");
      return;
    }

    const hasIncompleteMapping = requiredDbColumns.some(
      (col) => !columnMappings[col]
    );
    if (hasIncompleteMapping) {
      toast.error(
        "Mohon petakan semua kolom yang wajib (name, address, phoneNumber)."
      );
      return;
    }

    setIsSubmitting(true);
    toast.loading("Mengirim data ke server...", { id: "submit-loading" });

    try {
      const addressesToSubmit: Address[] = excelData.map((row) => {
        const mappedAddress: Partial<Address> = {};
        for (const dbCol in columnMappings) {
          const excelCol = columnMappings[dbCol];
          if (row.hasOwnProperty(excelCol)) {
            mappedAddress[dbCol as keyof Address] = row[excelCol];
          }
        }
        return {
          ...mappedAddress,
          isBusiness: true, // Default to true as per model
          hasReceivedMessage: hasReceivedMessage,
          // Handle specific type conversions if needed
          rating: mappedAddress.rating
            ? parseFloat(String(mappedAddress.rating))
            : null,
          reviews: mappedAddress.reviews
            ? parseInt(String(mappedAddress.reviews))
            : null,
          latitude: mappedAddress.latitude
            ? parseFloat(String(mappedAddress.latitude))
            : null,
          longitude: mappedAddress.longitude
            ? parseFloat(String(mappedAddress.longitude))
            : null,
          // Pastikan properti wajib ada
          name: mappedAddress.name || "",
          address: mappedAddress.address || "",
          phoneNumber: mappedAddress.phoneNumber || "",
        } as Address;
      });

      const response = await fetch(
        `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/address/batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressesToSubmit),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message, { id: "submit-loading" });
        setUploadedFile(null);
        setExcelData(null);
        setExcelColumns([]);
        setColumnMappings({});
        setHasReceivedMessage(false);
        onDataSubmitted();
      } else {
        toast.error(result.message || "Gagal mengirim data.", {
          id: "submit-loading",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Terjadi kesalahan saat mengirim data.", {
        id: "submit-loading",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {!uploadedFile ? (
            <UploadZone
              onFilesSelected={handleFileUpload}
              accept=".xlsx,.xls"
              label="Seret atau klik untuk mengunggah file Excel (.xlsx, .xls)"
              disabled={isSubmitting}
            />
          ) : (
            <div className="flex items-center space-x-2 p-3 border rounded-md bg-green-50/50 dark:bg-green-900/10">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium">
                {uploadedFile.name} berhasil diunggah.
              </p>
              <Button
                onClick={() => {
                  setUploadedFile(null);
                  setExcelData(null);
                  setExcelColumns([]);
                  setColumnMappings({});
                }}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                Ganti File
              </Button>
            </div>
          )}
        </div>

        {excelData && excelData.length > 0 && (
          <>
            {/* Pemetaan Kolom */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                Petakan Kolom Data
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...requiredDbColumns, ...optionalDbColumns].map((dbCol) => (
                  <div key={dbCol} className="space-y-1">
                    <Label htmlFor={`map-${dbCol}`} className="text-sm">
                      {dbCol.charAt(0).toUpperCase() + dbCol.slice(1)}{" "}
                      {requiredDbColumns.includes(dbCol) && "*"}
                    </Label>
                    <Select
                      onValueChange={(value) => handleMapChange(dbCol, value)}
                      value={columnMappings[dbCol] || ""}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Pilih kolom untuk ${dbCol}...`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {excelColumns.map((excelCol) => (
                          <SelectItem key={excelCol} value={excelCol}>
                            {excelCol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Penerimaan Pesan */}
            <div className="space-y-2 p-4 border rounded-md bg-muted">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-received-switch"
                  checked={hasReceivedMessage}
                  onCheckedChange={setHasReceivedMessage}
                  disabled={isSubmitting}
                />
                <Label htmlFor="has-received-switch">
                  Apakah semua nomor dalam file ini telah menerima pesan?
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Aktifkan opsi ini jika data ini berasal dari daftar kontak yang
                sudah pernah dihubungi.
              </p>
            </div>

            {/* Tombol Submit */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || Object.keys(columnMappings).length === 0
                }
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4 animate-bounce" />{" "}
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Kirim Data
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelDataManagement;
