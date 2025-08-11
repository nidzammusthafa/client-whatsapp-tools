import { SessionData, WaChat, WaMessage } from "@/types";
import { useState, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

type Sessions = Record<string, SessionData>;
type Logs = Record<string, string[]>;
type Chats = Record<string, WaChat[]>; // Keyed by sessionId
type Messages = Record<string, WaMessage[]>; // Keyed by chatId

export const useSocketManager = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessions, setSessions] = useState<Sessions>({});
  const [logs, setLogs] = useState<Logs>({});
  const [chats, setChats] = useState<Chats>({});
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    if (!url) return;

    const socketUrl = `${url}/whatsapp`;
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    setSocket(newSocket);

    // --- Event Listener ---
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      toast.success("Connected to WhatsApp Server.");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      toast.error("Failed to connect to server.", {
        description: "Please ensure the backend server is running.",
        duration: 8000,
      });
    });

    // --- Event Sesi dan Log ---
    newSocket.on("initial-state", (allStates: SessionData[]) => {
      const sessionsObject = allStates.reduce((acc, session) => {
        acc[session.id] = session;
        return acc;
      }, {} as Sessions);
      setSessions(sessionsObject);
    });

    newSocket.on("session-update", (data: SessionData) => {
      setSessions((prev) => ({
        ...prev,
        [data.id]: { ...prev[data.id], ...data },
      }));
    });

    newSocket.on("session-removed", (data: { id: string }) => {
      setSessions((prev) => {
        const newSessions = { ...prev };
        delete newSessions[data.id];
        return newSessions;
      });
    });

    newSocket.on("log-message", (data: { id: string; message: string }) => {
      setLogs((prev) => ({
        ...prev,
        [data.id]: [...(prev[data.id] || []), data.message],
      }));
    });

    // --- Event Chat dan Pesan (dengan tipe data lokal) ---
    newSocket.on("initial-chats", (data: { id: string; chats: WaChat[] }) => {
      console.log(`Received ${data.chats.length} chats for ${data.id}`);
      setChats((prev) => ({ ...prev, [data.id]: data.chats }));
    });

    newSocket.on("chat-update", (data: { id: string; chat: WaChat }) => {
      setChats((prev) => {
        const sessionChats = prev[data.id] || [];
        const chatIndex = sessionChats.findIndex(
          (c) => c.id._serialized === data.chat.id._serialized
        );
        if (chatIndex !== -1) {
          sessionChats[chatIndex] = data.chat;
        } else {
          sessionChats.push(data.chat);
        }
        return { ...prev, [data.id]: [...sessionChats] };
      });
    });

    newSocket.on(
      "messages-update",
      (data: { id: string; chatId: string; messages: WaMessage[] }) => {
        console.log(
          `Received ${data.messages.length} messages for chat ${data.chatId}`
        );
        setMessages((prev) => ({ ...prev, [data.chatId]: data.messages }));
      }
    );

    newSocket.on("new-message", (data: { id: string; message: WaMessage }) => {
      const chatId = data.message.id.remote;
      setMessages((prev) => {
        const chatMessages = prev[chatId] || [];
        // Hindari duplikasi pesan
        if (chatMessages.find((m) => m.id.id === data.message.id.id)) {
          return prev;
        }
        return { ...prev, [chatId]: [...chatMessages, data.message] };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  // --- Fungsi Emitter ---
  const addNewSession = useCallback(
    (id: string) => {
      if (socket?.connected) socket.emit("add-new-session", { id });
    },
    [socket]
  );

  const sendMessage = useCallback(
    (id: string, to: string, message: string) => {
      if (socket?.connected) socket.emit("send-message", { id, to, message });
    },
    [socket]
  );

  const requestLoginCode = useCallback(
    (id: string, phoneNumber: string) => {
      if (socket?.connected)
        socket.emit("request-login-code", { id, phoneNumber });
    },
    [socket]
  );

  const logoutSession = useCallback(
    (id: string) => {
      if (socket?.connected) socket.emit("logout-session", { id });
    },
    [socket]
  );

  const requestChats = useCallback(
    (id: string) => {
      if (socket?.connected) socket.emit("request-chats", { id });
    },
    [socket]
  );

  const requestMessages = useCallback(
    (id: string, chatId: string, limit: number = 50) => {
      if (socket?.connected)
        socket.emit("request-messages", { id, chatId, limit });
    },
    [socket]
  );

  return {
    sessions,
    logs,
    chats,
    messages,
    addNewSession,
    sendMessage,
    requestLoginCode,
    logoutSession,
    requestChats,
    requestMessages,
    isConnected: socket?.connected || false,
  };
};
