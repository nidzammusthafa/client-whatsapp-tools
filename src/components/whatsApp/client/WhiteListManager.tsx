import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ListRestart } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWhatsAppStore } from "@/stores/whatsapp";

const WhitelistManager: React.FC = () => {
  const {
    whitelistNumbers,
    addWhitelistNumbers,
    removeWhitelistNumber,
    resetWhitelistNumbers,
    isSocketConnected,
  } = useWhatsAppStore();

  const [newNumbersInput, setNewNumbersInput] = useState<string>("");

  const handleAddNumbers = useCallback(() => {
    if (!newNumbersInput.trim()) {
      toast.warning("Mohon masukkan nomor telepon.");
      return;
    }

    // Pisahkan nomor berdasarkan spasi atau baris baru, lalu bersihkan dan filter yang kosong
    const numbersToAdd = newNumbersInput
      .split(/[\s\n]+/)
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    if (numbersToAdd.length === 0) {
      toast.warning("Tidak ada nomor valid yang ditemukan untuk ditambahkan.");
      return;
    }

    addWhitelistNumbers(numbersToAdd);
    setNewNumbersInput(""); // Bersihkan input setelah ditambahkan
  }, [newNumbersInput, addWhitelistNumbers]);

  const handleRemoveNumber = useCallback(
    (numberToRemove: string) => {
      removeWhitelistNumber(numberToRemove);
    },
    [removeWhitelistNumber]
  );

  const handleResetWhitelist = useCallback(() => {
    resetWhitelistNumbers();
  }, [resetWhitelistNumbers]);

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="new-whitelist-numbers"
            className="text-foreground" // Menggunakan text-foreground
          >
            Tambahkan Nomor ke Whitelist (pisahkan dengan spasi atau enter)
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-whitelist-numbers"
              type="text"
              value={newNumbersInput}
              onChange={(e) => setNewNumbersInput(e.target.value)}
              placeholder="Contoh: 628123456789 62876543210"
              className="flex-grow rounded-md border bg-background text-foreground focus:ring-ring focus:border-primary" // Menggunakan warna default Shadcn
              disabled={!isSocketConnected}
            />
            <Button
              onClick={handleAddNumbers}
              disabled={!isSocketConnected || !newNumbersInput.trim()}
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">
            {" "}
            {/* Menggunakan text-foreground */}
            Daftar Nomor Whitelist ({whitelistNumbers.length})
          </Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted">
            {" "}
            {/* Menggunakan bg-muted */}
            {whitelistNumbers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {" "}
                {/* Menggunakan text-muted-foreground */}
                Tidak ada nomor dalam whitelist.
              </p>
            ) : (
              whitelistNumbers.map((number) => (
                <Badge key={number} variant="default" className="pr-1">
                  {number}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 text-muted-foreground hover:text-foreground" // Menggunakan warna default Shadcn
                    onClick={() => handleRemoveNumber(number)}
                    disabled={!isSocketConnected}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20" // Menggunakan warna default Shadcn
                disabled={!isSocketConnected || whitelistNumbers.length === 0}
              >
                <ListRestart className="mr-2 h-4 w-4" /> Reset Whitelist
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Reset Whitelist</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus semua nomor dari daftar
                  whitelist? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetWhitelist}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhitelistManager;
