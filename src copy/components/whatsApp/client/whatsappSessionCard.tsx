import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Wifi,
  WifiOff,
  QrCode as QrCodeIcon,
  Send,
  Phone,
  KeyRound,
  LogOut,
  Loader2,
} from "lucide-react";
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
import { SessionData } from "@/types";

interface Props {
  session: SessionData;
  logs: string[];
  onSendMessage: (to: string, message: string) => void;
  onRequestLoginCode: (phoneNumber: string) => void;
  onLogout: () => void;
}

export const WhatsAppSessionCard = ({
  session,
  logs,
  onSendMessage,
  onRequestLoginCode,
  onLogout,
}: Props) => {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneLoginVisible, setPhoneLoginVisible] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);

  useEffect(() => {
    if (session.status !== "INITIALIZING") {
      setIsRequestingCode(false);
    }
  }, [session.status]);

  const handleRequestCode = () => {
    if (phoneNumber) {
      setIsRequestingCode(true);
      onRequestLoginCode(phoneNumber);
    }
  };

  // Komponen Bagian Login
  const LoginSection = () => (
    <div className="space-y-4">
      {session.qrCode ? (
        <div className="flex flex-col items-center justify-center p-4 rounded-md">
          <Image
            src={session.qrCode}
            alt={`QR Code for ${session.id}`}
            width={250}
            height={250}
          />
          <p className="mt-4 text-sm text-gray-600">
            Pindai kode ini dengan WhatsApp Anda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-md">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-500">Menunggu QR Code dari server...</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ATAU</span>
        </div>
      </div>

      {isPhoneLoginVisible ? (
        <div className="p-4 rounded-lg space-y-3 border">
          {isRequestingCode ? (
            <div className="flex flex-col items-center justify-center h-24">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
              <p className="mt-2 text-sm text-gray-500">
                Meminta kode dari WhatsApp...
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Masukkan nomor WA (cth: 62812...) untuk mendapatkan kode.
              </p>
              <Input
                type="text"
                placeholder="Masukkan nomor telepon Anda"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button
                onClick={handleRequestCode}
                className="w-full"
                disabled={!phoneNumber}
              >
                Dapatkan Kode Login
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setPhoneLoginVisible(true)}
        >
          <Phone className="mr-2 h-4 w-4" /> Tautkan dengan Nomor Telepon
        </Button>
      )}
    </div>
  );

  // Komponen Bagian Tampilan Kode OTP
  const PairingCodeSection = () => (
    <div className="text-center p-6 bg-blue-50 rounded-lg">
      <p className="text-sm text-gray-700 mb-2">
        Buka WhatsApp di ponsel Anda, lalu ke:
      </p>
      <p className="text-sm font-semibold text-gray-800">
        Pengaturan &gt; Perangkat Tertaut &gt; Tautkan dengan nomor telepon
      </p>
      <p className="text-sm text-gray-700 my-4">Masukkan kode berikut:</p>
      <div className="bg-white p-4 rounded-md border-2 border-dashed">
        <p className="text-3xl font-bold tracking-widest text-blue-600">
          {session.loginCode}
        </p>
      </div>
    </div>
  );

  // Komponen Bagian Form Kirim Pesan
  const MessageFormSection = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSendMessage(recipient, message);
        setMessage("");
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Kirim Pesan</label>
        <Input
          placeholder="Nomor Tujuan (cth: 62812...)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <Textarea
          placeholder="Tulis pesan Anda..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2">
        <Send size={16} /> Kirim
      </Button>
    </form>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sesi: {session.id}</CardTitle>
          {session.status === "READY" && session.info && (
            <CardDescription>
              {session.info.pushname} ({session.info.wid.user})
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              session.status === "READY"
                ? "default"
                : session.status === "DISCONNECTED" ||
                  session.status === "AUTH_FAILURE"
                ? "destructive"
                : "outline"
            }
            className={`flex items-center gap-1 ${
              session.status === "READY"
                ? "bg-green-100 text-green-800"
                : session.status === "DISCONNECTED"
                ? "bg-red-100 text-red-800"
                : session.status === "AUTH_FAILURE"
                ? "bg-yellow-100 text-yellow-800"
                : session.status === "CODE_RECEIVED"
                ? "bg-blue-100 text-blue-800"
                : session.status === "QR_RECEIVED"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {session.status === "INITIALIZING" ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-1" /> Memuat
              </>
            ) : session.status === "READY" ? (
              <>
                <Wifi className="h-4 w-4 mr-1" /> Terhubung
              </>
            ) : session.status === "DISCONNECTED" ? (
              <>
                <WifiOff className="h-4 w-4 mr-1" /> Terputus
              </>
            ) : session.status === "QR_RECEIVED" ? (
              <>
                <QrCodeIcon className="h-4 w-4 mr-1" /> Siap Pindai
              </>
            ) : session.status === "AUTH_FAILURE" ? (
              <>
                <WifiOff className="h-4 w-4 mr-1" /> Gagal Autentikasi
              </>
            ) : session.status === "CODE_RECEIVED" ? (
              <>
                <KeyRound className="h-4 w-4 mr-1" /> Kode Diterima
              </>
            ) : (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              </>
            )}
          </Badge>
          {session.status === "READY" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sesi ini akan di-logout.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLogout}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Ya, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {session.status === "READY" && <MessageFormSection />}
        {session.status === "CODE_RECEIVED" && <PairingCodeSection />}
        {[
          "INITIALIZING",
          "QR_RECEIVED",
          "DISCONNECTED",
          "AUTH_FAILURE",
        ].includes(session.status) && <LoginSection />}
      </CardContent>
      <CardFooter>
        <div className="w-full mt-4">
          <h4 className="font-semibold text-sm mb-2">Log Aktivitas</h4>
          <div className="h-32 bg-gray-900 text-gray-300 font-mono text-xs p-2 rounded-md overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => <p key={index}>&gt; {log}</p>)
            ) : (
              <p>&gt; Menunggu aktivitas...</p>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
