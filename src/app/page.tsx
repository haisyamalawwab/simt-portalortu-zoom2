'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, LogIn, BookOpen, ClipboardCheck, CreditCard,
  Bell, User, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronRight, Phone, School, Star,
  LogOut, RefreshCw, Info, ChevronDown, Calendar
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

interface DashboardData {
  student: StudentInfo;
  attendanceSummary: AttendanceSummary;
  payments: PaymentInfo;
  grades: GradeInfo;
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

type TabKey = 'dashboard' | 'attendance' | 'grades' | 'payments' | 'announcements' | 'profile';

// ============================================================
// Main Component
// ============================================================
export default function SIMTParentPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [gradeType, setGradeType] = useState('PENGETAHUAN');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  // Login handler
  const handleLogin = useCallback(async () => {
    if (!email.trim()) {
      setLoginError('Email wajib diisi');
      return;
    }
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login gagal');
        return;
      }
      setStudents(data.students);
      if (data.students.length > 0) {
        setSelectedStudentId(data.students[0].id);
        setIsLoggedIn(true);
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi. Periksa internet Anda.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setDashboard(null);
    setEmail('');
    setSelectedStudentId(null);
    setStudents([]);
    setActiveTab('dashboard');
    setShowLogoutConfirm(false);
  };

  // Fetch dashboard data
  const fetchDashboard = useCallback(async (studentId: string, gType?: string) => {
    setIsRefreshing(true);
    try {
      const typeParam = gType || gradeType;
      const res = await fetch(`/api/dashboard?studentId=${studentId}&gradeType=${typeParam}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [gradeType]);

  useEffect(() => {
    if (!selectedStudentId) return;
    setIsLoading(true);
    fetchDashboard(selectedStudentId);
  }, [selectedStudentId]);

  // Handle grade type change
  const handleGradeTypeChange = async (newType: string) => {
    setGradeType(newType);
    setShowGradeDropdown(false);
    if (selectedStudentId) {
      setIsRefreshing(true);
      try {
        const res = await fetch(`/api/dashboard?studentId=${selectedStudentId}&gradeType=${newType}`);
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle student switch
  const handleStudentSwitch = (newId: string) => {
    setSelectedStudentId(newId);
    setActiveTab('dashboard');
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
              <p className="text-xs text-emerald-100">Portal Orang Tua</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Portal Orang Tua</h2>
              <p className="text-gray-500 mt-1">Sistem Informasi Manajemen Terpadu MTs</p>
              <p className="text-xs text-gray-400 mt-1">Masuk dengan email yang terdaftar di data siswa</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Wali Murid
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="ortu1@email.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Masuk
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  <strong>Demo:</strong> Gunakan email <code className="bg-amber-100 px-1 py-0.5 rounded">ortu1@email.com</code> s/d <code className="bg-amber-100 px-1 py-0.5 rounded">ortu8@email.com</code>
                </p>
              </div>
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
  if (isLoading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat data portal...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">Gagal memuat data</p>
          <p className="text-sm text-gray-500 mt-1">Terjadi kesalahan saat mengambil data. Silakan coba lagi.</p>
          <button
            onClick={() => selectedStudentId && fetchDashboard(selectedStudentId)}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { student, attendanceSummary, payments, grades, announcements } = dashboard;
  const attendancePercent = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.hadir / attendanceSummary.total) * 100)
    : 0;

  // ============================================================
  // MAIN PORTAL
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">{student.tenant.name}</h1>
                <p className="text-[10px] text-emerald-100">Portal Orang Tua</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
              )}
              {students.length > 1 && (
                <select
                  value={selectedStudentId || ''}
                  onChange={(e) => handleStudentSwitch(e.target.value)}
                  className="bg-white/15 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none max-w-[140px]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-800">
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Keluar"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <LogOut className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Keluar dari Portal?</h3>
              <p className="text-xs text-gray-500 mt-1">Anda perlu login kembali untuk mengakses data siswa</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Info Card */}
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-800 text-white px-4 pb-5 pt-1">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${student.gender === 'P' ? 'bg-pink-400/30' : 'bg-blue-400/30'}`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base truncate">{student.name}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  NIS: {student.nis} &bull; Kelas {student.classroom}
                </p>
                {student.waliKelas && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Phone className="w-3 h-3 text-emerald-200" />
                    <span className="text-[10px] text-emerald-100">
                      Wali Kelas: {student.waliKelas.name}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-[10px] bg-white/15 hover:bg-white/25 px-2 py-1 rounded-lg transition-colors"
              >
                Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-3">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
          <StatCard
            icon={<ClipboardCheck className="w-4 h-4" />}
            label="Kehadiran"
            value={attendanceSummary.hasData ? `${attendancePercent}%` : '-'}
            sublabel={attendanceSummary.hasData ? `${attendanceSummary.hadir}/${attendanceSummary.total} hari` : 'Belum ada'}
            color={attendancePercent >= 80 ? 'emerald' : attendancePercent >= 60 ? 'amber' : 'red'}
          />
          <StatCard
            icon={<BookOpen className="w-4 h-4" />}
            label="Rata-rata"
            value={grades.hasData ? String(grades.pengetahuanAverage) : '-'}
            sublabel={grades.hasData ? `${grades.pengetahuanCount} mapel` : 'Belum ada'}
            color={grades.pengetahuanAverage >= 75 ? 'blue' : grades.pengetahuanAverage >= 60 ? 'amber' : 'red'}
          />
          <StatCard
            icon={<CreditCard className="w-4 h-4" />}
            label="Tunggakan"
            value={payments.hasData ? (payments.totalUnpaid > 0 ? `Rp ${(payments.totalUnpaid / 1000).toFixed(0)}K` : 'Lunas') : '-'}
            sublabel={payments.hasData ? `${payments.unpaid.length} bln belum` : 'Belum ada'}
            color={payments.totalUnpaid > 0 ? 'red' : 'emerald'}
          />
          <StatCard
            icon={<Bell className="w-4 h-4" />}
            label="Info"
            value={String(announcements.length)}
            sublabel="pengumuman"
            color="purple"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-0.5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {([
              { key: 'dashboard', label: 'Beranda', icon: School },
              { key: 'attendance', label: 'Presensi', icon: ClipboardCheck },
              { key: 'grades', label: 'Nilai', icon: BookOpen },
              { key: 'payments', label: 'SPP', icon: CreditCard },
              { key: 'announcements', label: 'Info', icon: Bell },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-[60px] ${
                  activeTab === tab.key
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 px-4 py-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* ============ DASHBOARD TAB ============ */}
          {activeTab === 'dashboard' && (
            <>
              {/* Attendance Summary */}
              <SectionCard
                title={`Rekap Kehadiran ${attendanceSummary.periodLabel}`}
                icon={<ClipboardCheck className="w-4 h-4" />}
              >
                {attendanceSummary.hasData ? (
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                          strokeDasharray={`${attendancePercent} ${100 - attendancePercent}`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-emerald-700">{attendancePercent}%</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const count = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                        return (
                          <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${cfg.color}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{cfg.label}: {count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={<ClipboardCheck className="w-8 h-8" />} message="Belum ada data kehadiran" />
                )}
              </SectionCard>

              {/* Unpaid Payments Alert */}
              {payments.totalUnpaid > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 text-sm">Tunggakan SPP</p>
                      <p className="text-red-700 text-xs mt-1">
                        Terdapat {payments.unpaid.length} bulan SPP belum dibayar dengan total <strong>Rp {payments.totalUnpaid.toLocaleString('id-ID')}</strong>
                      </p>
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="mt-2 text-xs text-red-700 font-medium underline underline-offset-2 hover:text-red-900"
                      >
                        Lihat detail &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* All Paid Badge */}
              {payments.hasData && payments.totalUnpaid === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800 text-sm">SPP Lunas</p>
                      <p className="text-emerald-600 text-xs">Semua pembayaran SPP sudah lunas. Terima kasih!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Announcements */}
              <SectionCard title="Pengumuman Terbaru" icon={<Bell className="w-4 h-4" />}>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map(a => {
                      const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
                      return (
                        <div key={a.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setActiveTab('announcements')}>
                          <div className="flex items-start gap-2">
                            {a.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{a.title}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${catCfg.color}`}>{catCfg.label}</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState icon={<Bell className="w-8 h-8" />} message="Belum ada pengumuman" />
                )}
              </SectionCard>

              {/* Grade Summary */}
              <SectionCard title="Ringkasan Nilai" icon={<BookOpen className="w-4 h-4" />}>
                {grades.hasData ? (
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <div className={`text-3xl font-bold ${grades.average >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {grades.average}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Rata-rata {GRADE_TYPE_LABELS[grades.activeType] || grades.activeType}</p>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-1.5">
                        {grades.list.slice(0, 4).map(g => (
                          <div key={g.id} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-24 truncate">{g.subject.name}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${g.score >= 75 ? 'bg-blue-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${g.score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium w-8 text-right ${g.score >= 75 ? 'text-blue-600' : g.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {g.score}
                            </span>
                          </div>
                        ))}
                        {grades.list.length > 4 && (
                          <button onClick={() => setActiveTab('grades')} className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium">
                            Lihat semua {grades.count} mapel &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={<BookOpen className="w-8 h-8" />} message="Belum ada data nilai" />
                )}
              </SectionCard>
            </>
          )}

          {/* ============ ATTENDANCE TAB ============ */}
          {activeTab === 'attendance' && (
            <SectionCard
              title={`Riwayat Kehadiran ${attendanceSummary.periodLabel}`}
              icon={<ClipboardCheck className="w-4 h-4" />}
            >
              {attendanceSummary.hasData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const count = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                      return (
                        <div key={key} className={`text-center p-2 rounded-lg ${cfg.color}`}>
                          <cfg.icon className="w-4 h-4 mx-auto mb-1" />
                          <p className="text-lg font-bold">{count}</p>
                          <p className="text-[10px]">{cfg.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Attendance percentage bar */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Persentase Kehadiran</span>
                      <span className="text-sm font-bold text-emerald-700">{attendancePercent}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${attendancePercent >= 80 ? 'bg-emerald-500' : attendancePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Daily Log */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">Riwayat Harian</p>
                    <span className="text-[10px] text-gray-400">{attendanceSummary.recent.length} terakhir</span>
                  </div>
                  <div className="space-y-2">
                    {attendanceSummary.recent.map((a, i) => {
                      const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.HADIR;
                      const StatusIcon = status.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-100 shrink-0">
                            <span className="text-xs font-bold text-gray-700">
                              {new Date(a.date).getDate()}
                            </span>
                            <span className="text-[8px] text-gray-400 uppercase">
                              {new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {a.timeIn && (
                                <span className="text-[10px] text-gray-400">
                                  Masuk: {new Date(a.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {a.timeOut && (
                                <span className="text-[10px] text-gray-400">
                                  Pulang: {new Date(a.timeOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            {a.note && (
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{a.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <EmptyState icon={<ClipboardCheck className="w-8 h-8" />} message="Belum ada data kehadiran untuk periode ini" />
              )}
            </SectionCard>
          )}

          {/* ============ GRADES TAB ============ */}
          {activeTab === 'grades' && (
            <SectionCard title="Nilai" icon={<BookOpen className="w-4 h-4" />}>
              {/* Grade Type Selector */}
              {grades.availableTypes.length > 0 && (
                <div className="relative mb-4">
                  <button
                    onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      {GRADE_TYPE_LABELS[grades.activeType] || grades.activeType}
                      <span className="text-[10px] text-gray-400">({grades.count} mapel)</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showGradeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {grades.availableTypes.map(gt => (
                        <button
                          key={gt.type}
                          onClick={() => handleGradeTypeChange(gt.type)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            grades.activeType === gt.type ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span>{GRADE_TYPE_LABELS[gt.type] || gt.type}</span>
                          <span className="text-[10px] text-gray-400">{gt.count} nilai</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {grades.hasData ? (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${grades.average >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {grades.average}
                      </p>
                      <p className="text-[10px] text-gray-400">Rata-rata</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-700">{grades.count}</p>
                      <p className="text-[10px] text-gray-400">Mata Pelajaran</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${grades.isAllTuntas ? 'text-emerald-600' : 'text-red-500'}`}>
                        {grades.isAllTuntas ? 'Tuntas' : `${grades.belowKKMCount} Belum`}
                      </p>
                      <p className="text-[10px] text-gray-400">KKM: 75</p>
                    </div>
                  </div>

                  {/* Grade List */}
                  <div className="space-y-2">
                    {grades.list.map(g => (
                      <div key={g.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          g.score >= 80 ? 'bg-blue-500' : g.score >= 70 ? 'bg-emerald-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {g.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{g.subject.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-gray-400">{g.subject.code}</p>
                            {g.score < 75 && (
                              <span className="text-[9px] px-1 py-0.5 bg-red-50 text-red-500 rounded border border-red-200 font-medium">Belum Tuntas</span>
                            )}
                          </div>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${g.score >= 75 ? 'bg-blue-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${g.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState icon={<BookOpen className="w-8 h-8" />} message="Belum ada data nilai untuk tipe ini" />
              )}
            </SectionCard>
          )}

          {/* ============ PAYMENTS TAB ============ */}
          {activeTab === 'payments' && (
            <>
              {/* Summary Banner */}
              <div className={`rounded-xl p-4 ${payments.totalUnpaid > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payments.totalUnpaid > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <CreditCard className={`w-5 h-5 ${payments.totalUnpaid > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${payments.totalUnpaid > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                      {payments.hasData ? (payments.totalUnpaid > 0 ? `Tunggakan: Rp ${payments.totalUnpaid.toLocaleString('id-ID')}` : 'SPP Lunas') : 'Belum ada data'}
                    </p>
                    <p className={`text-xs ${payments.totalUnpaid > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {payments.unpaid.length > 0 ? `${payments.unpaid.length} bulan belum dibayar` : payments.hasData ? `Total dibayar: Rp ${payments.totalPaid.toLocaleString('id-ID')}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment List */}
              {payments.hasData ? (
                <SectionCard title="Riwayat SPP 2026" icon={<CreditCard className="w-4 h-4" />}>
                  <div className="space-y-2">
                    {payments.all.map(p => {
                      const statusCfg = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.BELUM_BAYAR;
                      const isOverdue = p.status === 'BELUM_BAYAR' && p.dueDate && new Date(p.dueDate) < new Date();
                      return (
                        <div key={p.id} className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isOverdue ? 'ring-1 ring-red-200' : ''}`}>
                          <div className={`w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border shrink-0 ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
                            <span className="text-xs font-bold text-gray-700">{p.month}</span>
                            <span className="text-[8px] text-gray-400">{p.year}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              SPP {MONTH_NAMES[p.month]} {p.year}
                            </p>
                            <p className="text-xs text-gray-500">
                              Rp {p.amount.toLocaleString('id-ID')}
                            </p>
                            {p.paidAt && (
                              <p className="text-[10px] text-emerald-500">
                                Dibayar: {new Date(p.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                            {isOverdue && (
                              <p className="text-[10px] text-red-500 font-medium">
                                Jatuh tempo: {new Date(p.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              ) : (
                <SectionCard title="Riwayat Pembayaran" icon={<CreditCard className="w-4 h-4" />}>
                  <EmptyState icon={<CreditCard className="w-8 h-8" />} message="Belum ada data pembayaran" />
                </SectionCard>
              )}
            </>
          )}

          {/* ============ ANNOUNCEMENTS TAB ============ */}
          {activeTab === 'announcements' && (
            <SectionCard title="Pengumuman" icon={<Bell className="w-4 h-4" />}>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map(a => {
                    const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
                    return (
                      <div key={a.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          {a.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                              <Star className="w-2.5 h-2.5" /> Penting
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${catCfg.color}`}>{catCfg.label}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm">{a.title}</h3>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{a.content}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={<Bell className="w-8 h-8" />} message="Belum ada pengumuman" />
              )}
            </SectionCard>
          )}

          {/* ============ PROFILE TAB ============ */}
          {activeTab === 'profile' && (
            <>
              <SectionCard title="Data Siswa" icon={<User className="w-4 h-4" />}>
                <div className="space-y-3">
                  <ProfileRow label="Nama Lengkap" value={student.name} />
                  <ProfileRow label="NIS" value={student.nis} />
                  {student.nisn && <ProfileRow label="NISN" value={student.nisn} />}
                  <ProfileRow label="Jenis Kelamin" value={student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                  <ProfileRow label="Kelas" value={`${student.classroom} (Tingkat ${student.level})`} />
                  <ProfileRow label="Tahun Ajaran" value={student.academicYear || '-'} />
                  {student.birthPlace && student.birthDate && (
                    <ProfileRow label="Tempat, Tgl Lahir" value={`${student.birthPlace}, ${new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
                  )}
                  {student.address && <ProfileRow label="Alamat" value={student.address} />}
                </div>
              </SectionCard>

              <SectionCard title="Data Orang Tua / Wali" icon={<Phone className="w-4 h-4" />}>
                <div className="space-y-3">
                  {student.fatherName && <ProfileRow label="Nama Ayah" value={student.fatherName} />}
                  {student.fatherPhone && <ProfileRow label="Telepon Ayah" value={student.fatherPhone} />}
                  {student.motherName && <ProfileRow label="Nama Ibu" value={student.motherName} />}
                  {student.motherPhone && <ProfileRow label="Telepon Ibu" value={student.motherPhone} />}
                </div>
              </SectionCard>

              {student.waliKelas && (
                <SectionCard title="Wali Kelas" icon={<School className="w-4 h-4" />}>
                  <div className="space-y-3">
                    <ProfileRow label="Nama" value={student.waliKelas.name} />
                    {student.waliKelas.phone && <ProfileRow label="Telepon" value={student.waliKelas.phone} />}
                  </div>
                </SectionCard>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="max-w-2xl mx-auto flex justify-around">
          {([
            { key: 'dashboard', label: 'Beranda', icon: School },
            { key: 'attendance', label: 'Presensi', icon: ClipboardCheck },
            { key: 'grades', label: 'Nilai', icon: BookOpen },
            { key: 'payments', label: 'SPP', icon: CreditCard },
            { key: 'announcements', label: 'Info', icon: Bell },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px] ${
                activeTab === tab.key ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Click-away for grade dropdown */}
      {showGradeDropdown && (
        <div className="fixed inset-0 z-[1]" onClick={() => setShowGradeDropdown(false)} />
      )}
    </div>
  );
}

// ============================================================
// Sub Components
// ============================================================

function StatCard({ icon, label, value, sublabel, color }: {
  icon: React.ReactNode; label: string; value: string; sublabel: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-500', blue: 'text-blue-500', red: 'text-red-500',
    amber: 'text-amber-500', purple: 'text-purple-500',
  };

  return (
    <div className={`rounded-xl p-3 border ${colorMap[color] || colorMap.emerald}`}>
      <div className={`${iconColorMap[color] || iconColorMap.emerald} mb-1`}>{icon}</div>
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-[9px] opacity-70 mt-0.5">{sublabel}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <span className="text-emerald-600">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-gray-300 mb-2">{icon}</div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}
