import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth - Login as parent using email
export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
  }

  // Find students associated with this parent email
  const students = await db.student.findMany({
    where: { parentEmail: email, isActive: true },
    include: {
      classroom: { select: { name: true, level: true } },
      tenant: { select: { name: true, slug: true } },
    },
  });

  if (students.length === 0) {
    return NextResponse.json({ error: 'Email tidak terdaftar sebagai wali murid' }, { status: 404 });
  }

  return NextResponse.json({
    students: students.map(s => ({
      id: s.id,
      name: s.name,
      nis: s.nis,
      classroom: s.classroom?.name,
      level: s.classroom?.level,
      tenant: s.tenant,
    })),
  });
}
