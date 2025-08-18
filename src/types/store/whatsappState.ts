/**
 * Definisi tipe untuk state dan actions Zustand store.
 */

import { ClientState, ClientActions } from "./clientState";
import { NumberCheckState, NumberCheckActions } from "./numberCheckState";
import { WaWarmerState, WaWarmerActions } from "./waWarmerState";
import { WaBlastState, WaBlastActions } from "./waBlastState";
import { MessageStoreState, MessageStoreActions } from "./messageState";
import {
  ConversationActions,
  ConversationState,
} from "../whatsapp/conservation";

/**
 * BARU: Interface untuk payload inisialisasi pengaturan dari backend.
 */
export interface InitialSettingsPayload {
  mainClientAccountId: string | null;
  whitelistNumbers: string[];
}

// Gabungkan semua state dan actions
export type WhatsAppState = ClientState &
  NumberCheckState &
  WaWarmerState &
  WaBlastState &
  MessageStoreState &
  ConversationState;

export type WhatsAppActions = ClientActions &
  NumberCheckActions &
  WaWarmerActions &
  WaBlastActions &
  MessageStoreActions &
  ConversationActions;
export type { ClientState, ClientActions };
export type { NumberCheckState, NumberCheckActions };
export type { WaWarmerState, WaWarmerActions };
export type { WaBlastState, WaBlastActions };
export type { MessageStoreState, MessageStoreActions };
