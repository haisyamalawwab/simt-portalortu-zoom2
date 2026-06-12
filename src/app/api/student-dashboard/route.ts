import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      attendancePeriodLabel = `Bulan ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    } else {
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

    const gradeTypeCounts = await db.grade.groupBy({
      by: ['type'],
      where: { studentId },
      _count: true,
    });
    const availableGradeTypes = gradeTypeCounts
      .filter(g => g._count > 0)
      .map(g => ({ type: g.type, count: g._count }));

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

    // === SCHEDULE ===
    let schedules: any[] = [];
    if (student.classroomId) {
      schedules = await db.schedule.findMany({
        where: { classroomId: student.classroomId },
        include: {
          subject: { select: { name: true, code: true } },
          teacher: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startPeriod: 'asc' }],
      });
    }

    // === VIOLATIONS ===
    const violations = await db.studentViolation.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 20,
    });
    const totalViolationPoints = violations.reduce((sum, v) => sum + v.points, 0);

    // === ACHIEVEMENTS ===
    const achievements = await db.studentAchievement.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    // === TAHFIZ RECORDS ===
    const tahfizRecords = await db.tahfizRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 30,
    });

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
