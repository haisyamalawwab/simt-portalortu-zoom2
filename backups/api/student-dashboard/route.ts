import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// GET /api/student-dashboard?studentId=xxx&gradeType=xxx
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
        tenant: { select: { name: true, slug: true, logo: true, phone: true, address: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // === ATTENDANCE ===
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let currentMonthAttendances = await db.attendance.findMany({
      where: { studentId, date: { gte: startOfCurrentMonth } },
      orderBy: { date: 'desc' },
    });

    let attendancePeriodLabel: string;
    let allPeriodAttendances = currentMonthAttendances;

    if (currentMonthAttendances.length > 0) {
      attendancePeriodLabel = `Bulan ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    } else {
      const lastRecord = await db.attendance.findFirst({
        where: { studentId },
        orderBy: { date: 'desc' },
      });
      if (lastRecord) {
        const lastDate = new Date(lastRecord.date);
        attendancePeriodLabel = `Bulan ${MONTH_NAMES[lastDate.getMonth()]} ${lastDate.getFullYear()}`;
        const startOfLastMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
        const startOfNextMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
        allPeriodAttendances = await db.attendance.findMany({
          where: { studentId, date: { gte: startOfLastMonth, lt: startOfNextMonth } },
          orderBy: { date: 'desc' },
        });
      } else {
        attendancePeriodLabel = 'Belum ada data';
      }
    }

    // Single-pass attendance summary
    let hadir = 0, sakit = 0, izin = 0, alpha = 0;
    const daily = allPeriodAttendances.map(a => {
      if (a.status === 'HADIR') hadir++;
      else if (a.status === 'SAKIT') sakit++;
      else if (a.status === 'IZIN') izin++;
      else if (a.status === 'ALPHA') alpha++;
      return {
        date: a.date instanceof Date ? a.date.toISOString() : String(a.date),
        status: a.status,
        timeIn: a.timeIn ? (a.timeIn instanceof Date ? a.timeIn.toISOString() : String(a.timeIn)) : null,
        timeOut: a.timeOut ? (a.timeOut instanceof Date ? a.timeOut.toISOString() : String(a.timeOut)) : null,
        note: a.note,
      };
    });

    const attendanceSummary = {
      hadir, sakit, izin, alpha,
      total: allPeriodAttendances.length,
      recent: allPeriodAttendances.slice(0, 10),
      daily,
      periodLabel: attendancePeriodLabel,
      hasData: allPeriodAttendances.length > 0,
    };

    // === PARALLEL QUERIES for grades, schedule, violations, achievements, tahfiz, announcements ===
    const validGradeTypes = ['PENGETAHUAN', 'KETERAMPILAN', 'UTS', 'UAS', 'SIKAP'] as const;
    const safeGradeType = validGradeTypes.includes(gradeType as typeof validGradeTypes[number])
      ? gradeType : 'PENGETAHUAN';

    const [grades, gradeTypeCounts, schedules, violations, achievements, tahfizRecords, announcements] = await Promise.all([
      db.grade.findMany({
        where: { studentId, type: safeGradeType },
        include: { subject: { select: { id: true, name: true, code: true } } },
        orderBy: { subject: { name: 'asc' } },
      }),
      db.grade.groupBy({
        by: ['type'],
        where: { studentId },
        _count: true,
      }),
      student.classroomId ? db.schedule.findMany({
        where: { classroomId: student.classroomId },
        include: {
          subject: { select: { name: true, code: true } },
          teacher: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startPeriod: 'asc' }],
      }) : Promise.resolve([]),
      db.studentViolation.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      db.studentAchievement.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      db.tahfizRecord.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      db.announcement.findMany({
        where: {
          tenantId: student.tenantId,
          publishedAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 10,
      }),
    ]);

    const availableGradeTypes = gradeTypeCounts
      .filter(g => g._count > 0)
      .map(g => ({ type: g.type, count: g._count }));

    const avgGrade = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      : 0;

    // Only fetch pengetahuan if different type is active
    const pengetahuanGrades = safeGradeType === 'PENGETAHUAN'
      ? grades
      : await db.grade.findMany({
          where: { studentId, type: 'PENGETAHUAN' },
          include: { subject: { select: { id: true, name: true, code: true } } },
          orderBy: { subject: { name: 'asc' } },
        });
    const pengetahuanAvg = pengetahuanGrades.length > 0
      ? pengetahuanGrades.reduce((sum, g) => sum + g.score, 0) / pengetahuanGrades.length
      : 0;
    const belowKKMCount = pengetahuanGrades.filter(g => g.score < 75).length;

    const totalViolationPoints = violations.reduce((sum, v) => sum + v.points, 0);

    // Tahfiz summary
    const tahfizSummary = {
      totalRecords: tahfizRecords.length,
      ziyadahCount: tahfizRecords.filter(t => t.type === 'ziyadah').length,
      murajaahCount: tahfizRecords.filter(t => t.type === 'murajaah').length,
      averageScore: tahfizRecords.length > 0
        ? Math.round(tahfizRecords.reduce((sum, t) => sum + t.score, 0) / tahfizRecords.length * 10) / 10
        : 0,
      surahMemorized: [...new Set(tahfizRecords.filter(t => t.type === 'ziyadah' && t.score >= 75).map(t => t.surah))].length,
      latestRecords: tahfizRecords.slice(0, 5),
    };

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
        photo: student.photo,
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
      schedules,
      violations: {
        list: violations,
        totalPoints: totalViolationPoints,
        count: violations.length,
      },
      achievements: {
        list: achievements,
        count: achievements.length,
      },
      tahfiz: tahfizSummary,
      announcements,
    });
  } catch (error) {
    console.error('Student Dashboard API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
