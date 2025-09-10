import { WABlastMessageLogEntry } from "@/types/whatsapp/blast";

export const dummyBlastLogs: WABlastMessageLogEntry[] = [
  {
    blastJobId: "job-123",
    recipientPhoneNumber: "6281234567890",
    messageContent:
      "Halo Kak! Promo spesial hari ini, jangan sampai ketinggalan!",
    senderAccountIds: ["marketing-01"],
    timestamp: new Date().toISOString(),
    status: "SENT",
    mediaSent: false,
    originalData: { Nama: "Andi", Kota: "Jakarta" },
  },
  {
    blastJobId: "job-123",
    recipientPhoneNumber: "6285712345678",
    messageContent: "Diskon 50% khusus untuk Anda, Kak Budi! Cek sekarang!",
    senderAccountIds: ["marketing-01"],
    timestamp: new Date().toISOString(),
    status: "SENT",
    mediaSent: false,
    originalData: { Nama: "Budi", Kota: "Bandung" },
  },
  {
    blastJobId: "job-123",
    recipientPhoneNumber: "6289876543210",
    messageContent: "Hai Kak Citra, apa kabar? Ada penawaran menarik nih.",
    senderAccountIds: ["marketing-01"],
    timestamp: new Date().toISOString(),
    status: "FAILED",
    error: "Nomor tidak terdaftar di WhatsApp",
    mediaSent: false,
    originalData: { Nama: "Citra", Kota: "Surabaya" },
  },
  {
    blastJobId: "job-123",
    recipientPhoneNumber: "6281122334455",
    messageContent: "Ini adalah pesan dalam antrian...",
    senderAccountIds: ["marketing-01"],
    timestamp: new Date().toISOString(),
    status: "SENT", // Custom status for preview
    mediaSent: false,
    originalData: { Nama: "Dewi", Kota: "Medan" },
  },
];
