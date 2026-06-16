/**
 * BFF (Backend-for-Frontend) Client
 * 
 * Handles communication between Next.js and Laravel Backend.
 * Supports offline mode with local caching.
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
// Cache Keys
// ============================================================
const CACHE_KEYS = {
  DASHBOARD: (studentId: string) => `cache_dashboard_${studentId}`,
  STUDENT_DASHBOARD: (studentId: string) => `cache_student_dashboard_${studentId}`,
  GRADE_DETAILS: (studentId: string, subjectId: string) => `cache_grades_${studentId}_${subjectId}`,
};

// ============================================================
// Cache Helpers
// ============================================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

function getCached<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const entry: CacheEntry<T> = JSON.parse(item);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T, maxAge: number = 5 * 60 * 1000): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + maxAge,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.error('Cache set error:', e);
  }
}

export function clearCache(): void {
  if (typeof window === 'undefined') return;
  Object.values(localStorage)
    .filter(key => key.startsWith('cache_'))
    .forEach(key => localStorage.removeItem(key));
}

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
    cacheKey?: string,
    cacheMaxAge?: number
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

    // Try to get from cache first (for offline support)
    if (cacheKey && options.method === 'GET' || !options.method) {
      const cached = getCached<T>(cacheKey, cacheMaxAge);
      if (cached) {
        return { data: cached, error: null, status: 200, cached: true };
      }
    }

    try {
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

      // Cache successful GET responses
      if (cacheKey && (!options.method || options.method === 'GET')) {
        setCache(cacheKey, data, cacheMaxAge);
      }

      return { data, error: null, status: res.status, cached: false };
    } catch (err) {
      // Network error - try to return cached data
      if (cacheKey) {
        const cached = getCached<T>(cacheKey, cacheMaxAge);
        if (cached) {
          return {
            data: cached,
            error: 'Menggunakan data tersimpan (offline)',
            status: 200,
            cached: true,
          };
        }
      }

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
  // ============================================================
  async getParentDashboard(studentId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/dashboard`,
      { method: 'GET' },
      CACHE_KEYS.DASHBOARD(studentId),
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getStudentDashboard(studentId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/student-dashboard`,
      { method: 'GET' },
      CACHE_KEYS.STUDENT_DASHBOARD(studentId),
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getGradeDetails(studentId: string, subjectId: string) {
    return this.request<any>(
      `/portal/students/${studentId}/subjects/${subjectId}/grade-details`,
      { method: 'GET' },
      CACHE_KEYS.GRADE_DETAILS(studentId, subjectId),
      10 * 60 * 1000 // 10 minutes cache
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
