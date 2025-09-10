'use client';

import React from "react";
import { dummyBlastLogs } from "@/lib/dummy-data";
import { WABlastMessageLogEntry } from "@/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Pause,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PreviewWABlastMessagesTable = ({ data }: { data: WABlastMessageLogEntry[] }) => {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Penerima</TableHead>
            <TableHead>Pesan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell>{log.recipientPhoneNumber}</TableCell>
              <TableCell><div className="truncate max-w-xs">{log.messageContent}</div></TableCell>
              <TableCell>
                <Badge variant={log.status === "SENT" ? "default" : log.status === "FAILED" ? "destructive" : "outline"}
                  className={cn(
                    log.status === "SENT" && "bg-green-100 text-green-800",
                    log.status === "FAILED" && "bg-red-100 text-red-800",
                  )}
                >
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{log.error || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function PreviewBlastPage() {
  const progress = (dummyBlastLogs.filter(log => log.status !== 'FAILED').length / dummyBlastLogs.length) * 100;

  return (
    <Card className="w-full mx-auto rounded-lg shadow-none border-none">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4 border rounded-md p-4 bg-muted">
          <h3 className="text-lg font-semibold text-foreground">Pekerjaan WA Blast Aktif</h3>
            <Card className="p-3 border rounded-md shadow-md bg-primary/10">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="truncate flex-1 font-mono text-xs">job-123-preview</span>
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-600">
                  IN_PROGRESS
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Pengirim: marketing-01, sales-01</p>
              <Progress value={progress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {dummyBlastLogs.filter(log => log.status !== 'FAILED').length}/{dummyBlastLogs.length} Penerima
              </p>
            </Card>
        </div>

        <div className="flex gap-2 w-full">
            <Button variant="secondary" className="flex-grow" disabled>
              <Pause className="mr-2 h-4 w-4" /> Jeda Blast
            </Button>
            <Button variant="destructive" disabled>
              <StopCircle className="h-4 w-4" />
            </Button>
        </div>

        <Alert variant="default">
          <AlertTitle>Status Pekerjaan</AlertTitle>
          <AlertDescription>Mengirim pesan... Jeda acak antara 2-5 detik.</AlertDescription>
        </Alert>

        <div className="border rounded-lg overflow-hidden">
          <PreviewWABlastMessagesTable data={dummyBlastLogs} />
        </div>
      </CardContent>
    </Card>
  );
}
