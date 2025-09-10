"use client";

import React from "react";
import { dummyChats, dummyMessages } from "@/lib/dummy-data";
import { LabeledChat, ConversationMessage } from "@/types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, MessageCircleMore, SendHorizonal, XCircle } from "lucide-react";

const PreviewMessageBubble = ({
  message,
  isFromMe,
}: {
  message: ConversationMessage;
  isFromMe: boolean;
}) => (
  <div className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}>
    <div
      className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
        isFromMe ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      <p className="text-sm">{message.body}</p>
      <div className="flex items-center gap-1 justify-end mt-1">
        <p className="text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {isFromMe && <Check size={16} className="opacity-70" />}
      </div>
    </div>
  </div>
);

const PreviewConversationWindow = ({
  chatId,
  messages,
}: {
  chatId: string;
  messages: ConversationMessage[];
}) => {
  const [messageInput] = React.useState("Ini adalah contoh balasan pesan.");

  return (
    <div className="h-full flex flex-col bg-card pointer-events-none">
      <header className="p-1 px-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={`https://ui.shadcn.com/avatars/0${
                (chatId.charCodeAt(0) % 5) + 1
              }.png`}
              alt={chatId}
            />
            <AvatarFallback>
              {chatId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>{chatId.split("@")[0]}</CardTitle>
        </div>
      </header>
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <PreviewMessageBubble
            key={msg.id}
            message={msg}
            isFromMe={msg.isFromMe}
          />
        ))}
      </CardContent>
      <div className="p-4 border-t">
        <div className="mb-2 p-2 rounded-lg bg-muted border relative">
          <p className="text-sm font-semibold">Membalas Anda</p>
          <p className="text-xs text-muted-foreground truncate">
            Tentu, stok kami masih banyak. Apakah Anda berminat?
          </p>
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="absolute top-1 right-1 h-6 w-6"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        <form className="flex items-center">
          <Textarea
            value={messageInput}
            readOnly
            placeholder="Ketik pesan..."
            rows={1}
            className="resize-none block w-full text-sm text-gray-900 bg-white rounded-lg dark:placeholder-gray-400 dark:text-white"
            disabled
          />
          <Button disabled className="cursor-pointer" variant="ghost" size="sm">
            <SendHorizonal className="h-8 w-8" />
          </Button>
        </form>
      </div>
    </div>
  );
};

const PreviewConversationList = ({
  chats,
  selectedChatId,
  onSelectChat,
}: {
  chats: LabeledChat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}) => (
  <Card className="w-full md:w-1/3 md:min-w-[300px] md:max-w-sm rounded-none border-t-0 md:border-r py-0">
    <CardContent className="p-0 h-full overflow-y-auto">
      <div className="sticky top-0 bg-accent/70 p-2 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Semua Chat ({chats.length})</h3>
      </div>
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => onSelectChat(chat.chatId)}
          className={`flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted ${
            selectedChatId === chat.chatId ? "bg-muted" : ""
          }`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://ui.shadcn.com/avatars/0${
                (chat.chatId.charCodeAt(0) % 5) + 1
              }.png`}
              alt={chat.latestMessage.sender}
            />
            <AvatarFallback>
              {chat.latestMessage.sender.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate flex justify-between">
              <span className="font-bold">{chat.chatId.split("@")[0]}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(chat.latestMessage.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {chat.latestMessage.body}
            </p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function PreviewInboxPage() {
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    dummyChats[0].chatId
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <PreviewConversationList
        chats={dummyChats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />
      <div className="flex-1 bg-card flex flex-col">
        {selectedChatId ? (
          <PreviewConversationWindow
            chatId={selectedChatId}
            messages={dummyMessages[selectedChatId] || []}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <MessageCircleMore className="h-24 w-24 text-muted-foreground opacity-50" />
            <p className="mt-4 text-xl font-semibold text-muted-foreground">
              Pilih obrolan untuk memulai percakapan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
