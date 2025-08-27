"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  connectWhatsappSocket,
  disconnectWhatsappSocket,
  reconnectWhatsappSocket,
} from "@/lib/whatsappSocket";
import { useUrlStore } from "@/stores/whatsapp/socketStore";

export function SocketConfigurator() {
  const [urlInput, setUrlInput] = useState("http://localhost:5000");

  const { url, setUrl } = useUrlStore();

  const handleSocketUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (urlInput.trim()) {
      try {
        new URL(urlInput);
        setUrl(urlInput);
        setUrlInput("");
      } catch {
        alert("Format URL Socket tidak valid.");
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Socket.IO</CardTitle>
          <CardDescription>
            Atur URL backend untuk koneksi real-time. Data ini akan tersimpan di
            perangkat Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSocketUrlSubmit}
            className="flex items-center gap-2"
          >
            <div className="w-full">
              <Label htmlFor="socket-url-input" className="sr-only">
                Socket URL
              </Label>
              <Input
                id="socket-url-input"
                type="url"
                placeholder="http://localhost:5000"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Simpan</Button>
          </form>
          <div className="p-4 bg-muted rounded-md mt-4">
            <p className="text-sm font-medium">URL Socket Tersimpan:</p>
            {url ? (
              <span className="text-lg font-mono text-purple-600 break-all">
                {url}
              </span>
            ) : (
              <span className="text-lg text-gray-500 italic">
                URL Socket.IO belum diatur.
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={connectWhatsappSocket} disabled={!url}>
            Connect
          </Button>
          <Button
            onClick={reconnectWhatsappSocket}
            disabled={!url}
            variant="outline"
          >
            Reconnect
          </Button>
          <Button
            onClick={disconnectWhatsappSocket}
            disabled={!url}
            variant="destructive"
          >
            Disconnect
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
