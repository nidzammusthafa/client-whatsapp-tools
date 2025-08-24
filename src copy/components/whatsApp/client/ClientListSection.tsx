"use state";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ClientStatusItem from "./ClientStatusItem";
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
import { Button } from "@/components/ui/button";
import { ListPlus, Play, PlusCircle, PowerOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LoginSection from "./LoginSection";
import { useWhatsAppStore } from "@/stores/whatsapp";
import WhitelistManager from "./WhiteListManager";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ClientListSection: React.FC = () => {
  const {
    clients,
    loginClient,
    logoutClient,
    renameClient,
    setClientAsMain,
    deleteClient,
    disconnectClient,
    disconnectAllClients,
    initializeMultipleClients,
  } = useWhatsAppStore();

  const [showRunInactiveDialog, setShowRunInactiveDialog] = useState(false);
  const [headlessModeForInactive, setHeadlessModeForInactive] =
    useState("true"); // Default headless
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleDisconnectAllClients = () => {
    disconnectAllClients();
  };
  useEffect(() => {
    setIsLoginDialogOpen(false);
  }, [clients]);

  const handleRunInactiveClients = () => {
    const inactiveClientIds = clients
      .filter(
        (c) =>
          c.status === "disconnected" ||
          c.status === "auth_failure" ||
          c.status === "error"
      )
      .map((c) => c.accountId);

    if (inactiveClientIds.length === 0) {
      toast.info("Tidak ada klien yang tidak aktif untuk dijalankan.");
      setShowRunInactiveDialog(false);
      return;
    }

    initializeMultipleClients(
      inactiveClientIds,
      headlessModeForInactive === "true"
    );
    setShowRunInactiveDialog(false);
  };

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardContent className="px-6">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <AlertDialog
            open={isLoginDialogOpen}
            onOpenChange={setIsLoginDialogOpen}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    className="flex-grow sm:flex-grow-0"
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tambah Akun</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tambah Sesi WhatsApp Baru</AlertDialogTitle>
                <AlertDialogDescription>
                  Masukkan ID unik untuk sesi baru Anda. Gunakan hanya huruf dan
                  angka tanpa spasi (contoh: &apos;akun-bisnis &apos;,
                  &apos;wa-pribadi-2 &apos;).
                </AlertDialogDescription>
                {/* Close Button */}
                <AlertDialogCancel
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={() => setIsLoginDialogOpen(false)}
                >
                  X<span className="sr-only">Close</span>
                </AlertDialogCancel>
              </AlertDialogHeader>
              <LoginSection />
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="flex-grow sm:flex-grow-0"
                    variant="outline"
                  >
                    <ListPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manajemen Whitelist</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manajemen Whitelist</DialogTitle>
                <DialogDescription>
                  Kelola daftar nomor yang tidak akan memicu notifikasi pesan ke
                  akun utama.
                </DialogDescription>
              </DialogHeader>
              <WhitelistManager />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-grow sm:flex-grow-0"
                    disabled={
                      clients.filter((c) => c.status !== "disconnected")
                        .length === 0
                    } // Nonaktif jika tidak ada klien aktif
                  >
                    <PowerOff className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hentikan Semua</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Konfirmasi Hentikan Semua Klien
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin memutuskan semua koneksi klien
                  WhatsApp yang aktif? Ini akan menutup browser mereka tetapi
                  data sesi akan tetap tersimpan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnectAllClients}>
                  Hentikan Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Tombol Jalankan Klien (yang belum aktif) */}
          <Dialog
            open={showRunInactiveDialog}
            onOpenChange={setShowRunInactiveDialog}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-grow sm:flex-grow-0"
                    disabled={
                      clients.filter(
                        (c) =>
                          c.status === "disconnected" ||
                          c.status === "auth_failure" ||
                          c.status === "error"
                      ).length === 0
                    }
                    onClick={() => setShowRunInactiveDialog(true)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Jalankan semua klien yang tidak aktif</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Jalankan Klien Tidak Aktif</DialogTitle>
                <DialogDescription>
                  Pilih mode browser untuk klien yang akan dijalankan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <RadioGroup
                  defaultValue="true"
                  onValueChange={setHeadlessModeForInactive}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="r1" />
                    <Label htmlFor="r1">Headless (Tersembunyi)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="r2" />
                    <Label htmlFor="r2">Non-Headless (Terlihat)</Label>
                  </div>
                </RadioGroup>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRunInactiveDialog(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleRunInactiveClients}>Jalankan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <p className="text-muted-foreground text-base text-center">
            {" "}
            {/* Menggunakan text-muted-foreground */}
            Belum ada klien WhatsApp yang aktif. Silakan login di atas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <ClientStatusItem
                key={client.accountId}
                client={client}
                onRunClient={loginClient}
                onLogout={logoutClient}
                onRenameClient={renameClient}
                onDeleteClient={deleteClient}
                onDisconnectClient={disconnectClient}
                onSetAsMain={setClientAsMain}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientListSection;
