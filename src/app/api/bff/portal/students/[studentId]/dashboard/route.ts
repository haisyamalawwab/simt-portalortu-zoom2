import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// BFF: Parent Dashboard
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
      `${BACKEND_URL}/portal/students/${studentId}/dashboard?gradeType=${gradeType}`,
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
    const transformed = transformDashboardData(data);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server' },
      { status: 503 }
    );
  }
}

// ============================================================
// Data Transformation
// Maps Laravel backend response to Next.js frontend format
// ============================================================
function transformDashboardData(backendData: any) {
  // Map attendance status from Laravel format (H/A/I/S/T) to Next.js format (HADIR/ALPHA/etc)
  const statusMap: Record<string, string> = {
    'H': 'HADIR',
    'A': 'ALPHA',
    'I': 'IZIN',
    'S': 'SAKIT',
    'T': 'HADIR', // Terlambat counted as Hadir
  };

  // Transform attendance summary
  const attendanceSummary = backendData.attendance_summary ? {
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
  } : null;

  // Transform grades
  const grades = backendData.grades ? {
    list: (backendData.grades.list || []).map((g: any) => ({
      id: g.id,
      score: g.score,
      subject: {
        id: g.subject.id,
        name: g.subject.name,
        code: g.subject.code || '',
      },
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
  } : null;

  // Transform payments
  const payments = backendData.payments ? {
    all: (backendData.payments.all || []).map((p: any) => ({
      id: p.id,
      month: p.month,
      year: p.year,
      amount: p.amount,
      status: mapPaymentStatus(p.status),
      dueDate: p.due_date,
      paidAt: p.paid_at || null,
    })),
    unpaid: (backendData.payments.unpaid || []).map((p: any) => ({
      id: p.id,
      month: p.month,
      year: p.year,
      amount: p.amount,
      status: mapPaymentStatus(p.status),
      dueDate: p.due_date,
    })),
    totalUnpaid: backendData.payments.total_unpaid || 0,
    totalPaid: backendData.payments.total_paid || 0,
    hasData: backendData.payments.has_data || false,
  } : null;

  // Transform student info
  const student = backendData.student ? {
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
    fatherName: backendData.student.father_name || null,
    fatherPhone: backendData.student.father_phone || null,
    motherName: backendData.student.mother_name || null,
    motherPhone: backendData.student.mother_phone || null,
  } : null;

  return {
    student,
    attendanceSummary,
    grades,
    payments,
    announcements: backendData.announcements || [],
  };
}

function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'paid': 'LUNAS',
    'unpaid': 'BELUM_BAYAR',
    'partial': 'SEBAGIAN',
    'pending': 'MENUNGGU',
  };
  return statusMap[status] || status.toUpperCase();
}
