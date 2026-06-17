/**
 * BFF (Backend-for-Frontend) Client
 * 
 * Handles communication between Next.js and Laravel Backend.
 * Offline caching is handled transparently by the Service Worker (Serwist).
 * This client focuses purely on HTTP communication + auth headers.
 * 
 * Cache Layer Architecture:
 *   L1: Service Worker (Serwist) — intercepts fetch, strategy per route
 *   L2: Dexie IndexedDB — structured offline data (via cache-hydrator.ts)
 *   L3: localStorage — legacy fallback (maintained for backward compat)
 */

// ============================================================
// Types
// ============================================================
export interface BFFConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

export interface BFFResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  cached: boolean;
}

// ============================================================
// Default Config
// ============================================================
const DEFAULT_CONFIG: BFFConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/bff',
  timeout: 15000,
  retries: 2,
};

// ============================================================
// Fetch with Retry & Timeout
// ============================================================
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 2,
  timeout: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (i === retries) {
        clearTimeout(timeoutId);
        throw err;
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

// ============================================================
// BFF Client
// ============================================================
export class BFFClient {
  private config: BFFConfig;
  private getAccessToken: () => string | null;

  constructor(config: Partial<BFFConfig> = {}, getAccessToken?: () => string | null) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.getAccessToken = getAccessToken || (() => null);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<BFFResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const token = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Service Worker akan intercept request ini dan menerapkan cache strategy
      // yang sesuai (CacheFirst, NetworkFirst, dll.) berdasarkan URL pattern
      const res = await fetchWithRetry(
        url,
        { ...options, headers },
        this.config.retries,
        this.config.timeout
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: data.error || `HTTP Error ${res.status}`,
          status: res.status,
          cached: false,
        };
      }

      // Cek apakah response datang dari SW cache
      const isCached = res.headers.get('x-serwist-cache') !== null
        || res.headers.get('sw-fetched-on') !== null;

      return { data, error: null, status: res.status, cached: isCached };
    } catch {
      // Network error + SW tidak punya cache — genuinely offline
      return {
        data: null,
        error: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        status: 0,
        cached: false,
      };
    }
  }

  // ============================================================
  // Auth Endpoints
  // ============================================================
  async parentLogin(email: string, password: string) {
    return this.request<{
      user: any;
      token: string;
      students: any[];
    }>('/auth/parent-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async studentLogin(nis: string, password: string) {
    return this.request<{
      student: any;
      token: string;
    }>('/auth/student-login', {
      method: 'POST',
      body: JSON.stringify({ nis, password }),
    });
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  // ============================================================
  // Dashboard Endpoints
  // Caching: handled by Service Worker (NetworkFirst, 5min TTL)
  // ============================================================
  async getParentDashboard(studentId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/dashboard`,
      { method: 'GET' },
    );
  }

  async getStudentDashboard(studentId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/student-dashboard`,
      { method: 'GET' },
    );
  }

  async getGradeDetails(studentId: string, subjectId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/subjects/${subjectId}/grade-details`,
      { method: 'GET' },
    );
  }
}

// ============================================================
// Singleton Instance
// ============================================================
let bffClientInstance: BFFClient | null = null;

export function getBFFClient(getAccessToken?: () => string | null): BFFClient {
  if (!bffClientInstance) {
    bffClientInstance = new BFFClient({}, getAccessToken);
  }
  return bffClientInstance;
}

export function initBFFClient(getAccessToken: () => string | null): BFFClient {
  bffClientInstance = new BFFClient({}, getAccessToken);
  return bffClientInstance;
}

// Legacy compat — hapus pada refactor berikutnya
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter(key => key.startsWith('cache_'))
    .forEach(key => localStorage.removeItem(key));
}
