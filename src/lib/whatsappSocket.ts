import { io, Socket } from "socket.io-client";

// URL backend Socket.IO Anda
// Sesuaikan jika backend Anda berjalan di port atau domain yang berbeda
const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

    whatsappSocket.on("connect_error", (error) => {
      console.error("Kesalahan koneksi Socket.IO:", error.message);
    });
  }
  return whatsappSocket;
};

/**
 * Memastikan socket terhubung.
 */
export const connectWhatsappSocket = () => {
  const socket = getWhatsappSocket();
  console.log(socket);
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
