import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// BFF: Student Login
// Proxies to Laravel Backend and sets HttpOnly cookie
// ============================================================

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nis, password } = body;

    if (!nis || !password) {
      return NextResponse.json(
        { error: 'NIS dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Call Laravel backend
    const response = await fetch(`${BACKEND_URL}/auth/student-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ nis, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Login gagal' },
        { status: response.status }
      );
    }

    // Set HttpOnly cookie for the token
    const cookieStore = await cookies();
    cookieStore.set('simt_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Also store tenant info in a readable cookie (for middleware)
    if (data.student?.tenant?.slug) {
      cookieStore.set('simt_tenant', data.student.tenant.slug, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      student: data.student,
      token: data.token,
    });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server' },
      { status: 503 }
    );
  }
}
