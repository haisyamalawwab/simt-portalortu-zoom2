# 12 — Rancangan: PWA Mobile-First + Offline Sync Architecture

> **Status:** Draft — Menunggu Persetujuan  
> **Dibuat:** 2026-06-16  
> **Scope:** SIMT Portal Ortu (Next.js) — transformasi arsitektur

---

## 1. Latar Belakang & Masalah

### Kondisi Saat Ini

```
simt-portalortu (Next.js)
├── prisma/schema.prisma       ← DEAD CODE (tidak ada route yang pakai)
├── src/lib/db.ts              ← DEAD CODE (PrismaClient tidak dipakai)
└── src/app/api/bff/           ← Yang BENAR-BENAR dipakai
    ├── auth/student-login/    ← proxy ke Laravel :8000
    ├── auth/parent-login/     ← proxy ke Laravel :8000
    └── portal/students/       ← proxy ke Laravel :8000
```

**Masalah yang teridentifikasi:**

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | Prisma schema duplikasi model Laravel | Membingungkan, maintenance overhead |
| 2 | `bff-client.ts` pakai `localStorage` sebagai cache | Kapasitas 5MB, sync tidak reliable, tidak berfungsi offline sejati |
| 3 | Tidak ada Service Worker | Tidak bisa install sebagai PWA, tidak ada offline support |
| 4 | Tidak ada manifest PWA | Tidak bisa "Add to Home Screen" |
| 5 | Cache hanya di memory/localStorage | Hilang saat tab ditutup |

### Arsitektur yang Diinginkan

Aplikasi harus bisa:
- ✅ Diinstal di HP (Android/iOS) seperti native app
- ✅ Buka halaman nilai/absensi/SPP walau **tanpa internet**
- ✅ Sync otomatis ke Laravel saat **internet tersambung kembali**
- ✅ Tampilan **mobile-first** yang nyaman di HP sekolah murid

---

## 2. Keputusan Arsitektur

### 2.1 Diagram Sistem Final

```
┌────────────────────────────────────────────────────────────────────┐
│                    DEVICE (HP Android/iOS/Browser)                 │
│                                                                    │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐   │
│  │  Next.js UI │◄──►│  Zustand Store  │◄──►│   Dexie.js       │   │
│  │  (React 19) │    │  (UI State +    │    │   IndexedDB      │   │
│  └─────────────┘    │   optimistic)   │    │                  │   │
│                     └─────────────────┘    │  ┌────────────┐  │   │
│  ┌──────────────────────────────────────►  │  │ Cache Data │  │   │
│  │         Service Worker (Serwist)     │  │  │ (offline)  │  │   │
│  │                                      │  │  ├────────────┤  │   │
│  │  ┌──────────────────────────────┐    │  │  │ SyncQueue  │  │   │
│  │  │      Cache Strategy Router   │    │  │  │ (pending   │  │   │
│  │  │                              │    │  │  │  writes)   │  │   │
│  │  │  Static  → Cache First       │    │  │  └────────────┘  │   │
│  │  │  GET API → Network+IDB Fall  │    │  └──────────────────┘   │
│  │  │  POST    → Queue if offline  │◄───┘                         │
│  │  │  Payment → Network Only      │                              │
│  │  └──────────────────────────────┘                              │
│                                                                    │
└───────────────────────────┬────────────────────────────────────────┘
                            │ HTTPS (saat online)
               ┌────────────▼────────────┐
               │    Next.js BFF Layer    │
               │  /api/bff/* (Route.ts)  │
               │  HttpOnly cookie auth   │
               └────────────┬────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ┌────────────┐     ┌─────────────┐     ┌────────────────┐
 │ Laravel API│     │ WA Gateway  │     │ ImageKit /     │
 │ (source of │     │ Node.js +   │     │ Cloudinary     │
 │   truth)   │     │ Baileys     │     │ (File Storage) │
 └─────┬──────┘     └─────────────┘     └────────────────┘
       │
 ┌─────▼──────┐
 │ MySQL /    │
 │ PostgreSQL │
 └────────────┘
```

### 2.2 Keputusan Definitif

| Komponen | Keputusan | Alasan |
|----------|-----------|--------|
| **Prisma** | ❌ **DIHAPUS** | Dead code, tidak ada route yang memakainya |
| **`src/lib/db.ts`** | ❌ **DIHAPUS** | Bergantung pada Prisma |
| **localStorage cache** | ⬆️ **UPGRADE** ke Dexie.js IndexedDB | Kapasitas lebih besar, transaksional, offline-capable |
| **Service Worker** | ✅ **DITAMBAH** via Serwist | Offline support, installable PWA |
| **Laravel** | ✅ **DIPERTAHANKAN** sebagai source of truth | Sudah mature, tidak perlu migrasi |
| **BFF Routes** | ✅ **DIPERTAHANKAN** + minor enhancement | Sudah berjalan dengan benar |

### 2.3 Mengapa Serwist, bukan next-pwa?

```
next-pwa → deprecated, tidak aktif dikembangkan
@ducanh2912/next-pwa → fork next-pwa, semi-aktif
serwist → penerus resmi, Workbox-based, aktif dikembangkan (2024+)
```

---

## 3. Daftar Perubahan File Lengkap

### 3.1 FILE YANG DIHAPUS

```
prisma/
├── schema.prisma     ❌ HAPUS — dead code
├── seed.ts           ❌ HAPUS — tidak relevan
└── prepare.js        ❌ HAPUS — script build untuk prisma

src/lib/
└── db.ts             ❌ HAPUS — PrismaClient tidak dipakai
```

### 3.2 FILE YANG DIMODIFIKASI

#### `package.json`
```diff
 {
-  "name": "nextjs_tailwind_shadcn_ts",
+  "name": "simt-portal-ortu",
   "scripts": {
-    "build": "node prisma/prepare.js && next build",
-    "build:production": "node prisma/prepare.js && prisma generate && next build",
-    "postinstall": "node prisma/prepare.js && prisma generate",
+    "build": "next build",
+    "build:production": "next build",
-    "db:push": "prisma db push",
-    "db:generate": "prisma generate",
-    "db:migrate": "prisma migrate dev",
-    "db:reset": "prisma migrate reset"
   },
   "dependencies": {
-    "@neondatabase/serverless": "^1.1.0",
-    "@prisma/adapter-neon": "^7.8.0",
-    "@prisma/client": "^6.11.1",
-    "prisma": "^6.11.1",
-    "z-ai-web-dev-sdk": "^0.0.17",
+    "dexie": "^4.0.10",
+    "dexie-react-hooks": "^1.1.7-beta.6",
+    "serwist": "^9.0.0",
+    "@serwist/next": "^9.0.0",
   }
 }
```

#### `next.config.ts`
```diff
+import withSerwist from "@serwist/next";

+const withPWA = withSerwist({
+  swSrc: "src/sw.ts",
+  swDest: "public/sw.js",
+  reloadOnOnline: true,
+  disable: process.env.NODE_ENV === "development",
+});

-export default nextConfig;
+export default withPWA(nextConfig);
```

#### `src/lib/bff-client.ts`
```diff
-// localStorage cache (getCached / setCache)
-function getCached<T>(key: string, maxAge: number): T | null { ... localStorage ... }
-function setCache<T>(key: string, data: T, maxAge: number): void { ... localStorage ... }
+// Cache sekarang dihandle oleh Dexie.js + Service Worker
+// bff-client.ts hanya bertanggung jawab untuk HTTP request
+// Offline fallback dihandle oleh Service Worker secara transparan
```

#### `src/app/layout.tsx`
```diff
+  // Tambah PWA meta tags
+  <link rel="manifest" href="/manifest.webmanifest" />
+  <meta name="theme-color" content="#1a7a4a" />
+  <meta name="apple-mobile-web-app-capable" content="yes" />
+  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
+  <meta name="apple-mobile-web-app-title" content="SIMT Portal" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### 3.3 FILE BARU YANG DITAMBAHKAN

```
public/
├── manifest.webmanifest          ← PWA manifest
├── sw.js                         ← Service Worker (generated by serwist build)
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    └── icon-maskable-512x512.png ← Untuk Android adaptive icon

src/
├── sw.ts                         ← Source Service Worker (dikompilasi serwist)
│
├── lib/
│   ├── local-db.ts               ← Dexie schema (IndexedDB)
│   ├── sync-manager.ts           ← SyncQueue processor
│   └── cache-hydrator.ts         ← Pre-warm cache saat login
│
├── hooks/
│   ├── useOfflineSync.ts         ← Deteksi online/offline + trigger sync
│   └── useLocalData.ts           ← Baca dari IndexedDB via Dexie hooks
│
└── components/
    ├── offline-banner.tsx        ← Banner "sedang offline"
    └── sync-status.tsx           ← Indicator sync (ikon + tooltip)
```

---

## 4. Detail Implementasi Per File

### 4.1 `public/manifest.webmanifest`

```json
{
  "name": "SIMT Portal Ortu",
  "short_name": "SIMT Portal",
  "description": "Portal informasi siswa dan orang tua Madrasah Tsanawiyah",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#1a7a4a",
  "lang": "id-ID",
  "categories": ["education"],
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Dashboard SIMT Portal"
    }
  ]
}
```

### 4.2 `src/lib/local-db.ts`

```typescript
import Dexie, { type Table } from 'dexie';

// ─── Type Definitions ───────────────────────────────────────────────
export interface CachedStudent {
  id: string;
  nis: string;
  name: string;
  tenantId: string;
  classroomId?: string;
  photo?: string;
  cachedAt: number;
}

export interface CachedGrade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  type: string;
  cachedAt: number;
}

export interface CachedAttendance {
  id: string;
  studentId: string;
  date: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA';
  cachedAt: number;
}

export interface CachedPayment {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  month?: number;
  year?: number;
  status: string;
  cachedAt: number;
}

export interface CachedDashboard {
  studentId: string;
  data: unknown;           // Full dashboard response dari BFF
  cachedAt: number;
  expiresAt: number;
}

export interface SyncQueueItem {
  id?: number;             // auto-increment
  idempotencyKey: string;  // UUID — mencegah duplikasi di Laravel
  endpoint: string;        // e.g. '/api/bff/profile/update'
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  status: 'pending' | 'processing' | 'failed';
  retries: number;
  createdAt: number;
  lastAttemptAt?: number;
  errorMessage?: string;
}

export interface MetaEntry {
  key: string;             // e.g. 'last_sync_dashboard_<studentId>'
  value: unknown;
  updatedAt: number;
}

// ─── Dexie Database Class ────────────────────────────────────────────
export class SimtLocalDB extends Dexie {
  students!:    Table<CachedStudent>;
  grades!:      Table<CachedGrade>;
  attendance!:  Table<CachedAttendance>;
  payments!:    Table<CachedPayment>;
  dashboards!:  Table<CachedDashboard>;
  syncQueue!:   Table<SyncQueueItem>;
  meta!:        Table<MetaEntry>;

  constructor() {
    super('SimtPortalDB');
    this.version(1).stores({
      students:   'id, nis, tenantId, cachedAt',
      grades:     'id, studentId, subjectId, type, cachedAt',
      attendance: 'id, studentId, date, status, cachedAt',
      payments:   'id, studentId, status, month, year, cachedAt',
      dashboards: 'studentId, cachedAt, expiresAt',
      syncQueue:  '++id, status, createdAt, idempotencyKey',
      meta:       'key, updatedAt',
    });
  }
}

// Singleton
let _db: SimtLocalDB | null = null;

export function getLocalDB(): SimtLocalDB {
  if (!_db) _db = new SimtLocalDB();
  return _db;
}
```

### 4.3 `src/lib/sync-manager.ts`

```typescript
import { getLocalDB, type SyncQueueItem } from './local-db';

const BFF_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/bff';

/**
 * Tambahkan item ke antrian sync (untuk operasi offline)
 */
export async function enqueueWrite(
  endpoint: string,
  method: SyncQueueItem['method'],
  payload: unknown
): Promise<void> {
  const db = getLocalDB();
  await db.syncQueue.add({
    idempotencyKey: crypto.randomUUID(),
    endpoint,
    method,
    payload,
    status: 'pending',
    retries: 0,
    createdAt: Date.now(),
  });
}

/**
 * Proses semua item yang masih pending di antrian
 * Dipanggil saat event 'online' atau Background Sync API
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
}> {
  const db = getLocalDB();
  const pendingItems = await db.syncQueue
    .where('status').equals('pending')
    .sortBy('createdAt');

  let processed = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      await db.syncQueue.update(item.id!, { status: 'processing' });

      const res = await fetch(`${BFF_BASE}${item.endpoint}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': item.idempotencyKey, // Laravel pakai ini
        },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        await db.syncQueue.delete(item.id!);
        processed++;
      } else if (res.status >= 400 && res.status < 500) {
        // Client error — jangan retry
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          errorMessage: `HTTP ${res.status}`,
        });
        failed++;
      } else {
        // Server error — kembalikan ke pending untuk retry
        await db.syncQueue.update(item.id!, {
          status: 'pending',
          retries: (item.retries || 0) + 1,
          lastAttemptAt: Date.now(),
        });
        failed++;
      }
    } catch (err) {
      // Network error
      await db.syncQueue.update(item.id!, {
        status: 'pending',
        retries: (item.retries || 0) + 1,
        lastAttemptAt: Date.now(),
        errorMessage: String(err),
      });
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Jumlah item pending di sync queue
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = getLocalDB();
  return db.syncQueue.where('status').equals('pending').count();
}
```

### 4.4 `src/lib/cache-hydrator.ts`

```typescript
import { getLocalDB } from './local-db';

const BFF_BASE = '/api/bff';

/**
 * Dipanggil SEKALI setelah login sukses.
 * Fetch semua data penting dan simpan ke IndexedDB untuk offline access.
 */
export async function hydrateStudentCache(studentId: string): Promise<void> {
  const db = getLocalDB();

  try {
    // Fetch dashboard data (nilai, absensi, SPP, jadwal sekaligus)
    const res = await fetch(`${BFF_BASE}/portal/students/${studentId}/dashboard`);
    if (!res.ok) return;

    const data = await res.json();

    // Simpan ke IndexedDB
    await db.dashboards.put({
      studentId,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 jam
    });

    // Simpan meta: kapan terakhir sync
    await db.meta.put({
      key: `last_hydrate_${studentId}`,
      value: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    console.log(`[CacheHydrator] ✅ Cache siswa ${studentId} berhasil diisi`);
  } catch (err) {
    console.warn('[CacheHydrator] ⚠️ Gagal hydrate cache:', err);
    // Tidak throw — jangan blok login jika offline
  }
}
```

### 4.5 `src/hooks/useOfflineSync.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { processSyncQueue, getPendingSyncCount } from '@/lib/sync-manager';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // Update pending count
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingSyncCount();
    setPendingSyncCount(count);
  }, []);

  // Trigger sync
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      if (result.processed > 0) {
        setLastSyncAt(new Date());
        await refreshPendingCount();
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // Langsung sync saat online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, refreshPendingCount]);

  return { isOnline, pendingSyncCount, isSyncing, lastSyncAt, triggerSync };
}
```

### 4.6 `src/sw.ts` — Service Worker

```typescript
import type { PrecacheEntry } from 'serwist';
import { Serwist } from 'serwist';
import {
  NetworkFirst,
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
});

// ─── Cache Strategy Routes ────────────────────────────────────────────

// Static assets: Cache First (1 tahun)
serwist.registerCapture(
  /\/_next\/static\//,
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [{ cacheWillUpdate: async () => true }],
  })
);

// Nilai (Grade): Cache First (data jarang berubah)
serwist.registerCapture(
  /\/api\/bff\/portal\/students\/[^/]+\/grades/,
  new CacheFirst({ cacheName: 'grades-cache' })
);

// Jadwal: Stale While Revalidate
serwist.registerCapture(
  /\/api\/bff\/portal\/students\/[^/]+\/schedule/,
  new StaleWhileRevalidate({ cacheName: 'schedule-cache' })
);

// Dashboard umum: Network First, fallback cache
serwist.registerCapture(
  /\/api\/bff\/portal\/students\//,
  new NetworkFirst({
    cacheName: 'dashboard-cache',
    networkTimeoutSeconds: 5,
  })
);

// Pembayaran (Payment): Network Only — data keuangan TIDAK boleh stale
serwist.registerCapture(
  /\/api\/bff\/portal\/students\/[^/]+\/payments/,
  new NetworkOnly()
);

// Auth endpoints: Network Only
serwist.registerCapture(
  /\/api\/bff\/auth\//,
  new NetworkOnly()
);

// Background Sync listener (untuk fallback iOS yang tidak support Background Sync)
serwist.addEventListeners();
```

### 4.7 `src/components/offline-banner.tsx`

```typescript
'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, pendingSyncCount, isSyncing, lastSyncAt, triggerSync } =
    useOfflineSync();

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium
      flex items-center justify-between gap-2
      transition-all duration-300
      ${!isOnline
        ? 'bg-amber-500 text-amber-950'
        : 'bg-emerald-500 text-emerald-950'
      }
    `}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff size={15} />
            <span>Offline — menampilkan data tersimpan</span>
          </>
        ) : (
          <>
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>
              {isSyncing
                ? 'Menyinkronkan data...'
                : `${pendingSyncCount} perubahan menunggu sync`}
            </span>
          </>
        )}
      </div>

      {isOnline && !isSyncing && pendingSyncCount > 0 && (
        <button
          onClick={triggerSync}
          className="text-xs underline font-bold"
        >
          Sync sekarang
        </button>
      )}

      {isOnline && !isSyncing && pendingSyncCount === 0 && lastSyncAt && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          <CheckCircle size={12} />
          <span>Tersinkron</span>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Strategi Cache Per Tipe Data

```
┌────────────────────────┬──────────────────────┬───────────┬──────────────────┐
│ Data                   │ Strategy             │ TTL       │ Alasan           │
├────────────────────────┼──────────────────────┼───────────┼──────────────────┤
│ Static assets          │ Cache First          │ 1 tahun   │ Tidak berubah    │
│ App shell (halaman)    │ Cache First          │ 7 hari    │ Installable PWA  │
│ Nilai (Grade)          │ Cache First          │ 24 jam    │ Update per rapor │
│ Jadwal (Schedule)      │ Stale While Reval.   │ 1 hari    │ Cukup up-to-date │
│ Absensi (Attendance)   │ Network First        │ 5 menit   │ Real-time        │
│ Pengumuman             │ Stale While Reval.   │ 1 jam     │ Non-kritis       │
│ Dashboard aggregate    │ Network First        │ 5 menit   │ Summary data     │
│ Pembayaran (Payment)   │ Network Only         │ —         │ Data keuangan!   │
│ Auth (login/logout)    │ Network Only         │ —         │ Keamanan         │
└────────────────────────┴──────────────────────┴───────────┴──────────────────┘
```

---

## 6. Alur Sync Queue — Skenario Guru Input Absensi Offline

> **Catatan:** Fitur write offline ini lebih relevan untuk **guru** (via admin panel Laravel), bukan portal ortu. Untuk portal ortu, write offline yang disupport adalah: **update profil siswa** dan **form pengajuan izin**.

```
FASE OFFLINE:
┌─────────────────────────────────────────────────────────────────┐
│  1. Orang tua buka app → tidak ada internet                      │
│  2. Buka halaman "Profil Siswa" → data muncul dari Dexie cache  │
│  3. Edit nomor HP wali → klik Simpan                             │
│  4. Service Worker intercept POST request                        │
│  5. Request gagal (offline) → SW panggil enqueueWrite()          │
│  6. Item masuk ke syncQueue di IndexedDB                         │
│  7. UI tampil "✓ Tersimpan, akan sync otomatis"                  │
└─────────────────────────────────────────────────────────────────┘

FASE ONLINE KEMBALI:
┌─────────────────────────────────────────────────────────────────┐
│  8. Event 'online' terpicu di browser                            │
│  9. useOfflineSync hook → panggil processSyncQueue()             │
│  10. Setiap item di queue:                                       │
│      a. Ambil idempotencyKey (UUID) dari item                    │
│      b. POST ke BFF dengan header X-Idempotency-Key             │
│      c. BFF forward ke Laravel + header idempotency             │
│      d. Laravel check: sudah pernah proses key ini?             │
│         - Belum → proses + simpan key                           │
│         - Sudah → return 200 OK (deduplicate)                   │
│  11. Item berhasil → hapus dari syncQueue                        │
│  12. OfflineBanner update: "✓ Tersinkron"                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Hal yang Perlu Disiapkan di Laravel Backend

Agar sync offline berjalan sempurna, Laravel perlu mendukung:

### 7.1 Idempotency Key Middleware

```php
// app/Http/Middleware/IdempotencyMiddleware.php
// Cek header X-Idempotency-Key
// Jika sudah pernah diproses, return cached response
// Jika belum, proses dan simpan ke tabel idempotency_keys
```

### 7.2 Endpoint per Siswa (Read)

Pastikan endpoint berikut tersedia di Laravel API:

```
GET /api/v1/students/{id}/dashboard       ← Semua data dalam satu call
GET /api/v1/students/{id}/grades          ← Nilai per mata pelajaran
GET /api/v1/students/{id}/attendance      ← Absensi (filter by month)
GET /api/v1/students/{id}/payments        ← Riwayat pembayaran SPP
GET /api/v1/students/{id}/schedule        ← Jadwal pelajaran
GET /api/v1/students/{id}/announcements   ← Pengumuman sekolah
```

### 7.3 Response Header untuk Cache Control

```php
// Di Laravel API responses (khusus endpoint yang boleh di-cache SW):
return response()->json($data)
    ->header('Cache-Control', 'private, max-age=300')
    ->header('ETag', md5(json_encode($data)));
```

---

## 8. Pertimbangan iOS Safari

Background Sync API tidak didukung di Safari iOS. Solusi:

```typescript
// Fallback: polling saat online
// Di useOfflineSync.ts:
useEffect(() => {
  if (!isOnline) return;
  
  // Cek dan sync setiap 30 detik selama online
  // (hanya jika ada pending items)
  const interval = setInterval(async () => {
    const count = await getPendingSyncCount();
    if (count > 0) await triggerSync();
  }, 30_000);
  
  return () => clearInterval(interval);
}, [isOnline, triggerSync]);
```

---

## 9. Estimasi Ukuran & Performa

| Metric | Sebelum | Setelah | Target |
|--------|---------|---------|--------|
| Bundle size (client) | ~450KB | ~510KB (+Dexie ~60KB) | < 600KB |
| Prisma client (server) | ~8MB | 0 MB | 0 |
| Offline cache storage | ~5MB (localStorage) | ~50MB (IndexedDB) | 50MB |
| Time to interactive (offline) | ∞ (gagal) | < 1 detik | < 1 detik |
| Lighthouse PWA score | ~45 | ~95 | > 90 |
| Install to homescreen | ❌ | ✅ | ✅ |

---

## 10. Urutan Implementasi (Fase)

```
Phase 1 — Foundation (Est: 2–3 jam)
├── [ ] Hapus prisma/, src/lib/db.ts
├── [ ] Update package.json (hapus deps, ganti nama, clean scripts)
├── [ ] Buat public/manifest.webmanifest
├── [ ] Generate icon set
└── [ ] Setup Serwist di next.config.ts

Phase 2 — Local DB (Est: 4–6 jam)
├── [ ] Buat src/lib/local-db.ts (Dexie schema)
├── [ ] Buat src/lib/sync-manager.ts
├── [ ] Buat src/lib/cache-hydrator.ts
├── [ ] Panggil hydrateStudentCache() setelah login sukses
└── [ ] Buat src/hooks/useLocalData.ts

Phase 3 — Service Worker (Est: 6–8 jam)
├── [ ] Buat src/sw.ts dengan cache strategy routing
├── [ ] Implementasi Background Sync (POST → syncQueue jika offline)
├── [ ] Buat src/hooks/useOfflineSync.ts
└── [ ] Update bff-client.ts (hapus localStorage cache)

Phase 4 — UI Polish (Est: 2–3 jam)
├── [ ] Buat src/components/offline-banner.tsx
├── [ ] Buat src/components/sync-status.tsx
├── [ ] Update src/app/layout.tsx (PWA meta tags + banner)
└── [ ] Test install di HP Android & iOS

Phase 5 — Testing & Validasi (Est: 2 jam)
├── [ ] Lighthouse PWA audit (target > 90)
├── [ ] Chrome DevTools → Application → Service Workers
├── [ ] Simulasi offline di DevTools → pastikan data muncul
└── [ ] Test sync queue dengan WiFi toggle
```

---

## 11. Risiko & Mitigasi

| Risiko | Kemungkinan | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Serwist breaking change | Rendah | Sedang | Pin ke versi 9.x |
| IndexedDB quota exceeded | Rendah | Tinggi | Implementasi pruning data lama (max 30 hari) |
| Conflict saat sync (data race) | Sedang | Sedang | Idempotency key + last-write-wins di Laravel |
| iOS Background Sync tidak support | Tinggi | Rendah | Fallback polling sudah direncanakan |
| Service Worker cache stale terlalu lama | Sedang | Rendah | ETag + Cache-Control header dari Laravel |

---

## 12. Checklist Kesiapan Sebelum Eksekusi

- [ ] Konfirmasi Laravel API sudah punya endpoint `/students/{id}/dashboard`
- [ ] Konfirmasi target deployment (Railway / VPS / Vercel)
- [ ] Tim Laravel siap implementasi Idempotency Middleware
- [ ] Icon set PWA sudah disiapkan (atau generate via tools)
- [ ] Backup branch: `git checkout -b feat/pwa-offline-sync`

---

*Dokumen ini merupakan rancangan teknis untuk diskusi. Ubah status ke "Disetujui" sebelum eksekusi.*  
*Last updated: 2026-06-16*
