import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/student-auth - Login as student using NIS + password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nis, password } = body;

    if (!nis || !password) {
      return NextResponse.json({ error: 'NIS dan password wajib diisi' }, { status: 400 });
    }

    // Find student by NIS
    const student = await db.student.findFirst({
      where: { nis, isActive: true },
      include: {
        classroom: {
          select: { name: true, level: true },
        },
        tenant: { select: { name: true, slug: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'NIS tidak terdaftar' }, { status: 404 });
    }

    // Verify password (simple check - in production use bcrypt)
    if (student.studentPassword && student.studentPassword !== password) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    // If no password set, reject
    if (!student.studentPassword) {
      return NextResponse.json({ error: 'Akun siswa belum diaktifkan. Hubungi TU.' }, { status: 403 });
    }

    // Return student info (without password)
    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        nis: student.nis,
        nisn: student.nisn,
        gender: student.gender,
        classroom: student.classroom?.name,
        level: student.classroom?.level,
        tenant: student.tenant,
        birthPlace: student.birthPlace,
        birthDate: student.birthDate?.toISOString(),
        address: student.address,
        photo: student.photo,
      },
    });
  } catch (error) {
    console.error('Student auth error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
