import { WhatsAppClientStatusUpdate } from "../whatsapp/client";
import { InitialSettingsPayload } from "./whatsappState"; // Import from the main state file

export interface ClientState {
  clients: WhatsAppClientStatusUpdate[];
  isSocketConnected: boolean;
  globalError: string | null;
  currentQrCode: string | undefined;
  currentQrAccountId: string | undefined;
  showQrDialog: boolean;
  newClientAccountId: string;
  isHeadlessMode: boolean;
  initialSettingsLoaded: boolean;
  whitelistNumbers: string[];
}

export interface ClientActions {
  setSocketConnected: (connected: boolean) => void;
  setGlobalError: (error: string | null) => void;
  resetGlobalError: () => void;
  updateClientStatus: (update: WhatsAppClientStatusUpdate) => void;
  setExistingClients: (existingClients: WhatsAppClientStatusUpdate[]) => void;
  removeClient: (accountId: string) => void;
  setShowQrDialog: (show: boolean) => void;
  setCurrentQrCode: (qrCode: string | undefined) => void;
  setCurrentQrAccountId: (accountId: string | undefined) => void;
  setNewClientAccountId: (id: string) => void;
  setIsHeadlessMode: (headless: boolean) => void;
  setClientAsMain: (accountId: string) => void;
  loadInitialSettings: () => void;
  setInitialSettings: (payload: InitialSettingsPayload) => void;
  setWhitelistNumbers: (numbers: string[]) => void;
  addWhitelistNumbers: (numbers: string[]) => void;
  removeWhitelistNumber: (number: string) => void;
  resetWhitelistNumbers: () => void;
  loginClient: (accountId: string, headless: boolean) => void;
  logoutClient: (accountId: string) => void;
  renameClient: (oldAccountId: string, newAccountId: string) => void;
  resetWhatsAppAccountMessageCount: (accountId: string) => void;
  resetAllWhatsAppAccountMessageCounts: () => void;
  deleteClient: (accountId: string) => void;
  disconnectClient: (accountId: string) => void;
  disconnectAllClients: () => void;
  initializeMultipleClients: (accountIds: string[], headless: boolean) => void;
}
