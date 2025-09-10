Tentu, saya mengerti. Anda ingin membuat sebuah halaman "etalase" atau pratinjau yang menampilkan semua kecanggihan aplikasi ini dalam satu tempat, menggunakan komponen asli namun dalam mode "baca-saja" (read-only) dan diisi dengan data dummy agar terlihat hidup. Ini adalah ide yang sangat bagus untuk menarik calon pembeli.

Berdasarkan permintaan Anda dan analisis `README.md`, berikut adalah spesifikasi dan rencana implementasi untuk halaman dasbor pratinjau tersebut.

---

### **Spesifikasi Dasbor Pratinjau (Preview Dashboard)**

**1. Tujuan Halaman:**
Membuat satu halaman tunggal (misalnya di `/preview`) yang berfungsi sebagai tur visual interaktif dari keseluruhan aplikasi. Halaman ini akan menampilkan semua komponen UI utama dari setiap fitur, diisi dengan data dummy yang realistis untuk memberikan gambaran nyata tentang kemampuan dan tampilan aplikasi.

**2. Perilaku & Interaktivitas:**

- **Mode Baca-Saja:** Semua elemen fungsional seperti tombol, input, dan link akan **dinonaktifkan**. Pengguna tidak dapat mengklik tombol, mengetik di input, atau memicu aksi apa pun.
- **Efek Hover Tetap Aktif:** Untuk menunjukkan kualitas dan polesan antarmuka, semua efek visual saat mouse diarahkan (hover) akan tetap berfungsi. Ini memberikan kesan "hidup" tanpa harus fungsional.
- **Data Dummy:** Halaman tidak akan terhubung ke server atau database. Semua data yang ditampilkan (nama kontak, isi pesan, status pekerjaan, dll.) adalah data palsu (dummy) yang sudah disiapkan.

**3. Struktur & Konten Halaman:**
Halaman akan disusun secara vertikal, menampilkan "snapshot" dari setiap fitur utama secara berurutan, persis seperti yang dijelaskan di `README.md`.

- **Bagian 1: Manajemen Multi-Akun**

  - Menampilkan 3 kartu sesi WhatsApp dengan status berbeda: "Online", "Offline", dan "Membutuhkan Otentikasi".

- **Bagian 2: Dasbor Pesan Terpusat (Unified Inbox)**

  - Menampilkan antarmuka dasbor percakapan. Di sisi kiri, ada daftar 5-6 percakapan palsu dengan beberapa pesan belum dibaca. Di sisi kanan, menampilkan isi salah satu percakapan, lengkap dengan gelembung pesan keluar-masuk. Kotak untuk membalas pesan akan dinonaktifkan.

- **Bagian 3: WhatsApp Blast (Pesan Massal)**

  - Menampilkan UI utama WA Blast. Formulir akan terisi dengan contoh nama pekerjaan. Di bawahnya, akan ada tabel yang menunjukkan progres sebuah pekerjaan blast (beberapa pesan terkirim, beberapa dalam antrian, beberapa gagal).

- **Bagian 4: Pemanasan Akun (WA Warmer)**

  - Menampilkan tabel log dari fitur WA Warmer, yang berisi histori percakapan palsu antar akun untuk menunjukkan bagaimana proses "pemanasan" berlangsung.

- **Bagian 5: Pemeriksa Nomor (Number Checker)**

  - Menampilkan tabel hasil pemeriksaan nomor, berisi daftar nomor telepon dengan status "Aktif" dan "Tidak Aktif".

- **Bagian 6: Manajemen Kontak & Template**
  - Menampilkan tabel manajemen kontak yang berisi beberapa baris data kontak fiktif.
  - Menampilkan daftar template pesan yang sudah tersimpan.

---

### **Rencana Implementasi**

Untuk membangun halaman ini, saya akan melakukan langkah-langkah berikut:

1.  **Membuat Halaman Baru:** Saya akan membuat file baru di `src/app/preview/page.tsx`.
2.  **Membuat Data Dummy:** Saya akan membuat direktori baru `src/lib/dummy-data` untuk menyimpan semua data palsu yang dibutuhkan, seperti daftar kontak, percakapan, dan status pekerjaan. Ini akan memastikan kode tetap rapi.
3.  **Mengadaptasi Komponen Asli:** Saya akan memodifikasi komponen-komponen UI yang sudah ada (seperti `ConversationDashboard`, `WaBlastSection`, dll.) agar bisa menerima properti (prop) `isPreview`. Jika `isPreview` aktif, komponen akan menggunakan data dummy yang diberikan dan menonaktifkan semua fungsinya. Ini adalah pendekatan terbaik untuk menghindari duplikasi kode.
4.  **Menyusun Halaman Pratinjau:** Terakhir, saya akan menyusun semua komponen yang telah diadaptasi di dalam halaman `/preview`, mengisinya dengan data dummy, dan menatanya sesuai dengan spesifikasi di atas.

Ini adalah tugas yang cukup besar namun akan menghasilkan halaman demo yang sangat profesional dan efektif.

**Apakah Anda setuju dengan spesifikasi dan rencana ini? Jika ya, saya akan mulai proses implementasinya.**
