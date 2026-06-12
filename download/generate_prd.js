const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageNumber, PageBreak, ImageRun, WidthType, BorderStyle,
  ShadingType, TableLayoutType, SectionType, NumberFormat, TableOfContents } = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (PRD/Proposal) ──
const P = {
  bg: "1A2330", primary: "FFFFFF", accent: "D4875A",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
  body: "1C2A3D", secondary: "5B6B7D"
};

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const IMG_DIR = "/home/z/my-project/download/simt-visualisasi/";
function loadImg(name) { return fs.readFileSync(IMG_DIR + name); }
function imgSz(buf, maxW) {
  // We'll use fixed widths for simplicity
  return { width: maxW, height: Math.round(maxW * 0.65) };
}

// ── Helpers ──
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32 })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28 })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26 })] });
}
function para(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" }, ...(opts.run || {}) })],
  });
}
function paraNB(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" }, ...(opts.run || {}) })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    alignment: AlignmentType.LEFT, indent: { left: 480 + level * 240 },
    spacing: { line: 312, after: 40 },
    children: [new TextRun({ text: "\u2022 " + text, size: 24, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}
function boldLabel(label, value) {
  return new Paragraph({
    spacing: { line: 312, after: 40 }, indent: { left: 480 },
    children: [
      new TextRun({ text: label + ": ", bold: true, size: 24, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
      new TextRun({ text: value, size: 24, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
    ],
  });
}

// ── Table helper ──
function makeTable(headers, rows) {
  const t = P.table;
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: t.headerBg },
      borders: { bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine } },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 21, color: t.headerText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
    })),
  });
  const dataRows = rows.map((row, idx) => new TableRow({
    cantSplit: true,
    children: row.map(cell => new TableCell({
      shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: t.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: String(cell), size: 21, color: "000000", font: { ascii: "Times New Roman", eastAsia: "SimSun" } })] })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows],
  });
}

// ── Image helper ──
function insertImage(filename, widthCm = 15) {
  const widthTwips = Math.round(widthCm * 567);
  const heightTwips = Math.round(widthTwips * 0.65);
  const buf = loadImg(filename);
  const ext = filename.split('.').pop();
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
    children: [new ImageRun({ data: buf, transformation: { width: widthCm * 37.8, height: widthCm * 37.8 * 0.65 },
      type: ext === "png" ? "png" : "jpg" })],
  });
}

function emptyPara() { return new Paragraph({ children: [] }); }

// ── Cover R4 ──
function buildCoverR4(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR;
  const title = config.title;
  const titlePt = 36;
  const titleSize = titlePt * 2;
  const UPPER_H = 8000;
  const DIVIDER_H = 60;
  const topSpacing = 2000;

  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED, borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: P.bg }, borders: noBorders, verticalAlign: "top",
        margins: { left: padL, right: padR },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          new Paragraph({ spacing: { after: 500 },
            children: [new TextRun({ text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })] }),
          new Paragraph({ spacing: { after: 100, line: 828, lineRule: "atLeast" },
            children: [new TextRun({ text: "PRD - MVP", size: titleSize, bold: true,
              color: P.cover.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })] }),
          new Paragraph({ spacing: { after: 100, line: 828, lineRule: "atLeast" },
            children: [new TextRun({ text: "SIMT MTs", size: titleSize, bold: true,
              color: P.cover.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })] }),
          new Paragraph({ spacing: { after: 200, line: 828, lineRule: "atLeast" },
            children: [new TextRun({ text: "3 Bulan | Rp 5 Juta", size: 28, bold: true,
              color: P.accent, font: { eastAsia: "SimHei", ascii: "Arial" } })] }),
          new Paragraph({ spacing: { after: 100 },
            children: [new TextRun({ text: config.subtitle, size: 24, color: P.cover.subtitleColor,
              font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })] }),
        ],
      })],
    })],
  });

  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ borders: noBorders, shading: { fill: P.accent }, children: [emptyPara()] })],
    })],
  });

  const metaLines = config.metaLines || [];
  const lowerChildren = [
    new Paragraph({ spacing: { before: 600 } }),
    ...metaLines.map(line => new Paragraph({
      indent: { left: padL }, spacing: { after: 80 },
      children: [new TextRun({ text: line, size: 22, color: "404040", font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    })),
  ];
  const lowerH = 16838 - UPPER_H - DIVIDER_H;
  const lowerBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: allNoBorders,
    rows: [new TableRow({
      height: { value: lowerH, rule: "exact" },
      children: [new TableCell({ borders: noBorders, shading: { fill: "FFFFFF" }, verticalAlign: "top",
        margins: { left: padL, right: padR }, children: lowerChildren })],
    })],
  });

  return [upperBlock, divider, lowerBlock];
}

// ── Build Document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: "000000" },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: "000000" } },
      heading2: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: "000000" } },
      heading3: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26, bold: true, color: "000000" } },
    },
  },
  sections: [
    // ── COVER ──
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR4({
        title: "PRD MVP SIMT MTs",
        subtitle: "Sistem Informasi Manajemen Terpadu Madrasah Tsanawiyah",
        englishLabel: "PRODUCT REQUIREMENTS DOCUMENT",
        metaLines: [
          "Versi: 1.0 | 12 Juni 2026",
          "Periode MVP: 3 Bulan (Juli - September 2026)",
          "Budget: Rp 5.000.000",
          "Target Pasar: MTs/SMP Yayasan - Malang, Jawa Timur",
          "Tim: 1 Senior Full-Stack Developer",
        ],
      }),
    },
    // ── TOC ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.ROMAN } },
      },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
      children: [
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "DAFTAR ISI", bold: true, size: 32, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] }),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ spacing: { before: 200 }, children: [
          new TextRun({ text: "Catatan: Klik kanan pada Daftar Isi, pilih ", italics: true, size: 20, color: "808080" }),
          new TextRun({ text: "Update Field", italics: true, size: 20, color: "808080", bold: true }),
          new TextRun({ text: " untuk memperbarui nomor halaman.", italics: true, size: 20, color: "808080" }),
        ] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── BODY ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
      children: [
        // ════════════════════════════════════════
        // SECTION 1: EXECUTIVE SUMMARY
        // ════════════════════════════════════════
        h1("1. Executive Summary"),
        para("Dokumen ini merupakan Product Requirements Document (PRD) untuk pengembangan MVP (Minimum Viable Product) Sistem Informasi Manajemen Terpadu Madrasah Tsanawiyah (SIMT MTs) dalam kurun waktu 3 bulan dengan anggaran maksimal Rp 5.000.000. SIMT MTs dirancang sebagai platform Micro SaaS B2B2C yang melayani kebutuhan digitalisasi sekolah-sekolah Madrasah Tsanawiyah dan SMP di bawah naungan yayasan, dengan fokus awal pada pasar Malang, Jawa Timur."),
        para("Dari 13 modul yang teridentifikasi dalam dokumen rancangan fitur asli, MVP ini memprioritaskan 5 modul inti yang memberikan nilai paling tinggi bagi pengguna dengan effort development yang realistis sesuai budget. Pendekatan Plug & Play diadopsi sehingga modul-modul tambahan dapat diaktifkan kemudian tanpa perlu merombak arsitektur. Strategi monetisasi menggunakan model Pay-Per-Student (Rp 2.000/siswa/bulan) yang menggeser beban biaya dari yayasan ke orang tua murid, menjadikannya solusi yang terjangkau namun berkelanjutan secara operasional."),
        para("Dari hasil analisis kelayakan yang telah dilakukan pada sesi sebelumnya, proyek ini mendapat skor keseluruhan 4.25/5 (LAYAK) dengan catatan bahwa pendekatan realistis harus diambil mengingat keterbatasan budget dan sumber daya. Pivot strategis dari monolithic ERP ke Micro SaaS modular menjadi kunci keberlangsungan proyek ini, memungkinkan peluncuran bertahap dengan validasi pasar sejak dini."),

        // ════════════════════════════════════════
        // SECTION 2: VISI & MISI MVP
        // ════════════════════════════════════════
        h1("2. Visi dan Misi MVP"),
        h2("2.1 Visi"),
        para("Menjadi platform Micro SaaS pendidikan terdepan untuk Madrasah Tsanawiyah di Indonesia yang menghubungkan seluruh stakeholder sekolah dalam satu ekosistem digital yang terjangkau, mudah digunakan, dan memenuhi regulasi Kemendikdasmen (DAPODIK) serta Kemenag (EMIS, RDM, Simpatika)."),
        h2("2.2 Misi MVP"),
        bullet("Menyediakan sistem presensi, penilaian, dan pelaporan akademik yang terintegrasi dengan Kurikulum Merdeka dan RDM Kemenag"),
        bullet("Memberikan transparansi keuangan sekolah melalui portal tagihan dan pembayaran digital"),
        bullet("Menghubungkan orang tua murid dengan informasi perkembangan anak secara real-time melalui portal khusus"),
        bullet("Mengotomatisasi notifikasi penting melalui WhatsApp tanpa biaya operasional tambahan"),
        bullet("Membangun fondasi arsitektural multi-tenant yang siap diskalakan ke ratusan sekolah"),
        h2("2.3 North Star Metric"),
        para("North Star Metric untuk MVP adalah jumlah Active Monthly Schools (AMS), yaitu sekolah yang menggunakan sistem secara aktif minimal 20 hari dalam sebulan. Target Year 1: 10 AMS. Target Year 2: 30 AMS. Target Year 3: 60 AMS."),

        // ════════════════════════════════════════
        // SECTION 3: RUANG LINGKUP MVP
        // ════════════════════════════════════════
        h1("3. Ruang Lingkup MVP"),
        h2("3.1 Modul yang Diikutsertakan (In-Scope)"),
        para("Berdasarkan analisis prioritas menggunakan matriks Value vs Effort, berikut 5 modul yang masuk dalam ruang lingkup MVP beserta alasan strategisnya:"),

        makeTable(
          ["No", "Modul", "Fitur Inti MVP", "Alasan Prioritas"],
          [
            ["1", "Core Platform", "Auth, Tenant, RBAC, Dashboard", "Fondasi wajib; tanpa ini modul lain tidak bisa berjalan"],
            ["2", "Akademik", "Presensi, Penilaian, E-Rapor", "Pain point terbesar guru; kebutuhan paling mendesak"],
            ["3", "Keuangan", "SPP, Tagihan, Pembayaran", "Revenue generator; sumber cashflow berkelanjutan"],
            ["4", "Portal Orang Tua", "Monitoring nilai, presensi, tagihan", "Value proposition utama; justifikasi biaya langganan"],
            ["5", "Notifikasi WA", "Auto-notif kehadiran, tagihan", "Differentiator vs kompetitor; zero-cost via Baileys"],
          ]
        ),

        h2("3.2 Modul yang Ditangguhkan (Out-of-Scope MVP)"),
        para("Delapan modul berikut ditangguhkan ke fase pasca-MVP. Arsitektur modular (nwidart/laravel-modules) memastikan modul-modul ini dapat ditambahkan sebagai plug-in tanpa breaking changes pada sistem yang sudah berjalan:"),

        makeTable(
          ["No", "Modul", "Alasan Penangguhan", "Target Implementasi"],
          [
            ["6", "Kesiswaan", "Fitur sebagian tercover di modul Akademik", "Bulan 4-5"],
            ["7", "Tahfiz", "Spesifik untuk MTs tertentu, bukan universal", "Bulan 5-6"],
            ["8", "Inklusi", "Kompleksitas tinggi, pengguna sedikit", "Bulan 7-8"],
            ["9", "Sarana & Prasarana", "Prioritas rendah vs modul lain", "Bulan 9-10"],
            ["10", "BK / Konseling", "Data sensitif, perlu security ekstra", "Bulan 8-9"],
            ["11", "Ekstrakurikuler", "Nice-to-have, bukan core need", "Bulan 10-11"],
            ["12", "SDM / Kepegawaian", "Overlap dengan sistem yang ada", "Bulan 11-12"],
            ["13", "E-Office", "Kompleksitas workflow tinggi", "Bulan 12+"],
          ]
        ),

        h2("3.3 Visualisasi Matriks Prioritas"),
        insertImage("module_priority.png", 15),

        // ════════════════════════════════════════
        // SECTION 4: PERSONA & USER STORIES
        // ════════════════════════════════════════
        h1("4. Persona dan User Stories"),
        h2("4.1 Persona Utama"),
        h3("Persona 1: Pak Ahmad - Kepala Madrasah"),
        boldLabel("Peran", "Pengambil keputusan, monitor keseluruhan"),
        boldLabel("Usia", "45-55 tahun"),
        boldLabel("Literasi Digital", "Sedang (WhatsApp, Excel dasar)"),
        boldLabel("Kebutuhan", "Dashboard ringkas yang menampilkan kehadiran siswa/guru, progress akademik, status keuangan, dan notifikasi penting dalam satu tampilan"),
        boldLabel("Frustrasi", "Data tersebar di banyak Excel, laporan lambat, tidak bisa monitoring real-time"),

        h3("Persona 2: Bu Siti - Wali Kelas / Guru"),
        boldLabel("Peran", "Input presensi harian, input nilai, komunikasi dengan orang tua"),
        boldLabel("Usia", "25-45 tahun"),
        boldLabel("Literasi Digital", "Sedang-Tinggi (Google, WhatsApp aktif)"),
        boldLabel("Kebutuhan", "Interface cepat untuk input presensi dan nilai tanpa loading lama, notifikasi otomatis ke orang tua tanpa harus chat manual"),
        boldLabel("Frustrasi", "Rekap presensi manual tiap bulan, input nilai di Excel yang sering error, chat WA orang tua satu per satu"),

        h3("Persona 3: Pak Hidayat - Orang Tua Murid"),
        boldLabel("Peran", "Membayar SPP, memantau perkembangan anak"),
        boldLabel("Usia", "35-50 tahun"),
        boldLabel("Literasi Digital", "Sedang (WhatsApp, mobile banking)"),
        boldLabel("Kebutuhan", "Notifikasi WA otomatis saat anak tidak hadir, info tagihan SPP, nilai dan presensi anak bisa dicek kapan saja dari HP"),
        boldLabel("Frustrasi", "Tidak tahu anak tidak hadir sampai seminggu kemudian, lupa bayar SPP karena tidak ada reminder"),

        h3("Persona 4: Bu Rina - Tata Usaha"),
        boldLabel("Peran", "Administrasi keuangan, verifikasi pembayaran"),
        boldLabel("Usia", "30-45 tahun"),
        boldLabel("Literasi Digital", "Sedang-Tinggi (Excel, Word, Email)"),
        boldLabel("Kebutuhan", "Sistem tagihan otomatis, verifikasi pembayaran cepat, laporan keuangan bulanan yang rapi"),
        boldLabel("Frustrasi", "Mencatat pembayaran manual di buku, sulit melacak tunggakan, laporan keuangan memakan waktu berhari-hari"),

        h2("4.2 User Stories Prioritas"),
        makeTable(
          ["ID", "Sebagai", "Saya ingin", "Sehingga", "Prioritas"],
          [
            ["US-01", "Guru", "Input presensi harian per kelas", "Rekap otomatis tanpa manual", "P0"],
            ["US-02", "Guru", "Input nilai formatif dan sumatif", "Nilai tercatat terstruktur", "P0"],
            ["US-03", "Wali Kelas", "Generate rapor digital", "Tidak perlu ketik manual di RDM", "P0"],
            ["US-04", "Orang Tua", "Menerima notif WA saat anak alpa", "Segera tahu kehadiran anak", "P0"],
            ["US-05", "TU", "Membuat tagihan SPP bulanan", "Tagihan terstruktur dan otomatis", "P0"],
            ["US-06", "TU", "Verifikasi pembayaran masuk", "Status pembayaran selalu update", "P0"],
            ["US-07", "Orang Tua", "Melihat nilai dan presensi anak", "Memantau perkembangan anak", "P1"],
            ["US-08", "Kepala Madrasah", "Melihat dashboard statistik", "Monitoring real-time sekolah", "P1"],
            ["US-09", "Orang Tua", "Membayar SPP via transfer/VA", "Pembayaran lebih mudah", "P1"],
            ["US-10", "Admin", "Mengelola data siswa dan kelas", "Data terpusat dan akurat", "P0"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 5: FITUR MVP DETAIL
        // ════════════════════════════════════════
        h1("5. Fitur MVP Detail"),
        h2("5.1 Modul Core Platform"),
        para("Modul Core Platform merupakan fondasi dari seluruh sistem SIMT MTs. Tanpa modul ini, tidak ada modul lain yang dapat berfungsi. Modul ini menangani autentikasi, manajemen tenant (sekolah), RBAC (Role-Based Access Control), dan dashboard utama untuk setiap role. Arsitektur multi-tenant single-database digunakan untuk menghemat biaya infrastruktur, di mana setiap data diisolasi menggunakan tenant_id dan Laravel Global Scope."),

        h3("5.1.1 Autentikasi & Manajemen User"),
        bullet("Login dengan email/password menggunakan Laravel Breeze"),
        bullet("Reset password via email (atau WhatsApp untuk MVP)"),
        bullet("Profil user: nama, foto, role, sekolah terdaftar"),
        bullet("Session management: satu akun bisa aktif di banyak sekolah dengan role berbeda"),
        bullet("Forgot password dengan verifikasi email"),

        h3("5.1.2 Multi-Tenant Management"),
        bullet("Setiap sekolah (MTs) adalah satu tenant dengan tenant_id unik"),
        bullet("Onboarding: input data sekolah (nama, NPSN, alamat, logo) saat pertama kali"),
        bullet("Subscription plan: Basic (Akademik), Standard (+Keuangan), Premium (All)"),
        bullet("Tenant isolation: Global Scope memastikan query hanya mengembalikan data milik tenant tersebut"),
        bullet("Tenant switching untuk super-admin yang mengelola banyak sekolah"),

        h3("5.1.3 RBAC (Role-Based Access Control)"),
        para("Sistem RBAC menggunakan Spatie Laravel Permission dengan Teams. Setiap role terikat pada tenant (team_id), sehingga seorang guru bisa menjadi Admin di MTs-A namun hanya Guru biasa di MTs-B. Berikut role yang didefinisikan untuk MVP:"),

        makeTable(
          ["Role", "Tenant-Scoped", "Akses Utama"],
          [
            ["Super Admin", "Global", "Semua tenant, manajemen sistem"],
            ["Kepala Madrasah", "Per MTs", "Dashboard, monitoring, approval"],
            ["Waka Kurikulum", "Per MTs", "Akademik, supervisi, nilai"],
            ["Wali Kelas", "Per MTs", "Presensi, nilai kelas, rapor"],
            ["Guru", "Per MTs", "Presensi, nilai mapel, jurnal"],
            ["Tata Usaha", "Per MTs", "Keuangan, administrasi, verifikasi"],
            ["Orang Tua", "Per MTs", "Portal (Next.js), monitoring anak"],
          ]
        ),

        insertImage("rbac_matrix.png", 15),

        h2("5.2 Modul Akademik"),
        para("Modul Akademik adalah jantung dari SIMT MTs. Modul ini menangani seluruh proses pembelajaran mulai dari presensi harian, pencatatan nilai, hingga pembuatan rapor digital. Untuk MVP, fokus diarahkan pada fitur-fitur yang paling sering digunakan dan memberikan impact terbesar terhadap efisiensi kerja guru."),

        h3("5.2.1 Presensi Siswa"),
        bullet("Input kehadiran harian per kelas (Hadir, Izin, Sakit, Alpa)"),
        bullet("Rekap otomatis per minggu/bulan/semester"),
        bullet("Notifikasi WhatsApp otomatis ke orang tua jika siswa alpa/telat"),
        bullet("Keterlambatan: opsi input jam masuk, otomatis hitung menit keterlambatan"),
        bullet("Export rekap ke Excel/PDF untuk pelaporan"),
        insertImage("flow_presensi.png", 14),

        h3("5.2.2 Penilaian"),
        bullet("Input nilai formatif (per TP/Capaian Pembelajaran)"),
        bullet("Input nilai sumatif (per semester)"),
        bullet("Nilai projek P5RA (Rahmatan Lil Alamin) sesuai KMA 450/2023"),
        bullet("Deskripsi capaian otomatis berdasarkan rentang nilai"),
        bullet("Bobot penilaian dapat dikustomisasi per madrasah"),

        h3("5.2.3 E-Rapor"),
        bullet("Generate rapor digital dalam format PDF sesuai template Kurikulum Merdeka"),
        bullet("Tanda tangan digital Kepala Madrasah dan Wali Kelas"),
        bullet("Arsip rapor per semester, bisa diunduh kembali kapan saja"),
        bullet("Integrasi data dari modul penilaian dan presensi secara otomatis"),
        bullet("Kompatibilitas dengan RDM Kemenag (export format yang sesuai)"),

        h2("5.3 Modul Keuangan"),
        para("Modul Keuangan bukan hanya fitur administrasi, tetapi merupakan revenue engine dari model bisnis Micro SaaS. Modul ini mengelola tagihan SPP, mencatat pembayaran, dan menghasilkan laporan keuangan. Integrasi dengan payment gateway (Midtrans/Xendit BYOA) memberikan sumber passive income tambahan melalui markup admin Rp 1.500 per transaksi, sambil menjaga risiko hukum minimal karena uang mengalir langsung ke rekening sekolah."),

        h3("5.3.1 Tagihan & Pembayaran"),
        bullet("Buat tagihan SPP bulanan otomatis per siswa"),
        bullet("Tagihan tambahan: daftar ulang, wisuda, kegiatan khusus"),
        bullet("Notifikasi WhatsApp otomatis saat tagihan baru dan jatuh tempo"),
        bullet("Upload bukti transfer oleh orang tua via Portal"),
        bullet("Verifikasi pembayaran oleh TU (manual untuk MVP)"),
        bullet("Integrasi Midtrans/Xendit (BYOA - Bring Your Own Account) untuk pembayaran digital"),
        insertImage("flow_pembayaran.png", 14),

        h3("5.3.2 Laporan Keuangan"),
        bullet("Rekap pemasukan per bulan/semester/tahun"),
        bullet("Laporan tunggakan per siswa dan per kelas"),
        bullet("Export laporan ke Excel/PDF"),
        bullet("Dashboard visual: grafik pemasukan vs target"),

        h2("5.4 Portal Orang Tua (Next.js/React)"),
        para("Portal Orang Tua adalah satu-satunya bagian sistem yang menggunakan Next.js/React, bukan Laravel Blade. Keputusan ini diambil karena orang tua mengakses sistem via mobile browser dan membutuhkan pengalaman yang responsif dan cepat seperti aplikasi native. Admin dan guru menggunakan Laravel Blade yang lebih efisien untuk operasi CRUD berulang. Portal ini menjadi justifikasi utama bagi orang tua untuk membayar biaya langganan, karena memberikan transparansi informasi yang sebelumnya tidak tersedia."),

        bullet("Monitoring nilai anak per mapel per semester"),
        bullet("Monitoring kehadiran anak harian dan rekap"),
        bullet("Status tagihan SPP dan riwayat pembayaran"),
        bullet("Notifikasi dan pengumuman dari madrasah"),
        bullet("Profil anak dan data wali"),
        bullet("Responsive design untuk mobile-first experience"),

        h2("5.5 Modul Notifikasi WhatsApp"),
        para("Modul ini menggunakan pendekatan self-hosted Baileys (WhatsApp Web API) di mana setiap madrasah men-scan QR code WhatsApp mereka sendiri dari dashboard admin. Keputusan ini menghindarkan biaya operasional bulanan untuk API WhatsApp berbayar (yang bisa mencapai Rp 500.000-1.000.000/bulan), sekaligus memberikan kesan bahwa notifikasi berasal dari nomor resmi sekolah. Risiko banned akun diminimalisir dengan menjaga frekuensi pengiriman wajar dan tidak ada spam."),

        makeTable(
          ["Event Pemicu", "Penerima", "Isi Notifikasi", "Frekuensi"],
          [
            ["Siswa alpa/telat", "Orang Tua", "Nama siswa tidak hadir/telat X menit", "Real-time"],
            ["Tagihan baru", "Orang Tua", "Jumlah tagihan, jatuh tempo", "Bulanan"],
            ["Pembayaran diterima", "Orang Tua", "Konfirmasi pembayaran Rp X", "Real-time"],
            ["Nilai dirilis", "Orang Tua", "Nilai mapel X sudah bisa dilihat", "Per event"],
            ["Pengumuman sekolah", "Semua Orang Tua", "Isi pengumuman", "Sesuai kebutuhan"],
            ["Tunggakan >30 hari", "Orang Tua", "Reminder tunggakan Rp X", "Mingguan"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 6: REQUIREMENTS
        // ════════════════════════════════════════
        h1("6. Requirements"),
        h2("6.1 Functional Requirements"),
        makeTable(
          ["ID", "Requirement", "Modul", "Prioritas"],
          [
            ["FR-01", "Sistem harus mendukung multi-tenant dengan isolasi data per sekolah", "Core", "P0"],
            ["FR-02", "Sistem harus mendukung RBAC dengan minimal 7 role per tenant", "Core", "P0"],
            ["FR-03", "Guru harus bisa input presensi harian per kelas dalam <30 detik", "Akademik", "P0"],
            ["FR-04", "Sistem harus mengirim notifikasi WA otomatis saat siswa alpa", "Notifikasi", "P0"],
            ["FR-05", "Sistem harus generate rapor PDF sesuai format Kurikulum Merdeka", "Akademik", "P0"],
            ["FR-06", "TU harus bisa membuat dan mengelola tagihan SPP bulanan", "Keuangan", "P0"],
            ["FR-07", "Orang tua harus bisa melihat nilai, presensi, dan tagihan anak", "Portal", "P0"],
            ["FR-08", "Sistem harus mencatat audit trail untuk setiap perubahan data", "Core", "P1"],
            ["FR-09", "Sistem harus mendukung export data ke Excel/PDF", "Semua", "P1"],
            ["FR-10", "Dashboard Kepala Madrasah menampilkan KPI utama sekolah", "Core", "P1"],
            ["FR-11", "Sistem harus mengirim notif WA saat tagihan jatuh tempo", "Notifikasi", "P1"],
            ["FR-12", "Orang tua harus bisa upload bukti transfer pembayaran", "Keuangan", "P1"],
            ["FR-13", "Penilaian harus mendukung formatif, sumatif, dan projek P5RA", "Akademik", "P0"],
            ["FR-14", "Sistem harus kompatibel dengan data DAPODIK dan EMIS", "Core", "P2"],
            ["FR-15", "Super admin harus bisa mengelola banyak tenant dari satu dashboard", "Core", "P1"],
          ]
        ),

        h2("6.2 Non-Functional Requirements"),
        makeTable(
          ["ID", "Kategori", "Requirement", "Target"],
          [
            ["NFR-01", "Performance", "Halaman dashboard loading time", "<3 detik pada koneksi 5Mbps"],
            ["NFR-02", "Performance", "Input presensi per kelas", "<30 detik end-to-end"],
            ["NFR-03", "Scalability", "Konkuren user per tenant", "50 user concurrent"],
            ["NFR-04", "Scalability", "Jumlah tenant dalam 1 database", "100 tenant pada VPS 2GB"],
            ["NFR-05", "Availability", "Uptime SLA", "99% (bulan 1-3), 99.5% (bulan 4+)"],
            ["NFR-06", "Security", "Enkripsi data in-transit", "SSL/TLS mandatory"],
            ["NFR-07", "Security", "Enkripsi data at-rest", "AES-256 untuk data sensitif (NIK, keuangan)"],
            ["NFR-08", "Security", "Authentication", "bcrypt password hashing, session timeout 8 jam"],
            ["NFR-09", "Usability", "Learning curve guru", "<2 jam training untuk operasi dasar"],
            ["NFR-10", "Compatibility", "Browser support", "Chrome 90+, Firefox 88+, Safari 14+"],
            ["NFR-11", "Compatibility", "Device support", "Desktop, tablet, mobile browser"],
            ["NFR-12", "Backup", "Data backup frequency", "Harian (database dump + file storage)"],
          ]
        ),

        h2("6.3 Data Requirements"),
        para("Data yang dikelola sistem SIMT MTs mencakup data pribadi siswa dan guru yang bersifat sensitif (NIK, alamat, nilai), data keuangan (tagihan, pembayaran), serta data akademik (presensi, penilaian). Seluruh data harus diproses sesuai dengan UU Perlindungan Data Pribadi (UU PDP) dan terintegrasi dengan standar data pendidikan Kemendikdasmen (NISN, NPSN) dan Kemenag (EMIS). Mekanisme data retention dan deletion policy harus diimplementasikan, termasuk hak orang tua untuk meminta penghapusan data anak mereka saat tidak lagi terdaftar."),

        h2("6.4 Integration Requirements"),
        makeTable(
          ["Sistem", "Jenis Integrasi", "Data yang Dipertukarkan", "Prioritas"],
          [
            ["DAPODIK (Kemendikdasmen)", "Export/Manual sync", "Data siswa, NISN, NPSN, rombel", "P2 (post-MVP)"],
            ["EMIS (Kemenag)", "Export/Manual sync", "Data madrasah, guru, siswa", "P2 (post-MVP)"],
            ["RDM (Kemenag)", "Template compatibility", "Format rapor sesuai standar RDM", "P1"],
            ["Simpatika (Kemenag)", "Reference only", "Referensi kode mapel dan jenjang", "P2"],
            ["WhatsApp (Baileys)", "Self-hosted API", "Notifikasi otomatis", "P0"],
            ["Midtrans/Xendit", "BYOA Payment Gateway", "Pembayaran digital", "P1"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 7: DESIGN
        // ════════════════════════════════════════
        h1("7. Design"),
        h2("7.1 Arsitektur Sistem"),
        para("Arsitektur SIMT MTs mengadopsi pendekatan Hybrid Rendering yang menggabungkan Laravel Blade Components untuk admin/guru (yang membutuhkan CRUD cepat dan server-side rendering yang ringan) dengan Next.js/React untuk Portal Orang Tua (yang membutuhkan pengalaman responsif seperti mobile app). Kedua frontend ini berkomunikasi dengan backend Laravel melalui REST API yang sama, memastikan konsistensi data dan logika bisnis. Seluruh sistem berjalan di satu VPS 2GB RAM dengan biaya Rp 300.000/bulan, menjadikannya sangat hemat operasional."),

        insertImage("system_architecture.png", 15),

        h2("7.2 Arsitektur Multi-Tenant"),
        para("Pendekatan Single-Database Multi-Tenant dipilih untuk menghemat biaya infrastruktur. Setiap tabel database memiliki kolom tenant_id yang secara otomatis difilter oleh Laravel Global Scope. Hal ini memastikan bahwa sekolah A tidak pernah bisa mengakses data sekolah B, bahkan jika terjadi bug dalam kode. Mekanisme tenant resolution dilakukan berdasarkan subdomain (mts1.simt.id, mts2.simt.id) atau berdasarkan user session untuk akses yang sudah login."),

        insertImage("multitenant_architecture.png", 15),

        h2("7.3 Database Schema (ERD)"),
        para("Berikut adalah Entity Relationship Diagram untuk skema database MVP. Desain ini mengikuti prinsip normalization yang wajar dengan denormalization selektif pada kolom yang sering di-query untuk performance. Semua tabel memiliki kolom tenant_id untuk isolasi multi-tenant dan timestamps (created_at, updated_at) untuk audit trail."),

        insertImage("erd_diagram.png", 15),

        h2("7.4 Tech Stack MVP"),
        makeTable(
          ["Layer", "Teknologi", "Versi", "Alasan Pemilihan"],
          [
            ["Backend", "Laravel", "11.x", "Ekosistem mature, dokumentasi lengkap, community besar"],
            ["Admin Frontend", "Laravel Blade + Livewire", "3.x", "SSR cepat, hemat resource, cocok untuk CRUD intensif"],
            ["Parent Portal", "Next.js + React", "14.x", "SSR/SSG, mobile-first, PWA-ready"],
            ["Database", "MySQL", "8.x", "Kompatibel DAPODIK, mudah di-host, hemat RAM"],
            ["Cache", "Redis", "7.x", "Session, queue, cache dashboard statistics"],
            ["Module System", "nwidart/laravel-modules", "latest", "Plug & Play, isolasi kode per modul"],
            ["RBAC", "spatie/laravel-permission", "6.x", "Proven, Teams support, performant"],
            ["Auth", "laravel/breeze", "2.x", "Lightweight, customizable"],
            ["PDF", "barryvdh/laravel-dompdf", "2.x", "Generate rapor PDF"],
            ["Excel", "maatwebsite/laravel-excel", "3.x", "Import/export data"],
            ["WhatsApp", "self-hosted Baileys", "latest", "Zero-cost, QR scan per madrasah"],
            ["Payment", "midtrans/midtrans-php", "latest", "BYOA, VA + e-wallet support"],
            ["Web Server", "Nginx", "latest", "Reverse proxy, SSL termination"],
            ["VPS", "IDCloudHost/Niagahoster", "2GB RAM", "Biaya Rp 300.000/bulan"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 8: TASK & SPRINT PLANNING
        // ════════════════════════════════════════
        h1("8. Task dan Sprint Planning"),
        h2("8.1 Timeline Overview"),
        para("MVP dikembangkan dalam 3 Sprint masing-masing 4 minggu, total 12 minggu (3 bulan). Setiap Sprint memiliki deliverable yang dapat didemonstrasikan kepada stakeholder, memastikan feedback loop yang pendek dan penyesuaian arah jika diperlukan. Pendekatan Agile/Scrum diadopsi dengan daily standup (asynchronous via WhatsApp) dan sprint review setiap akhir sprint."),

        insertImage("sprint_timeline.png", 15),

        h2("8.2 Sprint 1: Foundation (Minggu 1-4)"),
        para("Sprint pertama berfokus pada pembangunan fondasi teknis: setup infrastruktur, autentikasi, multi-tenant, dan RBAC. Tanpa fondasi ini, tidak ada modul lain yang bisa dibangun. Tujuan akhir Sprint 1 adalah sistem yang bisa di-deploy, bisa login, dan bisa mengelola user dengan role yang berbeda."),

        makeTable(
          ["Task ID", "Task", "Estimasi", "Output"],
          [
            ["S1-T01", "Setup VPS, Nginx, MySQL, Redis, SSL", "3 hari", "Server siap production"],
            ["S1-T02", "Setup repo Laravel + nwidart/modules", "1 hari", "Skeleton project"],
            ["S1-T03", "Implementasi multi-tenant (Global Scope + Middleware)", "4 hari", "Tenant isolation bekerja"],
            ["S1-T04", "Implementasi Auth (Breeze) + Login/Register", "3 hari", "User bisa login"],
            ["S1-T05", "Implementasi RBAC Spatie Teams + Seeder", "4 hari", "Role & permission bekerja"],
            ["S1-T06", "Dashboard utama per role (Blade)", "3 hari", "Dashboard render"],
            ["S1-T07", "CRUD data siswa + kelas (Blade)", "4 hari", "Data siswa bisa dikelola"],
            ["S1-T08", "Onboarding flow untuk tenant baru", "2 hari", "Sekolah bisa mendaftar"],
          ]
        ),

        h2("8.3 Sprint 2: Core Features (Minggu 5-8)"),
        para("Sprint kedua mengembangkan fitur-fitur inti yang menjadi alasan utama sekolah menggunakan sistem: presensi, penilaian, rapor, dan manajemen keuangan. Pada akhir Sprint 2, sistem sudah bisa digunakan untuk operasional harian sekolah (presensi, input nilai, tagihan SPP) meskipun belum ada portal orang tua."),

        makeTable(
          ["Task ID", "Task", "Estimasi", "Output"],
          [
            ["S2-T01", "Modul Presensi: input harian, rekap, export", "5 hari", "Presensi bekerja penuh"],
            ["S2-T02", "Modul Penilaian: formatif, sumatif, P5RA", "5 hari", "Input nilai bekerja"],
            ["S2-T03", "E-Rapor: generate PDF + template Kurikulum Merdeka", "5 hari", "Rapor bisa dicetak"],
            ["S2-T04", "Modul Keuangan: tagihan SPP, pembayaran, verifikasi", "5 hari", "Keuangan bekerja"],
            ["S2-T05", "Laporan keuangan + rekap tunggakan", "3 hari", "Laporan otomatis"],
            ["S2-T06", "Setup WhatsApp Baileys + QR scan per tenant", "4 hari", "WA notif bekerja"],
            ["S2-T07", "Notifikasi WA: alpa, tagihan, pengumuman", "3 hari", "Auto-notif aktif"],
          ]
        ),

        h2("8.4 Sprint 3: Portal & Launch (Minggu 9-12)"),
        para("Sprint terakhir melengkapi sistem dengan Portal Orang Tua (Next.js), melakukan integrasi akhir, pengujian menyeluruh (UAT), dan persiapan go-live. Pada akhir Sprint 3, sistem harus siap digunakan oleh pilot school pertama dengan semua fitur MVP berfungsi."),

        makeTable(
          ["Task ID", "Task", "Estimasi", "Output"],
          [
            ["S3-T01", "Setup Next.js project + API integration", "3 hari", "Portal skeleton"],
            ["S3-T02", "Portal Orang Tua: monitoring nilai & presensi", "4 hari", "Nilai & presensi tampil"],
            ["S3-T03", "Portal Orang Tua: tagihan & pembayaran", "3 hari", "Keuangan tampil di portal"],
            ["S3-T04", "Portal Orang Tua: profil & notifikasi", "2 hari", "Profil & notif tampil"],
            ["S3-T05", "Integrasi Midtrans/Xendit BYOA", "3 hari", "Pembayaran digital aktif"],
            ["S3-T06", "UAT dengan pilot school", "4 hari", "Bug list & feedback"],
            ["S3-T07", "Bug fixing & performance optimization", "3 hari", "Stable release"],
            ["S3-T08", "Go-live + training admin/guru pilot school", "2 hari", "Sistem live!"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 9: BUDGET
        // ════════════════════════════════════════
        h1("9. Alokasi Budget"),
        para("Dengan total budget Rp 5.000.000 untuk 3 bulan, alokasi harus dilakukan secara sangat efisien. Prinsip utama adalah meminimalkan biaya operasional (Opex) dan memaksimalkan nilai dari development effort. Solo developer dengan pengalaman Laravel + Next.js adalah asumsi tim, sehingga biaya development difokuskan pada kompensasi developer tunggal."),

        insertImage("budget_allocation.png", 13),

        makeTable(
          ["No", "Item", "Detail", "Biaya (Rp)"],
          [
            ["1", "VPS 3 Bulan (2GB RAM)", "IDCloudHost/Niagahoster, Rp 300rb/bln", "900.000"],
            ["2", "Domain + SSL", "simt.id + SSL gratis Let's Encrypt", "200.000"],
            ["3", "Development (Solo Dev)", "Kompensasi 3 bulan @ Rp 833rb", "2.500.000"],
            ["4", "Testing & QA", "Manual testing, UAT, bug bounties", "500.000"],
            ["5", "Buffer/Contingency", "18% untuk kebutuhan tak terduga", "900.000"],
            ["", "TOTAL", "", "5.000.000"],
          ]
        ),

        h2("9.1 Proyeksi Revenue vs Cost"),
        para("Dengan model B2B2C Pay-Per-Student Rp 2.000/siswa/bulan dan minimum tagihan Rp 200.000/bulan per sekolah, berikut proyeksi cashflow:"),

        makeTable(
          ["Bulan", "Jumlah MTs", "Rata-rata Siswa", "Revenue", "Opex", "Net Cash"],
          [
            ["Bulan 1-3 (Dev)", "0", "-", "0", "1.100.000", "-1.100.000"],
            ["Bulan 4 (Launch)", "2", "100", "400.000", "300.000", "100.000"],
            ["Bulan 6", "5", "100", "1.000.000", "300.000", "700.000"],
            ["Bulan 9", "8", "120", "1.920.000", "300.000", "1.620.000"],
            ["Bulan 12", "10", "120", "2.400.000", "300.000", "2.100.000"],
            ["Bulan 18", "20", "130", "5.200.000", "400.000", "4.800.000"],
            ["Bulan 24", "30", "130", "7.800.000", "500.000", "7.300.000"],
          ]
        ),
        para("Break-even tercapai pada bulan ke-18 (akumulasi revenue melebihi total investasi). Profitabilitas berkelanjutan dimulai bulan ke-24 dengan net margin >90% karena biaya operasional relatif flat."),

        // ════════════════════════════════════════
        // SECTION 10: RISK
        // ════════════════════════════════════════
        h1("10. Risiko dan Mitigasi"),

        makeTable(
          ["ID", "Risiko", "Probabilitas", "Dampak", "Mitigasi"],
          [
            ["R01", "Budget overrun melebihi Rp 5jt", "Medium", "High", "Scope freeze di MVP; fitur tambahan ditangguhkan; buffer 18%"],
            ["R02", "Timeline 3 bulan tidak tercapai", "Medium", "High", "Agile sprint; deliverable per sprint; prioritas P0 first"],
            ["R03", "User adoption rendah di pilot school", "Medium", "High", "Training intensif; on-site support minggu pertama; UX sederhana"],
            ["R04", "WhatsApp Baileys di-banned Meta", "Low", "High", "Frekuensi wajar; tidak spam; fallback ke SMS jika terjadi"],
            ["R05", "VPS down saat periode kritis (ujian)", "Low", "Very High", "Uptime monitoring; auto-restart; backup harian"],
            ["R06", "Security breach / data leak", "Low", "Very High", "Global Scope; parameter binding; SSL mandatory; audit trail"],
            ["R07", "Kompetitor launch lebih dulu", "Low", "Medium", "Fokus differentiator (Tahfiz, Inklusi, WA zero-cost)"],
            ["R08", "Solo developer burnout/sakit", "Medium", "Very High", "Dokumentasi lengkap; modular code; knowledge base tertulis"],
            ["R09", "Integrasi DAPODIK/EMIS bermasalah", "Medium", "Medium", "Export manual untuk MVP; otomasi di fase selanjutnya"],
            ["R10", "Orang tua menolak bayar biaya langganan", "Medium", "High", "Model pay-per-student Rp 2.000; paket semester di muka"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 11: SUCCESS METRICS
        // ════════════════════════════════════════
        h1("11. Success Metrics (KPI)"),
        h2("11.1 KPI Teknis (MVP Launch)"),
        makeTable(
          ["KPI", "Target MVP", "Target Bulan 6"],
          [
            ["Page load time (dashboard)", "<3 detik", "<2 detik"],
            ["Uptime", "99%", "99.5%"],
            ["Bug rate per sprint", "<5 critical", "<2 critical"],
            ["Code coverage", ">60%", ">80%"],
            ["API response time (P95)", "<500ms", "<300ms"],
          ]
        ),

        h2("11.2 KPI Bisnis (Quarterly Review)"),
        makeTable(
          ["KPI", "Q1 Target", "Q2 Target", "Q3 Target"],
          [
            ["Active Monthly Schools", "2", "5", "10"],
            ["Monthly Recurring Revenue", "Rp 400.000", "Rp 1.000.000", "Rp 2.400.000"],
            ["Churn Rate", "<20%", "<15%", "<10%"],
            ["NPS (Net Promoter Score)", ">30", ">40", ">50"],
            ["Avg. Daily Active Users per School", "5", "8", "12"],
          ]
        ),

        h2("11.3 KPI Pengguna (Per School)"),
        makeTable(
          ["KPI", "Target"],
          [
            ["Guru input presensi harian", ">90% hari kerja"],
            ["Guru input nilai tepat waktu", ">80% sebelum deadline"],
            ["Orang tua login portal bulanan", ">60% orang tua aktif"],
            ["Pembayaran SPP tepat waktu via sistem", ">50% pembayaran via portal"],
            ["Tingkat kepuasan guru (survey)", ">7/10"],
          ]
        ),

        // ════════════════════════════════════════
        // SECTION 12: MARKET ANALYSIS
        // ════════════════════════════════════════
        h1("12. Analisis Pasar"),
        para("Analisis pasar difokuskan pada Malang, Jawa Timur sebagai pilot city. Malang dipilih karena konsentrasi MTs/SMP yang tinggi, literasi digital guru yang relatif baik, dan kedekatan geografis untuk pendampingan on-site jika diperlukan. Data dari Kemenag dan Kemendikdasmen menunjukkan terdapat sekitar 150 MTs swasta dan 200 SMP swasta di area Greater Malang, menjadikannya market yang cukup besar untuk validasi model bisnis."),

        insertImage("market_analysis.png", 15),

        makeTable(
          ["Segmen", "Estimasi Jumlah", "Penetrasi Target", "Revenue Potensi/bulan"],
          [
            ["MTs Swasta (Kemenag) - Malang", "~150 sekolah", "10% (15 sekolah)", "3.000.000"],
            ["SMP Swasta (Kemendikbud) - Malang", "~200 sekolah", "5% (10 sekolah)", "2.000.000"],
            ["Total Addressable (Malang)", "~350 sekolah", "7% (25 sekolah)", "5.000.000"],
            ["Ekspansi Jawa Timur", "~3.000 sekolah", "2% (60 sekolah)", "12.000.000"],
          ]
        ),
        para("Kompetitor di pasar Indonesia antara lain: Rapor Kurikulum (fokus rapor saja), SekolahKu (biaya tinggi), dan EMIS/Dapodik resmi (fitur terbatas). SIMT MTs berbeda dengan menggabungkan fitur khusus Madrasah (Tahfiz, Inklusi, P5RA), harga terjangkau (Pay-Per-Student), dan WhatsApp notifikasi zero-cost sebagai differentiator utama."),

        // ════════════════════════════════════════
        // SECTION 13: NEXT STEPS
        // ════════════════════════════════════════
        h1("13. Langkah Selanjutnya"),
        para("Setelah PRD ini disetujui, langkah implementasi segera adalah sebagai berikut:"),
        h2("13.1 Minggu Pertama (Kickoff)"),
        bullet("Setup VPS dan konfigurasi infrastruktur dasar (Nginx, MySQL, Redis, SSL)"),
        bullet("Inisialisasi repository Git dengan struktur Laravel modular (nwidart/laravel-modules)"),
        bullet("Konfigurasi CI/CD pipeline sederhana (GitHub Actions untuk auto-deploy)"),
        bullet("Rekrutmen/persetujuan pilot school pertama (target: 1-2 MTs di Malang)"),
        h2("13.2 Minggu Kedua-Ketiga (Core Development)"),
        bullet("Implementasi multi-tenant architecture dan Global Scope"),
        bullet("Setup authentication dan RBAC Spatie Teams"),
        bullet("CRUD data master: siswa, kelas, guru, mapel"),
        bullet("Dashboard dasar per role"),
        h2("13.3 Minggu Keempat (Review & Iteration)"),
        bullet("Sprint 1 Review dengan stakeholder"),
        bullet("Demo sistem dasar ke pilot school"),
        bullet("Feedback collection dan backlog refinement untuk Sprint 2"),
        bullet("Dokumentasi API endpoint yang sudah dibangun"),
      ],
    },
  ],
});

// ── Generate ──
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/z/my-project/download/PRD_MVP_SIMT_MTs_3Bulan_5Juta.docx", buf);
  console.log("Document generated successfully!");
  console.log("File: /home/z/my-project/download/PRD_MVP_SIMT_MTs_3Bulan_5Juta.docx");
  console.log("Size:", (buf.length / 1024).toFixed(1), "KB");
});
