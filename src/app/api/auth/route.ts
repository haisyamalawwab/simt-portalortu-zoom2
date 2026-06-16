import { NextResponse } from 'next/server';

// ============================================================
// DEPRECATED: /api/auth — Legacy route
// Redirected ke BFF: /api/bff/auth/parent-login
// Dipertahankan untuk backward compatibility dengan page.tsx
// ============================================================

const BFF_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/bff';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Forward ke BFF parent-login
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${BFF_BASE}/auth/parent-login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || '' }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Login gagal' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[legacy /api/auth] Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
