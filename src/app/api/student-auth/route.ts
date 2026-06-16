import { NextResponse } from 'next/server';

// ============================================================
// DEPRECATED: /api/student-auth — Legacy route
// Redirected ke BFF: /api/bff/auth/student-login
// Dipertahankan untuk backward compatibility dengan page.tsx
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nis, password } = body;

    if (!nis || !password) {
      return NextResponse.json({ error: 'NIS dan password wajib diisi' }, { status: 400 });
    }

    // Forward ke BFF student-login (same-origin, langsung ke route handler)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/bff/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nis, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Login gagal' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[legacy /api/student-auth] Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
