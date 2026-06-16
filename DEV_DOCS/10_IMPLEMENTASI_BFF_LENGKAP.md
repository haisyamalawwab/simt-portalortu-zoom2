# Implementasi BFF (Backend-for-Frontend) — Panduan Lengkap

**Tanggal:** 16 Juni 2026  
**Status:** Phase 1 Complete, Phase 2 Ready  
**Tujuan:** Integrasi Portal Ortu (Next.js) dengan Backend Laravel via BFF Pattern

---

## 📖 Daftar Isi

1. [Apa yang Sudah Dibuat](#apa-yang-sudah-dibuat)
2. [Arsitektur & Cara Kerja](#arsitektur--cara-kerja)
3. [File Structure](#file-structure)
4. [Setup & Configuration](#setup--configuration)
5. [Cara Menggunakan](#cara-menggunakan)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Apa yang Sudah Dibuat

### ✅ Phase 1 Complete

**1. Infrastructure Layer**
- `src/lib/auth-context.tsx` — Auth state management (React Context)
- `src/lib/bff-client.ts` — HTTP client dengan cache & retry
- `src/components/error-boundary.tsx` — Global error handler

**2. BFF API Routes** (Next.js → Laravel)
- `POST /api/bff/auth/parent-login` — Login orang tua
- `POST /api/bff/auth/student-login` — Login siswa
- `POST /api/bff/auth/logout` — Logout
- `GET /api/bff/portal/students/{id}/dashboard` — Dashboard orang tua
- `GET /api/bff/portal/students/{id}/student-dashboard` — Dashboard siswa

**3. Security Features**
- ✅ HttpOnly Cookie authentication (anti-XSS)
- ✅ CSRF protection (SameSite cookie)
- ✅ Offline cache dengan expiration
- ✅ Data transformation (backend → frontend format)

**4. Documentation**
- ✅ 3 dokumen teknis lengkap
- ✅ Integration plan untuk Phase 2
- ✅ Testing checklist

### ⏳ Phase 2 TODO

**Integration dengan UI Existing** (`src/app/page.tsx`)
- Update `layout.tsx` dengan providers
- Refactor state management
- Replace fetch calls dengan BFF client
- Testing end-to-end

**Estimasi:** 2-3 jam  
**Detail:** Lihat `DEV_DOCS/docs_sim/101_PHASE2_INTEGRATION_PLAN.md`

---

## Arsitektur & Cara Kerja

### Flow Diagram

```
┌──────────────────────────────────────────────────┐
│           Browser (Client-Side)                  │
├──────────────────────────────────────────────────┤
│  React UI (page.tsx)                             │
│    ↓ useAuth()                                   │
│  AuthContext (login, logout, state)              │
│    ↓ bffClient.getParentDashboard()              │
│  BFF Client (cache + fetch)                      │
│    │                                              │
│    ├─ Online:  fetch /api/bff/* → cache         │
│    └─ Offline: read from cache                   │
└──────────────────────────────────────────────────┘
              ↓ HTTP Request
┌──────────────────────────────────────────────────┐
│        Next.js Server (BFF Layer)                │
├──────────────────────────────────────────────────┤
│  /api/bff/auth/* routes                          │
│    ↓                                              │
│  1. Read token from HttpOnly cookie             │
│  2. Proxy request ke Laravel                     │
│  3. Transform data (snake → camel, H → HADIR)   │
│  4. Set HttpOnly cookie (on login)              │
│  5. Return to client                             │
└──────────────────────────────────────────────────┘
              ↓ HTTP Request + Bearer Token
┌──────────────────────────────────────────────────┐
│          Laravel Backend (REST API)              │
├──────────────────────────────────────────────────┤
│  - Sanctum authentication                        │
│  - Multi-tenant isolation                        │
│  - Ownership validation (anti-IDOR)             │
│  - Return JSON response                          │
└──────────────────────────────────────────────────┘
```

### Keamanan Layer

| Layer | Mekanisme | Perlindungan |
|---|---|---|
| **Storage** | HttpOnly Cookie | XSS (token tidak bisa dicuri via JavaScript) |
| **Transport** | HTTPS + SameSite | CSRF + Man-in-the-middle |
| **Backend** | Sanctum + Tenant Scope | IDOR + Data leakage |
| **Client** | Error Boundary | Graceful degradation |

---

## File Structure

```
d:\laragon\www\simt-portalortu\
├── src/
│   ├── lib/
│   │   ├── auth-context.tsx       ← Auth state management
│   │   ├── bff-client.ts          ← HTTP client + cache
│   │   ├── db.ts                  ← Prisma client (fallback)
│   │   └── utils.ts
│   │
│   ├── components/
│   │   ├── error-boundary.tsx     ← Error handler
│   │   └── ui/                    ← shadcn components
│   │
│   └── app/
│       ├── api/
│       │   └── bff/               ← BFF routes
│       │       ├── auth/
│       │       │   ├── parent-login/route.ts
│       │       │   ├── student-login/route.ts
│       │       │   └── logout/route.ts
│       │       │
│       │       └── portal/students/[studentId]/
│       │           ├── dashboard/route.ts
│       │           └── student-dashboard/route.ts
│       │
│       ├── layout.tsx             ← Root layout (TODO: wrap providers)
│       └── page.tsx               ← Main UI (TODO: use AuthContext)
│
├── DEV_DOCS/
│   └── docs_sim/
│       ├── 100_BFF_IMPLEMENTATION_REPORT.md
│       ├── 101_PHASE2_INTEGRATION_PLAN.md
│       └── front-end-evaluation.md
│
├── .env.example
├── .env.local                     ← Create this (gitignored)
└── BFF_IMPLEMENTATION_SUMMARY.md
```

---

## Setup & Configuration

### 1. Environment Variables

Buat file `.env.local`:

```env
# Backend Laravel API URL
BACKEND_API_URL=http://localhost:8000/api/v1

# Public URL untuk client-side
NEXT_PUBLIC_BACKEND_API_URL=/api/bff

# Node environment
NODE_ENV=development
```

### 2. Laravel Backend Requirements

Pastikan endpoint berikut tersedia di Laravel:

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/v1/auth/parent-login` | Public | Login wali |
| POST | `/api/v1/auth/student-login` | Public | Login siswa |
| POST | `/api/v1/logout` | Bearer | Logout |
| GET | `/api/v1/portal/students/{id}/dashboard` | Bearer + Tenant | Dashboard wali |
| GET | `/api/v1/portal/students/{id}/student-dashboard` | Bearer + Tenant | Dashboard siswa |

**Header yang wajib:**
- `Authorization: Bearer {token}`
- `X-Tenant-Domain: {tenant-slug}`
- `Accept: application/json`

### 3. Install Dependencies

```bash
npm install
# atau
bun install
```

### 4. Start Development

```bash
# Terminal 1: Laravel backend
cd d:\laragon\www\simt-backend
php artisan serve  # http://localhost:8000

# Terminal 2: Next.js frontend
cd d:\laragon\www\simt-portalortu
npm run dev  # http://localhost:3000
```

---

## Cara Menggunakan

### 1. Login (Parent)

```typescript
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const auth = useAuth();
  
  const handleLogin = async () => {
    const result = await auth.login('parent', {
      email: 'wali@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      // Redirect ke dashboard
    } else {
      alert(result.error);
    }
  };
}
```

### 2. Fetch Dashboard Data

```typescript
import { initBFFClient } from '@/lib/bff-client';
import { useAuth } from '@/lib/auth-context';

function Dashboard() {
  const auth = useAuth();
  const bffClient = initBFFClient(auth.getAccessToken);
  
  const loadData = async () => {
    const { data, error, cached } = await bffClient.getParentDashboard(studentId);
    
    if (data) {
      setDashboard(data);
      
      if (cached) {
        toast('Menggunakan data tersimpan (offline)');
      }
    } else {
      toast(error, 'error');
    }
  };
}
```

### 3. Offline Support

Data otomatis di-cache di `localStorage`:

```typescript
// Cache key format
cache_dashboard_{studentId}
cache_student_dashboard_{studentId}
cache_grades_{studentId}_{subjectId}

// Cache expiration
Dashboard: 5 menit
Grades: 10 menit
```

**Strategi:**
1. Fetch pertama → cache + tampilkan
2. Request berikutnya → tampilkan cache + fetch background
3. Network error → tampilkan cache (meski expired)

---

## Testing

### Manual Testing Checklist

**Login Flow:**
- [ ] Parent login dengan email + password
- [ ] Student login dengan NIS + password
- [ ] Cookie `simt_token` ter-set (DevTools → Application → Cookies)
- [ ] Cookie `simt_tenant` ter-set

**Dashboard Flow:**
- [ ] Dashboard parent load data
- [ ] Dashboard student load data
- [ ] Presensi status benar (HADIR, ALPHA, IZIN, SAKIT)
- [ ] Nilai tampil
- [ ] Pembayaran status benar (LUNAS, BELUM_BAYAR)

**Offline Flow:**
- [ ] Disconnect internet
- [ ] Refresh page → data load dari cache
- [ ] Toast "Menggunakan data tersimpan (offline)"
- [ ] Reconnect → refresh update data

**Security:**
- [ ] Logout → cookie terhapus
- [ ] Akses `/api/bff/*` tanpa token → 401
- [ ] Parent tidak bisa akses siswa lain (IDOR)
- [ ] Inspect token di localStorage → tidak ada (HttpOnly)

### Automated Testing (TODO)

```bash
# Install test dependencies
npm install -D vitest @testing-library/react

# Run tests
npm run test
```

---

## Deployment

### Railway

```toml
# railway.toml sudah ada
# Tambahkan env vars di dashboard Railway:
BACKEND_API_URL=https://simt-backend.up.railway.app/api/v1
NEXT_PUBLIC_BACKEND_API_URL=/api/bff
NODE_ENV=production
```

### Render

```yaml
# render.yaml sudah ada
# Tambahkan di envVars:
- key: BACKEND_API_URL
  value: https://simt-backend.onrender.com/api/v1
  
- key: NEXT_PUBLIC_BACKEND_API_URL
  value: /api/bff
```

### Vercel

```bash
# Set via Vercel dashboard atau CLI
vercel env add BACKEND_API_URL production
# Enter: https://api.example.com/api/v1
```

---

## Troubleshooting

### 1. Error: "Unauthorized" (401)

**Penyebab:** Token tidak valid atau expired

**Solusi:**
- Logout dan login ulang
- Check cookie `simt_token` ter-set
- Check Laravel backend accessible

### 2. Error: "Cannot connect to server" (503)

**Penyebab:** Laravel backend tidak running atau URL salah

**Solusi:**
- Verify `BACKEND_API_URL` di `.env.local`
- Check Laravel backend: `curl http://localhost:8000/api/v1/health`
- Check network/CORS settings

### 3. Data tidak ter-cache

**Penyebab:** localStorage disabled atau quota exceeded

**Solusi:**
- Check browser localStorage enabled
- Clear old cache: `localStorage.clear()`
- Check localStorage quota: Chrome DevTools → Application → Storage

### 4. CORS Error

**Penyebab:** Laravel backend belum set CORS headers

**Solusi (Laravel):**
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 5. Cookie tidak ter-set

**Penyebab:** Domain mismatch atau SameSite policy

**Solusi:**
- Development: pastikan localhost:3000 → localhost:8000
- Production: pastikan same domain atau HTTPS
- Check cookie settings di BFF route

---

## Next Steps

1. **Implementasi Phase 2** — Integrasi dengan UI existing
   - Lihat: `DEV_DOCS/docs_sim/101_PHASE2_INTEGRATION_PLAN.md`

2. **React Query** — Advanced caching
3. **Service Worker** — True offline PWA
4. **Background Sync** — Sync mutations saat online
5. **Automated Tests** — Vitest + Playwright

---

## Dokumentasi Terkait

| Dokumen | Lokasi | Keterangan |
|---|---|---|
| **BFF Implementation Report** | `DEV_DOCS/docs_sim/100_*.md` | Detail teknis Phase 1 |
| **Phase 2 Integration Plan** | `DEV_DOCS/docs_sim/101_*.md` | Checklist integrasi UI |
| **Frontend Evaluation** | `DEV_DOCS/docs_sim/front-end-evaluation.md` | Analisis keamanan |
| **API Contract** | `DEV_DOCS/docs_sim/API_CONTRACT.md` | Endpoint Laravel |
| **Deploy Guide** | `DEV_DOCS/07-DEPLOY-GUIDE.md` | Panduan deployment |

---

**Butuh bantuan?** Baca dokumentasi di atas atau check `BFF_IMPLEMENTATION_SUMMARY.md` untuk quick reference.
