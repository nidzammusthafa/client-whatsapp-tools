"use client";

import React from "react";
import Image from "next/image";
import { dummySessions, dummyLogs } from "@/lib/dummy-data";
import { SessionData } from "@/types";
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

const PreviewWhatsAppSessionCard = ({
  session,
  logs,
}: {
  session: SessionData;
  logs: string[];
}) => {
  const LoginSection = () => (
    <div className="space-y-4 pointer-events-none">
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

      <Button variant="outline" className="w-full" disabled>
        <Phone className="mr-2 h-4 w-4" /> Tautkan dengan Nomor Telepon
      </Button>
    </div>
  );

  const PairingCodeSection = () => (
    <div className="text-center p-6 bg-blue-50 rounded-lg pointer-events-none">
      <p className="text-sm text-gray-700 mb-2">
        Buka WhatsApp di ponsel Anda, lalu ke:
      </p>
      <p className="text-sm font-semibold text-gray-800">
        Pengaturan {">"} Perangkat Tertaut {">"} Tautkan dengan nomor telepon
      </p>
      <p className="text-sm text-gray-700 my-4">Masukkan kode berikut:</p>
      <div className="bg-white p-4 rounded-md border-2 border-dashed">
        <p className="text-3xl font-bold tracking-widest text-blue-600">
          {session.loginCode}
        </p>
      </div>
    </div>
  );

  const MessageFormSection = () => (
    <form className="space-y-4 pointer-events-none">
      <div className="space-y-2">
        <label className="text-sm font-medium">Kirim Pesan</label>
        <Input
          placeholder="Nomor Tujuan (cth: 62812...)"
          disabled
          defaultValue="6281234567890"
        />
        <Textarea
          placeholder="Tulis pesan Anda..."
          disabled
          defaultValue="Ini adalah contoh pesan untuk demonstrasi."
        />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2" disabled>
        <Send size={16} /> Kirim
      </Button>
    </form>
  );

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
            className={`flex items-center gap-1 pointer-events-none ${
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
            <Button
              variant="outline"
              size="icon"
              title="Logout"
              disabled
              className="pointer-events-none"
            >
              <LogOut className="h-4 w-4" />
            </Button>
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
          <div className="h-32 bg-gray-900 text-gray-300 font-mono text-xs p-2 rounded-md overflow-y-auto pointer-events-none">
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

export default function PreviewAccountsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      {dummySessions.map((session) => (
        <PreviewWhatsAppSessionCard
          key={session.id}
          session={session}
          logs={dummyLogs}
        />
      ))}
    </div>
  );
}
