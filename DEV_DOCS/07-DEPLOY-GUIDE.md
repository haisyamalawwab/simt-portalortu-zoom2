# 07 — Panduan Deployment SIMT Portal Ortu

Dokumen ini menjelaskan opsi deployment untuk **SIMT Portal Ortu** (Next.js 16) ke Railway, Render, Vercel, dan VPS.

---

## Pilihan Database untuk Production (PWA Mobile-First)

| Provider | Type | Free Tier | Latency Asia | Rekomendasi |
|---|---|---|---|---|
| **Neon** | PostgreSQL serverless | 0.5GB forever | ✅ Singapore | ⭐ **Terbaik** |
| **Supabase** | PostgreSQL | 500MB | ✅ Singapore | ✅ Bagus |
| **PlanetScale** | MySQL serverless | 5GB, 1B rows | ✅ Asia | ✅ Bagus |
| **Render PostgreSQL** | PostgreSQL managed | 1GB (expired 90 hari) | ✅ Singapore | ⚠️ Dev only |
| **Railway PostgreSQL** | PostgreSQL managed | 1GB / $5 credit | ✅ Singapore | ✅ Bagus |

**Rekomendasi untuk PWA**: **Neon** — connection pooling built-in via PgBouncer, cold start sangat cepat, gratis selamanya (0.5GB), region Singapore tersedia.

---

## 1. Deploy ke Railway

Railway paling cocok jika ingin deploy semua service dalam satu dashboard (Next.js + WA Gateway + Database).

### Prasyarat

File `railway.toml` sudah ada di root project.

### Langkah Deploy

1. Buat akun di [railway.app](https://railway.app) dan buat **New Project**.
2. Klik **Deploy from GitHub repo** → pilih `simt-portalortu`.
3. Railway akan otomatis detect `railway.toml` dan menjalankan build.
4. Tambahkan **PostgreSQL plugin** (atau gunakan Neon eksternal):
   - Jika Railway PostgreSQL: klik **+ New** → **Database** → **PostgreSQL**
   - Variable `DATABASE_URL` akan tersedia otomatis sebagai `${{Postgres.DATABASE_URL}}`

### Environment Variables di Railway

Set di **Settings → Variables**:

```env
DATABASE_PROVIDER=postgresql
DATABASE_URL=${{Postgres.DATABASE_URL}}       # jika Railway Postgres
# DATABASE_URL=<neon-pooled-url>              # jika Neon eksternal
DATABASE_DIRECT_URL=                          # kosongkan jika tidak pakai Neon pooler

STORAGE_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

WA_SERVICE_URL=https://your-wa-gateway.up.railway.app
WA_SERVICE_SECRET=...
```

### Database Migration (pertama kali)

Setelah deploy pertama, jalankan sekali via Railway CLI atau Railway Shell:

```bash
npx prisma db push
```

Atau tambahkan ke build command jika ingin otomatis (hati-hati di CI — bisa reset data):

```
npm run build:production && npx prisma db push
```

### Build & Start Commands (sudah di railway.toml)

| | Command |
|---|---|
| Build | `npm run build:production` |
| Start | `node .next/standalone/server.js` |

---

## 2. Deploy ke Render

Render cocok sebagai alternatif Railway, gratis dengan auto-sleep setelah 15 menit idle (free tier).

### Prasyarat

File `render.yaml` sudah ada di root project.

### Langkah Deploy via render.yaml (Blueprint)

1. Buka [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Hubungkan repo GitHub `simt-portalortu`.
3. Render akan membaca `render.yaml` dan membuat service otomatis.
4. Isi environment variables yang `sync: false` di dashboard Render.

### Langkah Deploy Manual

1. **New** → **Web Service** → connect GitHub repo.
2. Konfigurasi:
   - **Runtime**: Node
   - **Build Command**: `npm run build:production`
   - **Start Command**: `node .next/standalone/server.js`
   - **Region**: Singapore
3. Tambahkan environment variables (sama seperti di atas).

### Environment Variables di Render

```env
NODE_ENV=production
PORT=3000
DATABASE_PROVIDER=postgresql
DATABASE_URL=<neon-pooled-url atau render-db-url>
DATABASE_DIRECT_URL=<neon-direct-url, atau kosongkan>
STORAGE_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
WA_SERVICE_URL=...
WA_SERVICE_SECRET=...
```

### Catatan Free Tier Render

- Web service **auto-sleep** setelah 15 menit tidak ada request (cold start ~30 detik).
- Untuk PWA production, upgrade ke **Starter plan** ($7/bulan) agar always-on.
- PostgreSQL Render free tier **expire setelah 90 hari** — lebih baik pakai **Neon** untuk database.

---

## 3. Setup Neon Database (Rekomendasi)

1. Daftar di [neon.tech](https://neon.tech) → buat project baru → pilih region **Singapore**.
2. Di dashboard Neon → **Connection Details**:
   - Pilih **Pooled connection** → salin URL → set ke `DATABASE_URL`
   - Pilih **Direct connection** → salin URL → set ke `DATABASE_DIRECT_URL`
3. Format URL:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   DATABASE_DIRECT_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```
4. Set `DATABASE_PROVIDER=postgresql` di environment variables platform.
5. Jalankan schema migration sekali:
   ```bash
   npx prisma db push
   ```

---

## 4. Deploy ke Vercel

> ⚠️ `output: "standalone"` otomatis dinonaktifkan saat `VERCEL=1` (sudah di-handle di `next.config.ts`).

1. Connect repo ke Vercel → **Add New Project**.
2. **Build Command**: `npm run build:production`
3. Tambahkan semua env vars di dashboard Vercel.
4. Deploy.

---

## 5. Deploy ke VPS (Ubuntu + PM2 + Caddy)

```bash
git clone <repo-url> /var/www/simt-portalortu
cd /var/www/simt-portalortu
cp .env.example .env
# edit .env dengan nilai production
npm install
npm run build:production
npx prisma db push
pm2 start .next/standalone/server.js --name simt-portalortu
pm2 save && pm2 startup
```

Konfigurasi Caddy (`deployment/Caddyfile`):

```caddyfile
portal.sekolah.sch.id {
    reverse_proxy localhost:3000
}
```

---

## Checklist Sebelum Go-Live

- [ ] `DATABASE_URL` sudah diset dan koneksi berhasil
- [ ] `npx prisma db push` sudah dijalankan (schema ter-sync ke DB)
- [ ] `STORAGE_PROVIDER` + credentials sudah diset
- [ ] `WA_SERVICE_URL` & `WA_SERVICE_SECRET` sudah diset
- [ ] Test login ortu dan siswa berhasil
- [ ] PWA manifest dan service worker ter-serve dengan benar (`/manifest.json`, `/sw.js`)
- [ ] HTTPS aktif (Railway/Render/Vercel otomatis, VPS pakai Caddy)

---

*Last updated: 2026-06-16*
