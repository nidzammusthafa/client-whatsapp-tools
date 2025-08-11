import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switchs";
import { useWhatsAppStore } from "@/stores/whatsapp";

const LoginSection: React.FC = () => {
  const {
    newClientAccountId,
    setNewClientAccountId,
    isHeadlessMode,
    setIsHeadlessMode,
    loginClient,
    isSocketConnected,
  } = useWhatsAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientAccountId.trim()) {
      toast.error("ID Akun wajib diisi.");
      return;
    }
    const invalidCharsRegex = /[^a-zA-Z0-9-_]/g;
    if (invalidCharsRegex.test(newClientAccountId)) {
      toast.error(
        "ID Akun hanya boleh mengandung huruf, angka, hyphen (-), dan underscore (_)."
      );
      return;
    }

    loginClient(newClientAccountId, isHeadlessMode);
  };

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="p-6">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="accountId"
              className="text-foreground" // Menggunakan text-foreground
            >
              ID Akun
            </Label>
            <Input
              id="accountId"
              type="text"
              value={newClientAccountId}
              onChange={(e) => setNewClientAccountId(e.target.value)}
              placeholder="misal: my-whatsapp-account-1"
              className="w-full rounded-md border bg-background text-foreground focus:ring-ring focus:border-primary" // Menggunakan warna default Shadcn
            />
          </div>

          {/* Kontrol untuk mode Headless */}
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-md bg-muted">
            {" "}
            {/* Menggunakan bg-muted */}
            <Label
              htmlFor="headless-mode"
              className="text-foreground cursor-pointer text-sm" // Menggunakan text-foreground
            >
              Jalankan Browser Puppeteer dalam Mode Headless (Tersembunyi)
            </Label>
            <Switch
              id="headless-mode"
              checked={isHeadlessMode}
              onCheckedChange={setIsHeadlessMode}
              // Menghapus kelas warna kustom untuk menggunakan warna default Shadcn
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
            {" "}
            {/* Menggunakan text-muted-foreground */}
            {isHeadlessMode
              ? "Browser akan berjalan di latar belakang (tidak terlihat)."
              : "Browser akan muncul di jendela terpisah (terlihat)."}
          </p>

          <Button
            type="submit"
            className="w-full font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            disabled={!isSocketConnected || !newClientAccountId.trim()}
          >
            Login dengan QR Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginSection;
