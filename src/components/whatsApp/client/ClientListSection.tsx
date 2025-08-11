"use state";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  BellOff,
  ListPlus,
  Play,
  PlusCircle,
  PowerOff,
  RefreshCcw,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoginSection from "./LoginSection";
import { useWhatsAppStore } from "@/stores/whatsapp";
import WhitelistManager from "./WhiteListManager";
import { reconnectWhatsappSocket } from "@/lib/whatsappSocket";
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
    notificationSenderAccountId, // Ambil state dari store
    setNotificationSenderAccountId,
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

  // Filter klien yang aktif dan siap untuk menjadi pengirim notifikasi
  // Klien utama tidak boleh menjadi pengirim notifikasi karena dia adalah penerima
  const availableNotificationSenders = clients.filter(
    (c) =>
      (c.status === "ready" || c.status === "authenticated") && !c.isMainClient
  );

  const handleSetNotificationSender = (accountId: string) => {
    setNotificationSenderAccountId(accountId);
  };

  const handleResetNotificationSender = () => {
    setNotificationSenderAccountId(null);
    toast.info("Akun pengirim notifikasi telah direset.");
  };

  return (
    <Card className="w-full mx-auto rounded-lg shadow-xl border">
      <CardHeader className="p-4 rounded-t-lg text-center">
        <CardTitle className="text-xl font-bold text-foreground">
          Status Klien WhatsApp Aktif
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Daftar klien WhatsApp yang terhubung atau sedang dalam proses.
        </CardDescription>
      </CardHeader>
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex-grow sm:flex-grow-0"
                onClick={() => reconnectWhatsappSocket()} // Refresh halaman untuk memicu koneksi ulang socket
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Koneksi Socket</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-2 mb-4 p-4 border rounded-md bg-muted">
          <Label
            htmlFor="notification-sender-select"
            className="text-foreground"
          >
            Akun Pengirim Notifikasi (Opsional)
          </Label>
          <Select
            value={notificationSenderAccountId || ""} // Gunakan string kosong jika null
            onValueChange={handleSetNotificationSender}
            disabled={
              !clients.some(
                (c) => c.status === "ready" || c.status === "authenticated"
              )
            } // Nonaktif jika tidak ada klien aktif
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih akun pengirim notifikasi..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kosong" disabled={true}>
                Pilih Akun... (Kosongkan untuk default)
              </SelectItem>
              {availableNotificationSenders.length === 0 ? (
                <p className="p-2 text-muted-foreground">
                  Tidak ada klien aktif yang tersedia (kecuali klien utama).
                </p>
              ) : (
                availableNotificationSenders.map((client) => (
                  <SelectItem key={client.accountId} value={client.accountId}>
                    {client.accountId} ({client.phoneNumber || "N/A"})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {notificationSenderAccountId && (
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetNotificationSender}
              >
                <BellOff className="mr-2 h-4 w-4" /> Reset Pengirim Notifikasi
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Pilih akun khusus yang akan mengirim semua notifikasi pesan masuk ke
            akun utama Anda. Jika tidak dipilih, notifikasi akan dikirim oleh
            akun yang menerima pesan.
          </p>
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
                isNotificationSender={
                  notificationSenderAccountId === client.accountId
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientListSection;
