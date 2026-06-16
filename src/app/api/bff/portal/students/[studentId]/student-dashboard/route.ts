import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// BFF: Student Dashboard
// Proxies to Laravel Backend with authentication
// ============================================================

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('simt_token')?.value;
    const tenant = cookieStore.get('simt_tenant')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gradeType = searchParams.get('gradeType') || 'PENGETAHUAN';

    // Call Laravel backend
    const response = await fetch(
      `${BACKEND_URL}/portal/students/${studentId}/student-dashboard?gradeType=${gradeType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Gagal memuat data' },
        { status: response.status }
      );
    }

    // Transform backend data to frontend format
    const transformed = transformStudentDashboardData(data);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Student dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server' },
      { status: 503 }
    );
  }
}

// ============================================================
// Data Transformation
// ============================================================
function transformStudentDashboardData(backendData: any) {
  const statusMap: Record<string, string> = {
    'H': 'HADIR', 'A': 'ALPHA', 'I': 'IZIN', 'S': 'SAKIT', 'T': 'HADIR',
  };

  return {
    student: backendData.student ? {
      id: backendData.student.id,
      name: backendData.student.name,
      nis: backendData.student.nis,
      nisn: backendData.student.nisn || null,
      gender: backendData.student.gender,
      classroom: backendData.student.classroom,
      level: backendData.student.level,
      academicYear: backendData.student.academic_year,
      waliKelas: backendData.student.wali_kelas || null,
      tenant: backendData.student.tenant,
      birthPlace: backendData.student.birth_place || null,
      birthDate: backendData.student.birth_date || null,
      address: backendData.student.address || null,
    } : null,

    attendanceSummary: backendData.attendance_summary ? {
      hadir: backendData.attendance_summary.hadir || 0,
      sakit: backendData.attendance_summary.sakit || 0,
      izin: backendData.attendance_summary.izin || 0,
      alpha: backendData.attendance_summary.alpha || 0,
      total: backendData.attendance_summary.total || 0,
      periodLabel: backendData.attendance_summary.period_label || 'Bulan Ini',
      hasData: backendData.attendance_summary.has_data || false,
      recent: (backendData.attendance_summary.recent || []).map((a: any) => ({
        date: a.date,
        status: statusMap[a.status] || a.status,
        timeIn: a.time_in || null,
        timeOut: a.time_out || null,
        note: a.note || null,
      })),
      daily: (backendData.attendance_summary.daily || []).map((a: any) => ({
        date: a.date,
        status: statusMap[a.status] || a.status,
        timeIn: a.time_in || null,
        timeOut: a.time_out || null,
        note: a.note || null,
      })),
    } : null,

    grades: backendData.grades ? {
      list: (backendData.grades.list || []).map((g: any) => ({
        id: g.id,
        score: g.score,
        subject: { id: g.subject.id, name: g.subject.name, code: g.subject.code || '' },
      })),
      average: backendData.grades.average || 0,
      count: backendData.grades.count || 0,
      activeType: backendData.grades.active_type || 'PENGETAHUAN',
      availableTypes: backendData.grades.available_types || [],
      hasData: backendData.grades.has_data || false,
      belowKKMCount: backendData.grades.below_kkm_count || 0,
      pengetahuanAverage: backendData.grades.pengetahuan_average || 0,
      pengetahuanCount: backendData.grades.pengetahuan_count || 0,
      isAllTuntas: backendData.grades.is_all_tuntas || false,
    } : null,

    schedules: (backendData.schedules || []).map((s: any) => ({
      id: s.id,
      dayOfWeek: s.day_of_week,
      startPeriod: s.start_period,
      endPeriod: s.end_period,
      subject: { name: s.subject.name, code: s.subject.code || '' },
      teacher: s.teacher ? { name: s.teacher.name } : null,
    })),

    violations: backendData.violations ? {
      list: (backendData.violations.list || []).map((v: any) => ({
        id: v.id,
        date: v.date,
        category: v.category,
        description: v.description,
        points: v.points,
        action: v.action || null,
      })),
      totalPoints: backendData.violations.total_points || 0,
      count: backendData.violations.count || 0,
    } : null,

    achievements: backendData.achievements ? {
      list: (backendData.achievements.list || []).map((a: any) => ({
        id: a.id,
        date: a.date,
        title: a.title,
        category: a.category,
        level: a.level,
        ranking: a.ranking || null,
        description: a.description || null,
      })),
      count: backendData.achievements.count || 0,
    } : null,

    tahfiz: backendData.tahfiz ? {
      totalRecords: backendData.tahfiz.total_records || 0,
      ziyadahCount: backendData.tahfiz.ziyadah_count || 0,
      murajaahCount: backendData.tahfiz.murajaah_count || 0,
      averageScore: backendData.tahfiz.average_score || 0,
      surahMemorized: backendData.tahfiz.surah_memorized || 0,
      latestRecords: (backendData.tahfiz.latest_records || []).map((t: any) => ({
        id: t.id,
        date: t.date,
        surah: t.surah,
        ayahStart: t.ayah_start,
        ayahEnd: t.ayah_end,
        type: t.type,
        score: t.score,
        fluency: t.fluency || null,
        note: t.note || null,
      })),
    } : null,

    announcements: backendData.announcements || [],
  };
}
