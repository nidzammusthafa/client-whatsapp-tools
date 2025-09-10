import { WarmerMessageLogEntry } from "@/types/whatsapp/warmer";

export const dummyWarmerLogs: WarmerMessageLogEntry[] = [
  {
    senderAccountIds: ["marketing-01"],
    recipientAccountId: "sales-01",
    messageContent: "Hai, apa kabar? Sedang sibuk?",
    timestamp: new Date(new Date().getTime() - 5 * 60000).toISOString(),
    status: "sent",
  },
  {
    senderAccountIds: ["sales-01"],
    recipientAccountId: "marketing-01",
    messageContent: "Baik! Iya nih, lagi kejar target. Kamu sendiri?",
    timestamp: new Date(new Date().getTime() - 4 * 60000).toISOString(),
    status: "sent",
  },
  {
    senderAccountIds: ["marketing-01"],
    recipientAccountId: "sales-01",
    messageContent: "Sama juga, hehe. Semangat ya!",
    timestamp: new Date(new Date().getTime() - 3 * 60000).toISOString(),
    status: "sent",
  },
    {
    senderAccountIds: ["support-01"],
    recipientAccountId: "marketing-01",
    messageContent: "Nanti sore ada meeting kan?",
    timestamp: new Date(new Date().getTime() - 2 * 60000).toISOString(),
    status: "sent",
  },
  {
    senderAccountIds: ["marketing-01"],
    recipientAccountId: "support-01",
    messageContent: "Oh iya, hampir lupa. Terima kasih sudah ingetin!",
    timestamp: new Date(new Date().getTime() - 1 * 60000).toISOString(),
    status: "sent",
  },
];
