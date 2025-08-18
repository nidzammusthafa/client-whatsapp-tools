import React from "react";
import {
  Reply,
  Check,
  CheckCheck,
  MapPin,
  File,
  Mic,
  Video,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationMessage } from "@/types";

interface MessageBubbleProps {
  message: ConversationMessage;
  isFromMe: boolean;
  onReply: (message: ConversationMessage) => void;
}

/**
 * Komponen untuk merender sebuah gelembung pesan.
 */
const MessageBubble = ({ message, isFromMe, onReply }: MessageBubbleProps) => {
  const alignClass = isFromMe ? "self-end" : "self-start";
  const bubbleClass = isFromMe
    ? "bg-green-900 text-white"
    : "bg-muted text-foreground";
  const tailClass = isFromMe
    ? "bg-green-900 top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tr-sm"
    : "bg-muted top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl-sm";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusIcon = (ack: number) => {
    switch (ack) {
      case 1: // ACK_SENT
        return <Check className="h-3 w-3 text-white/50" />;
      case 2: // ACK_RECEIVED
        return <CheckCheck className="h-3 w-3 text-white/50" />;
      case 3: // ACK_READ
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4 mr-1" />;
      case "video":
        return <Video className="h-4 w-4 mr-1" />;
      case "ptt":
        return <Mic className="h-4 w-4 mr-1" />;
      case "location":
        return <MapPin className="h-4 w-4 mr-1" />;
      default:
        return <File className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className={`flex flex-col max-w-[80%] ${alignClass}`}>
      <div
        className={`relative px-3 rounded-xl shadow-md ${bubbleClass}`}
        style={{
          borderTopRightRadius: isFromMe ? "4px" : "12px",
          borderTopLeftRadius: isFromMe ? "12px" : "4px",
        }}
      >
        <div className={`absolute w-3 h-3 ${tailClass}`} />
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-start md:max-w-lg">
            <p className="text-sm break-words min-w-0">
              {message.isMedia ? (
                getIconForType("image")
              ) : message.isAudio ? (
                getIconForType("ptt")
              ) : message.location ? (
                getIconForType("location")
              ) : message.type === "vcard" ? (
                "KONTAK"
              ) : message.type === "sticker" ? (
                "STIKER"
              ) : message.type === "document" ? (
                <File className="h-4 w-4 mr-1" />
              ) : (
                message.body
              )}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(message)}
              className="p-1 h-auto text-muted-foreground/50 hover:text-foreground/80 transition-colors"
            >
              <Reply className="h-3 w-3" />
            </Button>
            <span className="text-xs text-right text-muted-foreground/50 mt-1">
              {new Date(message.timestamp).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(message.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
