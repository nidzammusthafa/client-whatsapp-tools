import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = prompt(
  "Masukkan URL backend Socket.IO:",
  "http://localhost:5000"
);

// Instance socket untuk namespace WhatsApp
let whatsappSocket: Socket | null = null;

/**
 * Menginisialisasi dan mengembalikan instance Socket.IO untuk namespace '/whatsapp'.
 * Jika sudah ada, akan mengembalikan instance yang sudah ada.
 * @returns Instance Socket.IO client.
 */
export const getWhatsappSocket = (): Socket => {
  if (!whatsappSocket) {
    // Menggunakan namespace '/whatsapp' seperti yang didefinisikan di backend
    whatsappSocket = io(`${SOCKET_URL}/whatsapp`, {
      transports: ["websocket"], // Prioritaskan WebSocket
      autoConnect: false, // Jangan langsung terhubung saat inisialisasi
    });

    whatsappSocket.on("connect", () => {
      console.log("Terhubung ke namespace WhatsApp Socket.IO!");
    });

    whatsappSocket.on("disconnect", (reason) => {
      console.warn(`Terputus dari namespace WhatsApp Socket.IO: ${reason}`);
    });

    whatsappSocket.on("connect_error", async (error) => {
      console.error("Kesalahan koneksi Socket.IO:", error.message);
      toast.error(
        `Gagal terhubung ke server WhatsApp. Pastikan server berjalan.`,
        {
          description: error.message,
          duration: 5000,
        }
      );
    });
  }
  return whatsappSocket;
};

/**
 * Memastikan socket terhubung.
 */
export const connectWhatsappSocket = () => {
  const socket = getWhatsappSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Menghubungkan kembali socket
 */
export const reconnectWhatsappSocket = () => {
  const socket = getWhatsappSocket();
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
};

/**
 * Memutuskan koneksi socket.
 */
export const disconnectWhatsappSocket = () => {
  const socket = getWhatsappSocket();
  if (socket.connected) {
    socket.disconnect();
    whatsappSocket = null; // Reset instance setelah disconnect
  }
};
