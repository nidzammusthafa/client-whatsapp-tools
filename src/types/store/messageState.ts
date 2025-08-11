import { StoredMessage } from "../whatsapp/stored-message";

export interface MessageStoreState {
  storedMessages: StoredMessage[];
}

export interface MessageStoreActions {
  setStoredMessages: (messages: StoredMessage[]) => void;
  loadStoredMessages: () => void;
  saveNewStoredMessage: (name: string, content: string) => void;
  deleteExistingStoredMessage: (id: string) => void;
  updateExistingStoredMessage: (
    id: string,
    name: string,
    content: string
  ) => void;
}
