import { WhatsAppNumberCheckResult } from "@/types";

export const dummyNumberCheckResults: WhatsAppNumberCheckResult[] = [
  {
    phoneNumber: "6281234567890",
    status: "active",
    originalData: { Nama: "Andi", Kota: "Jakarta" },
    jobId: "",
  },
  {
    phoneNumber: "6285712345678",
    status: "active",
    originalData: { Nama: "Budi", Kota: "Bandung" },
    jobId: "",
  },
  {
    phoneNumber: "6289999999999",
    status: "inactive",
    originalData: { Nama: "Citra", Kota: "Surabaya" },
    jobId: "",
  },
  {
    phoneNumber: "6281122334455",
    status: "active",
    originalData: { Nama: "Dewi", Kota: "Medan" },
    jobId: "",
  },
  {
    phoneNumber: "6287811112222",
    status: "inactive",
    originalData: { Nama: "Eka", Kota: "Yogyakarta" },
    jobId: "",
  },
];
