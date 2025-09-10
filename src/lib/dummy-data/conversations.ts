import { LabeledChat, ConversationMessage } from "@/types/whatsapp/conservation";

const now = new Date();

const dummyMessages: Record<string, ConversationMessage[]> = {
  '6281234567890@c.us': [
    {
      id: 'msg1',
      messageId: 'msg1',
      clientName: 'marketing-01',
      chatId: '6281234567890@c.us',
      sender: '6281234567890@c.us',
      body: 'Halo, apakah produk A masih tersedia?',
      timestamp: new Date(now.getTime() - 5 * 60000),
      isFromMe: false,
      isGroup: false,
      type: 'chat',
      isMedia: false,
      isAudio: false,
    },
    {
      id: 'msg2',
      messageId: 'msg2',
      clientName: 'marketing-01',
      chatId: '6281234567890@c.us',
      sender: 'me',
      body: 'Tentu, stok kami masih banyak. Apakah Anda berminat?',
      timestamp: new Date(now.getTime() - 4 * 60000),
      isFromMe: true,
      isGroup: false,
      type: 'chat',
      isMedia: false,
      isAudio: false,
    },
  ],
  '6285712345678@c.us': [
    {
      id: 'msg3',
      messageId: 'msg3',
      clientName: 'sales-01',
      chatId: '6285712345678@c.us',
      sender: '6285712345678@c.us',
      body: 'Terima kasih atas penawarannya!',
      timestamp: new Date(now.getTime() - 10 * 60000),
      isFromMe: false,
      isGroup: false,
      type: 'chat',
      isMedia: false,
      isAudio: false,
    },
  ],
    '6289876543210@c.us': [
    {
      id: 'msg4',
      messageId: 'msg4',
      clientName: 'marketing-01',
      chatId: '6289876543210@c.us',
      sender: '6289876543210@c.us',
      body: 'Info promo dong.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60000),
      isFromMe: false,
      isGroup: false,
      type: 'chat',
      isMedia: false,
      isAudio: false,
    },
  ],
};

const dummyChats: LabeledChat[] = [
  {
    chatId: '6281234567890@c.us',
    latestMessage: dummyMessages['6281234567890@c.us'][1],
    label: {
        labelId: '1',
        name: 'Prospek Panas',
        color: 0xff00ff, // Pink
    }
  },
  {
    chatId: '6285712345678@c.us',
    latestMessage: dummyMessages['6285712345678@c.us'][0],
    label: {
        labelId: '2',
        name: 'Follow Up',
        color: 0xffff00, // Yellow
    }
  },
  {
    chatId: '6289876543210@c.us',
    latestMessage: dummyMessages['6289876543210@c.us'][0],
  },
];

export { dummyChats, dummyMessages };
