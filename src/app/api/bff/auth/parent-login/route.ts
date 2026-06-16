import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// BFF: Parent Login
// Proxies to Laravel Backend and sets HttpOnly cookie
// ============================================================

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Call Laravel backend
    const response = await fetch(`${BACKEND_URL}/auth/parent-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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
    if (data.user?.tenant?.slug) {
      cookieStore.set('simt_tenant', data.user.tenant.slug, {
        httpOnly: false, // Readable by client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      token: data.token,
      students: data.students || [],
    });
  } catch (error) {
    console.error('Parent login error:', error);
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server' },
      { status: 503 }
    );
  }
}
