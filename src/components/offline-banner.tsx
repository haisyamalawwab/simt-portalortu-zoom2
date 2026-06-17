'use client';

// ============================================================
// SIMT Portal Ortu — Offline Banner Component
// Muncul saat offline atau ada pending sync items
//
// NOTE: Menggunakan `mounted` state untuk mencegah hydration mismatch.
// Server selalu render null, client render null pada pass pertama
// (match dengan server), baru render konten nyata setelah mount.
// ============================================================
import { useState, useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, pendingSyncCount, isSyncing, lastSyncAt, triggerSync } =
    useOfflineSync();

  // Guard: render null sampai component mount di client.
  // Mencegah hydration mismatch karena navigator.onLine hanya ada di browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Hitung berapa menit lalu
  const minutesAgo = lastSyncAt
    ? Math.floor((Date.now() - lastSyncAt.getTime()) / 60000)
    : null;

  const lastSyncLabel = minutesAgo !== null
    ? minutesAgo === 0 ? 'baru saja' : `${minutesAgo} mnt lalu`
    : null;

  // Jangan tampilkan jika online dan tidak ada pending
  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-0 left-0 right-0 z-[100]
        flex items-center justify-between gap-3
        px-4 py-2.5 text-sm font-medium
        transition-all duration-300 ease-in-out
        shadow-md
        ${!isOnline
          ? 'bg-amber-500 text-amber-950'
          : isSyncing
            ? 'bg-blue-500 text-blue-50'
            : 'bg-emerald-600 text-emerald-50'
        }
      `}
    >
      {/* Left: Status icon + message */}
      <div className="flex items-center gap-2 min-w-0">
        {!isOnline ? (
          <>
            <WifiOff size={15} className="shrink-0" />
            <span className="truncate">
              Mode offline — data tersimpan lokal
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw size={15} className="shrink-0 animate-spin" />
            <span className="truncate">Menyinkronkan data ke server...</span>
          </>
        ) : pendingSyncCount > 0 ? (
          <>
            <Clock size={15} className="shrink-0" />
            <span className="truncate">
              {pendingSyncCount} perubahan belum tersimpan ke server
            </span>
          </>
        ) : null}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isOnline && !isSyncing && pendingSyncCount > 0 && (
          <button
            onClick={triggerSync}
            className="
              text-xs font-bold underline underline-offset-2
              hover:opacity-80 active:opacity-60 transition-opacity
            "
            aria-label="Sync sekarang"
          >
            Sync
          </button>
        )}

        {isOnline && lastSyncLabel && pendingSyncCount === 0 && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <CheckCircle2 size={12} />
            <span>{lastSyncLabel}</span>
          </div>
        )}

        {!isOnline && (
          <div className="flex items-center gap-1 text-xs opacity-70">
            <Wifi size={12} />
            <span>Offline</span>
          </div>
        )}
      </div>
    </div>
  );
}
