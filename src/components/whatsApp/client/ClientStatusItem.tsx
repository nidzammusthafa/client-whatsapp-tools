import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  Play,
  PowerOff,
  Save,
  X,
  Edit,
  Trash2,
  PauseCircle,
  Star,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "sonner";
import { Switch } from "@/components/ui/switchs";
import { WhatsAppClientStatusUpdate } from "@/types";
import { RatingSlider } from "./RatingSlider";
import { useUrlStore } from "@/stores/whatsapp/socketStore";
import { formatTimeAgo } from "@/lib/utils";

const NEXT_PUBLIC_WHATSAPP_SERVER_URL = `${
  useUrlStore.getState().url
}/api/whatsapp`;

interface ClientStatusItemProps {
  client: WhatsAppClientStatusUpdate;
  onRunClient: (accountId: string, headless: boolean) => void;
  onLogout: (accountId: string) => void;
  onRenameClient: (oldAccountId: string, newAccountId: string) => void;
  onDeleteClient: (accountId: string) => void;
  onDisconnectClient: (accountId: string) => void;
  onSetAsMain: (accountId: string) => void;
}

const ClientStatusItem: React.FC<ClientStatusItemProps> = ({
  client,
  onRunClient,
  onLogout,
  onRenameClient,
  onDeleteClient,
  onDisconnectClient,
  onSetAsMain,
}) => {
  const [isHeadless, setIsHeadless] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newAccountId, setNewAccountId] = useState<string>(client.accountId);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [rating, setRating] = useState(client.rating || undefined);

  const invalidCharsRegex = /[^a-zA-Z0-9-_]/g;

  useEffect(() => {
    const updateRating = async () => {
      try {
        const res = await fetch(
          `${NEXT_PUBLIC_WHATSAPP_SERVER_URL}/client/rating/${client.accountId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating: Number(rating),
            }),
          }
        );
        const data = await res.json();
        toast.success(data.message);
      } catch (error) {
        console.error("Error updating rating:", error);
      }
    };
    const handler = setTimeout(() => {
      if (rating !== client.rating) {
        updateRating();
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [client.accountId, client.rating, rating]);

  const getStatusColorClass = (
    status: WhatsAppClientStatusUpdate["status"]
  ) => {
    switch (status) {
      case "ready":
      case "authenticated":
        return "text-green-500";
      case "qr":
      case "loading":
        return "text-yellow-500";
      case "disconnected":
        return "text-muted-foreground"; // Using Shadcn default color
      case "auth_failure":
      case "error":
        return "text-destructive"; // Using Shadcn default color
      default:
        return "text-muted-foreground"; // Using Shadcn default color
    }
  };

  const getStatusIcon = (status: WhatsAppClientStatusUpdate["status"]) => {
    switch (status) {
      case "ready":
      case "authenticated":
        return <CheckCircle className="h-4 w-4" />;
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "disconnected":
        return <PowerOff className="h-4 w-4" />;
      case "auth_failure":
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const handleRunClient = () => {
    onRunClient(client.accountId, isHeadless);
  };

  const handleLogoutClient = () => {
    onLogout(client.accountId);
  };

  const handleNewAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(invalidCharsRegex, "-");

    setNewAccountId(sanitizedValue);

    if (!sanitizedValue.trim()) {
      setRenameError("Nama klien tidak boleh kosong.");
    } else if (sanitizedValue === client.accountId) {
      setRenameError("Nama baru harus berbeda dari nama lama.");
    } else if (value !== sanitizedValue) {
      setRenameError(
        "Nama hanya boleh mengandung huruf, angka, hyphen (-), dan underscore (_). Spasi dan karakter lain akan diganti dengan hyphen."
      );
    } else {
      setRenameError(null);
    }
  };

  const handleSaveRename = () => {
    if (
      !newAccountId.trim() ||
      newAccountId.trim() === client.accountId ||
      renameError
    ) {
      toast.error("Validasi nama klien gagal. Periksa kembali input Anda.");
      return;
    }
    onRenameClient(client.accountId, newAccountId.trim());
    setIsEditing(false);
    setRenameError(null);
  };

  const handleCancelRename = () => {
    setNewAccountId(client.accountId);
    setIsEditing(false);
    setRenameError(null);
  };

  const handleDeleteClient = () => {
    onDeleteClient(client.accountId);
  };

  const handleDisconnectClient = () => {
    onDisconnectClient(client.accountId);
  };

  const handleSetAsMain = () => {
    onSetAsMain(client.accountId);
  };

  const handleKeyDownOnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSaveRenameDisabled) {
      e.preventDefault();
      handleSaveRename();
    }
  };

  const isClientActive =
    client.status === "ready" || client.status === "authenticated";
  const isClientRunningOrConnecting =
    client.status === "loading" || client.status === "qr";
  const isSaveRenameDisabled =
    !newAccountId.trim() ||
    newAccountId.trim() === client.accountId ||
    !!renameError;

  return (
    <div className="flex flex-col p-3 border rounded-lg shadow-sm bg-card text-card-foreground gap-2">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col w-full gap-2">
              <Input
                value={newAccountId}
                onChange={handleNewAccountIdChange}
                onKeyDown={handleKeyDownOnInput}
                className={`text-lg font-semibold ${
                  renameError ? "border-destructive" : ""
                }`}
                placeholder="Nama klien baru"
              />
              {renameError && (
                <p className="text-destructive text-xs mt-1">{renameError}</p>
              )}
              <div className="flex gap-2">
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" disabled={isSaveRenameDisabled}>
                          <Save className="mr-2 h-4 w-4" /> Simpan
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Simpan Perubahan Nama Klien</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Konfirmasi Penggantian Nama Klien
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Anda akan mengganti nama klien dari &apos;
                        {client.accountId}&apos; menjadi &apos;{newAccountId}
                        &apos;. Apakah Anda yakin?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSaveRename}>
                        Ganti Nama
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelRename}
                >
                  <X className="mr-2 h-4 w-4" /> Batal
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              {" "}
              {/* Ensure these are flex items too */}
              <h4 className="font-semibold text-lg text-foreground break-all flex-1 min-w-0">
                {" "}
                {/* flex-1 min-w-0 to allow text to shrink */}
                {client.accountId}
              </h4>
              {client.isMainClient && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Klien Utama</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ganti Nama Klien</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        {client.message && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 mt-1 text-muted-foreground cursor-help flex-shrink-0 ml-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{client.message}</p>
              {client.outgoingMsgs24h && client.firstOutgoingMsg24h && (
                <p>
                  {client.outgoingMsgs24h} pesan terkirim dalam 24 jam terakhir
                  ({formatTimeAgo(client.firstOutgoingMsg24h)})
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {/* Baris 2: Status Klien */}
      <div className="flex items-center w-full">
        <p
          className={`text-sm font-medium flex items-center gap-1 ${getStatusColorClass(
            client.status
          )}`}
        >
          {getStatusIcon(client.status)}
          {client.status.toUpperCase().replace(/_/g, " ")}
        </p>
      </div>
      {/* Baris 3: Nomor Telepon */}
      {client.phoneNumber && (
        <div className="flex items-center w-full">
          <p className="text-xs text-muted-foreground break-all">
            Nomor: {client.phoneNumber}
          </p>
        </div>
      )}
      {/* Baris 4: Switch Headless dan Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mt-2 gap-2">
        {" "}
        {/* New container for alignment */}
        {/* Switch Headless */}
        <div className="flex items-center space-x-2 justify-between sm:justify-start">
          {" "}
          {/* Adjusted justify for smaller screens */}
          <Label
            htmlFor={`headless-switch-${client.accountId}`}
            className="text-foreground text-sm"
          >
            Headless
          </Label>
          <Switch
            id={`headless-switch-${client.accountId}`}
            checked={isHeadless}
            onCheckedChange={setIsHeadless}
            disabled={isClientRunningOrConnecting || isEditing}
          />
        </div>
        {/* Tombol Aksi */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end flex-1 min-w-0">
          {" "}
          {isClientActive || client.status === "loading" ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDisconnectClient}
                    size="sm"
                    variant="outline"
                    className="flex-grow sm:flex-grow-0"
                    disabled={isEditing}
                  >
                    <PauseCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hentikan Klien (Tutup Browser, Sesi Tersimpan)</p>
                </TooltipContent>
              </Tooltip>

              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-grow sm:flex-grow-0"
                        disabled={isEditing}
                      >
                        <PowerOff className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout Klien (Hapus Sesi)</p>
                  </TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Apakah Anda Yakin Ingin Logout?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan mengeluarkan klien &apos;
                      {client.accountId}&apos; dari WhatsApp dan menghapus
                      sesinya dari server. Anda perlu login ulang dengan QR code
                      jika ingin menggunakannya lagi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogoutClient}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleRunClient}
                  size="sm"
                  variant="default"
                  className="flex-grow sm:flex-grow-0"
                  disabled={isClientRunningOrConnecting || isEditing}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Jalankan Klien</p>
              </TooltipContent>
            </Tooltip>
          )}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-grow sm:flex-grow-0"
                    disabled={isEditing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hapus Klien Permanen</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Apakah Anda Yakin Ingin Menghapus Klien Ini?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus klien &apos;{client.accountId}
                  &apos; secara permanen dari server, termasuk semua data
                  sesinya. Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClient}>
                  Hapus Permanen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Tombol "Jadikan Klien Utama" */}
          {!client.isMainClient &&
            (isClientActive || client.status === "disconnected") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-grow sm:flex-grow-0"
                    onClick={handleSetAsMain}
                    disabled={isEditing}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Jadikan Klien Utama</p>
                </TooltipContent>
              </Tooltip>
            )}
        </div>
      </div>
      {rating && rating !== undefined && (
        <RatingSlider max={10} min={1} value={rating} onChange={setRating} />
      )}
    </div>
  );
};

export default ClientStatusItem;
