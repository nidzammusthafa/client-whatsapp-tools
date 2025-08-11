import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { useWhatsAppStore } from "@/stores/whatsapp";

const QrCodeDialog: React.FC = () => {
  const { showQrDialog, setShowQrDialog, currentQrCode, currentQrAccountId } =
    useWhatsAppStore();

  return (
    <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-card text-card-foreground rounded-lg shadow-xl">
        {" "}
        {/* Menggunakan bg-card dan text-card-foreground */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {" "}
            {/* Menggunakan text-foreground */}
            Pindai QR Code
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {" "}
            {/* Menggunakan text-muted-foreground */}
            Pindai QR code di bawah ini menggunakan aplikasi WhatsApp Anda untuk
            login ke akun{" "}
            <span className="font-semibold text-primary">
              {" "}
              {/* Menggunakan text-primary */}
              {currentQrAccountId}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {currentQrCode ? (
            <div className="bg-background p-4 rounded-lg shadow border">
              {" "}
              {/* Menggunakan bg-background */}
              <QRCodeCanvas
                value={currentQrCode}
                level="H"
                size={220}
                includeMargin={true}
                bgColor="#ffffff" // QR code background should generally be white
                fgColor="#000000" // QR code foreground should generally be black
              />
            </div>
          ) : (
            <p className="text-muted-foreground">
              {" "}
              {/* Menggunakan text-muted-foreground */}
              Memuat QR Code...
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {" "}
            {/* Menggunakan text-muted-foreground */}
            Buka WhatsApp di ponsel Anda &gt; Pengaturan &gt; Perangkat Tertaut
            &gt; Tautkan Perangkat &gt; Pindai Kode QR.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
