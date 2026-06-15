// SIMT MTs - Parent Portal API Utilities
import { db } from '@/lib/db';

export interface ParentSession {
  studentId: string;
  studentName: string;
  tenantId: string;
  tenantName: string;
  classroomName: string;
  parentEmail: string;
}

// Simple auth lookup by parent email (MVP - replace with NextAuth in production)
export async function getParentStudents(parentEmail: string) {
  const students = await db.student.findMany({
    where: { parentEmail, isActive: true },
    include: {
      classroom: { select: { name: true, level: true } },
      tenant: { select: { name: true, slug: true } },
    },
  });
  return students;
}

export async function getStudentDashboard(studentId: string) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      classroom: {
        include: {
          academicYear: true,
          waliKelas: { select: { name: true, phone: true } },
        },
      },
      tenant: { select: { name: true, slug: true } },
    },
  });

  if (!student) return null;

  // Attendance summary
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const attendances = await db.attendance.findMany({
    where: {
      studentId,
      date: { gte: startOfMonth },
    },
  });

  const attendanceSummary = {
    hadir: attendances.filter(a => a.status === 'HADIR').length,
    sakit: attendances.filter(a => a.status === 'SAKIT').length,
    izin: attendances.filter(a => a.status === 'IZIN').length,
    alpha: attendances.filter(a => a.status === 'ALPHA').length,
    total: attendances.length,
  };

  // Payment summary
  const payments = await db.payment.findMany({
    where: { studentId, type: 'SPP' },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  const unpaidPayments = payments.filter(p => p.status === 'BELUM_BAYAR');
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

  // Recent grades average
  const grades = await db.grade.findMany({
    where: { studentId, type: 'PENGETAHUAN' },
    include: { subject: { select: { name: true } } },
  });
  const avgGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0;

  // Announcements
  const announcements = await db.announcement.findMany({
    where: {
      tenantId: student.tenantId,
      publishedAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: { isPinned: 'desc' },
    take: 5,
  });

  return {
    student,
    attendanceSummary,
    unpaidPayments: unpaidPayments.slice(0, 3),
    totalUnpaid,
    avgGrade: Math.round(avgGrade * 10) / 10,
    totalGrades: grades.length,
    announcements,
  };
}
