import { SessionData } from "@/types/whatsapp/session";

export const dummySessions: SessionData[] = [
  {
    id: "marketing-01",
    status: "READY",
    info: {
      pushname: "Akun Pemasaran",
      wid: { user: "6281234567890", server: "c.us", _serialized: "" },
    },
  },
  {
    id: "sales-01",
    status: "QR_RECEIVED",
    qrCode: "/images/coordinates-generator.jpeg", // Using a placeholder image as QR
  },
  {
    id: "support-01",
    status: "DISCONNECTED",
  },
  {
    id: "new-account",
    status: "CODE_RECEIVED",
    loginCode: "ABC-12345",
  },
];

export const dummyLogs: string[] = [
  "Menginisialisasi sesi...",
  "Autentikasi berhasil.",
  "Klien siap digunakan.",
  "Mengirim pesan ke +62 855-xxxx-xxxx...",
  "Pesan berhasil terkirim.",
];