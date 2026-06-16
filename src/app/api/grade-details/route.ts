import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// DEPRECATED: /api/grade-details — Legacy route
// Redirected ke BFF: /api/bff/portal/students/[id]/subjects/[subjectId]/grade-details
// Dipertahankan untuk backward compatibility dengan page.tsx
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    if (!studentId || !subjectId) {
      return NextResponse.json(
        { error: 'studentId dan subjectId wajib diisi' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/api/bff/portal/students/${studentId}/subjects/${subjectId}/grade-details`,
      {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Accept': 'application/json',
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Gagal memuat data' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[legacy /api/grade-details] Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
