# 13 — Dev Report: PWA Mobile-First + Offline Sync Implementation

> **Tanggal:** 2026-06-16  
> **Status:** ✅ Phase 1–4 Selesai — Build Sukses  
> **Build Result:** `✓ Compiled successfully in 9.3s`

---

## Ringkasan Eksekusi

Implementasi transformasi arsitektur **SIMT Portal Ortu** dari setup Prisma+Laravel ganda menjadi arsitektur tunggal yang bersih: **Laravel sebagai source of truth**, **Dexie IndexedDB sebagai offline cache di browser**, dan **Serwist Service Worker** sebagai jembatan online/offline.

---

## File yang Dihapus

| File | Alasan |
|------|--------|
| `prisma/schema.prisma` | Dead code — tidak ada route yang memakainya |
| `prisma/seed.ts` | Tidak relevan tanpa Prisma |
| `prisma/prepare.js` | Script build untuk Prisma |
| `src/lib/db.ts` | PrismaClient initialization — tidak dipakai |

**Packages dihapus dari `package.json`:**
- `@prisma/client` `^6.11.1`
- `prisma` `^6.11.1`
- `@prisma/adapter-neon` `^7.8.0`
- `@neondatabase/serverless` `^1.1.0`
- `z-ai-web-dev-sdk` `^0.0.17` ← Z.AI scaffold artifact

---

## File yang Dimodifikasi

### `package.json`
```diff
-  "name": "nextjs_tailwind_shadcn_ts",
+  "name": "simt-portal-ortu",
   "scripts": {
-    "build": "node prisma/prepare.js && next build",
-    "postinstall": "node prisma/prepare.js && prisma generate",
-    "db:push": "prisma db push",
-    "db:generate": "prisma generate",
-    "db:migrate": "prisma migrate dev",
-    "db:reset": "prisma migrate reset"
+    "build": "next build",
   },
   "dependencies": {
-    "@neondatabase/serverless": "^1.1.0",
-    "@prisma/adapter-neon": "^7.8.0",
-    "@prisma/client": "^6.11.1",
-    "prisma": "^6.11.1",
-    "z-ai-web-dev-sdk": "^0.0.17",
+    "@serwist/next": "^9.0.0",
+    "dexie": "^4.0.10",
+    "dexie-react-hooks": "^1.1.7-beta.6",
+    "serwist": "^9.0.0",
   }
```

### `next.config.ts`
- Wrap dengan `withSerwistInit()` dari `@serwist/next`
- Fix Turbopack compatibility: `disable: process.env.NODE_ENV !== "production"`
- Tambah `turbopack: {}` untuk suppress webpack/turbopack conflict error

### `src/app/layout.tsx`
- Ubah manifest pointer: `manifest.json` → `manifest.webmanifest`
- Hapus manual Service Worker registration script (Serwist handles it)
- Tambah import & render `<OfflineBanner />`

### `src/lib/bff-client.ts`
- **Hapus** seluruh localStorage cache layer (`getCached`, `setCache`, `CACHE_KEYS`)
- Cache kini dihandle transparan oleh Service Worker (Serwist)
- Simplifikasi `request()` — fokus pada HTTP communication saja
- Pertahankan `clearCache()` sebagai legacy compat

### `src/lib/auth.ts`
- Hapus `import { db } from '@/lib/db'`
- Hapus semua Prisma query (`db.student.findMany`, dll.)
- Pertahankan type exports (`ParentSession`) untuk backward compatibility
- Fungsi `getParentStudents` dan `getStudentDashboard` jadi stub dengan console.warn

### 5 Legacy API Routes → Proxy ke BFF

Route lama yang langsung query Prisma diubah menjadi proxy ke BFF layer:

| Route Lama | Sebelum | Sesudah |
|------------|---------|---------|
| `GET /api/auth` | `db.student.findMany()` | Proxy ke `/api/bff/auth/parent-login` |
| `POST /api/student-auth` | `db.student.findFirst()` | Proxy ke `/api/bff/auth/student-login` |
| `GET /api/dashboard` | 5 Prisma queries paralel | Proxy ke `/api/bff/portal/students/[id]/dashboard` |
| `GET /api/student-dashboard` | 7 Prisma queries paralel | Proxy ke `/api/bff/portal/students/[id]/student-dashboard` |
| `GET /api/grade-details` | `db.gradeDetail.findMany()` | Proxy ke `/api/bff/portal/students/[id]/subjects/[id]/grade-details` |

Semua proxy menggunakan **cookie forwarding** (`Cookie` header) agar auth token diteruskan ke BFF.

---

## File Baru Dibuat

### PWA Foundation

#### `public/manifest.webmanifest`
PWA manifest dengan konfigurasi:
- `display: "standalone"` — berjalan seperti native app
- `orientation: "portrait"` — mobile-first
- `theme_color: "#047857"` — hijau madrasah
- Icon set: 72px hingga 512px + maskable untuk Android adaptive icon
- **3 Shortcuts**: Nilai, Absensi, SPP — bisa diakses dari long-press icon

#### `src/sw.ts`
Service Worker dengan **6 cache strategy** berbeda:

```
/api/bff/portal/students/[id]/grades/*     → Cache First  (24 jam)
/api/bff/portal/students/[id]/schedule/*   → Stale While Revalidate (24 jam)
/api/bff/portal/students/[id]/announcements/* → Stale While Revalidate (1 jam)
/api/bff/portal/students/[id]/subjects/*   → Cache First (24 jam)
/api/bff/portal/students/*                 → Network First (5 menit, timeout 5s)
/api/bff/portal/students/[id]/payments/*   → Network Only ← data keuangan!
/api/bff/auth/*                            → Network Only ← keamanan!
/_next/static/*                            → Cache First (1 tahun)
/(icons|images)/*                          → Cache First (30 hari)
```

### Dexie IndexedDB Layer

#### `src/lib/local-db.ts`
Schema Dexie IndexedDB — "Prisma di sisi browser":
- Table `dashboards` — cache response dashboard orang tua
- Table `studentDashboards` — cache response dashboard siswa
- Table `gradeDetails` — cache detail nilai per mata pelajaran
- Table `syncQueue` — antrian write yang tertunda saat offline
- Table `meta` — metadata (last_hydrate timestamp, dll.)

#### `src/lib/sync-manager.ts`
Processor antrian sync:
- `enqueueWrite(endpoint, method, payload)` — tambah ke antrian saat offline
- `processSyncQueue()` — proses semua pending, kirim ke BFF/Laravel
- Exponential backoff: retry interval `1s → 2s → 4s → 8s → 16s` (max 5 menit)
- Kirim header `X-Idempotency-Key` (UUID) ke setiap request → Laravel dapat deduplicate
- Max 5 retries sebelum item ditandai permanently failed

#### `src/lib/cache-hydrator.ts`
Pre-warm cache setelah login:
- `hydrateStudentCache({ studentId, role })` — fetch dashboard + simpan ke Dexie
- Dipanggil **background** setelah login sukses (non-blocking, tidak gagalkan login)
- Support role `'parent'` dan `'student'`
- `isCacheHydrated(studentId, role)` — cek apakah cache masih valid
- `getCachedDashboard(studentId, role)` — ambil data dari Dexie

### React Hooks

#### `src/hooks/useOfflineSync.ts`
- Deteksi `navigator.onLine` + event listeners `online`/`offline`
- Auto-trigger `processSyncQueue()` dengan delay 1 detik saat online kembali
- **iOS Safari fallback**: polling setiap 30 detik saat online + ada pending items
- Returns: `{ isOnline, pendingSyncCount, isSyncing, lastSyncAt, triggerSync }`

#### `src/hooks/useLocalData.ts`
Baca data offline via Dexie React Hooks (`useLiveQuery`):
- `useLocalDashboard(studentId)` — reactive read cached dashboard
- `useLocalStudentDashboard(studentId)` — reactive read cached student dashboard
- `useLocalGradeDetails(studentId, subjectId)` — reactive read cached grade details
- `useHasLocalData(studentId)` — cek apakah ada data di IndexedDB

### UI Components

#### `src/components/offline-banner.tsx`
Banner sticky top yang muncul otomatis:
- **Offline**: banner amber + icon WifiOff + pesan "Mode offline — data tersimpan lokal"
- **Syncing**: banner biru + spinner + "Menyinkronkan data ke server..."
- **Pending sync**: banner hijau + clock + "{n} perubahan belum tersimpan"
- Tombol "Sync" untuk trigger manual sync
- Auto-hide saat online dan tidak ada pending items

---

## Arsitektur Final

```
DEVICE (Browser/HP)
├── Next.js UI (React 19)
│   └── useOfflineSync + useLocalData hooks
│
├── Service Worker (Serwist)
│   ├── Cache static assets (Cache First)
│   ├── Cache API responses (Network First/Cache First/SWR)
│   └── Network Only untuk payment + auth
│
├── Dexie IndexedDB
│   ├── Dashboard cache (parent + student)
│   ├── Grade details cache
│   └── Sync queue (pending writes)
│
└── BFF Client (HTTP)
    ↓ HTTPS saat online
    
Next.js BFF (/api/bff/*)
↓
Laravel API (source of truth)
↓
MySQL / PostgreSQL
```

---

## Build Output

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api
├ ƒ /api/auth              ← Legacy (proxy ke BFF)
├ ƒ /api/bff/auth/logout
├ ƒ /api/bff/auth/parent-login
├ ƒ /api/bff/auth/student-login
├ ƒ /api/bff/portal/students/[studentId]/dashboard
├ ƒ /api/bff/portal/students/[studentId]/student-dashboard
├ ƒ /api/dashboard          ← Legacy (proxy ke BFF)
├ ƒ /api/grade-details      ← Legacy (proxy ke BFF)
├ ƒ /api/student-auth       ← Legacy (proxy ke BFF)
├ ƒ /api/student-dashboard  ← Legacy (proxy ke BFF)
└ ƒ /api/upload

✓ Compiled successfully in 9.3s
31 packages added, 39 packages removed
```

---

## Catatan Teknis

### Turbopack Compatibility
Next.js 16 menggunakan Turbopack by default. Serwist menggunakan webpack plugin yang tidak kompatibel dengan Turbopack saat development. Solusi:
- `disable: process.env.NODE_ENV !== "production"` → SW hanya aktif di production build
- `turbopack: {}` di nextConfig → suppress webpack/turbopack conflict error
- Development tetap berjalan normal tanpa Service Worker

### iOS Safari Limitation
Background Sync API tidak didukung di Safari iOS. Solusi polling sudah diimplementasi di `useOfflineSync.ts` — check setiap 30 detik jika ada pending items.

### Idempotency Key
Setiap item di syncQueue punya UUID `idempotencyKey`. Dikirim sebagai header `X-Idempotency-Key` ke Laravel. **Laravel perlu implementasi Idempotency Middleware** untuk mencegah duplikasi jika request terkirim dua kali.

---

## Yang Tersisa (Sisa Pekerjaan)

| Item | Priority | Keterangan |
|------|----------|------------|
| Generate PWA icon set | 🔴 Tinggi | Butuh file PNG di `/public/icons/` |
| Integrasi `hydrateStudentCache()` di `page.tsx` | 🔴 Tinggi | Panggil setelah login sukses |
| Laravel: Idempotency Middleware | 🟠 Sedang | Untuk sync write offline |
| Lighthouse PWA audit | 🟡 Rendah | Jalankan saat ada icons |
| Test offline di Chrome DevTools | 🟡 Rendah | Manual testing |
| Test install di Android | 🟡 Rendah | Manual testing |

---

*Dev report dibuat: 2026-06-16*  
*Dokumen terkait: [12-PWA-OFFLINE-SYNC-RANCANGAN.md](./12-PWA-OFFLINE-SYNC-RANCANGAN.md)*
