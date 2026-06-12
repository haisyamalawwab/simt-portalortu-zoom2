import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const gradeType = searchParams.get('gradeType') || 'PENGETAHUAN';

    if (!studentId) {
      return NextResponse.json({ error: 'studentId wajib diisi' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        classroom: {
          include: {
            academicYear: true,
            waliKelas: { select: { name: true, phone: true } },
          },
        },
        tenant: { select: { name: true, slug: true, logo: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // === ATTENDANCE ===
    // Current month data first, fallback to most recent month
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let currentMonthAttendances = await db.attendance.findMany({
      where: { studentId, date: { gte: startOfCurrentMonth } },
      orderBy: { date: 'desc' },
    });

    // Determine period label
    let attendancePeriodLabel: string;
    let allPeriodAttendances = currentMonthAttendances;

    if (currentMonthAttendances.length > 0) {
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      attendancePeriodLabel = `Bulan ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    } else {
      // Fallback: find most recent month with data
      const lastRecord = await db.attendance.findFirst({
        where: { studentId },
        orderBy: { date: 'desc' },
      });
      if (lastRecord) {
        const lastDate = new Date(lastRecord.date);
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        attendancePeriodLabel = `Bulan ${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;
        const startOfLastMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
        allPeriodAttendances = await db.attendance.findMany({
          where: { studentId, date: { gte: startOfLastMonth } },
          orderBy: { date: 'desc' },
        });
      } else {
        attendancePeriodLabel = 'Belum ada data';
      }
    }

    const attendanceSummary = {
      hadir: allPeriodAttendances.filter(a => a.status === 'HADIR').length,
      sakit: allPeriodAttendances.filter(a => a.status === 'SAKIT').length,
      izin: allPeriodAttendances.filter(a => a.status === 'IZIN').length,
      alpha: allPeriodAttendances.filter(a => a.status === 'ALPHA').length,
      total: allPeriodAttendances.length,
      recent: allPeriodAttendances.slice(0, 10),
      periodLabel: attendancePeriodLabel,
      hasData: allPeriodAttendances.length > 0,
    };

    // === GRADES ===
    // Fetch the requested grade type
    const validGradeTypes = ['PENGETAHUAN', 'KETERAMPILAN', 'UTS', 'UAS', 'SIKAP'] as const;
    const safeGradeType = validGradeTypes.includes(gradeType as typeof validGradeTypes[number])
      ? gradeType : 'PENGETAHUAN';

    const grades = await db.grade.findMany({
      where: { studentId, type: safeGradeType },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { subject: { name: 'asc' } },
    });

    const avgGrade = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      : 0;

    // Count available grade types
    const gradeTypeCounts = await db.grade.groupBy({
      by: ['type'],
      where: { studentId },
      _count: true,
    });
    const availableGradeTypes = gradeTypeCounts
      .filter(g => g._count > 0)
      .map(g => ({ type: g.type, count: g._count }));

    // === PAYMENTS ===
    const payments = await db.payment.findMany({
      where: { studentId, type: 'SPP' },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const unpaidPayments = payments.filter(p => p.status === 'BELUM_BAYAR');
    const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === 'LUNAS').reduce((sum, p) => sum + p.amount, 0);

    // === ANNOUNCEMENTS ===
    const announcements = await db.announcement.findMany({
      where: {
        tenantId: student.tenantId,
        publishedAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    // Always get PENGETAHUAN average for Quick Stats consistency
    const pengetahuanGrades = safeGradeType === 'PENGETAHUAN'
      ? grades
      : await db.grade.findMany({
          where: { studentId, type: 'PENGETAHUAN' },
          include: { subject: { select: { name: true, code: true } } },
          orderBy: { subject: { name: 'asc' } },
        });
    const pengetahuanAvg = pengetahuanGrades.length > 0
      ? pengetahuanGrades.reduce((sum, g) => sum + g.score, 0) / pengetahuanGrades.length
      : 0;
    const belowKKMCount = pengetahuanGrades.filter(g => g.score < 75).length;

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        nis: student.nis,
        nisn: student.nisn,
        gender: student.gender,
        classroom: student.classroom?.name,
        level: student.classroom?.level,
        academicYear: student.classroom?.academicYear?.name,
        waliKelas: student.classroom?.waliKelas,
        tenant: student.tenant,
        birthPlace: student.birthPlace,
        birthDate: student.birthDate?.toISOString(),
        address: student.address,
        fatherName: student.fatherName,
        fatherPhone: student.fatherPhone,
        motherName: student.motherName,
        motherPhone: student.motherPhone,
      },
      attendanceSummary,
      grades: {
        list: grades,
        average: Math.round(avgGrade * 10) / 10,
        count: grades.length,
        activeType: safeGradeType,
        availableTypes: availableGradeTypes,
        hasData: grades.length > 0,
        belowKKMCount,
        pengetahuanAverage: Math.round(pengetahuanAvg * 10) / 10,
        pengetahuanCount: pengetahuanGrades.length,
        isAllTuntas: belowKKMCount === 0 && pengetahuanGrades.length > 0,
      },
      payments: {
        all: payments.slice(0, 12),
        unpaid: unpaidPayments,
        totalUnpaid,
        totalPaid,
        hasData: payments.length > 0,
      },
      announcements,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
