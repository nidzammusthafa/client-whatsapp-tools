'use client';

import React from "react";
import { dummyWarmerLogs } from "@/lib/dummy-data";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PreviewWarmerPage() {
  return (
    <Card className="w-full mx-auto rounded-lg shadow-none border-none">
      <CardContent className="p-6 space-y-4">
        <Alert>
          <AlertTitle>Log Pemanasan Akun</AlertTitle>
          <AlertDescription>
            Menampilkan simulasi percakapan otomatis antar akun yang terhubung untuk membangun reputasi.
          </AlertDescription>
        </Alert>
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pengirim</TableHead>
                        <TableHead>Penerima</TableHead>
                        <TableHead>Pesan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dummyWarmerLogs.map((log, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell className="font-medium">{log.senderAccountIds[0]}</TableCell>
                            <TableCell className="font-medium">{log.recipientAccountId}</TableCell>
                            <TableCell>{log.messageContent}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
