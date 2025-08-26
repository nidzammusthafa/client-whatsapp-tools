/**
 * Interface untuk data pesan yang disimpan di database.
 */
export interface ConversationMessage {
  id: string;
  messageId: string;
  clientName: string;
  chatId: string;
  sender: string;
  body: string;
  timestamp: Date;
  isFromMe: boolean;
  isGroup: boolean;
  type: string;
  location?: unknown;
  isMedia: boolean;
  isAudio: boolean;
  repliedToBlastMessageId?: string;
  labelId?: string;
}

/**
 * Interface untuk representasi chat di frontend.
 * Menggabungkan informasi chat dengan pesan terakhir.
 */
export interface LabeledChat {
  chatId: string;
  latestMessage: ConversationMessage;
  label?: {
    labelId: string;
    name: string;
    color: number;
  };
}

/**
 * Interface untuk payload permintaan pengiriman pesan/balasan.
 */
export interface SendMessagePayload {
  clientId: string;
  messageBody: string;
}

/**
 * Interface untuk payload permintaan mengirim balasan.
 */
export interface SendReplyPayload {
  clientId: string;
  originalMessageId: string;
  replyBody: string;
}

/**
 * Definisi tipe untuk state obrolan di toko Zustand.
 */
export interface ConversationState {
  labeledChats: LabeledChat[];
  selectedChatId: string | null;
  messagesByChatId: Record<string, ConversationMessage[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allLabels: any[];
}

/**
 * Definisi tipe untuk actions obrolan di toko Zustand.
 */
export interface ConversationActions {
  loadLabeledChats: () => Promise<void>;
  loadMessagesForChat: (
    chatId: string,
    clientId?: string | undefined
  ) => Promise<void>;
  loadAllConversationMessages: () => Promise<void>;
  loadAllLabels: () => Promise<void>;
  setLabelForChat: (
    chatId: string,
    labelId: (string | number)[],
    lastMessage: ConversationMessage
  ) => Promise<void>;
  allLabels?: unknown[];
  sendMessage: (payload: {
    chatId: string;
    messageBody: string;
    lastMessage: ConversationMessage;
  }) => Promise<void>;
  sendReply: (payload: {
    chatId: string;
    originalMessageId: string;
    replyBody: string;
  }) => Promise<void>;
  markChatAsRead: (
    chatId: string,
    lastMessage: ConversationMessage
  ) => Promise<void>;
  setSelectedChatId: (chatId: string | null) => void;
  addMessageToChat: (message: ConversationMessage) => void;
}
