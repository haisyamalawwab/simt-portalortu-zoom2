'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// Types
// ============================================================
export interface User {
  id: string;
  name: string;
  email?: string;
  nis?: string;
  role: 'parent' | 'student';
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  nis: string;
  classroom?: string;
  level?: number;
  tenant: { name: string; slug: string };
}

interface AuthContextType {
  user: User | null;
  students: StudentInfo[];
  selectedStudentId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (mode: 'parent' | 'student', credentials: { email?: string; nis?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  selectStudent: (studentId: string) => void;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================
// Storage Keys
// ============================================================
const STORAGE_KEYS = {
  USER: 'simt_user',
  TOKEN: 'simt_token',
  STUDENTS: 'simt_students',
  SELECTED_STUDENT: 'simt_selected_student',
};

// ============================================================
// Local Storage Helpers (for offline support)
// ============================================================
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ============================================================
// Auth Provider
// ============================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize from local storage (for offline/persistence)
  useEffect(() => {
    const storedUser = getFromStorage<User | null>(STORAGE_KEYS.USER, null);
    const storedToken = getFromStorage<string | null>(STORAGE_KEYS.TOKEN, null);
    const storedStudents = getFromStorage<StudentInfo[]>(STORAGE_KEYS.STUDENTS, []);
    const storedSelectedStudent = getFromStorage<string | null>(STORAGE_KEYS.SELECTED_STUDENT, null);

    if (storedUser && storedToken) {
      setUser(storedUser);
      setStudents(storedStudents);
      setSelectedStudentId(storedSelectedStudent);
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (
    mode: 'parent' | 'student',
    credentials: { email?: string; nis?: string; password: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const endpoint = mode === 'parent' ? '/api/bff/auth/parent-login' : '/api/bff/auth/student-login';
      const body = mode === 'parent' 
        ? { email: credentials.email, password: credentials.password }
        : { nis: credentials.nis, password: credentials.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login gagal' };
      }

      // Store in state and localStorage
      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        nis: data.user.nis,
        role: mode,
        tenantId: data.user.tenant_id,
        tenantName: data.user.tenant?.name || '',
        tenantSlug: data.user.tenant?.slug || '',
      };

      setUser(newUser);
      setToStorage(STORAGE_KEYS.USER, newUser);
      setToStorage(STORAGE_KEYS.TOKEN, data.token);

      if (mode === 'parent' && data.students) {
        setStudents(data.students);
        setToStorage(STORAGE_KEYS.STUDENTS, data.students);
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].id);
          setToStorage(STORAGE_KEYS.SELECTED_STUDENT, data.students[0].id);
        }
      } else if (mode === 'student' && data.student) {
        // For student, they are their own "selected student"
        setSelectedStudentId(data.student.id);
        setToStorage(STORAGE_KEYS.SELECTED_STUDENT, data.student.id);
        setStudents([{
          id: data.student.id,
          name: data.student.name,
          nis: data.student.nis,
          classroom: data.student.classroom,
          tenant: data.student.tenant,
        }]);
        setToStorage(STORAGE_KEYS.STUDENTS, [{
          id: data.student.id,
          name: data.student.name,
          nis: data.student.nis,
          classroom: data.student.classroom,
          tenant: data.student.tenant,
        }]);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select student (for parent mode)
  const selectStudent = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
    setToStorage(STORAGE_KEYS.SELECTED_STUDENT, studentId);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await fetch('/api/bff/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors, proceed with local logout
    }

    // Clear state
    setUser(null);
    setStudents([]);
    setSelectedStudentId(null);

    // Clear storage
    removeFromStorage(STORAGE_KEYS.USER);
    removeFromStorage(STORAGE_KEYS.TOKEN);
    removeFromStorage(STORAGE_KEYS.STUDENTS);
    removeFromStorage(STORAGE_KEYS.SELECTED_STUDENT);

    router.refresh();
  }, [router]);

  // Get access token
  const getAccessToken = useCallback(() => {
    return getFromStorage<string | null>(STORAGE_KEYS.TOKEN, null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      students,
      selectedStudentId,
      isLoading,
      isAuthenticated: !!user,
      login,
      selectStudent,
      logout,
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================
// Token Fetcher (for BFF routes)
// ============================================================
export function getServerToken(): string | null {
  // In server components/API routes, read from cookie
  // This will be called from BFF routes
  return null; // Placeholder - actual implementation uses cookies in API routes
}
