import React, { useMemo } from "react";
import {
  Reply,
  Check,
  CheckCheck,
  MapPin,
  File,
  Mic,
  Video,
  ImageIcon,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationMessage } from "@/types";
import { convertToHtml } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface MessageBubbleProps {
  message: ConversationMessage;
  isFromMe: boolean;
  onReply: (message: ConversationMessage) => void;
}

/**
 * Komponen untuk merender sebuah gelembung pesan.
 */
const MessageBubble = ({ message, isFromMe, onReply }: MessageBubbleProps) => {
  const alignClass = isFromMe ? "items-end" : "items-start";
  const bubbleClass = isFromMe
    ? "bg-green-900 text-white rounded-tr-none"
    : "bg-muted text-foreground rounded-tl-none";
  // const tailClass = isFromMe
  //   ? "bg-green-900 top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tr-sm"
  //   : "bg-muted top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl-sm";

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
        return <ImageIcon className="h-8 w-8" />;
      case "video":
        return <Video className="h-8 w-8" />;
      case "ptt":
        return <Mic className="h-8 w-8" />;
      case "location":
        return <MapPin className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const formattedBody = useMemo(
    () => convertToHtml(message.body),
    [message.body]
  );

  return (
    <div className={`flex flex-col ${alignClass}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <Tooltip>
            <TooltipTrigger
              className={`relative p-2 rounded-xl shadow-md max-w-lg max-sm:max-w-full ${bubbleClass}`}
              style={{
                borderTopRightRadius: isFromMe ? "4px" : "12px",
                borderTopLeftRadius: isFromMe ? "12px" : "4px",
              }}
            >
              <div className="flex justify-between items-start md:max-w-lg">
                <p className="text-sm text-left break-words min-w-0 pr-12">
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
                    <div dangerouslySetInnerHTML={{ __html: formattedBody }} />
                  )}
                </p>
                <div className="absolute right-2 bottom-2 flex flex-col items-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onReply(message)}
                    className="p-1 h-auto text-muted-foreground/50 hover:text-foreground bg-transparent hover:bg-transparent transition-colors"
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black/75" side="bottom" align="start">
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
            </TooltipContent>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReply(message)}
              className="w-full text-muted-foreground/50 hover:text-foreground bg-transparent hover:bg-transparent transition-colors"
            >
              <Reply className="h-4 w-4 mr-2" /> Balas
            </Button>
          </ContextMenuItem>
          <ContextMenuItem asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigator.clipboard.writeText(message.body)}
              className="w-full text-muted-foreground/50 hover:text-foreground bg-transparent hover:bg-transparent transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" /> Salin
            </Button>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};

export default MessageBubble;
