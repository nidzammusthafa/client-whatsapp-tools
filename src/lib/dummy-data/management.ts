import { Address } from "@/types/whatsapp/address";
import { StoredMessage } from "@/types/whatsapp/stored-message";

export const dummyContacts: Address[] = [
  {
    id: "contact-1",
    name: "PT Sejahtera Abadi",
    address: "Jl. Jenderal Sudirman No. 123, Jakarta",
    phoneNumber: "6281298765432",
    isBusiness: true,
    hasReceivedMessage: true,
    rating: 4.9,
    reviews: 120,
    latitude: -6.225,
    longitude: 106.82,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "contact-2",
    name: "Toko Roti Enak",
    address: "Jl. Gajah Mada No. 45, Surabaya",
    phoneNumber: "6285787654321",
    isBusiness: true,
    hasReceivedMessage: false,
    rating: 4.7,
    reviews: 88,
    latitude: -7.25,
    longitude: 112.75,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "contact-3",
    name: "Budi Setiawan",
    address: "Jl. Pahlawan No. 10, Bandung",
    phoneNumber: "6289812345678",
    isBusiness: false,
    hasReceivedMessage: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const dummyTemplates: StoredMessage[] = [
  {
    id: "template-1",
    name: "Sapaan Pagi",
    content: "Selamat pagi, {{nama}}! Semoga harimu menyenangkan.",
    points: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-2",
    name: "Promo Akhir Pekan",
    content: "Jangan lewatkan promo akhir pekan kami! Diskon hingga 50% untuk semua produk. Cek sekarang di website kami!",
    points: 125,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-3",
    name: "Follow Up Penawaran",
    content: "Halo, Kak. Hanya ingin menanyakan kembali perihal penawaran yang kami kirimkan kemarin. Apakah ada pertanyaan?",
    points: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
