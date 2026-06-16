# 📜 Catatan Perubahan (*Changelog*)
Sistem Informasi Manajemen Terpadu Madrasah Tsanawiyah (SIMT MTs) — Portal Orang Tua & Portal Siswa

---

## [1.0.0] — 2026-06-15 (Sprint 5 Completion)

### 🚀 Fitur Baru (*Added*)
- **Autentikasi Hibrida Terpadu**: Mendukung login terpisah untuk Wali Murid (menggunakan email/ponsel dan token Sanctum) dan Siswa (menggunakan NIS dan sandi khusus).
- **Pemilih Anak (*Children Selector*)**: Responsif merender daftar tab anak jika wali murid memiliki lebih dari 1 anak yang bersekolah di madrasah.
- **Dashboard Akademik**: Menampilkan ringkasan nilai rata-rata, grafik ketuntasan KKM, dan capaian harian.
- **Modul Presensi**: Pratinjau kalender presensi harian (Hadir, Sakit, Izin, Alpa) dan catatan langsung dari wali kelas.
- **Keuangan SPP Digital**: Pemantauan tagihan lunas/tunggakan dan tautan unduh dokumen kwitansi PDF.
- **Monitoring Tahfiz**: Interaktif memantau jumlah surah dihafal, sesi ziyadah, dan sesi muraja'ah.
- **PWA Ready**: Terpasang `manifest.json` dan *service worker* untuk pemasangan aplikasi di layar utama (*homescreen*) Android/iOS.

### 🔒 Hardening & Keamanan (*Security*)
- Pembersihan total seluruh dependensi dan teks referensi Z.AI scaffold yang usang.
- Penghapusan berkas generator skrip yang membengkak.
- Pemutakhiran `.gitignore` untuk mencegah kebocoran data dev SQLite ke repositori git.

### 🎨 Peningkatan UI/UX (*Changed*)
- Peningkatan kontras warna tema dan animasi donat interaktif.
- Optimalisasi navigasi bawah (*bottom bar*) khusus untuk kemudahan ketukan di layar ponsel pintar.
