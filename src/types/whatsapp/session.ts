export type WhatsAppSessionStatus =
  | "INITIALIZING"
  | "QR_RECEIVED"
  | "CODE_RECEIVED"
  | "READY"
  | "DISCONNECTED"
  | "AUTH_FAILURE";

export interface WaMessage {
  id: {
    fromMe: boolean;
    remote: string;
    id: string;
    _serialized: string;
  };
  body: string;
  type: string;
  timestamp: number;
  from: string;
  to: string;
  fromMe: boolean;
  hasMedia: boolean;
  ack: number; // Message Ack
}

export interface WaChat {
  id: {
    server: string;
    user: string;
    _serialized: string;
  };
  name: string;
  isGroup: boolean;
  timestamp: number;
  unreadCount: number;
  lastMessage?: WaMessage;
}

export interface WaClientInfo {
  pushname: string;
  wid: {
    server: string;
    user: string;
    _serialized: string;
  };
}

export interface SessionData {
  id: string;
  status: WhatsAppSessionStatus;
  qrCode?: string;
  loginCode?: string;
  info?: WaClientInfo;
}
