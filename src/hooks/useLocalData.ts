'use client';

// ============================================================
// SIMT Portal Ortu — useLocalData Hook
// Baca data dari Dexie IndexedDB dengan Dexie React Hooks
// Fallback data saat offline (Service Worker tidak bisa layani)
// ============================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalDB } from '@/lib/local-db';

/**
 * Baca cached dashboard orang tua dari IndexedDB.
 * Returns null jika belum pernah dihydrate atau cache expired.
 */
export function useLocalDashboard(studentId: string | null) {
  return useLiveQuery(async () => {
    if (!studentId) return null;
    try {
      const db = getLocalDB();
      const cached = await db.dashboards.get(studentId);
      if (!cached) return null;
      // Return data meskipun expired — lebih baik data lama daripada kosong
      return cached.data;
    } catch {
      return null;
    }
  }, [studentId]);
}

/**
 * Baca cached dashboard siswa dari IndexedDB.
 */
export function useLocalStudentDashboard(studentId: string | null) {
  return useLiveQuery(async () => {
    if (!studentId) return null;
    try {
      const db = getLocalDB();
      const cached = await db.studentDashboards.get(studentId);
      if (!cached) return null;
      return cached.data;
    } catch {
      return null;
    }
  }, [studentId]);
}

/**
 * Baca cached grade details dari IndexedDB.
 */
export function useLocalGradeDetails(studentId: string | null, subjectId: string | null) {
  return useLiveQuery(async () => {
    if (!studentId || !subjectId) return null;
    try {
      const db = getLocalDB();
      const cacheKey = `${studentId}_${subjectId}`;
      const cached = await db.gradeDetails.get(cacheKey);
      if (!cached) return null;
      return cached.data;
    } catch {
      return null;
    }
  }, [studentId, subjectId]);
}

/**
 * Cek apakah ada data di IndexedDB untuk student ini.
 * Berguna untuk UI: tampilkan "Data Offline" badge.
 */
export function useHasLocalData(studentId: string | null) {
  return useLiveQuery(async () => {
    if (!studentId) return false;
    try {
      const db = getLocalDB();
      const dashboard = await db.dashboards.get(studentId);
      const studentDashboard = await db.studentDashboards.get(studentId);
      return !!(dashboard || studentDashboard);
    } catch {
      return false;
    }
  }, [studentId]);
}
