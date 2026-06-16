'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GraduationCap, LogIn, BookOpen, ClipboardCheck, CreditCard,
  Bell, User, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronRight, Phone, School, Star,
  LogOut, RefreshCw, Info, ChevronDown, Calendar,
  BookMarked, Trophy, ShieldAlert, Moon, Lock, Users, X, CheckCircle, Eye, EyeOff,
  Download, ArrowDown, ChevronLeft, ChevronUp, Grid3X3, List
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
interface StudentInfo {
  id: string; name: string; nis: string; nisn?: string;
  classroom: string; level: number; academicYear: string;
  waliKelas: { name: string; phone: string } | null;
  tenant: { name: string; slug: string };
  gender: string; birthPlace?: string; birthDate?: string;
  address?: string; fatherName?: string; fatherPhone?: string;
  motherName?: string; motherPhone?: string; photo?: string;
}

interface AttendanceSummary {
  hadir: number; sakit: number; izin: number; alpha: number;
  total: number; periodLabel: string; hasData: boolean;
  recent: { date: string; status: string; timeIn: string | null; timeOut?: string | null; note: string | null }[];
  daily: { date: string; status: string; timeIn: string | null; timeOut: string | null; note: string | null }[];
}

interface PaymentInfo {
  all: { id: string; month: number; year: number; amount: number; status: string; dueDate: string; paidAt: string | null }[];
  unpaid: { id: string; month: number; year: number; amount: number; status: string; dueDate: string }[];
  totalUnpaid: number; totalPaid: number; hasData: boolean;
}

interface GradeInfo {
  list: { id: string; score: number; subject: { id: string; name: string; code: string } }[];
  average: number; count: number; activeType: string;
  availableTypes: { type: string; count: number }[];
  hasData: boolean; belowKKMCount: number;
  pengetahuanAverage: number; pengetahuanCount: number; isAllTuntas: boolean;
}

interface AnnouncementInfo { id: string; title: string; content: string; category: string; isPinned: boolean; publishedAt: string; }
interface ScheduleInfo { id: string; dayOfWeek: number; startPeriod: number; endPeriod: number; subject: { name: string; code: string }; teacher: { name: string } | null; }
interface ViolationInfo { id: string; date: string; category: string; description: string; points: number; action: string | null; }
interface AchievementInfo { id: string; date: string; title: string; category: string; level: string; ranking: string | null; description: string | null; }
interface TahfizInfo {
  totalRecords: number; ziyadahCount: number; murajaahCount: number;
  averageScore: number; surahMemorized: number;
  latestRecords: { id: string; date: string; surah: string; ayahStart: number; ayahEnd: number; type: string; score: number; fluency: string | null; note: string | null }[];
}

interface GradeDetailItem {
  id: string; title: string; score: number; weight: number;
  date: string | null; note: string | null;
}
interface GradeDetailGrouped {
  tugas: GradeDetailItem[]; harian: GradeDetailItem[];
  uts: GradeDetailItem[]; uas: GradeDetailItem[]; akhir: GradeDetailItem[];
}
interface GradeDetailData {
  details: GradeDetailGrouped;
  averages: { tugas: number | null; harian: number | null; uts: number | null; uas: number | null; akhir: number | null };
  hasData: boolean;
}

interface ParentDashboardData { student: StudentInfo; attendanceSummary: AttendanceSummary; payments: PaymentInfo; grades: GradeInfo; announcements: AnnouncementInfo[]; }
interface StudentDashboardData {
  student: StudentInfo; attendanceSummary: AttendanceSummary; grades: GradeInfo;
  schedules: ScheduleInfo[]; violations: { list: ViolationInfo[]; totalPoints: number; count: number };
  achievements: { list: AchievementInfo[]; count: number }; tahfiz: TahfizInfo; announcements: AnnouncementInfo[];
}

// ============================================================
// Constants
// ============================================================
const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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

const GRADE_TYPE_LABELS: Record<string, string> = { PENGETAHUAN: 'Pengetahuan', KETERAMPILAN: 'Keterampilan', UTS: 'UTS', UAS: 'UAS', SIKAP: 'Sikap' };

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
  kelas: 'Tingkat Kelas', sekolah: 'Tingkat Sekolah', kecamatan: 'Tingkat Kecamatan',
  kota: 'Tingkat Kota', provinsi: 'Tingkat Provinsi', nasional: 'Tingkat Nasional', internasional: 'Tingkat Internasional',
};

type PortalMode = 'parent' | 'student';
type ParentTabKey = 'dashboard' | 'attendance' | 'grades' | 'payments' | 'announcements';
type StudentTabKey = 'dashboard' | 'schedule' | 'grades' | 'tahfiz' | 'kesiswaan' | 'announcements';

// ============================================================
// Donut Chart with draw animation
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
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * c;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}
            transform="rotate(-90 50 50)" strokeLinecap="round"
            className="animate-donut" style={{ animationDelay: `${i * 0.15}s` }} />
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
// Attendance Calendar Component (Immersive Mobile-First)
// ============================================================
const CAL_STATUS_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  HADIR:  { bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  SAKIT:  { bg: 'bg-amber-100',  dot: 'bg-amber-500',  text: 'text-amber-700' },
  IZIN:   { bg: 'bg-blue-100',   dot: 'bg-blue-500',   text: 'text-blue-700' },
  ALPHA:  { bg: 'bg-red-100',    dot: 'bg-red-500',    text: 'text-red-700' },
};

function AttendanceCalendar({
  daily,
  periodLabel,
  onClose,
  theme = 'emerald',
}: {
  daily: { date: string; status: string; timeIn: string | null; timeOut: string | null; note: string | null }[];
  periodLabel: string;
  onClose: () => void;
  theme?: 'emerald' | 'blue';
}) {
  // Build lookup: "YYYY-MM-DD" -> record
  const dailyMap = useRef<Record<string, typeof daily[number]>>({});
  if (Object.keys(dailyMap.current).length !== daily.length) {
    dailyMap.current = {};
    for (const d of daily) {
      const dt = new Date(d.date);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      dailyMap.current[key] = d;
    }
  }

  // Determine the month/year from the data or current date
  const firstDate = daily.length > 0 ? new Date(daily[0].date) : new Date();
  const [viewYear, setViewYear] = useState(firstDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(firstDate.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Theme-derived classes
  const isBlue = theme === 'blue';
  const themeGrad = isBlue ? 'from-blue-700 to-indigo-700' : 'from-emerald-700 to-teal-700';
  const themeTextSub = isBlue ? 'text-blue-100' : 'text-emerald-100';
  const themeRing = isBlue ? 'ring-blue-400' : 'ring-emerald-400';
  const themeRingSel = isBlue ? 'ring-blue-500' : 'ring-emerald-500';
  const themeTextBold = isBlue ? 'text-blue-600' : 'text-emerald-600';
  const themeUnderline = isBlue ? 'decoration-blue-500' : 'decoration-emerald-500';

  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTH_NAMES_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DAY_NAMES_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Calendar grid calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  // 0=Sun in JS, convert to Mon-start: Mon=0, Tue=1, ..., Sun=6
  const startDow = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
    setSelectedDay(null);
  };

  // Selected day details
  const selectedRecord = selectedDay ? dailyMap.current[selectedDay] : null;
  const selectedDate = selectedDay ? new Date(selectedDay + 'T00:00:00') : null;

  // Count statuses for current month view
  const monthRecords = daily.filter(d => {
    const dt = new Date(d.date);
    return dt.getFullYear() === viewYear && dt.getMonth() === viewMonth;
  });
  const monthStats = {
    hadir: monthRecords.filter(r => r.status === 'HADIR').length,
    sakit: monthRecords.filter(r => r.status === 'SAKIT').length,
    izin: monthRecords.filter(r => r.status === 'IZIN').length,
    alpha: monthRecords.filter(r => r.status === 'ALPHA').length,
  };

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-slide-up" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${themeGrad} text-white px-4 py-3 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-1 hover:bg-white/10 rounded-xl active:scale-90 transition-all touch-target-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold">Kalender Presensi</h1>
              <p className={`text-[10px] ${themeTextSub}`}>{periodLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b">
        <button onClick={prevMonth} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-90 transition-all touch-target-sm">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-base font-bold text-gray-800">
          {MONTH_NAMES_FULL[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 active:scale-90 transition-all touch-target-sm">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto scroll-native px-4 pt-3 pb-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - startDow + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const dateKey = isCurrentMonth
              ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              : null;
            const record = dateKey ? dailyMap.current[dateKey] : null;
            const isToday = dateKey === (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; })();
            const isSelected = dateKey === selectedDay;
            const statusCfg = record ? CAL_STATUS_COLORS[record.status] : null;
            const isSunday = isCurrentMonth && new Date(viewYear, viewMonth, dayNum).getDay() === 0;

            return (
              <button
                key={i}
                disabled={!isCurrentMonth || !record}
                onClick={() => { if (dateKey && record) setSelectedDay(isSelected ? null : dateKey); }}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150
                  ${!isCurrentMonth ? 'opacity-0' : ''}
                  ${isCurrentMonth && !record && !isSunday ? 'text-gray-300' : ''}
                  ${isSunday && isCurrentMonth && !record ? 'text-red-300' : ''}
                  ${isToday && !isSelected ? `ring-2 ${themeRing} ring-offset-1` : ''}
                  ${isSelected ? `ring-2 ${themeRingSel} scale-105 shadow-md` : ''}
                  ${record ? 'press-effect' : ''}
                  ${statusCfg ? `${statusCfg.bg} ${statusCfg.text}` : ''}
                `}
              >
                <span className={`text-xs font-semibold leading-none ${isToday ? `underline decoration-2 underline-offset-2 ${themeUnderline}` : ''}`}>
                  {isCurrentMonth ? dayNum : ''}
                </span>
                {statusCfg && <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />}
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        {selectedRecord && selectedDate && (
          <div className="mt-4 bg-white rounded-xl border shadow-sm animate-slide-up overflow-hidden">
            <div className={`px-4 py-3 flex items-center gap-3 ${CAL_STATUS_COLORS[selectedRecord.status]?.bg || 'bg-gray-50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CAL_STATUS_COLORS[selectedRecord.status]?.dot || 'bg-gray-400'} text-white`}>
                {selectedRecord.status === 'HADIR' && <CheckCircle2 className="w-5 h-5" />}
                {selectedRecord.status === 'SAKIT' && <AlertCircle className="w-5 h-5" />}
                {selectedRecord.status === 'IZIN' && <Clock className="w-5 h-5" />}
                {selectedRecord.status === 'ALPHA' && <XCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${CAL_STATUS_COLORS[selectedRecord.status]?.text || 'text-gray-700'}`}>
                  {STATUS_CONFIG[selectedRecord.status]?.label || selectedRecord.status}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              {selectedRecord.timeIn && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Masuk: {new Date(selectedRecord.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selectedRecord.timeOut && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Pulang: {new Date(selectedRecord.timeOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selectedRecord.note && (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <span>{selectedRecord.note}</span>
                </div>
              )}
              {!selectedRecord.timeIn && !selectedRecord.timeOut && !selectedRecord.note && (
                <p className="text-xs text-gray-400">Tidak ada catatan tambahan</p>
              )}
            </div>
          </div>
        )}

        {/* Legend & Stats */}
        <div className="mt-4 space-y-3">
          {/* Month Stats Summary */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const val = monthStats[key.toLowerCase() as keyof typeof monthStats];
              const Icon = cfg.icon;
              return (
                <div key={key} className={`rounded-xl p-2.5 text-center ${cfg.color}`}>
                  <Icon className="w-4 h-4 mx-auto mb-0.5" />
                  <p className="text-sm font-bold">{val}</p>
                  <p className="text-[9px]">{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Keterangan Warna</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CAL_STATUS_COLORS).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-gray-600">{STATUS_CONFIG[key]?.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safe area bottom padding */}
      <div className="h-2 home-indicator-pad" />
    </div>
  );
}

// ============================================================
// Toast Notification Component (with exit animation)
// ============================================================
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      const removeTimer = setTimeout(onClose, 250);
      return () => clearTimeout(removeTimer);
    }, 2200);
    return () => clearTimeout(dismissTimer);
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 250);
  };

  const iconMap = { success: CheckCircle, error: AlertCircle, info: Info };
  const colorMap = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600' };
  const Icon = iconMap[type];

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${isLeaving ? 'animate-toast-out' : 'animate-toast-in'}`}
         style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium ${colorMap[type]}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{message}</span>
        <button onClick={handleClose} className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors touch-target-sm flex items-center justify-center">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Pull-to-Refresh Hook
// ============================================================
function usePullToRefresh(onRefresh: () => void) {
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setPullState('pulling');
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullState === 'idle' || pullState === 'refreshing') return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      const damped = Math.min(diff * 0.4, 120);
      setPullDistance(damped);
      setPullState(damped >= THRESHOLD ? 'ready' : 'pulling');
    }
  }, [pullState]);

  const onTouchEnd = useCallback(() => {
    if (pullState === 'ready') {
      setPullState('refreshing');
      setPullDistance(THRESHOLD);
      onRefresh();
      setTimeout(() => {
        setPullState('idle');
        setPullDistance(0);
      }, 1200);
    } else {
      setPullState('idle');
      setPullDistance(0);
    }
  }, [pullState, onRefresh]);

  return { pullState, pullDistance, containerRef, onTouchStart, onTouchMove, onTouchEnd };
}

// ============================================================
// PWA Install Prompt Hook
// ============================================================
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => void } | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => void });
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => setShowInstall(false), []);

  return { showInstall, install, dismiss };
}

// ============================================================
// Main Component
// ============================================================
export default function SIMTPortal() {
  const [portalMode, setPortalMode] = useState<PortalMode>('parent');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Parent
  const [email, setEmail] = useState('');
  const [parentStudents, setParentStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [parentDashboard, setParentDashboard] = useState<ParentDashboardData | null>(null);
  const [parentTab, setParentTab] = useState<ParentTabKey>('dashboard');

  // Student
  const [nis, setNis] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentDashboard, setStudentDashboard] = useState<StudentDashboardData | null>(null);
  const [studentTab, setStudentTab] = useState<StudentTabKey>('dashboard');

  // Shared
  const [gradeType, setGradeType] = useState('PENGETAHUAN');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // PWA
  const pwaInstall = usePWAInstall();

  // Ref for closing dropdown on outside click
  const gradeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(e.target as Node)) {
        setShowGradeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick as unknown as EventListener);
    };
  }, []);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  // === PARENT LOGIN ===
  const handleParentLogin = useCallback(async () => {
    if (!email.trim()) { setLoginError('Email wajib diisi'); return; }
    setIsLoading(true); setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Login gagal'); return; }
      setParentStudents(data.students);
      if (data.students.length > 0) {
        setSelectedStudentId(data.students[0].id);
        setIsLoggedIn(true);
      }
    } catch { setLoginError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'); }
    finally { setIsLoading(false); }
  }, [email]);

  // === STUDENT LOGIN ===
  const handleStudentLogin = useCallback(async () => {
    if (!nis.trim()) { setLoginError('NIS wajib diisi'); return; }
    if (!studentPassword.trim()) { setLoginError('Password wajib diisi'); return; }
    setIsLoading(true); setLoginError('');
    try {
      const res = await fetch('/api/student-auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis: nis.trim(), password: studentPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Login gagal'); return; }
      setSelectedStudentId(data.student.id);
      setIsLoggedIn(true);
    } catch { setLoginError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'); }
    finally { setIsLoading(false); }
  }, [nis, studentPassword]);

  // === FETCH WITH RETRY ===
  const fetchWithRetry = useCallback(async (url: string, retries = 2): Promise<Response> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (res.ok) return res;
        if (i === retries) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries');
  }, []);

  const fetchParentDashboard = useCallback(async (studentId: string, gType?: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetchWithRetry(`/api/dashboard?studentId=${studentId}&gradeType=${gType || gradeType}`);
      setParentDashboard(await res.json());
    } catch { showToast('Gagal memuat data. Ketuk untuk mencoba lagi.', 'error'); }
    finally { setIsRefreshing(false); setIsLoading(false); }
  }, [gradeType, showToast, fetchWithRetry]);

  const fetchStudentDashboard = useCallback(async (studentId: string, gType?: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetchWithRetry(`/api/student-dashboard?studentId=${studentId}&gradeType=${gType || gradeType}`);
      setStudentDashboard(await res.json());
    } catch { showToast('Gagal memuat data. Ketuk untuk mencoba lagi.', 'error'); }
    finally { setIsRefreshing(false); setIsLoading(false); }
  }, [gradeType, showToast, fetchWithRetry]);

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
      const res = await fetchWithRetry(`${api}?studentId=${selectedStudentId}&gradeType=${newType}`);
      const data = await res.json();
      if (portalMode === 'parent') setParentDashboard(data);
      else setStudentDashboard(data);
      showToast(`Nilai ${GRADE_TYPE_LABELS[newType] || newType}`, 'info');
    } catch { showToast('Gagal mengubah jenis nilai', 'error'); }
    finally { setIsRefreshing(false); }
  };

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (!selectedStudentId) return;
    if (portalMode === 'parent') fetchParentDashboard(selectedStudentId);
    else fetchStudentDashboard(selectedStudentId);
    showToast('Data diperbarui', 'success');
  }, [selectedStudentId, portalMode, fetchParentDashboard, fetchStudentDashboard, showToast]);

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false); setParentDashboard(null); setStudentDashboard(null);
    setEmail(''); setNis(''); setStudentPassword('');
    setSelectedStudentId(null); setParentStudents([]);
    setParentTab('dashboard'); setStudentTab('dashboard');
    setShowLogoutConfirm(false); setLoginError('');
    setGradeType('PENGETAHUAN');
    showToast('Berhasil keluar', 'info');
  };

  const switchPortalMode = (mode: PortalMode) => {
    if (isLoggedIn) return;
    setPortalMode(mode); setLoginError('');
  };

  // Tab change with animation reset
  const handleParentTabChange = (tab: ParentTabKey) => setParentTab(tab);
  const handleStudentTabChange = (tab: StudentTabKey) => setStudentTab(tab);

  // ============================================================
  // TOAST
  // ============================================================
  const toastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col overflow-hidden">
        {toastEl}

        {/* PWA Install Banner */}
        {pwaInstall.showInstall && (
          <div className="fixed top-0 left-0 right-0 z-[80] safe-area-top">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center gap-3 animate-slide-down">
              <Download className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Install SIMT MTs</p>
                <p className="text-xs text-emerald-100">Akses cepat dari home screen</p>
              </div>
              <button onClick={pwaInstall.install} className="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-bold press-effect touch-target-sm">
                Install
              </button>
              <button onClick={pwaInstall.dismiss} className="p-1.5 hover:bg-white/20 rounded-lg touch-target-sm flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg pwa-header safe-area-top">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">SIMT MTs</h1>
              <p className="text-xs text-emerald-100">Sistem Informasi Manajemen Terpadu</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="text-center mb-6 animate-slide-up">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-500 ${
                portalMode === 'parent'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
              }`}>
                <GraduationCap className="w-10 h-10 text-white transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">SIMT MTs Portal</h2>
              <p className="text-gray-500 mt-1 text-sm">Sistem Informasi Manajemen Terpadu MTs</p>
            </div>

            {/* Portal Mode Switcher - Native Segmented Control */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5 animate-slide-up stagger-1">
              <button
                onClick={() => switchPortalMode('parent')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 press-effect touch-target ${
                  portalMode === 'parent'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <Users className="w-4 h-4" />
                Orang Tua
              </button>
              <button
                onClick={() => switchPortalMode('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 press-effect touch-target ${
                  portalMode === 'student'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Siswa
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 border border-gray-100 animate-scale-in stagger-2">
              {portalMode === 'parent' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Wali Murid</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleParentLogin()}
                        placeholder="ortu1@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl native-input text-base outline-none"
                        autoComplete="email" inputMode="email" />
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-slide-down">
                      <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                    </div>
                  )}
                  <button onClick={handleParentLogin} disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-200 touch-target">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />Masuk</>}
                  </button>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700"><strong>Demo:</strong> Email <code className="bg-amber-100 px-1 py-0.5 rounded">ortu1@email.com</code> s/d <code className="bg-amber-100 px-1 py-0.5 rounded">ortu8@email.com</code></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">NIS (Nomor Induk Siswa)</label>
                    <div className="relative">
                      <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={nis}
                        onChange={(e) => { setNis(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                        placeholder="20250001"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl native-input-blue text-base outline-none"
                        inputMode="numeric" autoComplete="username" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={studentPassword}
                        onChange={(e) => { setStudentPassword(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                        placeholder="Masukkan password"
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl native-input-blue text-base outline-none"
                        autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 touch-target-sm flex items-center justify-center rounded-lg">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-slide-down">
                      <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                    </div>
                  )}
                  <button onClick={handleStudentLogin} disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-200 touch-target">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />Masuk</>}
                  </button>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700"><strong>Demo:</strong> NIS <code className="bg-blue-100 px-1 py-0.5 rounded">20250001</code> s/d <code className="bg-blue-100 px-1 py-0.5 rounded">20250010</code>, Password: <code className="bg-blue-100 px-1 py-0.5 rounded">siswa123</code></p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">SIMT MTs v1.0 &copy; 2026 &mdash; Madrasah Tsanawiyah</p>
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
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat data portal...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PARENT PORTAL
  // ============================================================
  if (portalMode === 'parent' && parentDashboard) {
    return <ParentPortal
      dashboard={parentDashboard} students={parentStudents} selectedStudentId={selectedStudentId!}
      activeTab={parentTab} setActiveTab={handleParentTabChange} gradeType={gradeType}
      showGradeDropdown={showGradeDropdown} setShowGradeDropdown={setShowGradeDropdown}
      isRefreshing={isRefreshing} onGradeTypeChange={handleGradeTypeChange}
      onStudentSwitch={(id) => { setSelectedStudentId(id); setParentTab('dashboard'); }}
      onLogout={() => setShowLogoutConfirm(true)} onRefresh={handleRefresh}
      showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
      onConfirmLogout={handleLogout} toast={toast} setToast={setToast}
      gradeDropdownRef={gradeDropdownRef}
    />;
  }

  // ============================================================
  // STUDENT PORTAL
  // ============================================================
  if (portalMode === 'student' && studentDashboard) {
    return <StudentPortal
      dashboard={studentDashboard} activeTab={studentTab} setActiveTab={handleStudentTabChange}
      gradeType={gradeType} showGradeDropdown={showGradeDropdown} setShowGradeDropdown={setShowGradeDropdown}
      isRefreshing={isRefreshing} onGradeTypeChange={handleGradeTypeChange}
      onLogout={() => setShowLogoutConfirm(true)} onRefresh={handleRefresh}
      showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
      onConfirmLogout={handleLogout} toast={toast} setToast={setToast}
      gradeDropdownRef={gradeDropdownRef}
    />;
  }

  // Error
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm animate-scale-in">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">Gagal memuat data</p>
        <button onClick={handleLogout} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium press-effect touch-target">Kembali ke Login</button>
      </div>
    </div>
  );
}

// ============================================================
// Bottom Sheet Logout Modal (Native-style)
// ============================================================
function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[90] bottom-sheet-overlay" onClick={onCancel}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg bottom-sheet-content" onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 pb-5">
          <h3 className="font-bold text-gray-800 text-lg mb-1">Keluar dari Portal?</h3>
          <p className="text-sm text-gray-500 mb-5">Anda perlu login kembali untuk mengakses portal.</p>
          <div className="space-y-2">
            <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-red-600 text-white text-sm font-semibold active:scale-[0.97] transition-all press-effect touch-target">
              Keluar
            </button>
            <button onClick={onCancel} className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-all press-effect touch-target">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Grade Detail Bottom Sheet (Trayout) - Immersive Mobile
// ============================================================
const GRADE_CATEGORY_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string; bgColor: string; borderColor: string }> = {
  tugas:  { label: 'Tugas / PR',      icon: BookMarked, color: 'text-violet-600',  bgColor: 'bg-violet-50',  borderColor: 'border-violet-200' },
  harian: { label: 'Ulangan Harian',   icon: BookOpen,   color: 'text-blue-600',    bgColor: 'bg-blue-50',    borderColor: 'border-blue-200' },
  uts:    { label: 'UTS',              icon: ClipboardCheck, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  uas:    { label: 'UAS',              icon: GraduationCap,  color: 'text-rose-600',  bgColor: 'bg-rose-50',  borderColor: 'border-rose-200' },
  akhir:  { label: 'Nilai Akhir',      icon: Trophy,     color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
};

function GradeDetailBottomSheet({
  subjectName,
  subjectCode,
  studentId,
  subjectId,
  finalScore,
  onClose,
}: {
  subjectName: string;
  subjectCode: string;
  studentId: string;
  subjectId: string;
  finalScore: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<GradeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/grade-details?studentId=${studentId}&subjectId=${subjectId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, subjectId]);

  // Drag-to-close gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragY(dy);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 120) { onClose(); setDragY(0); }
    else setDragY(0);
  };

  const sections = ['tugas', 'harian', 'uts', 'uas', 'akhir'] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[90] bottom-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        className="bg-white rounded-t-2xl w-full max-w-lg bottom-sheet-content max-h-[90dvh] flex flex-col"
        style={{ transform: isDragging ? `translateY(${dragY}px)` : undefined, transition: isDragging ? 'none' : 'transform 0.3s ease' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg truncate pr-2">{subjectName}</h3>
            <div className={`shrink-0 px-3 py-1 rounded-xl text-sm font-bold ${finalScore >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {finalScore}
            </div>
          </div>
          <p className="text-xs text-gray-400">{subjectCode} &bull; KKM: 75</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-3 scroll-native">
          {loading ? (
            // Skeleton loading
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24 skeleton-shimmer" />
                  <div className="h-3 bg-gray-50 rounded w-full skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : !data?.hasData ? (
            <div className="text-center py-8 animate-fade-in">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Belum ada detail nilai</p>
            </div>
          ) : (
            sections.map(section => {
              const cfg = GRADE_CATEGORY_CONFIG[section];
              const items = data.details[section];
              const avg = data.averages[section];
              if (items.length === 0 && section !== 'akhir') return null;
              const Icon = cfg.icon;
              const isOpen = activeSection === section;

              return (
                <div key={section} className={`rounded-xl border ${cfg.borderColor} overflow-hidden transition-all duration-200 ${section === 'akhir' ? 'ring-2 ring-emerald-200' : ''}`}>
                  {/* Section header - tappable */}
                  <button
                    onClick={() => setActiveSection(isOpen ? null : section)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 ${cfg.bgColor} active:scale-[0.99] transition-all touch-target-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                      {avg !== null && (
                        <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs font-bold ${avg >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {avg}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 ${cfg.color} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Section content - expandable */}
                  {isOpen && items.length > 0 && (
                    <div className="px-3.5 pb-3 pt-1 space-y-2 animate-slide-down">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-1.5">
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm text-gray-700 truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.date && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {item.weight > 0 && section !== 'akhir' && (
                                <span className="text-[10px] text-gray-400">Bobot: {item.weight}x</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Mini progress bar */}
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${item.score >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                style={{ width: `${Math.min(item.score, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold min-w-[2rem] text-right ${item.score >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Always show for AKHIR section */}
                  {section === 'akhir' && items.length > 0 && !isOpen && (
                    <div className="px-3.5 pb-2 pt-0.5">
                      <p className="text-[10px] text-gray-400">{items[0].note || 'Komposit semua komponen'}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with close */}
        <div className="px-5 py-3 border-t shrink-0 safe-area-bottom">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 active:scale-[0.97] transition-all press-effect touch-target">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Pull-to-Refresh Indicator
// ============================================================
function PTRIndicator({ state, distance }: { state: 'idle' | 'pulling' | 'ready' | 'refreshing'; distance: number }) {
  if (state === 'idle' && distance === 0) return null;
  return (
    <div className="flex items-center justify-center transition-all duration-200"
         style={{ height: Math.max(distance, 0), opacity: Math.min(distance / 40, 1) }}>
      <div className={`flex items-center justify-center ${state === 'refreshing' ? 'ptr-indicator ptr-refreshing' : 'ptr-indicator'}`}>
        <RefreshCw className={`w-5 h-5 ${state === 'refreshing' ? 'text-emerald-500' : state === 'ready' ? 'text-emerald-600' : 'text-gray-400'}`} />
      </div>
    </div>
  );
}

// ============================================================
// PARENT PORTAL
// ============================================================
function ParentPortal({ dashboard, students, selectedStudentId, activeTab, setActiveTab,
  gradeType, showGradeDropdown, setShowGradeDropdown, isRefreshing,
  onGradeTypeChange, onStudentSwitch, onLogout, onRefresh, showLogoutConfirm,
  setShowLogoutConfirm, onConfirmLogout, toast, setToast, gradeDropdownRef
}: {
  dashboard: ParentDashboardData; students: StudentInfo[]; selectedStudentId: string;
  activeTab: ParentTabKey; setActiveTab: (t: ParentTabKey) => void;
  gradeType: string; showGradeDropdown: boolean; setShowGradeDropdown: (v: boolean) => void;
  isRefreshing: boolean; onGradeTypeChange: (t: string) => void;
  onStudentSwitch: (id: string) => void; onLogout: () => void; onRefresh: () => void;
  showLogoutConfirm: boolean; setShowLogoutConfirm: (v: boolean) => void;
  onConfirmLogout: () => void; toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setToast: (v: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  gradeDropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { student, attendanceSummary, payments, grades, announcements } = dashboard;
  const ptr = usePullToRefresh(onRefresh);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<{ id: string; score: number; subject: { id: string; name: string; code: string } } | null>(null);

  const parentTabs: { key: ParentTabKey; label: string; icon: typeof BookOpen }[] = [
    { key: 'dashboard', label: 'Beranda', icon: BookOpen },
    { key: 'attendance', label: 'Presensi', icon: ClipboardCheck },
    { key: 'grades', label: 'Nilai', icon: Star },
    { key: 'payments', label: 'SPP', icon: CreditCard },
    { key: 'announcements', label: 'Info', icon: Bell },
  ];

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50 pwa-header safe-area-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Portal Orang Tua</h1>
              <p className="text-[10px] text-emerald-100">{student.tenant.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={onRefresh} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors active:scale-90 touch-target-sm" title="Refresh">
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors active:scale-90 touch-target-sm" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Student Selector */}
      {students.length > 1 && (
        <div className="bg-white border-b px-4 py-2 animate-slide-down">
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1 scroll-native">
            {students.map(s => (
              <button key={s.id} onClick={() => onStudentSwitch(s.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all press-effect touch-target ${
                  selectedStudentId === s.id
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24 scroll-native overflow-y-auto"
            ref={ptr.containerRef}
            onTouchStart={ptr.onTouchStart}
            onTouchMove={ptr.onTouchMove}
            onTouchEnd={ptr.onTouchEnd}>
        <PTRIndicator state={ptr.pullState} distance={ptr.pullDistance} />
        <div key={activeTab} className="tab-content">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Student Card */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold backdrop-blur-sm">{student.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base truncate">{student.name}</h2>
                    <p className="text-emerald-100 text-xs">Kelas {student.classroom} &bull; NIS: {student.nis}</p>
                  </div>
                </div>
                {student.waliKelas && (
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-emerald-100">
                    <Phone className="w-3 h-3" />Wali Kelas: {student.waliKelas.name}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-slide-up stagger-1">
                  <DonutChart hadir={attendanceSummary.hadir} sakit={attendanceSummary.sakit} izin={attendanceSummary.izin} alpha={attendanceSummary.alpha} total={attendanceSummary.total} size={64} />
                  <p className="text-[10px] text-gray-500 mt-1">Kehadiran</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-slide-up stagger-2 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('grades')}>
                  <p className="text-2xl font-bold text-emerald-600 animate-count">{grades.pengetahuanAverage}</p>
                  <p className="text-[10px] text-gray-500">Rata-rata Nilai</p>
                  <p className={`text-[10px] ${grades.isAllTuntas ? 'text-emerald-600' : 'text-red-600'}`}>
                    {grades.isAllTuntas ? 'Tuntas' : `${grades.belowKKMCount} <KKM`}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-slide-up stagger-3 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('payments')}>
                  <CreditCard className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold text-blue-600 animate-count">
                    {payments.totalUnpaid > 0 ? `${(payments.totalUnpaid / 1000).toFixed(0)}K` : '0'}
                  </p>
                  <p className="text-[10px] text-gray-500">{payments.totalUnpaid > 0 ? 'Belum Bayar' : 'Lunas Semua'}</p>
                </div>
              </div>

              {/* Pinned Announcements */}
              {announcements.filter(a => a.isPinned).slice(0, 2).map((a, i) => {
                const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
                return (
                  <div key={a.id} className={`bg-emerald-50 border border-emerald-200 rounded-xl p-3 animate-slide-up stagger-${i + 4}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-800">{a.title}</p>
                    <p className="text-xs text-emerald-600 line-clamp-2 mt-0.5">{a.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============ ATTENDANCE ============ */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Presensi</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{attendanceSummary.periodLabel}</p>
                </div>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all press-effect touch-target-sm"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Kalender
                </button>
              </div>
              <div className="flex justify-center animate-slide-up">
                <DonutChart hadir={attendanceSummary.hadir} sakit={attendanceSummary.sakit} izin={attendanceSummary.izin} alpha={attendanceSummary.alpha} total={attendanceSummary.total} size={140} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg], i) => {
                  const val = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className={`rounded-xl p-3 text-center animate-scale-in stagger-${i + 1} ${cfg.color}`}>
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-lg font-bold">{val}</p>
                      <p className="text-[10px]">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Mini Calendar Preview (7-day strip) */}
              {attendanceSummary.daily.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm animate-slide-up">
                  <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Minggu Ini</h4>
                    <button onClick={() => setShowCalendar(true)} className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 press-effect touch-target-sm">
                      Lihat Kalender <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto scroll-native px-3 py-3 gap-2">
                    {(() => {
                      const today = new Date();
                      const dow = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
                      const monday = new Date(today);
                      monday.setDate(today.getDate() - dow);
                      return Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(monday);
                        d.setDate(monday.getDate() + i);
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        const rec = attendanceSummary.daily.find(r => {
                          const rd = new Date(r.date);
                          return `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}-${String(rd.getDate()).padStart(2, '0')}` === key;
                        });
                        const isToday = d.toDateString() === today.toDateString();
                        const isSunday = d.getDay() === 0;
                        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                        const statusCfg = rec ? CAL_STATUS_COLORS[rec.status] : null;
                        return (
                          <div key={i} className={`shrink-0 w-12 rounded-xl flex flex-col items-center py-2 gap-1 transition-all ${
                            isToday ? 'ring-2 ring-emerald-400 ' : ''
                          }${statusCfg ? `${statusCfg.bg}` : isSunday ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <span className="text-[9px] font-medium text-gray-400">{dayNames[i]}</span>
                            <span className={`text-xs font-bold ${isToday ? 'text-emerald-600' : statusCfg ? statusCfg.text : isSunday ? 'text-red-400' : 'text-gray-400'}`}>{d.getDate()}</span>
                            {statusCfg ? (
                              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-200" />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {attendanceSummary.recent.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm">
                  <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                    <h4 className="text-sm font-semibold text-gray-700">Riwayat Terakhir</h4>
                  </div>
                  <div className="divide-y">
                    {attendanceSummary.recent.map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.HADIR;
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className={`px-4 py-3 flex items-center gap-3 animate-slide-right stagger-${Math.min(i + 1, 6)}`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                            {r.note && <p className="text-[10px] text-gray-400 truncate">{r.note}</p>}
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ GRADES ============ */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Nilai</h3>
                <div className="relative" ref={gradeDropdownRef}>
                  <button onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all press-effect touch-target-sm">
                    {GRADE_TYPE_LABELS[gradeType] || gradeType}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showGradeDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-10 py-1 min-w-[140px] animate-slide-down">
                      {grades.availableTypes.map(t => (
                        <button key={t.type} onClick={() => onGradeTypeChange(t.type)}
                          className={`w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors touch-target-sm ${gradeType === t.type ? 'text-emerald-600 font-medium bg-emerald-50' : 'text-gray-700'}`}>
                          {GRADE_TYPE_LABELS[t.type] || t.type} ({t.count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white animate-slide-up">
                <p className="text-xs text-emerald-100">Rata-rata Nilai {GRADE_TYPE_LABELS[gradeType] || gradeType}</p>
                <p className="text-3xl font-bold animate-count">{grades.average}</p>
                <p className="text-xs text-emerald-200 mt-1">{grades.count} mata pelajaran</p>
              </div>
              <div className="space-y-2">
                {grades.list.map((g, i) => (
                  <div key={g.id}
                    onClick={() => setSelectedGrade(g)}
                    className={`bg-white rounded-xl p-3 shadow-sm border card-lift animate-slide-up stagger-${Math.min(i + 1, 6)} cursor-pointer active:scale-[0.98] transition-transform`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate pr-2">{g.subject.name}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className={`text-sm font-bold ${g.score >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{g.score}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full progress-fill ${g.score >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(g.score, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">{g.subject.code} &bull; KKM: 75</p>
                      <span className="text-[10px] text-emerald-500 font-medium">Lihat Detail →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">SPP</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white card-lift animate-scale-in stagger-1">
                  <CheckCircle2 className="w-6 h-6 mb-1 opacity-80" />
                  <p className="text-2xl font-bold animate-count">{payments.totalPaid > 0 ? `Rp ${(payments.totalPaid / 1000000).toFixed(1)}jt` : 'Rp 0'}</p>
                  <p className="text-xs text-emerald-100">Sudah Bayar</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white card-lift animate-scale-in stagger-2">
                  <CreditCard className="w-6 h-6 mb-1 opacity-80" />
                  <p className="text-2xl font-bold animate-count">{payments.totalUnpaid > 0 ? `Rp ${(payments.totalUnpaid / 1000000).toFixed(1)}jt` : 'Rp 0'}</p>
                  <p className="text-xs text-red-100">Belum Bayar</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl">
                  <h4 className="text-sm font-semibold text-gray-700">Riwayat Pembayaran</h4>
                </div>
                <div className="divide-y">
                  {payments.all.map((p, i) => {
                    const cfg = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.BELUM_BAYAR;
                    return (
                      <div key={p.id} className={`px-4 py-3 flex items-center justify-between animate-slide-right stagger-${Math.min(i + 1, 6)}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{MONTH_NAMES[p.month]} {p.year}</p>
                          <p className="text-xs text-gray-400">Rp {p.amount.toLocaleString('id-ID')}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ ANNOUNCEMENTS ============ */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Pengumuman</h3>
              {announcements.map((a, i) => {
                const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
                return (
                  <div key={a.id} className={`bg-white rounded-xl p-4 shadow-sm border card-lift animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
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
                <div className="text-center py-8 animate-fade-in">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Belum ada pengumuman</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Native Mobile Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t z-50 pwa-bottom-nav home-indicator-pad">
        <div className="max-w-2xl mx-auto flex">
          {parentTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all duration-200 nav-item-spring nav-indicator touch-target ${
                  isActive ? 'active text-emerald-600' : 'text-gray-400'
                }`}>
                <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'text-emerald-600' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showLogoutConfirm && <LogoutModal onConfirm={onConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />}
      {showCalendar && <AttendanceCalendar daily={attendanceSummary.daily} periodLabel={attendanceSummary.periodLabel} onClose={() => setShowCalendar(false)} theme="emerald" />}
      {selectedGrade && <GradeDetailBottomSheet subjectName={selectedGrade.subject.name} subjectCode={selectedGrade.subject.code} studentId={student.id} subjectId={selectedGrade.subject.id} finalScore={selectedGrade.score} onClose={() => setSelectedGrade(null)} />}
    </div>
  );
}

// ============================================================
// STUDENT PORTAL
// ============================================================
function StudentPortal({ dashboard, activeTab, setActiveTab,
  gradeType, showGradeDropdown, setShowGradeDropdown, isRefreshing,
  onGradeTypeChange, onLogout, onRefresh, showLogoutConfirm,
  setShowLogoutConfirm, onConfirmLogout, toast, setToast, gradeDropdownRef
}: {
  dashboard: StudentDashboardData; activeTab: StudentTabKey; setActiveTab: (t: StudentTabKey) => void;
  gradeType: string; showGradeDropdown: boolean; setShowGradeDropdown: (v: boolean) => void;
  isRefreshing: boolean; onGradeTypeChange: (t: string) => void;
  onLogout: () => void; onRefresh: () => void;
  showLogoutConfirm: boolean; setShowLogoutConfirm: (v: boolean) => void;
  onConfirmLogout: () => void; toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setToast: (v: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  gradeDropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { student, attendanceSummary, grades, schedules, violations, achievements, tahfiz, announcements } = dashboard;
  const ptr = usePullToRefresh(onRefresh);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<{ id: string; score: number; subject: { id: string; name: string; code: string } } | null>(null);

  const scheduleByDay: Record<number, ScheduleInfo[]> = {};
  for (const s of schedules) {
    if (!scheduleByDay[s.dayOfWeek]) scheduleByDay[s.dayOfWeek] = [];
    scheduleByDay[s.dayOfWeek].push(s);
  }

  const today = new Date().getDay();
  const todayDow = today === 0 ? 0 : today;

  const studentTabs: { key: StudentTabKey; label: string; icon: typeof BookOpen }[] = [
    { key: 'dashboard', label: 'Beranda', icon: BookOpen },
    { key: 'schedule', label: 'Jadwal', icon: Calendar },
    { key: 'grades', label: 'Nilai', icon: Star },
    { key: 'tahfiz', label: 'Tahfiz', icon: Moon },
    { key: 'kesiswaan', label: 'Siswa', icon: ShieldAlert },
    { key: 'announcements', label: 'Info', icon: Bell },
  ];

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50 pwa-header safe-area-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Portal Siswa</h1>
              <p className="text-[10px] text-blue-100">{student.tenant.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={onRefresh} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors active:scale-90 touch-target-sm" title="Refresh">
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors active:scale-90 touch-target-sm" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24 scroll-native overflow-y-auto"
            ref={ptr.containerRef}
            onTouchStart={ptr.onTouchStart}
            onTouchMove={ptr.onTouchMove}
            onTouchEnd={ptr.onTouchEnd}>
        <PTRIndicator state={ptr.pullState} distance={ptr.pullDistance} />
        <div key={activeTab} className="tab-content">

          {/* ============ DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm">{student.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base truncate">{student.name}</h2>
                    <p className="text-blue-100 text-xs">Kelas {student.classroom} &bull; NIS: {student.nis}</p>
                    {student.nisn && <p className="text-blue-200 text-[10px]">NISN: {student.nisn}</p>}
                  </div>
                </div>
                {student.waliKelas && (
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-blue-100">
                    <Phone className="w-3 h-3" />Wali Kelas: {student.waliKelas.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-slide-up stagger-1">
                  <DonutChart hadir={attendanceSummary.hadir} sakit={attendanceSummary.sakit} izin={attendanceSummary.izin} alpha={attendanceSummary.alpha} total={attendanceSummary.total} size={64} />
                  <p className="text-[10px] text-gray-500 mt-1">Kehadiran</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-slide-up stagger-2">
                  <p className="text-2xl font-bold text-blue-600 animate-count">{grades.pengetahuanAverage}</p>
                  <p className="text-[10px] text-gray-500">Rata-rata Nilai</p>
                  <p className={`text-[10px] ${grades.isAllTuntas ? 'text-emerald-600' : 'text-red-600'}`}>
                    {grades.isAllTuntas ? 'Semua Tuntas' : `${grades.belowKKMCount} di bawah KKM`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-all active:scale-95 animate-slide-up stagger-3" onClick={() => setActiveTab('tahfiz')}>
                  <Moon className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-lg font-bold text-purple-600 animate-count">{tahfiz.surahMemorized}</p>
                  <p className="text-[10px] text-gray-500">Surah Hafalan</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-all active:scale-95 animate-slide-up stagger-4" onClick={() => setActiveTab('kesiswaan')}>
                  <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-lg font-bold text-amber-600 animate-count">{achievements.count}</p>
                  <p className="text-[10px] text-gray-500">Prestasi</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center cursor-pointer hover:shadow-md transition-all active:scale-95 animate-slide-up stagger-5" onClick={() => setActiveTab('kesiswaan')}>
                  <ShieldAlert className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <p className="text-lg font-bold text-red-600 animate-count">{violations.totalPoints}</p>
                  <p className="text-[10px] text-gray-500">Poin Pelanggaran</p>
                </div>
              </div>

              {scheduleByDay[todayDow] && todayDow >= 1 && todayDow <= 6 && (
                <div className="bg-white rounded-xl border shadow-sm animate-slide-up stagger-5">
                  <div className="px-4 py-2.5 border-b bg-blue-50 rounded-t-xl flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-blue-700">Jadwal Hari Ini</h4>
                    <button onClick={() => setActiveTab('schedule')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5 press-effect touch-target-sm">
                      Lihat Semua <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="divide-y">
                    {scheduleByDay[todayDow].slice(0, 4).map(s => (
                      <div key={s.id} className="px-4 py-3 flex items-center gap-3 press-effect">
                        <div className="text-xs text-gray-400 w-12 shrink-0 font-medium">Jam {s.startPeriod}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.subject.name}</p>
                          {s.teacher && <p className="text-[10px] text-gray-400">{s.teacher.name}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tahfiz.latestRecords.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm animate-slide-up stagger-6">
                  <div className="px-4 py-2.5 border-b bg-purple-50 rounded-t-xl flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-purple-700">Tahfiz Terakhir</h4>
                    <button onClick={() => setActiveTab('tahfiz')} className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-0.5 press-effect touch-target-sm">
                      Detail <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    {tahfiz.latestRecords.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 truncate">{r.surah} : {r.ayahStart}-{r.ayahEnd}</p>
                          <p className="text-[10px] text-gray-400">{r.type === 'ziyadah' ? 'Ziyadah' : "Muraja'ah"}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${r.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{r.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {announcements.filter(a => a.isPinned).slice(0, 2).map((a, i) => (
                <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3 animate-slide-up">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">{a.title}</span>
                  </div>
                  <p className="text-xs text-blue-600 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* ============ SCHEDULE ============ */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 animate-slide-up">Jadwal Pelajaran</h3>
              <p className="text-xs text-gray-500 animate-slide-up stagger-1">Kelas {student.classroom} - {student.academicYear}</p>

              {[1, 2, 3, 4, 5, 6].map((day, di) => {
                const daySchedules = scheduleByDay[day];
                if (!daySchedules || daySchedules.length === 0) return null;
                const isToday = day === todayDow;
                return (
                  <div key={day} className={`bg-white rounded-xl border shadow-sm animate-slide-up stagger-${Math.min(di + 1, 6)} ${isToday ? 'ring-2 ring-blue-400' : ''}`}>
                    <div className={`px-4 py-3 border-b rounded-t-xl flex items-center gap-2 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <Calendar className={`w-4 h-4 ${isToday ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h4 className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {DAY_NAMES[day]}
                        {isToday && <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse">Hari Ini</span>}
                      </h4>
                    </div>
                    <div className="divide-y">
                      {daySchedules.sort((a, b) => a.startPeriod - b.startPeriod).map(s => (
                        <div key={s.id} className="px-4 py-3 flex items-center gap-3 press-effect">
                          <div className="w-10 text-center shrink-0">
                            <p className="text-xs font-bold text-gray-600">{s.startPeriod}</p>
                            <p className="text-[8px] text-gray-400">s/d {s.endPeriod}</p>
                          </div>
                          <div className="w-0.5 h-8 bg-blue-200 rounded-full shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{s.subject.name}</p>
                            {s.teacher && <p className="text-[10px] text-gray-400">{s.teacher.name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============ GRADES ============ */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Nilai</h3>
                <div className="relative" ref={gradeDropdownRef}>
                  <button onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all press-effect touch-target-sm">
                    {GRADE_TYPE_LABELS[gradeType] || gradeType}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showGradeDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-10 py-1 min-w-[140px] animate-slide-down">
                      {grades.availableTypes.map(t => (
                        <button key={t.type} onClick={() => onGradeTypeChange(t.type)}
                          className={`w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors touch-target-sm ${gradeType === t.type ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'}`}>
                          {GRADE_TYPE_LABELS[t.type] || t.type} ({t.count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white animate-slide-up">
                <p className="text-xs text-blue-100">Rata-rata Nilai {GRADE_TYPE_LABELS[gradeType] || gradeType}</p>
                <p className="text-3xl font-bold animate-count">{grades.average}</p>
                <p className="text-xs text-blue-200 mt-1">{grades.count} mata pelajaran</p>
              </div>
              <div className="space-y-2">
                {grades.list.map((g, i) => (
                  <div key={g.id}
                    onClick={() => setSelectedGrade(g)}
                    className={`bg-white rounded-xl p-3 shadow-sm border card-lift animate-slide-up stagger-${Math.min(i + 1, 6)} cursor-pointer active:scale-[0.98] transition-transform`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate pr-2">{g.subject.name}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className={`text-sm font-bold ${g.score >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{g.score}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full progress-fill ${g.score >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(g.score, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">{g.subject.code} &bull; KKM: 75</p>
                      <span className="text-[10px] text-blue-500 font-medium">Lihat Detail →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ TAHFIZ ============ */}
          {activeTab === 'tahfiz' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Monitoring Tahfiz</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white card-lift animate-scale-in stagger-1">
                  <Moon className="w-6 h-6 mb-1 opacity-80" />
                  <p className="text-2xl font-bold animate-count">{tahfiz.surahMemorized}</p>
                  <p className="text-xs text-purple-100">Surah Dihafal</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white card-lift animate-scale-in stagger-2">
                  <Star className="w-6 h-6 mb-1 opacity-80" />
                  <p className="text-2xl font-bold animate-count">{tahfiz.averageScore}</p>
                  <p className="text-xs text-emerald-100">Rata-rata Nilai</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-scale-in stagger-3">
                  <p className="text-lg font-bold text-blue-600 animate-count">{tahfiz.ziyadahCount}</p>
                  <p className="text-[10px] text-gray-500">Sesi Ziyadah</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border text-center card-lift animate-scale-in stagger-4">
                  <p className="text-lg font-bold text-green-600 animate-count">{tahfiz.murajaahCount}</p>
                  <p className="text-[10px] text-gray-500">Sesi Muraja&apos;ah</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-2.5 border-b bg-purple-50 rounded-t-xl">
                  <h4 className="text-sm font-semibold text-purple-700">Riwayat Hafalan</h4>
                </div>
                {tahfiz.latestRecords.length > 0 ? (
                  <div className="divide-y">
                    {tahfiz.latestRecords.map((r, i) => (
                      <div key={r.id} className={`px-4 py-3 animate-slide-right stagger-${Math.min(i + 1, 6)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.type === 'ziyadah' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {r.type === 'ziyadah' ? 'Ziyadah' : "Muraja'ah"}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{r.surah}</span>
                          </div>
                          <span className={`text-sm font-bold ${r.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{r.score}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400">
                            Ayat {r.ayahStart}-{r.ayahEnd}
                            {r.fluency && ` \u2022 ${r.fluency === 'lancar' ? 'Lancar' : r.fluency === 'cukup' ? 'Cukup' : 'Kurang'}`}
                          </p>
                          <p className="text-[10px] text-gray-400">{new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center animate-fade-in">
                    <Moon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Belum ada data tahfiz</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ KESISWAAN ============ */}
          {activeTab === 'kesiswaan' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Kesiswaan</h3>

              <div className="bg-white rounded-xl border shadow-sm animate-slide-up">
                <div className="px-4 py-2.5 border-b bg-red-50 rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm font-semibold text-red-700">Pelanggaran</h4>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{violations.totalPoints} poin</span>
                </div>
                {violations.list.length > 0 ? (
                  <div className="divide-y">
                    {violations.list.map((v, i) => {
                      const catCfg = VIOLATION_CATEGORY[v.category] || VIOLATION_CATEGORY.ringan;
                      return (
                        <div key={v.id} className={`px-4 py-3 animate-slide-right stagger-${Math.min(i + 1, 6)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                            <span className="text-xs text-gray-400">{new Date(v.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                  <div className="py-6 text-center animate-fade-in">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Tidak ada catatan pelanggaran</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border shadow-sm animate-slide-up stagger-2">
                <div className="px-4 py-2.5 border-b bg-amber-50 rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-semibold text-amber-700">Prestasi</h4>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{achievements.count} prestasi</span>
                </div>
                {achievements.list.length > 0 ? (
                  <div className="divide-y">
                    {achievements.list.map((a, i) => {
                      const catCfg = ACHIEVEMENT_CATEGORY[a.category] || ACHIEVEMENT_CATEGORY.akademik;
                      return (
                        <div key={a.id} className={`px-4 py-3 animate-slide-right stagger-${Math.min(i + 1, 6)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                            <span className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{a.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400">{LEVEL_LABELS[a.level] || a.level}</span>
                            {a.ranking && <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{a.ranking}</span>}
                          </div>
                          {a.description && <p className="text-[10px] text-gray-400 mt-0.5">{a.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center animate-fade-in">
                    <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Belum ada catatan prestasi</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border shadow-sm animate-slide-up stagger-4">
                <div className="px-4 py-2.5 border-b bg-gray-50 rounded-t-xl flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Presensi - {attendanceSummary.periodLabel}</h4>
                  <button onClick={() => setShowCalendar(true)} className="text-xs text-blue-600 font-medium flex items-center gap-0.5 press-effect touch-target-sm">
                    <Grid3X3 className="w-3.5 h-3.5" /> Kalender
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 p-4">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg], i) => {
                    const val = attendanceSummary[key.toLowerCase() as keyof AttendanceSummary] as number;
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className={`rounded-lg p-2 text-center animate-scale-in stagger-${i + 1} ${cfg.color}`}>
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

          {/* ============ ANNOUNCEMENTS ============ */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Pengumuman</h3>
              {announcements.map((a, i) => {
                const catCfg = CATEGORY_LABELS[a.category] || CATEGORY_LABELS.umum;
                return (
                  <div key={a.id} className={`bg-white rounded-xl p-4 shadow-sm border card-lift animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
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
                <div className="text-center py-8 animate-fade-in">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Belum ada pengumuman</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Native Mobile Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t z-50 pwa-bottom-nav home-indicator-pad">
        <div className="max-w-2xl mx-auto flex">
          {studentTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all duration-200 nav-item-spring nav-indicator touch-target ${
                  isActive ? 'active text-blue-600' : 'text-gray-400'
                }`}>
                <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'text-blue-600' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showLogoutConfirm && <LogoutModal onConfirm={onConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />}
      {showCalendar && <AttendanceCalendar daily={attendanceSummary.daily} periodLabel={attendanceSummary.periodLabel} onClose={() => setShowCalendar(false)} theme="blue" />}
      {selectedGrade && <GradeDetailBottomSheet subjectName={selectedGrade.subject.name} subjectCode={selectedGrade.subject.code} studentId={student.id} subjectId={selectedGrade.subject.id} finalScore={selectedGrade.score} onClose={() => setSelectedGrade(null)} />}
    </div>
  );
}
