// ============================================================
// SIMT Portal Ortu — Sync Queue Manager
// Proses antrian write yang tertunda saat offline
// ============================================================
import { getLocalDB, type SyncQueueItem } from './local-db';

// ─── Enqueue ──────────────────────────────────────────────────────────

/**
 * Tambahkan operasi write ke antrian saat offline.
 * Akan diproses saat internet tersambung kembali.
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
  console.log(`[SyncManager] ➕ Queued: ${method} ${endpoint}`);
}

// ─── Process Queue ────────────────────────────────────────────────────

/**
 * Proses semua item pending di antrian.
 * Dipanggil saat event 'online' atau saat user buka app.
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
}> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  const db = getLocalDB();
  const pendingItems = await db.syncQueue
    .where('status')
    .anyOf(['pending', 'failed'])
    .and(item => item.retries < 5) // Max 5 kali retry
    .sortBy('createdAt');

  let processed = 0;
  let failed = 0;

  for (const item of pendingItems) {
    // Skip jika sudah gagal terlalu baru (exponential backoff)
    if (item.lastAttemptAt) {
      const backoffMs = Math.min(1000 * Math.pow(2, item.retries), 5 * 60 * 1000); // max 5 menit
      if (Date.now() - item.lastAttemptAt < backoffMs) continue;
    }

    try {
      await db.syncQueue.update(item.id!, { status: 'processing' });

      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': item.idempotencyKey, // Laravel mencegah duplikasi
        },
        body: item.method !== 'DELETE' ? JSON.stringify(item.payload) : undefined,
      });

      if (res.ok) {
        await db.syncQueue.delete(item.id!);
        processed++;
        console.log(`[SyncManager] ✅ Synced: ${item.method} ${item.endpoint}`);
      } else if (res.status >= 400 && res.status < 500) {
        // Client error (4xx) — jangan retry, tandai failed permanen
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          errorMessage: `HTTP ${res.status}: ${await res.text().catch(() => '')}`,
          lastAttemptAt: Date.now(),
        });
        failed++;
        console.warn(`[SyncManager] ❌ Permanent fail: ${item.method} ${item.endpoint} → ${res.status}`);
      } else {
        // Server error (5xx) — retry nanti
        await db.syncQueue.update(item.id!, {
          status: 'pending',
          retries: item.retries + 1,
          lastAttemptAt: Date.now(),
          errorMessage: `HTTP ${res.status}`,
        });
        failed++;
      }
    } catch (err) {
      // Network error — retry nanti
      await db.syncQueue.update(item.id!, {
        status: 'pending',
        retries: item.retries + 1,
        lastAttemptAt: Date.now(),
        errorMessage: String(err),
      });
      failed++;
    }
  }

  return { processed, failed };
}

// ─── Query Helpers ────────────────────────────────────────────────────

/** Jumlah item pending di antrian */
export async function getPendingSyncCount(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    const db = getLocalDB();
    return db.syncQueue.where('status').anyOf(['pending', 'failed']).count();
  } catch {
    return 0;
  }
}

/** Hapus semua item yang sudah selesai */
export async function clearCompletedSync(): Promise<void> {
  const db = getLocalDB();
  await db.syncQueue.where('status').equals('done').delete();
}

/** Hapus semua item yang permanen failed (tidak akan retry) */
export async function clearPermanentFailures(): Promise<void> {
  const db = getLocalDB();
  await db.syncQueue
    .where('retries')
    .aboveOrEqual(5)
    .delete();
}
