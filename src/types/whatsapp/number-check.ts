/**
 * Definisi tipe terkait pengecekan nomor WhatsApp.
 */

import { Socket } from "socket.io-client";
import { ExcelRow } from "../common";

/**
 * Definisi tipe untuk status nomor WhatsApp.
 */
export type WhatsAppNumberStatus = "active" | "inactive" | "unknown" | "error";

/**
 * Interface untuk hasil pengecekan satu nomor WhatsApp.
 */
export interface WhatsAppNumberCheckResult {
  id?: string; // ID unik untuk hasil ini (UUID)
  jobId: string; // ID pekerjaan yang menghasilkan hasil ini
  phoneNumber: string;
  status: WhatsAppNumberStatus;
  originalData: ExcelRow; // Tambahkan properti ini
}

/**
 * Status pekerjaan pengecekan nomor.
 */
export type NumberCheckJobStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

/**
 * Interface untuk update progress pekerjaan pengecekan nomor.
 */
export interface NumberCheckProgressUpdate {
  jobId: string;
  current: number;
  total: number;
  status: NumberCheckJobStatus;
  message: string;
}

/**
 * Definisi tipe untuk pekerjaan pengecekan nomor di backend (representasi in-memory).
 * Ini mencerminkan model Prisma `NumberCheckJob` dan menambahkan properti runtime.
 */
export interface NumberCheckJob {
  // Properti dari model Prisma NumberCheckJob
  id?: string; // BARU: ID internal Prisma (UUID), opsional karena mungkin belum ada saat pembuatan awal
  jobId: string;
  excelRows: ExcelRow[]; // excelData di Prisma, excelRows di TypeScript
  phoneNumberColumn: string;
  minDelayMs: number;
  maxDelayMs: number;
  delayAfterNNumbers: number;
  availableClientIds: string[]; // Json di Prisma, string[] di TypeScript
  status: NumberCheckJobStatus;
  currentProgress: number;
  totalNumbers: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  currentClientIndex: number;

  // Properti runtime
  initiatingSocket: Socket; // Socket yang memulai pekerjaan
  abortController: AbortController; // Untuk membatalkan/menghentikan proses
  pausePromise: Promise<void> | null; // Promise yang akan di-resolve saat resume
  resolvePause: (() => void) | null; // Fungsi untuk me-resolve pausePromise
  results?: WhatsAppNumberCheckResult[]; // BARU: Hasil pengecekan historis untuk job ini
}
