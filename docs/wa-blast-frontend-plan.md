# Rencana Implementasi Frontend — Dukungan Flag `skipRecipientsInAddress`

## 1. Latar Belakang
- Backend telah menambahkan flag boolean `skipRecipientsInAddress` pada WA Blast job untuk mengatur apakah nomor penerima yang sudah tercatat di tabel Address harus dilewati.
- Dokumentasi Socket.IO dan REST (lihat `docs/swagger-api.yaml` khususnya contoh event `whatsapp-start-blast` di sekitar baris 2171) menunjukkan bahwa properti baru ini wajib dikirim klien.
- Frontend (Next.js 15, App Router, TypeScript) perlu menyediakan kontrol UI, menyimpan nilai flag, dan memastikan payload ke backend sudah sesuai agar perilaku baru dapat digunakan operator.

## 2. Tujuan
- Menyediakan toggle/checkbox “Lewati penerima yang sudah ada di Address” dengan default aktif (`true`) agar perilaku lama tetap terjaga.
- Memastikan semua jalur pengiriman payload (`socket.emit("whatsapp-start-blast")`, fallback REST `POST /api/whatsapp/blast/start`, aksi edit/resume) menyertakan `skipRecipientsInAddress`.
- Meng-update state manager, hooks, dan tipe TypeScript agar flag tersimpan konsisten di seluruh siklus hidup job (buat, edit, tampilkan status).
- Menambahkan validasi dan fallback defensif `true` untuk payload lama agar kompatibel dengan data historis.

## 3. Ruang Lingkup
- **Termasuk**
  - Pembaruan tipe data di `src/types/whatsapp/payload.ts`, `src/types/whatsapp/blast.ts`, serta tipe store terkait.
  - Penyesuaian store Zustand (`src/stores/whatsapp/waBlastManager.ts`) dan hooks (`src/hooks/useWhatsappManager.ts`, `src/components/whatsApp/whatsappBlast/hooks/*`) agar menyimpan flag.
  - Update komponen UI form WA Blast (mis. `src/components/whatsApp/whatsappBlast/WABlastForm.tsx`, `WaBlastJobControls.tsx`, dan modul terkait) untuk menampilkan kontrol toggle.
  - Penyesuaian integrasi REST/Socket util (mis. `src/lib/whatsappSocket.ts` atau helper lain) untuk mengirim flag setiap kali job dimulai/diedit.
  - Update tampilan status/progress (sidebar job list, detail panel) agar menampilkan flag sebagai metadata.
  - Dokumentasi pada README/CHANGELOG (jika tersedia) mengenai flag baru ini.
- **Tidak Termasuk**
  - Perombakan UX besar di luar penambahan toggle.
  - Pengubahan logika filter lain (label/segmentasi).
  - Penanganan data historis di backend (sudah ditangani server).

## 4. Referensi API
- `docs/swagger-api.yaml`: event `whatsapp-start-blast` (client -> server) mensyaratkan `skipRecipientsInAddress: boolean`.
- Endpoint REST fallback `POST /api/whatsapp/blast/start` menggunakan payload `StartWABlastPayload` dengan field baru yang sama.
- Event lain seperti `whatsapp-blast-job-for-edit`, `whatsapp-blast-progress`, dan `whatsapp-blast-all-jobs` diharapkan menyertakan flag agar frontend bisa memuat status terkini.

## 5. Rencana Teknis

### 5.1 Tipe & Validasi
- `src/types/whatsapp/payload.ts`:
  - Tambahkan properti `skipRecipientsInAddress: boolean;` pada `StartWABlastPayload`.
  - Jika ada tipe lain (mis. `StartWABlastPayloadInput`), sesuaikan.
- `src/types/whatsapp/blast.ts`:
  - Update `WABlastProgressUpdate`, `WABlastJob`, dan log entry agar menyertakan flag bila relevan.
- `src/types/store/waBlastState.ts` dan tipe store lain:
  - Tambahkan flag pada `WaBlastState`/`WaBlastActions` jika memerlukan state form default.
- Validasi form (React Hook Form/Zod) harus mengenali boolean, default `true`, dan fallback `true` ketika data kosong.

### 5.2 State Manager & Hooks
- `src/stores/whatsapp/waBlastManager.ts`:
  - Tambahkan state global untuk `skipRecipientsInAddress` (default `true`) bila disimpan di store atau gunakan form lokal.
  - Pastikan `startWABlast` memasukkan flag saat membangun payload dan menulis state awal job.
  - Update `updateWaBlastJobStatus`, `setWaBlastJobs`, dan `addWABlastMessageLogEntry` untuk mempertahankan flag ketika menerima data dari server.
  - Sesuaikan handler `loadWaBlastJobs` & `removeWaBlastJob` bila ada pengolahan metadata job.
- `src/hooks/useWhatsappManager.ts` dan hooks WA Blast lainnya:
  - Pastikan data yang diterima dari socket disimpan beserta flag.
  - Saat menyusun payload edit/resume, ikut sertakan flag dari state.

### 5.3 UI & Form
- Komponen form WA Blast (mis. `src/components/whatsApp/whatsappBlast/WABlastForm.tsx` atau `hooks/useWABlastForm.ts`) perlu:
  - Menambahkan kontrol toggle dengan label rekomendasi backend (“Lewati penerima yang sudah ada di Address”).
  - Default toggle aktif (`true`), dengan bantuan tooltip/description yang menjelaskan konsekuensi mematikannya.
  - Memasukkan flag ke state form dan ke payload ketika menekan tombol start/edit.
- Update tampilan ringkasan/panel status (mis. `WaBlastJobCard`, `WABlastJobList`, dsb.) untuk menampilkan status filter agar user tahu job mana yang mengirim ulang penerima.

### 5.4 Integrasi Socket/REST
- `src/lib/whatsappSocket.ts` atau util sejenis:
  - Saat memanggil socket emit `whatsapp-start-blast`, pastikan payload mencakup `skipRecipientsInAddress`, menggunakan fallback `payload.skipRecipientsInAddress ?? true` sesuai rekomendasi backend.
- Jika ada API client untuk REST (mis. `fetch("/api/whatsapp/blast/start")`), sertakan flag dalam body request.
- Pastikan event listener `whatsapp-blast-job-for-edit`/`whatsapp-blast-progress` mem-parse flag lalu menyalurkannya ke store/hook.

### 5.5 Tampilan Status & Logging UI
- Sesuaikan UI yang menampilkan log pengiriman (mis. tabel `messages`, detail job) untuk menambahkan informasi apakah nomor dilewati karena flag aktif (opsional, jika backend mengirim metadata).
- Tampilkan badge atau tag (mis. “Filter Address: Aktif/Nonaktif”) agar operator memahami dampak konfigurasi job tersebut.

### 5.6 Dokumentasi & Communication
- Tambahkan catatan pada README atau dokumentasi internal tim frontend tentang toggle baru, default, dan konsekuensinya.
- Update changelog (jika ada) agar QA mengetahui adanya kontrol baru yang perlu diuji.
- Sinkronkan wording label dengan tim produk/CS untuk konsistensi terminologi.

## 6. Rencana Pengujian
- **Manual**
  1. Jalankan form WA Blast dengan toggle aktif → verifikasi via devtools bahwa payload mengirim `skipRecipientsInAddress: true` dan backend menampilkan penerima existing sebagai `SKIPPED`.
  2. Matikan toggle → verifikasi payload `false`, backend tetap mengirim pesan ke nomor existing, UI log menampilkan status sesuai.
  3. Uji edit job: buka job untuk diedit, pastikan toggle menampilkan nilai yang tersimpan dan payload edit/resume mengirim flag yang sama.
  4. Refresh halaman (memicu load job dari socket) → flag pada job-card/detail harus konsisten.
  5. Regression: jalankan skenario job lama tanpa menyentuh toggle untuk memastikan default `true` tetap digunakan.
- **Automasi (opsional)**
  - Tes unit pada hook/form untuk memastikan default state `true` dan toggle update state dengan benar.
  - Snapshot test pada komponen form jika UI banyak berubah.

## 7. Timeline Usulan
- **Hari 1**: Update tipe, store, dan hooks; implementasi toggle dasar pada form.
- **Hari 2**: Integrasi socket/REST, update tampilan status, dokumentasi internal.
- **Hari 3**: Pengujian manual, perbaikan bug, review kode, persiapan release.

## 8. Checklist Implementasi
- [ ] `StartWABlastPayload` dan tipe terkait memuat `skipRecipientsInAddress`.
- [ ] Store, hooks, dan state WA Blast menyimpan flag dari server dan dari UI.
- [ ] Form WA Blast menyediakan toggle default `true` dan mengikatnya ke payload start/edit.
- [ ] Payload Socket.IO dan REST selalu mengirim flag dengan fallback `true`.
- [ ] UI status menampilkan informasi filter agar operator aware.
- [ ] Dokumentasi frontend dan changelog diperbarui.
- [ ] Scenario testing (toggle on/off, edit, reload, regression) selesai.

## 9. Pertanyaan Terbuka
- Apakah UI perlu menampilkan warning tambahan saat filter dimatikan (mis. risiko spam)?
- Apakah log detail dari backend sudah memuat informasi cukup untuk ditampilkan langsung, atau perlu transformasi khusus di frontend?
- Apakah perlu kontrol serupa pada template blast lain (mis. import dari file templated) untuk konsistensi?

---

**Referensi**:
- `docs/swagger-api.yaml` — dokumentasi Socket.IO event `whatsapp-start-blast` (baris ~2171) dengan contoh payload berisi `skipRecipientsInAddress`.
- Dokumen backend “Panduan Frontend: Dukungan `skipRecipientsInAddress` pada WA Blast”.
