# Rencana Implementasi Backend — Konfigurasi Filter Penerima WA Blast

## 1. Ringkasan Eksekutif
- **Latar belakang**: Saat ini setiap WA Blast job otomatis melewati nomor yang sudah ada di tabel `address`. Pemilik produk ingin dapat mematikan filter tersebut per job.
- **Solusi**: Menambahkan flag boolean `skipRecipientsInAddress` yang tersimpan persisten pada `BlastJob` dan dihormati ketika job dieksekusi maupun dipulihkan pasca restart.
- **Prioritas**: Tinggi, karena berhubungan langsung dengan fleksibilitas pengiriman pesan massal dan menjadi prasyarat ekspansi filter lanjutan.

## 2. Tujuan & Keberhasilan
- Perilaku default (skip nomor yang sudah terdaftar) tetap berjalan untuk klien lama yang belum mengirim flag.
- Backend menerima, menyimpan, memuat ulang, dan mengeksekusi `skipRecipientsInAddress` secara konsisten.
- Tersedia logging dan telemetry yang cukup untuk audit apakah job mengaktifkan atau menonaktifkan filter.
- Pengujian mencakup skenario utama (skip aktif vs nonaktif) tanpa regresi terhadap fitur pause/resume/stop.

## 3. Ruang Lingkup
- **Termasuk**:
  - Pembaruan skema Prisma + migrasi database.
  - Penyesuaian tipe domain (model, DTO, payload Socket.IO/REST) yang berkaitan dengan WA Blast job.
  - Penyesuaian alur penyimpanan/pemuatan job (state manager, storage layer) dan eksekutor.
  - Validasi payload dan fallback nilai default di seluruh entry point.
  - Dokumentasi perubahan untuk sinkronisasi dengan frontend (Next.js 15).
- **Tidak Termasuk**:
  - Perubahan filter lain (label, segmentasi) di luar boolean baru.
  - Pembersihan data historis manual selain default migrasi.
  - Perubahan UI; hanya catatan koordinasi untuk tim frontend.

## 4. Asumsi & Ketergantungan
- Migrasi database dapat dijalankan sebelum deploy backend baru (akses ke lingkungan staging dan produksi tersedia).
- Backend menggunakan Prisma dan storage WA Blast mengikuti struktur yang dijelaskan pada dokumentasi internal (`jobInitializer.ts`, `waBlastState.ts`, `jobExecutor.ts`).
- Frontend saat ini mengandalkan event Socket.IO seperti `whatsapp-start-blast`, `whatsapp-blast-progress`, dan payload `StartWABlastPayload`.
- Infrastruktur logging saat ini sudah menangkap log `SKIPPED` pada eksekusi job.

## 5. Identifikasi Risiko
- **Migrasi**: Kegagalan migrasi atau kolom tidak tersinkron dapat menyebabkan server crash saat akses kolom baru.
- **Persistensi lama**: Job lama yang dipulihkan bisa mengandung nilai `null`/`undefined`; perlu fallback ke `true`.
- **API kontrak**: Endpoint atau socket handler yang lupa mem-forward flag mengakibatkan inkonsistensi eksekusi.
- **Testing**: Tanpa uji integrasi, bisa terjadi regressi misalnya job tidak skip padahal diharapkan.

## 6. Peta Kerja Teknis

### 6.1 Database & Schema
- Update `prisma/schema.prisma` pada model `BlastJob`:
  ```prisma
  skipRecipientsInAddress Boolean @default(true)
  ```
- Generate migrasi `add_skip_recipients_flag` dan jalankan `npx prisma migrate dev`.
- Perbarui seed/test fixture agar menyertakan nilai default `true`.
- Dokumentasikan langkah migrasi untuk deployment (termasuk command untuk environment produksi).

### 6.2 Lapisan Domain & Tipe Data
- `src/types/jobs/blast.ts` (atau modul sejenis pada backend):
  - Tambahkan `skipRecipientsInAddress: boolean` pada tipe job dan payload start.
  - Terapkan fallback `payload.skipRecipientsInAddress ?? true` saat parsing request (REST/SSE/Socket).
- Pastikan tipe internal lain (mis. `WABlastProgressUpdate`, DTO untuk `getWABlastJobStatus`) juga memasukkan flag.

### 6.3 Entry Point (Socket.IO / REST Handler)
- Endpoint REST `POST /api/whatsapp/blast/start` dan event Socket.IO `whatsapp-start-blast` wajib menerima properti `skipRecipientsInAddress` (selaras dengan panduan frontend terbaru).
- `src/sockets/handlers/blastHandler.ts`: terima flag dari client, validasi boolean, tetapkan default `true` bila undefined.
- Pastikan event lain (`editWABlastJob`, `resumeWABlastJob`) juga mem-forward flag yang tersimpan.
- Perbarui serialization ketika mengirim job ke frontend (mis. event `whatsapp-blast-job-for-edit`).

### 6.4 State Manager & Persistensi
- `waBlastState.ts`:
  - Update `setWABlastJob` agar menulis flag pada operasi `create` dan `update`.
  - Pastikan state yang dipulihkan (`loadPersistentWABlastJobs`) mengisi `skipRecipientsInAddress` dengan `true` jika field absen.
- `jobInitializer.ts`: simpan flag saat membuat job baru dan saat memuat ulang dari DB.
- `jobManager` / `editWABlastJob`: sertakan flag agar update job tidak menghilangkan nilai sebelumnya.

### 6.5 Eksekusi Job
- `jobExecutor.ts`:
  - Gunakan kondisi `if (job.skipRecipientsInAddress && existingAddressNumbers.has(phoneNumber))` sebelum men-skip.
  - Ketika flag `false`, pastikan nomor tetap diproses dan logging memperlihatkan bahwa filter dimatikan.
  - Tambahkan metadata log (mis. `skipRecipientsInAddress=<bool>`) agar mudah diinspeksi.

### 6.6 Observabilitas & Logging
- Perbarui log `SKIPPED` agar menyertakan alasan (flag aktif).
- Tambahkan log informatif ketika flag `false` tetapi nomor sudah ada di address untuk membantu QA mendeteksi spam potensial.
- Jika ada dashboard/metric, pertimbangkan counter `blast_skipped_recipients` dengan tag flag.

### 6.7 Dokumentasi & Komunikasi
- Tambahkan catatan pada README/CHANGELOG backend mengenai flag baru dan default-nya.
- Integrasikan panduan resmi “Panduan Frontend: Dukungan `skipRecipientsInAddress` pada WA Blast” agar frontend mengikuti kontrak payload terbaru.
- Informasikan QA mengenai skenario uji yang wajib dilakukan.

## 7. Rencana Pengujian
- **Manual / Integrasi**:
  1. Buat job dengan sebagian nomor sudah ada di `address`, flag `true` → catatan `SKIPPED` muncul, pesan tidak dikirim ulang.
  2. Job dengan flag `false` → nomor tetap terkirim, log menandakan filter dimatikan.
  3. Pastikan pause/resume/stop berfungsi untuk kedua mode.
  4. Restart server (memicu load persistensi) → job lama dengan flag `undefined` harus tetap skip (`true`).
- **Automasi (opsional)**:
  - Unit test untuk util filter jika ada.
  - Test integration/service yang mensimulasikan eksekusi job dengan `skipRecipientsInAddress` `true/false`.
- **Database**:
  - Verifikasi migrasi menambah kolom boolean dengan default `true` pada tabel `blastJob`.
  - Pastikan query read/write Prisma tetap berhasil tanpa cast manual.

## 8. Strategi Deploy & Rollback
- Jalankan migrasi database pada staging → smoke test.
- Deploy backend yang sudah mendukung flag → jalankan regresi QA.
- Setelah stabil, mintalah frontend mengaktifkan togglenya pada UI.
- **Rollback plan**:
  - Jika backend perlu di-rollback, kolom baru tetap aman karena default `true`; pastikan versi lama mengabaikan kolom ekstra.

## 9. Timeline Usulan
- **Hari 1-2**: Update schema Prisma, migrasi, tipe data, handler payload.
- **Hari 3**: Penyesuaian state manager dan eksekutor + logging.
- **Hari 4**: Pengujian manual terpandu, dokumentasi, koordinasi QA.
- **Hari 5**: Deploy staging, validasi, siapkan rollout produksi.

## 10. Checklist Deliverable
- [ ] Kolom `skipRecipientsInAddress` tersedia di database dengan default `true`.
- [ ] Semua path pembuatan/penyuntingan job menyimpan flag.
- [ ] Endpoint REST `POST /api/whatsapp/blast/start` dan event Socket.IO `whatsapp-start-blast` sudah mem-forward flag secara konsisten.
- [ ] Default fallback `true` diterapkan saat data lama dimuat.
- [ ] Eksekutor menghormati flag dan logging sudah diperbarui.
- [ ] Dokumen koordinasi frontend/QA selesai.
- [ ] Skrip migrasi dan instruksi deploy terdokumentasi.

## 11. Pertanyaan Terbuka
- Apakah ada endpoint REST selain Socket.IO yang perlu disesuaikan? (konfirmasi bila API digunakan oleh integrasi pihak ketiga).
- Apakah perlu audit trail khusus ketika flag dimatikan (mis. untuk kepatuhan)?
- Apakah ada batasan jumlah nomor yang boleh dikirim ulang saat filter dimatikan (rate limiting tambahan)?

---

**Referensi**:
- Dokumentasi internal “Rencana Pengembangan: Pengaturan Filter Nomor Penerima pada WA Blast Job”.
- Dokumen backend “Panduan Frontend: Dukungan `skipRecipientsInAddress` pada WA Blast”.
