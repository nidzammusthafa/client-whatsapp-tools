import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Trash2,
  Save,
  Edit,
  Eye, // Import Eye icon
  EyeOff, // Import EyeOff icon
  Bold,
  Italic,
  Strikethrough,
  Link,
  Undo2,
} from "lucide-react";
import { StoredMessage } from "@/types";
import UrlInputDialog from "./UrlInputDialog";
import { useWhatsAppStore } from "@/stores/whatsapp";

/**
 * Helper function to apply text formatting
 * (Copied from MessageBlockInput for now, consider moving to a shared util)
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

  const formats = {
    bold: { prefix: "*", suffix: "*" },
    italic: { prefix: "_", suffix: "_" },
    strikethrough: { prefix: "~", suffix: "~" },
    code: { prefix: "```", suffix: "```" },
    monospace: { prefix: "`", suffix: "`" },
  };

  if (format === "link") {
    if (url) {
      formattedText = `[${selectedText || "Link"}](${url})`;
    } else {
      return value;
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
    } else {
      formattedText = prefix + selectedText + suffix;
    }
  }

  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionEnd);
  return before + formattedText + after;
};

/**
 * Helper function to render formatted text with HTML for preview.
 * (Copied from MessageBlockInput for now, consider moving to a shared util)
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
  // Variable placeholders (if any, though less common in stored messages unless for templates)
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
 * Komponen untuk mengelola pesan yang tersimpan (Stored Messages).
 * Memungkinkan pengguna untuk menyimpan, melihat, mengedit, dan menghapus pesan.
 */
const StoredMessageManagement: React.FC = () => {
  const {
    storedMessages,
    loadStoredMessages,
    saveNewStoredMessage,
    deleteExistingStoredMessage,
    updateExistingStoredMessage, // New action needed
  } = useWhatsAppStore();

  const [messageName, setMessageName] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null); // Ref for the main textarea

  // State untuk preview pesan
  const [previewText, setPreviewText] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // State untuk dialog URL
  const [showUrlInputDialog, setShowUrlInputDialog] = useState(false);
  const [urlInputDialogSelectedText, setUrlInputDialogSelectedText] =
    useState("");
  const [urlInputDialogSelectionRange, setUrlInputDialogSelectionRange] =
    useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    loadStoredMessages(); // Muat pesan saat komponen dimuat
  }, [loadStoredMessages]);

  useEffect(() => {
    // Update previewText whenever messageContent changes
    setPreviewText(messageContent);
  }, [messageContent]);

  const handleSaveMessage = async () => {
    if (!messageName.trim() || !messageContent.trim()) {
      toast.error("Nama dan konten pesan tidak boleh kosong.");
      return;
    }

    try {
      if (editingMessageId) {
        await updateExistingStoredMessage(
          editingMessageId,
          messageName,
          messageContent
        );
        toast.success(`Pesan '${messageName}' berhasil diperbarui.`);
      } else {
        await saveNewStoredMessage(messageName, messageContent);
        toast.success(`Pesan '${messageName}' berhasil disimpan.`);
      }
      setMessageName("");
      setMessageContent("");
      setEditingMessageId(null);
      setShowPreview(false); // Sembunyikan preview setelah menyimpan
      loadStoredMessages(); // Muat ulang daftar pesan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pesan.");
    }
  };

  const handleEditMessage = (message: StoredMessage) => {
    setEditingMessageId(message.id);
    setMessageName(message.name);
    setMessageContent(message.content);
    setShowPreview(true); // Tampilkan preview saat mengedit
  };

  const handleDeleteMessage = async (id: string) => {
    // Mengganti window.confirm dengan dialog kustom atau konfirmasi di UI jika diperlukan
    // Untuk saat ini, asumsikan konfirmasi dilakukan di komponen induk jika ada
    try {
      await deleteExistingStoredMessage(id);
      toast.success("Pesan berhasil dihapus.");
      loadStoredMessages(); // Muat ulang daftar pesan
      // Jika pesan yang diedit dihapus, reset form
      if (editingMessageId === id) {
        setMessageName("");
        setMessageContent("");
        setEditingMessageId(null);
        setShowPreview(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pesan.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessageName("");
    setMessageContent("");
    setShowPreview(false);
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
      setMessageContent(newText); // Update local state
      setPreviewText(newText); // Update preview text

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
      setMessageContent(newText); // Update local state
      setPreviewText(newText); // Update preview text

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingMessageId ? "Edit Pesan Tersimpan" : "Simpan Pesan Baru"}
          </CardTitle>
          <CardDescription>
            {editingMessageId
              ? "Perbarui nama dan konten pesan yang sudah ada."
              : "Simpan pesan untuk digunakan kembali di fitur blast."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-name">Nama Pesan</Label>
            <Input
              id="message-name"
              placeholder="Misal: Pesan Pembuka Promosi"
              value={messageName}
              onChange={(e) => setMessageName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message-content">Konten Pesan</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("strikethrough")}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("code")}
              >
                ` `
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("monospace")}
              >
                `
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFormat("link")}
              >
                <Link className="h-4 w-4" />
              </Button>
              {/* Undo button for content */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  /* Implement undo for this textarea if needed */
                }}
                disabled={true}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <Textarea
                id="message-content"
                ref={textareaRef}
                placeholder="Ketik pesan Anda di sini. Gunakan *tebal*, _miring_, ~coret~, `monospace` untuk format. Contoh: *Halo*, _dunia_!"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                className="w-full flex-grow"
              />
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                size="sm"
                className="mt-2"
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
              {showPreview && previewText.trim() !== "" && (
                <div className="flex-shrink-0 max-w-full sm:max-w-sm flex justify-end">
                  <div className="relative bg-green-600 p-3 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-xs shadow-md break-words max-w-full">
                    {renderFormattedText(previewText)}
                  </div>
                </div>
              )}
            </div>
            {showPreview && previewText.trim() === "" && (
              <p className="text-xs text-muted-foreground mt-2">
                Ketik sesuatu untuk melihat preview.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveMessage} className="flex-grow">
              <Save className="mr-2 h-4 w-4" />{" "}
              {editingMessageId ? "Perbarui Pesan" : "Simpan Pesan"}
            </Button>
            {editingMessageId && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-grow"
              >
                Batal Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesan Tersimpan</CardTitle>
          <CardDescription>
            Pesan-pesan ini dapat dipilih saat mengonfigurasi blok pesan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storedMessages.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada pesan tersimpan.</p>
          ) : (
            <div className="space-y-3">
              {storedMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-background"
                >
                  <div>
                    <p className="font-semibold">{message.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMessage(message)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Input Dialog */}
      <UrlInputDialog
        isOpen={showUrlInputDialog}
        onClose={() => setShowUrlInputDialog(false)}
        onConfirm={handleUrlInputConfirm}
        initialUrl=""
        selectedText={urlInputDialogSelectedText}
      />
    </div>
  );
};

export default StoredMessageManagement;
