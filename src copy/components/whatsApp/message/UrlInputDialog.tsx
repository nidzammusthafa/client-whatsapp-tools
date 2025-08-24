import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UrlInputDialogProps {
  isOpen: boolean;
  onClose: () => void; // Dipanggil saat dialog ditutup (cancel atau klik di luar)
  onConfirm: (url: string | null) => void; // Dipanggil saat user konfirmasi (url atau null jika batal)
  initialUrl?: string; // URL awal jika ada
  selectedText?: string; // Teks yang dipilih, untuk ditampilkan di deskripsi
}

/**
 * Komponen dialog untuk meminta input URL dari pengguna.
 * Menggantikan fungsi prompt() browser yang kurang fleksibel.
 */
const UrlInputDialog: React.FC<UrlInputDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialUrl = "",
  selectedText = "",
}) => {
  const [url, setUrl] = useState<string>(initialUrl);

  // Reset URL saat dialog dibuka atau initialUrl berubah
  useEffect(() => {
    setUrl(initialUrl);
  }, [isOpen, initialUrl]);

  const handleConfirm = () => {
    onConfirm(url.trim() === "" ? null : url.trim()); // Kirim null jika URL kosong
    onClose();
  };

  const handleCancel = () => {
    onConfirm(null); // Kirim null jika dibatalkan
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Masukkan URL Tautan</DialogTitle>
          <DialogDescription>
            {selectedText ? (
              <>
                Tautan akan diterapkan pada teks: &quot;
                <strong>{selectedText}</strong>&quot;. Masukkan URL lengkap di
                bawah ini.
              </>
            ) : (
              <>Masukkan URL lengkap untuk tautan.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Sisipkan Tautan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UrlInputDialog;
