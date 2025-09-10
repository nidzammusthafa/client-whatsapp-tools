'use client';

import React from "react";
import { dummyNumberCheckResults } from "@/lib/dummy-data";
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
import {
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PreviewCheckerPage() {
  return (
    <Card className="w-full mx-auto rounded-lg shadow-none border-none">
      <CardContent className="p-6 space-y-4">
        <Alert>
          <AlertTitle>Hasil Pemeriksaan Nomor</AlertTitle>
          <AlertDescription>
            Menampilkan hasil validasi nomor telepon untuk memastikan nomor aktif digunakan di WhatsApp.
          </AlertDescription>
        </Alert>
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nomor Telepon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Nama (dari Excel)</TableHead>
                        <TableHead>Kota (dari Excel)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dummyNumberCheckResults.map((result, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-mono">{result.phoneNumber}</TableCell>
                            <TableCell>
                                <div className={cn("flex items-center gap-2 font-semibold",
                                    result.status === 'active' ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {result.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {result.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                </div>
                            </TableCell>
                            <TableCell>{String(result.originalData.Nama ?? "")}</TableCell>
                            <TableCell>{String(result.originalData.Kota ?? "")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
