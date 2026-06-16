# 🚀 SIMT Portal Ortu & Portal Siswa (Next.js 14)

Portal informasi resmi terpadu untuk orang tua / wali murid dan siswa Madrasah Tsanawiyah (SIMT MTs). Dibangun menggunakan **Next.js 14 (App Router)**, **TypeScript**, dan **Tailwind CSS**.

---

## 🌟 Fitur Unggulan

1. **🔒 Autentikasi Hibrida Terpadu**
   - **Portal Orang Tua**: Login menggunakan nomor ponsel / WhatsApp (Sanctum Token) dengan dukungan pemilih anak (*children selector*) jika wali murid memiliki lebih dari 1 anak yang bersekolah di madrasah.
   - **Portal Siswa**: Login menggunakan NIS / NISN dan kata sandi khusus siswa untuk melihat capaian individu.

2. **📊 Capaian Akademik Aktual**
   - Rincian nilai harian, UTS, UAS, Keterampilan, dan Sikap.
   - Analisis ketuntasan KKM (Kriteria Ketuntasan Minimal) otomatis dan persentase peringkat kelas.

3. **📝 Presensi Instan & Log WhatsApp**
   - Sinkronisasi langsung dengan modul presensi guru di kelas.
   - Menampilkan jam masuk, jam pulang, surat keterangan izin/sakit, dan riwayat log notifikasi WhatsApp yang terkirim.

4. **💰 Keuangan & SPP Digital**
   - Pemantauan status tagihan bulanan (Lunas, Belum Bayar, Menunggu, Dibayar Sebagian).
   - Unduh kwitansi pembayaran digital dengan format resmi `KW/{tenant}/{tahun}/{seq}`.

5. **🌙 Monitoring Tahfiz Mandiri**
   - Pantau capaian hafalan surah, halaman, dan rekap muraja'ah / ziyadah anak secara berkala.
   - Catatan ketepatan makhraj, kelancaran, dan pesan langsung dari guru tahfiz.

---

## 📁 Struktur Peta Proyek

```
simt-portalortu/
├── docs/                     # Dokumentasi teknis & spesifikasi API
│   ├── README.md             # Arsitektur Next.js
│   ├── API_DOCUMENTATION.md  # Kontrak endpoint REST API
│   ├── DATA_FLOW.md          # Diagram alir sinkronisasi data
│   └── openapi.yaml          # OpenAPI 3.0 Specifications
├── prisma/                   # Basis data & skema dev lokal
│   ├── schema.prisma         # Model relasional
│   └── seed.ts               # Data penyemaian demo
├── public/                   # Aset publik & PWA Manifest
│   ├── manifest.json         # Konfigurasi PWA Android/iOS
│   └── sw.js                 # Service worker offline cache
└── src/                      # Inti Kode Aplikasi Next.js
    ├── app/                  # Route Pages (App Router)
    ├── components/           # Komponen UI (Tailwind + shadcn/ui)
    ├── hooks/                # Custom React Hooks
    └── lib/                  # Utilitas koneksi API & Auth Sanctum
```

---

## 🚀 Panduan Jalankan Cepat (*Quick Start*)

### 1. Prasyarat (*Prerequisites*)
Pastikan Anda telah memasang **Node.js (v18+)** atau **Bun** serta menjalankan layanan backend Laravel SIMT di port `8000`.

### 2. Pasang Dependensi
```bash
bun install
# atau
npm install
```

### 3. Sinkronisasi Skema Basis Data Dev
```bash
bun run db:push
# atau
npx prisma db push
```

### 4. Jalankan Server Pengembangan
```bash
bun run dev
# Server akan berjalan di http://localhost:3000
```

---

## 🏢 Demo Akun Cepat (*Password semua*: `password` atau `siswa123`)

| Peran | Login / NIS | Sandi | Tenant |
|---|---|---|---|
| **Wali Murid** | `ortu1@email.com` | `password` | MTs Al-Hikmah |
| **Wali Murid** | `ortu2@email.com` | `password` | MTs An-Nur |
| **Siswa** | `20250001` | `siswa123` | MTs Al-Hikmah |
| **Siswa** | `20250002` | `siswa123` | MTs An-Nur |

---

## 📜 Lisensi & Legal
Sistem Informasi Manajemen Terpadu Madrasah Tsanawiyah (SIMT MTs) &copy; 2026. Dikembangkan untuk mendukung ekosistem pendidikan madrasah berstandar modern.
