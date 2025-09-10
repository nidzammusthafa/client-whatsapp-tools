'use client';

import React from "react";
import { dummyContacts, dummyTemplates } from "@/lib/dummy-data";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Star,
} from "lucide-react";

export default function PreviewManagementPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-card">
      {/* Contact Management */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Manajemen Kontak</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Nomor Telepon</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell><div className="truncate max-w-xs">{contact.address}</div></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="icon" disabled><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" disabled><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Template Management */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Manajemen Template Pesan</h3>
        <div className="space-y-3">
          {dummyTemplates.map((template) => (
            <Card key={template.id} className="hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{template.name}</p>
                        <p className="text-sm text-muted-foreground italic mt-1">“{template.content}”</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{template.points}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
