import { create } from "zustand";
import { immer } from "zustand/middleware/immer"; // Recommended for Zustand with nested updates
import { devtools } from "zustand/middleware"; // For Redux DevTools integration

import { WhatsAppState, WhatsAppActions } from "@/types/store/whatsappState";

import { createClientManagerSlice } from "./clientManager";
import { createNumberCheckManagerSlice } from "./numberCheckManager";
import { createWaWarmerManagerSlice } from "./waWarmerManager";
import { createWaBlastManagerSlice } from "./waBlastManager";
import { createMessageStoreSlice } from "./messageStore";

export const useWhatsAppStore = create<WhatsAppState & WhatsAppActions>()(
  devtools(
    immer((...a) => ({
      // Combine initial states from all slices
      ...createClientManagerSlice(...a),
      ...createNumberCheckManagerSlice(...a),
      ...createWaWarmerManagerSlice(...a),
      ...createWaBlastManagerSlice(...a),
      ...createMessageStoreSlice(...a),
    }))
  )
);
