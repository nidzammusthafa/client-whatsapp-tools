import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  MinusCircle,
  Bold,
  Italic,
  Strikethrough,
  Link,
  Plus,
  Undo2,
  Eye, // Import Eye icon
  EyeOff, // Import EyeOff icon
} from "lucide-react";
import UrlInputDialog from "../message/UrlInputDialog"; // Import komponen dialog URL
import {
  StoredMessage,
  WABlastMessageBlock,
  WABlastMessageType,
} from "@/types";

interface MessageBlockInputProps {
  block: WABlastMessageBlock;
  index: number;
  onUpdate: (index: number, updatedBlock: WABlastMessageBlock) => void;
  onRemove: (index: number) => void;
  excelColumns: string[];
  storedMessages: StoredMessage[];
  isBlastRunning: boolean;
}

/**
 * Helper function to apply text formatting
 */
const applyFormatting = (
  format: string,
  value: string,
  selectionStart: number,
  selectionEnd: number,
  url?: string // Tambahkan parameter url untuk tautan
) => {
  const selectedText = value.substring(selectionStart, selectionEnd);
  let formattedText = selectedText;
  let prefix = "";
  let suffix = "";
  // let newCursorStart = selectionStart; // Not used
  // let newCursorEnd = selectionEnd; // Not used

  const formats = {
    bold: { prefix: "*", suffix: "*" },
    italic: { prefix: "_", suffix: "_" },
    strikethrough: { prefix: "~", suffix: "~" },
    code: { prefix: "```", suffix: "```" },
    monospace: { prefix: "`", suffix: "`" },
  };

  if (format === "link") {
    // Logika untuk link sekarang ditangani oleh dialog, jadi URL akan langsung diberikan
    if (url) {
      formattedText = `[${selectedText || "Link"}](${url})`;
      // newCursorStart = selectionStart; // Not used
      // newCursorEnd = selectionStart + formattedText.length; // Not used
    } else {
      return value; // Jika URL null (batal), kembalikan nilai asli
    }
  } else {
    const { prefix: p, suffix: s } = formats[format as keyof typeof formats];
    prefix = p;
    suffix = s;

    if (
      selectedText.startsWith(prefix) &&
      selectedText.endsWith(suffix) &&
      selectedText.length > prefix.length + suffix.length
    ) {
      formattedText = selectedText.substring(
        prefix.length,
        selectedText.length - suffix.length
      );
      // newCursorStart = selectionStart; // Not used
      // newCursorEnd = selectionStart + formattedText.length; // Not used
    } else {
      formattedText = prefix + selectedText + suffix;
      // newCursorStart = selectionStart + prefix.length; // Not used
      // newCursorEnd = selectionStart + formattedText.length - suffix.length; // Not used
    }
  }

  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionEnd);
  return before + formattedText + after;
};

/**
 * Helper function to render formatted text with HTML for preview.
 * This function handles bold, italic, strikethrough, monospace, code, links,
 * and variable placeholders.
 */
const renderFormattedText = (text: string | undefined) => {
  if (!text) return null;

  let formattedText = text;
  // Bold
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  // Italic
  formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>");
  // Strikethrough
  formattedText = formattedText.replace(/~(.*?)~/g, "<del>$1</del>");
  // Code block (triple backticks)
  formattedText = formattedText.replace(
    /```(.*?)```/g,
    '<pre class="inline-code text-blue-400 bg-gray-700 p-0.5 rounded">$1</pre>'
  );
  // Monospace (single backtick)
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="inline-code text-blue-400 bg-gray-700 p-0.5 rounded">$1</code>'
  );
  // Links
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
  );
  // Variable placeholders
  formattedText = formattedText.replace(
    /\{\{(.*?)\}\}/g,
    '<span class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{{$1}}</span>'
  );

  return (
    <div
      dangerouslySetInnerHTML={{ __html: formattedText }}
      className="whitespace-pre-wrap break-words text-sm"
    />
  );
};

/**
 * Komponen untuk mengelola input satu blok pesan dalam fitur WA Blast.
 * Mendukung pesan teks dengan format (bold, italic, strikethrough, link, code, monospace),
 * penyisipan variabel dari Excel, pemuatan pesan tersimpan, dan opsi pesan acak.
 * Juga mendukung pesan media dengan caption.
 */
const MessageBlockInput: React.FC<MessageBlockInputProps> = ({
  block,
  index,
  onUpdate,
  onRemove,
  excelColumns,
  storedMessages,
  isBlastRunning,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref untuk textarea pesan teks
  const [history, setHistory] = useState<string[]>([]); // Menyimpan riwayat teks untuk fungsi undo
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // Indeks riwayat saat ini
  const [localTextMessage, setLocalTextMessage] = useState(
    block.textMessage || ""
  );
  const [showPreview, setShowPreview] = useState<boolean>(false); // State untuk mengontrol visibilitas preview

  // State untuk dialog URL
  const [showUrlInputDialog, setShowUrlInputDialog] = useState(false);
  const [urlInputDialogSelectedText, setUrlInputDialogSelectedText] =
    useState("");
  const [urlInputDialogSelectionRange, setUrlInputDialogSelectionRange] =
    useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (
      localTextMessage !== block.textMessage &&
      block.textMessage !== undefined
    ) {
      setLocalTextMessage(block.textMessage);
      setHistory([block.textMessage]);
      setHistoryIndex(0);
    } else if (block.textMessage === undefined && localTextMessage !== "") {
      setLocalTextMessage("");
      setHistory([""]);
      setHistoryIndex(0);
    }
  }, [block.textMessage, localTextMessage]);

  // Handle text change for the main textarea or random message textareas
  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    isRandomMessage: boolean = false,
    randomMsgIndex?: number
  ) => {
    const newValue = e.target.value;
    if (
      isRandomMessage &&
      randomMsgIndex !== undefined &&
      block.randomize &&
      block.randomMessageOptions
    ) {
      const newRandomOptions = [...block.randomMessageOptions];
      newRandomOptions[randomMsgIndex] = {
        ...newRandomOptions[randomMsgIndex],
        content: newValue,
      };
      onUpdate(index, { ...block, randomMessageOptions: newRandomOptions });
    } else {
      onUpdate(index, { ...block, textMessage: newValue });
    }

    // Update history only for the main text area for simplicity, or implement more complex history for random messages
    if (!isRandomMessage) {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevText = history[historyIndex - 1];
      onUpdate(index, { ...block, textMessage: prevText });
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleFormat = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    if (format === "link") {
      // Simpan selection dan buka dialog
      setUrlInputDialogSelectedText(currentText.substring(start, end));
      setUrlInputDialogSelectionRange({ start, end });
      setShowUrlInputDialog(true);
    } else {
      const newText = applyFormatting(format, currentText, start, end);
      onUpdate(index, { ...block, textMessage: newText });

      // Update history
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newText);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = newText; // Directly set value to update DOM
          textareaRef.current.setSelectionRange(start, end); // Keep selection or adjust
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleUrlInputConfirm = (url: string | null) => {
    setShowUrlInputDialog(false); // Tutup dialog
    if (url && urlInputDialogSelectionRange && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = urlInputDialogSelectionRange.start;
      const end = urlInputDialogSelectionRange.end;
      const currentText = textarea.value;

      const newText = applyFormatting("link", currentText, start, end, url);
      onUpdate(index, { ...block, textMessage: newText });

      // Update history
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newText);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = newText;
          textareaRef.current.setSelectionRange(start, end); // Keep selection or adjust
          textareaRef.current.focus();
        }
      }, 0);
    }
    setUrlInputDialogSelectionRange(null); // Reset range
    setUrlInputDialogSelectedText(""); // Reset selected text
  };

  const handleInsertVariable = (variable: string) => {
    if (!textareaRef.current) return; // Only apply to main textarea for now

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variablePlaceholder = `{{${variable}}}`;
    const newValue =
      textarea.value.substring(0, start) +
      variablePlaceholder +
      textarea.value.substring(end);
    onUpdate(index, { ...block, textMessage: newValue });

    // Update history
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variablePlaceholder.length,
        start + variablePlaceholder.length
      );
    }, 0);
  };

  const handleLoadStoredMessage = (messageId: string) => {
    const selectedMessage = storedMessages.find((msg) => msg.id === messageId);
    if (selectedMessage) {
      if (block.randomize) {
        // If randomize is active, add to randomMessageOptions
        onUpdate(index, {
          ...block,
          storedMessageId: undefined,
          randomMessageOptions: [
            ...(block.randomMessageOptions || []),
            {
              content: selectedMessage.content,
              selected: true,
              storedMessageId: selectedMessage.id,
            },
          ],
        });
      } else {
        // Otherwise, load into textMessage
        onUpdate(index, {
          ...block,
          textMessage: selectedMessage.content,
          storedMessageId: selectedMessage.id,
        });
      }
      toast.info(`Pesan '${selectedMessage.name}' dimuat.`);
    }
  };

  // Handler untuk input file media
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        onUpdate(index, {
          ...block,
          type: "media",
          mediaData: arrayBuffer, // Kirim ArrayBuffer
          mediaName: file.name, // Kirim nama file
          mediaType: file.type, // Kirim tipe MIME
        });
        toast.info(`File media '${file.name}' siap diunggah.`);
      };
      reader.readAsArrayBuffer(file); // Membaca file sebagai ArrayBuffer
    } else {
      // Jika file dihapus dari input
      onUpdate(index, {
        ...block,
        mediaData: undefined,
        mediaName: undefined,
        mediaType: undefined,
      });
    }
  };

  const handleRandomizeToggle = (checked: boolean) => {
    if (checked) {
      // When enabling randomize, move current textMessage to randomMessageOptions
      const initialRandomOptions = block.textMessage?.trim()
        ? [{ content: block.textMessage, selected: true }]
        : [];
      onUpdate(index, {
        ...block,
        randomize: true,
        textMessage: undefined, // Clear main textMessage
        randomMessageOptions: initialRandomOptions,
      });
    } else {
      // When disabling randomize, revert to single textMessage (if any selected random message exists)
      const firstSelectedRandomMessage =
        block.randomMessageOptions?.find((opt) => opt.selected)?.content || "";
      onUpdate(index, {
        ...block,
        randomize: false,
        textMessage: firstSelectedRandomMessage,
        randomMessageOptions: undefined, // Clear random options
      });
    }
  };

  const handleAddRandomMessageOption = () => {
    onUpdate(index, {
      ...block,
      randomMessageOptions: [
        ...(block.randomMessageOptions || []),
        { content: "", selected: true }, // Add an empty, selected message
      ],
    });
  };

  const handleUpdateRandomMessageOption = (
    randomMsgIndex: number,
    updatedContent: string
  ) => {
    const newRandomOptions = [...(block.randomMessageOptions || [])];
    if (newRandomOptions[randomMsgIndex]) {
      newRandomOptions[randomMsgIndex] = {
        ...newRandomOptions[randomMsgIndex],
        content: updatedContent,
      };
      onUpdate(index, { ...block, randomMessageOptions: newRandomOptions });
    }
  };

  const handleToggleRandomMessageSelection = (
    randomMsgIndex: number,
    checked: boolean
  ) => {
    const newRandomOptions = [...(block.randomMessageOptions || [])];
    if (newRandomOptions[randomMsgIndex]) {
      newRandomOptions[randomMsgIndex] = {
        ...newRandomOptions[randomMsgIndex],
        selected: checked,
      };
      onUpdate(index, { ...block, randomMessageOptions: newRandomOptions });
    }
  };

  const handleRemoveRandomMessageOption = (randomMsgIndex: number) => {
    onUpdate(index, {
      ...block,
      randomMessageOptions: (block.randomMessageOptions || []).filter(
        (_, i) => i !== randomMsgIndex
      ),
    });
  };

  // Determine the text to preview based on block type and randomize setting
  const textToPreview =
    block.type === "text" && !block.randomize
      ? block.textMessage
      : block.type === "media"
      ? block.textMessage
      : ""; // Media caption or empty for randomized

  return (
    <Card className="border p-4 space-y-3 rounded-md bg-secondary/20 relative">
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 z-10"
        onClick={() => onRemove(index)}
        disabled={isBlastRunning}
      >
        <MinusCircle className="h-4 w-4" />
      </Button>
      <div className="flex items-center space-x-2 mb-2">
        <Label htmlFor={`message-type-${block.id}`}>Tipe Pesan:</Label>
        <Select
          value={block.type}
          onValueChange={(value) =>
            onUpdate(index, { ...block, type: value as WABlastMessageType })
          }
          disabled={isBlastRunning}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Teks</SelectItem>
            <SelectItem value="media">Media (Gambar/Video)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {block.type === "text" ? (
        <div className="space-y-2">
          <Label htmlFor={`message-text-${block.id}`}>Konten Pesan Teks:</Label>
          {/* Formatting buttons and selects */}
          <div className="flex flex-wrap gap-1 mb-2 items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("bold")}
              disabled={isBlastRunning || block.randomize}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("italic")}
              disabled={isBlastRunning || block.randomize}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("strikethrough")}
              disabled={isBlastRunning || block.randomize}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("code")}
              disabled={isBlastRunning || block.randomize}
            >
              ` `
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("monospace")}
              disabled={isBlastRunning || block.randomize}
            >
              `
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFormat("link")}
              disabled={isBlastRunning || block.randomize}
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              disabled={historyIndex <= 0 || isBlastRunning || block.randomize}
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            {/* Sisipkan Variabel Excel */}
            <Select
              onValueChange={handleInsertVariable}
              disabled={
                isBlastRunning || excelColumns.length === 0 || block.randomize
              }
            >
              <SelectTrigger className="w-[150px] ml-2">
                <SelectValue placeholder="Variabel..." />
              </SelectTrigger>
              <SelectContent>
                {excelColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Muat Pesan Tersimpan */}
            <Select
              onValueChange={handleLoadStoredMessage}
              disabled={isBlastRunning || storedMessages.length === 0}
            >
              <SelectTrigger className="w-[180px] ml-2">
                <SelectValue placeholder="Pesan Tersimpan..." />
              </SelectTrigger>
              <SelectContent>
                {storedMessages.length === 0 ? (
                  <p className="p-2 text-muted-foreground">
                    Tidak ada pesan tersimpan.
                  </p>
                ) : (
                  storedMessages.map((msg) => (
                    <SelectItem key={msg.id} value={msg.id}>
                      {msg.name} (Poin: {msg.points})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id={`randomize-message-${block.id}`}
              checked={block.randomize}
              onCheckedChange={handleRandomizeToggle}
              disabled={isBlastRunning}
            />
            <Label htmlFor={`randomize-message-${block.id}`}>
              Aktifkan Acak Pesan yang Akan Dikirim
            </Label>
          </div>

          {!block.randomize ? (
            <>
              <div className="flex flex-col gap-4 items-start">
                {/* tampilkan nama pesan tersimpan jika ada */}
                <div>
                  {block.storedMessageId && (
                    <p className="text-sm text-muted-foreground ml-2">
                      Pesan Tersimpan:{" "}
                      {
                        storedMessages.find(
                          (msg) => msg.id === block.storedMessageId
                        )?.name
                      }
                    </p>
                  )}

                  <Textarea
                    id={`message-text-${block.id}`}
                    ref={textareaRef}
                    value={block.textMessage}
                    onChange={handleTextChange}
                    rows={4}
                    placeholder="Ketik pesan Anda di sini. Gunakan *tebal*, _miring_, ~coret~, `monospace` untuk format. Contoh: *Halo*, _dunia_!"
                    disabled={isBlastRunning}
                    className="w-full flex-grow"
                  />
                </div>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isBlastRunning}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Sembunyikan Preview
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Lihat Preview
                    </>
                  )}
                </Button>
                {showPreview && textToPreview && (
                  <div className="flex-shrink-0 max-w-full sm:max-w-sm flex justify-end">
                    <div className="relative bg-green-600 text-white p-3 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-xs shadow-md break-words max-w-full">
                      {renderFormattedText(textToPreview)}
                    </div>
                  </div>
                )}
              </div>

              {showPreview && !textToPreview && (
                <p className="text-xs text-muted-foreground mt-2">
                  Ketik sesuatu untuk melihat preview.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Variabel akan diganti dengan data dari kolom Excel. Contoh:
                `Halo, {"{{ Nama }}!"}
              </p>
            </>
          ) : (
            <div className="space-y-2 pl-4 border-l-2 border-primary">
              <Label className="text-foreground">Pilih Pesan Acak:</Label>
              {(block.randomMessageOptions || []).map((opt, randomMsgIndex) => (
                <div key={randomMsgIndex} className="flex gap-2 items-center">
                  <Checkbox
                    id={`random-opt-${block.id}-${randomMsgIndex}`}
                    checked={opt.selected}
                    onCheckedChange={(checked) =>
                      handleToggleRandomMessageSelection(
                        randomMsgIndex,
                        checked as boolean
                      )
                    }
                    disabled={isBlastRunning}
                  />
                  <div>
                    {opt.storedMessageId && (
                      <p className="text-sm text-muted-foreground ml-2">
                        Pesan Tersimpan:{" "}
                        {
                          storedMessages.find(
                            (msg) => msg.id === opt.storedMessageId
                          )?.name
                        }
                      </p>
                    )}
                    <Textarea
                      value={opt.content}
                      onChange={(e) =>
                        handleUpdateRandomMessageOption(
                          randomMsgIndex,
                          e.target.value
                        )
                      }
                      rows={1}
                      placeholder={`Pesan acak ${randomMsgIndex + 1}`}
                      disabled={isBlastRunning}
                      className="flex-1"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleRemoveRandomMessageOption(randomMsgIndex)
                    }
                    disabled={isBlastRunning}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleAddRandomMessageOption}
                variant="outline"
                size="sm"
                disabled={isBlastRunning}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Pesan Acak
              </Button>
              <p className="text-xs text-muted-foreground">
                Satu pesan yang dipilih akan dikirim secara acak dari daftar ini
                untuk setiap penerima.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Media message type
        <div className="space-y-2">
          <Label htmlFor={`media-file-${block.id}`}>
            Lampirkan Media (Gambar/Video/Dokumen):
          </Label>
          <Input
            id={`media-file-${block.id}`}
            type="file"
            accept="image/*,video/*,application/pdf,audio/*,text/vcard,text/plain,text/csv,.csv,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z,.txt" // Added vcard for contacts
            onChange={handleMediaFileChange}
            disabled={isBlastRunning}
          />
          {block.mediaName && (
            <p className="text-sm text-muted-foreground">
              File dipilih: {block.mediaName} ({block.mediaType})
            </p>
          )}
          <Label htmlFor={`media-caption-${block.id}`}>
            Caption Media (Opsional):
          </Label>
          <Textarea
            id={`media-caption-${block.id}`}
            value={block.textMessage}
            onChange={handleTextChange}
            rows={2}
            placeholder="Ketik caption di sini. Gunakan variabel {{Nama}}."
            disabled={isBlastRunning}
          />
          {showPreview && textToPreview && (
            <div className="flex-shrink-0 max-w-full sm:max-w-sm flex justify-end mt-2">
              {" "}
              {/* max-w-sm here */}
              <div className="relative bg-green-600 text-white p-3 rounded-lg shadow-md break-words max-w-full">
                {renderFormattedText(textToPreview)}
                {/* Bubble tail at top-right */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-600 transform translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tr-sm"></div>
              </div>
            </div>
          )}
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isBlastRunning}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" /> Sembunyikan Preview Caption
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" /> Lihat Preview Caption
              </>
            )}
          </Button>
          {showPreview && !textToPreview && (
            <p className="text-xs text-muted-foreground mt-2">
              Ketik caption untuk melihat preview.
            </p>
          )}
        </div>
      )}

      {/* URL Input Dialog */}
      <UrlInputDialog
        isOpen={showUrlInputDialog}
        onClose={() => setShowUrlInputDialog(false)}
        onConfirm={handleUrlInputConfirm}
        initialUrl=""
        selectedText={urlInputDialogSelectedText}
      />
    </Card>
  );
};

export default MessageBlockInput;
