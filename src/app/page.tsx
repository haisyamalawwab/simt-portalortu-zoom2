'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, LogIn, BookOpen, ClipboardCheck, CreditCard,
  Bell, User, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronRight, Phone, School, Star,
  LogOut, RefreshCw, Info, ChevronDown, Calendar,
  BookMarked, Trophy, ShieldAlert, Moon, Lock, Users
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
interface StudentInfo {
  id: string;
  name: string;
  nis: string;
  nisn?: string;
  classroom: string;
  level: number;
  academicYear: string;
  waliKelas: { name: string; phone: string } | null;
  tenant: { name: string; slug: string };
  gender: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  photo?: string;
}

interface AttendanceSummary {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  recent: { date: string; status: string; timeIn: string | null; timeOut?: string | null; note: string | null }[];
  periodLabel: string;
  hasData: boolean;
}

interface PaymentInfo {
  all: { id: string; month: number; year: number; amount: number; status: string; dueDate: string; paidAt: string | null }[];
  unpaid: { id: string; month: number; year: number; amount: number; status: string; dueDate: string }[];
  totalUnpaid: number;
  totalPaid: number;
  hasData: boolean;
}

interface GradeInfo {
  list: { id: string; score: number; subject: { name: string; code: string } }[];
  average: number;
  count: number;
  activeType: string;
  availableTypes: { type: string; count: number }[];
  hasData: boolean;
  belowKKMCount: number;
  pengetahuanAverage: number;
  pengetahuanCount: number;
  isAllTuntas: boolean;
}

interface AnnouncementInfo {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  publishedAt: string;
}

interface ScheduleInfo {
  id: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  subject: { name: string; code: string };
  teacher: { name: string } | null;
}

interface ViolationInfo {
  id: string;
  date: string;
  category: string;
  description: string;
  points: number;
  action: string | null;
}

interface AchievementInfo {
  id: string;
  date: string;
  title: string;
  category: string;
  level: string;
  ranking: string | null;
  description: string | null;
}

interface TahfizInfo {
  totalRecords: number;
  ziyadahCount: number;
  murajaahCount: number;
  averageScore: number;
  surahMemorized: number;
  latestRecords: { id: string; date: string; surah: string; ayahStart: number; ayahEnd: number; type: string; score: number; fluency: string | null; note: string | null }[];
}

interface ParentDashboardData {
  student: StudentInfo;
  attendanceSummary: AttendanceSummary;
  payments: PaymentInfo;
  grades: GradeInfo;
  announcements: AnnouncementInfo[];
}

interface StudentDashboardData {
  student: StudentInfo;
  attendanceSummary: AttendanceSummary;
  grades: GradeInfo;
  schedules: ScheduleInfo[];
  violations: { list: ViolationInfo[]; totalPoints: number; count: number };
  achievements: { list: AchievementInfo[]; count: number };
  tahfiz: TahfizInfo;
  announcements: AnnouncementInfo[];
}

// ============================================================
// Constants
// ============================================================
const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  HADIR: { label: 'Hadir', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  SAKIT: { label: 'Sakit', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  IZIN: { label: 'Izin', color: 'text-blue-600 bg-blue-50', icon: Clock },
  ALPHA: { label: 'Alpha', color: 'text-red-600 bg-red-50', icon: XCircle },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  LUNAS: { label: 'Lunas', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  BELUM_BAYAR: { label: 'Belum Bayar', color: 'text-red-700 bg-red-50 border-red-200' },
  MENUNGGU: { label: 'Menunggu', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  SEBAGIAN: { label: 'Sebagian', color: 'text-blue-700 bg-blue-50 border-blue-200' },
};

const GRADE_TYPE_LABELS: Record<string, string> = {
  PENGETAHUAN: 'Pengetahuan',
  KETERAMPILAN: 'Keterampilan',
  UTS: 'UTS',
  UAS: 'UAS',
  SIKAP: 'Sikap',
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  akademik: { label: 'Akademik', color: 'bg-blue-50 text-blue-600' },
  keagamaan: { label: 'Keagamaan', color: 'bg-purple-50 text-purple-600' },
  keuangan: { label: 'Keuangan', color: 'bg-amber-50 text-amber-600' },
  umum: { label: 'Umum', color: 'bg-gray-50 text-gray-600' },
};

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const VIOLATION_CATEGORY: Record<string, { label: string; color: string }> = {
  ringan: { label: 'Ringan', color: 'text-amber-700 bg-amber-50' },
  sedang: { label: 'Sedang', color: 'text-orange-700 bg-orange-50' },
  berat: { label: 'Berat', color: 'text-red-700 bg-red-50' },
};

const ACHIEVEMENT_CATEGORY: Record<string, { label: string; color: string }> = {
  akademik: { label: 'Akademik', color: 'bg-blue-50 text-blue-600' },
  'non-akademik': { label: 'Non-Akademik', color: 'bg-green-50 text-green-600' },
  keagamaan: { label: 'Keagamaan', color: 'bg-purple-50 text-purple-600' },
  olahraga: { label: 'Olahraga', color: 'bg-orange-50 text-orange-600' },
  seni: { label: 'Seni', color: 'bg-pink-50 text-pink-600' },
};

const LEVEL_LABELS: Record<string, string> = {
  kelas: 'Tingkat Kelas',
  sekolah: 'Tingkat Sekolah',
  kecamatan: 'Tingkat Kecamatan',
  kota: 'Tingkat Kota',
  provinsi: 'Tingkat Provinsi',
  nasional: 'Tingkat Nasional',
  internasional: 'Tingkat Internasional',
};

type PortalMode = 'parent' | 'student';
type ParentTabKey = 'dashboard' | 'attendance' | 'grades' | 'payments' | 'announcements';
type StudentTabKey = 'dashboard' | 'schedule' | 'attendance' | 'grades' | 'tahfiz' | 'kesiswaan' | 'announcements';

// ============================================================
// SVG Donut Chart Component
// ============================================================
function DonutChart({ hadir, sakit, izin, alpha, total, size = 120 }: {
  hadir: number; sakit: number; izin: number; alpha: number; total: number; size?: number;
}) {
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs text-gray-400">Belum ada data</span>
      </div>
    );
  }
  const r = 40;
  const c = 2 * Math.PI * r;
  const segments = [
    { value: hadir, color: '#10b981' },
    { value: sakit, color: '#f59e0b' },
    { value: izin, color: '#3b82f6' },
    { value: alpha, color: '#ef4444' },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * c;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}
            transform="rotate(-90 50 50)" strokeLinecap="round" />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="47" textAnchor="middle" className="fill-gray-800" fontSize="16" fontWeight="700">
        {Math.round((hadir / total) * 100)}%
      </text>
      <text x="50" y="60" textAnchor="middle" className="fill-gray-400" fontSize="8">Hadir</text>
    </svg>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function SIMTPortal() {
  // Portal mode
  const [portalMode, setPortalMode] = useState<PortalMode>('parent');

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Parent-specific
  const [email, setEmail] = useState('');
  const [parentStudents, setParentStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [parentDashboard, setParentDashboard] = useState<ParentDashboardData | null>(null);
  const [parentTab, setParentTab] = useState<ParentTabKey>('dashboard');

  // Student-specific
  const [nis, setNis] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentDashboard, setStudentDashboard] = useState<StudentDashboardData | null>(null);
  const [studentTab, setStudentTab] = useState<StudentTabKey>('dashboard');

  // Shared
  const [gradeType, setGradeType] = useState('PENGETAHUAN');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // === PARENT LOGIN ===
  const handleParentLogin = useCallback(async () => {
    if (!email.trim()) { setLoginError('Email wajib diisi'); return; }
    setIsLoading(true); setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Login gagal'); return; }
      setParentStudents(data.students);
      if (data.students.length > 0) {
        setSelectedStudentId(data.students[0].id);
        setIsLoggedIn(true);
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // === STUDENT LOGIN ===
  const handleStudentLogin = useCallback(async () => {
    if (!nis.trim()) { setLoginError('NIS wajib diisi'); return; }
    if (!studentPassword.trim()) { setLoginError('Password wajib diisi'); return; }
    setIsLoading(true); setLoginError('');
    try {
      const res = await fetch('/api/student-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis: nis.trim(), password: studentPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Login gagal'); return; }
      setSelectedStudentId(data.student.id);
      setIsLoggedIn(true);
    } catch {
      setLoginError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  }, [nis, studentPassword]);

  // === FETCH DATA ===
  const fetchParentDashboard = useCallback(async (studentId: string, gType?: string) => {
    setIsRefreshing(true);
    try {
      const typeParam = gType || gradeType;
      const res = await fetch(`/api/dashboard?studentId=${studentId}&gradeType=${typeParam}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setParentDashboard(data);
    } catch (err) { console.error('Failed:', err); }
    finally { setIsRefreshing(false); setIsLoading(false); }
  }, [gradeType]);

  const fetchStudentDashboard = useCallback(async (studentId: string, gType?: string) => {
    setIsRefreshing(true);
    try {
      const typeParam = gType || gradeType;
      const res = await fetch(`/api/student-dashboard?studentId=${studentId}&gradeType=${typeParam}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudentDashboard(data);
    } catch (err) { console.error('Failed:', err); }
    finally { setIsRefreshing(false); setIsLoading(false); }
  }, [gradeType]);

  useEffect(() => {
    if (!selectedStudentId || !isLoggedIn) return;
    setIsLoading(true);
    if (portalMode === 'parent') fetchParentDashboard(selectedStudentId);
    else fetchStudentDashboard(selectedStudentId);
  }, [selectedStudentId, isLoggedIn]);

  // Grade type change
  const handleGradeTypeChange = async (newType: string) => {
    setGradeType(newType);
    setShowGradeDropdown(false);
    if (!selectedStudentId) return;
    setIsRefreshing(true);
    try {
      const api = portalMode === 'parent' ? '/api/dashboard' : '/api/student-dashboard';
      const res = await fetch(`${api}?studentId=${selectedStudentId}&gradeType=${newType}`);
      const data = await res.json();
      if (portalMode === 'parent') setParentDashboard(data);
      else setStudentDashboard(data);
    } catch (err) { console.error('Failed:', err); }
    finally { setIsRefreshing(false); }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setParentDashboard(null);
    setStudentDashboard(null);
    setEmail('');
    setNis('');
    setStudentPassword('');
    setSelectedStudentId(null);
    setParentStudents([]);
    setParentTab('dashboard');
    setStudentTab('dashboard');
    setShowLogoutConfirm(false);
    setLoginError('');
  };

  // Switch portal mode (only when not logged in)
  const switchPortalMode = (mode: PortalMode) => {
    if (isLoggedIn) return;
    setPortalMode(mode);
    setLoginError('');
  };

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">SIMT MTs</h1>
              <p className="text-xs text-emerald-100">Sistem Informasi Manajemen Terpadu</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">SIMT MTs Portal</h2>
              <p className="text-gray-500 mt-1">Sistem Informasi Manajemen Terpadu MTs</p>
            </div>

            {/* Portal Mode Switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              <button
                onClick={() => switchPortalMode('parent')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  portalMode === 'parent'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Orang Tua
              </button>
              <button
                onClick={() => switchPortalMode('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  portalMode === 'student'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Siswa
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
              {portalMode === 'parent' ? (
                /* PARENT LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Wali Murid</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleParentLogin()}
                        placeholder="ortu1@email.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition-all"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                    </div>
                  )}
                  <button
                    onClick={handleParentLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />Masuk</>}
                  </button>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700">
                      <strong>Demo:</strong> Email <code className="bg-amber-100 px-1 py-0.5 rounded">ortu1@email.com</code> s/d <code className="bg-amber-100 px-1 py-0.5 rounded">ortu8@email.com</code>
                    </p>
                  </div>
                </div>
              ) : (
                /* STUDENT LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">NIS (Nomor Induk Siswa)</label>
                    <div className="relative">
                      <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={nis}
                        onChange={(e) => { setNis(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                        placeholder="20250001"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={studentPassword}
                        onChange={(e) => { setStudentPassword(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                        placeholder="Masukkan password"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                    </div>
                  )}
                  <button
                    onClick={handleStudentLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />Masuk</>}
                  </button>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700">
                      <strong>Demo:</strong> NIS <code className="bg-blue-100 px-1 py-0.5 rounded">20250001</code> s/d <code className="bg-blue-100 px-1 py-0.5 rounded">20250010</code>, Password: <code className="bg-blue-100 px-1 py-0.5 rounded">siswa123</code>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              SIMT MTs v1.0 &copy; 2026 &mdash; Madrasah Tsanawiyah
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================
  if (isLoading && !parentDashboard && !studentDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat data portal...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PARENT PORTAL
  // ============================================================
  if (portalMode === 'parent' && parentDashboard) {
    return <ParentPortal
      dashboard={parentDashboard}
      students={parentStudents}
      selectedStudentId={selectedStudentId!}
      activeTab={parentTab}
      setActiveTab={setParentTab}
      gradeType={gradeType}
      setGradeType={setGradeType}
      showGradeDropdown={showGradeDropdown}
      setShowGradeDropdown={setShowGradeDropdown}
      isRefreshing={isRefreshing}
      onGradeTypeChange={handleGradeTypeChange}
      onStudentSwitch={(id) => { setSelectedStudentId(id); setParentTab('dashboard'); }}
      onLogout={handleLogout}
      onRefresh={() => selectedStudentId && fetchParentDashboard(selectedStudentId)}
      showLogoutConfirm={showLogoutConfirm}
      setShowLogoutConfirm={setShowLogoutConfirm}
    />;
  }

  // ============================================================
  // STUDENT PORTAL
  // ============================================================
  if (portalMode === 'student' && studentDashboard) {
    return <StudentPortal
      dashboard={studentDashboard}
      activeTab={studentTab}
      setActiveTab={setStudentTab}
      gradeType={gradeType}
      setGradeType={setGradeType}
      showGradeDropdown={showGradeDropdown}
      setShowGradeDropdown={setShowGradeDropdown}
      isRefreshing={isRefreshing}
      onGradeTypeChange={handleGradeTypeChange}
      onLogout={handleLogout}
      onRefresh={() => selectedStudentId && fetchStudentDashboard(selectedStudentId)}
      showLogoutConfirm={showLogoutConfirm}
      setShowLogoutConfirm={setShowLogoutConfirm}
    />;
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">Gagal memuat data</p>
        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Kembali ke Login</button>
      </div>
    </div>
  );
}

// ============================================================
// PARENT PORTAL COMPONENT
// ============================================================
function ParentPortal({ dashboard, students, selectedStudentId, activeTab, setActiveTab,
  gradeType, setGradeType, showGradeDropdown, setShowGradeDropdown, isRefreshing,
  onGradeTypeChange, onStudentSwitch, onLogout, onRefresh, showLogoutConfirm, setShowLogoutConfirm
}: {
  dashboard: ParentDashboardData;
  students: StudentInfo[];
  selectedStudentId: string;
  activeTab: ParentTabKey;
  setActiveTab: (t: ParentTabKey) => void;
  gradeType: string;
  setGradeType: (t: string) => void;
  showGradeDropdown: boolean;
  setShowGradeDropdown: (v: boolean) => void;
  isRefreshing: boolean;
  onGradeTypeChange: (t: string) => void;
  onStudentSwitch: (id: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (v: boolean) => void;
}) {
  const { student, attendanceSummary, payments, grades, announcements } = dashboard;
  const attendancePercent = attendanceSummary.total > 0 ? Math.round((attendanceSummary.hadir / attendanceSummary.total) * 100) : 0;

  const parentTabs: { key: ParentTabKey; label: string; icon: typeof BookOpen }[] = [
    { key: 'dashboard', label: 'Beranda', icon: BookOpen },
    { key: 'attendance', label: 'Presensi', icon: ClipboardCheck },
    { key: 'grades', label: 'Nilai', icon: Star },
    { key: 'payments', label: 'SPP', icon: CreditCard },
    { key: 'announcements', label: 'Info', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Portal Orang Tua</h1>
              <p className="text-[10px] text-emerald-100">{student.tenant.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Student Selector */}
      {students.length > 1 && (
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto">
            {students.map(s => (
              <button key={s.id} onClick={() => onStudentSwitch(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  s.id === selectedStudentId ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                }`}>
                {s.name.split(' ').slice(0, 2).join(' ')} ({s.classroom})
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Student Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base truncate">{student.name}</h2>
                  <p className="text-emerald-100 text-xs">Kelas {student.classroom} &bull; NIS: {student.nis}</p>
                </div>
              </div>
              {student.waliKelas && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-emerald-100">
                  <Phone className="w-3 h-3" />
                  Wali Kelas: {student.waliKelas.name}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <DonutChart hadir={attendanceSummary.hadir} sakit={attendanceSummary.sakit} izin={attendanceSummary.izin} alpha={attendanceSummary.alpha} total={attendanceSummary.total} size={64} />
                <p className="text-[10px] text-gray-500 mt-1">Kehadiran</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <p className="text-2xl font-bold text-blue-600">{grades.pengetahuanAverage}</p>
                <p className="text-[10px] text-gray-500">Rata-rata Nilai</p>
                <p className={`text-[10px] ${grades.isAllTuntas ? 'text-emerald-600' : 'text-red-600'}`}>
                  {grades.isAllTuntas ? 'Tuntas' : `${grades.belowKKMCount} di bawah KKM`}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <p className="text-2xl font-bold text-red-600">{payments.unpaid.length}</p>
                <p className="text-[10px] text-gray-500">SPP Belum Bayar</p>
                <p className="text-[10px] text-red-500">Rp {(payments.totalUnpaid / 1000).toFixed(0)}K</p>
              </div>
            </div>

            {/* Unpaid Alert */}
            {payments.unpaid.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">SPP Belum Dibayar</p>
                  <p className="text-xs text-red-600">
                    {payments.unpaid.map(p => `${MONTH_NAMES[p.month]} ${p.year}`).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Announcements */}
            {announcements.filter(a => a.isPinned).slice(0, 2).map(a => (
              <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">{a.title}</span>
                </div>
                <p className="text-xs text-blue-600 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Presensi - {attendanceSummary.periodLabel}</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const val = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`rounded-xl p-3 text-center ${cfg.color}`}>
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xl font-bold">{val}</p>
                    <p className="text-[10px] font-medium">{cfg.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                <h4 className="text-sm font-semibold text-gray-700">Riwayat Kehadiran</h4>
              </div>
              <div className="divide-y">
                {attendanceSummary.recent.map((a, i) => {
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.HADIR;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="text-center w-12">
                        <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                        <p className="text-sm font-bold">{new Date(a.date).getDate()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </div>
                      <div className="flex-1 text-xs text-gray-500">
                        {a.timeIn ? `Masuk: ${new Date(a.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        {a.note && <span className="text-gray-400 ml-2">({a.note})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Nilai</h3>
              <div className="relative">
                <button onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                  {GRADE_TYPE_LABELS[gradeType] || gradeType}<ChevronDown className="w-3 h-3" />
                </button>
                {showGradeDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                    {grades.availableTypes.map(t => (
                      <button key={t.type} onClick={() => onGradeTypeChange(t.type)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${gradeType === t.type ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}>
                        {GRADE_TYPE_LABELS[t.type] || t.type} ({t.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
              <p className="text-xs text-blue-100">Rata-rata Nilai {GRADE_TYPE_LABELS[gradeType] || gradeType}</p>
              <p className="text-3xl font-bold">{grades.average}</p>
              <p className="text-xs text-blue-200 mt-1">{grades.count} mata pelajaran</p>
            </div>
            <div className="space-y-2">
              {grades.list.map(g => (
                <div key={g.id} className="bg-white rounded-xl p-3 shadow-sm border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-800">{g.subject.name}</p>
                    <p className={`text-sm font-bold ${g.score >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{g.score}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${g.score >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(g.score, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{g.subject.code} &bull; KKM: 75</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Pembayaran SPP</h3>
            {payments.unpaid.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">{payments.unpaid.length} bulan belum dibayar</p>
                  <p className="text-xs text-red-600">Total: Rp {payments.totalUnpaid.toLocaleString('id-ID')}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {payments.all.map(p => {
                const cfg = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.BELUM_BAYAR;
                return (
                  <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{MONTH_NAMES[p.month]} {p.year}</p>
                      <p className="text-xs text-gray-500">Rp {p.amount.toLocaleString('id-ID')}</p>
                      {p.paidAt && <p className="text-[10px] text-gray-400">Dibayar: {new Date(p.paidAt).toLocaleDateString('id-ID')}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Pengumuman</h3>
            {announcements.map(a => {
              const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
              return (
                <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    {a.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{a.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">{a.content}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex">
          {parentTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors ${
                  activeTab === tab.key ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Keluar dari Portal?</h3>
            <p className="text-sm text-gray-500 mb-4">Anda perlu login kembali untuk mengakses portal.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={onLogout} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT PORTAL COMPONENT
// ============================================================
function StudentPortal({ dashboard, activeTab, setActiveTab,
  gradeType, setGradeType, showGradeDropdown, setShowGradeDropdown, isRefreshing,
  onGradeTypeChange, onLogout, onRefresh, showLogoutConfirm, setShowLogoutConfirm
}: {
  dashboard: StudentDashboardData;
  activeTab: StudentTabKey;
  setActiveTab: (t: StudentTabKey) => void;
  gradeType: string;
  setGradeType: (t: string) => void;
  showGradeDropdown: boolean;
  setShowGradeDropdown: (v: boolean) => void;
  isRefreshing: boolean;
  onGradeTypeChange: (t: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (v: boolean) => void;
}) {
  const { student, attendanceSummary, grades, schedules, violations, achievements, tahfiz, announcements } = dashboard;
  const attendancePercent = attendanceSummary.total > 0 ? Math.round((attendanceSummary.hadir / attendanceSummary.total) * 100) : 0;

  // Group schedules by day
  const scheduleByDay: Record<number, ScheduleInfo[]> = {};
  for (const s of schedules) {
    if (!scheduleByDay[s.dayOfWeek]) scheduleByDay[s.dayOfWeek] = [];
    scheduleByDay[s.dayOfWeek].push(s);
  }

  // Current day of week (1=Senin ... 6=Sabtu)
  const today = new Date().getDay();
  const todayDow = today === 0 ? 0 : today; // Sunday = 0

  const studentTabs: { key: StudentTabKey; label: string; icon: typeof BookOpen }[] = [
    { key: 'dashboard', label: 'Beranda', icon: BookOpen },
    { key: 'schedule', label: 'Jadwal', icon: Calendar },
    { key: 'grades', label: 'Nilai', icon: Star },
    { key: 'tahfiz', label: 'Tahfiz', icon: Moon },
    { key: 'kesiswaan', label: 'Siswa', icon: ShieldAlert },
    { key: 'announcements', label: 'Info', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Portal Siswa</h1>
              <p className="text-[10px] text-blue-100">{student.tenant.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {/* ============ STUDENT DASHBOARD ============ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Student Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base truncate">{student.name}</h2>
                  <p className="text-blue-100 text-xs">Kelas {student.classroom} &bull; NIS: {student.nis}</p>
                  {student.nisn && <p className="text-blue-200 text-[10px]">NISN: {student.nisn}</p>}
                </div>
              </div>
              {student.waliKelas && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-blue-100">
                  <Phone className="w-3 h-3" />
                  Wali Kelas: {student.waliKelas.name}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <DonutChart hadir={attendanceSummary.hadir} sakit={attendanceSummary.sakit} izin={attendanceSummary.izin} alpha={attendanceSummary.alpha} total={attendanceSummary.total} size={64} />
                <p className="text-[10px] text-gray-500 mt-1">Kehadiran</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <p className="text-2xl font-bold text-blue-600">{grades.pengetahuanAverage}</p>
                <p className="text-[10px] text-gray-500">Rata-rata Nilai</p>
                <p className={`text-[10px] ${grades.isAllTuntas ? 'text-emerald-600' : 'text-red-600'}`}>
                  {grades.isAllTuntas ? 'Semua Tuntas' : `${grades.belowKKMCount} di bawah KKM`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('tahfiz')}>
                <Moon className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-purple-600">{tahfiz.surahMemorized}</p>
                <p className="text-[10px] text-gray-500">Surah Hafalan</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('kesiswaan')}>
                <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-lg font-bold text-amber-600">{achievements.count}</p>
                <p className="text-[10px] text-gray-500">Prestasi</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('kesiswaan')}>
                <ShieldAlert className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-lg font-bold text-red-600">{violations.totalPoints}</p>
                <p className="text-[10px] text-gray-500">Poin Pelanggaran</p>
              </div>
            </div>

            {/* Today's Schedule Preview */}
            {scheduleByDay[todayDow] && todayDow >= 1 && todayDow <= 6 && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-2.5 border-b bg-blue-50 rounded-t-xl flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-700">Jadwal Hari Ini</h4>
                  <button onClick={() => setActiveTab('schedule')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
                    Lihat Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y">
                  {scheduleByDay[todayDow].slice(0, 4).map(s => (
                    <div key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="text-xs text-gray-400 w-12">Jam {s.startPeriod}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{s.subject.name}</p>
                        {s.teacher && <p className="text-[10px] text-gray-400">{s.teacher.name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tahfiz Progress */}
            {tahfiz.latestRecords.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-2.5 border-b bg-purple-50 rounded-t-xl flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-purple-700">Tahfiz Terakhir</h4>
                  <button onClick={() => setActiveTab('tahfiz')} className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-0.5">
                    Detail <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-4 py-3">
                  {tahfiz.latestRecords.slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm text-gray-800">{r.surah} : {r.ayahStart}-{r.ayahEnd}</p>
                        <p className="text-[10px] text-gray-400">{r.type === 'ziyadah' ? 'Ziyadah' : 'Muraja\'ah'}</p>
                      </div>
                      <span className={`text-sm font-bold ${r.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements */}
            {announcements.filter(a => a.isPinned).slice(0, 2).map(a => (
              <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">{a.title}</span>
                </div>
                <p className="text-xs text-blue-600 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* ============ SCHEDULE TAB ============ */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Jadwal Pelajaran</h3>
            <p className="text-xs text-gray-500">Kelas {student.classroom} - {student.academicYear}</p>

            {[1, 2, 3, 4, 5, 6].map(day => {
              const daySchedules = scheduleByDay[day];
              if (!daySchedules || daySchedules.length === 0) return null;
              const isToday = day === todayDow;
              return (
                <div key={day} className={`bg-white rounded-xl border shadow-sm ${isToday ? 'ring-2 ring-blue-400' : ''}`}>
                  <div className={`px-4 py-2.5 border-b rounded-t-xl flex items-center gap-2 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <Calendar className={`w-4 h-4 ${isToday ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h4 className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                      {DAY_NAMES[day]}
                      {isToday && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Hari Ini</span>}
                    </h4>
                  </div>
                  <div className="divide-y">
                    {daySchedules.map(s => (
                      <div key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="text-center w-14 shrink-0">
                          <p className="text-xs font-bold text-gray-700">Jam {s.startPeriod}</p>
                          <p className="text-[10px] text-gray-400">{s.startPeriod === s.endPeriod ? '' : `s/d ${s.endPeriod}`}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{s.subject.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {s.subject.code}
                            {s.teacher && ` • ${s.teacher.name}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(scheduleByDay).length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Jadwal belum tersedia</p>
              </div>
            )}
          </div>
        )}

        {/* ============ ATTENDANCE TAB (accessed via Dashboard) ============ */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Presensi - {attendanceSummary.periodLabel}</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const val = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`rounded-xl p-3 text-center ${cfg.color}`}>
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xl font-bold">{val}</p>
                    <p className="text-[10px] font-medium">{cfg.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                <h4 className="text-sm font-semibold text-gray-700">Riwayat Kehadiran</h4>
              </div>
              <div className="divide-y">
                {attendanceSummary.recent.map((a, i) => {
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.HADIR;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="text-center w-12">
                        <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                        <p className="text-sm font-bold">{new Date(a.date).getDate()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </div>
                      <div className="flex-1 text-xs text-gray-500">
                        {a.timeIn ? `Masuk: ${new Date(a.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        {a.note && <span className="text-gray-400 ml-2">({a.note})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============ GRADES TAB ============ */}
        {activeTab === 'grades' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Nilai</h3>
              <div className="relative">
                <button onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                  {GRADE_TYPE_LABELS[gradeType] || gradeType}<ChevronDown className="w-3 h-3" />
                </button>
                {showGradeDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                    {grades.availableTypes.map(t => (
                      <button key={t.type} onClick={() => onGradeTypeChange(t.type)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${gradeType === t.type ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        {GRADE_TYPE_LABELS[t.type] || t.type} ({t.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
              <p className="text-xs text-blue-100">Rata-rata Nilai {GRADE_TYPE_LABELS[gradeType] || gradeType}</p>
              <p className="text-3xl font-bold">{grades.average}</p>
              <p className="text-xs text-blue-200 mt-1">{grades.count} mata pelajaran</p>
            </div>
            <div className="space-y-2">
              {grades.list.map(g => (
                <div key={g.id} className="bg-white rounded-xl p-3 shadow-sm border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-800">{g.subject.name}</p>
                    <p className={`text-sm font-bold ${g.score >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{g.score}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${g.score >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(g.score, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{g.subject.code} &bull; KKM: 75</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ TAHFIZ TAB ============ */}
        {activeTab === 'tahfiz' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Monitoring Tahfiz</h3>

            {/* Tahfiz Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                <Moon className="w-6 h-6 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{tahfiz.surahMemorized}</p>
                <p className="text-xs text-purple-100">Surah Dihafal</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                <Star className="w-6 h-6 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{tahfiz.averageScore}</p>
                <p className="text-xs text-emerald-100">Rata-rata Nilai</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <p className="text-lg font-bold text-blue-600">{tahfiz.ziyadahCount}</p>
                <p className="text-[10px] text-gray-500">Sesi Ziyadah</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
                <p className="text-lg font-bold text-green-600">{tahfiz.murajaahCount}</p>
                <p className="text-[10px] text-gray-500">Sesi Muraja&apos;ah</p>
              </div>
            </div>

            {/* Tahfiz Records */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-purple-50 rounded-t-xl">
                <h4 className="text-sm font-semibold text-purple-700">Riwayat Hafalan</h4>
              </div>
              <div className="divide-y">
                {tahfiz.latestRecords.map(r => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          r.type === 'ziyadah' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {r.type === 'ziyadah' ? 'Ziyadah' : 'Muraja\'ah'}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{r.surah}</span>
                      </div>
                      <span className={`text-sm font-bold ${r.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{r.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400">
                        Ayat {r.ayahStart}-{r.ayahEnd}
                        {r.fluency && ` • ${r.fluency === 'lancar' ? 'Lancar' : r.fluency === 'cukup' ? 'Cukup' : 'Kurang'}`}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {r.note && <p className="text-[10px] text-gray-400 mt-0.5">{r.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {tahfiz.latestRecords.length === 0 && (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada data tahfiz</p>
              </div>
            )}
          </div>
        )}

        {/* ============ KESISWAAN TAB ============ */}
        {activeTab === 'kesiswaan' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Kesiswaan</h3>

            {/* Violations */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-red-50 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h4 className="text-sm font-semibold text-red-700">Pelanggaran</h4>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{violations.totalPoints} poin</span>
              </div>
              {violations.list.length > 0 ? (
                <div className="divide-y">
                  {violations.list.map(v => {
                    const catCfg = VIOLATION_CATEGORY[v.category] || VIOLATION_CATEGORY.ringan;
                    return (
                      <div key={v.id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(v.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{v.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-red-500 font-medium">-{v.points} poin</p>
                          {v.action && <p className="text-[10px] text-gray-400">Tindakan: {v.action}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Tidak ada catatan pelanggaran</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-amber-50 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-amber-700">Prestasi</h4>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{achievements.count} prestasi</span>
              </div>
              {achievements.list.length > 0 ? (
                <div className="divide-y">
                  {achievements.list.map(a => {
                    const catCfg = ACHIEVEMENT_CATEGORY[a.category] || ACHIEVEMENT_CATEGORY.akademik;
                    return (
                      <div key={a.id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{a.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{LEVEL_LABELS[a.level] || a.level}</span>
                          {a.ranking && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{a.ranking}</span>
                          )}
                        </div>
                        {a.description && <p className="text-[10px] text-gray-400 mt-0.5">{a.description}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Belum ada catatan prestasi</p>
                </div>
              )}
            </div>

            {/* Attendance Quick View */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                <h4 className="text-sm font-semibold text-gray-700">Presensi - {attendanceSummary.periodLabel}</h4>
              </div>
              <div className="grid grid-cols-4 gap-2 p-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const val = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className={`rounded-lg p-2 text-center ${cfg.color}`}>
                      <Icon className="w-4 h-4 mx-auto mb-0.5" />
                      <p className="text-sm font-bold">{val}</p>
                      <p className="text-[8px]">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============ ANNOUNCEMENTS TAB ============ */}
        {activeTab === 'announcements' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Pengumuman</h3>
            {announcements.map(a => {
              const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
              return (
                <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    {a.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{a.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">{a.content}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                </div>
              );
            })}
            {announcements.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada pengumuman</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex">
          {studentTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors ${
                  activeTab === tab.key ? 'text-blue-600' : 'text-gray-400'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Keluar dari Portal?</h3>
            <p className="text-sm text-gray-500 mb-4">Anda perlu login kembali untuk mengakses portal.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={onLogout} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
