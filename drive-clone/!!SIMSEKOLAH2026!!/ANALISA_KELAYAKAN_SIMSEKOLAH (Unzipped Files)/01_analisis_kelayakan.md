# ANALISIS KELAYAKAN PROYEK
## SISTEM INFORMASI MANAJEMEN TERPADU (SIMT) MTs/YAYASAN

**Versi:** 1.0  
**Tanggal:** 12 Juni 2026  
**Status:** DRAFT  
**Penulis:** Tim Proyek SIMT MTs

---

## 1. PENDAHULUAN

### 1.1 Latar Belakang

Pengembangan Sistem Informasi Manajemen Terpadu (SIMT) untuk MTs/Yayasan merupakan inisiatif digitalisasi sekolah yang bertujuan untuk:
- Mengintegrasikan seluruh proses bisnis sekolah dalam satu platform
- Memenuhi kewajiban pelaporan ke Kemendikdasmen (DAPODIK) dan Kemenag (EMIS)
- Meningkatkan efisiensi dan efektivitas pengelolaan administrasi sekolah
- Memberikan akses informasi real-time kepada stakeholder (orang tua, guru, pimpinan)

### 1.2 Tujuan Analisis

Dokumen ini bertujuan untuk menganalisis kelayakan proyek SIMT MTs dari berbagai aspek:
1. **Kelayakan Teknis** - Ketersediaan teknologi dan infrastruktur
2. **Kelayakan Operasional** - Kesiapan pengguna dan proses bisnis
3. **Kelayakan Ekonomi** - Keuntungan finansial dan keberlanjutan
4. **Kelayakan Jadwal** - Realistis timeline pengembangan
5. **Kelayakan Hukum** - Kepatuhan regulasi dan keamanan data

### 1.3 Ruang Lingkup Analisis

```
SCOPE ANALISIS:
├── Sistem: SIMT MTs berbasis web
├── Jenjang: Madrasah Tsanawiyah (SMP)
├── Pengguna: Kepala Madrasah, Guru, TU, Orang Tua, Siswa
├── Integrasi: DAPODIK (Kemendikdasmen), EMIS (Kemenag)
├── Lokasi: Malang, Jawa Timur (pilot)
└── Skala: Multi-tenant untuk yayasan dengan beberapa MTs
```

---

## 2. ANALISIS KELAYAKAN TEKNIS

### 2.1 Ketersediaan Teknologi

| Komponen | Ketersediaan | Keterangan |
|----------|--------------|------------|
| **Bahasa Pemrograman** | ✅ Tersedia | PHP 8.x, JavaScript/TypeScript, Python |
| **Framework Backend** | ✅ Tersedia | Laravel, Django, Node.js, Express |
| **Framework Frontend** | ✅ Tersedia | Vue.js, React, Svelte, Angular |
| **Database** | ✅ Tersedia | MySQL 8, PostgreSQL, MariaDB |
| **Web Server** | ✅ Tersedia | Nginx, Apache, LAMP/LEMP Stack |
| **Cloud Infrastructure** | ✅ Tersedia | AWS, GCP, Alibaba Cloud, VPS Indonesia |
| **API Gateway** | ✅ Tersedia | REST API, GraphQL |
| **Authentication** | ✅ Tersedia | JWT, OAuth 2.0, SAML |
| **WhatsApp Integration** | ✅ Tersedia | Green API, Fonnte, WhatsApp Business API |
| **SMS Gateway** | ✅ Tersedia | Gammu, Twilio, Nexmo |
| **Payment Gateway** | ✅ Tersedia | Midtrans, Xendit, Doku, VA Bank |
| **PDF Generation** | ✅ Tersedia | DomPDF, mpdf, TCPDF, wkhtmltopdf |
| **Containerization** | ✅ Tersedia | Docker, Kubernetes |
| **CI/CD Tools** | ✅ Tersedia | GitHub Actions, GitLab CI, Jenkins |

### 2.2 Infrastruktur IT Target

```
ARSITEKTUR INFRASTRUKTUR:
                                    
        ┌─────────────────────────────┐
        │       INTERNET              │
        │   (ISP Indonesia)           │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │       LOAD BALANCER         │
        │   (Nginx/Cloudflare)        │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Web #1  │   │ Web #2  │   │ Web #3  │
   │ (Node)  │   │ (Node)  │   │ (Node)  │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
        ▼                              ▼
   ┌─────────┐                  ┌─────────┐
   │   Redis │                  │ Database│
   │ (Cache) │                  │ Cluster │
   └─────────┘                  └─────────┘
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                         ┌─────────┐     ┌─────────┐
                         │ Primary │     │ Replica │
                         │   DB    │     │   DB    │
                         └─────────┘     └─────────┘

HOSTING REKOMENDASI:
├── VPS Indonesia: IDCloudhost, Niagahoster, Domainsuki
├── Cloud Indonesia: Alibaba Cloud, AWS Jakarta
├── CDN: Cloudflare Indonesia, Jatis CDN
└── Monitoring: Sentry, Prometheus, Grafana
```

### 2.3 Kebutuhan Hardware Minimum

| Komponen | Minimum | Rekomendasi | Untuk |
|----------|---------|-------------|-------|
| **Server CPU** | 2 Core | 4-8 Core | Web Application |
| **Server RAM** | 4 GB | 8-16 GB | Concurrent users |
| **Storage** | 50 GB SSD | 100-500 GB SSD | Database + Files |
| **Database RAM** | 2 GB | 4-8 GB | MySQL/PostgreSQL |
| **Backup Storage** | 100 GB | 200-500 GB | Daily backup |
| **Bandwidth** | 1 TB/bulan | Unlimited | User access |

### 2.4 Kompatibilitas Browser & Device

```
SUPPORTED BROWSERS:
├── Chrome 90+
├── Firefox 88+
├── Safari 14+
├── Edge 90+
└── Opera 76+

SUPPORTED DEVICES:
├── Desktop: Windows 10+, macOS 10.15+, Linux
├── Tablet: iPadOS 14+, Android 10+
├── Mobile: Android 10+, iOS 14+
└── PWA-ready untuk instalasi local
```

### 2.5 Assessment Kelayakan Teknis

```
┌─────────────────────────────────────────────────────────────┐
│                  SCORING KELAYAKAN TEKNIS                   │
├─────────────────────────────────────────────────────────────┤
│  Kriteria                    │ Bobot │ Skor │ Keterangan   │
├─────────────────────────────────────────────────────────────┤
│  Ketersediaan SDM IT         │  25%  │ 4/5  │ Cukup tersedia│
│  Ketersediaan Infrastructure│  25%  │ 5/5  │ Sangat baik   │
│  Kompleksitas Teknologi      │  20%  │ 4/5  │ Manageable    │
│  Scalability                 │  15%  │ 5/5  │ Sangat scalable│
│  Support & Maintenance       │  15%  │ 4/5  │ community kuat│
├─────────────────────────────────────────────────────────────┤
│  TOTAL SKOR                  │ 100%  │ 4.4/5│ ✅ LAYAK      │
└─────────────────────────────────────────────────────────────┘

Kesimpulan: ✅ TEKNIS LAYAK
Proyek menggunakan teknologi yang proven, widely-used, dan memiliki
support community yang kuat. Tidak ada teknologi experimental atau
berisiko tinggi.
```

---

## 3. ANALISIS KELAYAKAN OPERASIONAL

### 3.1 Profil Pengguna & Kesiapan Digital

| User Role | Jumlah Estimasi | Literasi Digital | Kesiapan |
|-----------|-----------------|------------------|----------|
| **Kepala Madrasah** | 1-3 per MTs | Sedang-Tinggi | ⚠️ Perlu orientasi |
| **Waka Kurikulum** | 1 per MTs | Sedang-Tinggi | ✅ Siap |
| **Waka Kesiswaan** | 1 per MTs | Sedang | ✅ Siap |
| **Guru** | 15-30 per MTs | Bervariasi | ⚠️ Perlu training |
| **Wali Kelas** | 3-6 per MTs | Sedang | ✅ Siap |
| **Guru BK** | 1 per MTs | Sedang-Tinggi | ✅ Siap |
| **GPK Inklusi** | 1-2 per MTs | Sedang | ✅ Siap |
| **Tahfiz** | 2-4 per MTs | Rendah-Sedang | ⚠️ Perlu training |
| **Tata Usaha** | 2-4 per MTs | Sedang-Tinggi | ✅ Siap |
| **Orang Tua** | 100-300 per MTs | Bervariasi | ⚠️ Butuh panduan |
| **Siswa** | 100-300 per MTs | Tinggi | ✅ Sangat siap |

### 3.2 Analisis Proses Bisnis Eksisting

```
PROSES BISNIS SAAT INI (MANUAL/SEMI-DIGITAL):

✅ SUDAH DIGITAL:
├── Input nilai ke Excel/spreadsheet
├── Pengumuman via grup WhatsApp
├── Presensi guru dengan fingerprint device
├── Pembayaran via transfer bank
└── Rapor menggunakan RDM (Kemenag)

❌ BELUM DIGITAL:
├── Modul Ajar - masih Word/PDF manual
├── Jurnal Mengajar - belum terstruktur
├── Data Inklusi/ABK - spreadheet terpisah
├── Monitoring Tahfiz - buku hafalan manual
├── E-Office/Kepala Madrasah - surat fisik
├── BK/Konseling - catatan manual
├── Perpustakaan - buku peminjaman manual
└── Laporan manajemen - excel terpisah

EFISIENSI POTENSIAL:
├── Pengurangan waktu input data: 40-60%
├── Pengurangan kesalahan input: 70-90%
├── Real-time reporting: 100%
├── Paperless: 50-70%
└── Communication speed: instant
```

### 3.3 Dampak Operasional

| Aspek | Kondisi Eksisting | Kondisi Target | Perubahan |
|-------|-------------------|----------------|------------|
| **Waktu Input Nilai** | 2-4 jam/minggu/guru | 30-60 menit/minggu/guru | ↓ 75% |
| **Waktu Buat Laporan** | 1-3 hari | 1-2 jam | ↓ 90% |
| **Kecepatan Info ke Ortu** | 1-7 hari | Real-time | ↓ 99% |
| **Akurasi Data** | 85-90% | 98-99% | ↑ 10% |
| **Kemampuan Analisis** | Manual/terbatas | Dashboard real-time | ↑ 300% |
| **Konsistensi Format** | Bervariasi | Standar | ↑ 100% |

### 3.4 Risiko Operasional & Mitigasi

| Risiko | Probability | Impact | Mitigasi |
|--------|-------------|--------|----------|
| **User tidak mau berubah** | Medium | High | Training, change management, slow rollout |
| **Keterbatasan skill IT user** | Medium | Medium | User-friendly UI, video tutorial, helpdesk |
| **Data entry overload awal** | High | Medium | Import tools, parallel run, clear SOP |
| **Masalah koneksi internet** | Medium | Medium | Offline capability, sync when online |
| **Konflik data antar modul** | Low | High | Schema design, validation rules, audit trail |

### 3.5 Assessment Kelayakan Operasional

```
┌─────────────────────────────────────────────────────────────┐
│                SCORING KELAYAKAN OPERASIONAL                │
├─────────────────────────────────────────────────────────────┤
│  Kriteria                    │ Bobot │ Skor │ Keterangan   │
├─────────────────────────────────────────────────────────────┤
│  Kesiapan SDM                │  30%  │ 3/5  │ Perlu training│
│  Kompleksitas proses         │  25%  │ 4/5  │ Standard      │
│  Perubahan budaya kerja      │  20%  │ 3/5  │ Signifikan    │
│  Dukungan manajemen          │  15%  │ 5/5  │ High commitment│
│  Keberlanjutan operasional   │  10%  │ 4/5  │ Manageable    │
├─────────────────────────────────────────────────────────────┤
│  TOTAL SKOR                  │ 100%  │ 3.7/5│ ✅ LAYAK      │
└─────────────────────────────────────────────────────────────┘

Kesimpulan: ✅ OPERASIONAL LAYAK DENGAN SYARAT
Perlu program training dan change management yang baik.
Rekomendasikan pilot project di 1-2 MTs terlebih dahulu.
```

---

## 4. ANALISIS KELAYAKAN EKONOMI

### 4.1 Estimasi Biaya Pengembangan

#### A. Biaya development (dalam juta Rupiah)

```
BIAYA DEVELOPMENT (TIM INTERNAL):
┌─────────────────────────────────────────────────────────────┐
│  ROLE                  │ Jumlah │ Rate/bulan │ Durasi │ Total│
├─────────────────────────────────────────────────────────────┤
│  Project Manager       │   1    │    Rp15jt  │ 12 bln │ Rp180│
│  System Architect      │   1    │    Rp20jt  │ 12 bln │ Rp240│
│  Senior Backend Dev    │   2    │    Rp15jt  │ 10 bln │ Rp300│
│  Senior Frontend Dev   │   1    │    Rp15jt  │ 10 bln │ Rp150│
│  UI/UX Designer        │   1    │    Rp10jt  │  4 bln │ Rp40 │
│  Database Admin        │   1    │    Rp12jt  │  8 bln │ Rp96 │
│  QA Engineer           │   1    │    Rp10jt  │  6 bln │ Rp60 │
│  DevOps Engineer       │   1    │    Rp15jt  │  6 bln │ Rp90 │
├─────────────────────────────────────────────────────────────┤
│  SUBTOTAL PERSONNEL:   │        │            │        │ Rp1.156jt│
└─────────────────────────────────────────────────────────────┘

BIAYA DEVELOPMENT (OUTSOURCE/CONSULTANT):
┌─────────────────────────────────────────────────────────────┐
│  Item                        │ Estimasi    │ Keterangan     │
├─────────────────────────────────────────────────────────────┤
│  Wireframe & Prototyping    │   Rp25jt    │ 3-4 minggu      │
│  System Design & Arch       │   Rp30jt    │ 2-3 minggu      │
│  Code Review & Audit        │   Rp20jt    │ Per fase        │
│  User Testing (UAT)         │   Rp15jt    │ Per fase        │
├─────────────────────────────────────────────────────────────┤
│  SUBTOTAL OUTSOURCE:        │            │     Rp90jt      │
└─────────────────────────────────────────────────────────────┘

TOTAL BIAYA DEVELOPMENT: Rp1.246jt
```

#### B. Biaya Infrastruktur & Tools (Tahun 1)

```
┌─────────────────────────────────────────────────────────────┐
│  Item                        │ Per Bulan  │ Per Tahun      │
├─────────────────────────────────────────────────────────────┤
│  Cloud Server (VPS 4 core)  │   Rp1.5jt  │    Rp18jt       │
│  Domain + SSL               │            │    Rp2jt        │
│  Cloud Storage (S3)         │   Rp0.5jt  │    Rp6jt        │
│  Database (Managed)         │   Rp1jt    │    Rp12jt       │
│  CDN + Security             │   Rp0.5jt  │    Rp6jt        │
│  Monitoring & Logging       │   Rp0.3jt  │    Rp3.6jt      │
│  Email Service              │   Rp0.2jt  │    Rp2.4jt      │
│  WhatsApp API (Green API)   │   Rp0.5jt  │    Rp6jt        │
├─────────────────────────────────────────────────────────────┤
│  SUBTOTAL INFRASTRUKTUR:    │   Rp4.5jt  │    Rp56jt       │
└─────────────────────────────────────────────────────────────┘
```

#### C. Biaya Operational (Tahun 1)

```
┌─────────────────────────────────────────────────────────────┐
│  Item                        │ Per Bulan  │ Per Tahun      │
├─────────────────────────────────────────────────────────────┤
│  Internet Koneksi            │   Rp1jt    │    Rp12jt       │
│  Listrik Server (jika on-prem)│  -        │    Rp0          │
│  Maintenance & Support       │   Rp2jt    │    Rp24jt       │
│  Training User               │            │    Rp15jt       │
│  Dokumentasi                 │            │    Rp5jt        │
│  Contingency (10%)           │            │    Rp5.6jt      │
├─────────────────────────────────────────────────────────────┤
│  SUBTOTAL OPERASIONAL:       │   Rp3jt    │    Rp61.6jt     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Total Biaya Tahun 1

```
┌─────────────────────────────────────────────────────────────┐
│  KATEGORI                    │           JUMLAH             │
├─────────────────────────────────────────────────────────────┤
│  Development (Personnel)     │         Rp1.156jt            │
│  Development (Outsource)     │           Rp90jt             │
│  Infrastruktur & Tools       │           Rp56jt             │
│  Operasional                 │         Rp61.6jt             │
├─────────────────────────────────────────────────────────────┤
│  TOTAL INVESTASI TAHUN 1     │         Rp1.363.6jt          │
│  (Dengan contingency)        │         Rp1.500jt            │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Estimasi Biaya Tahunan Berikutnya

```
┌─────────────────────────────────────────────────────────────┐
│  KATEGORI                    │    Tahun 2    │    Tahun 3+  │
├─────────────────────────────────────────────────────────────┤
│  Development (Enhancement)   │    Rp400jt    │    Rp300jt   │
│  Infrastruktur               │    Rp56jt     │    Rp56jt    │
│  Operasional & Maintenance   │    Rp50jt     │    Rp50jt    │
│  Marketing & Support         │    Rp30jt     │    Rp30jt    │
├─────────────────────────────────────────────────────────────┤
│  TOTAL PER TAHUN             │    Rp536jt    │    Rp436jt   │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Model Pendapatan & Break-Even

```
MODEL PENDAPATAN YANG DIREKOMENDASIKAN:

OPSI A: Subscription per Siswa/bulan
├── Paket Basic (Akademik only): Rp5.000/siswa/bulan
├── Paket Standard (+Keuangan): Rp8.000/siswa/bulan
├── Paket Premium (All modules): Rp12.000/siswa/bulan
└── Multi-tenant untuk yayasan: discount 20-30%

OPSI B: Subscription per MTs/bulan
├── Paket Basic: Rp500.000/madrasah/bulan
├── Paket Standard: Rp800.000/madrasah/bulan
├── Paket Premium: Rp1.200.000/madrasah/bulan
└── Unlimited users per madrasah

OPSI C: Lisensi One-time + Maintenance
├── Lisensi Full: Rp25.000.000/madrasah
├── Maintenance Year 1: included
├── Maintenance Year 2+: Rp3.000.000/tahun
└── Upgrade: free within major version

KALKULASI BREAK-EVEN (120 siswa per MTs, Paket Standard):
┌─────────────────────────────────────────────────────────────┐
│  Revenue per MTs/bulan: 120 × Rp8.000 = Rp960.000           │
│  Target MTs untuk break-even (Year 1):                      │
│    Rp1.500jt ÷ (Rp960.000 × 12) = ~130 MTs                 │
│                                                             │
│  Target realistis Year 1: 20-30 MTs                         │
│  Break-even 예상: Month 18-24                               │
│                                                             │
│  Profitabilitas Year 3+ (100 MTs):                          │
│    Revenue: 100 × Rp800.000 × 12 = Rp960.000.000/tahun      │
│    Cost: ~Rp436.000.000/tahun                               │
│    Profit: ~Rp524.000.000/tahun                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Assessment Kelayakan Ekonomi

```
┌─────────────────────────────────────────────────────────────┐
│                  SCORING KELAYAKAN EKONOMI                  │
├─────────────────────────────────────────────────────────────┤
│  Kriteria                    │ Bobot │ Skor │ Keterangan   │
├─────────────────────────────────────────────────────────────┤
│  Total investasi            │  25%  │ 3/5  │ Significant   │
│  Break-even period          │  25%  │ 4/5  │ 18-24 bulan   │
│  Revenue model              │  20%  │ 4/5  │ Sustainable   │
│  Operational cost           │  15%  │ 4/5  │ Manageable    │
│  ROI potential              │  15%  │ 5/5  │ High          │
├─────────────────────────────────────────────────────────────┤
│  TOTAL SKOR                  │ 100%  │ 3.95/5│ ✅ LAYAK     │
└─────────────────────────────────────────────────────────────┘

Kesimpulan: ✅ EKONOMI LAYAK
Model subscription memberikan recurring revenue yang sustainable.
Break-even dalam 18-24 bulan dengan asumsi 50-100 MTs customer.
```

---

## 5. ANALISIS KELAYAKAN JADWAL

### 5.1 Timeline Pengembangan (12-18 Bulan)

```
┌────────────────────────────────────────────────────────────────────────┐
│                     TIMELINE PROJECT SIMT MTs                          │
├────────┬──────────────────────────────────────────────────────────────┤
│ BULAN  │ KEGIATAN                                                   │
├────────┼──────────────────────────────────────────────────────────────┤
│  1-2   │ ████ FASE 1: PLANNING & DESIGN                             │
│        │ ├── Analisis kebutuhan detail                               │
│        │ ├── System architecture design                              │
│        │ ├── Database schema design                                  │
│        │ ├── UI/UX wireframing & prototyping                        │
│        │ └── Setup development environment                           │
├────────┼──────────────────────────────────────────────────────────────┤
│  3-4   │ ████ FASE 2A: MVP CORE DEVELOPMENT                          │
│        │ ├── User management & authentication                        │
│        │ ├── Module akademik dasar (biodata, kelas)                  │
│        │ ├── Module presensi                                         │
│        │ └── Module nilai dasar                                      │
├────────┼──────────────────────────────────────────────────────────────┤
│  5-6   │ ████ FASE 2B: MVP ENHANCEMENT                               │
│        │ ├── E-rapor integration (RDM)                               │
│        │ ├── Module keuangan (SPP, tagihan)                          │
│        │ ├── Dashboard kepala madrasah                               │
│        │ └── Portal orang tua basic                                  │
├────────┼──────────────────────────────────────────────────────────────┤
│  7-8   │ ████ FASE 3: PILOT TESTING                                  │
│        │ ├── UAT di 1-2 MTs pilot                                    │
│        │ ├── Bug fixing & optimization                                │
│        │ ├── Training user                                           │
│        │ └── Go-live MVP                                             │
├────────┼──────────────────────────────────────────────────────────────┤
│  9-10  │ ████ FASE 4: ENHANCED MODULES                               │
│        │ ├── Module Tahfiz                                           │
│        │ ├── Module Inklusi (PDBK)                                   │
│        │ ├── Module BK/Konseling                                     │
│        │ └── WhatsApp notification integration                       │
├────────┼──────────────────────────────────────────────────────────────┤
│ 11-12  │ ████ FASE 5: ADVANCED FEATURES                              │
│        │ ├── Module SDM/Kepegawaian                                  │
│        │ ├── Module E-Office                                         │
│        │ ├── Module Perpustakaan                                     │
│        │ └── Enhanced reporting & analytics                          │
├────────┼──────────────────────────────────────────────────────────────┤
│ 13-14  │ ████ FASE 6: SCALING                                        │
│        │ ├── Multi-tenant setup                                      │
│        │ ├── Mobile app (iOS + Android)                              │
│        │ ├── API documentation                                        │
│        │ └── Marketing & sales                                       │
├────────┼──────────────────────────────────────────────────────────────┤
│ 15-16  │ ████ FASE 7: OPTIMIZATION                                   │
│        │ ├── Performance optimization                                 │
│        │ ├── Security audit & hardening                               │
│        │ ├── Full-scale deployment                                   │
│        │ └── Customer success setup                                  │
├────────┼──────────────────────────────────────────────────────────────┤
│ 17-18  │ ████ FASE 8: LAUNCH & ITERATION                             │
│        │ ├── Official launch                                         │
│        │ ├── Feedback collection & iteration                         │
│        │ ├── Documentation finalization                              │
│        │ └── Project closure & handover                              │
└────────┴──────────────────────────────────────────────────────────────┘
```

### 5.2 Milestone Utama

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| **M1: Design Complete** | Bulan 2 | Wireframe, ERD, ARSITECTURE doc |
| **M2: MVP Ready** | Bulan 6 | Working core system untuk pilot |
| **M3: Pilot Live** | Bulan 8 | Sistem berjalan di 1-2 MTs |
| **M4: Enhanced Release** | Bulan 12 | All major modules completed |
| **M5: Scale Ready** | Bulan 16 | Multi-tenant, mobile app |
| **M6: Commercial Launch** | Bulan 18 | Ready for market |

### 5.3 Assessment Kelayakan Jadwal

```
┌─────────────────────────────────────────────────────────────┐
│                  SCORING KELAYAKAN JADWAL                   │
├─────────────────────────────────────────────────────────────┤
│  Kriteria                    │ Bobot │ Skor │ Keterangan   │
├─────────────────────────────────────────────────────────────┤
│  Realistis timeline          │  30%  │ 4/5  │ 12-18 bln    │
│  Resource availability       │  25%  │ 4/5  │ Full-time    │
│  Dependency management       │  20%  │ 4/5  │ Phased dev   │
│  Buffer for unexpected       │  15%  │ 4/5  │ 10% buffer   │
│  Flexibility to adjust       │  10%  │ 5/5  │ Agile method │
├─────────────────────────────────────────────────────────────┤
│  TOTAL SKOR                  │ 100%  │ 4.15/5│ ✅ LAYAK    │
└─────────────────────────────────────────────────────────────┘

Kesimpulan: ✅ JADWAL LAYAK
Dengan approach Agile/Scrum dan phased development, timeline
12-18 bulan sangat realistis untuk SIMT dengan fitur lengkap.
```

---

## 6. ANALISIS KELAYAKAN HUKUM & COMPLIANCE

### 6.1 Kepatuhan Regulasi

| Regulasi | Kepatuhan | Implementasi |
|----------|-----------|--------------|
| **UU Perlindungan Data Pribadi (UU PDP)** | ✅ WAJIB | Enkripsi data PII, consent management, data retention policy |
| **Permendikbud No. 79 Tahun 2014 (DAPODIK)** | ✅ WAJIB | Integrasi sinkronisasi data siswa ke DAPODIK |
| **KMA tentang EMIS** | ✅ WAJIB | Integrasi data ke EMIS Kemendag |
| **Standar Data Pendidikan Kemendikdasmen** | ✅ WAJIB | Penggunaan NISN, NPSN, NIK yang valid |
| **Kurikulum Merdeka** | ✅ WAJIB | Support format penilaian dan rapor Kurikulum Merdeka |
| **P5RA (KMA 450/2023)** | ✅ WAJIB | Fitur projek penguat profil pelajar rahmatan lil alamin |
| **Standar Akreditasi Sekolah** | ✅ WAJIB | Data siap untuk akreditasi |

### 6.2 Keamanan Data

```
KEAMANAN YANG DITERAPKAN:

LEVEL INFRASTRUKTUR:
├── SSL/TLS untuk semua koneksi
├── DDoS protection (Cloudflare/WAF)
├── Firewall & intrusion detection
├── Regular security audit
├── Backup dengan encryption
└── Disaster recovery plan

LEVEL APLIKASI:
├── JWT dengan short expiry + refresh token
├── Password hashing (bcrypt/argon2)
├── Role-based access control (RBAC)
├── Input validation & sanitization
├── SQL injection prevention
├── XSS protection
├── CSRF tokens
└── Rate limiting & brute force protection

LEVEL DATA:
├── Enkripsi data sensitif at-rest (AES-256)
├── Enkripsi data sensitif in-transit
├── Data masking untuk PII
├── Audit trail untuk semua perubahan
├── Data retention & deletion policy
└── Compliance dengan UU PDP

KEPEMILIKAN & LISENSI:
├── Lisensi software compliant
├── Open source dengan license yang sesuai
├── Third-party library dengan valid license
└── Custom code dengan IP yang jelas
```

### 6.3 Assessment Kelayakan Hukum

```
┌─────────────────────────────────────────────────────────────┐
│                  SCORING KELAYAKAN HUKUM                    │
├─────────────────────────────────────────────────────────────┤
│  Kriteria                    │ Bobot │ Skor │ Keterangan   │
├─────────────────────────────────────────────────────────────┤
│  Kepatuhan regulasi          │  35%  │ 5/5  │ Full compliance│
│  Keamanan data              │  30%  │ 5/5  │ Enterprise grade│
│  Legalitas software         │  20%  │ 5/5  │ All licensed  │
│  Perlindungan IP            │  15%  │ 5/5  │ Clear ownership│
├─────────────────────────────────────────────────────────────┤
│  TOTAL SKOR                  │ 100%  │   5/5│ ✅ LAYAK      │
└─────────────────────────────────────────────────────────────┘

Kesimpulan: ✅ HUKUM LAYAK
Kepatuhan full terhadap regulasi pendidikan Indonesia dan
UU Perlindungan Data Pribadi. Keamanan data enterprise-grade.
```

---

## 7. ANALISIS RISIKO PROYEK

### 7.1 Risk Register

| ID | Risiko | Probability | Impact | Mitigation |
|----|--------|-------------|--------|------------|
| R01 | Keterlambatan development | Medium | High | Agile methodology, buffer time, daily standup |
| R02 | Budget overrun | Medium | High | Fixed scope, prioritize MVP, contingency fund |
| R03 | User adoption rendah | Medium | High | Training, change management, UX focus |
| R04 | Teknisi/developer resign | Low | High | Knowledge documentation, cross-training |
| R05 | Perubahan regulasi | Low | Medium | Modular design, easy to adapt |
| R06 | Data security breach | Low | Very High | Security audit, penetration testing |
| R07 | Kompetitor lebih cepat | Low | Medium | Focus on unique features (Tahfiz, Inklusi) |
| R08 | Infrastructure failure | Low | High | Monitoring, redundancy, SLA with provider |
| R09 | Integrasi EMIS/Dapodik bermasalah | Medium | Medium | Early testing, fallback plan, direct API |
| R10 | Downtime saat critical period (ujian) | Medium | High | 99.9% uptime SLA, maintenance window |

### 7.2 Risk Matrix

```
                    IMPACT
        Low     Medium     High    Very High
        ┌────────┬────────┬────────┬────────┐
  High │   -    │   -    │  R02   │  R01   │ Probability
   Medium│   -    │  R05   │  R03   │  R04   │
    Low │   -    │  R07   │  R09   │  R06   │
        │   -    │   -    │   -    │  R08   │
        └────────┴────────┴────────┴────────┘

HIGH RISK AREAS (需要重点关注):
├── R01: Keterlambatan development
├── R02: Budget overrun
├── R03: User adoption rendah
└── R06: Data security breach
```

---

## 8. KESIMPULAN & REKOMENDASI

### 8.1 Ringkasan Scoring

```
┌─────────────────────────────────────────────────────────────┐
│              SUMMARY KELAYAKAN PROYEK                       │
├────────────────────────┬──────────┬────────────────────────┤
│  Aspek Kelayakan       │   Skor   │       Status          │
├────────────────────────┼──────────┼────────────────────────┤
│  Teknis                │  4.4/5   │ ✅ LAYAK               │
│  Operasional           │  3.7/5   │ ✅ LAYAK (dengan syarat)│
│  Ekonomi               │  3.95/5  │ ✅ LAYAK               │
│  Jadwal                │  4.15/5  │ ✅ LAYAK               │
│  Hukum & Compliance    │   5/5    │ ✅ LAYAK               │
├────────────────────────┼──────────┼────────────────────────┤
│  OVERALL SCORE         │  4.25/5  │ ✅ PROYEK LAYAK        │
└────────────────────────┴──────────┴────────────────────────┘
```

### 8.2 Rekomendasi Keputusan

```
┌─────────────────────────────────────────────────────────────┐
│                    KEPUTUSAN: ✅ APPROVED                    │
├─────────────────────────────────────────────────────────────┤
│  Proyek SIMT MTs dinyatakan LAYAK untuk dilanjutkan dengan  │
│  catatan berikut:                                           │
│                                                             │
│  MANDATORY CONDITIONS:                                      │
│  1. Pilot project di 1-2 MTs sebelum full deployment        │
│  2. Program training dan change management yang memadai     │
│  3. Security audit sebelum go-live                         │
│  4. Compliance check dengan regulasi terbaru               │
│  5. User acceptance testing yang thorough                  │
│                                                             │
│  STRONG RECOMMENDATIONS:                                    │
│  1. Gunakan Agile/Scrum methodology                         │
│  2. Prioritaskan modul Tahfiz sebagai differentiator        │
│  3. Integrasikan dengan RDM yang sudah mature              │
│  4. Mulai dengan subscription model yang terjangkau         │
│  5. Siapkan dedicated support team                          │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Langkah Selanjutnya

```
IMMEDIATE ACTIONS (Bulan 1):
├── 1. Formasi tim proyek (PM, Dev, Designer)
├── 2. Setup development environment
├── 3. Analisis kebutuhan detail dengan stakeholder
├── 4. Wireframing modul MVP
├── 5. Penetapan partner hosting & infrastructure
└── 6. Penandatanganan kontrak tim development

SHORT-TERM (Bulan 2-3):
├── 1. Finalisasi system architecture
├── 2. Database schema development
├── 3. Development sprint 1
├── 4. Prototype testing dengan guru
└── 5. Pembuatan SOP pelatihan user
```

---

## LAMPIRAN

### A. Glossary

| Singkatan | Kepanjangan |
|-----------|-------------|
| SIMT | Sistem Informasi Manajemen Terpadu |
| MTs | Madrasah Tsanawiyah |
| RDM | Rapor Digital Madrasah |
| EMIS | Education Management Information System |
| DAPODIK | Data Pokok Pendidikan |
| PDBK | Pendidikan Dasar Berkelanjutan |
| ABK | Anak Berkebutuhan Khusus |
| GPK | Guru Pendamping Khusus |
| PPI | Program Pembelajaran Individual |
| P5RA | Projek Penguatan Profil Pelajar Rahmatan lil 'Alamin |
| RBAC | Role-Based Access Control |
| MVP | Minimum Viable Product |
| UAT | User Acceptance Testing |
| API | Application Programming Interface |
| SSO | Single Sign-On |
| JWT | JSON Web Token |

### B. Referensi

1. Permendikbud No. 79 Tahun 2014 tentang DAPODIK
2. KMA tentang Pengelolaan Data EMIS
3. KMA 450 Tahun 2023 tentang Kurikulum Merdeka Madrasah
4. UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi
5. Standar Pengelolaan Keuangan Sekolah (Permendikbud)
6. Panduan RDM Kemenag

---

*Dokumen ini merupakan bagian dari paket dokumentasi proyek SIMT MTs*
*Versi: 1.0 | Tanggal: 12 Juni 2026*